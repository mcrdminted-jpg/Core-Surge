# Codex Backend Handoff

## Current State
Frontend (v0.7.22) is complete and live. Backend needs to be built and deployed.

## Architecture Decision: Firebase
Using Firebase for backend because:
- Industry standard for game development
- Built-in auth, real-time sync, serverless
- Auto-scales with player base
- No DevOps overhead

## What You're Building

### Firebase Firestore Collections
```
users/
  - uid (doc ID)
  - email, username
  - createdAt, lastLogin
  - premiumStatus, iapReceipts

player_saves/
  - userId/saveId (doc ID)
  - gameState (entire game JSON)
  - towers, enemies, waves
  - resources, level, score
  - lastSyncAt, cloudSyncedAt

tournament_brackets/
  - tournamentId (doc ID)
  - players[] array with ranking
  - roundEnds (timestamp)
  - leaderboard snapshot

iap_transactions/
  - transactionId (doc ID)
  - userId, productId
  - revenueCatId, amount, currency
  - status (completed, refunded, failed)
  - timestamp
```

### Cloud Functions to Build
1. **syncSave** (POST /api/save)
   - Auth: Firebase token
   - Body: gameState JSON
   - Return: saveId, lastSyncAt
   - Triggers: After every wave, end of level

2. **submitTournament** (POST /api/tournament/join)
   - Auth: Firebase token
   - Body: tournamentId
   - Return: bracket position, opponents
   - Triggers: User clicks "Join Tournament"

3. **processTournamentRound** (scheduled, runs every 72 hours)
   - Fetch all brackets ending in next hour
   - Calculate winners
   - Update leaderboards
   - Award prizes (in-game currency)

4. **processIAP** (webhook from RevenueCat)
   - Verify transaction signature
   - Grant IAP item to user
   - Log transaction
   - Send receipt to Firestore

5. **getLeaderboard** (GET /api/leaderboard/:tournamentId)
   - Auth: Optional (public endpoint)
   - Return: top 50 players with scores
   - Cache: 5 minutes

6. **refreshSave** (GET /api/save)
   - Auth: Firebase token
   - Return: latest player_saves document
   - Used on app launch

## Frontend Integration Points

### js/save.js (modify)
- Replace localStorage with cloud sync
- Call `syncSave()` after each wave
- Call `refreshSave()` on app launch
- Queue saves if offline, sync when reconnected

### js/tournament.js (modify)
- Call `submitTournament()` on join
- Call `getLeaderboard()` on bracket view
- Display cloud leaderboard instead of local mock

### js/ui.js (add)
- Login modal (Firebase Auth UI)
- Logout button
- Display username from Firestore

### main.js (add)
- Initialize Firebase
- Check user session on launch
- Redirect to login if not authenticated
- Load user's latest save

## Security Rules (Firestore)

```
users/{uid}
  - read: request.auth.uid == uid
  - write: request.auth.uid == uid

player_saves/{userId}/{saveId}
  - read: request.auth.uid == userId
  - write: request.auth.uid == userId

tournament_brackets/{tournamentId}
  - read: true (public leaderboard)
  - write: only admin

iap_transactions/{transactionId}
  - read: request.auth.uid == resource.data.userId
  - write: only RevenueCat webhook
```

## Local Testing Workflow

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run emulator: `firebase emulators:start`
3. Frontend points to `localhost:5001` instead of live Firebase
4. Test auth, saves, tournaments locally
5. Deploy to Firebase: `firebase deploy`

## Deployment

Firebase project already set up:
- Project: **core-surge---tower-defense**
- Project ID: `core-surge---tower-defense`
- Service Account Email: `firebase-adminsdk-fbsvc@core-surge---tower-defense.iam.gserviceaccount.com`
- Service Account Key ID: `e2e9830cd47b728706f41b2dc12527a858b64728`

Backend environment variables (add to `.env`):
```
FIREBASE_PROJECT_ID=core-surge---tower-defense
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@core-surge---tower-defense.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_ID=e2e9830cd47b728706f41b2dc12527a858b64728
```

Full service account key is in `core-surge---tower-defense-firebase-adminsdk-fbsvc-e2e9830cd4.json`

Deploy functions:
```bash
cd backend
npm install
firebase deploy --only functions
```

Firestore and Authentication will be auto-created on first deploy.

## Immediate Next Steps (for Codex)

1. Set up Firestore collections and security rules
2. Implement 5 Cloud Functions above
3. Test locally with Firebase emulator
4. Deploy to Firebase
5. Provide Firebase config to frontend team
6. Test cloud saves end-to-end

## Files to Create

- `backend/firebase-config.js` — Firebase initialization
- `backend/functions/syncSave.js` — Save sync function
- `backend/functions/tournament.js` — Tournament functions
- `backend/functions/iap.js` — IAP webhook handler
- `backend/firestore.rules` — Security rules
- `backend/firestore.indexes.json` — Query indexes
- `.env.example` — Template for Firebase credentials

---

Frontend team will update js/save.js, tournament.js, ui.js, main.js to call these functions.
