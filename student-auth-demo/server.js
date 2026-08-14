require('dotenv').config();
const express = require('express');
const path = require('path');

const {
  DELIGHT_API_URL,
  DELIGHT_MASTER_API_TOKEN,
  DELIGHT_APP_ID,
  DELIGHT_AGENT_ID,
  PORT = 3000,
} = process.env;

if (!DELIGHT_API_URL || !DELIGHT_MASTER_API_TOKEN) {
  console.error('Missing DELIGHT_API_URL or DELIGHT_MASTER_API_TOKEN in .env');
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Public config the frontend needs to load the messenger (no secrets here).
app.get('/api/config', (req, res) => {
  res.json({ appId: DELIGHT_APP_ID, aiAgentId: DELIGHT_AGENT_ID });
});

function delightHeaders() {
  return {
    'Api-Token': DELIGHT_MASTER_API_TOKEN,
    'Content-Type': 'application/json; charset=utf8',
  };
}

const USER_NOT_FOUND_CODE = 400201;

async function findUser(userId) {
  const res = await fetch(`${DELIGHT_API_URL}/v3/users/${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: delightHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (body.code === USER_NOT_FOUND_CODE) return null;
    throw new Error(`Failed to look up user (${res.status}): ${JSON.stringify(body)}`);
  }
  return res.json();
}

async function createUser(userId, nickname) {
  const res = await fetch(`${DELIGHT_API_URL}/v3/users`, {
    method: 'POST',
    headers: delightHeaders(),
    body: JSON.stringify({
      user_id: userId,
      nickname: nickname || userId,
      profile_url: '',
      issue_access_token: true,
    }),
  });
  if (!res.ok) throw new Error(`Failed to create user (${res.status}): ${await res.text()}`);
  return res.json();
}

async function issueSessionToken(userId) {
  const res = await fetch(`${DELIGHT_API_URL}/v3/users/${encodeURIComponent(userId)}/token`, {
    method: 'POST',
    headers: delightHeaders(),
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`Failed to issue session token (${res.status}): ${await res.text()}`);
  return res.json();
}

// Ensures a student account exists in Delight, then returns a session token
// the frontend can hand to the Messenger SDK (ManualSessionInfo).
app.post('/api/session', async (req, res) => {
  const { studentId, nickname } = req.body || {};

  if (!studentId || typeof studentId !== 'string') {
    return res.status(400).json({ error: 'studentId is required' });
  }

  try {
    const existingUser = await findUser(studentId);

    let authToken;
    let created = false;

    if (!existingUser) {
      const newUser = await createUser(studentId, nickname);
      authToken = newUser.access_token;
      created = true;
    } else {
      const tokenResponse = await issueSessionToken(studentId);
      authToken = tokenResponse.token || tokenResponse.access_token;
    }

    res.json({ userId: studentId, authToken, created });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Student auth demo running at http://localhost:${PORT}`);
});
