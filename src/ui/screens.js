import { overviewScreen } from "./screens/overview.js";
import { financeScreen } from "./screens/finance.js";
import { usersScreen } from "./screens/users.js";
import { changesScreen } from "./screens/changes.js";
import { calendarScreen } from "./screens/calendar.js";
import { libraryScreen } from "./screens/library.js";
import { filesScreen } from "./screens/files.js";
import { securityScreen } from "./screens/security.js";

function createScreens() {
  return {
    overview: overviewScreen,
    finance: financeScreen,
    users: usersScreen,
    changes: changesScreen,
    calendar: calendarScreen,
    library: libraryScreen,
    files: filesScreen,
    security: securityScreen
  };
}

export { createScreens };
