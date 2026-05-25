# Frontend Integration Guide

The frontend needs to be updated to use the Firebase backend instead of localStorage. Follow these changes in order.

## 1. Add Firebase SDK to index.html

Before closing `</body>` tag, add:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js"></script>
```

## 2. Update main.js - Initialize Firebase

Add at the top of `js/main.js`, before any game logic:

```javascript
// Firebase Configuration
const firebaseConfig = {
  apiKey: "REPLACE_WITH_WEB_API_KEY",
  projectId: "core-surge---tower-defense",
  authDomain: "core-surge---tower-defense.firebaseapp.com",
  databaseURL: "https://core-surge---tower-defense.firebaseio.com",
  storageBucket: "core-surge---tower-defense.appspot.com",
  messagingSenderId: "REPLACE_WITH_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// API endpoint
const API_URL = 'https://us-central1-core-surge---tower-defense.cloudfunctions.net';
// For local testing: 'http://localhost:5001/core-surge---tower-defense'

// Global user variable
let currentUser = null;

// Check if user is logged in on app launch
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    console.log('User logged in:', user.email);
    
    // Load latest save from cloud
    const savedGame = await loadGameFromCloud();
    if (savedGame) {
      gameState = savedGame;
      console.log('Loaded game from cloud');
    } else {
      console.log('No cloud save found, using local');
    }
    
    startGame(); // Start game after loading
  } else {
    currentUser = null;
    console.log('No user logged in');
    showLoginModal(); // Show login UI
  }
});
```

## 3. Update js/ui.js - Add Login Modal

Add this function to `js/ui.js`:

```javascript
// Login/Signup Modal
function showLoginModal() {
  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;

  modal.innerHTML = `
    <div style="background: #222; padding: 30px; border-radius: 10px; text-align: center; max-width: 300px;">
      <h2>Login</h2>
      <input type="email" id="auth-email" placeholder="Email" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #666;">
      <input type="password" id="auth-password" placeholder="Password" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #666;">
      
      <button id="auth-login" style="width: 48%; padding: 10px; margin: 10px 1%; background: #4CAF50; color: white; border: none; cursor: pointer;">Login</button>
      <button id="auth-signup" style="width: 48%; padding: 10px; margin: 10px 1%; background: #2196F3; color: white; border: none; cursor: pointer;">Signup</button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('auth-login').onclick = async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      modal.remove();
    } catch (error) {
      alert('Login error: ' + error.message);
    }
  };

  document.getElementById('auth-signup').onclick = async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      modal.remove();
    } catch (error) {
      alert('Signup error: ' + error.message);
    }
  };
}

// Logout button (add to settings screen)
function addLogoutButton() {
  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Logout';
  logoutBtn.onclick = () => {
    firebase.auth().signOut();
    window.location.reload();
  };
  // Add to settings UI
  document.getElementById('settings-container').appendChild(logoutBtn);
}
```

## 4. Update js/save.js - Cloud Sync

Replace the entire `save.js` with:

```javascript
// Cloud Save System

// Save game state to Firestore
async function saveGameToCloud() {
  if (!currentUser) {
    console.warn('Not logged in, saving locally only');
    saveGameLocally();
    return;
  }

  try {
    const token = await currentUser.getIdToken();
    
    const response = await fetch(`${API_URL}/syncSave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameState: gameState
      })
    });

    if (!response.ok) {
      throw new Error(`Cloud save failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Saved to cloud:', data.saveId);
    
    // Also save locally as backup
    saveGameLocally();
  } catch (error) {
    console.error('Error saving to cloud:', error);
    // Fallback to local save if cloud fails
    saveGameLocally();
  }
}

// Load game state from Firestore
async function loadGameFromCloud() {
  if (!currentUser) {
    console.warn('Not logged in, loading from local only');
    return loadGameLocally();
  }

  try {
    const token = await currentUser.getIdToken();
    
    const response = await fetch(`${API_URL}/refreshSave`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('No cloud save found');
        return null;
      }
      throw new Error(`Failed to load cloud save: ${response.status}`);
    }

    const data = await response.json();
    console.log('Loaded from cloud:', data.saveId);
    return data.gameState;
  } catch (error) {
    console.error('Error loading from cloud:', error);
    return null;
  }
}

// Local fallback (original localStorage logic)
function saveGameLocally() {
  localStorage.setItem('gameState', JSON.stringify(gameState));
}

function loadGameLocally() {
  const saved = localStorage.getItem('gameState');
  return saved ? JSON.parse(saved) : null;
}

// Call this after each wave/level
function autosave() {
  if (currentUser) {
    saveGameToCloud();
  } else {
    saveGameLocally();
  }
}
```

## 5. Update js/tournament.js - Cloud Leaderboard

Add these functions to `js/tournament.js`:

```javascript
// Join tournament (cloud)
async function joinTournament(tournamentId) {
  if (!currentUser) {
    alert('Please login to join tournament');
    return;
  }

  try {
    const token = await currentUser.getIdToken();
    
    const response = await fetch(`${API_URL}/submitTournament`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tournamentId: tournamentId,
        username: playerProfile.username || 'Anonymous',
        score: gameState.score
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to join tournament: ${response.status}`);
    }

    console.log('Joined tournament');
  } catch (error) {
    console.error('Error joining tournament:', error);
    alert('Failed to join tournament');
  }
}

// Get leaderboard (cloud)
async function getLeaderboard(tournamentId) {
  try {
    const response = await fetch(`${API_URL}/getLeaderboard?tournamentId=${tournamentId}`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`Failed to get leaderboard: ${response.status}`);
    }

    const data = await response.json();
    console.log('Leaderboard:', data.leaderboard);
    return data.leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

// Display leaderboard in UI
async function renderLeaderboard(tournamentId) {
  const leaderboard = await getLeaderboard(tournamentId);
  
  const html = leaderboard.map((player, i) => `
    <div style="padding: 10px; border-bottom: 1px solid #444;">
      <span>${i+1}. ${player.username}</span>
      <span style="float: right;">${player.score} pts</span>
    </div>
  `).join('');

  document.getElementById('leaderboard-container').innerHTML = html;
}
```

## 6. Call autosave() at Right Times

In `js/main.js` or where game loop updates:

```javascript
// After every wave completes
function waveComplete() {
  // ... existing wave logic ...
  autosave(); // Save to cloud
}

// After level complete
function levelComplete() {
  // ... existing level logic ...
  autosave();
}

// In game loop (every 30 seconds or so)
setInterval(() => {
  autosave();
}, 30000);
```

## 7. Environment Variables

Create `.env` file in root (for build tools):

```
VITE_FIREBASE_PROJECT_ID=core-surge---tower-defense
VITE_API_URL=https://us-central1-core-surge---tower-defense.cloudfunctions.net
```

Or hardcode in `main.js` for now.

**NOTE**: Still need to get these three values from Firebase Console and replace:
- `REPLACE_WITH_WEB_API_KEY` (from Project Settings > API Keys)
- `REPLACE_WITH_MESSAGING_SENDER_ID` (from Project Settings > General)
- `REPLACE_WITH_APP_ID` (from Project Settings > General)

## Testing Checklist

- [ ] User can login/signup
- [ ] Game loads user's latest save from cloud
- [ ] Game autosaves after wave
- [ ] Leaderboard shows cloud data
- [ ] Can join tournament
- [ ] Logout clears session
- [ ] Works offline (falls back to local save)
- [ ] Works on mobile web (Capacitor)
- [ ] Works on iOS app
- [ ] Works on Android app

## Debugging

Check browser console and Firebase Console:

1. **Firebase Console**: firebaseapp.com > project > Firestore > check documents exist
2. **Browser Console**: `firebase.auth()` should show current user
3. **Network tab**: Check API calls are reaching functions
4. **Emulator UI**: localhost:4000 shows all requests if running locally

---

**Frontend team**: Follow these steps in order. Test each section locally before moving to next.
