# Canvas LMS - Delight AI Integration Implementation Guide

## 📋 Overview

This guide provides step-by-step instructions to integrate Delight AI 2.0 messenger into Canvas LMS, replacing the deprecated Avaamo 1.0 chatbot.

**Integration Type:** Messenger-based AI assistant for student support  
**Supported Users:** Canvas students (authenticated) + guests (anonymous)  
**Analytics:** Platform-specific tracking (Canvas vs other platforms)

---

## 📦 Files Required

| File | Purpose | Location |
|------|---------|----------|
| `global_canvas_prod.js` | Main Canvas LMS integration script | Deploy to Canvas theme |
| `DELIGHT_CANVAS_SETUP.md` | Detailed setup reference | Internal documentation |
| `API_VERIFICATION_GUIDE.md` | Testing procedures | Internal documentation |

---

## 🚀 Quick Implementation (5 Steps)

### Step 1: Deploy the Integration Script

**File:** `global_canvas_prod.js`

```bash
# Copy to Canvas theme directory
Canvas Admin → Appearance → Themes → Custom JavaScript/CSS
# Paste entire content of global_canvas_prod.js into Custom JavaScript
```

**OR** 

```bash
# If using theme files in your Canvas deployment
cp global_canvas_prod.js /path/to/canvas/themes/[theme-name]/
```

---

### Step 2: Update Canvas Configuration

**In your Canvas installation:**

```javascript
// These values are already configured in the script
CONFIG = {
  appId: '56A1A6C7-7DAC-4B48-8756-D53A77125F71',
  agentId: '2df75d5c-ed47-4515-a61a-1668e72e2322',
  autoInitialize: true
}
```

✅ **No changes needed** - Values are pre-configured

---

### Step 3: Verify in Canvas Environment

**Test in Canvas (any course):**

1. Log in as a Canvas student
2. Look for **"AI Assistant"** button in top header (before Help icon)
3. Click button → Delight messenger opens
4. Open browser console (F12) and look for:
   ```
   ✓ Delight initialization started
   ✓ Messenger library loaded
   ✓ Delight SDK initialized successfully
   ✓ Delight launcher created successfully
   ```

---

### Step 4: Test Both User Types

**Test 1: Authenticated Student**
```
✓ Log in with Canvas student credentials
✓ AI Assistant button appears
✓ Messenger loads with student context
✓ Student ID visible in Delight backend
```

**Test 2: Anonymous Guest**
```
✓ Access Canvas without authentication
✓ AI Assistant button appears
✓ Messenger loads with anonymous session
✓ Guest can see limited features (public FAQs, support only)
```

---

### Step 5: Monitor & Support

**Browser Console (F12 → Console):**
- ✅ Should show initialization logs
- ✅ No error messages
- ✅ Check for "Delight initialized successfully"

**Delight Backend:**
- Log in to Delight dashboard
- View analytics → Filter by platform: "canvas"
- Monitor student sessions and usage

---

## 📊 What Gets Integrated

### Canvas Header Integration
```
┌─────────────────────────────────────────┐
│ Canvas Logo  |  Help  |  [AI Assistant] │  ← New button here
└─────────────────────────────────────────┘
```

### User Data Sent to Delight
```json
{
  "student_id": "12345",
  "canvas_id": "67890",
  "login_id": "student@chamberlain.instructure.com",
  "first_name": "John",
  "last_name": "Doe",
  "primary_email": "john@example.com",
  "platformId": "canvas"  // For analytics filtering
}
```

---

## ✅ Verification Checklist

- [ ] `global_canvas_prod.js` deployed to Canvas theme
- [ ] Script loads without errors in browser console
- [ ] "AI Assistant" button appears in Canvas header
- [ ] Button positioned before Help icon
- [ ] Student can click and open messenger
- [ ] Anonymous users can access messenger
- [ ] Both student and anonymous sessions work
- [ ] Delight dashboard shows Canvas platform sessions
- [ ] No console errors on page load
- [ ] Launcher styling matches Canvas design

---

## 🔧 Technical Details

### What the Script Does

1. **Loads Delight SDK** from CDN: `https://aiagent.delight.ai/orgs/default/index.js`
2. **Detects user type** (student or anonymous)
3. **Creates session** with Canvas user data
4. **Initializes messenger** with student/guest context
5. **Injects launcher** into Canvas header
6. **Handles errors** gracefully with console logging

### No Backend Changes Required
- ✅ Script is self-contained
- ✅ No additional Canvas API endpoints needed
- ✅ No database changes needed
- ✅ Works with existing Canvas infrastructure

---

## 🐛 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Button doesn't appear | Script not loaded | Check browser console for errors, reload page |
| "Messenger not loading" | SDK CDN unreachable | Check internet, verify CDN accessibility |
| No student data | Canvas API not responding | Verify `/api/v1/users/self/profile` endpoint accessible |
| Console errors | Configuration issue | Check AppID and AgentID are correct |
| Anonymous session fails | Backend issue | Check Delight service status |

**Debug Mode:**
Open browser console and run:
```javascript
console.log(window.DelightIntegration);  // Should show methods available
console.log(window.DelightAI);            // Should show SDK loaded
```

---

## 📞 Support Resources

**For Canvas Team:**
- Check `API_VERIFICATION_GUIDE.md` for detailed testing
- Review `DELIGHT_CANVAS_SETUP.md` for configuration details
- Open browser console (F12) for detailed error messages

**For Delight Support:**
- Delight Dashboard: https://app.delight.ai
- API Status: Check Delight backend availability
- Analytics: Monitor Canvas platform conversations

---

## 🎯 Expected Behavior

### On Page Load
```
[✓] Canvas user profile fetched
[✓] Delight SDK script loaded
[✓] Messenger initialized with user context
[✓] Launcher created and visible
[✓] Ready for user interaction
```

### Student Interaction
```
1. Click "AI Assistant" button
2. Messenger window opens
3. Student can type questions
4. AI responds with help
5. Conversation recorded in Delight
6. Analytics tracked with student_id + canvas_id
```

### Anonymous Interaction
```
1. Access Canvas without login
2. "AI Assistant" button available
3. Click to open messenger
4. Limited features available (FAQs, support only)
5. No personal data shared
6. Session tracked as anonymous
```

---

## ✨ What's Included

✅ **Avaamo Removal:** All deprecated Avaamo code removed  
✅ **Delight Integration:** Complete Delight AI 2.0 setup  
✅ **Context Data:** Student identification for personalization  
✅ **Analytics:** Platform tracking for Canvas conversations  
✅ **Error Handling:** Graceful fallback and logging  
✅ **Security:** No exposed API credentials in client code  

---

## 🔐 Security Notes

- ✅ **No credentials exposed** in client-side code
- ✅ **SDK-based authentication** (Delight handles internally)
- ✅ **Canvas session-based** (uses existing Canvas authentication)
- ✅ **HTTPS only** (all connections encrypted)
- ✅ **User data encrypted** in transit to Delight

---

## 📈 Next Steps After Deployment

1. **Monitor Console:** Check for errors in first 24 hours
2. **Track Analytics:** View Delight dashboard for Canvas conversations
3. **Gather Feedback:** Collect student/staff feedback
4. **Optimize:** Adjust features based on usage patterns
5. **Scale:** Roll out to all Canvas instances if successful

---

## 📞 Questions?

**If integration fails:**
1. Check `API_VERIFICATION_GUIDE.md` for testing steps
2. Open browser console (F12) and note error messages
3. Verify Delight credentials are current
4. Contact Delight support with console logs

**Expected time for full deployment:** 15-30 minutes

---

**Status:** Ready for Canvas Production Deployment ✅
