export const dashboardData = {
  kpis: [
    {
      id: "mau",
      label: "Monthly Active Users",
      value: 184200,
      format: "compact",
      delta: "+7.4%",
      note: "vs last month"
    },
    {
      id: "revenue",
      label: "Revenue MTD",
      value: 1980000,
      format: "currency",
      delta: "+12.1%",
      note: "cross-title total"
    },
    {
      id: "spend",
      label: "Cloud Spend MTD",
      value: 534000,
      format: "currency",
      delta: "+4.8%",
      note: "compute + storage"
    },
    {
      id: "chips",
      label: "Net Chip Sink",
      value: 62.4,
      format: "percent",
      delta: "+1.9%",
      note: "health target 60%+"
    },
    {
      id: "stability",
      label: "Crash-Free Sessions",
      value: 99.21,
      format: "percentPrecise",
      delta: "+0.34%",
      note: "24h rolling"
    }
  ],
  revenueTrend: [1260, 1320, 1375, 1410, 1460, 1520, 1585, 1660, 1720, 1795, 1880, 1980],
  userTrend: [
    { label: "Sep", value: 142000 },
    { label: "Oct", value: 149800 },
    { label: "Nov", value: 153200 },
    { label: "Dec", value: 161400 },
    { label: "Jan", value: 171900 },
    { label: "Feb", value: 184200 }
  ],
  burnVsRevenue: [
    { label: "Sep", value: 1260, secondary: 438 },
    { label: "Oct", value: 1320, secondary: 454 },
    { label: "Nov", value: 1375, secondary: 479 },
    { label: "Dec", value: 1410, secondary: 495 },
    { label: "Jan", value: 1520, secondary: 514 },
    { label: "Feb", value: 1980, secondary: 534 }
  ],
  spendBreakdown: [
    { label: "Cloud Runtime", value: 188000, color: "#39c7ff", owner: "Platform Ops" },
    { label: "User Acquisition", value: 146000, color: "#22b8a8", owner: "Growth Team" },
    { label: "External QA", value: 72000, color: "#ffc778", owner: "QA Guild" },
    { label: "LiveOps Tools", value: 66000, color: "#ff8f97", owner: "LiveOps" },
    { label: "Payments and Fraud", value: 62000, color: "#86e6ff", owner: "Commerce" }
  ],
  chipsEconomy: {
    minted: 124000000,
    redeemed: 77300000,
    sinks: [
      { label: "Upgrade sinks", value: 38 },
      { label: "Event sinks", value: 24 },
      { label: "Cosmetic sinks", value: 19 },
      { label: "Loss and expiry", value: 19 }
    ]
  },
  retention: [
    { label: "Day 1", value: 44.8 },
    { label: "Day 7", value: 21.6 },
    { label: "Day 30", value: 9.8 },
    { label: "Day 60", value: 5.1 }
  ],
  userSegments: [
    { label: "Whales", value: 6, color: "#ffc778" },
    { label: "Core Spenders", value: 18, color: "#39c7ff" },
    { label: "Engaged Non-spenders", value: 29, color: "#22b8a8" },
    { label: "Casual", value: 47, color: "#86e6ff" }
  ],
  cohorts: [
    { name: "2025-W50", week1: 42, week2: 30, week3: 23, week4: 19, week5: 17 },
    { name: "2026-W01", week1: 45, week2: 32, week3: 24, week4: 20, week5: 16 },
    { name: "2026-W02", week1: 47, week2: 34, week3: 26, week4: 21, week5: 18 },
    { name: "2026-W03", week1: 44, week2: 31, week3: 24, week4: 20, week5: 17 }
  ],
  velocityTrend: [8, 11, 9, 12, 10, 14, 13, 16],
  changeFeed: [
    {
      when: "2026-02-10 14:05",
      game: "Phantom Circuit",
      title: "Shop pricing rebalance pushed to 15% cohort",
      impact: "high",
      owner: "Economy Team",
      summary: "Adjusted chest bundles and cooldown timers to smooth sink velocity."
    },
    {
      when: "2026-02-10 11:20",
      game: "Neon Drift Rivals",
      title: "Daily challenge rewards increased",
      impact: "medium",
      owner: "LiveOps",
      summary: "Boosted daily challenge rewards by 8% for retention test."
    },
    {
      when: "2026-02-09 19:50",
      game: "Dungeon Ledger",
      title: "Latency patch deployed to EU-West",
      impact: "low",
      owner: "Platform Ops",
      summary: "Reduced inventory sync payload size and compressed session pings."
    },
    {
      when: "2026-02-09 15:10",
      game: "Skyforge Mercs",
      title: "Hotfix for reward exploit",
      impact: "critical",
      owner: "Server Team",
      summary: "Closed loot endpoint race condition and invalidated affected sessions."
    },
    {
      when: "2026-02-08 22:30",
      game: "Puzzle Syndicate",
      title: "Season 6 content branch merged",
      impact: "medium",
      owner: "Content Ops",
      summary: "Merged season branch and enabled feature flags for QA lane."
    }
  ],
  releaseCalendar: [
    { date: "2026-02-12", title: "Dungeon Ledger 2.4 QA lock", type: "milestone" },
    { date: "2026-02-14", title: "Neon Drift Rivals tuning patch", type: "release" },
    { date: "2026-02-18", title: "Portfolio finance review", type: "business" },
    { date: "2026-02-20", title: "Skyforge Mercs anti-cheat update", type: "release" },
    { date: "2026-02-24", title: "Phantom Circuit event launch", type: "event" },
    { date: "2026-02-28", title: "Monthly board KPI pack", type: "business" },
    { date: "2026-03-03", title: "Storefront experiment wave B", type: "milestone" },
    { date: "2026-03-06", title: "Puzzle Syndicate Season 6", type: "release" }
  ],
  alerts: [
    {
      severity: "crit",
      title: "Skyforge Mercs fraud spike",
      message: "Chargeback requests rose 31% in the last 6 hours. Fraud workflow engaged."
    },
    {
      severity: "warn",
      title: "Cloud egress above forecast",
      message: "Egress spend is tracking 8% above budget after CDN cache miss increase."
    },
    {
      severity: "ok",
      title: "Support SLA stable",
      message: "Median first response remains below 11 minutes across top 3 titles."
    }
  ],
  strategicStats: [
    { label: "Portfolio NPS", value: "52" },
    { label: "Feature Flags Active", value: "38" },
    { label: "A/B Tests Live", value: "12" },
    { label: "Regional Uptime", value: "99.96%" },
    { label: "Refund Rate", value: "1.7%" },
    { label: "Patch Failure Rate", value: "0.8%" }
  ],
  gameLibrary: [
    {
      id: "phantom-circuit",
      name: "Phantom Circuit",
      genre: "Action RPG",
      platforms: "iOS, Android",
      lifecycle: "live",
      dau: 61200,
      arpdau: 0.68,
      d30: 10.2,
      version: "1.18.4",
      summary: "Sci-fi raid crawler with hero progression and guild economy loops.",
      lastPatch: "2026-02-10",
      tags: ["Guild", "PvE", "Economy-heavy", "Events"],
      roadmap: ["Guild War ladder", "Artifact reroll", "Festival pass v2"]
    },
    {
      id: "neon-drift-rivals",
      name: "Neon Drift Rivals",
      genre: "Arcade Racer",
      platforms: "iOS, Android, PC",
      lifecycle: "live",
      dau: 48900,
      arpdau: 0.43,
      d30: 8.9,
      version: "2.03.1",
      summary: "PvP drift racer with ranked leagues and async challenge ladders.",
      lastPatch: "2026-02-10",
      tags: ["PvP", "Esports", "LiveOps"],
      roadmap: ["Season pass refresh", "Creator replay tools", "Cross-club chat"]
    },
    {
      id: "dungeon-ledger",
      name: "Dungeon Ledger",
      genre: "Puzzle RPG",
      platforms: "iOS, Android",
      lifecycle: "growth",
      dau: 33100,
      arpdau: 0.39,
      d30: 12.5,
      version: "2.40.0",
      summary: "Tile combat game driven by combo crafting and hero contracts.",
      lastPatch: "2026-02-09",
      tags: ["Puzzle", "Heroes", "Casual-core"],
      roadmap: ["Legend contracts", "PvE campaign chapter 9", "Ad mediation refresh"]
    },
    {
      id: "skyforge-mercs",
      name: "Skyforge Mercs",
      genre: "Shooter",
      platforms: "PC, Console",
      lifecycle: "stabilize",
      dau: 21400,
      arpdau: 0.57,
      d30: 7.3,
      version: "0.92.6",
      summary: "Extraction shooter with co-op contracts and dynamic loadouts.",
      lastPatch: "2026-02-09",
      tags: ["Shooter", "Co-op", "PvPvE"],
      roadmap: ["Anti-cheat pass", "New map biome", "Weapon tuning sprint"]
    },
    {
      id: "puzzle-syndicate",
      name: "Puzzle Syndicate",
      genre: "Casual Puzzle",
      platforms: "iOS, Android, Web",
      lifecycle: "live",
      dau: 77500,
      arpdau: 0.22,
      d30: 13.4,
      version: "6.0.0-beta",
      summary: "Narrative puzzle builder with weekly episodic arcs.",
      lastPatch: "2026-02-08",
      tags: ["Casual", "Narrative", "Events"],
      roadmap: ["Season 6 launch", "Community level sharing", "Daily streak revamp"]
    },
    {
      id: "atlas-tactica",
      name: "Atlas Tactica",
      genre: "Strategy",
      platforms: "PC",
      lifecycle: "alpha",
      dau: 6200,
      arpdau: 0.05,
      d30: 4.8,
      version: "0.18.0",
      summary: "Turn-based territory conquest with deterministic combat simulation.",
      lastPatch: "2026-02-04",
      tags: ["Strategy", "Alpha", "Core loop validation"],
      roadmap: ["Guild diplomacy", "Replay parser", "Starter AI improvements"]
    }
  ],
  studioFiles: [
    {
      id: "document-001",
      name: "21Holdem_Backend_Download_Ultra_Beginner_Guide.pdf",
      type: "pdf",
      path: "src/Documents/21Holdem_Backend_Download_Ultra_Beginner_Guide.pdf"
    }
  ],
  fileUpdates: [],
  securityControls: [
    { title: "CSP + security headers", detail: "Configured in netlify.toml for all routes." },
    { title: "Auth abstraction", detail: "AuthService supports AWS Cognito toggle and role checks." },
    { title: "Session storage namespace", detail: "Session key isolated to bsg.portal.session." },
    { title: "Output sanitization", detail: "Screen templates escape dynamic values before rendering." },
    { title: "Future API token attach", detail: "ApiClient injects bearer token once auth is enabled." }
  ]
};
