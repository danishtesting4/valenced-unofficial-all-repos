# Valenced Unofficial All-Repos Index

One Valenced repository URL for the 16 unofficial plugin indexes collected from the community. The combined index is regenerated weekly from the upstream sources; plugin archives remain hosted by their original publishers.

## Add to Valenced

Add this URL as a plugin repository:

```text
https://raw.githubusercontent.com/danishtesting4/valenced-unofficial-all-repos/main/index.json
```

## Trust and provenance

This is an unofficial aggregation, not a review or endorsement. Upstream repositories and plugins may be incomplete, unmaintained, or unsafe. Review a plugin's author and source before installing it, and install only software you trust. Inclusion can change as upstream indexes change.

The Valenced index format does not expose a per-plugin upstream repository link in the client. `source-map.json` maps every plugin ID in the combined index to its upstream index and source repository; `sources.json` is the maintained source registry.

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

## Maintenance

The scheduled GitHub Action validates every upstream index and rebuilds `index.json` and `source-map.json` on Mondays. If any source is unreachable or invalid, generation fails and the last working index is left untouched. Run the same validation locally with Node.js 22 or newer:

```text
node scripts/build-index.mjs
node --test tests/*.test.mjs
```

The aggregator does not mirror plugin archives or modify upstream plugin code.
