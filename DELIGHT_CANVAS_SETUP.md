# Delight AI Canvas Integration Setup

## Overview
This document provides setup instructions for the Canvas team to complete the Delight AI 2.0 integration (replacing deprecated Avaamo 1.0).

## What's Included

- **global_canvas_prod.js** — Updated Canvas LMS script with Delight messenger integration

## Canvas Backend Implementation Required

### 1. Create Delight Session Endpoint

Implement a new Canvas API endpoint:

```
POST /api/v1/delight/session
```

**Request Body:**
```json
{
  "canvas_id": "12345",
  "login_id": "student@example.com",
  "student_id": "67890",
  "first_name": "John",
  "last_name": "Doe",
  "primary_email": "john.doe@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "session_token": "eyJ...",
  "user_id": "u_abc123",
  "message": "Session created"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Failed to create session"
}
```

### 2. Store Delight Credentials Securely

Add these environment variables to your Canvas deployment:

```
DELIGHT_APP_ID=56A1A6C7-7DAC-4B48-8756-D53A77125F71
DELIGHT_AGENT_ID=2df75d5c-ed47-4515-a61a-1668e72e2322
DELIGHT_API_URL=https://api-56A1A6C7-7DAC-4B48-8756-D53A77125F71.app.delight.ai
DELIGHT_API_TOKEN=9b6c396505c62e6022c8c909b1bb05f1cf6b1fad
```

### 3. Implement Backend Logic

Your endpoint should:

1. Accept user data from Canvas frontend
2. Call Delight API securely (using `DELIGHT_API_TOKEN` from environment):
   ```
   POST https://api-56A1A6C7-7DAC-4B48-8756-D53A77125F71.app.delight.ai/delight/users/create
   ```
3. Pass Authorization header: `Authorization: Bearer {DELIGHT_API_TOKEN}`
4. Return session token to client

**Example (Node.js/Express):**
```javascript
app.post('/api/v1/delight/session', async (req, res) => {
  try {
    const delightResponse = await fetch(
      `${process.env.DELIGHT_API_URL}/delight/users/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DELIGHT_API_TOKEN}`
        },
        body: JSON.stringify(req.body)
      }
    );

    const result = await delightResponse.json();
    res.json({
      success: result.success,
      session_token: result.session_token,
      user_id: result.user_id,
      message: result.message || 'Session created'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

## Deployment Checklist

- [ ] Implement `/api/v1/delight/session` endpoint
- [ ] Store Delight credentials in environment variables (NOT in code)
- [ ] Test endpoint with sample user data
- [ ] Deploy global_canvas_prod.js to Canvas theme
- [ ] Verify launcher appears in Canvas header (before Help icon)
- [ ] Test full flow: Login → See AI Assistant launcher → Open chat
- [ ] Verify console logs show successful initialization
- [ ] Monitor Delight analytics dashboard for session activity

## Testing

### Manual Test Steps

1. **Load Canvas** and inspect browser console
2. **Expected logs:**
   - "Canvas user profile fetched for Delight initialization"
   - "Creating Delight user session via Canvas backend"
   - "Delight session created successfully"
   - "Delight SDK script loaded"
   - "Delight SDK initialized successfully"
   - "Delight launcher created successfully"

3. **Click "AI Assistant"** in Canvas header → Chat window opens
4. **Verify analytics** in Delight dashboard shows Canvas platform sessions

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Launcher doesn't appear | Check Canvas API returns user profile; verify DOM ready |
| "Session creation failed" | Verify `/api/v1/delight/session` endpoint is deployed and responding |
| "Delight SDK not loaded" | Check CDN script loads from `https://aiagent.delight.ai/orgs/default/index.js` |
| Chat doesn't open | Verify `window.DelightAI.openChat()` is available after SDK init |

