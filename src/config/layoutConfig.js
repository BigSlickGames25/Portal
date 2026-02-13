/*
BEGINNER GUIDE
--------------
This file controls position and size of each major UI section.

Every section has the same four fields:
  offsetX: move section left/right (pixels). + = right, - = left.
  offsetY: move section up/down (pixels). + = down, - = up.
  scaleX: horizontal size. 1 = normal, 1.1 = 10% wider, 0.9 = 10% narrower.
  scaleY: vertical size. 1 = normal, 1.1 = 10% taller, 0.9 = 10% shorter.

Safe adjustment tips:
  1. Change one section at a time.
  2. Start with small moves like offsetX: 8 or offsetY: -6.
  3. Keep scale close to 1 (usually between 0.9 and 1.1).
*/

export const layoutConfig = {
  // Fallback values for any section that does not define custom values.
  defaults: {
    offsetX: 0,
    offsetY: 0,
    scaleX: 1,
    scaleY: 1
  },

  elements: {
    // GLOBAL SECTIONS (visible across all screens)
    // Full app container (left sidebar + right workspace).
    "global-app": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Left navigation sidebar panel.
    "global-sidebar": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Navigation button list inside sidebar.
    "global-nav": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Top header area inside workspace (title, user, refresh, clock).
    "global-topbar": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Right-side main workspace container.
    "global-workspace": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Scrollable content area where each screen renders.
    "global-screen-root": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },

    // OVERVIEW SCREEN
    // KPI card row at the top of Overview.
    "overview-kpis": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Revenue chart panel.
    "overview-revenue": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // User growth chart panel.
    "overview-users": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Priority alerts panel.
    "overview-alerts": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Upcoming calendar panel.
    "overview-calendar": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Strategic snapshot stats panel.
    "overview-strategic": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },

    // FINANCE SCREEN
    // Spend allocation chart + legend.
    "finance-spend": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Revenue vs spend chart.
    "finance-burn": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Chip economy health panel.
    "finance-chips": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Cost center ledger table.
    "finance-ledger": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },

    // USERS SCREEN
    // Retention funnel panel.
    "users-retention": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Monetization segments panel.
    "users-segments": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Cohort retention table panel.
    "users-cohorts": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },

    // GAME CHANGES SCREEN
    // Release velocity chart panel.
    "changes-velocity": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Latest changes timeline panel.
    "changes-feed": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },

    // CALENDAR SCREEN
    // Monthly planning board grid panel.
    "calendar-board": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Upcoming events table panel.
    "calendar-events": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },

    // GAME LIBRARY SCREEN
    // Main library container (search + list + detail).
    "library-panel": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Search input + status filter row.
    "library-controls": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Left game list.
    "library-list": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Right selected-game detail panel.
    "library-detail": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },

    // FILES SCREEN
    // Top summary panel with file counts.
    "files-overview": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Search and type filter row.
    "files-controls": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Main files repository table panel.
    "files-table": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Recent file activity feed panel.
    "files-updates": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },

    // SECURITY SCREEN
    // Authentication status panel.
    "security-auth": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // API connection panel.
    "security-api": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
    // Security controls list panel.
    "security-controls": { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 }
  }
};
