import assert from "node:assert/strict";
import test from "node:test";
import { mergeIndexes } from "../scripts/build-index.mjs";

function source(name, indexUrl) {
  return { name, index_url: indexUrl, source_url: `https://example.test/${name}` };
}

function sampleIndex(pluginId = "example.plugin") {
  return {
    format: 1,
    name: "Upstream",
    plugins: {
      [pluginId]: {
        name: "Example Plugin",
        versions: {
          "1.0.0": {
            url: "https://example.test/plugin.zip",
            sha256: "a".repeat(64),
            size: 1,
          },
        },
      },
    },
  };
}

test("merges plugins and retains upstream attribution", async () => {
  const indexes = new Map([
    ["https://example.test/one", sampleIndex("one.plugin")],
    ["https://example.test/two", sampleIndex("two.plugin")],
  ]);
  const [index, sourceMap] = await mergeIndexes(
    [source("One", "https://example.test/one"), source("Two", "https://example.test/two")],
    async (url) => indexes.get(url),
  );

  assert.deepEqual(Object.keys(index.plugins), ["one.plugin", "two.plugin"]);
  assert.equal(sourceMap["two.plugin"].source, "Two");
});

test("rejects duplicate plugin IDs", async () => {
  const indexes = new Map([
    ["https://example.test/one", sampleIndex()],
    ["https://example.test/two", sampleIndex()],
  ]);
  await assert.rejects(
    mergeIndexes(
      [source("One", "https://example.test/one"), source("Two", "https://example.test/two")],
      async (url) => indexes.get(url),
    ),
    /Duplicate plugin ID/,
  );
});

test("rejects unsupported index formats", async () => {
  const invalidIndex = sampleIndex();
  invalidIndex.format = 2;
  await assert.rejects(
    mergeIndexes([source("One", "https://example.test/one")], async () => invalidIndex),
    /unsupported repository index format/,
  );
});

test("rejects malformed artifact digests", async () => {
  const invalidIndex = sampleIndex();
  invalidIndex.plugins["example.plugin"].versions["1.0.0"].sha256 = "invalid";
  await assert.rejects(
    mergeIndexes([source("One", "https://example.test/one")], async () => invalidIndex),
    /sha256/,
  );
});
