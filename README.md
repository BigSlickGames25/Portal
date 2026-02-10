# Big Slick Games Portal

Business management portal for game operations, user analytics, finance, release tracking, and a game information library.

## What is included

- Multi-screen portal:
  - `Overview`: KPIs, alerts, growth and revenue charts, strategic stats.
  - `Finance`: spend allocation, revenue vs spend, chip economy health.
  - `Users`: retention funnel, monetization segment split, cohort table.
  - `Game Changes`: release velocity and live change timeline.
  - `Calendar`: monthly milestone/release planning board.
  - `Game Library`: searchable title catalog with metrics and roadmap detail.
  - `Security`: auth status, API wiring state, hardening checklist.
- Animated screen transitions and interactive visual components.
- Built-in chart rendering (no external dependencies).
- Staged auth setup with AWS Cognito placeholders (disabled by default).
- API client abstraction ready for future staging AWS endpoints.
- Netlify setup with SPA redirect and security headers.

## Run locally

No build step is required.

```powershell
cd d:\Portal
python -m http.server 5173
```

Then open `http://localhost:5173`.

## Auth setup (staged, not active yet)

Auth is intentionally off right now:

- File: `src/config/authConfig.js`
- Current: `enabled: false`

When AWS staging auth is ready:

1. Set `enabled: true`.
2. Fill:
   - `userPoolId`
   - `userPoolClientId`
   - `hostedUiDomain`
3. Replace `AuthService.loginAs()` and `logout()` placeholder behavior with Cognito hosted UI flow.
4. Point `envConfig.apiBaseUrl` to your staging API gateway/domain.

## Netlify deploy

- `netlify.toml` already includes:
  - publish directory: root (`.`)
  - SPA redirect: `/* -> /index.html`
  - baseline security headers

Deploy by connecting this repo to Netlify and choosing the root as publish directory.

## GitHub remote

This project is intended for:

- `https://github.com/BigSlickGames25/Portal.git`

If you are starting fresh:

```powershell
git init -b main
git remote add origin https://github.com/BigSlickGames25/Portal.git
git add .
git commit -m "Initial portal scaffold"
git push -u origin main
```
