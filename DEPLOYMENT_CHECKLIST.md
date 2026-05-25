# Deployment Checklist - Build to Live

## Where You'll See It

**Development (Local Testing)**
- Frontend: `http://localhost:5000` (Firebase emulator UI)
- API: `http://localhost:5001/us-central1`
- Firestore: `http://localhost:8080`
- Emulator Dashboard: `http://localhost:4000`

**Production (Live)**
- Frontend: `https://tower-game-3k2.pages.dev/` (existing Cloudflare Pages)
- API: `https://us-central1-tower-game.cloudfunctions.net/syncSave` (Firebase)
- Database: `Firestore` (cloud)
- Mobile: App Store + Google Play (after Capacitor build)

---

## Phase 1: Firebase Project Setup (15 minutes)

### Step 1: Create Firebase Project
- [ ] Go to https://firebase.google.com/
- [ ] Click "Get Started"
- [ ] Name: `tower-game`
- [ ] Continue through setup
- [ ] Wait for project creation (2 min)

### Step 2: Enable Required Services
In Firebase Console, go to "Build" and enable:
- [ ] Firestore Database (test mode, us-central1)
- [ ] Authentication (Email/Password)
- [ ] Cloud Functions (will auto-enable on deploy)

### Step 3: Get Your Credentials
- [ ] Project Settings (gear icon top left)
- [ ] Service Accounts tab > Generate new private key
  - Save as `tower-game-key.json` (keep private!)
- [ ] Web App tab > Copy config object
  - Save the config for frontend

---

## Phase 2: Install & Deploy Backend (10 minutes)

### Step 4: Install Firebase CLI

```bash
# Global install
npm install -g firebase-tools

# Verify
firebase --version
```

### Step 5: Authenticate Firebase CLI

```bash
# Login to your Firebase account
firebase login

# Select "tower-game" project when prompted
firebase use --add
# Choose: tower-game
# Alias: default (or whatever you prefer)
```

### Step 6: Install Backend Dependencies

```bash
cd "Tower Mobile App Game/backend"
npm install
```

### Step 7: Deploy to Firebase

```bash
# From backend/ folder
firebase deploy

# Wait for deployment (2-3 minutes)
# You'll see:
# ✔ functions[syncSave] deployed
# ✔ functions[refreshSave] deployed
# ✔ functions[getLeaderboard] deployed
# ✔ functions[submitTournament] deployed
# ✔ functions[processIAP] deployed
# ✔ functions[processTournamentRound] deployed

# Note your function URL:
# https://us-central1-tower-game.cloudfunctions.net/[FUNCTION_NAME]
```

---

## Phase 3: Test Locally (15 minutes)

### Step 8: Run Firebase Emulator

```bash
# From backend/ folder
firebase emulators:start

# You should see:
# ✔  Firestore Emulator UI > http://localhost:4000
# ✔  Firestore Emulator > http://localhost:8080
# ✔  Cloud Functions Emulator > http://localhost:5001
```

Keep this terminal running in background.

### Step 9: Test API Endpoints

In a new terminal:

```bash
# Test syncSave (need a test user first)
# 1. Go to http://localhost:4000
# 2. Click Authentication
# 3. Create test user: test@example.com / password123
# 4. Copy the auth token

# Then test the API:
curl -X POST http://localhost:5001/us-central1/syncSave \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"gameState":{"score":100,"level":5,"towers":[]}}'

# Should return:
# {"saveId":"abc123","lastSyncAt":"2026-05-24T..."}
```

---

## Phase 4: Wire Frontend to Backend (20 minutes)

### Step 10: Update Frontend Configuration

Edit `index.html` - add before `</body>`:

```html
<script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js"></script>
```

### Step 11: Update main.js

At the top of `js/main.js`, add Firebase init (copy from FRONTEND_INTEGRATION.md section 2):

```javascript
// Firebase Configuration
const firebaseConfig = {
  apiKey: "FROM_STEP3",
  projectId: "tower-game",
  authDomain: "tower-game.firebaseapp.com",
  databaseURL: "https://tower-game.firebaseio.com",
  storageBucket: "tower-game.appspot.com",
  messagingSenderId: "FROM_STEP3",
  appId: "FROM_STEP3"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// For local testing:
const API_URL = 'http://localhost:5001/us-central1';
// For production:
// const API_URL = 'https://us-central1-tower-game.cloudfunctions.net';

// ... rest of init code ...
```

### Step 12: Update js/save.js

Replace entire file with cloud sync code (from FRONTEND_INTEGRATION.md section 4).

### Step 13: Update js/ui.js

Add login modal code (from FRONTEND_INTEGRATION.md section 3).

### Step 14: Update js/tournament.js

Add cloud leaderboard functions (from FRONTEND_INTEGRATION.md section 5).

---

## Phase 5: Test Game Live (30 minutes)

### Step 15: Start Game in Browser

- [ ] Open `file:///C:/Users/admin/OneDrive%20-%20Atlas%20Home%20Services/Tower%20Mobile%20App%20Game/index.html`
- [ ] Or use a local server: `python -m http.server 8000` from game folder

### Step 16: Test Login Flow

- [ ] Click on settings/profile (should show login modal)
- [ ] Create account with email/password
- [ ] Game loads
- [ ] Should show "No cloud save found" in console
- [ ] Play one wave
- [ ] Check Firestore (localhost:4000) > Firestore > Collections > player_saves > should have data

### Step 17: Test Cloud Save

- [ ] Play game, complete a wave
- [ ] Check console: "Saved to cloud: [saveId]"
- [ ] Refresh page
- [ ] Check console: "Loaded from cloud: [saveId]"
- [ ] Game state restored ✓

### Step 18: Test Tournament

- [ ] In tournament screen, click "Join Tournament"
- [ ] Check Firestore: tournament_brackets collection should have entry
- [ ] Leaderboard should update with your name

### Step 19: Test on Cloudflare Pages

- [ ] Deploy frontend to https://tower-game-3k2.pages.dev/
- [ ] Update API_URL to production:
  ```javascript
  const API_URL = 'https://us-central1-tower-game.cloudfunctions.net';
  ```
- [ ] Test cloud save/load from live domain
- [ ] Test login from live domain

---

## Phase 6: Prepare Mobile Build (30 minutes)

### Step 20: Set Up Capacitor

```bash
# From game root folder
npm install @capacitor/core @capacitor/cli
npx cap init tower-game com.tower.game

# Add iOS and Android
npx cap add ios
npx cap add android
```

### Step 21: Build Web App for Capacitor

```bash
# Capacitor wraps the existing web app
# Just ensure index.html points to production API:
# const API_URL = 'https://us-central1-tower-game.cloudfunctions.net';

# Copy web files to Capacitor
npx cap sync
```

### Step 22: Build for iOS

```bash
npx cap open ios
# Xcode opens
# Click Play to build/test on simulator
```

### Step 23: Build for Android

```bash
npx cap open android
# Android Studio opens
# Click Play to build/test on emulator
```

---

## Checklist Summary

### Backend
- [ ] Firebase project created
- [ ] Services enabled (Firestore, Auth, Functions)
- [ ] CLI authenticated
- [ ] Dependencies installed
- [ ] Backend deployed to Firebase
- [ ] API endpoints accessible

### Frontend
- [ ] Firebase SDK added to HTML
- [ ] main.js initialized with Firebase config
- [ ] save.js using cloud sync
- [ ] ui.js has login modal
- [ ] tournament.js uses cloud leaderboard
- [ ] API_URL correctly pointing to Firebase

### Testing
- [ ] Login/signup works
- [ ] Game saves to cloud
- [ ] Game loads from cloud
- [ ] Tournament join works
- [ ] Leaderboard displays
- [ ] Works offline (fallback to local)
- [ ] Runs on web at Cloudflare
- [ ] Runs on iOS simulator
- [ ] Runs on Android emulator

### Ready to Ship
- [ ] iOS build uploaded to App Store
- [ ] Android build uploaded to Google Play
- [ ] Privacy policy & ToS live
- [ ] IAP working (RevenueCat wired)
- [ ] Analytics working (Firebase Analytics)
- [ ] Push notifications working (FCM)
- [ ] Crash reporting working (Sentry)

---

## Troubleshooting

**Firebase deploy fails?**
```bash
firebase deploy --verbose
# Check: Node 18+, firebase.json exists, authenticated
```

**API returning 401?**
- Check token is valid in Emulator UI
- Check Firestore rules allow your uid
- Test with curl first

**Frontend won't load Firebase?**
- Check Firebase SDK script tags are in index.html
- Check config object has correct projectId
- Check firebaseapp.com project exists

**Game state not saving?**
- Check console for errors
- Check Network tab > API calls
- Check Firestore security rules
- Verify user is authenticated

---

**Expected Time: ~2 hours total**

Start with Phase 1. I'll provide support as you go.
