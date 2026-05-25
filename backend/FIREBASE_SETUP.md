# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Get Started" or "Create project"
3. Name it: `tower-game`
4. Accept terms, enable Google Analytics (optional)
5. Wait for project creation (1-2 minutes)

## Step 2: Enable Services

In Firebase Console:
1. **Firestore Database**: Build > Firestore Database > Create Database
   - Start in test mode (for development)
   - Location: us-central1 (or closest to your region)

2. **Authentication**: Build > Authentication > Get Started
   - Enable: Email/Password
   - (Later: Google Sign-In for social login)

3. **Cloud Functions**: Build > Cloud Functions > Create function
   - This will be auto-deployed from CLI

## Step 3: Get Firebase Credentials

1. Go to Project Settings (gear icon, top left)
2. Service Accounts tab
3. Click "Generate new private key"
   - Saves a JSON file locally (keep this safe!)
4. Also get Web App credentials:
   - Go to Project Overview > Add App > Web
   - Copy the config object

## Step 4: Local Setup

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Navigate to backend folder
cd backend

# Initialize Firebase in this directory
firebase init

# Select:
# - Firestore
# - Cloud Functions
# - Hosting (optional)
# Use existing project: tower-game
```

## Step 5: Install Dependencies

```bash
cd backend
npm install
```

## Step 6: Test Locally

```bash
# Start emulators
firebase emulators:start

# This runs locally at:
# Firestore: http://localhost:8080
# Functions: http://localhost:5001
# Hosting: http://localhost:5000
# Emulator UI: http://localhost:4000
```

In another terminal, test the API:

```bash
# Get a test user token (from Emulator UI at localhost:4000)
# Then test sync endpoint:

curl -X POST http://localhost:5001/us-central1/syncSave \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gameState":{"score":100,"level":5}}'
```

## Step 7: Deploy to Firebase

```bash
# From backend/ folder:
firebase deploy

# This deploys:
# - Cloud Functions (production URL)
# - Firestore rules and indexes
```

After deploy, your functions are live at:
- `https://us-central1-tower-game.cloudfunctions.net/syncSave`
- `https://us-central1-tower-game.cloudfunctions.net/refreshSave`
- etc.

## Step 8: Update Frontend

In `js/save.js` and `js/tournament.js`, update API endpoints:

```javascript
// OLD (local)
const API = 'http://localhost:5001/us-central1';

// NEW (production)
const API = 'https://us-central1-tower-game.cloudfunctions.net';
```

## Step 9: Add Firebase Config to Frontend

In `index.html` or `main.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  projectId: "tower-game",
  authDomain: "tower-game.firebaseapp.com",
  databaseURL: "https://tower-game.firebaseio.com",
  storageBucket: "tower-game.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
```

## Troubleshooting

**Functions not deploying?**
- Check Node version: `node --version` (should be 18+)
- Check `firebase.json` is in backend/ folder
- Run `firebase deploy --verbose` for detailed logs

**Firestore rules denying requests?**
- Check authentication token is valid
- Verify rules match user's uid
- Test in Emulator first

**CORS errors?**
- Update `cors` origin in `firebase-config.js`
- Add your frontend URL to `CORS_ORIGIN` in `.env`

**Can't login locally?**
- Use Emulator UI (localhost:4000)
- Create test user in Authentication section
- Get token from Emulator auth tab

## Next Steps

1. Update `js/save.js` to call `syncSave()` Cloud Function
2. Update `js/tournament.js` to call tournament endpoints
3. Update `js/ui.js` to add login modal
4. Update `main.js` to initialize Firebase and check auth
5. Test end-to-end (local saves → cloud → reload app)
