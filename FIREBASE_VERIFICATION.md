# Firebase Configuration Verification

**Last verified: 2026-05-24**

## Firebase Project Details

| Field | Value |
|-------|-------|
| Project ID | core-surge---tower-defense |
| Sender ID | 807853948092 |
| Service Account Email | firebase-adminsdk-fbsvc@core-surge---tower-defense.iam.gserviceaccount.com |
| Private Key ID | e2e9830cd4... |

## File-by-File Consistency Check

### backend/firebase-config.js
- **Status:** CONSISTENT
- Uses Firebase Admin SDK (`firebase-admin` package)
- Calls `admin.initializeApp()` (auto-reads from service account in deployed env)
- References `admin.firestore()` and `admin.auth()`
- Project ID inherited from environment/service account JSON
- Implements Cloud Functions: syncSave, loadSave, tournament endpoints

### backend/firebase.json
- **Status:** CONSISTENT
- Functions runtime: nodejs18
- Hosting public directory: `../dist`
- Firestore rules file: `firestore.rules`
- Firestore indexes file: `firestore.indexes.json`
- Emulator ports: Firestore 8080, Functions 5001, Hosting 5000, UI 4000

### backend/firestore.rules
- **Status:** CONSISTENT
- Collections secured:
  - `users/{userId}` - owner read/write only
  - `player_saves/{userId}/saves/{saveId}` - owner read/write only
  - `tournament_brackets/{tournamentId}` - public read, admin write
  - `iap_transactions/{transactionId}` - owner read, admin write
- Default deny-all rule at bottom

### backend/firestore.indexes.json
- **Status:** CONSISTENT
- Index 1: `saves` collection - userId ASC + lastSyncAt DESC
- Index 2: `tournament_brackets` collection - roundEnds ASC + status ASC
- Field override: `saves.lastSyncAt` ASC+DESC

### js/cloud.js
- **Status:** BLOCKING - MISSING CREDENTIALS
- authDomain: `core-surge---tower-defense.firebaseapp.com` (correct)
- projectId: `core-surge---tower-defense` (correct)
- databaseURL: `https://core-surge---tower-defense.firebaseio.com` (correct)
- storageBucket: `core-surge---tower-defense.appspot.com` (correct)
- **apiKey: '' (EMPTY)** - BLOCKS ALL AUTH
- **appId: '' (EMPTY)** - BLOCKS FIREBASE SDK INIT
- **messagingSenderId: '' (EMPTY)** - BLOCKS PUSH NOTIFICATIONS
- Config storage key: `core_surge_firebase_web_config_v1`
- Has fallback: users can paste config in Settings panel at runtime

### capacitor.config.json
- **Status:** OK (not Firebase-related)
- appId: `com.mcrdminted.coresurge` (Capacitor/native app identifier)
- This is NOT a Firebase app ID - it is the reverse-domain bundle identifier for iOS/Android

## Blocking Issues

### CRITICAL: Firebase Web App Not Created
The Firebase project exists in the console, but no Web App has been registered under it. This means:
1. No apiKey has been generated
2. No appId has been assigned
3. The frontend SDK cannot initialize
4. Auth (sign-up, sign-in, anonymous) is impossible
5. Firestore reads/writes from the client are impossible
6. Cloud save sync is impossible

### Resolution Steps
1. Go to Firebase Console > Project Settings > General > Your Apps
2. Click "Add App" > Web (</> icon)
3. Register app name: "Core Surge Web"
4. Copy the generated config object (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
5. Paste values into js/cloud.js CLOUD_DEFAULT_CONFIG
6. Rebuild and deploy

### What Works Without Web Credentials
- Local gameplay (100% functional)
- All offline features (battle, research, cards, skins, settings)
- Local save/load via localStorage
- Backend Cloud Functions code (ready to deploy, just needs `firebase deploy`)

### What Is Blocked
- User authentication (email/password, Google, anonymous)
- Cloud save sync
- Tournament leaderboard submission
- IAP receipt validation via server
- Push notifications
- Any feature requiring `firebase.initializeApp()` on the client
