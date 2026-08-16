// THE SARKIVE DISCOVERY DATA
//
// Central browse/search taxonomy only. Native media data stays in its own files.
// Guest podcast collections and the PODCASTS shelf are generated from podcasts.js
// by app.js, so adding an appearance does not require a second registry edit.

window.SARKIVE_DISCOVERY_DATA = {
  "schemaVersion": "sarkive-discovery-v2",
  "collections": [
    {
      "id": "games",
      "title": "Games",
      "kind": "game-library",
      "tags": [
        "games",
        "gameplay"
      ]
    },
    {
      "id": "respawn-inbox",
      "title": "Respawn Inbox",
      "kind": "show",
      "entryId": "respawn-inbox",
      "tags": [
        "machinima",
        "respawn",
        "inbox"
      ],
      "homeImage": "assets/RESPAWN_INBOX_TITLE_CARD.png"
    },
    {
      "id": "radio-respawn",
      "title": "Radio Respawn",
      "kind": "show",
      "entryId": "radio-respawn",
      "tags": [
        "machinima",
        "respawn",
        "podcast"
      ],
      "homeImage": "assets/RADIO_RESPAWN_TITLE_CARD.png"
    },
    {
      "id": "nerd-poker",
      "title": "Nerd Poker",
      "kind": "show",
      "entryId": "nerd-poker-season-1",
      "tags": [
        "podcast",
        "dungeons and dragons",
        "d&d"
      ],
      "homeImage": "assets/NERD_POKER_TITLE_CARD.png"
    },
    {
      "id": "x-play",
      "title": "X-Play",
      "kind": "show",
      "entryId": "x-play",
      "tags": [
        "x-play",
        "g4",
        "television",
        "appearance"
      ],
      "homeImage": "assets/XPLAY_TITLE_CARD.png"
    },
    {
      "id": "vod-index",
      "title": "VOD INDEX",
      "kind": "tool",
      "entryId": "vod-index",
      "tags": [
        "vod",
        "streams",
        "archive",
        "broadcasts"
      ],
      "searchTerms": [
        "vod index",
        "stream archive",
        "stream dates",
        "random vod"
      ],
      "homeImage": "assets/VOD_INDEX_TITLE_CARD.png"
    }
  ],
  "categories": [
    {
      "id": "popular",
      "title": "POPULAR",
      "description": "A hand-picked front shelf of Sarkive staples and major collections.",
      "home": true,
      "homeLimit": 9,
      "cardStyle": "poster",
      "order": "custom",
      "homeOrder": "custom",
      "recordIds": [
        "collection:respawn-inbox",
        "collection:radio-respawn",
        "collection:nerd-poker",
        "collection:x-play",
        "tool:vod-index",
        "game:hardcore-minecraft",
        "game:raft",
        "game:lethal-company",
        "game:hunt-showdown-1896"
      ],
      "rule": {}
    },
    {
      "id": "all-games",
      "title": "A-Z",
      "description": "Every game in the archive, alphabetically.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "alpha",
      "homeOrder": "alpha",
      "rule": {
        "kinds": [
          "game"
        ]
      }
    },
    {
      "id": "podcasts",
      "title": "PODCASTS",
      "description": "Podcast appearances featuring Sark, plus the Nerd Poker archive.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "custom",
      "homeOrder": "custom",
      "rule": {}
    },
    {
      "id": "co-op-games",
      "title": "CO-OP GAMES",
      "description": "Games tagged for co-op play.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "random",
      "homeOrder": "random",
      "rule": {
        "kinds": [
          "game"
        ],
        "tagsAny": [
          "Co-op"
        ]
      }
    },
    {
      "id": "horror-games",
      "title": "HORROR GAMES",
      "description": "Horror, survival horror, and related nightmare fuel.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "random",
      "homeOrder": "random",
      "rule": {
        "kinds": [
          "game"
        ],
        "tagsAny": [
          "Horror"
        ]
      }
    },
    {
      "id": "survival-games",
      "title": "SURVIVAL GAMES",
      "description": "Survival, crafting, scavenging, and staying alive longer than expected.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "random",
      "homeOrder": "random",
      "rule": {
        "kinds": [
          "game"
        ],
        "tagsAny": [
          "Survival"
        ]
      }
    },
    {
      "id": "shooters",
      "title": "SHOOTERS",
      "description": "FPS, third-person shooters, sniping, and other gun-heavy archives.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "random",
      "homeOrder": "random",
      "rule": {
        "kinds": [
          "game"
        ],
        "tagsAny": [
          "Shooter",
          "FPS",
          "Sniper",
          "Sniping"
        ]
      }
    },
    {
      "id": "story-games",
      "title": "STORY GAMES",
      "description": "Games tagged around story, narrative, and single-player campaigns.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "random",
      "homeOrder": "random",
      "rule": {
        "kinds": [
          "game"
        ],
        "tagsAny": [
          "Story"
        ]
      }
    },
    {
      "id": "sci-fi-games",
      "title": "SCI-FI",
      "description": "Aliens, robots, space, future guns, and assorted technological disasters.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "random",
      "homeOrder": "random",
      "rule": {
        "kinds": [
          "game"
        ],
        "tagsAny": [
          "Sci-fi"
        ]
      }
    },
    {
      "id": "open-world-exploration",
      "title": "OPEN WORLD / EXPLORATION",
      "description": "Open worlds, exploration, wandering, and getting distracted on the way there.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "random",
      "homeOrder": "random",
      "rule": {
        "kinds": [
          "game"
        ],
        "tagsAny": [
          "Open World",
          "Exploration"
        ]
      }
    },
    {
      "id": "party-social",
      "title": "PARTY / SOCIAL",
      "description": "Party games, social deduction, comedy, bluffing, and multiplayer nonsense.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "random",
      "homeOrder": "random",
      "rule": {
        "kinds": [
          "game"
        ],
        "tagsAny": [
          "Party Game",
          "Social Deduction",
          "Comedy",
          "Bluffing"
        ]
      }
    },
    {
      "id": "simulation-games",
      "title": "SIMULATION GAMES",
      "description": "Simulators, jobs, chores, economies, and suspiciously serious work.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "random",
      "homeOrder": "random",
      "rule": {
        "kinds": [
          "game"
        ],
        "tagsAny": [
          "Simulation"
        ]
      }
    },
    {
      "id": "with-aplfisher",
      "title": "WITH APL FISHER",
      "description": "Games with APL Fisher credited in the archive.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "random",
      "homeOrder": "random",
      "rule": {
        "kinds": [
          "game"
        ],
        "peopleAny": [
          "APL Fisher"
        ]
      }
    },
    {
      "id": "with-nfen",
      "title": "WITH NFEN",
      "description": "Games with NFEN credited in the archive.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "random",
      "homeOrder": "random",
      "rule": {
        "kinds": [
          "game"
        ],
        "peopleAny": [
          "NFEN"
        ]
      }
    },
    {
      "id": "with-bruce-greene",
      "title": "WITH BRUCE GREENE",
      "description": "Games with Bruce Greene credited in the archive.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "random",
      "homeOrder": "random",
      "rule": {
        "kinds": [
          "game"
        ],
        "peopleAny": [
          "Bruce Greene"
        ]
      }
    },
    {
      "id": "with-stustutters",
      "title": "WITH STUSTUTTERS",
      "description": "Games with StuStutters credited in the archive.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "random",
      "homeOrder": "random",
      "rule": {
        "kinds": [
          "game"
        ],
        "peopleAny": [
          "StuStutters"
        ]
      }
    },
    {
      "id": "with-seananners",
      "title": "WITH SEANANNERS",
      "description": "Games with SeaNanners credited in the archive.",
      "home": true,
      "homeLimit": 12,
      "cardStyle": "poster",
      "order": "random",
      "homeOrder": "random",
      "rule": {
        "kinds": [
          "game"
        ],
        "peopleAny": [
          "SeaNanners"
        ]
      }
    }
  ]
};
