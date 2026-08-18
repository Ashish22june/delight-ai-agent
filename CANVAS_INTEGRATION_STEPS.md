# Canvas Integration Steps for Delight Messenger

**Document Version:** 1.0  
**Date:** August 18, 2026  
**Status:** Ready for Canvas Development Team

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Step-by-Step Integration](#step-by-step-integration)
4. [Backend Setup](#backend-setup)
5. [Frontend Configuration](#frontend-configuration)
6. [Testing Guide](#testing-guide)
7. [Deployment Checklist](#deployment-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, ensure you have:

- ✅ Access to Delight AI Agent Dashboard
- ✅ Canvas LMS platform (production or development environment)
- ✅ Node.js/npm (for backend API)
- ✅ Backend development environment (Express, FastAPI, Django, etc.)
- ✅ Database access (for session management)
- ✅ Git repository for version control
- ✅ HTTPS enabled on your Canvas domain (required for production)

---

## Quick Start

### 30-Second Overview
1. **Get the HTML file:** `delight-canvas-integration.html`
2. **Update configuration:** Replace `YOUR_APP_ID` and `YOUR_AGENT_ID`
3. **Create backend endpoint:** `POST /api/delight/users/anonymous`
4. **Embed in Canvas:** Add to your course or LMS
5. **Test both paths:** Authenticated student + anonymous guest

---

## Step-by-Step Integration

### Step 1: Obtain the HTML File

**Location:** Get `delight-canvas-integration.html` from your Delight integration package

**File includes:**
- Complete Delight messenger initialization code
- Authentication detection logic
- Error handling and logging
- Responsive UI
- No external dependencies (only Delight CDN)

**Action:**
```bash
# Download or copy the file to your Canvas assets directory
cp delight-canvas-integration.html /your-canvas/static/assets/
```

---

### Step 2: Get Delight Credentials

**From Delight Dashboard:**
1. Log in to [Delight AI Agent Dashboard](https://dashboard.delight.ai)
2. Navigate to **Settings** → **API Keys**
3. Copy your:
   - **App ID** (Format: `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`)
   - **AI Agent ID** (Format: `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`)

**Example Values:**
```
App ID:      F7879BE3-A59C-4134-A04A-702A1E62A9C0
AI Agent ID: 9ec48481-26d4-41b3-a3d7-68f20c0aeb1c
```

---

### Step 3: Update HTML Configuration

**File:** `delight-canvas-integration.html`

**Find this section:**
```javascript
const CONFIG = {
    appId: 'YOUR_APP_ID',           // ← CHANGE THIS
    aiAgentId: 'YOUR_AGENT_ID',     // ← CHANGE THIS
    autoInitialize: true
};
```

**Replace with your values:**
```javascript
const CONFIG = {
    appId: 'F7879BE3-A59C-4134-A04A-702A1E62A9C0',
    aiAgentId: '9ec48481-26d4-41b3-a3d7-68f20c0aeb1c',
    autoInitialize: true
};
```

**Save the file.**

---

### Step 4: Create Backend Endpoint

You need to create an API endpoint to handle anonymous user sessions.

#### 4a: Endpoint Requirements

**Endpoint Path:**
```
POST /api/delight/users/anonymous
```

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": "uuid-string-12345",
  "timestamp": "2026-08-18T12:00:00.000Z"
}
```

**Response (Success - 200):**
```json
{
  "sessionToken": "anonymous-token-abc123xyz",
  "userId": "anonymous-12345",
  "expiresIn": 3600,
  "message": "Anonymous session created"
}
```

**Response (Error - 400/500):**
```json
{
  "error": "Failed to create session",
  "message": "Database unavailable"
}
```

#### 4b: Implementation Examples

**Express.js (Node.js):**
```javascript
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(express.json());

// Anonymous session creation endpoint
app.post('/api/delight/users/anonymous', async (req, res) => {
    try {
        const { sessionId, timestamp } = req.body;

        // Validate request
        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId required' });
        }

        // Generate anonymous user ID
        const anonymousUserId = `anonymous-${uuidv4()}`;

        // Create session token (could use JWT or custom format)
        const sessionToken = `session-${uuidv4()}`;

        // Store in database (pseudo-code)
        await db.sessions.create({
            sessionToken,
            userId: anonymousUserId,
            userType: 'anonymous',
            sessionId,
            timestamp,
            expiresAt: new Date(Date.now() + 3600000), // 1 hour
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        // Return response
        res.json({
            sessionToken,
            userId: anonymousUserId,
            expiresIn: 3600,
            message: 'Anonymous session created'
        });

    } catch (error) {
        console.error('Error creating anonymous session:', error);
        res.status(500).json({
            error: 'Failed to create session',
            message: error.message
        });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

**Python (Flask):**
```python
from flask import Flask, request, jsonify
from uuid import uuid4
import json
from datetime import datetime, timedelta

app = Flask(__name__)

@app.route('/api/delight/users/anonymous', methods=['POST'])
def create_anonymous_session():
    try:
        data = request.get_json()
        session_id = data.get('sessionId')
        timestamp = data.get('timestamp')

        # Validate request
        if not session_id:
            return jsonify({'error': 'sessionId required'}), 400

        # Generate anonymous user ID
        anonymous_user_id = f'anonymous-{uuid4()}'
        session_token = f'session-{uuid4()}'

        # Store in database (pseudo-code)
        session_data = {
            'sessionToken': session_token,
            'userId': anonymous_user_id,
            'userType': 'anonymous',
            'sessionId': session_id,
            'timestamp': timestamp,
            'expiresAt': (datetime.now() + timedelta(hours=1)).isoformat(),
            'createdAt': datetime.now().isoformat()
        }
        # db.sessions.insert(session_data)

        return jsonify({
            'sessionToken': session_token,
            'userId': anonymous_user_id,
            'expiresIn': 3600,
            'message': 'Anonymous session created'
        }), 200

    except Exception as error:
        return jsonify({
            'error': 'Failed to create session',
            'message': str(error)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

**Django (Python):**
```python
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from uuid import uuid4
import json
from datetime import datetime, timedelta

@require_http_methods(["POST"])
def create_anonymous_session(request):
    try:
        data = json.loads(request.body)
        session_id = data.get('sessionId')
        timestamp = data.get('timestamp')

        # Validate request
        if not session_id:
            return JsonResponse({'error': 'sessionId required'}, status=400)

        # Generate IDs
        anonymous_user_id = f'anonymous-{uuid4()}'
        session_token = f'session-{uuid4()}'

        # Create session in database
        # from .models import Session
        # Session.objects.create(
        #     session_token=session_token,
        #     user_id=anonymous_user_id,
        #     user_type='anonymous',
        #     session_id=session_id,
        #     expires_at=datetime.now() + timedelta(hours=1)
        # )

        return JsonResponse({
            'sessionToken': session_token,
            'userId': anonymous_user_id,
            'expiresIn': 3600,
            'message': 'Anonymous session created'
        })

    except Exception as error:
        return JsonResponse({
            'error': 'Failed to create session',
            'message': str(error)
        }, status=500)
```

---

### Step 5: Embed in Canvas

Choose your embedding method based on your Canvas setup:

#### Option A: LTI Integration (Recommended)

**Create LTI Tool:**
1. Go to **Admin** → **Developer Keys**
2. Create new key
3. Add tool name: "Delight AI Messenger"
4. Set redirect URL: `https://your-domain.com/api/lti/launch`
5. Copy Client ID and Key

**Backend Handler (Node.js):**
```javascript
app.post('/api/lti/launch', (req, res) => {
    // Verify LTI signature
    // Extract student ID from request
    const studentId = req.body.user_id;
    const sessionToken = req.body.custom_session_token;

    // Create Canvas integration page with student data
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Delight Messenger</title>
            <script>
                window.CANVAS_STUDENT_ID = "${studentId}";
                window.DELIGHT_SESSION_TOKEN = "${sessionToken}";
            </script>
        </head>
        <body>
            <iframe src="/delight-canvas-integration.html" 
                    style="width:100%; height:100%; border:none;"></iframe>
        </body>
        </html>
    `);
});
```

#### Option B: Direct Embed in Course

**In Canvas Course HTML:**
```html
<!-- Add to your course page -->
<iframe 
    src="https://your-domain.com/delight-canvas-integration.html" 
    width="100%" 
    height="600" 
    frameborder="0"
    allow="camera; microphone"
    style="border-radius: 8px;">
</iframe>
```

#### Option C: Page Module

**Create Custom Canvas Page:**
1. Go to **Course** → **Pages**
2. Click **+ New Page**
3. Paste HTML:
```html
<div id="delight-messenger">
    <script src="/path/to/delight-canvas-integration.html"></script>
</div>
```

#### Option D: Custom Plugin/Module

If you have a custom Canvas plugin, add:
```javascript
// In your plugin initialization
const container = document.getElementById('delight-container');
const iframe = document.createElement('iframe');
iframe.src = '/delight-canvas-integration.html';
iframe.style.width = '100%';
iframe.style.height = '600px';
container.appendChild(iframe);
```

---

### Step 6: Provide Student Authentication Data

**For authenticated students, you must provide:**

**Method 1: Via JavaScript Variables**
```javascript
// Before page load, set these globally
window.CANVAS_STUDENT_ID = "student_12345";
window.DELIGHT_SESSION_TOKEN = "valid-auth-token";
```

**Method 2: Via Canvas API**
```javascript
// Use Canvas API to get current user
fetch('/api/v1/users/self', {
    headers: { 'Authorization': 'Bearer ' + CANVAS_TOKEN }
})
.then(r => r.json())
.then(user => {
    window.CANVAS_STUDENT_ID = user.id;
    window.DELIGHT_SESSION_TOKEN = generateSessionToken(user);
    // Load Delight iframe
});
```

**Method 3: Via LTI Parameters**
```javascript
// In LTI launch handler
const studentId = ltiParams.custom_canvas_user_id;
const sessionToken = await createSessionForStudent(studentId);

// Pass to HTML via query params or window variables
```

---

## Backend Setup

### Database Schema

**Sessions Table:**
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'anonymous') NOT NULL,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_session_token ON sessions(session_token);
CREATE INDEX idx_user_id ON sessions(user_id);
CREATE INDEX idx_expires_at ON sessions(expires_at);
```

### Middleware: Session Validation

**Node.js:**
```javascript
const validateSession = async (req, res, next) => {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'No session token' });
    }

    try {
        const session = await db.sessions.findOne({ sessionToken: token });
        
        if (!session) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        if (new Date(session.expiresAt) < new Date()) {
            return res.status(401).json({ error: 'Token expired' });
        }

        req.user = {
            id: session.userId,
            type: session.userType,
            sessionToken: token
        };
        
        next();
    } catch (error) {
        res.status(500).json({ error: 'Session validation failed' });
    }
};

app.use(validateSession);
```

---

## Frontend Configuration

### Canvas Environment Setup

**In your Canvas installation, add:**

```html
<!-- Add to Canvas theme header/footer -->
<script>
    // Auto-detect Canvas environment
    window.CANVAS_API_TOKEN = '{{ canvas_token }}';
    window.CANVAS_USER_ID = '{{ user.id }}';
    window.CANVAS_USER_TYPE = '{{ user.roles[0] }}'; // student, teacher, admin
    
    // If student, generate Delight session token
    if (window.CANVAS_USER_TYPE === 'student') {
        fetch('/api/delight/users/canvas-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                canvasUserId: window.CANVAS_USER_ID
            })
        })
        .then(r => r.json())
        .then(data => {
            window.CANVAS_STUDENT_ID = window.CANVAS_USER_ID;
            window.DELIGHT_SESSION_TOKEN = data.sessionToken;
        });
    }
</script>
```

### Feature Configuration (Optional)

**Customize features per user type:**

```javascript
// In your backend route
app.get('/api/delight/features/:userType', (req, res) => {
    const { userType } = req.params;
    
    const features = {
        student: {
            chat: true,
            history: true,
            documents: true,
            support: true,
            advisor: true,
            enrollment: true,
            financial: true
        },
        anonymous: {
            chat: true,
            history: false,
            documents: false,
            support: true,
            advisor: false,
            enrollment: false,
            financial: false
        }
    };
    
    res.json(features[userType] || features.anonymous);
});
```

---

## Testing Guide

### Test 1: Authenticated Student Path

**Setup:**
```javascript
window.CANVAS_STUDENT_ID = "S12345";
window.DELIGHT_SESSION_TOKEN = "valid-token-xyz";
```

**Expected Results:**
```
✓ Status shows: "Logged in as student. Full access to all features."
✓ Status color: Green (#4CAF50)
✓ Messenger initializes successfully
✓ All features available
✓ Console shows: "Delight initialized successfully for student user"
```

**Test Commands:**
```javascript
// In browser console
DelightIntegration.getUserType()        // Should return: "student"
DelightIntegration.getFeatures()        // Should return: full feature object
DelightIntegration.getMessenger()       // Should return messenger instance
```

---

### Test 2: Anonymous User Path

**Setup:**
```javascript
// Don't set CANVAS_STUDENT_ID or DELIGHT_SESSION_TOKEN
// Just load the page
```

**Expected Results:**
```
✓ Status shows: "Browsing as guest. Limited features available."
✓ Status color: Orange (#FF9800)
✓ Anonymous session created (check /api response)
✓ Limited features only
✓ Console shows: "Delight initialized successfully for anonymous user"
```

**Test Commands:**
```javascript
// In browser console
DelightIntegration.getUserType()        // Should return: "anonymous"
DelightIntegration.getFeatures()        // Should return: limited feature object
```

---

### Test 3: Messenger Functionality

**Test Chat:**
```
1. Click messenger launcher (bottom-right)
2. Type a message
3. Verify AI responds
4. Check message history
```

**Test Features:**
```
For students: All options visible in menu
For anonymous: Limited menu options
```

---

### Test 4: Error Handling

**Test Missing Config:**
```javascript
// Temporarily change appId
window.location.reload();

Expected: Error message displays gracefully
Console: Error logged with details
```

**Test Network Error:**
```
1. Disconnect network
2. Reload page

Expected: Error message shown
Console: Network error details
```

---

### Test 5: Responsive Design

```
✓ Mobile (360px): Fully responsive
✓ Tablet (768px): Proper layout
✓ Desktop (1920px): Optimized view
✓ Dark mode: Styles adjust
✓ Touch devices: All interactive
```

---

## Deployment Checklist

### Pre-Deployment ✓

- [ ] HTML file updated with real appId and aiAgentId
- [ ] Backend endpoint `/api/delight/users/anonymous` deployed
- [ ] Database schema created and tested
- [ ] Session validation middleware implemented
- [ ] HTTPS enabled on all domains
- [ ] CORS configured properly
- [ ] All tests passing (5 test scenarios above)
- [ ] Error messages reviewed and localized
- [ ] Performance tested (< 2s load time)
- [ ] Security audit completed
- [ ] Backup plan documented

### Deployment Steps

**1. Stage Environment (48 hours before production):**
```bash
# Deploy to stage
git push origin main:stage

# Run tests
npm test

# Monitor logs
tail -f logs/stage.log
```

**2. Production Deployment:**
```bash
# Merge to main
git merge stage
git push origin main

# Run pre-deployment checks
./scripts/pre-deploy.sh

# Deploy
./scripts/deploy.sh production

# Verify
curl https://your-domain.com/health
```

**3. Monitor Post-Deployment:**
```
- Check error rates (should be < 0.1%)
- Monitor session creation success rate (should be > 99%)
- Watch user feedback channels
- Verify Delight CDN accessibility
```

---

## Troubleshooting

### Issue 1: "Failed to initialize messenger"

**Cause:** Missing or invalid appId/aiAgentId

**Solution:**
```javascript
// Verify in browser console
console.log(CONFIG.appId);      // Should not contain "YOUR_"
console.log(CONFIG.aiAgentId);  // Should not contain "YOUR_"
```

**Fix:**
1. Get correct IDs from Delight Dashboard
2. Update HTML file
3. Reload page

---

### Issue 2: Anonymous session creation fails

**Cause:** Backend endpoint not accessible or not returning correct response

**Solution:**
```bash
# Test endpoint manually
curl -X POST http://localhost:3000/api/delight/users/anonymous \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","timestamp":"2026-08-18T12:00:00Z"}'

# Expected response:
# {"sessionToken":"session-xyz...","userId":"anonymous-...","expiresIn":3600}
```

**Fix:**
1. Verify endpoint is running
2. Check database connectivity
3. Review server logs
4. Ensure proper CORS headers

---

### Issue 3: Student authentication not working

**Cause:** Canvas variables not set before page load

**Solution:**
```javascript
// Verify in browser console before page fully loads
console.log(window.CANVAS_STUDENT_ID);      // Should have value
console.log(window.DELIGHT_SESSION_TOKEN);  // Should have value
```

**Fix:**
1. Ensure variables are set before iframe loads
2. Use window timing or event listeners
3. Check LTI parameter passing

---

### Issue 4: Messenger button not appearing

**Cause:** Delight CDN not loading or initialization failed

**Solution:**
```javascript
// Check network tab in DevTools
// Look for: https://aiagent.delight.ai/orgs/default/index.js
// Status should be 200 OK

// Check console for errors
window.DelightIntegration.getMessenger();  // Should not be null
```

**Fix:**
1. Verify internet connectivity
2. Check firewall/proxy rules
3. Confirm Delight CDN is accessible
4. Review browser console for JS errors

---

### Issue 5: CORS errors

**Cause:** Canvas domain not whitelisted for API calls

**Solution:**
```javascript
// In your backend, add CORS headers:
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://canvas.yourschool.edu');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
```

**Fix:**
1. Add Canvas domain to CORS whitelist
2. Configure proper headers
3. Test with preflight OPTIONS request

---

### Issue 6: Session expires too quickly

**Cause:** Token expiration time too short

**Solution:**
```javascript
// In your backend, adjust expiration:
expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours instead of 1
```

**Monitor:**
- Log session creation/expiration
- Track average session duration
- Adjust based on usage patterns

---

## Support & Escalation

**For Technical Issues:**
1. Check this guide's Troubleshooting section
2. Review server logs: `/var/log/canvas/delight.log`
3. Check browser DevTools Console (F12)
4. Contact Delight Support: support@delight.ai

**For Integration Help:**
1. Consult Canvas LMS documentation
2. Review code examples in Step 4b
3. Test endpoints with curl/Postman
4. Monitor deployment dashboards

---

## Quick Reference

### Files You Need
```
delight-canvas-integration.html     # Main integration file
CANVAS_INTEGRATION_STEPS.md          # This guide
DELIGHT_CANVAS_INTEGRATION_GUIDE.md # Technical reference
```

### Configuration Values to Update
```javascript
appId:     F7879BE3-A59C-4134-A04A-702A1E62A9C0
aiAgentId: 9ec48481-26d4-41b3-a3d7-68f20c0aeb1c
```

### Key Endpoint
```
POST /api/delight/users/anonymous
```

### Canvas Variables
```javascript
window.CANVAS_STUDENT_ID
window.DELIGHT_SESSION_TOKEN
```

### Testing Commands
```javascript
DelightIntegration.initialize()      // Start manually
DelightIntegration.getUserType()     // Check user type
DelightIntegration.getMessenger()    # Get instance
```

---

## Timeline

**Phase 1: Setup (Week 1)**
- [ ] Day 1-2: Get credentials, update HTML
- [ ] Day 3-4: Build backend endpoint
- [ ] Day 5: Integration testing

**Phase 2: Testing (Week 2)**
- [ ] Day 1-2: Run all 5 test scenarios
- [ ] Day 3-4: Security & performance review
- [ ] Day 5: Staging deployment

**Phase 3: Production (Week 3)**
- [ ] Day 1-2: Final checks & monitoring
- [ ] Day 3: Production deployment
- [ ] Day 4-5: User feedback & adjustments

---

## Final Checklist

Before declaring this integration complete:

- [ ] HTML file deployed with correct credentials
- [ ] Anonymous endpoint working (test with curl)
- [ ] Student authentication working
- [ ] Error handling tested
- [ ] Mobile/responsive tested
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Logging enabled
- [ ] Monitoring setup
- [ ] Documentation complete
- [ ] User feedback positive
- [ ] No critical errors in logs

---

**Document prepared for Canvas Development Team**  
**Questions? Contact your Delight integration specialist**
