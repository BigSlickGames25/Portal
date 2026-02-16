**Overview**
This portal is a static single-page app with ES module screens and one shared stylesheet. Each screen lives in its own module, and each major UI section is tagged with a `data-layout` key so you can move or scale it from one central place.

**Naming Conventions**
Layout keys use the pattern `screen-section` or `global-section`. Example: `overview-kpis`, `finance-ledger`, `global-sidebar`.
Screen modules use the pattern `screenNameScreen`. Example: `overviewScreen` in `src/ui/screens/overview.js`.
Component modules use clear verbs like `renderKpiCards` or `renderCalendar`.

**Layout Controls (X/Y and Scale)**
File: `src/config/layoutConfig.js`
Each entry supports:
- `offsetX`: horizontal position shift in pixels.
- `offsetY`: vertical position shift in pixels.
- `scaleX`: horizontal scale multiplier.
- `scaleY`: vertical scale multiplier.

Example:
```js
export const layoutConfig = {
  defaults: { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
  elements: {
    "overview-kpis": { offsetX: 12, offsetY: -6, scaleX: 1, scaleY: 1 }
  }
};
```

What this changes:
`offsetX` and `offsetY` move only that element without reflowing its neighbors. `scaleX` and `scaleY` scale the element visually, so it may overlap or leave gaps. Use small values first.

**Where Layout Is Applied**
File: `src/ui/layout.js`
This file reads the layout map and applies the values as CSS variables to every element with a `data-layout` attribute. The shared stylesheet uses those variables to set `transform` on each element.

**Layout Keys (What You Can Move or Scale)**
- `global-app` is the full app grid container.
- `global-sidebar` is the left sidebar panel.
- `global-nav` is the button stack inside the sidebar.
- `global-topbar` is the top header area inside the workspace.
- `global-workspace` is the main right-side workspace container.
- `global-screen-root` is the scrollable screen content area.
- `overview-kpis` is the KPI card grid on the Overview screen.
- `overview-revenue` is the revenue chart panel on the Overview screen.
- `overview-users` is the user growth chart panel on the Overview screen.
- `overview-alerts` is the alert list panel on the Overview screen.
- `overview-calendar` is the upcoming calendar panel on the Overview screen.
- `overview-strategic` is the strategic stats panel on the Overview screen.
- `finance-spend` is the spend allocation panel on the Finance screen.
- `finance-burn` is the revenue vs spend panel on the Finance screen.
- `finance-chips` is the chip economy panel on the Finance screen.
- `finance-ledger` is the cost center ledger panel on the Finance screen.
- `users-retention` is the retention funnel panel on the Users screen.
- `users-segments` is the segments chart panel on the Users screen.
- `users-cohorts` is the cohort table panel on the Users screen.
- `changes-velocity` is the release velocity panel on the Game Changes screen.
- `changes-feed` is the change feed panel on the Game Changes screen.
- `calendar-board` is the calendar grid panel on the Calendar screen.
- `calendar-events` is the upcoming events table on the Calendar screen.
- `library-panel` is the full Game Library panel.
- `library-controls` is the search and filter row inside the Game Library panel.
- `library-list` is the scrollable game list inside the Game Library panel.
- `library-detail` is the detail pane inside the Game Library panel.
- `security-auth` is the auth status panel on the Security screen.
- `security-api` is the API connection panel on the Security screen.
- `security-controls` is the security controls list panel on the Security screen.

**Labels and Field Names (Where to Edit Text)**
Global labels live in `index.html`:
- Brand kicker: `Big Slick Games`
- Brand title: `Management Portal`
- Brand subtitle: `Studio operations and business intelligence`
- Nav buttons: `Overview`, `Finance`, `Users`, `Game Changes`, `Calendar`, `Game Library`, `Security`
- Sidebar footer label: `Environment`
- Topbar action button: `Refresh`
- Default session label: `Session loading...`
- Default environment label: `local`

Topbar screen titles and kickers live in the screen modules:
- `src/ui/screens/overview.js`: `Business Overview`, `Studio Intelligence`
- `src/ui/screens/finance.js`: `Finance and Economy`, `Revenue, Spend, Chips`
- `src/ui/screens/users.js`: `User Analytics`, `Acquisition and Retention`
- `src/ui/screens/changes.js`: `Game Change Tracking`, `Releases and LiveOps`
- `src/ui/screens/calendar.js`: `Studio Calendar`, `Milestones and Events`
- `src/ui/screens/library.js`: `Game Library`, `Portfolio Catalog`
- `src/ui/screens/security.js`: `Security and Auth Setup`, `AWS Staging Readiness`

Overview screen section labels are in `src/ui/screens/overview.js`:
- `Revenue Momentum (12 months)`
- `Gross booking trend across all active titles`
- `User Growth`
- `Monthly active users`
- `Priority Alerts`
- `Upcoming Calendar`
- `Strategic Snapshot`

Finance screen section labels are in `src/ui/screens/finance.js`:
- `Spend Allocation (MTD)`
- `Revenue vs Spend`
- `Revenue (blue) and operational spend (gold), values in thousands USD`
- `Chip Economy Health`
- `Cost Center Ledger`
- Table headers: `Cost Center`, `Owner`, `Spend`
- Stat labels: `Minted`, `Redeemed`, `Net Sink Rate`

Users screen section labels are in `src/ui/screens/users.js`:
- `Retention Funnel`
- `Monetization Segments`
- `Cohort Retention Table`
- Table headers: `Cohort`, `Week 1`, `Week 2`, `Week 3`, `Week 4`, `Week 5`

Game Changes screen section labels are in `src/ui/screens/changes.js`:
- `Release Velocity`
- `Completed release units per sprint cycle`
- `Latest Changes`
- Inline label: `Owner:` (in the timeline rows)

Calendar screen section labels are in `src/ui/screens/calendar.js`:
- `Planning Board` (month name is dynamic)
- Weekday labels: `Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`
- `Upcoming Events`
- Table headers: `Date`, `Event`, `Type`

Game Library screen section labels are in `src/ui/screens/library.js`:
- `Game Information Library`
- `Filter by game status and inspect roadmap + health metrics.`
- Search placeholder: `Search game, genre, tag...`
- Status options: `All statuses`, `Live`, `Growth`, `Stabilize`, `Alpha`
- Empty state: `No titles match this filter.`

Game Library detail labels are in `src/ui/components/gameDetail.js`:
- `Lifecycle`, `DAU`, `ARPDAU`, `D30 Retention`, `Platforms`, `Current Version`
- Section headings: `Tags`, `Roadmap`

Security screen section labels are in `src/ui/screens/security.js`:
- `Authentication Status`
- `Staging API Connection`
- `Security Controls In Portal`
- Button label: `Switch to Analyst Session`
- Stat labels: `Auth Enabled`, `Provider`, `Region`, `Endpoint`, `Status`, `Auth Header`
- Inline label: `Current role:`

Data-driven labels live in `src/data/mockData.js`:
- KPI card labels: `kpis[].label` and footer notes: `kpis[].note`
- Chart and legend labels: `userTrend[].label`, `burnVsRevenue[].label`, `spendBreakdown[].label`, `userSegments[].label`
- Finance owners and ledger labels: `spendBreakdown[].owner`
- Progress labels: `chipsEconomy.sinks[].label`, `retention[].label`
- Table row labels: `cohorts[].name`
- Change feed labels: `changeFeed[].game`, `changeFeed[].title`, `changeFeed[].owner`, `changeFeed[].summary`
- Calendar labels: `releaseCalendar[].title`, `releaseCalendar[].type`
- Alert labels: `alerts[].title`, `alerts[].message`
- Strategic stat labels: `strategicStats[].label`
- Game library labels: `gameLibrary[].name`, `gameLibrary[].genre`, `gameLibrary[].platforms`, `gameLibrary[].lifecycle`, `gameLibrary[].version`, `gameLibrary[].summary`, `gameLibrary[].tags`, `gameLibrary[].roadmap`
- Security controls labels: `securityControls[].title`, `securityControls[].detail`

**Shared CSS**
File: `styles.css`
All design tokens are in `:root`. The key groups are:
`--bg-*` for backgrounds, `--surface-*` for panel surfaces, `--text-*` for typography, and `--accent-*` for highlights.
Changing a token updates the entire UI consistently.

**Screen Modules**
File: `src/ui/screens/overview.js`
Renders the KPI grid, revenue chart, user growth, alerts, calendar preview, and strategic stats. Changes here affect the Overview screen only.

File: `src/ui/screens/finance.js`
Renders spend allocation, revenue vs spend, chip economy health, and the cost center ledger. Changes here affect the Finance screen only.

File: `src/ui/screens/users.js`
Renders retention funnel, monetization segments, and cohort table. Changes here affect the Users screen only.

File: `src/ui/screens/changes.js`
Renders release velocity and the change timeline. Changes here affect the Game Changes screen only.

File: `src/ui/screens/calendar.js`
Renders the month board and the upcoming events table. Changes here affect the Calendar screen only.

File: `src/ui/screens/library.js`
Renders the game library search, list, and detail view. Changes here affect the Game Library screen only.

File: `src/ui/screens/security.js`
Renders auth status, API health, and security controls. Changes here affect the Security screen only.

**Component Modules**
File: `src/ui/components/kpiCards.js`
Builds and animates KPI cards. Adjusting this affects KPI cards wherever they appear.

File: `src/ui/components/calendar.js`
Builds the calendar grid cells. Adjusting this affects the Calendar screen board.

File: `src/ui/components/segmentLegend.js`
Builds the legend used under donut charts. Adjusting this affects the Users screen segments.

File: `src/ui/components/gameDetail.js`
Builds the selected game detail panel. Adjusting this affects the Game Library detail view.

File: `src/ui/components/badges.js`
Controls alert and impact badge styles. Adjusting this affects alerts and change impact labels.

**Screen Registry**
File: `src/ui/screens.js`
Collects all screen modules and exposes them to the app. Add new screens here when you create them.

**App Entry**
File: `src/main.js`
Bootstraps the app, handles navigation, and applies layout transforms after each screen render.
