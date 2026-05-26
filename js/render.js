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
  game.rangeRingEl.style.height = r + 'px';
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
  document.getElementById('battleTier').textContent = game.tier;
  document.getElementById('waveNum').textContent = game.wave + (game.bossWave ? ' BOSS' : '');
  document.getElementById('cashDisp').textContent = formatNum(game.cash);
  document.getElementById('waveProg').textContent = `${game.enemiesKilledInWave}/${game.enemiesPerWave}`;

  // Shield bar
  const shieldWrap = document.getElementById('shieldBarWrap');
  if (shieldWrap) {
    const shieldMax = game.shieldMax || 0;
    const shieldCur = Math.max(0, game.shield || 0);
    if (shieldMax > 0) {
      shieldWrap.style.display = '';
      document.getElementById('shieldFill').style.width = (shieldCur / shieldMax * 100) + '%';
      document.getElementById('shieldText').textContent = `${Math.floor(shieldCur)} / ${Math.floor(shieldMax)}`;
    } else {
      shieldWrap.style.display = 'none';
    }
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

  // HUD resource cards (new for v0.7.7)
  const hudCoinsEl = document.getElementById('hudCoinsValue');
  if (hudCoinsEl) hudCoinsEl.textContent = formatNum(save.coins);
  const hudCashEl = document.getElementById('hudCashValue');
  if (hudCashEl) hudCashEl.textContent = formatNum(game.cash);
  const hudWaveLabel = document.getElementById('hudWaveLabel');
  if (hudWaveLabel) hudWaveLabel.textContent = 'W' + game.wave;
  const hudKillCount = document.getElementById('hudKillCount');
  if (hudKillCount) hudKillCount.textContent = game.enemiesKilledThisRun + ' kills';
  const coinPreview = document.getElementById('coinPreview');
  const newCoins = formatNum(coinRewardForRun(game.wave, game.cashEarnedThisRun));
  if (coinPreview.textContent !== newCoins) {
    coinPreview.textContent = newCoins;
    coinPreview.classList.remove('coin-pulse');
    void coinPreview.offsetWidth;
    coinPreview.classList.add('coin-pulse');
  }
  updateUpgradeAffordability();
  if (document.getElementById('liveStats').classList.contains('open')) renderLiveStats();
  updateRangeRing();
  updateOrbSystem();
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
  let py = enemy.y - 40; // above the enemy
  // Clamp to battlefield bounds
  game.bf.appendChild(popup);
  const pw = popup.offsetWidth;
  const ph = popup.offsetHeight;
  if (px + pw / 2 > bfRect.width - 8) px = bfRect.width - pw / 2 - 8;
  if (px - pw / 2 < 8) px = pw / 2 + 8;
  if (py - ph < 8) py = enemy.y + 30; // flip below if too high
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
