# Delight AI Agent — Student Auth Demo: Work Summary

## Goal

For Ava 2.0 to authenticate students in the Delight AI Agent, a student account must exist in Delight before that student can be authenticated. This demo shows the flow: **check if the student exists → create the account if not → load the AI Agent Messenger with an authenticated session.**

## What was done

1. **Cloned the reference repo** — `sendbird/delight-ai-agent` into `C:\Users\ashis\delight_test-Agent`, and reviewed:
   - `README.md` (overall structure, App ID / Agent ID location in the dashboard)
   - `js/cdn/docs/README.md` (CDN Messenger SDK integration guide: `loadMessenger`, `initialize`, session types)
   - `js/cdn/sample/src/app.ts` (reference for `ManualSessionInfo` / session handler usage)

2. **Identified a gap**: the repo's docs only cover the client-side Messenger SDK. They don't document the server-side Platform API needed to create/check user accounts. Delight AI is Sendbird's white-labeled product, and its Platform API host (`api-{appId}.app.delight.ai`) follows the same conventions as Sendbird's public Chat Platform API — confirmed via Sendbird's docs (`Api-Token` header, `/v3/users` endpoints).

3. **Chose an architecture**: a small Express backend, not a pure HTML+JS page, because the Master API token is an admin-level credential and must never be exposed in browser JavaScript. The backend holds the token; the browser only ever receives a per-user session token.

4. **Built the demo app** in `student-auth-demo/`:
   - `server.js` — Express server exposing:
     - `GET /api/config` — returns the public App ID / Agent ID (no secrets).
     - `POST /api/session` — given `{ studentId, nickname }`:
       1. `GET /v3/users/{studentId}` to check if the student exists.
       2. If not found → `POST /v3/users` to create the account and receive an access token.
       3. If found → `POST /v3/users/{studentId}/token` to issue a fresh session token.
       4. Returns `{ userId, authToken, created }` to the browser.
   - `public/index.html` — a form for student ID + optional display name, and a "Start Chat with Ava" button.
   - `public/app.js` — calls `/api/session`, then dynamically imports the Delight Messenger SDK (`https://aiagent.delight.ai/orgs/default/index.js`), calls `messenger.initialize()` with a `ManualSessionInfo` built from the returned userId/authToken (including an `onSessionTokenRequired` handler that re-calls `/api/session` to refresh), and opens the chat.
   - `.env` / `.env.example` — App ID, Agent ID, API URL, Master API token (real values kept in `.env`, gitignored).
   - `.gitignore` — excludes `node_modules/` and `.env`.
   - `README.md` — setup and run instructions.

5. **Smoke-tested against the real Delight API** (`3874A6D9-7C4F-4974-B623-31093E3E0673`):
   - First call with a new `studentId` → account created, `access_token` returned (`created: true`).
   - Second call with the same `studentId` → recognized as existing, new session token issued (`created: false`).
   - Deleted the test user (`test_student_001`) afterward via `DELETE /v3/users/{id}` to avoid leaving test data behind.

6. **API quirks discovered and handled** (differ from vanilla Sendbird):
   - "User not found" comes back as **HTTP 400** with `code: 400201`, not a plain 404 — `findUser()` in `server.js` treats this code as "not found."
   - `profile_url` is a **required** field on user creation — `createUser()` sends `profile_url: ''` to satisfy this.

## Security notes

- The Master API token shared in chat during this session should be **rotated** in the Delight dashboard, since it was exposed in plaintext.
- The token is only ever read server-side from `.env`; it is not sent to or reachable from the browser.

## How to run

```bash
cd student-auth-demo
npm install
cp .env.example .env   # fill in DELIGHT_MASTER_API_TOKEN
npm start
```

Open http://localhost:3000, enter a student ID, click **Start Chat with Ava**.

## Possible next steps

- Wire this flow into Ava 2.0's actual student login/session system instead of a manual ID input.
- Add a `messenger.deauthenticate()` call on student logout.
- Add a `GET /v3/users` listing endpoint/script if you want to audit created accounts without using the dashboard UI.
