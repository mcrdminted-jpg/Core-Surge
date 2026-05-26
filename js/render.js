// ============================================================
// render.js — DOM rendering for battlefield, enemies, projectiles, gem orbs, floating text.
// Owned by: render AI. Reads game state; writes to battlefield DOM. No gameplay math.
// ============================================================

// ============================================================
// DOM ELEMENT POOLS — reuse DOM nodes instead of create/remove churn
// ============================================================
const _pool = {
  projectile: [],    // player projectile divs
  enemyProj: [],     // enemy projectile divs
  float: [],         // floating text divs
  enemy: []          // enemy container divs (with hp bar + sprite children)
};

function _poolGet(type) {
  const arr = _pool[type];
  if (arr.length > 0) {
    const el = arr.pop();
    el.style.display = '';
    return el;
  }
  return null;
}

function _poolReturn(type, el) {
  el.style.display = 'none';
  el.className = '';   // reset classes
  _pool[type].push(el);
}

// ============================================================
// RENDER
// ============================================================
function updateBfRect() {
  if (!game.bf) return;
  game.bfRect = game.bf.getBoundingClientRect();
  game.towerX = game.bfRect.width / 2;
  game.towerY = game.bfRect.height * 0.78; // low position — enemies attack from top & sides
  if (game.towerEl) {
    game.towerEl.style.left = game.towerX + 'px';
    game.towerEl.style.top = game.towerY + 'px';
  }
  updateRangeRing();
}
function updateRangeRing() {
  if (!game.rangeRingEl) return;
  const r = getRange() * 2;
  game.rangeRingEl.style.left = game.towerX + 'px';
  game.rangeRingEl.style.top = game.towerY + 'px';
  game.rangeRingEl.style.width = r + 'px';
  game.rangeRingEl.style.height = (r / 2) + 'px'; // half-height for semi-circle
}

function render() {
  // Dismiss enemy info popup if the tracked enemy died
  if (_enemyPopupEnemy && _enemyPopupEnemy.dead) dismissEnemyInfo();
  for (const e of game.enemies) {
    if (e.dead) continue;
    if (!e.el) {
      const pooled = _poolGet('enemy');
      if (pooled) {
        e.el = pooled;
        e.el.className = 'enemy ' + e.type;
        e.hpEl = e.el.querySelector('.enemy-hp');
        e.hpFillEl = e.el.querySelector('.enemy-hp-fill');
        e.spriteEl = e.el.querySelector('.enemy-sprite');
      } else {
        e.el = document.createElement('div');
        e.el.className = 'enemy ' + e.type;
        e.hpEl = document.createElement('div');
        e.hpEl.className = 'enemy-hp';
        e.hpFillEl = document.createElement('div');
        e.hpFillEl.className = 'enemy-hp-fill';
        e.hpEl.appendChild(e.hpFillEl);
        e.el.appendChild(e.hpEl);
        e.spriteEl = document.createElement('div');
        e.spriteEl.className = 'enemy-sprite';
        e.el.appendChild(e.spriteEl);
        // Attach click listener for enemy info popup
        e.el.addEventListener('click', _onEnemyClick);
        game.bf.appendChild(e.el);
      }
    }
    e.el.style.transform = `translate(${e.x}px, ${e.y}px) translate(-50%, -50%)`;
    // v0.7.19: rotate sprite toward tower. atan2 gives radians; convert to deg.
    // +90 because sprite art is drawn "facing up" by default; we want them facing
    // the tower which is below/center.
    const dx = game.towerX - e.x;
    const dy = game.towerY - e.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (e.spriteEl) e.spriteEl.style.transform = `rotate(${angle}deg)`;
    e.hpFillEl.style.width = (Math.max(0, e.hp) / e.hpMax * 100) + '%';
    if (e.auraBuffed && !e.el.classList.contains('buffed')) e.el.classList.add('buffed');
    else if (!e.auraBuffed && e.el.classList.contains('buffed')) e.el.classList.remove('buffed');
  }
  for (const p of game.projectiles) {
    if (p.dead) continue;
    if (!p.el) {
      const pooled = _poolGet('projectile');
      if (pooled) {
        p.el = pooled;
        p.el.className = 'projectile' + (p.crit ? ' crit' : '');
      } else {
        p.el = document.createElement('div');
        p.el.className = 'projectile' + (p.crit ? ' crit' : '');
        game.bf.appendChild(p.el);
      }
    }
    p.el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
  }
  for (const ep of game.enemyProjectiles) {
    if (ep.dead) continue;
    if (!ep.el) {
      const pooled = _poolGet('enemyProj');
      if (pooled) {
        ep.el = pooled;
        ep.el.className = 'projectile enemy';
      } else {
        ep.el = document.createElement('div');
        ep.el.className = 'projectile enemy';
        game.bf.appendChild(ep.el);
      }
    }
    ep.el.style.transform = `translate(${ep.x}px, ${ep.y}px) translate(-50%, -50%)`;
  }
  const hpPct = Math.max(0, game.hp / game.hpMax * 100);
  document.getElementById('hpFill').style.width = hpPct + '%';
  document.getElementById('hpText').textContent = `${Math.max(0, Math.floor(game.hp))} / ${Math.floor(game.hpMax)}`;
  document.getElementById('battleTier').textContent = 'T' + game.tier;
  document.getElementById('waveNum').textContent = 'W' + game.wave + (game.bossWave ? ' BOSS' : '');
  document.getElementById('cashDisp').textContent = formatNum(game.cash);
  document.getElementById('waveProg').textContent = `${game.enemiesKilledInWave}/${game.enemiesPerWave}`;

  // Shield bar — always visible
  const shieldWrap = document.getElementById('shieldBarWrap');
  if (shieldWrap) {
    const shieldMax = game.shieldMax || 0;
    const shieldCur = Math.max(0, game.shield || 0);
    const pct = shieldMax > 0 ? (shieldCur / shieldMax * 100) : 0;
    document.getElementById('shieldFill').style.width = pct + '%';
    document.getElementById('shieldText').textContent = `\u{1F6E1} ${Math.floor(shieldCur)} / ${Math.floor(shieldMax)}`;
  }

  // Battle info bar (bottom, between battlefield and upgrades)
  const binfoTier = document.getElementById('binfoTier');
  if (binfoTier) binfoTier.textContent = game.tier;
  const binfoWave = document.getElementById('binfoWave');
  if (binfoWave) binfoWave.textContent = game.wave;
  const binfoCash = document.getElementById('binfoCash');
  if (binfoCash) binfoCash.textContent = formatNum(game.cash);
  const binfoKills = document.getElementById('binfoKills');
  if (binfoKills) binfoKills.textContent = `${game.enemiesKilledInWave} / ${game.enemiesPerWave}`;
  const binfoScrap = document.getElementById('binfoScrap');
  if (binfoScrap) binfoScrap.textContent = formatNum(coinRewardForRun(game.wave, game.cashEarnedThisRun));

  // HUD resource cards (new for v0.7.7)
  const hudCoinsEl = document.getElementById('hudCoinsValue');
  if (hudCoinsEl) hudCoinsEl.textContent = formatNum(save.coins);
  const hudCashEl = document.getElementById('hudCashValue');
  if (hudCashEl) hudCashEl.textContent = formatNum(game.cash);
  const hudWaveLabel = document.getElementById('hudWaveLabel');
  if (hudWaveLabel) hudWaveLabel.textContent = 'T' + game.tier + ' W' + game.wave;
  const hudKillCount = document.getElementById('hudKillCount');
  if (hudKillCount) hudKillCount.textContent = game.enemiesKilledThisRun + ' kills';
  const coinPreview = document.getElementById('coinPreview');
  if (coinPreview) {
    const newCoins = formatNum(coinRewardForRun(game.wave, game.cashEarnedThisRun));
    if (coinPreview.textContent !== newCoins) {
      coinPreview.textContent = newCoins;
      coinPreview.classList.remove('coin-pulse');
      void coinPreview.offsetWidth;
      coinPreview.classList.add('coin-pulse');
    }
  }
  updateUpgradeAffordability();
  if (document.getElementById('liveStats').classList.contains('open')) renderLiveStats();
  updateRangeRing();
  updateOrbSystem();
  renderHeroActivesHud();
  renderAdBoostIndicator();
  if (typeof renderGlobalCurrencyBar === 'function') renderGlobalCurrencyBar();
}

function flashTower() {
  const base = game.towerEl.querySelector('.tower-base');
  if (!base) return;
  base.style.background = 'radial-gradient(circle at 50% 50%, var(--danger), #660022)';
  setTimeout(() => base.style.background = '', 100);
}

function spawnFloat(x, y, txt, cls) {
  let el = _poolGet('float');
  if (el) {
    el.className = 'float-text ' + (cls || 'dmg');
  } else {
    el = document.createElement('div');
    el.className = 'float-text ' + (cls || 'dmg');
    game.bf.appendChild(el);
  }
  el.textContent = txt;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.display = '';
  setTimeout(() => _poolReturn('float', el), 600);
}

function showWaveBanner(txt, boss) {
  const el = document.createElement('div');
  el.className = 'wave-banner' + (boss ? ' boss' : '');
  el.textContent = txt;
  game.bf.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ============================================================
// ENEMY INFO POPUP
// ============================================================
let _enemyPopupEl = null;
let _enemyPopupTimer = null;
let _enemyPopupEnemy = null;

function dismissEnemyInfo() {
  if (_enemyPopupEl) {
    _enemyPopupEl.remove();
    _enemyPopupEl = null;
  }
  if (_enemyPopupTimer) {
    clearTimeout(_enemyPopupTimer);
    _enemyPopupTimer = null;
  }
  _enemyPopupEnemy = null;
}

function _getSpeedClass(speedMul) {
  if (speedMul >= 1.2) return 'Fast';
  if (speedMul <= 0.6) return 'Slow';
  return 'Normal';
}

function _getEnemyTraits(type) {
  const traits = [];
  if (type === 'shooter') traits.push('Ranged attacker');
  if (type === 'augmenter') traits.push('Buffs nearby +30%');
  if (type === 'boss') traits.push('Every 25 waves');
  if (type === 'elite') traits.push('Rare, dangerous');
  if (type === 'tank') traits.push('High HP, slow hits');
  if (type === 'fast') traits.push('Low HP, fast attacks');
  return traits;
}

function showEnemyInfo(enemy) {
  return; // Disabled for tester builds
  if (!game.running || enemy.dead) return;
  // Dismiss any existing popup
  dismissEnemyInfo();
  _enemyPopupEnemy = enemy;

  const t = typeof ENEMY_TYPES !== 'undefined' ? ENEMY_TYPES[enemy.type] : null;
  const name = t ? t.name : enemy.type;
  const color = t ? t.color : 'var(--accent)';
  const hpCur = Math.max(0, Math.floor(enemy.hp));
  const hpMax = Math.floor(enemy.hpMax);
  const hpPct = Math.max(0, enemy.hp / enemy.hpMax * 100);
  const speedLabel = _getSpeedClass(enemy.speedMul);
  const unlockTier = t ? t.unlockTier : '?';
  const traits = _getEnemyTraits(enemy.type);

  const popup = document.createElement('div');
  popup.className = 'enemy-info-popup';
  popup.style.setProperty('--enemy-popup-color', color);

  let html = '<div class="enemy-popup-name">' + name + '</div>';
  html += '<div class="enemy-popup-hp-bar"><div class="enemy-popup-hp-fill" style="width:' + hpPct + '%"></div></div>';
  html += '<div class="enemy-popup-row"><span>HP</span><span>' + hpCur + ' / ' + hpMax + '</span></div>';
  html += '<div class="enemy-popup-row"><span>Speed</span><span>' + speedLabel + '</span></div>';
  html += '<div class="enemy-popup-row"><span>Tier</span><span>' + unlockTier + '</span></div>';
  if (enemy.auraBuffed) {
    html += '<div class="enemy-popup-row"><span>Status</span><span style="color:var(--good)">Buffed</span></div>';
  }
  for (let i = 0; i < traits.length; i++) {
    html += '<div class="enemy-popup-trait">' + traits[i] + '</div>';
  }
  popup.innerHTML = html;

  // Position near the enemy, offset above
  const bfRect = game.bf.getBoundingClientRect();
  let px = enemy.x;
  let py = enemy.y - 20; // above the enemy (zoomed out)
  // Clamp to battlefield bounds
  game.bf.appendChild(popup);
  const pw = popup.offsetWidth;
  const ph = popup.offsetHeight;
  if (px + pw / 2 > bfRect.width - 8) px = bfRect.width - pw / 2 - 8;
  if (px - pw / 2 < 8) px = pw / 2 + 8;
  if (py - ph < 8) py = enemy.y + 15; // flip below if too high
  popup.style.left = px + 'px';
  popup.style.top = py + 'px';
  popup.style.transform = 'translate(-50%, -100%)';

  _enemyPopupEl = popup;

  // Auto-dismiss after 3 seconds
  _enemyPopupTimer = setTimeout(dismissEnemyInfo, 3000);
}

function _onEnemyClick(ev) {
  ev.stopPropagation();
  return; // Disabled for tester builds
  if (!game.running) return;
  // Find the enemy object for this DOM element
  const el = ev.currentTarget;
  for (let i = 0; i < game.enemies.length; i++) {
    if (game.enemies[i].el === el && !game.enemies[i].dead) {
      showEnemyInfo(game.enemies[i]);
      return;
    }
  }
}

// ============================================================
// FOCUS TAP
// ============================================================
// ============================================================
// HERO ACTIVES HUD — side popup during battle, tap hero icon to activate
// ============================================================
let _heroHudEl = null;
let _heroHudPanel = null;
let _heroHudToggle = null;
let _heroHudOpen = false;
let _heroHudInitialized = false;
let _heroHudLastUpdate = 0;

function renderHeroActivesHud() {
  if (!_heroHudEl) _heroHudEl = document.getElementById('heroActivesHud');
  if (!_heroHudEl) return;
  if (!_heroHudPanel) _heroHudPanel = document.getElementById('heroHudPanel');
  if (!_heroHudToggle) _heroHudToggle = document.getElementById('heroHudToggle');

  // Hide entire HUD if not in battle or no heroes garrisoned
  const garrison = save.garrisonSlots || [];
  if (!game.running || typeof HERO_DEFS === 'undefined' || garrison.length === 0) {
    _heroHudEl.style.display = 'none';
    _heroHudOpen = false;
    _heroHudEl.classList.remove('open');
    return;
  }
  _heroHudEl.style.display = 'flex';

  // Wire toggle once
  if (!_heroHudInitialized && _heroHudToggle) {
    _heroHudToggle.addEventListener('pointerdown', function(e) {
      e.stopPropagation();
      _heroHudOpen = !_heroHudOpen;
      _heroHudEl.classList.toggle('open', _heroHudOpen);
      _heroHudLastUpdate = 0; // force refresh on open
    });
    _heroHudInitialized = true;
  }

  // Only update panel content if open (performance)
  if (!_heroHudOpen || !_heroHudPanel) return;

  // Rate-limit: only rebuild every 500ms instead of every frame
  const now = Date.now();
  if (now - _heroHudLastUpdate < 500) return;
  _heroHudLastUpdate = now;

  // Group by category
  const groups = { combat: [], defense: [], economy: [] };
  for (let i = 0; i < garrison.length; i++) {
    const hid = garrison[i];
    if (!hid || !HERO_DEFS[hid]) continue;
    const def = HERO_DEFS[hid];
    groups[def.category].push(hid);
  }

  // Count ready heroes for "Activate All" button
  let readyCount = 0;
  for (let i = 0; i < garrison.length; i++) {
    const hid = garrison[i];
    if (!hid || !HERO_DEFS[hid]) continue;
    const state = (typeof heroActiveState !== 'undefined') ? heroActiveState[hid] : null;
    const isActive = state && now < state.activeUntil;
    const onCooldown = state && now < state.cooldownUntil && !isActive;
    if (!isActive && !onCooldown) readyCount++;
  }

  let html = '';
  // "Activate All" button when multiple heroes are ready
  if (readyCount > 1) {
    html += `<button class="hah-activate-all" id="hahActivateAll">&#9889; ACTIVATE ALL (${readyCount})</button>`;
  }

  const catLabels = { combat: '&#9876; OFF', defense: '&#128737; DEF', economy: '&#128176; ECO' };
  const catColors = { combat: 'var(--danger)', defense: 'var(--good)', economy: 'var(--gold)' };
  for (const cat of ['combat', 'defense', 'economy']) {
    if (groups[cat].length === 0) continue;
    html += `<div class="hah-group"><div class="hah-group-label" style="color:${catColors[cat]}">${catLabels[cat]}</div>`;
    for (let i = 0; i < groups[cat].length; i++) {
      const hid = groups[cat][i];
      const def = HERO_DEFS[hid];
      const state = (typeof heroActiveState !== 'undefined') ? heroActiveState[hid] : null;
      const isActive = state && now < state.activeUntil;
      const onCooldown = state && now < state.cooldownUntil && !isActive;
      const cdSec = onCooldown ? Math.ceil((state.cooldownUntil - now) / 1000) : 0;
      const cls = isActive ? 'hah-hero active' : onCooldown ? 'hah-hero cd' : 'hah-hero ready';
      html += `<button class="${cls}" data-hah="${hid}">` +
        `<span class="hah-icon">${def.icon}</span>` +
        `<span class="hah-name">${def.name}</span>` +
        (isActive ? '<span class="hah-status" style="color:var(--good)">ON</span>' : '') +
        (onCooldown ? `<span class="hah-status">${cdSec}s</span>` : '') +
        (!isActive && !onCooldown ? '<span class="hah-status" style="color:var(--cyan2)">&#9889;</span>' : '') +
        `</button>`;
    }
    html += '</div>';
  }
  _heroHudPanel.innerHTML = html;

  // Wire "Activate All" button
  var activateAllBtn = document.getElementById('hahActivateAll');
  if (activateAllBtn) {
    activateAllBtn.addEventListener('pointerdown', function(e) {
      e.stopPropagation();
      var g = save.garrisonSlots || [];
      for (var i = 0; i < g.length; i++) {
        if (g[i] && typeof activateHeroAbility === 'function') {
          activateHeroAbility(g[i]);
        }
      }
      _heroHudLastUpdate = 0;
    });
  }

  // Wire individual activate clicks
  _heroHudPanel.querySelectorAll('[data-hah]').forEach(function(btn) {
    btn.addEventListener('pointerdown', function(e) {
      e.stopPropagation();
      var hid = this.getAttribute('data-hah');
      if (typeof activateHeroAbility === 'function') {
        activateHeroAbility(hid);
        _heroHudLastUpdate = 0; // force refresh after activation
      }
    });
  });
}

// ============================================================
// AD SPEED BOOST INDICATOR — shows 2x time remaining during battle
// ============================================================
let _adBoostIndicatorInitialized = false;

function renderAdBoostIndicator() {
  const el = document.getElementById('adBoostIndicator');
  if (!el) return;

  // Also update the battlefield ad speed button
  const adBtn = document.getElementById('bfAdSpeedBtn');
  const adLabel = document.getElementById('bfAdSpeedLabel');

  // Only show during battle
  if (!game.running) {
    el.style.display = 'none';
    if (adBtn) adBtn.style.display = 'none';
    return;
  }

  // Always show the ad button during battle
  if (adBtn) adBtn.style.display = '';

  const remaining = typeof adSpeedBoostRemaining === 'function' ? adSpeedBoostRemaining() : 0;

  // Update battlefield ad button state
  if (adBtn && adLabel) {
    if (remaining > 0) {
      adBtn.classList.add('boosted');
      const m = Math.ceil(remaining / 60000);
      adLabel.textContent = '2× ON';
    } else {
      adBtn.classList.remove('boosted');
      adLabel.textContent = '2× SPD';
    }
  }

  if (remaining <= 0) {
    el.style.display = 'none';
    el.classList.remove('expired');
    return;
  }

  el.style.display = 'flex';
  el.classList.remove('expired');

  // Format remaining time as MM:SS
  const totalSec = Math.ceil(remaining / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const timeStr = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

  const textEl = document.getElementById('adBoostText');
  if (textEl) textEl.textContent = '2× ' + timeStr;

  // Wire click handler once — show a toast with info
  if (!_adBoostIndicatorInitialized) {
    el.addEventListener('click', function() {
      const rem = typeof adSpeedBoostRemaining === 'function' ? adSpeedBoostRemaining() : 0;
      if (rem <= 0) return;
      const m = Math.ceil(rem / 60000);
      var toast = document.createElement('div');
      toast.className = 'skin-toast';
      toast.textContent = '2× Speed Boost: ' + m + ' min remaining';
      document.body.appendChild(toast);
      setTimeout(function() { toast.remove(); }, 2000);
    });
    _adBoostIndicatorInitialized = true;
  }
}

// ============================================================
// FOCUS TAP
// ============================================================
function setupTapFocus() {
  game.bf.addEventListener('pointerdown', (ev) => {
    if (!game.running) return;
    // Dismiss enemy popup on any battlefield tap
    if (_enemyPopupEl && !ev.target.closest('.enemy')) {
      dismissEnemyInfo();
    }
    const now = performance.now();
    if (now - game.lastFocusTime < 2000) return;
    game.lastFocusTime = now;
    const rect = game.bf.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    game.focusTarget = { x, y };
    game.focusShotsRemaining = 3;
    const marker = document.createElement('div');
    marker.className = 'focus-marker';
    marker.style.left = x + 'px';
    marker.style.top = y + 'px';
    game.bf.appendChild(marker);
    setTimeout(() => marker.remove(), 600);
  });
}
