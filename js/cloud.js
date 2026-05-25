// ============================================================
// cloud.js -- direct Firebase Auth + Firestore client sync.
// Owned by: cloud integration AI. Keeps local play working when
// Firebase is missing or disabled. No Cloud Functions required.
// ============================================================

const CLOUD_CONFIG_STORAGE_KEY = 'core_surge_firebase_web_config_v1';
const CLOUD_AUTO_AUTH_DISABLED_KEY = 'core_surge_cloud_auto_auth_disabled_v1';
const CLOUD_SAVE_DOC_ID = 'latest';
const CLOUD_SHARED_CONFIG_GLOBAL = 'CORE_SURGE_FIREBASE_CONFIG';

const CLOUD_DEFAULT_CONFIG = {
  apiKey: '',
  authDomain: 'core-surge---tower-defense.firebaseapp.com',
  projectId: 'core-surge---tower-defense',
  databaseURL: 'https://core-surge---tower-defense.firebaseio.com',
  storageBucket: 'core-surge---tower-defense.appspot.com',
  messagingSenderId: '',
  appId: ''
};

const cloudState = {
  app: null,
  auth: null,
  db: null,
  user: null,
  booted: false,
  enabled: false,
  initialized: false,
  isSyncing: false,
  pendingSync: false,
  syncTimer: null,
  lastSyncAt: 0,
  lastError: '',
  statusNote: 'Local-only mode',
  config: null,
  configSource: 'none'
};

function cloneCloudTemplate() {
  return JSON.parse(JSON.stringify(CLOUD_DEFAULT_CONFIG));
}

function readSharedCloudConfig() {
  try {
    const raw = window[CLOUD_SHARED_CONFIG_GLOBAL];
    if (!raw || typeof raw !== 'object') return {};
    return { ...raw };
  } catch (_error) {
    return {};
  }
}

function readLocalCloudConfigOverride() {
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (_error) {
    return {};
  }
}

function buildCloudConfig() {
  const shared = readSharedCloudConfig();
  const localOverride = readLocalCloudConfigOverride();
  const config = { ...cloneCloudTemplate(), ...shared, ...localOverride };
  let source = 'none';
  if (Object.keys(shared).length) source = 'shared';
  if (Object.keys(localOverride).length) source = 'local-override';
  return {
    config,
    source,
    hasSharedConfig: Object.keys(shared).length > 0,
    hasLocalOverride: Object.keys(localOverride).length > 0
  };
}

function readCloudConfig() {
  return buildCloudConfig().config;
}

function getFirebaseConfigTemplate() {
  return buildCloudConfig().config;
}

function parseFirebaseConfigInput(input) {
  if (typeof input === 'object' && input) return input;
  const raw = String(input || '').trim();
  if (!raw) throw new Error('Firebase config is empty.');
  if (raw.startsWith('{')) {
    try {
      return JSON.parse(raw);
    } catch (_error) {
      return Function(`"use strict"; return (${raw});`)();
    }
  }
  const objectMatch = raw.match(/\{[\s\S]*\}/);
  if (!objectMatch) {
    throw new Error('Paste the Firebase config object from Firebase Console.');
  }
  return Function(`"use strict"; return (${objectMatch[0]});`)();
}

function normalizeFirebaseConfig(input, baseConfig) {
  const config = parseFirebaseConfigInput(input);
  const normalized = { ...cloneCloudTemplate(), ...(baseConfig || {}), ...(config || {}) };
  const required = ['apiKey', 'authDomain', 'projectId'];
  for (const key of required) {
    if (!normalized[key] || String(normalized[key]).includes('REPLACE_WITH')) {
      throw new Error(`Missing ${key}`);
    }
  }
  return normalized;
}

function cloudConfigIsReady(config) {
  return !!(config && config.apiKey && config.authDomain && config.projectId);
}

function saveCloudConfig(input) {
  const normalized = normalizeFirebaseConfig(input, readSharedCloudConfig());
  localStorage.setItem(CLOUD_CONFIG_STORAGE_KEY, JSON.stringify(normalized));
  localStorage.removeItem(CLOUD_AUTO_AUTH_DISABLED_KEY);
  cloudState.config = normalized;
  cloudState.configSource = 'local-override';
  cloudState.initialized = false;
  cloudState.enabled = false;
  cloudState.statusNote = 'Firebase override saved for this device. Reloading cloud...';
  return normalized;
}

function clearCloudConfig() {
  localStorage.removeItem(CLOUD_CONFIG_STORAGE_KEY);
  cloudState.app = null;
  cloudState.auth = null;
  cloudState.db = null;
  cloudState.user = null;
  cloudState.booted = false;
  cloudState.enabled = false;
  cloudState.initialized = false;
  cloudState.lastError = '';
  const snapshot = buildCloudConfig();
  cloudState.config = snapshot.config;
  cloudState.configSource = snapshot.source;
  cloudState.statusNote = snapshot.hasSharedConfig
    ? 'Local Firebase override cleared. Shared deploy config is ready.'
    : 'Firebase override cleared. Local-only mode.';
}

function autoCloudAuthDisabled() {
  try {
    return localStorage.getItem(CLOUD_AUTO_AUTH_DISABLED_KEY) === '1';
  } catch (_error) {
    return false;
  }
}

function setCloudStatus(note, err) {
  cloudState.statusNote = note;
  cloudState.lastError = err || '';
}

function initFirebaseClient() {
  if (cloudState.initialized) return cloudState.enabled;
  const configSnapshot = buildCloudConfig();
  cloudState.config = configSnapshot.config;
  cloudState.configSource = configSnapshot.source;
  if (!cloudConfigIsReady(cloudState.config)) {
    setCloudStatus(configSnapshot.hasSharedConfig
      ? 'Shared Firebase config is incomplete.'
      : 'Add shared Firebase web config in js/firebase-public-config.js or paste a local override in Settings.');
    cloudState.initialized = true;
    cloudState.enabled = false;
    return false;
  }
  if (!window.firebase) {
    setCloudStatus('Firebase SDK did not load.');
    cloudState.initialized = true;
    cloudState.enabled = false;
    return false;
  }
  try {
    cloudState.app = firebase.apps && firebase.apps.length
      ? firebase.app()
      : firebase.initializeApp(cloudState.config);
    cloudState.auth = firebase.auth();
    cloudState.db = firebase.firestore();
    cloudState.initialized = true;
    cloudState.enabled = true;
    setCloudStatus('Firebase ready.');
    return true;
  } catch (error) {
    console.error('Firebase init failed', error);
    setCloudStatus('Firebase init failed.', error.message || String(error));
    cloudState.initialized = true;
    cloudState.enabled = false;
    return false;
  }
}

function cloudSaveRef(uid) {
  return cloudState.db.collection('player_saves').doc(uid).collection('saves').doc(CLOUD_SAVE_DOC_ID);
}

function cloudUserRef(uid) {
  return cloudState.db.collection('users').doc(uid);
}

async function waitForInitialAuthUser() {
  if (!cloudState.auth) return null;
  return new Promise((resolve) => {
    const unsubscribe = cloudState.auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user || null);
    });
  });
}

async function syncCloudProfile() {
  if (!cloudState.enabled || !cloudState.user) return;
  const username = (save && save.username) || (save && save.playerId) || 'Player';
  const payload = {
    uid: cloudState.user.uid,
    username,
    isAnonymous: !!cloudState.user.isAnonymous,
    lastSeenAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  if (cloudState.user.email) payload.email = cloudState.user.email;
  await cloudUserRef(cloudState.user.uid).set(payload, { merge: true });
}

async function loadCloudSaveForCurrentUser() {
  if (!cloudState.enabled || !cloudState.user) return null;
  const snap = await cloudSaveRef(cloudState.user.uid).get();
  if (!snap.exists) return null;
  const data = snap.data() || {};
  return data.saveData || null;
}

async function applyCloudSaveFromCurrentUser(localSnapshot) {
  const cloudSave = await loadCloudSaveForCurrentUser();
  if (cloudSave) {
    replaceSaveState(cloudSave, { persist: true });
    cloudState.lastSyncAt = Date.now();
    setCloudStatus(cloudState.user.isAnonymous ? 'Guest cloud save loaded.' : 'Account cloud save loaded.');
    return true;
  }
  if (localSnapshot) {
    replaceSaveState(localSnapshot, { persist: false });
    await syncCloudSaveNow('bootstrap');
    setCloudStatus(cloudState.user.isAnonymous ? 'Guest cloud created from this device.' : 'Account cloud created from this device.');
  }
  return false;
}

async function ensureCloudUser() {
  if (!initFirebaseClient()) return null;
  if (cloudState.user) return cloudState.user;
  let user = await waitForInitialAuthUser();
  if (!user && !autoCloudAuthDisabled()) {
    const credential = await cloudState.auth.signInAnonymously();
    user = credential.user;
  }
  cloudState.user = user || null;
  return cloudState.user;
}

async function bootCloudSession() {
  if (cloudState.booted) return cloudState;
  const localSnapshot = exportSaveData();
  const user = await ensureCloudUser();
  if (!user) {
    cloudState.booted = true;
    if (autoCloudAuthDisabled()) {
      setCloudStatus('Cloud sync is paused on this device.');
    }
    return cloudState;
  }
  await syncCloudProfile();
  await applyCloudSaveFromCurrentUser(localSnapshot);
  cloudState.booted = true;
  return cloudState;
}

function queueCloudSave(reason) {
  if (!cloudState.enabled || !cloudState.user) return;
  cloudState.pendingSync = true;
  if (cloudState.syncTimer) clearTimeout(cloudState.syncTimer);
  cloudState.syncTimer = setTimeout(() => {
    syncCloudSaveNow(reason || 'queued');
  }, 900);
}

async function syncCloudSaveNow(reason) {
  if (!cloudState.enabled || !cloudState.user || cloudState.isSyncing) return false;
  cloudState.isSyncing = true;
  cloudState.pendingSync = false;
  try {
    await syncCloudProfile();
    await cloudSaveRef(cloudState.user.uid).set({
      saveData: exportSaveData(),
      username: save.username || save.playerId || 'Player',
      bestTier: save.bestTier || 1,
      bestWave: save.bestWave || 1,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      syncReason: reason || 'manual'
    }, { merge: true });
    cloudState.lastSyncAt = Date.now();
    setCloudStatus(cloudState.user.isAnonymous ? 'Guest cloud synced.' : 'Cloud synced.');
    return true;
  } catch (error) {
    console.error('Cloud sync failed', error);
    setCloudStatus('Cloud sync failed.', error.message || String(error));
    return false;
  } finally {
    cloudState.isSyncing = false;
    if (typeof renderMenu === 'function' && typeof activeSubmenu !== 'undefined' && activeSubmenu === 'settings') {
      renderSubmenu();
    }
  }
}

function cloudAccountLabel() {
  if (!cloudState.user) return 'Local-only mode';
  if (cloudState.user.isAnonymous) return `Guest Cloud - ${cloudState.user.uid.slice(0, 8)}`;
  return cloudState.user.email || 'Cloud account';
}

function cloudLastSyncLabel() {
  if (!cloudState.lastSyncAt) return 'not yet';
  if (typeof formatRelativeTime === 'function') return formatRelativeTime(cloudState.lastSyncAt);
  return new Date(cloudState.lastSyncAt).toLocaleString();
}

async function reconnectCloudSession() {
  localStorage.removeItem(CLOUD_AUTO_AUTH_DISABLED_KEY);
  cloudState.user = null;
  cloudState.booted = false;
  await bootCloudSession();
  if (typeof renderMenu === 'function') renderMenu();
}

async function signOutCloudSession() {
  if (!cloudState.auth) return;
  await cloudState.auth.signOut();
  localStorage.setItem(CLOUD_AUTO_AUTH_DISABLED_KEY, '1');
  cloudState.user = null;
  cloudState.booted = false;
  setCloudStatus('Cloud sync paused on this device.');
  if (typeof renderMenu === 'function') renderMenu();
}

async function submitCloudAuth(mode, email, password) {
  if (!initFirebaseClient()) throw new Error('Firebase config is missing.');
  if (!email || !password) throw new Error('Enter both email and password.');
  let userCredential;
  const existingUser = cloudState.auth.currentUser;
  if (mode === 'create') {
    if (existingUser && existingUser.isAnonymous) {
      const credential = firebase.auth.EmailAuthProvider.credential(email, password);
      userCredential = await existingUser.linkWithCredential(credential);
    } else {
      userCredential = await cloudState.auth.createUserWithEmailAndPassword(email, password);
    }
  } else {
    userCredential = await cloudState.auth.signInWithEmailAndPassword(email, password);
  }
  cloudState.user = userCredential.user;
  localStorage.removeItem(CLOUD_AUTO_AUTH_DISABLED_KEY);
  await syncCloudProfile();
  await applyCloudSaveFromCurrentUser(exportSaveData());
  if (typeof renderMenu === 'function') renderMenu();
  return userCredential.user;
}

function openCloudAuthModal(mode) {
  const existing = document.getElementById('cloudAuthModal');
  if (existing) existing.remove();
  const title = mode === 'create' ? 'Create Cloud Account' : 'Sign In';
  const action = mode === 'create' ? 'Create Account' : 'Sign In';
  const modal = document.createElement('div');
  modal.id = 'cloudAuthModal';
  modal.className = 'cloud-auth-modal';
  modal.innerHTML = `
    <div class="cloud-auth-card">
      <div class="cloud-auth-title">${title}</div>
      <div class="cloud-auth-copy">Use email login to keep your save across phones and reinstalls.</div>
      <input id="cloudAuthEmail" class="profile-input cloud-auth-input" type="email" placeholder="Email">
      <input id="cloudAuthPassword" class="profile-input cloud-auth-input" type="password" placeholder="Password">
      <div class="cloud-auth-error" id="cloudAuthError"></div>
      <div class="cloud-auth-actions">
        <button id="cloudAuthCancel" class="cloud-btn cloud-btn-muted" type="button">Cancel</button>
        <button id="cloudAuthSubmit" class="cloud-btn" type="button">${action}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#cloudAuthCancel').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.remove();
  });
  modal.querySelector('#cloudAuthSubmit').addEventListener('click', async () => {
    const email = modal.querySelector('#cloudAuthEmail').value.trim();
    const password = modal.querySelector('#cloudAuthPassword').value;
    const errorEl = modal.querySelector('#cloudAuthError');
    errorEl.textContent = '';
    try {
      await submitCloudAuth(mode, email, password);
      modal.remove();
    } catch (error) {
      errorEl.textContent = error.message || 'Auth failed.';
    }
  });
}

function cloudConfigSourceLabel(source) {
  const currentSource = source || cloudState.configSource;
  if (currentSource === 'local-override') return 'Local override on this device';
  if (currentSource === 'shared') return 'Shared deploy config';
  return 'No Firebase config yet';
}

function cloudConfigChecklistHtml() {
  const snapshot = buildCloudConfig();
  const checks = [
    {
      ok: !!snapshot.config.projectId,
      label: 'Firebase project ID is set'
    },
    {
      ok: !!snapshot.config.apiKey,
      label: 'Web API key is set'
    },
    {
      ok: !!snapshot.config.messagingSenderId,
      label: 'Messaging sender ID is set'
    },
    {
      ok: !!snapshot.config.appId,
      label: 'Web app ID is set'
    }
  ];
  return checks.map((item) => `
    <div class="cloud-check-row ${item.ok ? 'ok' : 'todo'}">
      <span class="cloud-check-state">${item.ok ? 'READY' : 'TODO'}</span>
      <span>${item.label}</span>
    </div>
  `).join('');
}

function renderCloudSettingsSection(container) {
  const section = document.createElement('div');
  section.className = 'profile-section';

  const snapshot = buildCloudConfig();
  const configValue = JSON.stringify(snapshot.hasLocalOverride ? readLocalCloudConfigOverride() : snapshot.config, null, 2);
  const statusText = cloudState.lastError
    ? `${cloudState.statusNote} ${cloudState.lastError}`
    : cloudState.statusNote;

  section.innerHTML = `
    <div class="profile-section-title">Cloud Save</div>
    <div class="cloud-status-row">
      <div>
        <div class="cloud-status-label">${cloudAccountLabel()}</div>
        <div class="cloud-status-text">${statusText}</div>
        <div class="cloud-status-meta">Last sync: ${cloudLastSyncLabel()}</div>
      </div>
      <div class="cloud-status-badge ${cloudState.user ? 'online' : 'offline'}">${cloudState.user ? 'CONNECTED' : 'LOCAL'}</div>
    </div>
    <div class="cloud-status-meta">Config source: ${cloudConfigSourceLabel(snapshot.source)}</div>
    <div class="cloud-checklist">${cloudConfigChecklistHtml()}</div>
    <textarea id="cloudConfigInput" class="cloud-config-input" spellcheck="false">${configValue}</textarea>
    <div class="cloud-config-hint">Best path: put the real Firebase web config in js/firebase-public-config.js once, push it, and every tester gets cloud save automatically. This box is only a per-device override for debugging.</div>
    <div class="cloud-btn-row">
      <button id="cloudConfigSaveBtn" class="cloud-btn" type="button">Save Override</button>
      <button id="cloudConfigClearBtn" class="cloud-btn cloud-btn-muted" type="button" ${snapshot.hasLocalOverride ? '' : 'disabled'}>Use Shared Config</button>
      <button id="cloudReconnectBtn" class="cloud-btn cloud-btn-muted" type="button">Reconnect</button>
    </div>
    <div class="cloud-btn-row">
      <button id="cloudSyncNowBtn" class="cloud-btn" type="button">Sync Now</button>
      <button id="cloudCreateBtn" class="cloud-btn cloud-btn-muted" type="button">Create Account</button>
      <button id="cloudLoginBtn" class="cloud-btn cloud-btn-muted" type="button">Sign In</button>
      <button id="cloudDisconnectBtn" class="cloud-btn cloud-btn-danger" type="button">Pause Cloud</button>
    </div>
  `;
  container.appendChild(section);

  section.querySelector('#cloudConfigSaveBtn').addEventListener('click', async () => {
    const raw = section.querySelector('#cloudConfigInput').value;
    try {
      saveCloudConfig(raw);
      await reconnectCloudSession();
    } catch (error) {
      setCloudStatus('Could not save Firebase config.', error.message || String(error));
      renderSettingsTab(container);
    }
  });
  section.querySelector('#cloudConfigClearBtn').addEventListener('click', () => {
    clearCloudConfig();
    renderSettingsTab(container);
  });
  section.querySelector('#cloudReconnectBtn').addEventListener('click', async () => {
    await reconnectCloudSession();
  });
  section.querySelector('#cloudSyncNowBtn').addEventListener('click', async () => {
    await syncCloudSaveNow('manual');
  });
  section.querySelector('#cloudCreateBtn').addEventListener('click', () => openCloudAuthModal('create'));
  section.querySelector('#cloudLoginBtn').addEventListener('click', () => openCloudAuthModal('login'));
  section.querySelector('#cloudDisconnectBtn').addEventListener('click', async () => {
    await signOutCloudSession();
  });
}
