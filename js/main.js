// ============================================================
// main.js — passive coin accrual, offline catchup, gem orb spawner, ad simulation, boot sequence.
// Owned by: glue AI. This file should remain small.
// ============================================================

// ============================================================
// PASSIVE + OFFLINE
// ============================================================
const INSTALL_BANNER_DISMISS_KEY = 'core_surge_install_banner_dismissed_v1';

let passiveTimer = null;
function startPassiveAccrual() {
  stopPassiveAccrual();
  passiveTimer = setInterval(() => {
    if (game.running) return;
    const coinsPerMin = Math.pow(Math.max(1, save.bestTier), 1.0) * Math.pow(Math.max(1, save.bestWave), 1.2) * 0.05;
    const passivePerSec = (coinsPerMin / 60) * 0.05;
    save.coins += passivePerSec * 10;
    renderHud();
  }, 10000);
}
function stopPassiveAccrual() {
  if (passiveTimer) { clearInterval(passiveTimer); passiveTimer = null; }
}

function processOfflineProgress() {
  if (!save.lastSaveTime) return;
  const elapsedMs = Date.now() - save.lastSaveTime;
  if (elapsedMs < 60_000) return;
  const capMin = offlineCapMinutes();
  const cappedMs = Math.min(elapsedMs, capMin * 60_000);
  const rate = offlineRateFraction();
  const coinsPerMin = Math.pow(Math.max(1, save.bestTier), 1.0) * Math.pow(Math.max(1, save.bestWave), 1.2) * 0.05;
  const minutes = cappedMs / 60_000;
  const earned = Math.floor(coinsPerMin * minutes * rate);
  if (earned > 0) {
    save.coins += earned;
    persistSave();
    showOfflineToast(elapsedMs, cappedMs, earned, capMin, rate);
  }
}

function showOfflineToast(elapsedMs, cappedMs, earned, capMin, rate) {
  const t = document.getElementById('offlineToast');
  const m = document.getElementById('offlineMsg');
  const elapsedH = elapsedMs >= 3600_000
    ? (elapsedMs / 3600_000).toFixed(1) + 'h'
    : Math.floor(elapsedMs / 60_000) + ' min';
  const cappedDisp = capMin >= 60 ? (capMin / 60).toFixed(1) + 'h' : capMin + ' min';
  const capped = elapsedMs > cappedMs;
  m.innerHTML = `
    <b>Welcome back</b><br>
    Away ${elapsedH} ${capped ? `(capped at ${cappedDisp})` : ''}<br>
    +${formatNum(earned)} scrap (${(rate*100).toFixed(0)}% rate)
  `;
  t.style.display = 'block';
  setTimeout(() => { if (t) t.style.display = 'none'; }, 9000);
}

function formatNum(n) {
  n = Math.floor(n);
  if (n < 1000) return n.toString();
  if (n < 1e6)  return (n / 1e3).toFixed(1) + 'K';
  if (n < 1e9)  return (n / 1e6).toFixed(2) + 'M';
  if (n < 1e12) return (n / 1e9).toFixed(2) + 'B';
  if (n < 1e15) return (n / 1e12).toFixed(2) + 'T';
  return n.toExponential(2);
}

// Stat formatter — for display in upgrade panel. Shows decimals on small
// numbers so early-game fractional changes (5 → 5.5) are visible.
// At scale this falls back to formatNum for readability.
function formatStat(n) {
  if (n < 10) return n.toFixed(1);
  if (n < 100) return n.toFixed(1);
  return formatNum(n);
}

// ============================================================
// GEM ORB SYSTEM — side-lane optional reward
// ============================================================
// Spawns at run start + 2 min, then every 6-8 min active play.
// One orb max on screen. Never during boss banner, death, or menus.
// Tap = +2 gems instant. Small "+3 ad" pill appears briefly after tap.

const orbState = {
  lastSpawnTime: 0,
  nextSpawnDelay: 0,  // ms until next spawn from orb.lastSpawnTime
  currentOrb: null,   // DOM element or null
  currentOrbSpawnedAt: 0,
  currentOrbDuration: 22000,
  pillEl: null,
  pillExpireTimer: null
};

function resetOrbStateForRun() {
  // When a run starts, schedule first orb at 45s real-time from now
  orbState.lastSpawnTime = performance.now();
  const gemAttractorBonus = typeof getGemFindChance === 'function' ? getGemFindChance() : 0;
  const spawnMul = Math.max(0.15, 1 - gemAttractorBonus); // cap at 85% reduction
  orbState.nextSpawnDelay = Math.floor(45000 * spawnMul); // 45s base (was 2 min)
  if (orbState.currentOrb) {
    orbState.currentOrb.remove();
    orbState.currentOrb = null;
  }
  if (orbState.pillEl) {
    orbState.pillEl.remove();
    orbState.pillEl = null;
  }
  if (orbState.pillExpireTimer) {
    clearTimeout(orbState.pillExpireTimer);
    orbState.pillExpireTimer = null;
  }
}

function canSpawnOrb() {
  if (!game.running) return false;
  if (orbState.currentOrb) return false;
  // Don't spawn during the first 1s of a boss wave (banner animation)
  if (game.bossWave && game.bossSpawned) {
    const w = game.enemies.find(e => e.type === 'boss');
    // If boss is still off-screen (just spawned), wait
    if (w && w.y < 0) return false;
  }
  return true;
}

function updateOrbSystem() {
  if (!game.running) return;
  const now = performance.now();
  const elapsed = now - orbState.lastSpawnTime;
  // Handle orb lifespan
  if (orbState.currentOrb) {
    const orbAge = now - orbState.currentOrbSpawnedAt;
    if (orbAge > orbState.currentOrbDuration && !orbState.currentOrb.classList.contains('fading')) {
      orbState.currentOrb.classList.add('fading');
      setTimeout(() => {
        if (orbState.currentOrb && orbState.currentOrb.classList.contains('fading')) {
          orbState.currentOrb.remove();
          orbState.currentOrb = null;
          // Schedule next
          orbState.lastSpawnTime = performance.now();
          const gaMul1 = Math.max(0.15, 1 - (typeof getGemFindChance === 'function' ? getGemFindChance() : 0));
          orbState.nextSpawnDelay = Math.floor((3 + Math.random() * 1) * 60 * 1000 * gaMul1); // 3-4 min base
        }
      }, 400);
    }
  } else if (elapsed >= orbState.nextSpawnDelay && canSpawnOrb()) {
    spawnGemOrb();
  }
}

function spawnGemOrb() {
  const orb = document.createElement('div');
  orb.className = 'gem-orb';
  orb.textContent = '💎';
  orb.addEventListener('click', onOrbTapped);
  orb.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
  game.bf.appendChild(orb);
  orbState.currentOrb = orb;
  orbState.currentOrbSpawnedAt = performance.now();
}

function onOrbTapped(ev) {
  ev.stopPropagation();
  if (!orbState.currentOrb) return;
  const orb = orbState.currentOrb;
  const rect = orb.getBoundingClientRect();
  const bfRect = game.bf.getBoundingClientRect();
  const relTop = rect.top - bfRect.top;
  // Award 2 gems instantly
  save.gems += 2;
  game.gemsEarnedThisRun = (game.gemsEarnedThisRun || 0) + 2;
  persistSave();
  // Floating text
  spawnFloat(bfRect.width - 40, relTop + 22, '+2 💎', 'lifesteal');
  pulseGemCounter();
  // Burst animation, then remove
  orb.classList.add('claimed');
  setTimeout(() => {
    if (orb.parentNode) orb.parentNode.removeChild(orb);
  }, 450);
  orbState.currentOrb = null;
  // Schedule next orb
  orbState.lastSpawnTime = performance.now();
  const gaMul2 = Math.max(0.15, 1 - (typeof getGemFindChance === 'function' ? getGemFindChance() : 0));
  orbState.nextSpawnDelay = Math.floor((6 + Math.random() * 2) * 60 * 1000 * gaMul2);
  // Spawn ad-bonus pill near orb location
  spawnAdPill(relTop);
}

function spawnAdPill(relTop) {
  if (orbState.pillEl) {
    orbState.pillEl.remove();
    if (orbState.pillExpireTimer) clearTimeout(orbState.pillExpireTimer);
  }
  const pill = document.createElement('div');
  pill.className = 'ad-pill';
  pill.innerHTML = '<span class="gem-icon">💎</span> <span class="ad-label">+3 for ad</span>';
  pill.style.top = (relTop + 8) + 'px';
  pill.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (pill.classList.contains('fading')) return;
    pill.classList.add('fading');
    setTimeout(() => pill.remove(), 300);
    if (orbState.pillExpireTimer) clearTimeout(orbState.pillExpireTimer);
    orbState.pillEl = null;
    // Show simulated ad, grant 3 gems on completion
    showSimulatedAd('Watch for +3 💎', 'Support the devs — and grab extra gems.', () => {
      save.gems += 3;
      game.gemsEarnedThisRun = (game.gemsEarnedThisRun || 0) + 3;
      persistSave();
      pulseGemCounter();
      spawnFloat(game.bfRect.width - 40, relTop + 22, '+3 💎', 'lifesteal');
    });
  });
  game.bf.appendChild(pill);
  orbState.pillEl = pill;
  // Auto-fade after 5 seconds
  orbState.pillExpireTimer = setTimeout(() => {
    if (orbState.pillEl === pill) {
      pill.classList.add('fading');
      setTimeout(() => pill.remove(), 300);
      orbState.pillEl = null;
    }
  }, 5000);
}

function pulseGemCounter() {
  // find the Gems HUD value cell (menu only has it)
  const hudValues = document.querySelectorAll('.hud-value.purple');
  hudValues.forEach(el => {
    el.classList.remove('coin-pulse');
    void el.offsetWidth;
    el.classList.add('coin-pulse');
  });
  // Always update HUD to refresh the displayed number
  renderHud();
}

// ============================================================
// AD SIMULATION OVERLAY
// ============================================================
// Shows a 30-second countdown with skip enabled after 5s.
// onComplete() is called only when the user completes OR skips.
// Placeholder for real ad SDK.

let adSimState = {
  active: false,
  countdown: 30,
  timer: null,
  onComplete: null
};

function showSimulatedAd(title, body, onComplete) {
  const overlay = document.getElementById('adOverlay');
  const titleEl = document.getElementById('adSimTitle');
  const bodyEl = document.getElementById('adSimBody');
  const countEl = document.getElementById('adSimCountdown');
  const skipBtn = document.getElementById('adSimSkip');
  titleEl.textContent = title || 'Supporting the devs';
  bodyEl.textContent = body || 'Real ads will be rewarded, opt-in, and never interrupt gameplay. This is a placeholder.';
  adSimState.active = true;
  adSimState.countdown = 3;
  adSimState.onComplete = onComplete || null;
  countEl.textContent = '3';
  skipBtn.textContent = 'Collect Reward';
  skipBtn.disabled = false;
  skipBtn.classList.add('enabled');
  overlay.classList.add('active');
  adSimState.timer = setInterval(() => {
    adSimState.countdown--;
    countEl.textContent = Math.max(0, adSimState.countdown);
    if (adSimState.countdown <= 0) {
      completeSimulatedAd();
    }
  }, 1000);
}

function completeSimulatedAd() {
  const overlay = document.getElementById('adOverlay');
  if (adSimState.timer) { clearInterval(adSimState.timer); adSimState.timer = null; }
  overlay.classList.remove('active');
  const cb = adSimState.onComplete;
  adSimState.onComplete = null;
  adSimState.active = false;
  if (cb) cb();
}

function cancelSimulatedAd() {
  // Don't grant reward if user somehow cancels early. In this placeholder there's no cancel path.
  const overlay = document.getElementById('adOverlay');
  if (adSimState.timer) { clearInterval(adSimState.timer); adSimState.timer = null; }
  overlay.classList.remove('active');
  adSimState.active = false;
  adSimState.onComplete = null;
}

// ============================================================
// APP SHELL / INSTALL
// ============================================================
const installState = {
  deferredPrompt: null,
  installed: false
};

function isStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isiOSDevice() {
  const ua = window.navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua);
}

function dismissInstallBanner() {
  try {
    window.localStorage.setItem(INSTALL_BANNER_DISMISS_KEY, '1');
  } catch (_error) {
    // Ignore storage failures; banner just becomes session-only.
  }
  updateInstallBanner();
}

function wasInstallBannerDismissed() {
  try {
    return window.localStorage.getItem(INSTALL_BANNER_DISMISS_KEY) === '1';
  } catch (_error) {
    return false;
  }
}

function getInstallBannerState() {
  if (isStandaloneMode() || installState.installed) {
    return { visible: false, text: '', button: '' };
  }
  if (wasInstallBannerDismissed()) {
    return { visible: false, text: '', button: '' };
  }
  if (installState.deferredPrompt) {
    return {
      visible: true,
      text: 'Add the game to your home screen for full-screen play and faster relaunches.',
      button: 'Install'
    };
  }
  if (isiOSDevice() && !wasInstallBannerDismissed()) {
    return {
      visible: true,
      text: 'On iPhone, tap Share and then Add to Home Screen for the app-style version.',
      button: 'How To'
    };
  }
  return { visible: false, text: '', button: '' };
}

function updateInstallBanner() {
  const banner = document.getElementById('installBanner');
  const textEl = document.getElementById('installBannerText');
  const buttonEl = document.getElementById('installBannerBtn');
  if (!banner || !textEl || !buttonEl) return;

  const state = getInstallBannerState();
  if (!state.visible) {
    banner.classList.add('hidden');
    return;
  }

  textEl.textContent = state.text;
  buttonEl.textContent = state.button;
  banner.classList.remove('hidden');
}

async function promptInstallApp() {
  if (installState.deferredPrompt) {
    installState.deferredPrompt.prompt();
    const outcome = await installState.deferredPrompt.userChoice;
    if (outcome && outcome.outcome !== 'accepted') {
      updateInstallBanner();
    }
    installState.deferredPrompt = null;
    updateInstallBanner();
    return;
  }

  if (isiOSDevice()) {
    const textEl = document.getElementById('installBannerText');
    const buttonEl = document.getElementById('installBannerBtn');
    if (textEl) {
      textEl.textContent = 'Use Safari Share to Add to Home Screen. That gives you the closest native-style launch on iPhone.';
    }
    if (buttonEl) {
      buttonEl.textContent = 'Got It';
    }
  }
}

function wireInstallBanner() {
  const installBtn = document.getElementById('installBannerBtn');
  const dismissBtn = document.getElementById('installDismissBtn');
  if (installBtn) installBtn.addEventListener('click', promptInstallApp);
  if (dismissBtn) dismissBtn.addEventListener('click', dismissInstallBanner);
  updateInstallBanner();
}

async function registerAppShell() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('./service-worker.js');
  } catch (_error) {
    // Offline shell is optional. Keep boot resilient.
  }
}


// ============================================================
// KEYBOARD SHORTCUTS — desktop play convenience
// ============================================================
function wireKeyboardShortcuts() {
  document.addEventListener('keydown', function(event) {
    // Don't intercept when typing in an input or textarea
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    // Don't intercept during simulated ad overlay
    if (adSimState && adSimState.active) return;

    // Don't intercept during end-of-run overlay
    var endOv = document.getElementById('endOverlay');
    if (endOv && endOv.classList.contains('active')) return;

    var key = event.key;
    var inBattle = game.running;
    var onMenu = !inBattle;
    var overlayUp = inBattle && typeof isOverlayActive === 'function' && isOverlayActive();

    // --- SPACE or ENTER ---
    if (key === ' ' || key === 'Enter') {
      event.preventDefault();
      if (onMenu) {
        startBattle();
      } else if (inBattle) {
        // Toggle pause
        game.paused = !game.paused;
        // Show/hide a simple pause indicator
        var pi = document.getElementById('pauseIndicator');
        if (!pi) {
          pi = document.createElement('div');
          pi.id = 'pauseIndicator';
          pi.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
            'background:rgba(0,0,0,0.75);color:#fff;font-size:28px;font-weight:bold;' +
            'padding:18px 36px;border-radius:12px;z-index:9000;pointer-events:none;';
          pi.textContent = 'PAUSED';
          document.body.appendChild(pi);
        }
        pi.style.display = game.paused ? 'block' : 'none';
      }
      return;
    }

    // --- 1-6: Buy in-run upgrades by visible slot position ---
    if (inBattle && !overlayUp && key >= '1' && key <= '6') {
      event.preventDefault();
      var btns = document.querySelectorAll('.upgrade-grid .upgrade-btn');
      var idx = parseInt(key) - 1;
      if (btns[idx]) {
        var upgradeKey = btns[idx].dataset.key;
        if (upgradeKey) buyInRun(upgradeKey);
      }
      return;
    }

    // --- H: Buy heal ---
    if (inBattle && !overlayUp && (key === 'h' || key === 'H')) {
      event.preventDefault();
      buyInRun('heal');
      return;
    }

    // --- ESCAPE ---
    if (key === 'Escape') {
      event.preventDefault();
      // Close More sheet if open
      var moreSheet = document.getElementById('moreSheet');
      if (moreSheet && moreSheet.classList.contains('visible')) {
        closeMoreSheet();
        return;
      }
      if (inBattle) {
        if (overlayUp) {
          closeMenuOverlay();
        } else {
          openMenuOverlay();
        }
      } else {
        // On menu: go to home screen
        showScreen('menu');
        renderMenu();
      }
      return;
    }

    // --- R: Open Research tab ---
    if (key === 'r' || key === 'R') {
      event.preventDefault();
      if (inBattle && !overlayUp) openMenuOverlay();
      activeSubmenu = 'labs';
      renderSubmenu();
      return;
    }

    // --- L: Open Loadout tab ---
    if (key === 'l' || key === 'L') {
      event.preventDefault();
      if (typeof featureUnlocked === 'function' && !featureUnlocked('cards')) return;
      if (inBattle && !overlayUp) openMenuOverlay();
      activeSubmenu = 'cards';
      renderSubmenu();
      return;
    }

    // --- M: Open More sheet ---
    if (key === 'm' || key === 'M') {
      event.preventDefault();
      openMoreSheet();
      return;
    }
  });
}

// ============================================================
// BOOT
// ============================================================
function updateSplash(pct) {
  const fill = document.getElementById('splashFill');
  if (fill) fill.style.width = pct + '%';
}
function dismissSplash() {
  const splash = document.getElementById('splashScreen');
  if (splash) {
    splash.classList.add('fade-out');
    setTimeout(() => splash.remove(), 500);
  }
}

window.addEventListener('load', async () => {
  updateSplash(10);
  registerAppShell();
  loadSave();
  updateSplash(30);
  if (typeof ensureUsername === 'function') ensureUsername();
  if (typeof bootCloudSession === 'function') {
    try {
      await bootCloudSession();
    } catch (error) {
      console.error('Cloud boot failed', error);
    }
  }
  if (typeof initMonetization === 'function') {
    initMonetization();
  }
  updateSplash(50);
  document.documentElement.dataset.theme = save.settings.theme || 'neon';
  game.bf = document.getElementById('battlefield');
  game.towerEl = document.getElementById('tower');
  game.rangeRingEl = document.getElementById('rangeRing');

  document.getElementById('tierUp').addEventListener('click', () => {
    const max = highestUnlockedTier();
    if (save.selectedTier < max) { save.selectedTier++; persistSave(); renderMenu(); }
  });
  document.getElementById('tierDown').addEventListener('click', () => {
    if (save.selectedTier > 1) { save.selectedTier--; persistSave(); renderMenu(); }
  });
  document.getElementById('startBtn').addEventListener('click', () => startBattle());
  document.getElementById('endMenuBtn').addEventListener('click', returnToMenu);
  document.getElementById('devClose').addEventListener('click', closeDevPanel);
  // Ad skip button (simulated ads)
  const adSkip = document.getElementById('adSimSkip');
  if (adSkip) {
    adSkip.addEventListener('click', () => {
      if (!adSkip.disabled) completeSimulatedAd();
    });
  }
  document.querySelectorAll('.submenu-btn').forEach(b => {
    b.addEventListener('click', () => {
      const tab = b.dataset.tab;
      // HOME button — return to home view
      if (tab === 'home') {
        if (game.running && typeof isOverlayActive === 'function' && isOverlayActive()) {
          closeMenuOverlay();
        }
        activeSubmenu = 'home';
        setHomeView(true);
        renderMenu();
        showScreen('menu');
        updateSubmenuActive();
        return;
      }
      if (typeof featureUnlocked === 'function' && !featureUnlocked(tab)) {
        const t2 = document.createElement('div');
        t2.className = 'skin-toast';
        t2.textContent = tab === 'tournament' ? 'Reach Wave 50 on Tier 1 to unlock!' : 'Keep playing to unlock this feature!';
        document.body.appendChild(t2);
        setTimeout(() => t2.remove(), 2000);
        return;
      }
      // If in battle overlay and tapping same tab, close overlay
      if (game.running && typeof isOverlayActive === 'function' && isOverlayActive() && activeSubmenu === tab) {
        closeMenuOverlay();
        return;
      }
      activeSubmenu = tab;
      if (game.running) {
        openMenuOverlay();
      } else {
        setHomeView(false);
        renderSubmenu();
        showScreen('menu');
      }
      updateSubmenuActive();
    });
  });

  setupTapFocus();
  window.addEventListener('resize', () => { if (game.bf) updateBfRect(); });
  if (window.ResizeObserver && game.bf) {
    const ro = new ResizeObserver(() => {
      if (game.bf) updateBfRect();
    });
    ro.observe(game.bf);
  }
  processOfflineProgress();
  if (save.selectedTier > highestUnlockedTier()) save.selectedTier = highestUnlockedTier();
  if (save.settings.gameSpeed > maxUnlockedSpeed()) save.settings.gameSpeed = maxUnlockedSpeed();
  updateSplash(80);
  renderHud();
  renderMenu();
  wireBattlefieldSideButtons();
  wireGlobalNav();
  wireInstallBanner();
  wireKeyboardShortcuts();
  startPassiveAccrual();
  updateSplash(100);
  setTimeout(dismissSplash, 300);
  // Tutorial: show first-time tooltip after splash clears
  if (typeof checkTutorial === 'function') {
    setTimeout(checkTutorial, 900);
  }
  window._autoSaveInterval = setInterval(persistSave, 5000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) persistSave();
  });
});

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installState.deferredPrompt = event;
  updateInstallBanner();
});

window.addEventListener('appinstalled', () => {
  installState.installed = true;
  installState.deferredPrompt = null;
  updateInstallBanner();
});

window._game = game;
window._save = () => save;
window._dev = () => { save.settings.devMode = true; persistSave(); openDevPanel(); };

// ============================================================
// GLOBAL ERROR BOUNDARY — prevent blank screen on crash
// ============================================================
window.onerror = function(msg, src, line, col, err) {
  console.error('Uncaught error:', msg, 'at', src, line, col, err);
  try {
    const toast = document.createElement('div');
    toast.className = 'skin-toast';
    toast.style.background = 'rgba(180,40,40,0.95)';
    toast.style.zIndex = '99999';
    toast.textContent = '⚠ Something went wrong. Try reloading the game.';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 6000);
    // Try to save progress before anything worse happens
    if (typeof persistSave === 'function') persistSave();
  } catch (_) { /* last resort — don't throw in the error handler */ }
};

window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
});
