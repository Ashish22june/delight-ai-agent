const statusEl = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const configAppIdEl = document.getElementById('config-app-id');
const configAgentIdEl = document.getElementById('config-agent-id');

let messenger = null;
let currentStudentId = null;
let cachedConfig = null;

function setStatus(text) {
  statusEl.textContent = text;
}

// Show which App ID / Agent ID this page is wired to, so testers can
// confirm at a glance which Delight environment they're hitting.
async function displayAgentConfig() {
  try {
    const configRes = await fetch('/api/config');
    cachedConfig = await configRes.json();
    configAppIdEl.textContent = cachedConfig.appId || '(not set)';
    configAgentIdEl.textContent = cachedConfig.aiAgentId || '(not set)';
  } catch (err) {
    configAppIdEl.textContent = 'Error loading';
    configAgentIdEl.textContent = 'Error loading';
    console.error('Failed to load agent config:', err);
  }
}

displayAgentConfig();

// Asks our backend to ensure the student account exists in Delight and
// returns a fresh session token for it. The Master API token never leaves
// the server.
async function fetchSession(studentId, nickname) {
  const res = await fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, nickname }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Session request failed (${res.status})`);
  }

  return res.json();
}

async function startChat() {
  const studentId = document.getElementById('studentId').value.trim();
  const nickname = document.getElementById('nickname').value.trim();

  if (!studentId) {
    setStatus('Please enter a student ID.');
    return;
  }

  currentStudentId = studentId;
  startBtn.disabled = true;

  try {
    setStatus('Checking student account...');
    const session = await fetchSession(studentId, nickname);
    setStatus(session.created ? 'Student account created. Loading agent...' : 'Student found. Loading agent...');

    if (!cachedConfig) await displayAgentConfig();
    const { appId, aiAgentId } = cachedConfig;

    if (!messenger) {
      const { loadMessenger } = await import('https://aiagent.delight.ai/orgs/default/index.js');
      messenger = await loadMessenger();

      await messenger.initialize({
        appId,
        aiAgentId,
        userSessionInfo: new messenger.ManualSessionInfo({
          userId: session.userId,
          authToken: session.authToken,
          sessionHandler: {
            onSessionTokenRequired: async (resolve, reject) => {
              try {
                const refreshed = await fetchSession(currentStudentId, nickname);
                resolve(refreshed.authToken);
              } catch (err) {
                reject(err);
              }
            },
            onSessionClosed: () => setStatus('Session closed.'),
            onSessionError: (err) => setStatus(`Session error: ${err}`),
            onSessionRefreshed: () => console.log('Session refreshed'),
          },
        }),
      });
    } else {
      messenger.updateUserSession(
        new messenger.ManualSessionInfo({
          userId: session.userId,
          authToken: session.authToken,
          sessionHandler: {
            onSessionTokenRequired: async (resolve, reject) => {
              try {
                const refreshed = await fetchSession(currentStudentId, nickname);
                resolve(refreshed.authToken);
              } catch (err) {
                reject(err);
              }
            },
            onSessionClosed: () => setStatus('Session closed.'),
            onSessionError: (err) => setStatus(`Session error: ${err}`),
            onSessionRefreshed: () => console.log('Session refreshed'),
          },
        }),
      );
    }

    messenger.open();
    setStatus(`Chatting as ${session.userId}.`);
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
  } finally {
    startBtn.disabled = false;
  }
}

startBtn.addEventListener('click', startChat);
