import { envConfig } from "./env.js";

export const authConfig = Object.freeze({
  enabled: false,
  provider: "aws-cognito",
  region: envConfig.region,
  userPoolId: "REPLACE_WITH_COGNITO_USER_POOL_ID",
  userPoolClientId: "REPLACE_WITH_APP_CLIENT_ID",
  hostedUiDomain: "REPLACE_WITH_HOSTED_UI_DOMAIN",
  redirectUri: `${window.location.origin}/`,
  scopes: ["openid", "profile", "email"],
  sessionStorageKey: "bsg.portal.session",
  defaultRole: "admin"
});
