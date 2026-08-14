# Delight AI Agent — Student Auth Demo

Demonstrates the "create student account if missing, then load the agent" flow for Ava 2.0:

1. Browser sends the entered student ID to a small Express backend (`/api/session`).
2. Backend calls Delight's Platform API (`GET /v3/users/{id}`) using the **Master API token** to check if the student exists.
   - If not found, it creates the account (`POST /v3/users`) and gets back a session token.
   - If found, it issues a fresh session token (`POST /v3/users/{id}/token`).
3. Backend returns only the `userId` + session `authToken` to the browser — the Master API token itself never reaches the client.
4. The browser loads the Delight Messenger SDK and calls `messenger.initialize()` with a `ManualSessionInfo` built from that userId/authToken, then opens the chat.

## Setup

```bash
cd student-auth-demo
npm install
cp .env.example .env   # fill in DELIGHT_MASTER_API_TOKEN with your real token
npm start
```

Open http://localhost:3000, enter a student ID, and click **Start Chat with Ava**.

## Files

- `server.js` — Express backend holding the Master API token and talking to Delight's Platform API.
- `public/index.html` / `public/app.js` — the student-facing page that requests a session and loads the Messenger SDK.
- `.env` — local secrets (gitignored). Never commit real tokens.

## Note on the Platform API

This repo's SDK docs (`js/cdn/docs`) cover client-side Messenger integration but not the server-side user-management API. Delight AI is built on Sendbird's Chat platform, and its Platform API (`api-{appId}.app.delight.ai`) follows the same conventions as Sendbird's Chat Platform API: `Api-Token` header, `/v3/users` endpoints. If your dashboard's API reference differs, adjust `server.js` accordingly.
