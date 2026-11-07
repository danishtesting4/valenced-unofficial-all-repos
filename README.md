# Community plugins, in one place

Add one URL in Valenced to browse listings from the community repositories below. The combined index refreshes every Monday, and plugin files stay hosted by their original publishers.

## Add it to Valenced

Use this as the repository URL:

```text
https://raw.githubusercontent.com/danishtesting4/valenced-unofficial-all-repos/main/index.json
```

## Before you install

These are unofficial community repositories, and this project does not review their code. Plugins run inside your Discord client, so check who made a plugin and what it does before installing it. Install only what you trust.

Valenced does not show a separate upstream link for every listing. `source-map.json` records where each plugin came from, and `sources.json` lists the indexes this project follows. The plugin titles, descriptions, authors, and release details are kept as published by their original repositories.

## Repositories we follow

| Repository | Upstream index | Source |
| --- | --- | --- |
| Rosie's Plugs | [Index](https://val.is-your.app/) | [Source](https://code.is-your.app/SheWhoReignsSupreme/valenced-plugins) |
| LisaExists | [Index](https://lisaexists.github.io/valenced-plugins/) | [Source](https://github.com/LisaExists/valenced-plugins) |
| EskimoPlugins | [Index](https://raw.githubusercontent.com/MarkLong0467/EskimoPlugins/gh-pages/index.json) | [Source](https://github.com/MarkLong0467/EskimoPlugins) |
| Bazinga | [Index](https://bleelblep.github.io/bleel-bazinga-repo/index.json) | [Source](https://github.com/bleelblep/bleel-bazinga-repo) |
| Freestyle | [Index](https://yumistra.github.io/Freestyle-Valenced) | [Source](https://github.com/Yumistra/Freestyle-Valenced) |
| NoReplyUI5 | [Index](https://noreplyui5.github.io/valenced-plugin/) | [Source](https://github.com/NoReplyUI5/valenced-plugin) |
| Choco | [Index](https://otkusteyler.github.io/chocos-plugins/) | [Source](https://github.com/OTKUSteyler/chocos-plugins) |
| Benjii | [Index](https://plugins.benjiisworld.com/) | [Source](https://github.com/Accentaro/Valenced-Plugins) |
| Purple-EyeZ | [Index](https://purple-eyez.github.io/Valenced-Plugins/) | [Source](https://github.com/Purple-EyeZ/Valenced-Plugins) |
| Livie | [Index](https://lvwmwm.github.io/liver-valenced-plugins) | [Source](https://github.com/lvwmwm/liver-valenced-plugins) |
| tralwdwd | [Index](https://valenced.tralwdwd.dev/) | [Source](https://github.com/tralwdwd/valenced-plugins) |
| slimplugins | [Index](https://aeongdesu.github.io/slimplugins) | [Source](https://github.com/aeongdesu/slimplugins) |
| Mudrhiod | [Index](https://valenced.mudrhiod.me/) | [Source](https://github.com/mudrhiod/valenced-plugins) |
| k1ng0p | [Index](https://k1ng0p.github.io/Valenced-Plugins-by-k1ng0p/) | [Source](https://github.com/k1ng0p/Valenced-Plugins-by-k1ng0p) |
| dxckie | [Index](https://dxckie-cell.github.io/valenced-plugins) | [Source](https://github.com/dxckie-cell/valenced-plugins) |
| Wolf Plugins | [Index](https://plugins.obamabot.me/valenced-plugins) | [Source](https://github.com/WolfPlugs/valenced-plugins) |

## Keeping it up to date

Every Monday, GitHub Actions checks the upstream indexes and rebuilds the combined one. If a source is unavailable or its index is invalid, the update stops and the last working index stays live.

To run the same checks locally, use Node.js 22 or newer:

```text
node scripts/build-index.mjs
node --test tests/*.test.mjs
```

This project combines listings; it does not copy or change the plugins themselves.
