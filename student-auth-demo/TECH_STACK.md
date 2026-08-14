# Tech Stack — Student Auth Demo

## Overview
A minimal demo showing how to authenticate a "student" user against the Delight AI Agent platform (server-side) and load the Delight Messenger widget (client-side) with that session.

## Backend
- **Runtime**: Node.js
- **Framework**: [Express 4](https://expressjs.com/) (`express` ^4.19.2)
- **Config**: [dotenv](https://github.com/motdotla/dotenv) (^16.4.5) — loads `DELIGHT_API_URL`, `DELIGHT_MASTER_API_TOKEN`, `DELIGHT_APP_ID`, `DELIGHT_AGENT_ID`, `PORT` from `.env`
- **HTTP client**: native `fetch` (Node 18+ global)
- **Role**: thin auth proxy — holds the Master API token server-side, calls Delight's Platform API to look up/create users and issue session tokens, and hands back only a scoped `userId` + `authToken` to the browser
- **Entry point**: [server.js](server.js)

### Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/config` | Returns public `appId` / `aiAgentId` for the frontend |
| POST | `/api/session` | Ensures the student user exists in Delight, returns `{ userId, authToken, created }` |

## Frontend
- **Type**: Static, vanilla HTML/CSS/JS (no build step, no framework)
- **Files**: [public/index.html](public/index.html), [public/app.js](public/app.js) (loaded as an ES module)
- **Widget SDK**: Delight AI Agent Messenger, loaded dynamically at runtime from `https://aiagent.delight.ai/orgs/default/index.js` via `loadMessenger()`
- **Auth pattern**: `messenger.ManualSessionInfo` with a `sessionHandler` that re-fetches a token from `/api/session` on `onSessionTokenRequired`

## External Services / APIs
- **Delight AI Agent Platform API** — Sendbird Chat-Platform-compatible REST API (`/v3/users`, `/v3/users/{id}`, `/v3/users/{id}/token`), authenticated via `Api-Token` header using the Master API token
- **Delight Messenger SDK** — client widget for the actual chat UI

## Dev Tooling
- **Package manager**: npm (`package.json`, `package-lock.json`)
- **Run command**: `npm start` → `node server.js`
- **Env file**: `.env` (gitignored; see `.env.example` for required keys)

## Repo Context
This demo lives inside a larger repo (`delight_test-Agent`) that hosts Delight AI Agent SDK documentation and samples for multiple platforms:
- `js/` — React and CDN integration guides/samples (the client SDK this demo also uses)
- `ios/` — Swift integration guides/samples
- `android/` — Android integration docs

The rest of the parent repo is documentation/samples only — it has no backend of its own. This Express server is the only backend code in the repo, written specifically to demonstrate server-side user provisioning for the Platform API.
