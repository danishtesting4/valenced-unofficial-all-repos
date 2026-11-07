#!/usr/bin/env node

import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcesPath = path.join(root, "sources.json");
const indexPath = path.join(root, "index.json");
const sourceMapPath = path.join(root, "source-map.json");
const maxIndexBytes = 10 * 1024 * 1024;
const pluginIdPattern = /^[A-Za-z0-9.-]+$/;
const versionPattern = /^\d+(?:\.\d+)*(?:-[a-z0-9]+)?$/;
const rangeTokenPattern = /^(?:<=|>=|<|>|=)\d+(?:\.\d+)*$/;
const sha256Pattern = /^[0-9a-f]{64}$/;
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

function validPluginId(value) {
  return (
    typeof value === "string" &&
    pluginIdPattern.test(value) &&
    !value.includes("..") &&
    !value.startsWith(".")
  );
}

async function fetchIndex(url) {
  let response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    throw new Error(`Could not fetch upstream index ${url}: ${error.message}`, { cause: error });
  }
  if (!response.ok) {
    throw new Error(`Could not fetch upstream index ${url}: HTTP ${response.status}`);
  }

  const body = Buffer.from(await response.arrayBuffer());
  if (body.byteLength > maxIndexBytes) {
    throw new Error(`Upstream index exceeds ${maxIndexBytes} bytes: ${url}`);
  }
  try {
    const index = JSON.parse(body.toString("utf8"));
    if (!isRecord(index)) {
      throw new Error("expected a JSON object");
    }
    return index;
  } catch (error) {
    throw new Error(`Upstream index is not valid JSON: ${url}: ${error.message}`, { cause: error });
  }
}

function validateVersion(versionKey, version, sourceName, pluginId) {
  const context = `${sourceName}: ${pluginId}@${versionKey}`;
  if (!versionPattern.test(versionKey)) {
    throw new Error(`${context}: invalid version string`);
  }
  if (!isRecord(version)) {
    throw new Error(`${context}: version entry must be an object`);
  }

  const { url, sha256, size } = version;
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
    throw new Error(`${context}: artifact URL must be an absolute HTTP(S) URL`);
  }
  if (typeof sha256 !== "string" || !sha256Pattern.test(sha256)) {
    throw new Error(`${context}: sha256 must be 64 lowercase hexadecimal characters`);
  }
  if (!Number.isSafeInteger(size) || size <= 0) {
    throw new Error(`${context}: artifact size must be a positive integer`);
  }

  const result = { url, sha256, size };
  const dependencies = version.dependencies ?? {};
  if (!isRecord(dependencies)) {
    throw new Error(`${context}: dependencies must be an object`);
  }
  if (Object.keys(dependencies).length > 0) {
    result.dependencies = {};
    for (const [dependencyId, dependency] of Object.entries(dependencies)) {
      if (!validPluginId(dependencyId)) {
        throw new Error(`${context}: invalid dependency ID ${JSON.stringify(dependencyId)}`);
      }
      if (!isRecord(dependency)) {
        throw new Error(`${context}: dependency ${JSON.stringify(dependencyId)} must be an object`);
      }

      const normalizedDependency = {};
      if (dependency.version != null) {
        if (typeof dependency.version !== "string") {
          throw new Error(`${context}: dependency version for ${JSON.stringify(dependencyId)} must be a string`);
        }
        if (
          dependency.version.trim() !== "*" &&
          !dependency.version.trim().split(/\s+/).every((token) => rangeTokenPattern.test(token))
        ) {
          throw new Error(`${context}: invalid dependency range for ${JSON.stringify(dependencyId)}`);
        }
        normalizedDependency.version = dependency.version;
      }
      const optional = dependency.optional ?? false;
      if (typeof optional !== "boolean") {
        throw new Error(`${context}: optional flag for ${JSON.stringify(dependencyId)} must be boolean`);
      }
      if (optional) {
        normalizedDependency.optional = true;
      }
      result.dependencies[dependencyId] = normalizedDependency;
    }
  }

  return result;
}

function validatePlugin(pluginId, plugin, sourceName) {
  if (!validPluginId(pluginId)) {
    throw new Error(`${sourceName}: invalid plugin ID ${JSON.stringify(pluginId)}`);
  }
  if (!isRecord(plugin) || typeof plugin.name !== "string") {
    throw new Error(`${sourceName}: plugin ${JSON.stringify(pluginId)} must have a name`);
  }

  const result = { name: plugin.name };
  const description = plugin.description ?? "";
  const author = plugin.author ?? "";
  const contributors = plugin.contributors ?? [];
  if (typeof description !== "string" || typeof author !== "string") {
    throw new Error(`${sourceName}: invalid description or author for ${JSON.stringify(pluginId)}`);
  }
  if (!Array.isArray(contributors) || !contributors.every((item) => typeof item === "string")) {
    throw new Error(`${sourceName}: contributors for ${JSON.stringify(pluginId)} must be strings`);
  }
  if (description) result.description = description;
  if (author) result.author = author;
  if (contributors.length > 0) result.contributors = contributors;

  const { icon } = plugin;
  if (icon != null) {
    if (typeof icon !== "string") {
      throw new Error(`${sourceName}: icon for ${JSON.stringify(pluginId)} must be a string`);
    }
    if (icon.startsWith("data:")) {
      if (icon.length <= 128 * 1024) result.icon = icon;
    } else if (!/^[A-Za-z][A-Za-z0-9+.-]*:/.test(icon)) {
      result.icon = icon;
    }
  }

  if (!isRecord(plugin.versions) || Object.keys(plugin.versions).length === 0) {
    throw new Error(`${sourceName}: plugin ${JSON.stringify(pluginId)} has no versions`);
  }
  result.versions = Object.fromEntries(
    Object.entries(plugin.versions).map(([versionKey, version]) => [
      versionKey,
      validateVersion(versionKey, version, sourceName, pluginId),
    ]),
  );

  const channels = plugin.channels ?? {};
  if (!isRecord(channels)) {
    throw new Error(`${sourceName}: channels for ${JSON.stringify(pluginId)} must be an object`);
  }
  const normalizedChannels = {};
  for (const [channel, target] of Object.entries(channels)) {
    if (typeof target !== "string" || !(target in result.versions)) {
      throw new Error(`${sourceName}: invalid channel target for ${pluginId}/${channel}`);
    }
    normalizedChannels[channel] = target;
  }
  if (Object.keys(normalizedChannels).length > 0) {
    result.channels = normalizedChannels;
  }

  return result;
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
}

export async function mergeIndexes(sources, fetchUpstream = fetchIndex) {
  const plugins = new Map();
  const sourceMap = new Map();

  for (const source of sources) {
    const { name, index_url: indexUrl, source_url: sourceUrl } = source;
    const upstream = await fetchUpstream(indexUrl);
    if (upstream.format !== 1) {
      throw new Error(`${name}: unsupported repository index format ${JSON.stringify(upstream.format)}`);
    }
    if (!isRecord(upstream.plugins)) {
      throw new Error(`${name}: plugins must be an object`);
    }

    for (const [pluginId, plugin] of Object.entries(upstream.plugins)) {
      if (plugins.has(pluginId)) {
        throw new Error(
          `Duplicate plugin ID ${JSON.stringify(pluginId)} in ${JSON.stringify(sourceMap.get(pluginId).source)} and ${JSON.stringify(name)}`,
        );
      }
      const normalizedPlugin = validatePlugin(pluginId, plugin, name);
      plugins.set(pluginId, normalizedPlugin);
      sourceMap.set(pluginId, {
        name: normalizedPlugin.name,
        source: name,
        index_url: indexUrl,
        source_url: sourceUrl,
      });
    }
  }

  const pluginDocument = Object.fromEntries(
    [...plugins.entries()].sort(([left], [right]) => left.localeCompare(right)),
  );
  const sourceDocument = Object.fromEntries(
    [...sourceMap.entries()].sort(([left], [right]) => left.localeCompare(right)),
  );

  return [
    {
      format: 1,
      name: "Valenced Unofficial All-Repos Index",
      description: "All in one community repos for people thats lazy to browse through the community repos",
      plugins: sortKeys(pluginDocument),
    },
    sortKeys(sourceDocument),
  ];
}

async function writeJson(filePath, document) {
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(sortKeys(document), null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

async function main() {
  try {
    const config = JSON.parse(await readFile(sourcesPath, "utf8"));
    const sources = config?.sources;
    if (!Array.isArray(sources) || sources.length === 0) {
      throw new Error("sources.json must contain a non-empty sources array");
    }
    for (const source of sources) {
      if (
        !isRecord(source) ||
        !["name", "index_url", "source_url"].every(
          (key) => typeof source[key] === "string" && source[key].trim().length > 0,
        )
      ) {
        throw new Error("Each source needs a name, index_url, and source_url");
      }
      if (!source.index_url.startsWith("https://") || !source.source_url.startsWith("https://")) {
        throw new Error(`Source URLs must use HTTPS: ${source.name}`);
      }
    }

    const [index, sourceMap] = await mergeIndexes(sources);
    await writeJson(indexPath, index);
    await writeJson(sourceMapPath, sourceMap);
    console.log(`Generated index.json: ${Object.keys(index.plugins).length} plugins from ${sources.length} sources.`);
  } catch (error) {
    console.error(`Index generation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
