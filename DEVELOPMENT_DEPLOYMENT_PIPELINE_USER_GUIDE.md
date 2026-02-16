# 21 Hold'em (Big Slick Games)
# Complete Development + Deployment Pipeline User Guide

> [!WARNING]
> This guide is intentionally detailed. It is written so a total beginner can follow it without guessing.

> [!WARNING]
> Never commit `.env` files, private keys, passwords, tokens, or AWS secrets to Git.

**Scope covered in this manual**
- Local development on **Windows 10/11** with **VS Code** and **PowerShell**.
- Frontend: **Create React App** (`react-scripts start`) on `http://localhost:3000`.
- Backend: **Node** (`npm start` -> `node index.js`) on `http://localhost:4000`.
- Local Docker services:
  - MongoDB container: `holdem_mongo` on port `27017`
  - Redis container: `holdem_redis` on port `6379`
- Workspace path (must match exactly):
  - `D:\21HOLDEM25 LOCAL\`
- Deployment flow (must match exactly):
  - Push to `staging` -> Amplify deploy -> EC2 staging
  - Merge `staging` -> `main` -> Amplify deploy -> EC2 live
- Shared database risk: staging and live point to the same EC2-hosted DB.

---

## Table of Contents
- [0. Quick Start (fastest path to run locally)](#0-quick-start-fastest-path-to-run-locally)
- [1. Big Picture Pipeline Overview (diagram description + flow)](#1-big-picture-pipeline-overview-diagram-description--flow)
- [2. Prerequisites (Windows setup: Node LTS, Git, Docker Desktop, VS Code; verification commands)](#2-prerequisites-windows-setup-node-lts-git-docker-desktop-vs-code-verification-commands)
- [3. Folder Structure & Repo Layout (explain what each folder does)](#3-folder-structure--repo-layout-explain-what-each-folder-does)
- [4. Docker Setup (compose file, commands, verifying containers, logs, ports)](#4-docker-setup-compose-file-commands-verifying-containers-logs-ports)
- [5. Backend Setup (install deps, env file, start server, verify DB + Redis connections, common errors)](#5-backend-setup-install-deps-env-file-start-server-verify-db--redis-connections-common-errors)
- [6. Frontend Setup (install deps, env file, start app, verify API connectivity, common errors)](#6-frontend-setup-install-deps-env-file-start-app-verify-api-connectivity-common-errors)
- [7. Local Testing & Debugging (how to test endpoints, browser console, network tab, logs)](#7-local-testing--debugging-how-to-test-endpoints-browser-console-network-tab-logs)
- [8. Git & Branching Workflow (feature -> staging -> main; commands; how to recover from mistakes)](#8-git--branching-workflow-feature---staging---main-commands-how-to-recover-from-mistakes)
- [9. GitHub Remote Setup (cloning, remotes, pushing, pull requests, merge rules)](#9-github-remote-setup-cloning-remotes-pushing-pull-requests-merge-rules)
- [10. Amplify Setup (how it connects to GitHub; build settings; environment variables; deploy triggers)](#10-amplify-setup-how-it-connects-to-github-build-settings-environment-variables-deploy-triggers)
- [11. EC2 Staging Server (how deploy lands; how to verify services; logs; restart procedures)](#11-ec2-staging-server-how-deploy-lands-how-to-verify-services-logs-restart-procedures)
- [12. EC2 Live Server (same as staging; extra safety)](#12-ec2-live-server-same-as-staging-extra-safety)
- [13. Deployment Procedure (step-by-step: local -> staging -> test -> main -> live)](#13-deployment-procedure-step-by-step-local---staging---test---main---live)
- [14. Rollback & Disaster Recovery (exact rollback steps, restoring previous commit/build)](#14-rollback--disaster-recovery-exact-rollback-steps-restoring-previous-commitbuild)
- [15. Security Checklist (SSH keys, least privilege, env vars, backups, audit basics)](#15-security-checklist-ssh-keys-least-privilege-env-vars-backups-audit-basics)
- [16. Troubleshooting Index (symptom -> cause -> fix)](#16-troubleshooting-index-symptom---cause---fix)
- [17. Glossary (massive)](#17-glossary-massive)
- [Daily Workflow (One-Page Checklist)](#daily-workflow-one-page-checklist)

---

## 0. Quick Start (fastest path to run locally)

This is the shortest path to get the full stack running on your machine.

### Step 0.1 Open 3 PowerShell windows

- Terminal A: Docker services
- Terminal B: Backend
- Terminal C: Frontend

### Step 0.2 Start MongoDB and Redis with Docker Compose

In Terminal A:

```powershell
cd "D:\21HOLDEM25 LOCAL\"
docker compose up -d
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Expected output (example):

```text
NAMES          STATUS          PORTS
holdem_mongo   Up 10 seconds   0.0.0.0:27017->27017/tcp
holdem_redis   Up 10 seconds   0.0.0.0:6379->6379/tcp
```

### Step 0.3 Configure and start backend

In Terminal B:

```powershell
cd "D:\21HOLDEM25 LOCAL\Game-Backend"
npm install
@"
DB_URL=mongodb://localhost:27017/holdem
NODE_ENV=development
PORT=4000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
"@ | Set-Content -Encoding UTF8 ".env"
npm start
```

Expected output (example):

```text
> npm start
> node index.js
Server running on port 4000
MongoDB connected
Redis connected
```

### Step 0.4 Configure and start frontend (CRA)

In Terminal C:

```powershell
cd "D:\21HOLDEM25 LOCAL\Game-Frontend"
npm install
@"
REACT_APP_API_URL=http://localhost:4000
"@ | Set-Content -Encoding UTF8 ".env.local"
npm start
```

Expected output (example):

```text
Compiled successfully!

You can now view game-frontend in the browser.

Local:            http://localhost:3000
On Your Network:  http://192.168.x.x:3000
```

### Step 0.5 Verify backend and frontend are reachable

In any terminal:

```powershell
Invoke-WebRequest -UseBasicParsing "http://localhost:4000" | Select-Object StatusCode
Invoke-WebRequest -UseBasicParsing "http://localhost:3000" | Select-Object StatusCode
```

Expected output:

```text
StatusCode
----------
200

StatusCode
----------
200
```

### Common mistakes

- Running `docker compose up -d` from the wrong folder.
- Creating backend `.env` in the project root instead of `Game-Backend`.
- Forgetting `REACT_APP_` prefix in frontend env vars.
- Starting frontend before backend, then assuming API is broken.

### If this happens, do this

| Symptom | Do this |
|---|---|
| `no configuration file provided` | Run `cd "D:\21HOLDEM25 LOCAL\"` first, then `docker compose up -d`. |
| Frontend starts, but API calls fail | Verify `Game-Frontend\.env.local` contains `REACT_APP_API_URL=http://localhost:4000`, then restart frontend with `Ctrl+C`, `npm start`. |
| Backend says Redis/Mongo connection error | Run `docker ps` and confirm `holdem_mongo` and `holdem_redis` are `Up`. |

### You are done when

- [ ] `docker ps` shows `holdem_mongo` and `holdem_redis` running.
- [ ] Backend terminal shows listening on `4000`.
- [ ] Frontend terminal shows CRA compiled and serves on `3000`.
- [ ] Browser opens `http://localhost:3000`.

---

## 1. Big Picture Pipeline Overview (diagram description + flow)

This chapter explains the full path from coding locally to live deployment.

### 1.1 Deployment flow diagram (text description)

```text
Local Windows Dev (VS Code + PowerShell)
        |
        | commit/push feature branch
        v
GitHub feature/*
        |
        | PR merged into staging
        v
GitHub staging branch
        |
        | Amplify staging deploy trigger
        v
EC2 Staging Server
        |
        | staging validation / QA
        v
PR: staging -> main
        |
        | Amplify live deploy trigger
        v
EC2 Live Server
        |
        +------------------------------+
        | Shared EC2-hosted database   |
        | (staging and live use same)  |
        +------------------------------+
```

### 1.2 Environment roles

| Environment | Branch | Target | Purpose |
|---|---|---|---|
| Local | feature/* | Your Windows machine | Build and test safely |
| Staging | `staging` | EC2 staging | Final pre-live validation |
| Live | `main` | EC2 live | Production users |

### 1.3 Shared DB risk (critical)

Because staging and live point to the same DB, staging changes can impact live data.

| Risk | Impact | Mitigation |
|---|---|---|
| Staging test writes bad data | Live data corruption | Use non-destructive test data and cleanup scripts |
| DB schema change not backward compatible | Live app breakage | Use additive migrations first, remove old fields later |
| Accidental destructive scripts in staging | Immediate live incident | Require peer review + backups before schema/data scripts |

### Common mistakes

- Treating staging as “safe sandbox” when DB is shared.
- Running destructive migration scripts from staging tests.
- Skipping a backup before major release.

### If this happens, do this

| Symptom | Do this |
|---|---|
| Staging test changed live data | Freeze deploys, run incident checklist (Chapter 14), restore from backup if needed. |
| Team confusion about branch flow | Re-share flow: feature -> staging -> main. No direct feature -> main. |

### You are done when

- [ ] Everyone on team can explain feature -> staging -> main.
- [ ] Team accepts shared-DB risks and mitigations.
- [ ] Backup plan exists before production releases.

---

## 2. Prerequisites (Windows setup: Node LTS, Git, Docker Desktop, VS Code; verification commands)

This chapter installs every required tool from scratch.

> [!NOTE]
> These commands are for **PowerShell on Windows 10/11**.

### 2.1 Verify `winget` is available

```powershell
winget --version
```

Expected output example:

```text
v1.9.25200
```

If command is not found:
1. Open Microsoft Store.
2. Install/update **App Installer**.
3. Reopen PowerShell and run `winget --version` again.

### 2.2 Install Node.js LTS (recommend Node 20 LTS)

```powershell
winget install --id OpenJS.NodeJS.LTS -e
```

Verify:

```powershell
node -v
npm -v
```

Expected output example:

```text
v20.18.1
10.8.2
```

### 2.3 Install Git

```powershell
winget install --id Git.Git -e
```

Verify:

```powershell
git --version
```

Expected output:

```text
git version 2.47.0.windows.1
```

### 2.4 Install Docker Desktop

```powershell
winget install --id Docker.DockerDesktop -e
```

Then:
1. Start Docker Desktop from Start Menu.
2. Wait until Docker says engine is running.
3. If prompted for WSL2, accept and reboot if requested.

Verify:

```powershell
docker version
docker compose version
```

Expected output example:

```text
Client: Docker Engine - Community
Server: Docker Engine - Community
Docker Compose version v2.29.7
```

### 2.5 Install VS Code

```powershell
winget install --id Microsoft.VisualStudioCode -e
```

Verify:

```powershell
code --version
```

Expected output example:

```text
1.97.2
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
x64
```

### 2.6 Optional but recommended VS Code extensions

```powershell
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
```

### 2.7 Final prerequisite verification block

Run all of these:

```powershell
node -v
npm -v
git --version
docker version
docker compose version
code --version
```

### Common mistakes

- Installing tools but not reopening PowerShell.
- Docker Desktop installed but not started.
- Using old Node version (for example Node 16) causing package/runtime issues.

### If this happens, do this

| Symptom | Do this |
|---|---|
| `node` not found | Restart terminal; if still missing, reinstall Node LTS and confirm PATH update. |
| Docker `npipe` engine error | Start Docker Desktop and wait until engine status is healthy (see Chapter 4.7.1). |
| `code` not found | Reinstall VS Code and ensure “Add to PATH” is enabled. |

### You are done when

- [ ] All tool version commands return valid output.
- [ ] Docker Desktop shows engine running.
- [ ] VS Code opens and can open folders.

---

## 3. Folder Structure & Repo Layout (explain what each folder does)

### 3.1 Required local path

Your local workspace must be:

```text
D:\21HOLDEM25 LOCAL\
├─ docker-compose.yml
├─ Game-Backend\
└─ Game-Frontend\
```

### 3.2 Verify folder structure

```powershell
cd "D:\21HOLDEM25 LOCAL\"
tree . /F
```

Expected output should include at minimum:

```text
D:\21HOLDEM25 LOCAL
|   docker-compose.yml
+---Game-Backend
|   |   package.json
|   |   index.js
+---Game-Frontend
    |   package.json
    |   src\...
```

### 3.3 What each path does

| Path | Purpose |
|---|---|
| `D:\21HOLDEM25 LOCAL\docker-compose.yml` | Starts local MongoDB + Redis |
| `D:\21HOLDEM25 LOCAL\Game-Backend\` | Node backend API server |
| `D:\21HOLDEM25 LOCAL\Game-Backend\.env` | Backend runtime variables |
| `D:\21HOLDEM25 LOCAL\Game-Frontend\` | CRA frontend app |
| `D:\21HOLDEM25 LOCAL\Game-Frontend\.env.local` | Frontend local env (CRA-compatible) |

### Common mistakes

- Putting `.env` file in the wrong folder.
- Running backend commands inside frontend folder or vice versa.
- Running Docker Compose in a nested directory.

### If this happens, do this

| Symptom | Do this |
|---|---|
| Backend cannot read env vars | Confirm file is exactly `D:\21HOLDEM25 LOCAL\Game-Backend\.env`. |
| Frontend still uses wrong API URL | Confirm file is `Game-Frontend\.env.local`, then restart `npm start`. |
| Docker compose cannot find YAML | Confirm working directory is `D:\21HOLDEM25 LOCAL\`. |

### You are done when

- [ ] Folder tree matches required structure.
- [ ] You know where backend and frontend env files belong.

---

## 4. Docker Setup (compose file, commands, verifying containers, logs, ports)

### 4.1 Open the correct folder first

```powershell
cd "D:\21HOLDEM25 LOCAL\"
Test-Path ".\docker-compose.yml"
```

Expected output:

```text
True
```

### 4.2 Start containers in detached mode

```powershell
docker compose up -d
```

Expected output example:

```text
[+] Running 2/2
 ✔ Container holdem_mongo  Started
 ✔ Container holdem_redis  Started
```

### 4.3 Verify container status and ports

```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Expected output:

```text
NAMES          STATUS          PORTS
holdem_mongo   Up ...          0.0.0.0:27017->27017/tcp
holdem_redis   Up ...          0.0.0.0:6379->6379/tcp
```

### 4.4 Check Mongo and Redis logs

```powershell
docker logs --tail 50 holdem_mongo
docker logs --tail 50 holdem_redis
```

Expected output examples:

```text
MongoDB: Waiting for connections on port 27017
Redis: Ready to accept connections
```

### 4.5 Test local ports from Windows

```powershell
Test-NetConnection localhost -Port 27017
Test-NetConnection localhost -Port 6379
```

Expected key field:

```text
TcpTestSucceeded : True
```

### 4.6 Useful lifecycle commands

```powershell
# Stop containers
docker compose down

# Start existing containers
docker compose start

# Restart a single container
docker restart holdem_redis

# Full reset (WARNING: removes data volumes)
docker compose down -v
```

> [!WARNING]
> `docker compose down -v` deletes container volumes. Use only when you intentionally want a clean DB/cache.

### 4.7 Mandatory troubleshooting cases

#### 4.7.1 Docker daemon not running (`npipe/dockerDesktopLinuxEngine` error)

Symptom example:

```text
error during connect: this error may indicate that the docker daemon is not running:
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

Fix:

1. Start Docker Desktop.
2. Wait for engine to say Running.
3. Run:

```powershell
docker version
```

Expected: both `Client` and `Server` sections appear.

#### 4.7.2 `no configuration file provided` for docker compose

Symptom example:

```text
no configuration file provided: not found
```

Fix:

```powershell
cd "D:\21HOLDEM25 LOCAL\"
Get-ChildItem docker-compose.yml
docker compose up -d
```

### Common mistakes

- Running compose commands from `Game-Backend` instead of root.
- Assuming Docker Desktop auto-started after reboot.
- Ignoring container logs when services fail.

### If this happens, do this

| Symptom | Do this |
|---|---|
| `holdem_redis` exits immediately | Run `docker logs holdem_redis` and fix config or port conflicts. |
| Port `27017` already bound | Find process using port, stop it, then restart compose. |
| Containers keep restarting | Use `docker ps -a` and `docker logs <container>` to inspect startup failure loop. |

### You are done when

- [ ] `holdem_mongo` and `holdem_redis` are `Up`.
- [ ] Both ports respond with `TcpTestSucceeded : True`.
- [ ] You can read logs without errors.

---
## 5. Backend Setup (install deps, env file, start server, verify DB + Redis connections, common errors)

### 5.1 Go to backend directory

```powershell
cd "D:\21HOLDEM25 LOCAL\Game-Backend"
```

### 5.2 Install dependencies

```powershell
npm install
```

Expected output example:

```text
added 412 packages, and audited 413 packages in 14s
```

### 5.3 Create backend `.env` (exact required values)

File must be: `D:\21HOLDEM25 LOCAL\Game-Backend\.env`

```powershell
@"
DB_URL=mongodb://localhost:27017/holdem
NODE_ENV=development
PORT=4000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
"@ | Set-Content -Encoding UTF8 ".env"
```

Verify:

```powershell
Get-Content ".env"
```

Expected output:

```text
DB_URL=mongodb://localhost:27017/holdem
NODE_ENV=development
PORT=4000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
```

### 5.4 Start backend server

```powershell
npm start
```

Expected output example:

```text
> npm start
> node index.js
Server listening on 4000
Connected to MongoDB
Connected to Redis
```

### 5.5 Verify Mongo and Redis from containers

In a second terminal:

```powershell
docker exec holdem_mongo mongosh --quiet --eval "db.runCommand({ ping: 1 })"
docker exec holdem_redis redis-cli ping
```

Expected output:

```text
{ ok: 1 }
PONG
```

### 5.6 Verify backend port from Windows

```powershell
Invoke-WebRequest -UseBasicParsing "http://localhost:4000" | Select-Object StatusCode
```

Expected:

```text
StatusCode
----------
200
```

If your app uses `/health`, test that too:

```powershell
Invoke-WebRequest -UseBasicParsing "http://localhost:4000/health" | Select-Object StatusCode, Content
```

### 5.7 Mandatory troubleshooting cases

#### 5.7.1 Mongo running but backend `DB_URL` undefined (`Mongoose openUri undefined`)

Symptom example:

```text
MongooseError: The `uri` parameter to `openUri()` must be a string, got "undefined".
```

Fix:

1. Confirm `.env` exists in backend folder.
2. Confirm `DB_URL=...` line is present and not misspelled.
3. Restart backend.

Commands:

```powershell
cd "D:\21HOLDEM25 LOCAL\Game-Backend"
Get-Content .env
npm start
```

#### 5.7.2 Redis `Invalid URL` due to missing `REDIS_HOST`/`REDIS_PORT`

Symptom example:

```text
TypeError: Invalid URL
```

Fix:

```powershell
cd "D:\21HOLDEM25 LOCAL\Game-Backend"
Get-Content .env | Select-String "REDIS_"
```

Ensure both lines exist exactly:

```text
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

Then restart backend.

#### 5.7.3 Redis `ECONNREFUSED` because container is not running

Symptom example:

```text
Error: connect ECONNREFUSED 127.0.0.1:6379
```

Fix:

```powershell
cd "D:\21HOLDEM25 LOCAL\"
docker ps --format "table {{.Names}}\t{{.Status}}"
docker start holdem_redis
```

Then restart backend.

#### 5.7.4 Port `4000` already in use

Find process:

```powershell
netstat -ano | findstr :4000
```

Expected output includes PID in last column, example:

```text
TCP    0.0.0.0:4000   0.0.0.0:0   LISTENING   15324
```

Kill process by PID:

```powershell
taskkill /PID 15324 /F
```

Then run backend again:

```powershell
npm start
```

#### 5.7.5 `npm install` vulnerability warnings

What to do:

```powershell
npm audit
npm audit --production
```

What **not** to do blindly:
- Do not run `npm audit fix --force` directly on shared/stable branches.
- Do not upgrade major versions without testing.

Safe approach:
1. Create a feature branch.
2. Upgrade one dependency at a time.
3. Test backend and frontend.
4. Open PR with clear notes.

#### 5.7.6 Node version mismatch issues (use Node 20 LTS)

Check current Node:

```powershell
node -v
```

If not Node 20 LTS, install/reinstall:

```powershell
winget install --id OpenJS.NodeJS.LTS -e
```

Reopen terminal and verify again.

### Common mistakes

- Using wrong `.env` location.
- Leaving spaces around env variable keys.
- Forgetting to restart backend after changing `.env`.

### If this happens, do this

| Symptom | Do this |
|---|---|
| Backend crashes immediately on start | Read first error in terminal; usually env var or port conflict. |
| DB connection hangs | Confirm Mongo container is running and `DB_URL` points to `localhost:27017`. |
| Redis auth errors | Keep `REDIS_USERNAME` and `REDIS_PASSWORD` empty for local if Redis has no auth. |

### You are done when

- [ ] Backend starts with no crash.
- [ ] Backend listens on `http://localhost:4000`.
- [ ] Mongo ping returns `{ ok: 1 }`.
- [ ] Redis ping returns `PONG`.

---

## 6. Frontend Setup (install deps, env file, start app, verify API connectivity, common errors)

### 6.1 Go to frontend directory

```powershell
cd "D:\21HOLDEM25 LOCAL\Game-Frontend"
```

### 6.2 Install dependencies

```powershell
npm install
```

### 6.3 Create CRA-compatible env file

Recommended local file: `D:\21HOLDEM25 LOCAL\Game-Frontend\.env.local`

```powershell
@"
REACT_APP_API_URL=http://localhost:4000
"@ | Set-Content -Encoding UTF8 ".env.local"
```

> [!NOTE]
> CRA supports `.env` and `.env.local`. For local-only values, prefer `.env.local`.

Verify:

```powershell
Get-Content .env.local
```

Expected output:

```text
REACT_APP_API_URL=http://localhost:4000
```

### 6.4 Start frontend

```powershell
npm start
```

Expected output (example):

```text
Starting the development server...
Compiled successfully!
Local:            http://localhost:3000
```

### 6.5 Verify frontend can reach backend

1. Open browser at `http://localhost:3000`.
2. Open DevTools (`F12`) -> Network tab.
3. Trigger an API action in UI.
4. Confirm API calls go to `http://localhost:4000/...`.
5. Confirm response status is 200/201/204 (or expected app-specific code).

### 6.6 Mandatory troubleshooting case: CRA frontend cannot reach backend (CORS / wrong API URL)

Fix checklist:

1. Confirm backend is running on `4000`.
2. Confirm `REACT_APP_API_URL` exactly equals `http://localhost:4000`.
3. Restart frontend after env changes.
4. Check backend CORS policy allows `http://localhost:3000`.

Example backend CORS config (Express):

```js
import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);
```

### Common mistakes

- Using `API_URL=...` (wrong; CRA requires `REACT_APP_` prefix).
- Changing env file while frontend is running and not restarting.
- Backend running on different port than env value.

### If this happens, do this

| Symptom | Do this |
|---|---|
| Browser says CORS blocked | Add/verify CORS origin in backend and restart backend. |
| Frontend still calls old URL | Stop/start frontend (`Ctrl+C` then `npm start`). |
| Port `3000` in use | Stop old process or accept CRA prompt to run on another port (prefer keeping 3000). |

### You are done when

- [ ] Frontend compiles and serves on `http://localhost:3000`.
- [ ] API calls point to `http://localhost:4000`.
- [ ] Browser console has no blocking CORS errors for expected requests.

---

## 7. Local Testing & Debugging (how to test endpoints, browser console, network tab, logs)

### 7.1 Service health check commands

```powershell
Invoke-WebRequest -UseBasicParsing "http://localhost:3000" | Select-Object StatusCode
Invoke-WebRequest -UseBasicParsing "http://localhost:4000" | Select-Object StatusCode
Test-NetConnection localhost -Port 27017
Test-NetConnection localhost -Port 6379
```

Expected:
- HTTP services return `StatusCode 200`.
- Port checks show `TcpTestSucceeded : True`.

### 7.2 Check what is running (ports, docker ps, logs)

```powershell
# Docker containers
docker ps

# Which processes own key ports
netstat -ano | findstr :3000
netstat -ano | findstr :4000
netstat -ano | findstr :27017
netstat -ano | findstr :6379

# Docker logs
docker logs --tail 100 holdem_mongo
docker logs --tail 100 holdem_redis
```

### 7.3 Backend logs and request debugging

- Keep backend terminal visible while testing.
- Trigger a UI action.
- Watch backend log line for incoming request and errors.

Optional focused log grep (PowerShell if logs written to file):

```powershell
Get-Content .\logs\app.log -Wait | Select-String -Pattern "ERROR|WARN|Mongo|Redis"
```

### 7.4 Browser debugging flow (frontend)

1. Open DevTools (`F12`).
2. Console tab: watch for JS errors.
3. Network tab:
   - Filter by `Fetch/XHR`.
   - Click failing request.
   - Inspect URL, status, response body, CORS headers.
4. Application tab:
   - Check local storage/session if used.

### 7.5 Basic API test from PowerShell

```powershell
# Replace /health with your real endpoint if needed
Invoke-RestMethod "http://localhost:4000/health"
```

Expected output example:

```text
status : ok
uptime : 12345
```

### Common mistakes

- Looking only at frontend and ignoring backend logs.
- Testing API from browser without checking exact URL in Network tab.
- Forgetting that old terminals might still hold previous crashed process state.

### If this happens, do this

| Symptom | Do this |
|---|---|
| UI spinner never stops | Check Network tab for pending/failed API call, then backend logs for matching error. |
| API returns 500 | Reproduce with `Invoke-RestMethod` and inspect backend stack trace. |
| Random behavior after many restarts | Stop all (`Ctrl+C`), run `docker compose down`, restart services in order. |

### You are done when

- [ ] You can verify all 4 key ports: `3000`, `4000`, `27017`, `6379`.
- [ ] You know where to read frontend and backend errors.
- [ ] You can reproduce API failures from PowerShell commands.

---

## 8. Git & Branching Workflow (feature -> staging -> main; commands; how to recover from mistakes)

### 8.1 One-time Git identity setup

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Verify:

```powershell
git config --global --list
```

### 8.2 Branch policy (required)

- Create work on `feature/*` branches.
- Merge feature branches into `staging` first.
- Merge `staging` into `main` only after staging validation passes.

### 8.3 Start a new feature safely

```powershell
cd "D:\21HOLDEM25 LOCAL\"
git checkout staging
git pull origin staging
git checkout -b feature/<ticket-or-topic>
```

Example:

```powershell
git checkout -b feature/fix-redis-reconnect
```

### 8.4 Make changes and checkpoint commit often

```powershell
git status
git add .
git commit -m "feat: short clear message"
```

Best practice: commit every meaningful checkpoint (30-90 minutes of work).

### 8.5 Review diffs before every commit

```powershell
git diff
git diff --staged
```

### 8.6 Push feature branch

```powershell
git push -u origin feature/<ticket-or-topic>
```

### 8.7 Open PR: feature -> staging

PR template should include:
1. What changed.
2. Why it changed.
3. How to test locally.
4. Risks.
5. Screenshots/logs if applicable.

### 8.8 Promote release: staging -> main

After staging QA sign-off:
1. Open PR from `staging` to `main`.
2. Get required approval.
3. Merge.

### 8.9 Recover from common Git mistakes

#### Case A: Committed on wrong branch

```powershell
# Undo last commit but keep changes
git reset --soft HEAD~1

# Switch to correct branch
git checkout feature/<correct-branch>

# Recommit
git add .
git commit -m "move commit to correct branch"
```

#### Case B: Need to undo a bad commit already pushed

```powershell
git log --oneline -n 20
git revert <bad_commit_sha>
git push origin <current-branch>
```

#### Case C: Need to temporarily save unfinished changes

```powershell
git stash push -m "wip: short note"
git stash list
git stash pop
```

### 8.10 Codex/Copilot safety rules (mandatory)

1. Always work on feature branches.
2. Always checkpoint commits.
3. Never allow tool to edit `package.json`, `package-lock.json`, `.env`, `docker-compose.yml` unless explicitly requested.
4. Always review diffs before commit.
5. Never run destructive Git commands unless explicitly approved.

Quick guard commands:

```powershell
git status
git diff
git diff --staged
```

### Common mistakes

- Working directly on `main`.
- Squashing many unrelated changes into one commit.
- Merging into `main` before staging validation.

### If this happens, do this

| Symptom | Do this |
|---|---|
| You accidentally edited on `main` | Create feature branch immediately, commit there, reset `main` to origin/main if needed. |
| PR is too large | Split into smaller PRs by feature area. |
| Merge conflict in PR | Pull target branch, resolve locally, push updated branch. |

### You are done when

- [ ] You can create feature branch from `staging`.
- [ ] You can commit, diff-check, and push safely.
- [ ] You can recover from common mistakes without panic.

---
## 9. GitHub Remote Setup (cloning, remotes, pushing, pull requests, merge rules)

### 9.1 Clone repository into required path

```powershell
cd "D:\"
git clone <YOUR_GITHUB_REPO_URL> "21HOLDEM25 LOCAL"
cd "D:\21HOLDEM25 LOCAL\"
```

Verify:

```powershell
git remote -v
```

Expected output example:

```text
origin  https://github.com/your-org/your-repo.git (fetch)
origin  https://github.com/your-org/your-repo.git (push)
```

### 9.2 If folder already exists, connect remote manually

```powershell
cd "D:\21HOLDEM25 LOCAL\"
git init
git remote add origin <YOUR_GITHUB_REPO_URL>
git fetch origin
git checkout -b staging origin/staging
```

### 9.3 Push first branch

```powershell
git checkout -b feature/initial-checkpoint
git add .
git commit -m "chore: initial local checkpoint"
git push -u origin feature/initial-checkpoint
```

### 9.4 Pull request basics

1. Push feature branch.
2. Open GitHub repo in browser.
3. Click **Compare & pull request**.
4. Base branch: `staging`.
5. Add description and test evidence.
6. Request reviewer.

### 9.5 Merge rules (recommended)

| Rule | Minimum standard |
|---|---|
| Required approvals | 1 reviewer |
| CI/Build checks | Must pass |
| Conflict status | No unresolved conflicts |
| Direct push to main | Disabled |
| PR to main | Only from `staging` |

### Common mistakes

- Pushing without tracking branch (`-u`).
- Creating PR to wrong base branch.
- Forgetting to pull latest `staging` before branch creation.

### If this happens, do this

| Symptom | Do this |
|---|---|
| `fatal: remote origin already exists` | Use `git remote set-url origin <url>` instead of add. |
| Authentication failure | Re-authenticate in Git Credential Manager or use PAT/SSH key. |
| PR shows huge unrelated diffs | Rebase/merge latest `staging` and verify changed files list. |

### You are done when

- [ ] `origin` is configured and fetch/push works.
- [ ] You can open PR to `staging`.
- [ ] Team merge rules are documented and used.

---

## 10. Amplify Setup (how it connects to GitHub; build settings; environment variables; deploy triggers)

This chapter configures Amplify so branch pushes trigger EC2 deployments.

> [!NOTE]
> Amplify is used as the deployment orchestrator. Branch deploy jobs trigger EC2 updates.

### 10.1 Install AWS CLI (local admin setup)

```powershell
winget install --id Amazon.AWSCLI -e
aws --version
```

Expected output example:

```text
aws-cli/2.22.4 Python/3.12.6 Windows/10 exe/AMD64
```

Configure credentials:

```powershell
aws configure
```

Enter:
1. Access key ID
2. Secret access key
3. Default region (for example `us-east-1`)
4. Output format (`json`)

### 10.2 Connect Amplify app to GitHub repo

In AWS Console:
1. Open Amplify.
2. Create new app -> Host web app.
3. Choose GitHub.
4. Authorize AWS Amplify to your repo.
5. Select repository.
6. Add branch `staging`.
7. Add branch `main`.

### 10.3 Configure branch-specific env vars in Amplify

Set these in Amplify branch settings.

| Branch | Variable | Example value |
|---|---|---|
| `staging` | `DEPLOY_ENV` | `staging` |
| `staging` | `EC2_INSTANCE_ID` | `i-0123456789staging` |
| `staging` | `TARGET_BRANCH` | `staging` |
| `main` | `DEPLOY_ENV` | `live` |
| `main` | `EC2_INSTANCE_ID` | `i-0123456789live` |
| `main` | `TARGET_BRANCH` | `main` |

If frontend build needs runtime API URLs in Amplify environment:

| Branch | Variable | Example value |
|---|---|---|
| `staging` | `REACT_APP_API_URL` | `https://staging-api.yourdomain.com` |
| `main` | `REACT_APP_API_URL` | `https://api.yourdomain.com` |

### 10.4 Amplify build settings for CRA + EC2 trigger

Use `amplify.yml` pattern:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd Game-Frontend
        - npm ci
    build:
      commands:
        - npm run build
    postBuild:
      commands:
        - cd ..
        - chmod +x scripts/amplify-ec2-deploy.sh
        - ./scripts/amplify-ec2-deploy.sh
  artifacts:
    baseDirectory: Game-Frontend/build
    files:
      - '**/*'
  cache:
    paths:
      - Game-Frontend/node_modules/**/*
```

### 10.5 Example EC2 trigger script used by Amplify

`scripts/amplify-ec2-deploy.sh` example:

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "Deploy env: ${DEPLOY_ENV}"
echo "Target branch: ${TARGET_BRANCH}"

AWS_REGION="${AWS_REGION:-us-east-1}"

aws ssm send-command \
  --region "$AWS_REGION" \
  --instance-ids "$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Amplify deploy ${DEPLOY_ENV}" \
  --parameters commands="[
    'cd /srv/21holdem',
    'git fetch origin',
    'git checkout ${TARGET_BRANCH}',
    'git pull origin ${TARGET_BRANCH}',
    'cd Game-Backend && npm ci && pm2 restart holdem-backend-${DEPLOY_ENV}',
    'cd ../Game-Frontend && npm ci && npm run build',
    'sudo rsync -av --delete build/ /var/www/21holdem-${DEPLOY_ENV}/',
    'sudo systemctl reload nginx'
  ]"
```

Expected Amplify log snippet:

```text
Deploy env: staging
Target branch: staging
CommandId: 1234abcd-...
```

### 10.6 Deploy triggers

- Push to `staging` -> Amplify staging branch job runs.
- Push/merge to `main` -> Amplify live branch job runs.

### Common mistakes

- Missing env vars in Amplify branch settings.
- IAM role missing permission to call SSM.
- Script path mismatch (`scripts/amplify-ec2-deploy.sh` not found).

### If this happens, do this

| Symptom | Do this |
|---|---|
| Amplify build succeeds but EC2 not updated | Check `postBuild` logs and SSM command history in AWS Systems Manager. |
| Amplify job fails at npm step | Confirm correct working dir (`Game-Frontend`) and valid `package-lock.json`. |
| `AccessDenied` on SSM | Update Amplify service role IAM policy to allow `ssm:SendCommand` on target instance. |

### You are done when

- [ ] Amplify connected to GitHub with `staging` and `main` branches.
- [ ] Branch env vars are configured.
- [ ] Push to `staging` triggers build and EC2 deploy command.

---

## 11. EC2 Staging Server (how deploy lands; how to verify services; logs; restart procedures)

This chapter uses a standard Ubuntu EC2 setup with PM2 + Nginx.

### 11.1 SSH into staging EC2

From PowerShell (replace placeholders):

```powershell
ssh -i "C:\Keys\21holdem-staging.pem" ubuntu@<STAGING_EC2_PUBLIC_DNS>
```

### 11.2 One-time staging server bootstrap

Run on EC2:

```bash
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx rsync
sudo npm install -g pm2
```

Verify:

```bash
node -v
npm -v
pm2 -v
nginx -v
```

### 11.3 Clone repository on server

```bash
sudo mkdir -p /srv/21holdem
sudo chown -R $USER:$USER /srv/21holdem
git clone <YOUR_GITHUB_REPO_URL> /srv/21holdem
cd /srv/21holdem
git checkout staging
```

### 11.4 Backend staging environment file

Create file: `/srv/21holdem/Game-Backend/.env`

```bash
cat > /srv/21holdem/Game-Backend/.env << 'EOF'
DB_URL=<SHARED_EC2_DB_URL>
NODE_ENV=staging
PORT=4000
REDIS_HOST=<SHARED_REDIS_HOST>
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
EOF
```

### 11.5 Start backend with PM2

```bash
cd /srv/21holdem/Game-Backend
npm ci
pm2 start index.js --name holdem-backend-staging
pm2 save
pm2 startup
```

Verify:

```bash
pm2 list
curl -I http://localhost:4000
```

Expected PM2 status: `online`.

### 11.6 Build frontend and publish to Nginx web root

```bash
cd /srv/21holdem/Game-Frontend
npm ci
npm run build
sudo mkdir -p /var/www/21holdem-staging
sudo rsync -av --delete build/ /var/www/21holdem-staging/
```

### 11.7 Nginx staging site config

Create `/etc/nginx/sites-available/21holdem-staging`:

```nginx
server {
    listen 80;
    server_name <STAGING_DOMAIN_OR_IP>;

    root /var/www/21holdem-staging;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:

```bash
sudo ln -sf /etc/nginx/sites-available/21holdem-staging /etc/nginx/sites-enabled/21holdem-staging
sudo nginx -t
sudo systemctl reload nginx
```

### 11.8 Verify deployed staging services

```bash
curl -I http://localhost
curl -I http://localhost:4000
pm2 logs holdem-backend-staging --lines 100
sudo tail -n 100 /var/log/nginx/error.log
```

### 11.9 Restart procedures

```bash
# Backend restart
pm2 restart holdem-backend-staging

# Nginx reload
sudo systemctl reload nginx

# Full PM2 process list
pm2 list
```

### Common mistakes

- Not pulling latest `staging` branch before restart.
- PM2 process name mismatch.
- Nginx syntax invalid after config edits.

### If this happens, do this

| Symptom | Do this |
|---|---|
| Site 502 Bad Gateway | Check backend process: `pm2 list`; restart backend. |
| Nginx reload fails | Run `sudo nginx -t` and fix reported line. |
| Staging updates not visible | Confirm deployed branch on server: `git branch --show-current` and `git log -1 --oneline`. |

### You are done when

- [ ] Staging backend is `online` in PM2.
- [ ] Nginx serves frontend on staging URL.
- [ ] API requests proxy correctly to backend.

---

## 12. EC2 Live Server (same as staging; extra safety)

Live server setup is similar to staging but with stricter controls.

### 12.1 SSH into live EC2

```powershell
ssh -i "C:\Keys\21holdem-live.pem" ubuntu@<LIVE_EC2_PUBLIC_DNS>
```

### 12.2 Live bootstrap (one-time)

Run same tool install steps as staging (Node 20, Git, Nginx, PM2).

### 12.3 Clone and track `main`

```bash
sudo mkdir -p /srv/21holdem
sudo chown -R $USER:$USER /srv/21holdem
git clone <YOUR_GITHUB_REPO_URL> /srv/21holdem
cd /srv/21holdem
git checkout main
```

### 12.4 Live backend env

Create `/srv/21holdem/Game-Backend/.env`:

```bash
cat > /srv/21holdem/Game-Backend/.env << 'EOF'
DB_URL=<SHARED_EC2_DB_URL>
NODE_ENV=production
PORT=4000
REDIS_HOST=<SHARED_REDIS_HOST>
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
EOF
```

### 12.5 Start live backend + frontend

```bash
cd /srv/21holdem/Game-Backend
npm ci
pm2 start index.js --name holdem-backend-live
pm2 save

cd /srv/21holdem/Game-Frontend
npm ci
npm run build
sudo mkdir -p /var/www/21holdem-live
sudo rsync -av --delete build/ /var/www/21holdem-live/
```

### 12.6 Live Nginx config and reload

Create `21holdem-live` site config (same pattern as staging, live domain/root), then:

```bash
sudo ln -sf /etc/nginx/sites-available/21holdem-live /etc/nginx/sites-enabled/21holdem-live
sudo nginx -t
sudo systemctl reload nginx
```

### 12.7 Extra safety checks before/after live release

Before release:
1. Confirm staging sign-off is complete.
2. Confirm backup completed.
3. Confirm no destructive migration in pending release.

After release:

```bash
pm2 list
curl -I http://localhost:4000
sudo tail -n 100 /var/log/nginx/access.log
sudo tail -n 100 /var/log/nginx/error.log
```

### Common mistakes

- Skipping backup before main deploy.
- Deploying unreviewed hotfix directly to `main`.
- Forgetting to validate live API after frontend deploy.

### If this happens, do this

| Symptom | Do this |
|---|---|
| Live frontend loads, API fails | Check PM2 process, backend env values, and Nginx `/api` proxy config. |
| Live CPU spikes after release | Roll back to last known good commit and investigate logs. |
| Wrong branch deployed | Verify with `git branch --show-current` and correct to `main`. |

### You are done when

- [ ] Live server tracks `main` branch only.
- [ ] Live frontend and backend both healthy.
- [ ] Extra safety checks are part of release routine.

---

## 13. Deployment Procedure (step-by-step: local -> staging -> test -> main -> live)

This is the exact release path to follow every time.

### 13.1 Local preparation

```powershell
cd "D:\21HOLDEM25 LOCAL\"
docker compose up -d
```

Start backend/frontend locally and run smoke tests.

### 13.2 Create feature branch from `staging`

```powershell
git checkout staging
git pull origin staging
git checkout -b feature/<release-change>
```

Make changes, then:

```powershell
git add .
git commit -m "feat: <change summary>"
git push -u origin feature/<release-change>
```

### 13.3 PR to staging

1. Open PR: `feature/*` -> `staging`.
2. Get review approval.
3. Merge PR.

Expected result:
- GitHub `staging` updated.
- Amplify staging job starts automatically.

### 13.4 Verify staging deploy

Checks:
1. Amplify staging build logs: success.
2. EC2 staging backend process online.
3. Staging UI smoke tests pass.

Suggested smoke test matrix:

| Test | Expected |
|---|---|
| Load staging frontend | HTTP 200 |
| Login / auth flow (if enabled) | Works as expected |
| Core API endpoint | HTTP 200 |
| Create/update operation | No server errors |

### 13.5 Promote staging to main

```powershell
git checkout main
git pull origin main
```

Open PR: `staging` -> `main`, review, merge.

Expected result:
- Amplify live job starts.
- EC2 live gets updated.

### 13.6 Verify live deploy

Checks:
1. Live homepage loads.
2. Critical API endpoints work.
3. No major errors in backend or Nginx logs.
4. Shared DB integrity unchanged.

### 13.7 Post-release validation checklist

- Confirm user-facing flows.
- Confirm no error spikes.
- Confirm Redis/Mongo health.
- Confirm rollback plan ready if anomalies appear.

### Common mistakes

- Merging feature directly to `main`.
- Skipping staging validation because “small change.”
- Promoting while Amplify staging build is red.

### If this happens, do this

| Symptom | Do this |
|---|---|
| Staging failed but main merged | Stop further changes, roll back main (Chapter 14), then fix forward safely. |
| Amplify green but EC2 stale | Check SSM command execution and EC2 deploy script logs. |
| Live bug found post-release | Execute rollback procedure immediately. |

### You are done when

- [ ] Change passed local tests.
- [ ] Change passed staging validation.
- [ ] `staging` successfully promoted to `main`.
- [ ] Live verified after deployment.

---
## 14. Rollback & Disaster Recovery (exact rollback steps, restoring previous commit/build)

This chapter provides exact actions for staging and live rollback.

### 14.1 Staging rollback (Git revert method)

```powershell
cd "D:\21HOLDEM25 LOCAL\"
git checkout staging
git pull origin staging
git log --oneline -n 20
git revert <BAD_COMMIT_SHA>
git push origin staging
```

Expected:
- New revert commit appears on `staging`.
- Amplify staging deploy runs with reverted code.

### 14.2 Live rollback (Git revert method)

```powershell
cd "D:\21HOLDEM25 LOCAL\"
git checkout main
git pull origin main
git log --oneline -n 20
git revert <BAD_COMMIT_SHA>
git push origin main
```

Expected:
- Amplify live deploy runs with revert commit.

### 14.3 Emergency EC2 manual rollback to known good SHA

Use only if pipeline automation is broken and immediate restore is required.

Staging example:

```bash
ssh -i "C:\Keys\21holdem-staging.pem" ubuntu@<STAGING_EC2_PUBLIC_DNS>
cd /srv/21holdem
git fetch origin
git checkout staging
git log --oneline -n 20
git reset --hard <KNOWN_GOOD_SHA>
cd Game-Backend && npm ci && pm2 restart holdem-backend-staging
cd ../Game-Frontend && npm ci && npm run build
sudo rsync -av --delete build/ /var/www/21holdem-staging/
sudo systemctl reload nginx
```

Live example: same flow but branch `main`, process `holdem-backend-live`, and `/var/www/21holdem-live/`.

> [!WARNING]
> `git reset --hard` is destructive. Use only on deployment servers, not on developer branches with uncommitted work.

### 14.4 Shared database disaster recovery

Because staging/live share DB, bad staging writes can affect live.

Immediate incident steps:
1. Freeze all deployments.
2. Capture current state.
3. Restore from latest known good backup if required.
4. Re-run app validation.

Backup command example:

```bash
mongodump --uri "<SHARED_DB_URI>" --archive=/backups/predeploy_$(date +%F_%H%M).gz --gzip
```

Restore command example:

```bash
mongorestore --uri "<SHARED_DB_URI>" --archive=/backups/predeploy_YYYY-MM-DD_HHMM.gz --gzip --drop
```

### Common mistakes

- Waiting too long to roll back while incident grows.
- Attempting random fixes without identifying bad commit first.
- Restoring DB without freezing writes.

### If this happens, do this

| Symptom | Do this |
|---|---|
| Live errors spike right after deploy | Immediate Git revert on `main`, trigger rollback deploy. |
| Shared DB data corruption | Stop writes, perform controlled restore, verify app consistency before reopening traffic. |
| Amplify rollback blocked | Perform manual EC2 rollback to known good SHA. |

### You are done when

- [ ] You can execute rollback commands for `staging` and `main`.
- [ ] You have identified a known-good backup strategy.
- [ ] Team knows emergency decision path.

---

## 15. Security Checklist (SSH keys, least privilege, env vars, backups, audit basics)

### 15.1 Secrets management and safe handling

Rules:
1. `.env` files stay local/server only.
2. Never put secrets in source code.
3. Use Amplify environment variables for deploy-time secrets.
4. Rotate credentials if exposed.

Check `.env` is not tracked:

```powershell
cd "D:\21HOLDEM25 LOCAL\"
git ls-files | findstr /R "\.env$"
git check-ignore -v "Game-Backend/.env"
git check-ignore -v "Game-Frontend/.env.local"
```

Expected:
- `.env` files should not appear in `git ls-files`.

If accidentally tracked:

```powershell
git rm --cached Game-Backend/.env
git rm --cached Game-Frontend/.env.local
git commit -m "chore: remove env files from git tracking"
git push
```

Then rotate leaked secrets immediately.

### 15.2 SSH key basics

- Keep `.pem` keys outside repository.
- Restrict file access to your user account.
- Never paste private keys into chat, docs, or PRs.

### 15.3 Least privilege access

- Developers: no full AWS admin by default.
- Amplify role: only permissions needed for deploy tasks.
- EC2 access: restricted by security group and IAM policies.

### 15.4 Backups

Minimum requirements:
1. Scheduled MongoDB backups.
2. Backup retention policy.
3. Periodic restore test (backup is useless if not restorable).

### 15.5 Audit basics

Track:
- Who deployed.
- What commit SHA deployed.
- Which environment deployed.
- Time and result.

### 15.6 Codex/Copilot safety rules (mandatory)

1. Always work on feature branches.
2. Always checkpoint commits.
3. Never allow tool to edit `package.json` / `package-lock.json` / `.env` / `docker-compose.yml` unless explicitly requested.
4. Always review diffs.

Diff commands:

```powershell
git status
git diff
git diff --staged
```

### Common mistakes

- Storing secrets in `.env` and then committing accidentally.
- Over-privileged IAM users and roles.
- No rollback-ready backup before release.

### If this happens, do this

| Symptom | Do this |
|---|---|
| Secret committed | Remove from git, rotate secret, invalidate old credential. |
| Unknown who deployed | Enforce deployment logging and PR-only merges. |
| No recent backup exists | Pause high-risk deploys until backup policy is restored. |

### You are done when

- [ ] `.env` files are ignored by Git.
- [ ] AWS/EC2 access follows least privilege.
- [ ] Backup + restore process is documented and tested.
- [ ] AI tool safety rules are team policy.

---

## 16. Troubleshooting Index (symptom -> cause -> fix)

| Symptom | Likely Cause | Fix |
|---|---|---|
| Docker daemon not running (`npipe/dockerDesktopLinuxEngine` error) | Docker Desktop not running | Start Docker Desktop, wait for engine healthy, run `docker version`. |
| `no configuration file provided` in docker compose | Wrong working directory | `cd "D:\21HOLDEM25 LOCAL\"` then `docker compose up -d`. |
| Mongo running but backend throws `openUri undefined` | Missing `DB_URL` in `Game-Backend\.env` | Add exact `DB_URL=mongodb://localhost:27017/holdem`, restart backend. |
| Redis `Invalid URL` | Missing `REDIS_HOST` or `REDIS_PORT` in backend env | Add both keys, restart backend. |
| Redis `ECONNREFUSED 127.0.0.1:6379` | `holdem_redis` container stopped | `docker start holdem_redis`, restart backend. |
| Port `4000` already in use | Another process bound to 4000 | `netstat -ano | findstr :4000`, then `taskkill /PID <PID> /F`. |
| CRA frontend cannot reach backend | Wrong `REACT_APP_API_URL` or CORS issue | Set `REACT_APP_API_URL=http://localhost:4000`, restart frontend, fix backend CORS. |
| `npm install` shows vulnerabilities | Dependency advisories | Run `npm audit`; do controlled upgrades in feature branch; avoid blind `--force`. |
| Node mismatch errors | Wrong Node major version | Use Node 20 LTS (`winget install OpenJS.NodeJS.LTS -e`), reopen terminal. |
| `docker compose` command not found | Old Docker or PATH issue | Update Docker Desktop; verify `docker compose version`. |
| Frontend env var not visible in app | Missing `REACT_APP_` prefix | Rename variable with `REACT_APP_` prefix and restart CRA server. |
| Amplify build fails on install | Wrong path or lockfile mismatch | Ensure build runs in `Game-Frontend` and `npm ci` has valid lockfile. |
| EC2 deploy ran but app unchanged | Branch mismatch or stale checkout on server | Verify branch and latest commit on EC2, then pull and restart services. |
| Nginx 502 error | Backend process down or wrong upstream | Check PM2 process and Nginx proxy target `127.0.0.1:4000`. |
| Git push rejected (non-fast-forward) | Remote branch ahead | `git pull --rebase origin <branch>`, resolve, then push again. |

---

## 17. Glossary (massive)

| Term | Meaning |
|---|---|
| API | Application Programming Interface, how frontend talks to backend. |
| API URL | Base URL used by frontend to call backend endpoints. |
| Amplify | AWS service used here to trigger branch-based deployments. |
| Artifact | Build output files (for CRA, usually `build/`). |
| Audit log | Record of who did what and when. |
| AWS CLI | Command-line tool for interacting with AWS. |
| Backup | Saved copy of data used for recovery. |
| Backend | Server-side Node app in `Game-Backend`. |
| Branch | Independent Git line of development. |
| Build | Transform source code into deployable output. |
| Cache | Temporary storage to speed repeated operations. |
| Checkpoint commit | Small, safe commit made during active work. |
| Cherry-pick | Apply a specific commit onto another branch. |
| CI | Continuous Integration. |
| Clone | Copy a Git repository to local machine. |
| Commit | Saved snapshot of code in Git history. |
| Conflict | Git merge issue when two changes overlap. |
| Container | Lightweight packaged process (Docker). |
| CORS | Browser rule controlling cross-origin API access. |
| CRA | Create React App. |
| Daemon | Background service process (Docker daemon, etc.). |
| Deploy | Release code to staging/live environment. |
| Diff | Line-by-line code changes between states. |
| Docker | Container runtime platform. |
| Docker Compose | Tool for defining/running multi-container apps. |
| EC2 | AWS virtual server service. |
| Endpoint | Specific API route, such as `/health`. |
| Environment | Runtime context (local, staging, live). |
| Environment variable | Key/value setting loaded at runtime. |
| Feature branch | Branch for one focused change. |
| Fetch | Download remote Git history without merging. |
| Frontend | React app in `Game-Frontend`. |
| Git | Version control system. |
| GitHub | Hosted Git repository and PR platform. |
| HEAD | Current commit your Git checkout points to. |
| Health check | Quick endpoint/test confirming service status. |
| IAM | AWS Identity and Access Management permissions system. |
| Instance ID | Unique identifier for EC2 instance. |
| Least privilege | Give only minimum access needed. |
| Live | Production environment used by real users. |
| Localhost | Your own machine network address. |
| LTS | Long-Term Support release (stable). |
| Main branch | Production release branch (`main`). |
| Merge | Combine commits from one branch to another. |
| Merge conflict | Overlapping edits that Git cannot auto-resolve. |
| MongoDB | Document database used by backend. |
| Nginx | Web server/reverse proxy. |
| Node.js | JavaScript runtime for backend. |
| npm | Node package manager. |
| npm ci | Clean install from lockfile (deterministic). |
| npm install | Installs dependencies, may update lockfile. |
| Origin | Default name for primary remote repo. |
| PM2 | Process manager for Node apps in production-like servers. |
| Port | Numeric network endpoint (3000, 4000, etc.). |
| PR (Pull Request) | Request to merge code changes in GitHub. |
| Production | Live environment for end users. |
| Proxy | Forwarding requests from one server to another. |
| Pull | Fetch + merge remote changes into local branch. |
| Push | Upload local commits to remote branch. |
| Rebase | Replay commits on top of another branch history. |
| Redis | In-memory data store (cache/session/queue). |
| Remote | Git repository URL destination/source. |
| Revert | Create new commit that undoes previous commit. |
| Rollback | Return deployment to last known good version. |
| Root directory | Top-level folder of project. |
| rsync | Fast file synchronization command. |
| Secret | Sensitive value (password, token, key). |
| Secret rotation | Replacing compromised/old credentials. |
| Server | Machine/process hosting backend/frontend runtime. |
| Shared DB | One database used by multiple environments (risky). |
| Shell | Command-line interface (PowerShell, bash). |
| Smoke test | Fast, high-value check after changes/deploys. |
| SSM | AWS Systems Manager (used for remote command execution). |
| SSH | Secure shell protocol for remote server access. |
| Staging | Pre-production validation environment. |
| Stash | Temporarily store uncommitted Git changes. |
| Status code | HTTP response code (200, 404, 500, etc.). |
| Systemd | Linux init/service manager. |
| Tag | Named marker for a Git commit. |
| Terminal | Text-based command interface window. |
| Upstream | Remote branch a local branch tracks. |
| URL | Uniform Resource Locator (web address). |
| Validation | Confirming expected behavior with tests/checks. |
| Version control | Tracking code history and collaboration changes. |
| Vulnerability advisory | Security warning about dependency risk. |
| Webhook | Event callback that triggers automation. |
| Working tree | Files in your local checkout. |

---

## Daily Workflow (One-Page Checklist)

Use this daily checklist end-to-end.

### Start of day

- [ ] Open PowerShell in `D:\21HOLDEM25 LOCAL\`.
- [ ] Start local services:

```powershell
docker compose up -d
```

- [ ] Verify containers:

```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

- [ ] Pull latest staging and create feature branch:

```powershell
git checkout staging
git pull origin staging
git checkout -b feature/<today-task>
```

### During coding

- [ ] Run backend in one terminal (`npm start` in `Game-Backend`).
- [ ] Run frontend in one terminal (`npm start` in `Game-Frontend`).
- [ ] Verify key ports and endpoints (`3000`, `4000`, `27017`, `6379`).
- [ ] Commit checkpoints frequently.

### Before PR

- [ ] Review diffs:

```powershell
git diff
git diff --staged
```

- [ ] Confirm no secret files are staged.
- [ ] Push feature branch and open PR to `staging`.

### Staging release

- [ ] Merge feature PR to `staging`.
- [ ] Confirm Amplify staging deploy success.
- [ ] Run staging smoke tests.

### Live release

- [ ] Open/merge PR from `staging` to `main`.
- [ ] Confirm Amplify live deploy success.
- [ ] Run live smoke tests.

### End of day

- [ ] Record deployed SHA and status.
- [ ] Stop local services if done:

```powershell
docker compose down
```

- [ ] Keep notes for unresolved issues and next steps.

---

**End of manual.**
