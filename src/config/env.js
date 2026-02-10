const defaults = {
  envName: "local",
  region: "us-east-1",
  apiBaseUrl: "https://staging-api.example.com",
  motionEnabled: true
};

const runtimeOverrides = globalThis.__PORTAL_ENV__ ?? {};

export const envConfig = Object.freeze({
  ...defaults,
  ...runtimeOverrides
});
