// ============================================================
// ui.js — upgrades panel, live stats, HUD, screen routing, main menu, all tab renderers (Research, Goals, Loadout, Store, Skins, Settings), dev panel.
// Owned by: UI AI. Do not put combat math here.
// ============================================================

// ============================================================
// TIER LABELS — generates names for tiers 1–100
// ============================================================
function getTierLabel(tier) {
  var labels = ['Normal','Hard','Brutal','Inferno','Mythic','Ascended','Eternal','Omega',
                'Titan','Apex','Void','Abyssal','Celestial','Primordial','Transcendent',
                'Quantum','Singularity','Eclipse','Nexus','Infinity'];
  if (tier <= labels.length) return labels[tier - 1];
  return 'Tier ' + tier;
}

// ============================================================
// HAPTIC FEEDBACK — lightweight wrapper for Capacitor Haptics
// Falls back to navigator.vibrate on web. No-op on unsupported.
// ============================================================
function haptic(style) {
  // style: 'light' | 'medium' | 'heavy' | 'success' | 'error'
  try {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
      const h = window.Capacitor.Plugins.Haptics;
      if (style === 'success' || style === 'error') {
        h.notification({ type: style === 'success' ? 'SUCCESS' : 'ERROR' });
      } else {
        const map = { light: 'LIGHT', medium: 'MEDIUM', heavy: 'HEAVY' };
        h.impact({ style: map[style] || 'LIGHT' });
      }
    } else if (navigator.vibrate) {
      const ms = { light: 10, medium: 20, heavy: 40, success: [15, 50, 15], error: [30, 40, 30] };
      navigator.vibrate(ms[style] || 10);
    }
  } catch (_) { /* no-op */ }
}

// ============================================================
// TUTORIAL SYSTEM — guided first-time player experience
// ============================================================

// Progressive unlock gate: which features require what
function featureUnlocked(feature) {
  const runs = save.totalRuns || 0;
  const bestW1 = save.bestWavePerTier ? (save.bestWavePerTier[1] || 0) : 0;
  switch (feature) {
    case 'labs':       return true;  // always available
    case 'settings':   return true;  // always available
    case 'milestones': return runs >= 1;
    case 'shop':       return runs >= 1;
    case 'cards':      return runs >= 2;
    case 'skins':      return runs >= 3;
    case 'tournament': return bestW1 >= 50;
    default:           return true;
  }
}

// Show a tutorial tooltip anchored to a target element
function showTutorial(targetEl, message, opts) {
  return; // Disabled for tester builds
  dismissTutorial();
  const options = opts || {};
  const overlay = document.createElement('div');
  overlay.className = 'tutorial-overlay';
  overlay.id = 'tutorialOverlay';

  // Click-blocker backdrop — sits behind the cutout, captures stray clicks
  const backdrop = document.createElement('div');
  backdrop.className = 'tutorial-backdrop';
  backdrop.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
  overlay.appendChild(backdrop);

  const tooltip = document.createElement('div');
  tooltip.className = 'tutorial-tooltip';

  const msg = document.createElement('div');
  msg.className = 'tutorial-msg';
  msg.textContent = message;
  tooltip.appendChild(msg);

  if (options.btnText) {
    const btn = document.createElement('button');
    btn.className = 'tutorial-btn';
    btn.textContent = options.btnText;
    btn.addEventListener('click', () => {
      dismissTutorial();
      if (options.onBtn) options.onBtn();
    });
    tooltip.appendChild(btn);
  }

  overlay.appendChild(tooltip);
  document.body.appendChild(overlay);

  // Position tooltip near target
  if (targetEl) {
    targetEl.classList.add('tutorial-highlight');
    const rect = targetEl.getBoundingClientRect();
    const ttW = 280;
    let left = Math.max(10, rect.left + rect.width / 2 - ttW / 2);
    if (left + ttW > window.innerWidth - 10) left = window.innerWidth - ttW - 10;
    tooltip.style.width = ttW + 'px';

    // Place above or below depending on space
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow > 140 || spaceBelow > spaceAbove) {
      tooltip.style.top = (rect.bottom + 12) + 'px';
      tooltip.classList.add('arrow-top');
    } else {
      tooltip.style.bottom = (window.innerHeight - rect.top + 12) + 'px';
      tooltip.classList.add('arrow-bottom');
    }
    tooltip.style.left = left + 'px';

    // Cut-out highlight — make the target clickable through the overlay
    const cutout = document.createElement('div');
    cutout.className = 'tutorial-cutout';
    cutout.style.top = (rect.top - 4) + 'px';
    cutout.style.left = (rect.left - 4) + 'px';
    cutout.style.width = (rect.width + 8) + 'px';
    cutout.style.height = (rect.height + 8) + 'px';
    overlay.appendChild(cutout);
  } else {
    // Center tooltip if no target
    tooltip.style.left = '50%';
    tooltip.style.top = '40%';
    tooltip.style.transform = 'translate(-50%, -50%)';
  }
}

function dismissTutorial() {
  const overlay = document.getElementById('tutorialOverlay');
  if (overlay) overlay.remove();
  document.querySelectorAll('.tutorial-highlight').forEach(el => {
    el.classList.remove('tutorial-highlight');
  });
}

// Check tutorial state and show appropriate tooltip
function checkTutorial() {
  return; // DISABLED FOR TESTING
  if (!save || save.tutorialStep >= 99) return;
  const step = save.tutorialStep;

  if (step === 0) {
    // Fresh player — point at Begin Defense button
    const btn = document.getElementById('startBtn');
    if (btn) {
      showTutorial(btn, 'Welcome, Commander! Tap here to begin your first defense. Enemies will attack your Core — hold them off as long as you can!');
    }
  } else if (step === 2) {
    // After first death — jump to damage rank in Research
    if (activeSubmenu !== 'labs') {
      activeSubmenu = 'labs';
      activeResearchTab = 'combat';
      renderSubmenu();
    }
    setTimeout(() => {
      const dmgBtn = document.querySelector('.lab-buy[data-rank="damage"]');
      if (dmgBtn) {
        // Scroll the damage rank into view so the player can see it
        dmgBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          showTutorial(dmgBtn,
            'Great first run! Now spend your scrap on permanent upgrades. Buy Damage to hit harder next time!',
            { allowClick: true }
          );
        }, 350);
      }
    }, 300);
  } else if (step === 3) {
    // After first rank buy — point at Begin Defense again
    const btn = document.getElementById('startBtn');
    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        showTutorial(btn, 'Nice upgrade! Now jump back into battle — you\'ll deal more damage this time. Each run makes you stronger!');
      }, 350);
    }
  } else if (step === 5) {
    // After second run — brief overview, then complete
    const moreBtn = document.querySelector('.global-nav-btn[data-nav="more"]');
    showTutorial(moreBtn,
      'You\'re getting the hang of it! Explore MORE to find Goals, Store, and other features. They\'ll unlock as you progress. Good luck, Commander!',
      { btnText: 'Got it!', onBtn: () => {
        save.tutorialStep = 99;
        persistSave();
        renderMenu();
      }}
    );
  }
}

// ============================================================
// IN-RUN UPGRADES (tabbed)
// ============================================================
let activeUpgradeTab = 'offense';
const UPGRADE_TABS = {
  offense: { title: 'Offense', icon: '🚀', color: 'var(--danger)', keys: ['damage','attackSpeed','range','critChance','critPower','multishotChance','multishotPower','multishotTargets','bounceChance','bouncePower','bounceTargets'] },
  defense: { title: 'Defense', icon: '🛡', color: 'var(--accent)', keys: ['health','defense','shield','lifesteal','regen'] },
  economy: { title: 'Economy', icon: '💰', color: 'var(--gold)', keys: ['cashBonus','waveBonus','coinBonus','combo','bossBounty'] }
};

// Each in-run upgrade maps to an unlock family. If the family isn't
// owned, the upgrade is hidden from the battle panel.
// null = always visible (starter set).
const UPGRADE_UNLOCK_FAMILY = {
  // Starter — always visible
  damage:           null,
  attackSpeed:      null,
  health:           null,
  defense:          null,
  shield:           null,
  range:            null,
  cashBonus:        null,
  heal:             null,
  coinBonus:        null,
  // Gated by critSystems
  critChance:       'critSystems',
  critPower:        'critSystems',
  // Wave bonus is starter; boss bounty gated by economyExpansion
  waveBonus:        null,
  bossBounty:       'economyExpansion',
  // Gated by sustainSystems
  lifesteal:        'sustainSystems',
  regen:            'sustainSystems',
  // Gated by multishotSystems
  multishotChance:  'multishotSystems',
  multishotPower:   'multishotSystems',
  multishotTargets: 'multishotSystems',
  // Gated by bounceSystems
  bounceChance:     'bounceSystems',
  bouncePower:      'bounceSystems',
  bounceTargets:    'bounceSystems',
  // Gated by comboSystems
  combo:            'comboSystems'
};

function upgradeIsVisible(key) {
  const fam = UPGRADE_UNLOCK_FAMILY[key];
  if (!fam) return true;  // always visible
  return familyIsOwned(fam);
}

// Icon metadata per upgrade — rendered as colored tiles on the left of each upgrade button
const UPGRADE_ICONS = {
  damage:           { icon: '🚀', color: 'var(--danger)' },
  attackSpeed:      { icon: '⏫', color: 'var(--accent)' },
  critChance:       { icon: '✦',  color: 'var(--gold)' },
  critPower:        { icon: '✸',  color: 'var(--danger)' },
  multishotChance:  { icon: '↟',  color: 'var(--good)' },
  multishotPower:   { icon: '⇧',  color: 'var(--good)' },
  multishotTargets: { icon: '⋮⋮',  color: 'var(--accent)' },
  bounceChance:     { icon: '⤢',  color: 'var(--purple)' },
  bouncePower:      { icon: '⤨',  color: 'var(--purple)' },
  bounceTargets:    { icon: '⋰⋱',  color: 'var(--purple)' },
  health:           { icon: '♥',  color: 'var(--danger)' },
  defense:          { icon: '🛡', color: 'var(--accent)' },
  shield:           { icon: '⬡',  color: 'var(--purple)' },
  range:            { icon: '◎',  color: 'var(--accent)' },
  lifesteal:        { icon: '☖',  color: 'var(--good)' },
  regen:            { icon: '✚',  color: 'var(--good)' },
  cashBonus:        { icon: '$',  color: 'var(--good)' },
  waveBonus:        { icon: '≋',  color: 'var(--gold)' },
  combo:            { icon: '⚡', color: 'var(--gold)' },
  bossBounty:       { icon: '♛',  color: 'var(--gold)' },
  coinBonus:        { icon: '⊙',  color: 'var(--gold)' }
};

function renderUpgrades() {
  const wrap = document.getElementById('upgradesWrap');
  wrap.innerHTML = '';

  // Top row: heal on left, buy multiplier pill on the right (opposite)
  const topRow = document.createElement('div');
  topRow.className = 'upgrade-heal-slot';
  const healBtn = buildUpgradeBtn('heal');
  topRow.appendChild(healBtn);

  // Buy multiplier pill (mirrors the cost pill style)
  const bm = save.settings.buyMultiplier || 1;
  const bmLabel = bm === 'max' ? 'MAX' : '×' + bm;
  const bmBtn = document.createElement('button');
  bmBtn.className = 'upgrade-bm-btn';
  bmBtn.id = 'upgradeBmBtn';
  bmBtn.innerHTML = `<span class="upgrade-bm-label">BUY</span><span class="upgrade-bm-value">${bmLabel}</span>`;
  bmBtn.addEventListener('click', () => {
    cycleBuyMultiplier();
  });
  topRow.appendChild(bmBtn);
  wrap.appendChild(topRow);

  // Tabs with colored icons
  const tabs = document.createElement('div');
  tabs.className = 'upgrade-tabs';
  for (const tabKey of Object.keys(UPGRADE_TABS)) {
    const t = UPGRADE_TABS[tabKey];
    const btn = document.createElement('button');
    btn.className = 'upgrade-tab' + (activeUpgradeTab === tabKey ? ' active' : '');
    btn.dataset.tab = tabKey;
    btn.style.setProperty('--tab-color', t.color);
    btn.innerHTML = `<span class="upgrade-tab-icon">${t.icon}</span> <span>${t.title}</span>`;
    btn.addEventListener('click', () => {
      activeUpgradeTab = tabKey;
      renderUpgrades();
    });
    tabs.appendChild(btn);
  }
  wrap.appendChild(tabs);

  // Grid — filtered by unlock family (hide locked upgrades entirely)
  const grid = document.createElement('div');
  grid.className = 'upgrade-grid';
  const visibleKeys = UPGRADE_TABS[activeUpgradeTab].keys.filter(upgradeIsVisible);
  if (visibleKeys.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 20px 12px; color: var(--muted); font-size: 10px;';
    empty.innerHTML = `Nothing unlocked in this tab yet.<br><span style="color:var(--accent)">Buy system unlocks in the <b>Ranks</b> tab.</span>`;
    grid.appendChild(empty);
  } else {
    for (const key of visibleKeys) {
      grid.appendChild(buildUpgradeBtn(key));
    }
  }
  wrap.appendChild(grid);
}

function buildUpgradeBtn(key) {
  const u = game.upgrades[key];
  const btn = document.createElement('button');
  btn.className = 'upgrade-btn';
  if (key === 'heal') btn.classList.add('heal');
  btn.dataset.key = key;

  if (key === 'heal') {
    const healAmt = getHealAmount();
    const cost = getHealCost();
    btn.innerHTML = `
      <div class="upgrade-heal-icon">💊</div>
      <div class="upgrade-heal-body">
        <div class="upgrade-heal-name">HEAL</div>
        <div class="upgrade-heal-desc">Instantly restore ${formatNum(healAmt)} HP</div>
      </div>
      <div class="upgrade-heal-delta" data-delta>+${formatNum(healAmt)} HP</div>
      <div class="upgrade-heal-cost" data-cost><span class="cost-cash">$</span>${formatNum(cost)}</div>
    `;
    btn.addEventListener('click', () => buyInRun('heal'));
    return btn;
  }

  const maxed = u.max && u.level >= u.max;
  const desc = upgradeDescriptor(key);
  const deltaText = maxed ? 'MAXED' : `${desc.cur} → ${desc.next}${desc.unit}`;
  const costText = maxed ? '—' : formatNum(upgradeCost(u));
  const iconMeta = UPGRADE_ICONS[key] || { icon: '?', color: 'var(--accent)' };

  // Progress bar: for capped stats, show level/max; for uncapped, show log-scale L up to 500
  let progPct = 0;
  if (u.max) {
    progPct = Math.min(100, (u.level / u.max) * 100);
  } else {
    // Uncapped: just show a fill out to level 500 (purely cosmetic feedback)
    progPct = Math.min(100, (u.level / 500) * 100);
  }

  btn.style.setProperty('--upg-color', iconMeta.color);
  btn.innerHTML = `
    <div class="upgrade-body">
      <div class="upgrade-icon" style="color:${iconMeta.color};border-color:${iconMeta.color}">${iconMeta.icon}</div>
      <div class="upgrade-data">
        <div class="upgrade-name">${u.name.toUpperCase()}</div>
        <div class="upgrade-delta" data-delta>${deltaText}</div>
        <div class="upgrade-level" data-level>Lv. ${u.level}${u.max ? ' / ' + u.max : ''}</div>
      </div>
    </div>
    <div class="upgrade-prog"><div class="upgrade-prog-fill" style="width:${progPct}%;background:${iconMeta.color}"></div></div>
    <div class="upgrade-cost" data-cost><span class="cost-cash">$</span>${costText}</div>
  `;
  attachHoldToBuy(btn, () => buyInRun(key));
  return btn;
}

// Hold-to-buy: tap = 1 buy, hold past 300ms = rapid repeat with acceleration.
// Fixes the old bug where quick taps fired multiple buys.
function attachHoldToBuy(btn, buyFn) {
  let holdStartTime = 0;
  let holdTimer = null;
  let repeating = false;
  let holdInterval = 250;
  let startedRepeat = false;

  function doRepeatBuy() {
    if (!repeating) return;
    const ok = buyFn();
    if (ok === false) {
      stopHold();
      return;
    }
    // Accelerate
    if (holdInterval > 50) {
      holdInterval = Math.max(50, Math.floor(holdInterval * 0.75));
    }
    holdTimer = setTimeout(doRepeatBuy, holdInterval);
  }

  function startHold(ev) {
    if (ev) ev.preventDefault();
    holdStartTime = performance.now();
    repeating = false;
    startedRepeat = false;
    holdInterval = 250;
    // Wait 300ms before starting rapid-fire. This way a quick tap doesn't trigger it.
    holdTimer = setTimeout(() => {
      repeating = true;
      startedRepeat = true;
      doRepeatBuy();
    }, 300);
  }

  function stopHold(ev) {
    if (ev) ev.preventDefault();
    const heldMs = performance.now() - holdStartTime;
    repeating = false;
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    // If user released BEFORE the 300ms repeat started, this was a regular tap — fire once now.
    if (!startedRepeat && heldMs < 300 && heldMs > 0) {
      buyFn();
    }
    holdStartTime = 0;
    startedRepeat = false;
  }

  function cancelHold() {
    repeating = false;
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    holdStartTime = 0;
    startedRepeat = false;
  }

  btn.addEventListener('pointerdown', startHold);
  btn.addEventListener('pointerup', stopHold);
  btn.addEventListener('pointerleave', cancelHold);
  btn.addEventListener('pointercancel', cancelHold);
  // Block the synthetic click so it doesn't double-fire after pointerup
  btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
}

function buyInRun(key) {
  const u = game.upgrades[key];
  if (key === 'heal') {
    const cost = getHealCost();
    if (game.cash < cost) return false;
    if (game.hp >= game.hpMax) return false;
    game.cash -= cost;
    const heal = getHealAmount();
    const actual = applyHealToTower(heal);
    if (save.settings.showFloatingHeals) {
      spawnFloat(game.towerX, game.towerY - 30, '+' + actual + ' HP', 'heal');
    }
    game.healsUsed++;
    refreshBtn(key);
    return true;
  }
  // Multi-buy: buy up to 'targetCount' copies respecting affordability and max cap.
  const mulSetting = save.settings.buyMultiplier || 1;
  let maxToBuy;
  if (mulSetting === 'max') {
    maxToBuy = 10000; // effectively "until can't afford / reach max"
  } else {
    maxToBuy = mulSetting;
  }

  // For numeric multiplier (x10 etc), pre-validate total cost of all N levels
  if (typeof mulSetting === 'number' && mulSetting > 1) {
    const remaining = (u.max !== undefined) ? (u.max - u.level) : maxToBuy;
    const want = Math.min(mulSetting, remaining);
    let totalCost = 0;
    for (let i = 0; i < want; i++) {
      totalCost += Math.floor(u.cost0 * Math.pow(u.costMul, u.level + i));
    }
    if (game.cash < totalCost) return false; // Can't afford full batch
  }

  let bought = 0;
  while (bought < maxToBuy) {
    if (u.max !== undefined && u.level >= u.max) break;
    const cost = upgradeCost(u);
    if (game.cash < cost) break;
    game.cash -= cost;
    u.level++;
    bought++;
    if (key === 'health') {
      const newMax = getMaxHp();
      const diff = newMax - game.hpMax;
      game.hpMax = newMax;
      game.hp += diff;
    }
    if (key === 'shield') {
      const newCap = getBarrierShieldMax();
      const diff = newCap - (game.barrierCap || 0);
      game.barrierCap = newCap;
      game.shieldMax = Math.max(game.shieldMax, newCap);
      game.shield = Math.min(newCap, game.shield + diff);
    }
  }
  if (bought === 0) return false;
  // Track daily upgrade purchases for daily objective
  var today = Math.floor(Date.now() / 86400000);
  if (!save._dailyUpgradeDay || save._dailyUpgradeDay !== today) {
    save._dailyUpgradeDay = today;
    save._dailyUpgradeCount = 0;
  }
  save._dailyUpgradeCount = (save._dailyUpgradeCount || 0) + bought;
  if (key === 'range') updateRangeRing();
  refreshBtn(key);
  return true;
}

function refreshBtn(key) {
  const btn = document.querySelector(`.upgrade-btn[data-key="${key}"]`);
  if (!btn) return;
  const u = game.upgrades[key];
  if (key === 'heal') {
    const amt = getHealAmount();
    const deltaEl = btn.querySelector('[data-delta]');
    const costEl = btn.querySelector('[data-cost]');
    if (deltaEl) deltaEl.textContent = `+${formatNum(amt)} HP`;
    const descEl = btn.querySelector('.upgrade-heal-desc');
    if (descEl) descEl.textContent = `Instantly restore ${formatNum(amt)} HP`;
    if (costEl) costEl.innerHTML = `<span class="cost-cash">$</span>${formatNum(getHealCost())}`;
  } else {
    const maxed = u.max && u.level >= u.max;
    const desc = upgradeDescriptor(key);
    const deltaEl = btn.querySelector('[data-delta]');
    const levelEl = btn.querySelector('[data-level]');
    const costEl = btn.querySelector('[data-cost]');
    if (deltaEl) deltaEl.textContent = maxed ? 'MAXED' : `${desc.cur} → ${desc.next}${desc.unit}`;
    if (levelEl) levelEl.textContent = `Lv. ${u.level}${u.max ? ' / ' + u.max : ''}`;
    if (costEl) costEl.innerHTML = maxed ? '—' : `<span class="cost-cash">$</span>${formatNum(upgradeCost(u))}`;
    // Update progress bar
    const progFill = btn.querySelector('.upgrade-prog-fill');
    if (progFill) {
      let pct;
      if (u.max) pct = Math.min(100, (u.level / u.max) * 100);
      else pct = Math.min(100, (u.level / 500) * 100);
      progFill.style.width = pct + '%';
    }
  }
  btn.classList.add('pulse-once');
  setTimeout(() => btn.classList.remove('pulse-once'), 250);
}

function updateUpgradeAffordability() {
  // Scope to battle upgrade panel only — home rank cards also use .upgrade-btn
  // but have data-rank instead of data-key and must not be touched here.
  const wrap = document.getElementById('upgradesWrap');
  if (!wrap) return;
  const btns = wrap.querySelectorAll('.upgrade-btn');
  for (const btn of btns) {
    const key = btn.dataset.key;
    if (key === 'heal') {
      const can = game.cash >= getHealCost() && game.hp < game.hpMax;
      btn.disabled = !can;
      btn.classList.toggle('affordable', can);
      const costEl = btn.querySelector('[data-cost]');
      if (costEl) costEl.textContent = '$' + formatNum(getHealCost());
      continue;
    }
    const u = game.upgrades[key];
    if (!u) continue; // safety guard for non-battle buttons
    const maxed = u.max && u.level >= u.max;
    if (maxed) {
      btn.disabled = true;
      btn.classList.remove('affordable');
      continue;
    }
    const cost = upgradeCost(u);
    const can = game.cash >= cost;
    btn.disabled = !can;
    btn.classList.toggle('affordable', can);
  }
}

// ============================================================
// LIVE STATS
// ============================================================
function renderLiveStats() {
  const el = document.getElementById('liveStats');
  // Expected shots per volley: targets × (1 + chance × power)
  const avgShots = getMultishotTargets() * (1 + getMultishotChance() * getMultishotPower());
  const dps = getDamage() / (getAttackInterval() / 1000) * avgShots;
  const hpNow = enemyHpForWave(game.wave);
  const dmgNow = damageToTowerForWave(game.wave);
  const cashNow = cashRewardForWave(game.wave);
  const speedNow = enemySpeedForWave(game.wave);
  let types = '';
  for (const key of Object.keys(ENEMY_TYPES)) {
    const t = ENEMY_TYPES[key];
    if (key === 'boss' && !game.bossWave) continue;
    if (game.tier < t.unlockTier) continue;
    types += `
      <div style="background:var(--panel-2);border:1px solid var(--accent-dim);border-radius:4px;padding:5px 6px;font-size:10px">
        <div style="color:var(--accent);font-weight:bold;display:flex;align-items:center;gap:6px;margin-bottom:2px">
          <span style="width:10px;height:10px;border-radius:50%;display:inline-block;background:${t.color}"></span>${t.name}
        </div>
        <div style="color:var(--muted);font-size:9px;line-height:1.4">
          HP: <b style="color:var(--text)">${formatNum(Math.floor(hpNow * t.hpMul))}</b><br>
          Dmg: <b style="color:var(--text)">${formatNum(Math.floor(dmgNow * t.dmgMul))}</b><br>
          Spd: <b style="color:var(--text)">${(speedNow * t.speedMul).toFixed(0)} px/s</b>
        </div>
      </div>
    `;
  }
  el.innerHTML = `
    <div class="live-stats-title">Your Core</div>
    <div class="live-stats-grid">
      <div class="live-stat-cell"><div class="live-stat-label">Damage</div><div class="live-stat-val">${formatStat(getDamage())}</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">DPS (est)</div><div class="live-stat-val gold">${formatNum(dps)}</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Fire Rate</div><div class="live-stat-val">${getAttackSpeed().toFixed(2)}/s</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Max HP</div><div class="live-stat-val">${formatStat(getMaxHp())}</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Crit Chance</div><div class="live-stat-val">${(getCritChance() * 100).toFixed(0)}%</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Crit Power</div><div class="live-stat-val">×${getCritPower().toFixed(2)}</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Armor</div><div class="live-stat-val good">${(getDefenseFraction() * 100).toFixed(1)}%</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Lifesteal</div><div class="live-stat-val good">${(getLifestealFraction() * 100).toFixed(1)}%</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Regen</div><div class="live-stat-val good">${(getRegenPctPerSec() * 100).toFixed(2)}%/s</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Range</div><div class="live-stat-val">${Math.round(getRange())}</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Multishot</div><div class="live-stat-val">${(getMultishotChance()*100).toFixed(0)}% · ×${getMultishotPower().toFixed(2)} · ${getMultishotTargets()}T</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Bounce</div><div class="live-stat-val">${(getBounceChance()*100).toFixed(0)}% · ×${getBouncePower().toFixed(2)} · ${getBounceTargets()}B</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Cash mul</div><div class="live-stat-val gold">×${getCashMul().toFixed(2)}</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Combo</div><div class="live-stat-val gold">×${getCurrentComboMul().toFixed(2)} (${Math.floor(game.comboCount)})</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Bosses beat</div><div class="live-stat-val good">${game.bossesDefeated}</div></div>
    </div>
    <div class="live-stats-title">This wave's enemies</div>
    <div class="live-stats-grid">
      <div class="live-stat-cell"><div class="live-stat-label">Base HP</div><div class="live-stat-val danger">${formatNum(hpNow)}</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Base Dmg</div><div class="live-stat-val danger">${formatNum(dmgNow)}</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Cash/kill</div><div class="live-stat-val gold">${formatNum(cashNow)}</div></div>
      <div class="live-stat-cell"><div class="live-stat-label">Shots to kill</div><div class="live-stat-val">${Math.ceil(hpNow / Math.max(1, getDamage()))}</div></div>
    </div>
    <div class="live-stats-title">Types active</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">${types}</div>
  `;
}

function toggleLiveStats() {
  const el = document.getElementById('liveStats');
  el.classList.toggle('open');
  if (el.classList.contains('open')) renderLiveStats();
}

// ============================================================
// HUD
// ============================================================
function renderHud() {
  const hud = document.getElementById('hud');
  const inBattle = game.running;
  // Wire the static END button in the battle status bar (once)
  var hpEndBtn = document.getElementById('hpEndBtn');
  if (hpEndBtn && !hpEndBtn._wired) {
    hpEndBtn._wired = true;
    hpEndBtn.addEventListener('click', function() { if (typeof endRunConfirm === 'function') endRunConfirm(); });
  }
  if (inBattle) {
    // HUD is minimal during battle — info lives in the status strip
    var battleDev = save.settings.devMode ? '<button class="hud-dev-btn" id="hudBattleDevBtn">⚙</button>' : '';
    hud.innerHTML = battleDev;
    var bDev = document.getElementById('hudBattleDevBtn');
    if (bDev) bDev.addEventListener('click', openDevPanel);
  } else {
    // Home screen: no HUD bar — stats live in the mock-hud inside homePanels
    const devBtn = save.settings.devMode ? `<button class="hud-dev-pill" id="hudDevBtn">⚙</button>` : '';
    hud.innerHTML = devBtn;
    if (!devBtn) hud.style.display = 'none';
    else hud.style.display = '';
    const dev = document.getElementById('hudDevBtn');
    if (dev) dev.addEventListener('click', openDevPanel);
  }
  // Side buttons (battlefield left/right) are wired independently — they exist outside hud,
  // see wireBattlefieldSideButtons(). Re-wire on every HUD refresh is not needed.

  // Keep Return to Battle label fresh (shows live HP when in overlay)
  const rtbHp = document.getElementById('returnToBattleHp');
  if (rtbHp) {
    if (game.running) {
      const hp = Math.max(0, Math.floor(game.hp));
      const hpMax = Math.floor(game.hpMax);
      rtbHp.textContent = `W${game.wave} · ${formatNum(hp)}/${formatNum(hpMax)} HP`;
    } else {
      rtbHp.textContent = '';
    }
  }
}

// Cycle buy multiplier 1 → 10 → 100 → max → 1
function cycleBuyMultiplier() {
  const cur = save.settings.buyMultiplier || 1;
  const order = [1, 10, 100, 'max'];
  const idx = order.findIndex(v => v === cur);
  save.settings.buyMultiplier = order[(idx + 1) % order.length];
  persistSave();
  renderHud();
  // If in battle with upgrades visible, also re-render them so their buy multiplier buttons update
  if (game.running) renderUpgrades();
}

// Wire the battlefield side buttons (speed + stats). Called once on DOM ready.
function wireBattlefieldSideButtons() {
  const spd = document.getElementById('bfSpeedBtn');
  if (spd) {
    spd.addEventListener('click', () => {
      const maxSpeed = maxUnlockedSpeed();
      let cur = save.settings.gameSpeed || 1;
      cur = cur + 1;
      if (cur > maxSpeed) cur = 1;
      save.settings.gameSpeed = cur;
      persistSave();
      updateBattlefieldSpeedLabel();
    });
  }
  const stats = document.getElementById('bfStatsBtn');
  if (stats) stats.addEventListener('click', toggleLiveStats);
  updateBattlefieldSpeedLabel();
}

function updateBattlefieldSpeedLabel() {
  const v = document.getElementById('bfSpeedValue');
  if (v) v.textContent = '×' + (save.settings.gameSpeed || 1);
}

// ============================================================
// SCREEN ROUTING
// ============================================================
function showScreen(name) {
  // Always clear overlay mode when transitioning between screens.
  const menu = document.getElementById('screen-menu');
  menu.classList.remove('overlay');
  menu.classList.toggle('active', name === 'menu');
  document.getElementById('screen-battle').classList.toggle('active', name === 'battle');
  // Hide bottom nav AND top HUD during battle — fullscreen battlefield
  const sub = document.getElementById('submenu');
  if (sub) sub.style.display = (name === 'battle') ? 'none' : '';
  const hud = document.getElementById('hud');
  if (hud) hud.style.display = (name === 'battle') ? 'none' : '';
  const gnav = document.getElementById('globalNav');
  if (gnav) gnav.style.display = (name === 'battle') ? 'none' : '';
  renderHud();
  updateGlobalNavActive();
}

// Global nav: bottom bar with 7 direct tabs matching submenu (RANKS/GOALS/LOADOUT/TOURNEY/STORE/SKINS/SETTINGS).
function wireGlobalNav() {
  document.querySelectorAll('.global-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.nav;

      // Gate locked features
      if (!featureUnlocked(target)) {
        const t2 = document.createElement('div');
        t2.className = 'skin-toast';
        t2.textContent = target === 'tournament' ? 'Reach Wave 50 on Tier 1 to unlock!' : 'Keep playing to unlock this feature!';
        document.body.appendChild(t2);
        setTimeout(() => t2.remove(), 2000);
        return;
      }

      // If in battle overlay and tapping same tab, close overlay
      if (game.running && isOverlayActive() && activeSubmenu === target) {
        closeMenuOverlay();
        return;
      }

      activeSubmenu = target;
      if (game.running) {
        openMenuOverlay();
      } else {
        setHomeView(false);
        renderSubmenu();
        showScreen('menu');
      }
      updateGlobalNavActive();
    });
  });
  const rtb = document.getElementById('returnToBattleBtn');
  if (rtb) rtb.addEventListener('click', closeMenuOverlay);
}

// The "MORE" sheet — a popover of the less-frequent tabs.
function openMoreSheet() {
  let sheet = document.getElementById('moreSheet');
  if (!sheet) {
    sheet = document.createElement('div');
    sheet.id = 'moreSheet';
    sheet.className = 'more-sheet';
    sheet.innerHTML = `
      <div class="more-sheet-backdrop"></div>
      <div class="more-sheet-panel">
        <div class="more-sheet-title">MORE</div>
        <div class="more-sheet-grid">
          <button class="more-sheet-btn" data-more="shop">
            <span class="more-sheet-icon">🛒</span>
            <span class="more-sheet-label">STORE</span>
          </button>
          <button class="more-sheet-btn" data-more="milestones">
            <span class="more-sheet-icon">🎯</span>
            <span class="more-sheet-label">GOALS</span>
          </button>
          <button class="more-sheet-btn" data-more="tournament">
            <span class="more-sheet-icon">🏆</span>
            <span class="more-sheet-label">TOURNEY</span>
          </button>
          <button class="more-sheet-btn" data-more="skins">
            <span class="more-sheet-icon">🎨</span>
            <span class="more-sheet-label">SKINS</span>
          </button>
          <button class="more-sheet-btn" data-more="settings">
            <span class="more-sheet-icon">⚙</span>
            <span class="more-sheet-label">SETTINGS</span>
          </button>
        </div>
        <button class="more-sheet-close">CLOSE</button>
      </div>
    `;
    document.body.appendChild(sheet);
    sheet.querySelector('.more-sheet-backdrop').addEventListener('click', closeMoreSheet);
    sheet.querySelector('.more-sheet-close').addEventListener('click', closeMoreSheet);
    sheet.querySelectorAll('.more-sheet-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.more;
        if (!featureUnlocked(target)) {
          // Show locked feedback
          const t2 = document.createElement('div');
          t2.className = 'skin-toast';
          t2.textContent = target === 'tournament' ? 'Reach Wave 50 on Tier 1 to unlock!' : 'Keep playing to unlock this feature!';
          document.body.appendChild(t2);
          setTimeout(() => t2.remove(), 2000);
          return;
        }
        activeSubmenu = target;
        closeMoreSheet();
        if (game.running) openMenuOverlay();
        else { setHomeView(false); renderSubmenu(); showScreen('menu'); }
      });
    });
  }
  // Update lock state on each open
  sheet.querySelectorAll('.more-sheet-btn').forEach(btn => {
    const target = btn.dataset.more;
    const locked = !featureUnlocked(target);
    btn.classList.toggle('more-locked', locked);
  });
  sheet.classList.add('visible');
}

function closeMoreSheet() {
  const sheet = document.getElementById('moreSheet');
  if (sheet) sheet.classList.remove('visible');
}

// Show the menu as an overlay on top of an active battle. The battle
// loop keeps running — enemies move, tower fires, death can happen.
function openMenuOverlay() {
  const menu = document.getElementById('screen-menu');
  menu.classList.add('overlay');
  menu.classList.add('active');
  const rtb = document.getElementById('returnToBattleBtn');
  if (rtb) rtb.classList.add('visible');
  // Show bottom nav for menu overlay navigation
  const sub = document.getElementById('submenu');
  if (sub) sub.style.display = '';
  setHomeView(false);
  renderSubmenu();
  updateGlobalNavActive();
}

// Dismiss the overlay and return to the live battlefield.
function closeMenuOverlay() {
  const menu = document.getElementById('screen-menu');
  menu.classList.remove('overlay');
  menu.classList.remove('active');
  const rtb = document.getElementById('returnToBattleBtn');
  if (rtb) rtb.classList.remove('visible');
  // Hide bottom nav again — back to pure battle view
  const sub = document.getElementById('submenu');
  if (sub) sub.style.display = 'none';
  updateGlobalNavActive();
}

// Returns true if menu is currently overlaying a running battle
function isOverlayActive() {
  const menu = document.getElementById('screen-menu');
  return menu && menu.classList.contains('overlay') && menu.classList.contains('active');
}

// Highlight the active bottom nav button based on the current submenu tab.
function updateGlobalNavActive() {
  const onMenu = document.getElementById('screen-menu').classList.contains('active');
  // Update old global nav (hidden but kept for compat)
  document.querySelectorAll('.global-nav-btn').forEach(btn => {
    const nav = btn.dataset.nav;
    const match = onMenu && !homeViewActive && activeSubmenu === nav;
    btn.classList.toggle('active', match);
  });
  // Update submenu (primary fixed bottom nav)
  document.querySelectorAll('.submenu-btn').forEach(btn => {
    const tab = btn.dataset.tab;
    if (tab === 'home') {
      btn.classList.toggle('active', onMenu && homeViewActive);
    } else {
      const match = onMenu && !homeViewActive && activeSubmenu === tab;
      btn.classList.toggle('active', match);
    }
  });
}
// Alias for submenu callers
function updateSubmenuActive() { updateGlobalNavActive(); }

// ============================================================
// MAIN MENU
// ============================================================
let activeSubmenu = 'home';
// Whether the home view (hero/tier/daily/panels) is showing vs a submenu tab
let homeViewActive = true;

// Toggle home-specific sections vs submenu content.
// When home is active: hero, tier select, daily, panels are visible; submenu content hidden.
// When a tab is active: those home sections hide; submenu content shown.
function setHomeView(show) {
  homeViewActive = show;
  // Old hero + tier-select are replaced by the showcase in homePanels — hide them always
  const oldHero = document.querySelector('.menu-hero');
  const oldTier = document.querySelector('.tier-select');
  if (oldHero) oldHero.style.display = 'none';
  if (oldTier) oldTier.style.display = 'none';
  const els = [
    document.getElementById('homeUpgrades'),
    document.getElementById('homeDaily'),
    document.getElementById('homePanels')
  ];
  for (var i = 0; i < els.length; i++) {
    if (els[i]) els[i].style.display = show ? '' : 'none';
  }
  var sc = document.getElementById('submenuContent');
  if (sc) sc.style.display = show ? 'none' : '';
}

function renderMenu() {
  const sel = save.selectedTier;
  const max = highestUnlockedTier();
  document.getElementById('tierSelected').textContent = sel;
  const mul = tierMultiplier(sel);
  // Build enemy type list for this tier
  const unlockedTypes = [];
  for (const key of Object.keys(ENEMY_TYPES)) {
    if (key === 'boss') continue;
    if (ENEMY_TYPES[key].unlockTier <= sel) unlockedTypes.push(ENEMY_TYPES[key].name);
  }
  const typesStr = unlockedTypes.join(', ');
  document.getElementById('tierMul').textContent = `×${mul.toFixed(2)} · ${typesStr}`;
  document.getElementById('tierDown').disabled = sel <= 1;
  document.getElementById('tierUp').disabled = sel >= max;
  const info = document.getElementById('tierInfo');
  const bestOnSel = save.bestWavePerTier[sel] || 0;
  if (sel === max && max < MAX_TIER) {
    const wavesNeeded = 50 - bestOnSel;
    const pct = Math.min(100, (bestOnSel / 50) * 100);
    info.innerHTML = wavesNeeded > 0
      ? `<span>W50 on T${sel} to unlock T${sel + 1}</span><div class="tier-unlock-bar"><div class="tier-unlock-fill" style="width:${pct}%"></div></div>`
      : `<span style="color:var(--good)">T${sel + 1} ready · complete any run</span>`;
  } else if (sel === MAX_TIER) {
    info.textContent = `Max difficulty`;
  } else {
    info.innerHTML = `Best on T${sel}: <b>W${bestOnSel}</b>`;
  }
  document.getElementById('startBtn').textContent = `Begin Defense (T${sel})`;
  // pick a tagline deterministically (doesn't change every render)
  const tag = TAGLINES[save.totalRuns % TAGLINES.length];
  document.getElementById('menuTagline').textContent = tag;

  // Username badge under tagline
  const taglineEl = document.getElementById('menuTagline');
  if (taglineEl && save.username) {
    const existing = document.querySelector('.menu-username');
    if (existing) existing.remove();
    const badge = document.createElement('div');
    badge.className = 'menu-username';
    badge.textContent = save.username;
    taglineEl.parentNode.insertBefore(badge, taglineEl.nextSibling);
  }

  // Drive the home battlefield preview from the equipped skin
  const previewCore = save.equippedCoreSkin || 'sentinel';
  const previewBg = save.equippedBgSkin || 'cyber_grid';
  document.body.setAttribute('data-preview-core', previewCore);
  document.body.setAttribute('data-preview-bg', previewBg);
  const coreNames = { sentinel:'SENTINEL', industrial:'INDUSTRIAL', verdant:'VERDANT',
                      aegis:'AEGIS', frost:'FROST', royal:'ROYAL' };
  const previewLabel = document.getElementById('menuPreviewLabel');
  if (previewLabel) previewLabel.textContent = `CORE: ${coreNames[previewCore] || 'SENTINEL'}`;

  renderHomePanelsVisual();
  setHomeView(true);
  renderSubmenu();
}

function renderHomePanels() {
  const el = document.getElementById('homePanels');
  if (!el) return;

  const sel = save.selectedTier;
  const bestThisTier = save.bestWavePerTier[sel] || 0;
  const maxTier = highestUnlockedTier();
  const equippedCount = save.equippedCards.filter(c => c && CARD_POOL[c]).length;
  const totalSlots = getUnlockedSlots();

  // --- Left: Recent Progress ---
  const progressPct = Math.min(100, (bestThisTier / 50) * 100);
  const nextTierReady = bestThisTier >= 50 && sel < MAX_TIER;

  let progressHTML = `
    <div class="home-panel home-progress">
      <div class="home-panel-header">
        <span class="home-panel-title">PROGRESS</span>
      </div>
      <div class="home-progress-stats">
        <div class="home-stat">
          <div class="home-stat-value">W${bestThisTier}</div>
          <div class="home-stat-label">Best T${sel}</div>
        </div>
        <div class="home-stat">
          <div class="home-stat-value">${save.totalRuns}</div>
          <div class="home-stat-label">Runs</div>
        </div>
      </div>
      <div class="home-progress-bar-wrap">
        <div class="home-progress-bar" style="width:${progressPct}%"></div>
        <div class="home-progress-label">${nextTierReady ? 'T' + (sel + 1) + ' READY' : bestThisTier + '/50'}</div>
      </div>
    </div>`;

  // --- Center: Tier Milestones ---
  let claimableCount = 0;
  let milestonesHTML = '';
  const showWaves = [25, 50, 100, 200, 500, 1000];
  for (const w of showWaves) {
    const key = milestoneKey(sel, w);
    const claimed = save.claimedMilestones[key];
    const ready = milestoneReady(sel, w) && !claimed;
    if (ready) claimableCount++;
    const cls = claimed ? 'claimed' : ready ? 'ready' : 'locked';
    const label = claimed ? '✓' : ready ? '!' : (w >= 1000 ? '1K' : w);
    milestonesHTML += `<div class="home-ms-dot ${cls}">${label}</div>`;
  }

  let tiersHTML = `
    <div class="home-panel home-milestones">
      <div class="home-panel-header">
        <span class="home-panel-title">MILESTONES</span>
        ${claimableCount > 0 ? `<span class="home-panel-badge">${claimableCount}</span>` : ''}
      </div>
      <div class="home-ms-row">${milestonesHTML}</div>
    </div>`;

  // --- Right: Loadout Preview ---
  let cardsHTML = '';
  for (let i = 0; i < Math.min(totalSlots, 6); i++) {
    const cid = save.equippedCards[i];
    if (cid && CARD_POOL[cid]) {
      const card = CARD_POOL[cid];
      const inv = save.cardInventory[cid] || { level: 1 };
      cardsHTML += `<div class="home-card-slot filled" data-card="${card.id}">
        <span class="home-card-name">${card.name}</span>
        <span class="home-card-lvl">Lv ${inv.level}</span>
      </div>`;
    } else {
      cardsHTML += `<div class="home-card-slot empty">+</div>`;
    }
  }

  let loadoutHTML = `
    <div class="home-panel home-loadout">
      <div class="home-panel-header">
        <span class="home-panel-title">LOADOUT</span>
        <span class="home-panel-count">${equippedCount}/${totalSlots}</span>
      </div>
      <div class="home-card-row">${cardsHTML}</div>
    </div>`;

  // --- Battle Readiness: key stats for the selected tier ---
  const totalRanks = Object.keys(save.ranks).reduce((s, r) => s + ((save.ranks[r] && save.ranks[r].level) || 0), 0);
  const dmgBonus = rankFlatBonus('damage');
  const hpBonus = rankFlatBonus('coreHealth');
  const scrapAmt = formatNum(save.coins);
  let readinessHTML = `
    <div class="home-panel home-readiness">
      <div class="home-panel-header">
        <span class="home-panel-title">BATTLE READY</span>
      </div>
      <div class="home-readiness-stats">
        <div class="home-stat">
          <div class="home-stat-value" style="color:var(--danger)">+${dmgBonus.toFixed(1)}</div>
          <div class="home-stat-label">Dmg Bonus</div>
        </div>
        <div class="home-stat">
          <div class="home-stat-value" style="color:var(--good)">+${hpBonus.toFixed(0)}</div>
          <div class="home-stat-label">HP Bonus</div>
        </div>
        <div class="home-stat">
          <div class="home-stat-value" style="color:var(--gold)">${scrapAmt}</div>
          <div class="home-stat-label">Scrap</div>
        </div>
        <div class="home-stat">
          <div class="home-stat-value" style="color:var(--accent)">${totalRanks}</div>
          <div class="home-stat-label">Total Ranks</div>
        </div>
      </div>
    </div>`;

  el.innerHTML = progressHTML + tiersHTML + loadoutHTML + readinessHTML;

  // Wire milestone panel click to open Goals tab
  const msPanel = el.querySelector('.home-milestones');
  if (msPanel) {
    msPanel.style.cursor = 'pointer';
    msPanel.addEventListener('click', () => {
      activeSubmenu = 'milestones';
      setHomeView(false);
      renderSubmenu();
    });
  }
  // Wire loadout panel click to open Cards tab
  const loPanel = el.querySelector('.home-loadout');
  if (loPanel) {
    loPanel.style.cursor = 'pointer';
    loPanel.addEventListener('click', () => {
      activeSubmenu = 'cards';
      setHomeView(false);
      renderSubmenu();
    });
  }

  // --- Daily Login & Daily Objective ---
  renderDailyLogin();
  renderDailyObjective();
}

function renderDailyLogin() {
  const wrap = document.getElementById('homeDaily');
  if (!wrap) return;

  // Ensure dailyLogin exists on save
  if (!save.dailyLogin) save.dailyLogin = { lastClaimDay: 0, streak: 0, totalClaims: 0 };
  const dl = save.dailyLogin;
  const today = Math.floor(Date.now() / 86400000);
  const canClaim = dl.lastClaimDay !== today;

  // Calculate streak — if missed yesterday, reset
  if (dl.lastClaimDay > 0 && today - dl.lastClaimDay > 1) {
    dl.streak = 0; // streak broken
  }
  const currentDay = canClaim ? (dl.streak % 5) : ((dl.streak - 1 + 5) % 5);

  let html = '<div class="daily-login-wrap">';
  html += '<div class="daily-login-header">';
  html += '<span class="daily-login-title">DAILY REWARDS</span>';
  html += '<span class="daily-login-streak">Streak: ' + Math.min(dl.streak, 5) + '/5</span>';
  html += '</div>';
  html += '<div class="daily-login-grid">';

  for (let i = 0; i < DAILY_LOGIN_REWARDS.length; i++) {
    const r = DAILY_LOGIN_REWARDS[i];
    const isCurrent = canClaim && i === (dl.streak % 5);
    const isPast = !canClaim ? i <= ((dl.streak - 1 + 5) % 5) : i < (dl.streak % 5);
    const cls = isCurrent ? 'daily-login-day current' : isPast ? 'daily-login-day claimed' : 'daily-login-day locked';
    const icon = r.gems > 0 ? '💎' : '⊙';
    html += '<div class="' + cls + '" data-login-day="' + i + '">';
    html += '<div class="daily-login-day-num">D' + r.day + '</div>';
    html += '<div class="daily-login-day-icon">' + icon + '</div>';
    html += '<div class="daily-login-day-label">' + (isCurrent ? 'CLAIM' : isPast ? '✓' : r.label) + '</div>';
    html += '</div>';
  }

  html += '</div></div>';

  // Insert before daily objective (which is also in homeDaily)
  const existing = wrap.querySelector('.daily-login-wrap');
  if (existing) existing.remove();
  wrap.insertAdjacentHTML('afterbegin', html);

  // Wire claim button
  if (canClaim) {
    const claimDay = wrap.querySelector('.daily-login-day.current');
    if (claimDay) {
      claimDay.addEventListener('click', function() {
        const dayIndex = dl.streak % 5;
        const reward = DAILY_LOGIN_REWARDS[dayIndex];
        save.coins += reward.coins;
        save.gems += (reward.gems || 0);
        dl.lastClaimDay = today;
        dl.streak = (dl.streak % 5) + 1;
        dl.totalClaims++;
        persistSave();
        haptic('success');
        // Show toast
        var toast = document.createElement('div');
        toast.className = 'skin-toast';
        toast.textContent = 'Claimed: ' + reward.label + '!';
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 2500);
        // Re-render
        renderMenu();
      });
    }
  }
}

// Legacy stub — renderDailyObjectiveVisual is the real renderer
function renderDailyObjective() {}

function getDailyTracker() {
  var today = Math.floor(Date.now() / 86400000);
  if (!save._dailyTracker || save._dailyTracker.day !== today) {
    save._dailyTracker = {
      day: today,
      runsAtStart: save.totalRuns,
      killsAtStart: save.totalEnemiesKilled,
      bestWaveAtStart: save.bestWave || 0,
      upgrades: 0
    };
  }
  return save._dailyTracker;
}

function renderDailyObjectiveVisual() {
  const el = document.getElementById('homeDaily');
  if (!el) return;

  var dt = getDailyTracker();
  const objectives = [
    { task: 'Complete 2 Runs', check: function() { return save.totalRuns - dt.runsAtStart; }, target: 2, reward: { coins: 500, gems: 5 } },
    { task: 'Defeat 100 Enemies', check: function() { return save.totalEnemiesKilled - dt.killsAtStart; }, target: 100, reward: { coins: 1000, gems: 10 } },
    { task: 'Reach Wave 25', check: function() { return save.bestWave || 0; }, target: 25, reward: { coins: 750, gems: 5 } },
    { task: 'Buy 3 Upgrades', check: function() { var today = Math.floor(Date.now() / 86400000); return (save._dailyUpgradeDay === today) ? (save._dailyUpgradeCount || 0) : 0; }, target: 3, reward: { coins: 500, gems: 5 } }
  ];

  const dayIndex = Math.floor(Date.now() / 86400000) % objectives.length;
  const obj = objectives[dayIndex];
  const current = Math.min(obj.check(), obj.target);
  const pct = Math.min(100, (current / obj.target) * 100);
  const done = current >= obj.target;
  const html = `
    <div class="home-daily-bar">
      <div class="home-daily-info">
        <div class="home-daily-label">DAILY OBJECTIVE</div>
        <div class="home-daily-task">${obj.task} <span style="color:var(--muted);font-size:10px;">${current}/${obj.target}</span></div>
        <div class="home-daily-progress">
          <div class="home-daily-fill" style="width:${pct}%"></div>
        </div>
      </div>
      <div class="home-daily-rewards">
        <span class="home-daily-reward">${done ? '✓ DONE' : '+' + obj.reward.coins + ' Scrap  +' + obj.reward.gems + ' Gems'}</span>
      </div>
    </div>`;

  const existing = el.querySelector('.home-daily-bar');
  if (existing) existing.remove();
  el.insertAdjacentHTML('beforeend', html);
}

function renderHomePanelsVisual() {
  const el = document.getElementById('homePanels');
  if (!el) return;

  const sel = save.selectedTier;
  const bestThisTier = save.bestWavePerTier[sel] || 0;
  const bestOverall = Math.max(...Object.values(save.bestWavePerTier || {1:0}));
  const equippedCount = save.equippedCards.filter(c => c && CARD_POOL[c]).length;
  const totalSlots = getUnlockedSlots();
  const progressPct = Math.min(100, (bestThisTier / 50) * 100);
  const totalRanks = Object.keys(save.ranks).reduce((s, r) => s + ((save.ranks[r] && save.ranks[r].level) || 0), 0);
  const maxTier = highestUnlockedTier();

  const coreAssets = {
    sentinel: 'assets/cores/core_01_sentinel.png',
    industrial: 'assets/cores/core_02_industrial.png',
    verdant: 'assets/cores/core_03_verdant.png',
    aegis: 'assets/cores/core_04_aegis.png',
    frost: 'assets/cores/core_05_frost.png',
    royal: 'assets/cores/core_06_royal.png'
  };
  const previewCore = save.equippedCoreSkin || 'sentinel';

  // Tier difficulty label
  const tierLabel = getTierLabel(sel);

  // Tier unlock hint
  let tierHint = '';
  if (sel === maxTier && maxTier < MAX_TIER) {
    const need = 50 - bestThisTier;
    tierHint = need > 0 ? `W50 on T${sel} to unlock T${sel+1}` : `T${sel+1} unlocked!`;
  } else if (sel < maxTier) {
    tierHint = `Best on T${sel}: W${bestThisTier}`;
  } else {
    tierHint = 'Max difficulty reached';
  }

  // Milestone data for the bottom cards
  let claimableCount = 0;
  const msWaves = [25, 50, 75, 100, 200, 500];
  let msHTML = '';
  for (const w of msWaves) {
    const key = milestoneKey(sel, w);
    const claimed = save.claimedMilestones[key];
    const ready = milestoneReady(sel, w) && !claimed;
    if (ready) claimableCount++;
  }

  // Build preset quick-switch chips for home page
  var homeAP = save.activePreset || 0;
  var presetChipsHTML = '';
  for (var qi = 0; qi < 3; qi++) {
    presetChipsHTML += '<button class="preset-quick-btn' + (qi === homeAP ? ' active' : '') + '" data-pidx="' + qi + '">' + (qi + 1) + '</button>';
  }

  el.innerHTML =
    // ─── RESOURCE HUD BAR ───
    '<div class="mock-hud">' +
      '<div class="mock-hud-item" data-home-action="labs"><span class="mock-hud-icon" style="background:linear-gradient(135deg,#f5a623,#e8871e)">&#9733;</span><div class="mock-hud-data"><span class="mock-hud-label">SCRAP</span><span class="mock-hud-val">' + formatNum(save.coins) + '</span></div><span class="mock-hud-plus">+</span></div>' +
      '<div class="mock-hud-item" data-home-action="shop"><span class="mock-hud-icon" style="background:linear-gradient(135deg,#a855f7,#7c3aed)">&#9830;</span><div class="mock-hud-data"><span class="mock-hud-label">GEMS</span><span class="mock-hud-val">' + formatNum(save.gems) + '</span></div><span class="mock-hud-plus">+</span></div>' +
      '<div class="mock-hud-item"><span class="mock-hud-icon" style="background:linear-gradient(135deg,#22d3ee,#0891b2)">&#9733;</span><div class="mock-hud-data"><span class="mock-hud-label">BEST</span><span class="mock-hud-val">W' + bestOverall + '</span></div></div>' +
      '<div class="mock-hud-item"><span class="mock-hud-icon" style="background:linear-gradient(135deg,#4ade80,#16a34a)">&#9650;</span><div class="mock-hud-data"><span class="mock-hud-label">RUNS</span><span class="mock-hud-val">' + save.totalRuns + '</span></div></div>' +
    '</div>' +

    // ─── HERO SECTION ───
    '<div class="mock-hero">' +
      '<div class="mock-hero-bg"></div>' +
      '<div class="mock-hero-vignette"></div>' +
      '<div class="mock-hero-beam"></div>' +
      '<div class="mock-hero-title">CORE<br>SURGE</div>' +
      '<div class="mock-hero-subtitle">&#8226; ENDLESS TOWER DEFENSE &#8226;</div>' +
      '<div class="mock-hero-tier-ghost">T' + sel + '</div>' +
      '<img class="mock-hero-core" src="' + coreAssets[previewCore] + '" alt="Core">' +
    '</div>' +

    // ─── TIER SELECTOR ───
    '<div class="mock-tier-box">' +
      '<div class="mock-tier-row">' +
        '<button class="mock-tier-arrow" data-tier-dir="down"' + (sel <= 1 ? ' disabled' : '') + '>&#10094;</button>' +
        '<div class="mock-tier-center">' +
          '<div class="mock-tier-num">T' + sel + '</div>' +
          '<div class="mock-tier-label">x' + tierMultiplier(sel).toFixed(2) + ' &#8226; ' + tierLabel.toUpperCase() + '</div>' +
        '</div>' +
        '<button class="mock-tier-arrow" data-tier-dir="up"' + (sel >= maxTier ? ' disabled' : '') + '>&#10095;</button>' +
      '</div>' +
      '<div class="mock-tier-hint">' + tierHint + '</div>' +
    '</div>' +

    // ─── BEGIN DEFENSE BUTTON ───
    '<button class="mock-start-btn" data-home-action="battle">' +
      '<span class="mock-start-icon">&#9812;</span>' +
      '<span>BEGIN DEFENSE (T' + sel + ')</span>' +
      '<span class="mock-start-arrows">&raquo;</span>' +
    '</button>' +

    // ─── THREE INFO CARDS ───
    '<div class="mock-info-row">' +
      // Recent Progress
      '<div class="mock-info-card mock-info-purple" data-home-action="labs">' +
        '<div class="mock-info-header">RECENT PROGRESS</div>' +
        '<div class="mock-info-body">' +
          '<div class="mock-info-stat"><span class="mock-info-stat-label">BEST THIS TIER</span><span class="mock-info-stat-val">W ' + bestThisTier + '</span></div>' +
          '<div class="mock-info-stat"><span class="mock-info-stat-label">TOTAL RANKS</span><span class="mock-info-stat-val">' + totalRanks + '</span></div>' +
          '<div class="mock-info-bar"><div class="mock-info-bar-fill" style="width:' + progressPct + '%"></div></div>' +
          '<div class="mock-info-bar-label">' + bestThisTier + ' / 50</div>' +
        '</div>' +
      '</div>' +
      // Tier Milestones
      '<div class="mock-info-card mock-info-purple" data-home-action="milestones">' +
        '<div class="mock-info-header">TIER MILESTONES' + (claimableCount > 0 ? '<span class="mock-info-badge">' + claimableCount + '</span>' : '') + '</div>' +
        '<div class="mock-info-body">' +
          '<div class="mock-ms-item">W 50 <span class="mock-ms-reward">Unlock T' + (sel+1) + '</span></div>' +
          '<div class="mock-ms-item">W 25 <span class="mock-ms-reward">+3% Damage</span></div>' +
          '<div class="mock-ms-item">W 75 <span class="mock-ms-reward">+5% Fire Rate</span></div>' +
          '<button class="mock-ms-view" data-home-action="milestones">VIEW ALL &gt;</button>' +
        '</div>' +
      '</div>' +
      // Quick Loadout — preset chips
      '<div class="mock-info-card mock-info-gold" data-home-action="cards">' +
        '<div class="mock-info-header">QUICK LOADOUT</div>' +
        '<div class="mock-info-body">' +
          '<div class="preset-quick-bar">' + presetChipsHTML + '</div>' +
          '<div class="mock-info-hint">Quick-switch your cards &amp; heroes.</div>' +
          '<button class="mock-ms-view gold" data-home-action="cards">EDIT LOADOUT &gt;</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  // Wire all action buttons
  el.querySelectorAll('[data-home-action]').forEach(function(button) {
    button.addEventListener('click', function() {
      var action = button.dataset.homeAction;
      if (action === 'battle') { startBattle(); return; }
      if (typeof featureUnlocked === 'function' && !featureUnlocked(action)) {
        var toast = document.createElement('div');
        toast.className = 'skin-toast';
        toast.textContent = action === 'tournament' ? 'Reach Wave 50 on Tier 1 to unlock!' : 'Keep playing to unlock this feature!';
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 2000);
        return;
      }
      activeSubmenu = action;
      setHomeView(false);
      renderSubmenu();
    });
  });

  // Preset quick-switch chips on home page
  el.querySelectorAll('.preset-quick-btn').forEach(function(btn) {
    btn.addEventListener('click', function(ev) {
      ev.stopPropagation();
      var pidx = parseInt(btn.dataset.pidx, 10);
      if (pidx === (save.activePreset || 0)) return;
      switchPreset(pidx);
      renderHomePanelsVisual();
    });
  });

  // Tier arrows
  el.querySelectorAll('[data-tier-dir]').forEach(function(arrow) {
    arrow.addEventListener('click', function(ev) {
      ev.stopPropagation();
      var dir = arrow.dataset.tierDir;
      if (dir === 'up' && save.selectedTier < highestUnlockedTier()) save.selectedTier++;
      else if (dir === 'down' && save.selectedTier > 1) save.selectedTier--;
      persistSave();
      renderHomePanelsVisual();
    });
  });

  renderDailyLogin();
  renderDailyObjectiveVisual();
  renderHomeUpgrades();
}

// =========================================================
//  HOME UPGRADES — Offense / Defense / Economy rank cards
//  Appears below Begin Defense on the home screen
// =========================================================
let activeHomeUpgradeTab = 'offense';

const HOME_UPGRADE_TABS = {
  offense:  { title: 'Offense',  icon: '⚔', color: 'var(--danger)',
              keys: ['damage','fireRate','range','critChance','critPower','multiChance','multiPower','multiTargets','bounceChance','bouncePower','bounceTargets','comboBonus','comboDuration'] },
  defense:  { title: 'Defense',  icon: '🛡', color: 'var(--accent)',
              keys: ['coreHealth','armor','shieldHP','lifesteal','regen','thorns','knockback','shieldRegen'] },
  economy:  { title: 'Economy',  icon: '💰', color: 'var(--gold)',
              keys: ['cashBonus','waveBonus','bossBounty','coinMultiplier','gemFind'] }
};

function renderHomeUpgrades() {
  const wrap = document.getElementById('homeUpgrades');
  if (!wrap) return;

  // Filter to only show unlocked ranks per tab
  const tab = HOME_UPGRADE_TABS[activeHomeUpgradeTab];
  const visibleKeys = tab.keys.filter(function(rid) {
    var def = RANK_DEFS[rid];
    if (!def) return false;
    if (def.startsUnlocked) return true;
    if (def.family && typeof familyIsOwned === 'function' && familyIsOwned(def.family)) return true;
    return false;
  });

  let html = '';

  // Tabs — reuse the battle upgrade tab classes for consistent look
  html += '<div class="upgrade-tabs">';
  for (var tabKey in HOME_UPGRADE_TABS) {
    var t = HOME_UPGRADE_TABS[tabKey];
    var active = activeHomeUpgradeTab === tabKey ? ' active' : '';
    html += '<button class="upgrade-tab' + active + '" data-hutab="' + tabKey + '" style="--tab-color:' + t.color + '">';
    html += '<span class="upgrade-tab-icon">' + t.icon + '</span> <span>' + t.title + '</span>';
    html += '</button>';
  }
  html += '</div>';

  // Grid — reuse battle upgrade grid classes
  html += '<div class="upgrade-grid">';

  if (visibleKeys.length === 0) {
    html += '<div style="grid-column:1/-1;text-align:center;padding:16px 10px;color:var(--muted);font-size:10px;">No ranks unlocked in this category yet.<br><span style="color:var(--accent)">Buy system unlocks in <b>Research</b>.</span></div>';
  } else {
    for (var i = 0; i < visibleKeys.length; i++) {
      var rid = visibleKeys[i];
      html += buildHomeRankCard(rid);
    }
  }
  html += '</div>';

  // UPGRADES header label
  html += '<div class="home-upg-section-label">UPGRADES</div>';

  wrap.innerHTML = html;

  // Wire tab clicks
  wrap.querySelectorAll('.upgrade-tab[data-hutab]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var tid = btn.dataset.hutab;
      if (tid && tid !== activeHomeUpgradeTab) {
        activeHomeUpgradeTab = tid;
        renderHomeUpgrades();
      }
    });
  });

  // Wire rank buy buttons (hold-to-buy)
  wrap.querySelectorAll('.upgrade-btn[data-rank]').forEach(function(btn) {
    var rid = btn.dataset.rank;
    attachHoldToBuy(btn, function() {
      if (purchaseRank(rid)) {
        haptic('light');
        renderHomeUpgrades();
        renderHud();
      }
    });
  });
}

function buildHomeRankCard(rid) {
  var def = RANK_DEFS[rid];
  var entry = save.ranks[rid] || { level: 0 };
  var maxed = entry.level >= def.maxRank;
  var cost = maxed ? Infinity : rankCost(rid, entry.level);
  var can = save.coins >= cost && !maxed;
  var curBonus = rankFlatBonus(rid);
  var nextBonus = (entry.level + 1) * def.flatPerRank;
  var meta = RANK_ICON_META[rid] || { icon: '◆', color: 'var(--accent)' };

  var fmt = function(v) {
    if (Math.abs(v) < 0.01) return v.toFixed(4);
    if (Math.abs(v) < 1) return v.toFixed(3);
    return v.toFixed(1);
  };

  var deltaText = maxed ? 'MAXED' : fmt(curBonus) + ' → ' + fmt(nextBonus);
  var costText = maxed ? '—' : formatNum(cost);
  var progPct = def.maxRank >= 99999
    ? Math.min(100, (entry.level / 500) * 100)
    : Math.min(100, (entry.level / def.maxRank) * 100);
  var levelText = 'Lv. ' + entry.level + (def.maxRank < 99999 ? ' / ' + def.maxRank : '');

  // Reuse the exact same classes as in-battle upgrade cards
  return '<button class="upgrade-btn' + (can ? '' : '') + '" data-rank="' + rid + '" style="--upg-color:' + meta.color + '"' + (maxed || !can ? ' disabled' : '') + '>' +
    '<div class="upgrade-body">' +
      '<div class="upgrade-icon" style="color:' + meta.color + ';border-color:' + meta.color + '">' + meta.icon + '</div>' +
      '<div class="upgrade-data">' +
        '<div class="upgrade-name">' + def.name.toUpperCase() + '</div>' +
        '<div class="upgrade-delta" style="color:' + meta.color + '">' + deltaText + '</div>' +
        '<div class="upgrade-level">' + levelText + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="upgrade-prog"><div class="upgrade-prog-fill" style="width:' + progPct + '%;background:' + meta.color + '"></div></div>' +
    '<div class="upgrade-cost"><span class="cost-coin">⊙</span>' + costText + '</div>' +
  '</button>';
}

function getSubmenuBadges() {
  const badges = {};

  // Ranks: no badge — Andy prefers clean Research tab without notification noise

  // Goals: count claimable milestones
  let claimable = 0;
  const unlockedTier = typeof highestUnlockedTier === 'function' ? highestUnlockedTier() : save.bestTier || 1;
  for (let t = 1; t <= unlockedTier; t++) {
    for (const w of MILESTONE_WAVES) {
      if (milestoneReady(t, w) && !save.claimedMilestones[milestoneKey(t, w)]) claimable++;
    }
  }
  if (claimable > 0) badges.milestones = claimable;

  // Cards: show badge if player can afford a pull
  if (save.gems >= (CARD_PRICING ? CARD_PRICING.pullSingle : 20)) badges.cards = '!';

  return badges;
}

function renderSubmenu() {
  const badges = getSubmenuBadges();
  // Sync badges and lock state on bottom nav buttons
  document.querySelectorAll('.global-nav-btn').forEach(b => {
    const tab = b.dataset.nav;
    const unlocked = featureUnlocked(tab);
    b.classList.toggle('tab-locked', !unlocked);
    b.disabled = !unlocked;
    // Update badge on bottom nav
    let badge = b.querySelector('.global-nav-badge');
    const count = unlocked ? badges[tab] : null;
    if (count) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'global-nav-badge';
        b.appendChild(badge);
      }
      badge.textContent = count;
    } else if (badge) {
      badge.remove();
    }
    // Lock icon for locked tabs
    let lockIcon = b.querySelector('.tab-lock-icon');
    if (!unlocked) {
      if (!lockIcon) {
        lockIcon = document.createElement('span');
        lockIcon.className = 'tab-lock-icon';
        lockIcon.textContent = '🔒';
        b.appendChild(lockIcon);
      }
    } else if (lockIcon) {
      lockIcon.remove();
    }
  });
  updateGlobalNavActive();
  const c = document.getElementById('submenuContent');
  // Prepend a big neon panel title matching the mockup
  const titles = {
    labs:       { t: 'RESEARCH',   s: 'SPEND SCRAP · UPGRADE YOUR CORE · GET FURTHER' },
    milestones: { t: 'GOALS',      s: 'EARN REWARDS · GET STRONGER' },
    cards:      { t: 'LOADOUT',    s: '' },
    shop:       { t: 'STORE',      s: 'GEMS · SCRAP · BOOSTERS' },
    skins:      { t: 'SKINS',      s: 'CUSTOMIZE YOUR EXPERIENCE' },
    tournament: { t: 'TOURNAMENT', s: 'COMPETE · RANK UP · EARN REWARDS' },
    settings:   { t: 'SETTINGS',   s: 'CUSTOMIZE YOUR GAME' }
  };
  const info = titles[activeSubmenu];
  const headerHTML = info
    ? `<div class="panel-title">${info.t}</div><div class="panel-subtitle">${info.s}</div>`
    : '';
  c.innerHTML = headerHTML; // reset + set header first
  const inner = document.createElement('div');
  inner.className = 'panel-inner';
  c.appendChild(inner);

  if (activeSubmenu === 'labs')            renderLabsTab(inner);
  else if (activeSubmenu === 'milestones') renderMilestonesTab(inner);
  else if (activeSubmenu === 'cards')      renderLoadoutTab(inner);
  else if (activeSubmenu === 'shop')       renderShopTab(inner);
  else if (activeSubmenu === 'skins')      renderSkinsTab(inner);
  else if (activeSubmenu === 'tournament') renderTournamentTab(inner);
  else if (activeSubmenu === 'settings')   renderSettingsTab(inner);
  updateGlobalNavActive();
}

let activeLabTab = 'combat';

// v0.7.22: front-end-only classification of ranks into Combat / Defense /
// Economy / Utility for the 4 sub-tabs painted into the Research mockup.
// Does not change any gameplay math — purely a filter for which rank rows
// are visible under each sub-tab.
const RANK_CATEGORY = {
  // Combat
  damage: 'combat', fireRate: 'combat', range: 'combat',
  critChance: 'combat', critPower: 'combat',
  multiChance: 'combat', multiPower: 'combat', multiTargets: 'combat',
  bounceChance: 'combat', bouncePower: 'combat', bounceTargets: 'combat',
  comboBonus: 'combat', comboDuration: 'combat',
  // Defense
  coreHealth: 'defense', armor: 'defense',
  lifesteal: 'defense', regen: 'defense',
  thorns: 'defense', knockback: 'defense',
  shieldHP: 'defense', shieldRegen: 'defense',
  // Economy
  cashBonus: 'economy', waveBonus: 'economy', bossBounty: 'economy',
  coinMultiplier: 'economy', gemFind: 'economy',
  // Utility
  projSpeed: 'utility', pierce: 'utility',
  overchargeChance: 'utility', overchargePower: 'utility',
};
function rankCategory(rid) { return RANK_CATEGORY[rid] || 'utility'; }

// Maps each of the 4 painted sub-tabs to which unlock families contain
// stats relevant to that tab. The painted mockup has 4 family card slots.
const FAMILIES_BY_CATEGORY = {
  combat:  ['critSystems', 'multishotSystems', 'bounceSystems', 'comboSystems'],
  defense: ['sustainSystems', 'fortification', 'barrierSystems'],
  economy: ['economyExpansion', 'coinMastery'],
  utility: ['tacticalSystems', 'overcharge']
};

// Subtab metadata — labels that sit under the painted icons
const RESEARCH_SUBTABS = [
  { id: 'combat',  label: 'Combat',  icon: '⚔' },
  { id: 'defense', label: 'Defense', icon: '🛡' },
  { id: 'economy', label: 'Economy', icon: '💎' },
  { id: 'utility', label: 'Utility', icon: '⚙' }
];

let activeResearchTab = 'combat';

function renderLabsTab(c) {
  // v0.7.22: Research panel now uses a painted mockup header (4 sub-tabs +
  // 4 family-unlock cards) with real HTML positioned into the painted slots.
  // Rank rows flow below in normal CSS styling.
  let html = '';

  // =========================================================
  //  MOCKUP OVERLAY — title + sub-tabs + family cards
  // =========================================================
  html += `<div class="mockup-bg-research">`;
  html += `  <div class="mor-title">Research</div>`;

  // Sub-tabs — 4 invisible click targets over painted frames
  html += `<div class="mor-subtabs">`;
  for (const st of RESEARCH_SUBTABS) {
    const isActive = st.id === activeResearchTab;
    html += `<button class="mor-subtab ${isActive ? 'active' : ''}" data-rtab="${st.id}">
      <span class="mor-subtab-icon">${st.icon}</span>
      <span class="mor-subtab-label">${st.label}</span>
    </button>`;
  }
  html += `</div>`;

  // Family cards — up to 4 slots, keyed to active sub-tab's relevant families
  const famIds = (FAMILIES_BY_CATEGORY[activeResearchTab] || []).slice(0, 4);
  html += `<div class="mor-families">`;
  for (let i = 0; i < 4; i++) {
    const fid = famIds[i];
    if (!fid || !UNLOCK_FAMILIES[fid]) {
      html += `<div class="mor-fam mor-fam-empty mor-fam-locked">
        <div class="mor-fam-name">🔒</div>
        <div class="mor-fam-cost">COMING SOON</div>
      </div>`;
      continue;
    }
    const fam = UNLOCK_FAMILIES[fid];
    const owned = familyIsOwned(fid);
    const can = save.coins >= fam.cost;
    const clsMod = owned ? 'owned' : (can ? '' : 'cant-afford');
    const costText = owned ? '✓ UNLOCKED' : `${formatNum(fam.cost)} ⊙`;
    html += `<button class="mor-fam ${clsMod}" data-mor-fam="${fid}" ${owned || !can ? 'disabled' : ''}>
      <div class="mor-fam-icon">${fam.icon || '⚙'}</div>
      <div class="mor-fam-name">${fam.name}</div>
      <div class="mor-fam-cost">${costText}</div>
    </button>`;
  }
  html += `</div>`;
  html += `</div>`; // end mockup-bg-research

  // =========================================================
  //  BUY MULTIPLIER TOGGLE — x1 / x10 / MAX
  // =========================================================
  const curMul = save.settings.buyMultiplier || 1;
  html += `<div class="rank-buy-mul-bar">`;
  for (const opt of [1, 10, 'max']) {
    const label = opt === 'max' ? 'MAX' : `×${opt}`;
    const active = (curMul === opt || (curMul === 1 && opt === 1)) ? 'active' : '';
    html += `<button class="rank-mul-btn ${active}" data-mul="${opt}">${label}</button>`;
  }
  html += `</div>`;

  // =========================================================
  //  RANK ROWS — flow below the mockup, filtered by active sub-tab
  // =========================================================
  // Collect rank ids that belong to the active category AND are unlocked
  // (either starter, or behind a purchased family)
  const starterIds = ['damage','fireRate','coreHealth','armor','range','cashBonus'];
  const visibleRankIds = [];

  for (const rid of starterIds) {
    if (rankCategory(rid) === activeResearchTab) visibleRankIds.push(rid);
  }
  for (const fam of Object.values(UNLOCK_FAMILIES)) {
    if (!familyIsOwned(fam.id)) continue;
    for (const rid of fam.unlocks) {
      if (rankCategory(rid) === activeResearchTab && RANK_DEFS[rid]) {
        visibleRankIds.push(rid);
      }
    }
  }

  // Section label
  const stMeta = RESEARCH_SUBTABS.find(s => s.id === activeResearchTab);
  html += `<div class="mockup-rank-section">⚙ <b>${stMeta ? stMeta.label : 'Research'}</b> · ${visibleRankIds.length} rank${visibleRankIds.length === 1 ? '' : 's'} · spend scrap to upgrade your core</div>`;

  if (visibleRankIds.length === 0) {
    html += `<div class="lab-section-header" style="opacity:0.55;border-style:dashed;text-align:center;padding:20px 10px;">No ranks in this category yet.<br><span style="color:var(--muted);font-weight:normal;font-size:10px;">Unlock a family above to reveal more.</span></div>`;
  } else {
    for (const rid of visibleRankIds) {
      if (RANK_DEFS[rid]) html += renderRankRow(rid);
    }
  }

  c.innerHTML = html;

  // --- Wire sub-tab switches ---
  c.querySelectorAll('.mor-subtab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tid = btn.dataset.rtab;
      if (tid && tid !== activeResearchTab) {
        activeResearchTab = tid;
        renderLabsTab(c);
      }
    });
  });

  // --- Wire family card clicks (buy unlock family) ---
  c.querySelectorAll('.mor-fam[data-mor-fam]').forEach(btn => {
    btn.addEventListener('click', () => {
      const fid = btn.dataset.morFam;
      if (purchaseUnlockFamily(fid)) {
        haptic('success');
        // Buying a family may unlock gated heroes
        if (typeof checkHeroUnlocks === 'function') checkHeroUnlocks();
        renderLabsTab(c);
        renderHud();
      }
    });
  });

  // --- Wire buy multiplier toggle ---
  c.querySelectorAll('.rank-mul-btn[data-mul]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.mul;
      save.settings.buyMultiplier = val === 'max' ? 'max' : parseInt(val, 10);
      persistSave();
      renderLabsTab(c);
    });
  });

  // --- Wire rank buy buttons ---
  c.querySelectorAll('.lab-buy[data-rank]').forEach(btn => {
    btn.addEventListener('click', () => {
      const rid = btn.dataset.rank;
      const mul = save.settings.buyMultiplier || 1;
      const maxToBuy = mul === 'max' ? 10000 : mul;

      // For numeric multiplier (x10 etc), pre-validate total cost
      if (typeof mul === 'number' && mul > 1) {
        const def = RANK_DEFS[rid];
        const entry = save.ranks[rid] || { level: 0 };
        const want = Math.min(mul, def.maxRank - entry.level);
        let totalCost = 0;
        for (let i = 0; i < want; i++) {
          const c = rankCost(rid, entry.level + i);
          if (c === Infinity) { totalCost = Infinity; break; }
          totalCost += c;
        }
        if (save.coins < totalCost) return; // Can't afford full batch — do nothing
      }

      let bought = 0;
      while (bought < maxToBuy) {
        if (!purchaseRank(rid)) break;
        bought++;
      }
      if (bought > 0) {
        haptic('light');
        // Tutorial: advance after first rank purchase
        if (save.tutorialStep === 2) {
          save.tutorialStep = 3;
          persistSave();
          dismissTutorial();
          // Short delay, then show "start battle again" tooltip
          setTimeout(() => {
            renderMenu();
            checkTutorial();
          }, 400);
        }
        renderLabsTab(c); renderHud();
        // Flash the upgraded rank row
        const row = c.querySelector(`.lab-buy[data-rank="${rid}"]`);
        if (row) {
          const lab = row.closest('.lab');
          if (lab) { lab.classList.add('rank-bought'); setTimeout(() => lab.classList.remove('rank-bought'), 450); }
        }
      }
    });
  });
}

// Icon + color per rank for the tile-at-left mockup look
const RANK_ICON_META = {
  damage:        { icon: '🚀', color: 'var(--danger)' },
  fireRate:      { icon: '⏫', color: 'var(--accent)' },
  coreHealth:    { icon: '♥',  color: 'var(--danger)' },
  armor:         { icon: '🛡', color: 'var(--accent)' },
  range:         { icon: '◎',  color: 'var(--accent)' },
  cashBonus:     { icon: '$',  color: 'var(--gold)' },
  critChance:    { icon: '✦',  color: 'var(--gold)' },
  critPower:     { icon: '✸',  color: 'var(--danger)' },
  waveBonus:     { icon: '≋',  color: 'var(--gold)' },
  bossBounty:    { icon: '♛',  color: 'var(--gold)' },
  regen:         { icon: '✚',  color: 'var(--good)' },
  lifesteal:     { icon: '☖',  color: 'var(--good)' },
  multiChance:   { icon: '↟',  color: 'var(--good)' },
  multiPower:    { icon: '⇧',  color: 'var(--good)' },
  multiTargets:  { icon: '⋮⋮', color: 'var(--accent)' },
  bounceChance:  { icon: '⤢',  color: 'var(--purple)' },
  bouncePower:   { icon: '⤨',  color: 'var(--purple)' },
  bounceTargets: { icon: '⋰⋱', color: 'var(--purple)' },
  // New research stats
  comboBonus:       { icon: '🔥', color: 'var(--danger)' },
  comboDuration:    { icon: '⏱',  color: 'var(--danger)' },
  thorns:           { icon: '🌿', color: 'var(--good)' },
  knockback:        { icon: '💨', color: 'var(--accent)' },
  shieldHP:         { icon: '🔷', color: 'var(--cyan2)' },
  shieldRegen:      { icon: '♻',  color: 'var(--cyan2)' },
  coinMultiplier:   { icon: '🔩', color: 'var(--gold)' },
  gemFind:          { icon: '💎', color: 'var(--purple)' },
  projSpeed:        { icon: '➤',  color: 'var(--accent)' },
  pierce:           { icon: '⫸',  color: 'var(--accent)' },
  overchargeChance: { icon: '⚡', color: 'var(--gold)' },
  overchargePower:  { icon: '⚡', color: 'var(--danger)' }
};

function renderRankRow(rid) {
  const def = RANK_DEFS[rid];
  const entry = save.ranks[rid] || { level: 0 };
  const maxed = entry.level >= def.maxRank;
  const cost = maxed ? Infinity : rankCost(rid, entry.level);
  const can = save.coins >= cost && !maxed;
  const curBonus = rankFlatBonus(rid);
  const nextBonus = (entry.level + 1) * def.flatPerRank;
  const fmt = (v) => {
    if (Math.abs(v) < 0.01) return v.toFixed(4);
    if (Math.abs(v) < 1) return v.toFixed(3);
    return v.toFixed(1);
  };
  const meta = RANK_ICON_META[rid] || { icon: '◆', color: 'var(--accent)' };

  // Calculate buy-N cost for multiplier display
  const mul = save.settings.buyMultiplier || 1;
  let buyLabel = 'MAXED';
  let canAffordBatch = can; // default: can afford at least 1
  if (!maxed) {
    if (mul === 'max') {
      // MAX: buy as many as affordable
      const limit = def.maxRank - entry.level;
      let totalCost = 0, count = 0;
      for (let i = 0; i < limit; i++) {
        const c = rankCost(rid, entry.level + i);
        if (c === Infinity) break;
        if (totalCost + c > save.coins) break;
        totalCost += c;
        count++;
      }
      if (count === 0) count = 1;
      const costForFirst = rankCost(rid, entry.level);
      canAffordBatch = save.coins >= costForFirst;
      buyLabel = count > 1
        ? `Rank Up ×${count} · ${formatNum(totalCost)} scrap`
        : `Rank Up · ${formatNum(costForFirst)} scrap`;
    } else if (mul > 1) {
      // x10 etc: require ALL N to be affordable, or show can't afford
      const want = Math.min(mul, def.maxRank - entry.level);
      let totalCost = 0, count = 0;
      for (let i = 0; i < want; i++) {
        const c = rankCost(rid, entry.level + i);
        if (c === Infinity) break;
        totalCost += c;
        count++;
      }
      if (count < want) {
        // Not enough ranks remaining for a full batch — show what's available
        canAffordBatch = save.coins >= totalCost;
        buyLabel = count > 1
          ? `Rank Up ×${count} · ${formatNum(totalCost)} scrap`
          : `Rank Up · ${formatNum(rankCost(rid, entry.level))} scrap`;
      } else {
        // Full batch — require player can afford all N
        canAffordBatch = save.coins >= totalCost;
        buyLabel = `Rank Up ×${count} · ${formatNum(totalCost)} scrap`;
      }
    } else {
      buyLabel = `Rank Up · ${formatNum(cost)} scrap`;
    }
  }

  return `
    <div class="lab" style="--rank-color:${meta.color}">
      <div class="lab-icon-tile" style="color:${meta.color};border-color:${meta.color}">${meta.icon}</div>
      <div class="lab-header">
        <span class="lab-name">${def.name}</span>
        <span class="lab-level">Rank ${entry.level} / ${def.maxRank}</span>
      </div>
      <div class="lab-desc">${def.desc}</div>
      <div class="lab-stat">+${fmt(curBonus)} → +${fmt(nextBonus)}</div>
      <button class="lab-buy ${maxed ? 'maxed' : ''}" data-rank="${rid}" ${maxed || !canAffordBatch ? 'disabled' : ''}>
        ${buyLabel}
      </button>
    </div>`;
}

let activeGoalTier = 1;

function renderMilestonesTab(c) {
  const unlockedTier = highestUnlockedTier();
  if (activeGoalTier > unlockedTier) activeGoalTier = unlockedTier;
  if (activeGoalTier < 1) activeGoalTier = 1;

  // Count ready-to-claim milestones per tier for badge
  const readyCounts = {};
  for (let t = 1; t <= unlockedTier; t++) {
    let n = 0;
    for (const w of MILESTONE_WAVES) {
      if (milestoneReady(t, w) && !save.claimedMilestones[milestoneKey(t, w)]) n++;
    }
    readyCounts[t] = n;
  }

  // Tier hex progression bar — all 18 tiers, scrollable horizontally
  let html = `<div class="tier-hex-strip">`;
  for (let t = 1; t <= MAX_TIER; t++) {
    const state = t > unlockedTier ? 'locked'
                : t === activeGoalTier ? 'current'
                : 'unlocked';
    const badge = readyCounts[t] > 0 ? `<span class="tier-hex-badge">${readyCounts[t]}</span>` : '';
    html += `<button class="tier-hex ${state}" data-ghex="${t}" ${t > unlockedTier ? 'disabled' : ''}>T${t}${badge}</button>`;
  }
  html += `</div>`;

  // Tier tab bar (horizontal scroll if many tiers)
  html += `<div class="goal-tier-tabs">`;
  for (let t = 1; t <= unlockedTier; t++) {
    const badge = readyCounts[t] > 0 ? `<span class="goal-tier-badge">${readyCounts[t]}</span>` : '';
    html += `<button class="goal-tier-tab ${activeGoalTier === t ? 'active' : ''}" data-gt="${t}">T${t}${badge}</button>`;
  }
  html += `</div>`;

  // Current tier's best
  html += `<div class="milestone-tier-header">Tier ${activeGoalTier} · best W${save.bestWavePerTier[activeGoalTier] || 0}</div>`;

  // Milestones for the active tier only
  for (const w of MILESTONE_WAVES) {
    const key = milestoneKey(activeGoalTier, w);
    const claimed = save.claimedMilestones[key];
    const ready = milestoneReady(activeGoalTier, w) && !claimed;
    const r = milestoneReward(activeGoalTier, w);
    const gemPart = r.gems > 0 ? ` + <b class="gem">${r.gems} gems</b>` : '';
    const stateClass = claimed ? 'claimed' : ready ? 'ready' : '';
    const btnText = claimed ? 'Claimed' : ready ? 'Claim' : 'Locked';
    html += `
      <div class="milestone ${stateClass}">
        <div class="milestone-info">
          <div class="milestone-target">Wave ${w}</div>
          <div class="milestone-reward"><b>${formatNum(r.coins)}</b> scrap${gemPart}</div>
        </div>
        <button class="milestone-btn ${!ready ? 'locked' : ''}" data-tier="${activeGoalTier}" data-wave="${w}" ${!ready ? 'disabled' : ''}>
          ${btnText}
        </button>
      </div>
    `;
  }

  c.innerHTML = html;
  c.querySelectorAll('.tier-hex').forEach(h => {
    if (h.disabled) return;
    h.addEventListener('click', () => {
      const t = parseInt(h.dataset.ghex);
      if (t && t <= highestUnlockedTier()) {
        activeGoalTier = t;
        renderMilestonesTab(c);
      }
    });
  });
  c.querySelectorAll('.goal-tier-tab').forEach(t => {
    t.addEventListener('click', () => {
      activeGoalTier = parseInt(t.dataset.gt);
      renderMilestonesTab(c);
    });
  });
  c.querySelectorAll('.milestone-btn').forEach(btn => {
    if (btn.disabled) return;
    btn.addEventListener('click', () => claimMilestone(parseInt(btn.dataset.tier), parseInt(btn.dataset.wave)));
  });
}

// ============================================================
// HERO UNLOCK TOAST
// ============================================================
function showHeroUnlockToast(heroDef) {
  const toast = document.createElement('div');
  toast.className = 'skin-toast hero-unlock-toast';
  toast.style.background = 'rgba(20,180,160,0.95)';
  toast.innerHTML = `<span style="font-size:1.3em">${heroDef.icon}</span> Hero unlocked: <b>${heroDef.name}</b>`;
  document.body.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3500);
}

// ============================================================
// LOADOUT PRESETS — save/load/switch between 3 loadout slots
// ============================================================
function saveCurrentToPreset(idx) {
  if (!save.loadoutPresets) save.loadoutPresets = [{},{},{}];
  var existing = save.loadoutPresets[idx] || {};
  save.loadoutPresets[idx] = {
    name: existing.name || null,
    equippedCards: save.equippedCards.slice(),
    garrisonSlots: (save.garrisonSlots || []).slice()
  };
  save.activePreset = idx;
  persistSave();
}

function loadPreset(idx) {
  if (!save.loadoutPresets || !save.loadoutPresets[idx]) return false;
  var preset = save.loadoutPresets[idx];
  if (!preset.equippedCards) return false;
  var cards = preset.equippedCards.map(function(cid) {
    return (cid && save.cardInventory[cid]) ? cid : null;
  });
  while (cards.length < save.unlockedSlots) cards.push(null);
  cards.length = save.unlockedSlots;
  save.equippedCards = cards;
  if (Array.isArray(preset.garrisonSlots)) {
    var unlocked = save.heroesUnlocked || [];
    save.garrisonSlots = preset.garrisonSlots.filter(function(hid) {
      return unlocked.includes(hid);
    });
  }
  save.activePreset = idx;
  persistSave();
  return true;
}

function switchPreset(idx) {
  saveCurrentToPreset(save.activePreset || 0);
  if (!loadPreset(idx)) {
    save.activePreset = idx;
    persistSave();
  }
  if (typeof renderHud === 'function') renderHud();
  if (typeof renderSubmenu === 'function') renderSubmenu();
}

function isPresetEmpty(idx) {
  if (!save.loadoutPresets || !save.loadoutPresets[idx]) return true;
  return !save.loadoutPresets[idx].equippedCards;
}

function presetCardCount(idx) {
  if (isPresetEmpty(idx)) return 0;
  return save.loadoutPresets[idx].equippedCards.filter(function(c) { return c !== null; }).length;
}

// Loadout sub-tab state: 'cards' or 'heroes'
let loadoutSubTab = 'cards';

// State for the cards tab selection flow.
// When user taps an empty slot, we store the slot index here and let
// them tap an inventory card to fill it.
let cardSelectingSlot = -1;

function cardBonusLabel(card, inv) {
  if (card.values && Array.isArray(card.values)) {
    const v = card.values[Math.max(0, Math.min(4, inv.level - 1))];
    if (typeof v === 'number') {
      const pct = v * 100;
      return `+${pct < 10 ? pct.toFixed(1) : pct.toFixed(0)}%`;
    }
  } else if (card.buckets) {
    const firstKey = Object.keys(card.buckets)[0];
    if (firstKey) {
      const v = card.buckets[firstKey][Math.max(0, Math.min(4, inv.level - 1))];
      if (typeof v === 'number') {
        const pct = v * 100;
        return `+${pct < 10 ? pct.toFixed(1) : pct.toFixed(0)}%`;
      }
    }
  }
  return `Lv${inv.level}`;
}

function renderCardsTab(c) {
  const ownedIds = Object.keys(save.cardInventory).filter(id => CARD_POOL[id]);
  const slots = getUnlockedSlots();
  // Ensure equippedCards array matches slots length
  while (save.equippedCards.length < slots) save.equippedCards.push(null);
  const equipped = save.equippedCards;
  const cardEffectSummary = (card) => {
    if (card.special || card.buckets) return card.desc;
    const summaries = {
      damage: 'Boosts damage',
      attackSpeed: 'Boosts fire rate',
      health: 'Boosts max HP',
      range: 'Boosts range',
      defense: 'Adds armor',
      lifesteal: 'Adds lifesteal',
      regen: 'Adds core regen',
      crit: 'Adds crit chance',
      critPower: 'Boosts crit damage',
      cash: 'Boosts kill scrap',
      coinGain: 'Boosts end-run scrap',
      waveBonus: 'Boosts wave cash',
      multiChance: 'Adds multishot chance',
      multiPower: 'Boosts multishot damage',
      multiTargetsAdd: 'Adds extra multishot targets',
      bounceChance: 'Adds bounce chance',
      bouncePower: 'Boosts bounce damage',
      bounceTargetsAdd: 'Adds extra bounce targets'
    };
    return summaries[card.stat] || card.desc || 'Run bonus';
  };

  // Header + slot row
  let html = `
    <div class="cards-header">
      <div class="cards-header-title">Equipped</div>
      <div class="cards-header-sub">${slots} / ${MAX_SLOTS} slots unlocked</div>
    </div>
    <div class="card-slots">`;
  for (let i = 0; i < slots; i++) {
    const cardId = equipped[i];
    const selecting = cardSelectingSlot === i;
    if (cardId && CARD_POOL[cardId]) {
      const card = CARD_POOL[cardId];
      const inv = save.cardInventory[cardId] || { level: 1 };
      const tierColor = CARD_TIER_COLORS[card.tier];
      const bonusLabel = cardBonusLabel(card, inv);
      const effectSummary = cardEffectSummary(card);
      html += `
        <div class="card-slot filled" data-slot="${i}" data-card="${card.id}" style="border-color:${tierColor.border}">
          <div class="card-slot-tier" style="color:${tierColor.nameColor}">${tierColor.name}</div>
          <div class="card-slot-name">${card.name}</div>
          <div class="card-slot-effect">${effectSummary}</div>
          <div class="card-slot-lvl">Lv ${inv.level} · ${bonusLabel}</div>
        </div>`;
    } else {
      html += `
        <div class="card-slot ${selecting ? 'selecting' : 'empty'}" data-slot="${i}">
          <div class="card-slot-empty-plus">+</div>
          <div class="card-slot-empty-label">${selecting ? 'pick card' : 'empty'}</div>
        </div>`;
    }
  }
  html += `</div>`;

  // Next slot unlock button
  const nextSlotCost = getNextSlotCost();
  if (nextSlotCost !== null) {
    const canAfford = save.gems >= nextSlotCost;
    html += `
      <button class="card-slot-unlock-btn ${canAfford ? 'affordable' : ''}" id="cardSlotUnlockBtn" ${canAfford ? '' : 'disabled'}>
        <span class="slot-unlock-label">Unlock Slot ${slots + 1}</span>
        <span class="slot-unlock-cost">${nextSlotCost} 💎</span>
      </button>`;
  } else {
    html += `<div class="card-slot-unlock-btn maxed">All slots unlocked</div>`;
  }

  // Card bucket summary — shows cumulative bonuses for all active buckets
  const bucketLabels = [
    { key: 'damage',       label: '💥 dmg',       pct: true },
    { key: 'attackSpeed',  label: '⏫ fire rate', pct: true },
    { key: 'health',       label: '🛡 HP',        pct: true },
    { key: 'range',        label: '◎ range',     pct: true },
    { key: 'defense',      label: '🔰 armor',    pct: true, flat: true },
    { key: 'lifesteal',    label: '🩸 lifesteal', pct: true },
    { key: 'regen',        label: '✚ regen',      pct: true },
    { key: 'crit',         label: '🎯 crit',      pct: true, flat: true },
    { key: 'critPower',    label: '✸ crit pwr',   pct: true },
    { key: 'cash',         label: '💰 cash',      pct: true },
    { key: 'coinGain',     label: '⊙ scrap gain', pct: true },
    { key: 'waveBonus',    label: '≋ wave bonus', pct: true },
    { key: 'multiChance',  label: '⌘ multi%',     pct: true, flat: true },
    { key: 'multiPower',   label: '✚ multi pwr',  pct: true },
    { key: 'bounceChance', label: '⤢ bounce%',    pct: true, flat: true },
    { key: 'bouncePower',  label: '⤨ bounce pwr', pct: true },
    { key: 'bossDmg',      label: '♛ boss dmg',   pct: true },
    { key: 'bossBounty',   label: '♛ boss bounty',pct: true }
  ];
  const activeBuckets = [];
  for (const b of bucketLabels) {
    const v = getCardBucket(b.key);
    if (v > 0) {
      const pct = v * 100;
      const label = pct < 10 ? pct.toFixed(1) : pct.toFixed(0);
      activeBuckets.push(`<span>${b.label} +${label}%</span>`);
    }
  }
  // Apex specials
  if (getEquippedSpecialLevel('stormThread'))  activeBuckets.push('<span>⚡ Storm Thread</span>');
  if (getEquippedSpecialLevel('bulwarkVeil'))  activeBuckets.push('<span>⛨ Bulwark</span>');
  if (getEquippedSpecialLevel('predatorLoop')) activeBuckets.push('<span>👁 Predator</span>');
  if (getEquippedSpecialLevel('timeLock'))     activeBuckets.push('<span>❄ Time Lock</span>');
  if (getEquippedSpecialLevel('lastStand'))    activeBuckets.push('<span>☠ Last Stand</span>');
  if (activeBuckets.length) {
    html += `<div class="card-bucket-summary">${activeBuckets.join('')}</div>`;
  }

  // Inventory
  html += `<div class="cards-section-title">Inventory · ${ownedIds.length} / ${Object.keys(CARD_POOL).length}</div>`;

  if (ownedIds.length === 0) {
    html += `
      <div class="shop-coming">
        <div class="shop-coming-item">
          <div class="shop-coming-icon">🎴</div>
          <div class="shop-coming-text">
            <b>No cards yet</b><br>
            <span>Open the Shop tab to pull cards with gems. Dev panel can also add cards for testing.</span>
          </div>
        </div>
      </div>`;
  } else {
    // Group by tier so Apex/Prime stand out
    const byTier = { apex: [], prime: [], standard: [] };
    for (const id of ownedIds) byTier[CARD_POOL[id].tier].push(id);

    for (const tier of ['apex', 'prime', 'standard']) {
      if (byTier[tier].length === 0) continue;
      const tc = CARD_TIER_COLORS[tier];
      html += `<div class="cards-subsection-title" style="color:${tc.nameColor}">${tc.name}</div>`;
      html += `<div class="card-inventory">`;
      for (const id of byTier[tier]) {
        const card = CARD_POOL[id];
        const inv = save.cardInventory[id];
        const tierColor = CARD_TIER_COLORS[card.tier];
        const isEquipped = equipped.includes(id);
        const bonusLabel = cardBonusLabel(card, inv);
        const effectSummary = cardEffectSummary(card);
        // Copies progress to next level
        const thresholds = COPIES_TO_LEVEL[card.tier];
        let copyLabel;
        if (inv.level >= 5) {
          copyLabel = `MAX (${inv.copies} copies)`;
        } else {
          const next = thresholds[inv.level];
          copyLabel = `${inv.copies} / ${next} copies`;
        }
        html += `
          <div class="card-tile ${isEquipped ? 'equipped' : ''}" data-card="${id}" style="border-color:${tierColor.border}">
            <div class="card-tile-head" style="background:${tierColor.bg}">
              <span class="card-tile-tier" style="color:${tierColor.nameColor}">${tierColor.name}</span>
            </div>
            <div class="card-tile-name">${card.name}</div>
            <div class="card-tile-effect">${effectSummary}</div>
            <div class="card-tile-stat">Lv ${inv.level}/5 � ${bonusLabel}</div>
            <div class="card-tile-copies">${copyLabel}</div>
            ${isEquipped ? `<div class="card-tile-badge">EQUIPPED</div>` : ''}
          </div>`;
      }
      html += `</div>`;
    }
  }

  c.innerHTML = html;

  // Slot unlock button
  const slotBtn = document.getElementById('cardSlotUnlockBtn');
  if (slotBtn) {
    slotBtn.addEventListener('click', () => {
      if (unlockNextSlot()) {
        renderCardsTab(c);
        renderHud();
      }
    });
  }

  // Wire slot taps
  c.querySelectorAll('.card-slot').forEach(slotEl => {
    slotEl.addEventListener('click', () => {
      const idx = parseInt(slotEl.dataset.slot);
      const equippedNow = save.equippedCards[idx];
      if (equippedNow) {
        save.equippedCards[idx] = null;
        cardSelectingSlot = -1;
        persistSave();
        saveCurrentToPreset(save.activePreset || 0); // auto-save
        renderCardsTab(c);
      } else {
        cardSelectingSlot = (cardSelectingSlot === idx) ? -1 : idx;
        renderCardsTab(c);
      }
    });
  });

  // Wire card tile taps (short tap = equip/unequip, long press = detail popup)
  c.querySelectorAll('.card-tile').forEach(tileEl => {
    let pressTimer = null;
    let longPressed = false;

    tileEl.addEventListener('pointerdown', (e) => {
      longPressed = false;
      pressTimer = setTimeout(() => {
        longPressed = true;
        showCardDetail(tileEl.dataset.card);
      }, 400);
    });
    tileEl.addEventListener('pointerup', () => {
      clearTimeout(pressTimer);
      if (longPressed) return;
      // Normal tap — equip/unequip
      const cardId = tileEl.dataset.card;
      const equippedIdx = save.equippedCards.indexOf(cardId);
      if (equippedIdx !== -1) {
        save.equippedCards[equippedIdx] = null;
        cardSelectingSlot = -1;
      } else if (cardSelectingSlot !== -1) {
        save.equippedCards[cardSelectingSlot] = cardId;
        cardSelectingSlot = -1;
      } else {
        const firstEmpty = save.equippedCards.indexOf(null);
        if (firstEmpty !== -1) {
          save.equippedCards[firstEmpty] = cardId;
        }
      }
      persistSave();
      saveCurrentToPreset(save.activePreset || 0); // auto-save to active preset
      renderCardsTab(c);
    });
    tileEl.addEventListener('pointercancel', () => clearTimeout(pressTimer));
    tileEl.addEventListener('pointermove', () => clearTimeout(pressTimer));
  });
}

function showCardDetail(cardId) {
  const card = CARD_POOL[cardId];
  if (!card) return;
  const inv = save.cardInventory[cardId] || { level: 1, copies: 1 };
  const tierColor = CARD_TIER_COLORS[card.tier];
  const thresholds = COPIES_TO_LEVEL[card.tier];

  let valuesHtml = '';
  if (card.values && Array.isArray(card.values)) {
    for (let i = 0; i < 5; i++) {
      const v = card.values[i];
      const active = i < inv.level ? 'active' : '';
      const current = i === inv.level - 1 ? 'current' : '';
      if (typeof v === 'number') {
        const pct = v * 100;
        valuesHtml += `<div class="cd-level ${active} ${current}">Lv${i + 1}: +${pct < 10 ? pct.toFixed(1) : pct.toFixed(0)}%</div>`;
      } else {
        valuesHtml += `<div class="cd-level ${active} ${current}">Lv${i + 1}</div>`;
      }
    }
  } else if (card.buckets) {
    const keys = Object.keys(card.buckets);
    for (let i = 0; i < 5; i++) {
      const active = i < inv.level ? 'active' : '';
      const current = i === inv.level - 1 ? 'current' : '';
      const parts = keys.map(k => {
        const v = card.buckets[k][i];
        return `${k}: +${(v * 100).toFixed(0)}%`;
      });
      valuesHtml += `<div class="cd-level ${active} ${current}">Lv${i + 1}: ${parts.join(', ')}</div>`;
    }
  }

  let copyBar = '';
  if (inv.level < 5) {
    const needed = thresholds[inv.level];
    const pct = Math.min(100, (inv.copies / needed) * 100);
    copyBar = `<div class="cd-copy-bar"><div class="cd-copy-fill" style="width:${pct}%"></div></div>
               <div class="cd-copy-label">${inv.copies} / ${needed} copies to Lv${inv.level + 1}</div>`;
  } else {
    copyBar = `<div class="cd-copy-label">MAX LEVEL · ${inv.copies} copies</div>`;
  }

  const overlay = document.createElement('div');
  overlay.className = 'card-detail-overlay';
  overlay.innerHTML = `
    <div class="card-detail-card" data-card="${card.id}" style="border-color:${tierColor.border}">
      <div class="cd-header" style="background:${tierColor.bg}">
        <span class="cd-tier" style="color:${tierColor.nameColor}">${tierColor.name}</span>
      </div>
      <div class="cd-name">${card.name}</div>
      <div class="cd-desc">${card.desc}</div>
      <div class="cd-levels">${valuesHtml}</div>
      ${copyBar}
      <button class="cd-close">Close</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('cd-close')) {
      overlay.remove();
    }
  });
}

// ============================================================
// LOADOUT TAB — wraps Cards and Heroes with sub-tab switcher
// ============================================================
function renderLoadoutTab(c) {
  // Preset selector chips (1, 2, 3) — equal-sized, matching subtab style
  const ap = save.activePreset || 0;
  const presetBar = document.createElement('div');
  presetBar.className = 'loadout-preset-bar';
  var presetBtnsHtml = '';
  for (var pi = 0; pi < 3; pi++) {
    var pActive = pi === ap ? ' active' : '';
    presetBtnsHtml += '<button class="loadout-preset-btn' + pActive + '" data-pidx="' + pi + '">' + (pi + 1) + '</button>';
  }
  presetBar.innerHTML = presetBtnsHtml;
  c.appendChild(presetBar);

  // Wire preset chips — switch loadout (cards + heroes)
  presetBar.querySelectorAll('.loadout-preset-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var pidx = parseInt(btn.dataset.pidx, 10);
      if (pidx === (save.activePreset || 0)) return;
      switchPreset(pidx);
    });
  });

  // Sub-tab bar
  const tabBar = document.createElement('div');
  tabBar.className = 'loadout-subtab-bar';
  tabBar.innerHTML = `
    <button class="loadout-subtab ${loadoutSubTab === 'cards' ? 'active' : ''}" data-ltab="cards">CARDS</button>
    <button class="loadout-subtab ${loadoutSubTab === 'heroes' ? 'active' : ''}" data-ltab="heroes">HEROES</button>
  `;
  c.appendChild(tabBar);
  tabBar.querySelectorAll('.loadout-subtab').forEach(function(btn) {
    btn.addEventListener('click', function() {
      loadoutSubTab = this.getAttribute('data-ltab');
      renderSubmenu();
    });
  });

  const content = document.createElement('div');
  c.appendChild(content);
  if (loadoutSubTab === 'cards') {
    renderCardsTab(content);
  } else {
    renderHeroesTab(content);
  }
}

// ============================================================
// HEROES TAB — hero roster, garrison, core upgrade, leveling
// ============================================================
function renderHeroesTab(c) {
  const coreLevel = save.coreLevel || 1;
  const maxSlots = coreLevel;
  const garrison = save.garrisonSlots || [];
  const unlocked = save.heroesUnlocked || [];
  const manuals = save.trainingManuals || 0;
  const coreMul = coreMultiplier(coreLevel);
  const nextCoreCost = coreUpgradeCost(coreLevel);
  const canUpgradeCore = coreLevel < CORE_UPGRADE.maxLevel && save.coins >= nextCoreCost;

  // --- Core Upgrade Section ---
  let html = `
    <div class="hero-core-section">
      <div class="hero-core-header">
        <span class="hero-core-icon">&#9883;</span>
        <span class="hero-core-title">CORE LEVEL ${coreLevel}</span>
      </div>
      <div class="hero-core-stats">
        <div class="hero-core-stat"><span>Garrison Slots</span><span>${garrison.length} / ${maxSlots}</span></div>
        <div class="hero-core-stat"><span>Global Multiplier</span><span>${coreMul.toFixed(2)}x</span></div>
        <div class="hero-core-stat"><span>Training Manuals</span><span style="color:var(--cyan2)">${manuals}</span></div>
      </div>
      ${coreLevel < CORE_UPGRADE.maxLevel ? `
        <button class="hero-core-upgrade ${canUpgradeCore ? '' : 'disabled'}" id="btnCoreUpgrade">
          UPGRADE CORE &rarr; Lv${coreLevel + 1} &middot; ${formatNum(nextCoreCost)} scrap
        </button>
      ` : '<div class="hero-core-maxed">CORE MAXED</div>'}
    </div>
  `;

  // --- Garrison Slots Visual ---
  html += '<div class="hero-garrison-section"><div class="hero-garrison-title">GARRISON</div><div class="hero-garrison-slots">';
  for (let i = 0; i < maxSlots; i++) {
    const hid = garrison[i] || null;
    if (hid && HERO_DEFS[hid]) {
      const def = HERO_DEFS[hid];
      const heroData = save.heroes[hid] || { level: 1 };
      const passiveMul = heroPassiveMultiplier(heroData.level);
      const isActive = isHeroAbilityActive(hid);
      const cdRemain = getHeroAbilityCooldownRemaining(hid);
      const cat = HERO_CATEGORIES[def.category];
      html += `
        <div class="hero-garrison-slot filled ${isActive ? 'ability-active' : ''}" data-hero="${hid}">
          <div class="hgs-icon">${def.icon}</div>
          <div class="hgs-name">${def.name}</div>
          <div class="hgs-level">Lv${heroData.level} &middot; ${passiveMul.toFixed(1)}x</div>
          ${cdRemain > 0
            ? `<div class="hgs-cooldown">${Math.ceil(cdRemain / 1000)}s</div>`
            : `<button class="hgs-activate" data-activate="${hid}">&#9889; ACTIVATE</button>`}
          <button class="hgs-remove" data-ungarrison="${hid}">&times;</button>
        </div>`;
    } else {
      html += `<div class="hero-garrison-slot empty"><div class="hgs-empty-plus">+</div></div>`;
    }
  }
  html += '</div></div>';

  // --- Hero Roster ---
  html += '<div class="hero-roster-section"><div class="hero-roster-title">ALL HEROES</div><div class="hero-roster">';
  const sortedHeroes = Object.values(HERO_DEFS).sort(function(a, b) { return a.order - b.order; });
  for (let i = 0; i < sortedHeroes.length; i++) {
    const def = sortedHeroes[i];
    const isUnlocked = unlocked.indexOf(def.id) !== -1;
    const isGarr = isHeroGarrisoned(def.id);
    const heroData = save.heroes[def.id] || { level: 1 };
    const passiveMul = isUnlocked ? heroPassiveMultiplier(heroData.level) : 0;
    const cat = HERO_CATEGORIES[def.category];
    const manualCost = isUnlocked ? heroManualCost(heroData.level) : 0;
    const canLevel = isUnlocked && manuals >= manualCost;
    const canGarrison = isUnlocked && !isGarr && garrison.length < maxSlots;
    const rankDef = typeof RANK_DEFS !== 'undefined' ? RANK_DEFS[def.stat] : null;
    const statName = rankDef ? rankDef.name : def.stat;
    const catLabel = def.category.charAt(0).toUpperCase() + def.category.slice(1);
    const catColor = def.category === 'combat' ? 'var(--danger)' : def.category === 'economy' ? 'var(--gold)' : 'var(--good)';

    if (!isUnlocked) {
      // Locked hero
      let lockReason = 'Tier ' + def.unlockTier;
      if (def.family) lockReason += ' + ' + (UNLOCK_FAMILIES[def.family] ? UNLOCK_FAMILIES[def.family].name : def.family);
      html += `
        <div class="hero-card locked">
          <div class="hc-icon">?</div>
          <div class="hc-info">
            <div class="hc-name">${def.name}</div>
            <div class="hc-lock-reason">${lockReason}</div>
          </div>
        </div>`;
    } else {
      html += `
        <div class="hero-card unlocked ${isGarr ? 'garrisoned' : ''}">
          <div class="hc-icon">${def.icon}</div>
          <div class="hc-info">
            <div class="hc-name">${def.name} <span class="hc-cat" style="color:${catColor}">${catLabel}</span></div>
            <div class="hc-stat">Boosts: ${statName}</div>
            <div class="hc-passive">Passive: ${passiveMul.toFixed(1)}x &middot; Active: ${(passiveMul * cat.activeMul).toFixed(1)}x for ${cat.activeDuration / 1000}s</div>
            <div class="hc-level">Lv${heroData.level} &middot; Next: ${manualCost} manuals</div>
          </div>
          <div class="hc-actions">
            <button class="hc-btn-level ${canLevel ? '' : 'disabled'}" data-levelup="${def.id}">TRAIN</button>
            ${!isGarr ? `<button class="hc-btn-garrison ${canGarrison ? '' : 'disabled'}" data-garrison="${def.id}">EQUIP</button>` : '<span class="hc-equipped-badge">EQUIPPED</span>'}
          </div>
        </div>`;
    }
  }
  html += '</div></div>';

  // --- Manual Store ---
  html += '<div class="hero-store-section"><div class="hero-store-title">MANUAL STORE</div><div class="hero-store-packs">';
  for (let i = 0; i < MANUAL_STORE.length; i++) {
    const pack = MANUAL_STORE[i];
    const canBuy = save.gems >= pack.gemCost;
    html += `
      <button class="hero-store-pack ${canBuy ? '' : 'disabled'}" data-buypack="${pack.id}">
        <div class="hsp-name">${pack.name}</div>
        <div class="hsp-cost">${pack.gemCost} gems</div>
      </button>`;
  }
  html += '</div></div>';

  c.innerHTML = html;

  // --- Wire Events ---
  const btnCore = c.querySelector('#btnCoreUpgrade');
  if (btnCore) btnCore.addEventListener('click', function() {
    if (purchaseCoreUpgrade()) renderSubmenu();
  });
  c.querySelectorAll('[data-activate]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      activateHeroAbility(this.getAttribute('data-activate'));
      renderSubmenu();
    });
  });
  c.querySelectorAll('[data-ungarrison]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      ungarrisonHero(this.getAttribute('data-ungarrison'));
      saveCurrentToPreset(save.activePreset || 0); // auto-save
      renderSubmenu();
    });
  });
  c.querySelectorAll('[data-levelup]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (levelUpHero(this.getAttribute('data-levelup'))) renderSubmenu();
    });
  });
  c.querySelectorAll('[data-garrison]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (garrisonHero(this.getAttribute('data-garrison'))) {
        saveCurrentToPreset(save.activePreset || 0); // auto-save
        renderSubmenu();
      }
    });
  });
  c.querySelectorAll('[data-buypack]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (buyManualPack(this.getAttribute('data-buypack'))) renderSubmenu();
    });
  });
}

function renderShopTab(c) {
  const now = Date.now();
  const lastAd = save.lastAdRewardTime || 0;
  const cooldownMs = 24 * 60 * 60 * 1000;
  const remaining = Math.max(0, cooldownMs - (now - lastAd));
  const available = remaining === 0;
  const hrLeft = Math.ceil(remaining / (60 * 60 * 1000));

  const singlePullDisabled = save.gems < CARD_PRICING.pullSingle;
  const bundleDisabled = save.gems < CARD_PRICING.pullBundle;
  const heroPullPool = typeof getHeroPullPool === 'function' ? getHeroPullPool() : [];
  const heroSingleDisabled = save.gems < HERO_PULL_PRICING.pullSingle || heroPullPool.length === 0;
  const heroBundleDisabled = save.gems < HERO_PULL_PRICING.pullBundle || heroPullPool.length === 0;
  const heroPoolNote = heroPullPool.length === 0 ? 'All heroes unlocked!' : heroPullPool.length + ' hero' + (heroPullPool.length !== 1 ? 'es' : '') + ' available';

  c.innerHTML = `
    <div class="shop-section-title">Free Gems</div>
    <div class="lab">
      <div class="lab-header">
        <span class="lab-name">📺 Daily Ad Reward</span>
        <span class="lab-level">+20 💎</span>
      </div>
      <div class="lab-desc">Watch a 30-second ad, get 20 gems. Available once every 24 hours. Ads are opt-in and support the game's development.</div>
      <button class="lab-buy" id="shopAdBtn" ${!available ? 'disabled' : ''}>
        ${available ? 'Watch Ad · +20 💎' : `Available in ${hrLeft}h`}
      </button>
    </div>

    <div class="shop-section-title">Card Packs</div>
    <div class="shop-section-sub">78% Standard · 20% Prime · 2% Apex · Duplicates level cards</div>
    <div class="card-pack-grid">
      <button class="card-pack-btn" id="cardPullSingleBtn" ${singlePullDisabled ? 'disabled' : ''}>
        <div class="pack-title">Single Pull</div>
        <div class="pack-desc">1 random card</div>
        <div class="pack-cost">${CARD_PRICING.pullSingle} 💎</div>
      </button>
      <button class="card-pack-btn bundle" id="cardPullBundleBtn" ${bundleDisabled ? 'disabled' : ''}>
        <div class="pack-title">10-Pull Bundle</div>
        <div class="pack-desc">10 random cards · save 20💎</div>
        <div class="pack-cost">${CARD_PRICING.pullBundle} 💎</div>
      </button>
    </div>

    <div class="shop-section-title">Hero Pulls</div>
    <div class="shop-section-sub">${heroPoolNote}</div>
    <div class="card-pack-grid">
      <button class="card-pack-btn hero-pull" id="heroPullSingleBtn" ${heroSingleDisabled ? 'disabled' : ''}>
        <div class="pack-title">Single Pull</div>
        <div class="pack-desc">1 random hero</div>
        <div class="pack-cost">${HERO_PULL_PRICING.pullSingle} 💎</div>
      </button>
      <button class="card-pack-btn bundle hero-pull" id="heroPullBundleBtn" ${heroBundleDisabled ? 'disabled' : ''}>
        <div class="pack-title">5-Pull Bundle</div>
        <div class="pack-desc">5 random heroes · save 25💎</div>
        <div class="pack-cost">${HERO_PULL_PRICING.pullBundle} 💎</div>
      </button>
    </div>

    <div class="shop-section-title">Mobile Store</div>
    <div class="shop-section-sub">${purchasePlatformLabel()} · ${monetizationStatusText()}</div>
    <div class="mobile-store-controls">
      <button class="cloud-btn" id="mobileStoreSyncBtn" type="button">${isNativeStoreBuild() ? 'Sync Store Catalog' : 'Prep Native Store'}</button>
      <button class="cloud-btn cloud-btn-muted" id="mobileStoreRestoreBtn" type="button" ${isNativeStoreBuild() ? '' : 'disabled'}>${isNativeStoreBuild() ? 'Restore Purchases' : 'Native build only'}</button>
    </div>
    <div class="mobile-store-grid">
      ${STORE_PRODUCT_CATALOG.map(product => `
        <div class="mobile-store-card">
          <div class="mobile-store-top">
            <div>
              <div class="mobile-store-name">${product.title}</div>
              <div class="mobile-store-rewards">${rewardSummaryForProduct(product)}</div>
            </div>
            <div class="mobile-store-badge">${product.badge}</div>
          </div>
          <div class="mobile-store-desc">${product.description}</div>
          <div class="mobile-store-meta">
            <span>${displayStorePrice(product)}</span>
            <span>${nativeStoreAvailabilityLabel(product)}</span>
          </div>
          ${product.id === 'monthly_vault' && save.monthlyVaultActive ? `<div class="mobile-store-owned">Monthly Vault Active</div>` : ''}
          <button class="mobile-store-btn" data-store-product="${product.id}" ${canPurchaseStoreProduct(product) ? '' : 'disabled'}>
            ${storePurchaseButtonLabel(product)}
          </button>
        </div>
      `).join('')}
    </div>

    <div class="shop-section-title">Coming Soon</div>
    <div class="shop-coming">
      <div class="shop-coming-item">
        <div class="shop-coming-icon">💎</div>
        <div class="shop-coming-text">
          <b>Gem Packs</b><br>
          <span>v0.8 · $0.99 starter, $4.99 starter bundle, $9.99 monthly pass, etc.</span>
        </div>
      </div>
      <div class="shop-coming-item">
        <div class="shop-coming-icon">✨</div>
        <div class="shop-coming-text">
          <b>Apex Shards</b><br>
          <span>v0.8 · Deterministic progress to Apex cards via shards/pity.</span>
        </div>
      </div>
      <div class="shop-coming-item">
        <div class="shop-coming-icon">🏆</div>
        <div class="shop-coming-text">
          <b>Tournaments</b><br>
          <span>v0.9 · Weekly brackets. Card rewards top spots.</span>
        </div>
      </div>
    </div>
  `;

  const adBtn = document.getElementById('shopAdBtn');
  if (adBtn && available) {
    adBtn.addEventListener('click', () => {
      showSimulatedAd('Free Gems (+20 💎)', 'Thanks for supporting the game. Real ads will launch with the beta.', () => {
        save.gems += 20;
        save.lastAdRewardTime = Date.now();
        persistSave();
        renderHud();
        renderSubmenu();
      });
    });
  }

  // Single pull (throttled to prevent accidental double-pulls)
  const pullBtn = document.getElementById('cardPullSingleBtn');
  if (pullBtn) {
    let pullCooldown = false;
    pullBtn.addEventListener('click', () => {
      if (pullCooldown) return;
      const result = performPull();
      if (result) {
        pullCooldown = true;
        pullBtn.disabled = true;
        showPullReveal([result]);
        renderHud();
        renderSubmenu();
        setTimeout(() => { pullCooldown = false; pullBtn.disabled = false; }, 800);
      }
    });
  }

  // Bundle pull (throttled to prevent accidental double-pulls)
  const bundleBtn = document.getElementById('cardPullBundleBtn');
  if (bundleBtn) {
    let bundleCooldown = false;
    bundleBtn.addEventListener('click', () => {
      if (bundleCooldown) return;
      const results = performBundle();
      if (results) {
        bundleCooldown = true;
        bundleBtn.disabled = true;
        showPullReveal(results);
        renderHud();
        renderSubmenu();
        setTimeout(() => { bundleCooldown = false; bundleBtn.disabled = false; }, 800);
      }
    });
  }

  // Hero single pull
  const heroPullBtn = document.getElementById('heroPullSingleBtn');
  if (heroPullBtn) {
    let heroPullCooldown = false;
    heroPullBtn.addEventListener('click', () => {
      if (heroPullCooldown) return;
      const result = performHeroPull();
      if (result) {
        heroPullCooldown = true;
        heroPullBtn.disabled = true;
        if (typeof showHeroUnlockToast === 'function') showHeroUnlockToast(result.hero);
        renderHud();
        renderSubmenu();
        setTimeout(() => { heroPullCooldown = false; }, 800);
      }
    });
  }

  // Hero bundle pull
  const heroBundleBtn = document.getElementById('heroPullBundleBtn');
  if (heroBundleBtn) {
    let heroBundleCooldown = false;
    heroBundleBtn.addEventListener('click', () => {
      if (heroBundleCooldown) return;
      const results = performHeroBundle();
      if (results) {
        heroBundleCooldown = true;
        heroBundleBtn.disabled = true;
        results.forEach(function(r, i) {
          if (typeof showHeroUnlockToast === 'function') setTimeout(function() { showHeroUnlockToast(r.hero); }, i * 600);
        });
        renderHud();
        renderSubmenu();
        setTimeout(() => { heroBundleCooldown = false; }, 800);
      }
    });
  }

  c.querySelectorAll('.mobile-store-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await beginStorePurchase(btn.dataset.storeProduct);
    });
  });

  const mobileStoreSyncBtn = document.getElementById('mobileStoreSyncBtn');
  if (mobileStoreSyncBtn) {
    mobileStoreSyncBtn.addEventListener('click', async () => {
      if (!isNativeStoreBuild()) {
        showStoreNotice('Use the generated Android or iPhone app shell for real billing. The web preview cannot open App Store or Google Play purchase dialogs.');
        return;
      }
      await refreshStoreCatalog();
    });
  }

  const mobileStoreRestoreBtn = document.getElementById('mobileStoreRestoreBtn');
  if (mobileStoreRestoreBtn) {
    mobileStoreRestoreBtn.addEventListener('click', async () => {
      await restoreStorePurchases();
    });
  }
}

// Reveal a pull result as a full-screen overlay
function showPullReveal(results) {
  const overlay = document.createElement('div');
  overlay.className = 'pull-reveal-overlay';
  const grid = results.map(r => {
    const card = r.card;
    const tc = CARD_TIER_COLORS[card.tier];
    const badge = r.newlyUnlocked ? '<div class="pull-badge new">NEW!</div>'
                : r.leveledUp ? `<div class="pull-badge up">LV UP → ${r.level}</div>`
                : `<div class="pull-badge dup">DUPE +1</div>`;
    return `
      <div class="pull-card" data-card="${card.id}" style="border-color:${tc.border}; background:${tc.bg}">
        <div class="pull-card-tier" style="color:${tc.nameColor}">${tc.name}</div>
        <div class="pull-card-name">${card.name}</div>
        ${badge}
      </div>`;
  }).join('');
  overlay.innerHTML = `
    <div class="pull-reveal-card">
      <div class="pull-reveal-title">${results.length === 1 ? 'You got:' : `${results.length} Cards`}</div>
      <div class="pull-reveal-grid">${grid}</div>
      <button class="pull-reveal-btn" id="pullRevealClose">Continue</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('pullRevealClose').addEventListener('click', () => {
    overlay.remove();
    // Re-render the shop so newly-owned cards are removed from direct-unlock list
    renderSubmenu();
  });
}

// ============================================================
// SKINS TAB — cosmetic only, no gameplay effect
// ============================================================
function renderSkinsTab(c) {
  // Reflect the currently-equipped skins from save.
  // Defaults: null = no skin equipped → uses original CSS tower/bg.
  const equippedCore = (save.equippedCoreSkin || null);
  const equippedBg   = (save.equippedBgSkin   || null);

  // Core skins — IDs match /assets/cores/ filenames and css/skins.css selectors.
  // All are free/owned right now for testing; economy wiring is a later pass.
  const coreSkins = [
    { id: 'sentinel',   name: 'Sentinel',   cost: 0 },
    { id: 'industrial', name: 'Industrial', cost: 0 },
    { id: 'verdant',    name: 'Verdant',    cost: 0 },
    { id: 'aegis',      name: 'Aegis',      cost: 0 },
    { id: 'frost',      name: 'Frost',      cost: 0 },
    { id: 'royal',      name: 'Royal',      cost: 0 }
  ];

  const bgSkins = [
    { id: 'cyber_grid', name: 'Cyber Grid', cost: 0 },
    { id: 'industrial', name: 'Reactor',    cost: 0 },
    { id: 'organic',    name: 'Organic',    cost: 0 },
    { id: 'steel',      name: 'Steel Bay',  cost: 0 }
  ];

  const tileHTML = (s, kind, equippedId) => {
    const isEquipped = s.id === equippedId;
    const statusLabel = isEquipped ? 'EQUIPPED' : 'Equip';
    const statusClass = isEquipped ? 'equipped' : 'owned';
    return `
      <div class="skin-tile ${statusClass}" data-skin="${s.id}" data-kind="${kind}">
        <div class="skin-preview"></div>
        <div class="skin-name">${s.name}</div>
        <div class="skin-status">${statusLabel}</div>
      </div>`;
  };

  c.innerHTML = `
    <div class="shop-section-title">Core Skins</div>
    <div class="shop-section-sub">Change the look of your Core · cosmetic only</div>
    <div class="skin-grid">
      ${coreSkins.map(s => tileHTML(s, 'core', equippedCore)).join('')}
    </div>

    <div class="shop-section-title">Background Skins</div>
    <div class="shop-section-sub">Change the battlefield backdrop</div>
    <div class="skin-grid">
      ${bgSkins.map(s => tileHTML(s, 'bg', equippedBg)).join('')}
    </div>

    <div class="shop-section-title">Coming Soon</div>
    <div class="shop-coming">
      <div class="shop-coming-item">
        <div class="shop-coming-icon">🎯</div>
        <div class="shop-coming-text">
          <b>Projectile Skins</b><br>
          <span>Pulse bolts, beam bursts, arc chains — art ready, wiring pending.</span>
        </div>
      </div>
      <div class="shop-coming-item">
        <div class="shop-coming-icon">🎛️</div>
        <div class="shop-coming-text">
          <b>UI Themes</b><br>
          <span>Reskin the HUD and menus.</span>
        </div>
      </div>
      <div class="shop-coming-item">
        <div class="shop-coming-icon">🎁</div>
        <div class="shop-coming-text">
          <b>Skin Bundles</b><br>
          <span>Matching Core + background pairs.</span>
        </div>
      </div>
    </div>
  `;

  c.querySelectorAll('.skin-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const id = tile.getAttribute('data-skin');
      const kind = tile.getAttribute('data-kind');
      if (kind === 'core' && typeof equipCoreSkin === 'function') equipCoreSkin(id);
      if (kind === 'bg'   && typeof equipBgSkin   === 'function') equipBgSkin(id);
      renderSkinsTab(c); // re-render to update EQUIPPED label
    });
  });
}

function renderSettingsTab(c) {
  c.innerHTML = '';

  // --- Profile (username) ---
  const profileWrap = document.createElement('div');
  profileWrap.className = 'profile-section';
  profileWrap.innerHTML = `
    <div class="profile-section-title">Profile</div>
    <div class="profile-row">
      <input class="profile-input"
             id="usernameInput"
             type="text"
             maxlength="16"
             autocomplete="off"
             autocapitalize="off"
             autocorrect="off"
             spellcheck="false"
             value="${(save.username || '').replace(/"/g, '&quot;')}">
      <button class="profile-save-btn" id="usernameSaveBtn" disabled>Save</button>
    </div>
    <div class="profile-hint" id="usernameHint">3–16 chars · letters, numbers, _ or -</div>
    <div class="profile-meta">
      <span class="profile-meta-label">Last changed</span>
      <span class="profile-meta-value" id="usernameLastChanged">${formatRelativeTime(save.usernameLastChanged)}</span>
    </div>
  `;
  c.appendChild(profileWrap);
  const pInput = profileWrap.querySelector('#usernameInput');
  const pBtn = profileWrap.querySelector('#usernameSaveBtn');
  const pHint = profileWrap.querySelector('#usernameHint');
  const pLast = profileWrap.querySelector('#usernameLastChanged');
  const pOriginal = save.username || '';
  function profileValidate() {
    const v = validateUsername(pInput.value);
    const changed = pInput.value.trim() !== pOriginal;
    if (!v.ok) {
      pInput.classList.add('invalid');
      pHint.classList.add('error');
      pHint.textContent = v.reason;
      pBtn.disabled = true;
    } else {
      pInput.classList.remove('invalid');
      pHint.classList.remove('error');
      pHint.textContent = '3–16 chars · letters, numbers, _ or -';
      pBtn.disabled = !changed;
    }
  }
  pInput.addEventListener('input', profileValidate);
  pBtn.addEventListener('click', () => {
    const result = setUsername(pInput.value);
    if (!result.ok) {
      pHint.classList.add('error');
      pHint.textContent = result.reason;
      pInput.classList.add('invalid');
      return;
    }
    pBtn.textContent = 'Saved';
    pBtn.classList.add('saved');
    pBtn.disabled = true;
    pLast.textContent = formatRelativeTime(save.usernameLastChanged);
    setTimeout(() => { pBtn.textContent = 'Save'; pBtn.classList.remove('saved'); }, 1400);
    if (typeof renderMenu === 'function') renderMenu();
  });
  profileValidate();
  if (typeof renderCloudSettingsSection === 'function') {
    renderCloudSettingsSection(c);
  }
  if (typeof renderMonetizationSettingsSection === 'function') {
    renderMonetizationSettingsSection(c);
  }

  // Theme picker
  const themes = [
    { key: 'neon',   name: 'Neon',   swatch: ['#00f0ff','#ff3366','#ffcc00'] },
    { key: 'steel',  name: 'Steel',  swatch: ['#8ab4d8','#d66272','#d4b66a'] },
    { key: 'amber',  name: 'Amber',  swatch: ['#ffaa44','#dd5544','#ffdd66'] },
    { key: 'forest', name: 'Forest', swatch: ['#6dd47e','#cc6a5a','#d4b866'] },
    { key: 'royal',  name: 'Royal',  swatch: ['#b488e8','#d66288','#e0b8e8'] },
    { key: 'mono',   name: 'Mono',   swatch: ['#e0e0e0','#c0c0c0','#f0f0f0'] }
  ];
  const themeWrap = document.createElement('div');
  themeWrap.innerHTML = `<div style="color:var(--accent);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:bold">Theme</div>`;
  const pickerEl = document.createElement('div');
  pickerEl.className = 'theme-picker';
  pickerEl.style.gridTemplateColumns = 'repeat(3, 1fr)';
  for (const t of themes) {
    const opt = document.createElement('div');
    opt.className = 'theme-opt' + (save.settings.theme === t.key ? ' active' : '');
    opt.dataset.theme = t.key;
    opt.innerHTML = `${t.name}<div class="theme-swatch">${t.swatch.map(s => `<span class="theme-swatch-dot" style="background:${s}"></span>`).join('')}</div>`;
    opt.addEventListener('click', () => {
      save.settings.theme = t.key;
      document.documentElement.dataset.theme = t.key;
      persistSave();
      renderSettingsTab(c);
    });
    pickerEl.appendChild(opt);
  }
  themeWrap.appendChild(pickerEl);
  themeWrap.appendChild(Object.assign(document.createElement('div'), { style: 'height:14px' }));
  c.appendChild(themeWrap);

  // --- Display Settings Section ---
  const displayHeader = document.createElement('div');
  displayHeader.className = 'settings-section-title';
  displayHeader.textContent = 'Display';
  c.appendChild(displayHeader);

  const settings = [
    { key: 'showFloatingDamage', label: 'Damage numbers', desc: 'Show floating damage on enemy hits' },
    { key: 'showFloatingCash',   label: 'Cash numbers',   desc: 'Show +$N on kills' },
    { key: 'showFloatingHeals',  label: 'Heal numbers',   desc: 'Show heal amounts' }
  ];
  for (const s of settings) {
    const row = document.createElement('div');
    row.className = 'setting-row';
    row.innerHTML = `
      <div>
        <div class="setting-label">${s.label}</div>
        <div class="setting-desc">${s.desc}</div>
      </div>
      <div class="toggle ${save.settings[s.key] ? 'on' : ''}" data-key="${s.key}"></div>
    `;
    row.querySelector('.toggle').addEventListener('click', (e) => {
      const k = e.currentTarget.dataset.key;
      save.settings[k] = !save.settings[k];
      e.currentTarget.classList.toggle('on');
      persistSave();
    });
    c.appendChild(row);
  }

  // --- Stats Section ---
  const statsHeader = document.createElement('div');
  statsHeader.className = 'settings-section-title';
  statsHeader.textContent = 'Lifetime Statistics';
  c.appendChild(statsHeader);

  const totalMin = (save.totalPlaytimeMs / 60000).toFixed(1);
  const totalHrs = (save.totalPlaytimeMs / 3600000);
  const timeStr = totalHrs >= 1 ? `${totalHrs.toFixed(1)} hrs` : `${totalMin} min`;
  const statsBox = document.createElement('div');
  statsBox.className = 'settings-stats-grid';
  statsBox.innerHTML = `
    <div class="sstat"><span class="sstat-val">${save.totalRuns}</span><span class="sstat-label">Runs</span></div>
    <div class="sstat"><span class="sstat-val">T${save.bestTier}·W${save.bestWave}</span><span class="sstat-label">Best</span></div>
    <div class="sstat"><span class="sstat-val">${highestUnlockedTier()}/${MAX_TIER}</span><span class="sstat-label">Tiers</span></div>
    <div class="sstat"><span class="sstat-val">${formatNum(save.totalEnemiesKilled)}</span><span class="sstat-label">Kills</span></div>
    <div class="sstat"><span class="sstat-val">${formatNum(save.totalBossesDefeated || 0)}</span><span class="sstat-label">Bosses</span></div>
    <div class="sstat"><span class="sstat-val">${timeStr}</span><span class="sstat-label">Playtime</span></div>
    <div class="sstat"><span class="sstat-val">${formatNum(save.totalCashEarned)}</span><span class="sstat-label">Cash</span></div>
    <div class="sstat"><span class="sstat-val">${formatNum(save.totalGemsEarned || 0)}</span><span class="sstat-label">Gems</span></div>
  `;
  c.appendChild(statsBox);

  // --- Danger Zone ---
  const dangerHeader = document.createElement('div');
  dangerHeader.className = 'settings-section-title';
  dangerHeader.style.color = 'var(--danger)';
  dangerHeader.textContent = 'Danger Zone';
  c.appendChild(dangerHeader);

  const resetBtn = document.createElement('button');
  resetBtn.className = 'lab-buy';
  resetBtn.style.cssText = 'background:var(--danger);border-color:var(--danger);color:white;margin-top:14px';
  resetBtn.textContent = 'RESET ALL PROGRESS';
  resetBtn.addEventListener('click', resetSave);
  c.appendChild(resetBtn);

  // Version text — tap 7 times to unlock dev panel
  const ver = document.createElement('div');
  ver.style.cssText = 'text-align:center;color:var(--muted);font-size:9px;margin-top:12px;line-height:1.5;cursor:pointer;padding:10px;user-select:none';
  const verDefault = 'Core Surge v0.7.24 · Installable App Shell · tap 7x for dev tools';
  ver.textContent = verDefault;
  let tapCount = 0;
  let tapTimer = null;
  ver.addEventListener('click', () => {
    tapCount++;
    if (tapTimer) clearTimeout(tapTimer);
    tapTimer = setTimeout(() => {
      tapCount = 0;
      ver.textContent = verDefault;
    }, 2000);
    if (tapCount >= 7) {
      tapCount = 0;
      ver.textContent = '✓ DEV MODE ACTIVATED';
      save.settings.devMode = true;
      persistSave();
      setTimeout(() => {
        ver.textContent = verDefault;
        openDevPanel();
        renderSettingsTab(c);
        renderHud();
      }, 400);
    } else if (tapCount >= 3) {
      ver.textContent = `${7 - tapCount} more...`;
    }
  });
  c.appendChild(ver);

  if (save.settings.devMode) {
    const devBtn = document.createElement('button');
    devBtn.className = 'lab-buy';
    devBtn.style.cssText = 'background:var(--gold);color:var(--bg);border-color:var(--gold);margin-top:8px;font-weight:bold';
    devBtn.textContent = '⚙ OPEN DEV PANEL';
    devBtn.addEventListener('click', openDevPanel);
    c.appendChild(devBtn);
  }
}

// ============================================================
// DEV PANEL
// ============================================================
function openDevPanel() {
  document.getElementById('devPanel').classList.add('active');
  renderDevPanel();
}
function closeDevPanel() {
  document.getElementById('devPanel').classList.remove('active');
}
function renderDevPanel() {
  const body = document.getElementById('devBody');
  const inBattle = game.running;
  body.innerHTML = `
    <div class="dev-info">
      Dev cheats — useful for testing. Close this panel to resume.
      Changes apply immediately. Battle state: <b>${inBattle ? 'IN BATTLE' : 'IN MENU'}</b>
    </div>

    <div class="dev-section">Currency</div>
    <button class="dev-btn" data-act="coins1k">+ 1,000 scrap</button>
    <button class="dev-btn" data-act="coins100k">+ 100,000 scrap</button>
    <button class="dev-btn" data-act="coins10m">+ 10,000,000 scrap</button>
    <button class="dev-btn" data-act="gems100">+ 100 gems</button>
    <button class="dev-btn" data-act="coins1b">+ 1,000,000,000 scrap</button>
    <button class="dev-btn" data-act="gems10k">+ 10,000 gems</button>

    <div class="dev-section">Progression</div>
    <button class="dev-btn" data-act="maxLabs">Max all labs</button>
    <button class="dev-btn" data-act="unlockTiers">Unlock all tiers</button>
    <button class="dev-btn" data-act="maxSpeed">Max game speed (3×)</button>
    <button class="dev-btn" data-act="setBestWave">Set best to W1000 on T1</button>

    <div class="dev-section">In-Battle (battle only)</div>
    <button class="dev-btn" data-act="fullHeal" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>Full heal</button>
    <button class="dev-btn" data-act="killAll" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>Kill all enemies</button>
    <button class="dev-btn" data-act="spawnBoss" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>Force spawn boss</button>
    <button class="dev-btn" data-act="maxInRun" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>Max in-run (L200)</button>
    <button class="dev-btn" data-act="trueMaxInRun" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>TRUE max (L5000)</button>
    <button class="dev-btn" data-act="cash10k" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>+ 10,000 cash</button>
    <button class="dev-btn" data-act="addWave" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>Skip to next wave</button>

    <div class="dev-section">Starting Wave (next battle)</div>
    <button class="dev-btn" data-act="jumpW50">Start next run at W50</button>
    <button class="dev-btn" data-act="jumpW100">Start next run at W100</button>
    <button class="dev-btn" data-act="jumpW500">Start next run at W500</button>
    <button class="dev-btn" data-act="jumpW1000">Start next run at W1000</button>

    <div class="dev-section">Toggles</div>
    <button class="dev-btn ${save.devState.godMode ? 'toggle-on' : ''}" data-act="godMode">God Mode: ${save.devState.godMode ? 'ON' : 'OFF'}</button>
    <button class="dev-btn" data-act="spawnOrbNow" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>Spawn gem orb now</button>
    <button class="dev-btn" data-act="resetAdCooldown">Reset shop ad cooldown</button>
    <button class="dev-btn" data-act="clearAllMilestones">Clear all milestone claims</button>

    <div class="dev-section">Cards (v0.7.9 economy)</div>
    <button class="dev-btn" data-act="addAllCardsL1">Give all cards · Lv 1</button>
    <button class="dev-btn" data-act="addAllCardsL5">Give all cards · Lv 5 (MAX)</button>
    <button class="dev-btn" data-act="clearCards">Wipe card inventory</button>
    <button class="dev-btn" data-act="unlockAllSlots">Unlock all 10 slots</button>

    <div class="dev-section">Tournament</div>
    <button class="dev-btn" data-act="tourneyForceEnd">Force cycle end now</button>
    <button class="dev-btn" data-act="tourneyResetBracket">Reset bracket (new synths)</button>

    <div class="dev-section">Danger</div>
    <button class="dev-btn" style="border-color:var(--danger);color:var(--danger)" data-act="hideDev">Disable dev mode</button>
    <button class="dev-btn" style="border-color:var(--danger);color:var(--danger)" data-act="reset">Reset ALL progress</button>
  `;
  body.querySelectorAll('.dev-btn').forEach(b => {
    b.addEventListener('click', () => devAct(b.dataset.act));
  });
}

let devJumpWave = 0;

function devAct(act) {
  switch (act) {
    case 'coins1k':   save.coins += 1000; break;
    case 'coins100k': save.coins += 100000; break;
    case 'coins10m':  save.coins += 10000000; break;
    case 'coins1b':   save.coins += 1000000000; break;
    case 'gems100':   save.gems += 100; break;
    case 'gems10k':   save.gems += 10000; break;
    case 'maxLabs':
      // Max all ranks + unlock all families
      for (const fid of Object.keys(UNLOCK_FAMILIES)) save.unlocks[fid] = true;
      for (const rid of Object.keys(RANK_DEFS)) {
        if (!save.ranks[rid]) save.ranks[rid] = { level: 0 };
        save.ranks[rid].level = RANK_DEFS[rid].maxRank;
      }
      break;
    case 'unlockTiers':
      for (let t = 1; t < MAX_TIER; t++) save.bestWavePerTier[t] = Math.max(save.bestWavePerTier[t] || 0, 100);
      break;
    case 'maxSpeed':
      // Game speed is a hard-coded baseline now (3x always available)
      save.settings.gameSpeed = 3;
      break;
    case 'setBestWave':
      save.bestWavePerTier[1] = 1000;
      save.bestWave = 1000;
      break;
    case 'fullHeal':
      if (game.running) game.hp = game.hpMax;
      break;
    case 'killAll':
      if (game.running) {
        for (const e of game.enemies) {
          if (!e.dead) hitEnemy(e, e.hp + 1, true);
        }
      }
      break;
    case 'spawnBoss':
      if (game.running) spawnBoss();
      break;
    case 'maxInRun':
      if (game.running) {
        for (const k of Object.keys(game.upgrades)) {
          const u = game.upgrades[k];
          if (u.isAction) continue;
          // Cap big-stat dev-max to 200 so things are testable, not nuclear.
          // Small-capped stats (targets, etc) go to their max.
          if (u.max && u.max <= 200) u.level = u.max;
          else u.level = 200;
        }
        game.hpMax = getMaxHp();
        game.hp = game.hpMax;
        renderUpgrades();
      }
      break;
    case 'trueMaxInRun':
      if (game.running) {
        for (const k of Object.keys(game.upgrades)) {
          const u = game.upgrades[k];
          if (u.isAction) continue;
          u.level = u.max || 100;
        }
        game.hpMax = getMaxHp();
        game.hp = game.hpMax;
        renderUpgrades();
      }
      break;
    case 'cash10k':
      if (game.running) { game.cash += 10000; game.cashEarnedThisRun += 10000; }
      break;
    case 'addWave':
      if (game.running) {
        for (const e of game.enemies) e.dead = true;
        cleanDeadEnemies();
        advanceWave();
      }
      break;
    case 'jumpW50':   devJumpWave = 50; alert('Next battle will start at Wave 50'); break;
    case 'jumpW100':  devJumpWave = 100; alert('Next battle will start at Wave 100'); break;
    case 'jumpW500':  devJumpWave = 500; alert('Next battle will start at Wave 500'); break;
    case 'jumpW1000': devJumpWave = 1000; alert('Next battle will start at Wave 1000'); break;
    case 'godMode':
      save.devState.godMode = !save.devState.godMode;
      break;
    case 'spawnOrbNow':
      if (game.running && !orbState.currentOrb) {
        spawnGemOrb();
      }
      break;
    case 'resetAdCooldown':
      save.lastAdRewardTime = 0;
      break;
    case 'clearAllMilestones':
      save.claimedMilestones = {};
      break;
    case 'addAllCardsL1':
      for (const id of Object.keys(CARD_POOL)) {
        if (!save.cardInventory[id]) save.cardInventory[id] = { level: 1, copies: 1 };
      }
      break;
    case 'addAllCardsL5':
      for (const id of Object.keys(CARD_POOL)) {
        const card = CARD_POOL[id];
        const maxCopies = COPIES_TO_LEVEL[card.tier][4];
        save.cardInventory[id] = { level: 5, copies: maxCopies };
      }
      break;
    case 'clearCards':
      save.cardInventory = {};
      save.equippedCards = [];
      for (let i = 0; i < save.unlockedSlots; i++) save.equippedCards.push(null);
      break;
    case 'unlockAllSlots':
      save.unlockedSlots = MAX_SLOTS;
      while (save.equippedCards.length < MAX_SLOTS) save.equippedCards.push(null);
      break;
    case 'tourneyForceEnd':
      tourneyDevForceCycleEnd();
      break;
    case 'tourneyResetBracket':
      if (save.tournament) {
        save.tournament.currentBracket = null;
        save.tournament.playerBestWave = 0;
        save.tournament.playerBestTime = 0;
        save.tournament.playerEntries = 0;
        tourneyEnsureActive();
      }
      break;
    case 'hideDev':
      save.settings.devMode = false;
      closeDevPanel();
      renderSubmenu();
      break;
    case 'reset':
      closeDevPanel();
      resetSave();
      return;
  }
  persistSave();
  renderDevPanel();
  renderHud();
  if (activeSubmenu === 'labs' || activeSubmenu === 'cards') renderSubmenu();
}

// override startBattle to honor jump wave
const _origStartBattle = startBattle;
startBattle = function () {
  const w = devJumpWave || 1;
  devJumpWave = 0;
  _origStartBattle(w);
};

function getDevGrantAmount() {
  const input = document.getElementById('devGrantAmount');
  const raw = input ? parseInt(input.value, 10) : 0;
  return Math.max(1, Math.min(1000000000, raw || 0));
}

function clearHeroDevState() {
  if (typeof heroActiveState === 'object' && heroActiveState) {
    for (const heroId of Object.keys(heroActiveState)) delete heroActiveState[heroId];
  }
}

function renderDevPanel() {
  const body = document.getElementById('devBody');
  const inBattle = game.running;
  const unlockedHeroes = Array.isArray(save.heroesUnlocked) ? save.heroesUnlocked.length : 0;
  const totalHeroes = typeof HERO_COUNT === 'number' ? HERO_COUNT : Object.keys(HERO_DEFS || {}).length;
  const garrisonCount = Array.isArray(save.garrisonSlots) ? save.garrisonSlots.filter(Boolean).length : 0;
  const manuals = save.trainingManuals || 0;

  body.innerHTML = `
    <div class="dev-info">
      Dev cheats are for testing only. Changes apply immediately. Battle state: <b>${inBattle ? 'IN BATTLE' : 'IN MENU'}</b>
    </div>

    <div class="dev-section">Custom Grant</div>
    <div class="dev-grant-row">
      <label class="dev-field-label" for="devGrantAmount">Amount</label>
      <input class="dev-input" id="devGrantAmount" type="number" min="1" step="1" value="1000" inputmode="numeric">
    </div>
    <button class="dev-btn" data-act="grantCoins">Give chosen scrap</button>
    <button class="dev-btn" data-act="grantGems">Give chosen gems</button>
    <button class="dev-btn" data-act="grantManuals">Give chosen manuals</button>
    <button class="dev-btn" data-act="grantBattleCash" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>Give chosen battle cash</button>

    <div class="dev-section">Currency</div>
    <button class="dev-btn" data-act="coins1k">+ 1,000 scrap</button>
    <button class="dev-btn" data-act="coins100k">+ 100,000 scrap</button>
    <button class="dev-btn" data-act="coins10m">+ 10,000,000 scrap</button>
    <button class="dev-btn" data-act="gems100">+ 100 gems</button>
    <button class="dev-btn" data-act="coins1b">+ 1,000,000,000 scrap</button>
    <button class="dev-btn" data-act="gems10k">+ 10,000 gems</button>

    <div class="dev-section">Progression</div>
    <button class="dev-btn" data-act="maxLabs">Max all labs</button>
    <button class="dev-btn" data-act="unlockTiers">Unlock all tiers</button>
    <button class="dev-btn" data-act="maxSpeed">Max game speed (3x)</button>
    <button class="dev-btn" data-act="setBestWave">Set best to W1000 on T1</button>

    <div class="dev-section">In-Battle (battle only)</div>
    <button class="dev-btn" data-act="fullHeal" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>Full heal</button>
    <button class="dev-btn" data-act="killAll" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>Kill all enemies</button>
    <button class="dev-btn" data-act="spawnBoss" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>Force spawn boss</button>
    <button class="dev-btn" data-act="maxInRun" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>Max in-run (L200)</button>
    <button class="dev-btn" data-act="trueMaxInRun" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>True max (L5000)</button>
    <button class="dev-btn" data-act="cash10k" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>+ 10,000 cash</button>
    <button class="dev-btn" data-act="addWave" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>Skip to next wave</button>

    <div class="dev-section">Starting Wave (next battle)</div>
    <button class="dev-btn" data-act="jumpW50">Start next run at W50</button>
    <button class="dev-btn" data-act="jumpW100">Start next run at W100</button>
    <button class="dev-btn" data-act="jumpW500">Start next run at W500</button>
    <button class="dev-btn" data-act="jumpW1000">Start next run at W1000</button>

    <div class="dev-section">Toggles</div>
    <button class="dev-btn ${save.devState.godMode ? 'toggle-on' : ''}" data-act="godMode">God Mode: ${save.devState.godMode ? 'ON' : 'OFF'}</button>
    <button class="dev-btn" data-act="spawnOrbNow" ${!inBattle ? 'disabled style="opacity:0.4"' : ''}>Spawn gem orb now</button>
    <button class="dev-btn" data-act="resetAdCooldown">Reset shop ad cooldown</button>
    <button class="dev-btn" data-act="clearAllMilestones">Clear all milestone claims</button>

    <div class="dev-section">Cards</div>
    <button class="dev-btn" data-act="addAllCardsL1">Give all cards | Lv 1</button>
    <button class="dev-btn" data-act="addAllCardsL5">Give all cards | Lv 5 max</button>
    <button class="dev-btn" data-act="clearCards">Wipe card inventory</button>
    <button class="dev-btn" data-act="unlockAllSlots">Unlock all 10 slots</button>

    <div class="dev-section">Heroes</div>
    <div class="dev-info">
      Heroes unlocked: <b>${unlockedHeroes}/${totalHeroes}</b> | Garrisoned: <b>${garrisonCount}</b> | Manuals: <b>${manuals}</b>
    </div>
    <button class="dev-btn" data-act="unlockAllHeroes">Unlock all heroes</button>
    <button class="dev-btn" data-act="removeAllHeroes">Remove all heroes</button>
    <button class="dev-btn" data-act="fillGarrison">Fill garrison with unlocked heroes</button>
    <button class="dev-btn" data-act="clearGarrison">Clear garrison</button>
    <button class="dev-btn" data-act="heroesLv10">Set all unlocked heroes to Lv 10</button>
    <button class="dev-btn" data-act="heroesLv50">Set all unlocked heroes to Lv 50</button>
    <button class="dev-btn" data-act="maxCoreLevel">Max core level</button>

    <div class="dev-section">Tournament</div>
    <button class="dev-btn" data-act="tourneyForceEnd">Force cycle end now</button>
    <button class="dev-btn" data-act="tourneyResetBracket">Reset bracket (new synths)</button>

    <div class="dev-section">Danger</div>
    <button class="dev-btn" style="border-color:var(--danger);color:var(--danger)" data-act="hideDev">Disable dev mode</button>
    <button class="dev-btn" style="border-color:var(--danger);color:var(--danger)" data-act="reset">Reset all progress</button>
  `;

  body.querySelectorAll('.dev-btn').forEach((button) => {
    button.addEventListener('click', () => devAct(button.dataset.act));
  });
}

function devAct(act) {
  const grantAmount = getDevGrantAmount();
  switch (act) {
    case 'coins1k': save.coins += 1000; break;
    case 'coins100k': save.coins += 100000; break;
    case 'coins10m': save.coins += 10000000; break;
    case 'coins1b': save.coins += 1000000000; break;
    case 'gems100': save.gems += 100; break;
    case 'gems10k': save.gems += 10000; break;
    case 'grantCoins':
      save.coins += grantAmount;
      break;
    case 'grantGems':
      save.gems += grantAmount;
      break;
    case 'grantManuals':
      save.trainingManuals = (save.trainingManuals || 0) + grantAmount;
      break;
    case 'grantBattleCash':
      if (game.running) {
        game.cash += grantAmount;
        game.cashEarnedThisRun += grantAmount;
      }
      break;
    case 'maxLabs':
      for (const fid of Object.keys(UNLOCK_FAMILIES)) save.unlocks[fid] = true;
      for (const rid of Object.keys(RANK_DEFS)) {
        if (!save.ranks[rid]) save.ranks[rid] = { level: 0 };
        save.ranks[rid].level = RANK_DEFS[rid].maxRank;
      }
      break;
    case 'unlockTiers':
      for (let tier = 1; tier < MAX_TIER; tier++) save.bestWavePerTier[tier] = Math.max(save.bestWavePerTier[tier] || 0, 100);
      break;
    case 'maxSpeed':
      save.settings.gameSpeed = 3;
      break;
    case 'setBestWave':
      save.bestWavePerTier[1] = 1000;
      save.bestWave = 1000;
      break;
    case 'fullHeal':
      if (game.running) game.hp = game.hpMax;
      break;
    case 'killAll':
      if (game.running) {
        for (const enemy of game.enemies) {
          if (!enemy.dead) hitEnemy(enemy, enemy.hp + 1, true);
        }
      }
      break;
    case 'spawnBoss':
      if (game.running) spawnBoss();
      break;
    case 'maxInRun':
      if (game.running) {
        for (const key of Object.keys(game.upgrades)) {
          const upgrade = game.upgrades[key];
          if (upgrade.isAction) continue;
          if (upgrade.max && upgrade.max <= 200) upgrade.level = upgrade.max;
          else upgrade.level = 200;
        }
        game.hpMax = getMaxHp();
        game.hp = game.hpMax;
        renderUpgrades();
      }
      break;
    case 'trueMaxInRun':
      if (game.running) {
        for (const key of Object.keys(game.upgrades)) {
          const upgrade = game.upgrades[key];
          if (upgrade.isAction) continue;
          upgrade.level = upgrade.max || 100;
        }
        game.hpMax = getMaxHp();
        game.hp = game.hpMax;
        renderUpgrades();
      }
      break;
    case 'cash10k':
      if (game.running) {
        game.cash += 10000;
        game.cashEarnedThisRun += 10000;
      }
      break;
    case 'addWave':
      if (game.running) {
        for (const enemy of game.enemies) enemy.dead = true;
        cleanDeadEnemies();
        advanceWave();
      }
      break;
    case 'jumpW50': devJumpWave = 50; alert('Next battle will start at Wave 50'); break;
    case 'jumpW100': devJumpWave = 100; alert('Next battle will start at Wave 100'); break;
    case 'jumpW500': devJumpWave = 500; alert('Next battle will start at Wave 500'); break;
    case 'jumpW1000': devJumpWave = 1000; alert('Next battle will start at Wave 1000'); break;
    case 'godMode':
      save.devState.godMode = !save.devState.godMode;
      break;
    case 'spawnOrbNow':
      if (game.running && !orbState.currentOrb) spawnGemOrb();
      break;
    case 'resetAdCooldown':
      save.lastAdRewardTime = 0;
      break;
    case 'clearAllMilestones':
      save.claimedMilestones = {};
      break;
    case 'addAllCardsL1':
      for (const cardId of Object.keys(CARD_POOL)) {
        if (!save.cardInventory[cardId]) save.cardInventory[cardId] = { level: 1, copies: 1 };
      }
      break;
    case 'addAllCardsL5':
      for (const cardId of Object.keys(CARD_POOL)) {
        const card = CARD_POOL[cardId];
        const maxCopies = COPIES_TO_LEVEL[card.tier][4];
        save.cardInventory[cardId] = { level: 5, copies: maxCopies };
      }
      break;
    case 'clearCards':
      save.cardInventory = {};
      save.equippedCards = [];
      for (let i = 0; i < save.unlockedSlots; i++) save.equippedCards.push(null);
      break;
    case 'unlockAllSlots':
      save.unlockedSlots = MAX_SLOTS;
      while (save.equippedCards.length < MAX_SLOTS) save.equippedCards.push(null);
      break;
    case 'unlockAllHeroes':
      if (!save.heroesUnlocked) save.heroesUnlocked = [];
      if (!save.heroes) save.heroes = {};
      for (const heroId of Object.keys(HERO_DEFS)) {
        if (save.heroesUnlocked.indexOf(heroId) === -1) save.heroesUnlocked.push(heroId);
        if (!save.heroes[heroId]) save.heroes[heroId] = { level: 1 };
      }
      break;
    case 'removeAllHeroes':
      save.heroes = {};
      save.heroesUnlocked = [];
      save.garrisonSlots = [];
      save.coreLevel = 1;
      save.trainingManuals = 0;
      clearHeroDevState();
      break;
    case 'fillGarrison': {
      const unlocked = Array.isArray(save.heroesUnlocked) ? save.heroesUnlocked.slice() : [];
      const maxSlots = save.coreLevel || 1;
      save.garrisonSlots = unlocked.slice(0, maxSlots);
      clearHeroDevState();
      break;
    }
    case 'clearGarrison':
      save.garrisonSlots = [];
      clearHeroDevState();
      break;
    case 'heroesLv10':
    case 'heroesLv50': {
      const targetLevel = act === 'heroesLv10' ? 10 : 50;
      if (!save.heroes) save.heroes = {};
      for (const heroId of (save.heroesUnlocked || [])) {
        save.heroes[heroId] = { level: targetLevel };
      }
      break;
    }
    case 'maxCoreLevel':
      save.coreLevel = CORE_UPGRADE.maxLevel;
      if (Array.isArray(save.garrisonSlots)) save.garrisonSlots = save.garrisonSlots.filter(Boolean).slice(0, save.coreLevel);
      break;
    case 'tourneyForceEnd':
      tourneyDevForceCycleEnd();
      break;
    case 'tourneyResetBracket':
      if (save.tournament) {
        save.tournament.currentBracket = null;
        save.tournament.playerBestWave = 0;
        save.tournament.playerBestTime = 0;
        save.tournament.playerEntries = 0;
        tourneyEnsureActive();
      }
      break;
    case 'hideDev':
      save.settings.devMode = false;
      closeDevPanel();
      renderSubmenu();
      break;
    case 'reset':
      closeDevPanel();
      resetSave();
      return;
  }
  persistSave();
  renderDevPanel();
  renderHud();
  if (activeSubmenu === 'labs' || activeSubmenu === 'cards') renderSubmenu();
}


// ============================================================
// TOURNAMENT TAB
// ============================================================
function renderTournamentTab(c) {
  const t = tourneyEnsureActive();
  const band = TOURNEY_BANDS.find(b => b.id === t.playerBand) || TOURNEY_BANDS[0];
  const leagueMeta = TOURNEY_LEAGUE_DISPLAY[t.playerLeague];
  const bracket = t.currentBracket;
  const playerId = save.playerId || 'You';
  const sorted = bracket ? tourneySortEntries(bracket.entries) : [];
  const playerRank = bracket ? tourneyPlayerRank(bracket, playerId) : 0;
  const totalEntries = sorted.length;
  const promoteCut = Math.floor(totalEntries * TOURNEY_PROMOTE_PCT);
  const demoteCutRank = totalEntries - Math.floor(totalEntries * TOURNEY_DEMOTE_PCT) + 1;
  const entriesLeft = tourneyEntriesRemaining();
  const timeRemaining = tourneyTimeRemaining();

  // Reward preview for current rank
  const reward = tourneyRewardForPlacement(t.playerBand, t.playerLeague, playerRank);

  // Compute zone label for player
  let zoneLabel, zoneColor;
  if (playerRank <= promoteCut) { zoneLabel = 'PROMOTION ZONE'; zoneColor = 'var(--good)'; }
  else if (playerRank >= demoteCutRank) { zoneLabel = 'DEMOTION ZONE'; zoneColor = 'var(--danger)'; }
  else { zoneLabel = 'SAFE ZONE'; zoneColor = 'var(--accent)'; }

  let html = `
    <div class="tourney-header">
      <div class="tourney-band-row">
        <div class="tourney-band-info">
          <div class="tourney-band-name">${band.name} · T${band.minTier}${band.maxTier < 999 ? '-T'+band.maxTier : '+'}</div>
          <div class="tourney-league-pill" style="background:${leagueMeta.color}20;border-color:${leagueMeta.color};color:${leagueMeta.color}">
            <span class="tourney-league-icon">${leagueMeta.icon || ''}</span>
            ${leagueMeta.name.toUpperCase()} LEAGUE
          </div>
        </div>
        <div class="tourney-timer">
          <div class="tourney-timer-label">ENDS IN</div>
          <div class="tourney-timer-value">${tourneyFormatTimeRemaining(timeRemaining)}</div>
        </div>
      </div>

      <div class="tourney-rank-card" style="border-color:${zoneColor}">
        <div class="tourney-rank-row">
          <div class="tourney-rank-num" style="color:${zoneColor}">#${playerRank}</div>
          <div class="tourney-rank-of">of ${totalEntries}</div>
          <div class="tourney-zone-label" style="color:${zoneColor}">${zoneLabel}</div>
        </div>
        <div class="tourney-best-row">
          <span>Best Wave: <b>${t.playerBestWave || '—'}</b></span>
          <span>Reward: <b style="color:var(--gold)">+${formatNum(reward.coins)} ⊙</b> <b style="color:var(--purple)">+${reward.gems} 💎</b></span>
        </div>
      </div>

      <div class="tourney-entries-row">
        <span>Entries left: <b>${entriesLeft} / ${TOURNEY_STANDARD_ENTRIES}</b></span>
        ${entriesLeft > 0
          ? `<button class="tourney-play-btn" id="tourneyPlayBtn">Begin Tournament Run</button>`
          : `<span class="tourney-entries-done">All entries used — check back next cycle</span>`
        }
      </div>

      <div class="tourney-zones-legend">
        <span class="tourney-zone-chip" style="color:var(--good)">▲ Top ${promoteCut} promote</span>
        <span class="tourney-zone-chip" style="color:var(--danger)">▼ Bottom ${Math.floor(totalEntries * TOURNEY_DEMOTE_PCT)} demote</span>
      </div>
    </div>`;

  // Last result banner (if any from previous cycle)
  if (t.lastResult && t.lastResult.cycleId === (t.cycleId - 1)) {
    const lr = t.lastResult;
    const leagueChange = lr.promoted ? `Promoted to ${TOURNEY_LEAGUE_DISPLAY[lr.newLeague].name}`
                       : lr.demoted ? `Demoted to ${TOURNEY_LEAGUE_DISPLAY[lr.newLeague].name}`
                       : `Stayed in ${TOURNEY_LEAGUE_DISPLAY[lr.newLeague].name}`;
    html += `
      <div class="tourney-last-result">
        <div class="tourney-last-title">Last Cycle</div>
        <div class="tourney-last-grid">
          <div>Rank <b>#${lr.rank}</b></div>
          <div>Wave <b>${lr.bestWave || '—'}</b></div>
          <div>+${formatNum(lr.coins)} ⊙</div>
          <div>+${lr.gems} 💎</div>
        </div>
        <div class="tourney-last-league">${leagueChange}</div>
      </div>`;
  }

  // Leaderboard — show top 10, then player window, then bottom 5
  html += `<div class="tourney-board-title">Leaderboard</div><div class="tourney-board">`;
  const indices = new Set();
  // Top 10
  for (let i = 0; i < Math.min(10, sorted.length); i++) indices.add(i);
  // Player window (2 above, 2 below)
  const playerIdx = sorted.findIndex(e => e.id === playerId);
  if (playerIdx >= 0) {
    for (let i = Math.max(0, playerIdx - 2); i <= Math.min(sorted.length - 1, playerIdx + 2); i++) {
      indices.add(i);
    }
  }
  // Bottom 3
  for (let i = Math.max(0, sorted.length - 3); i < sorted.length; i++) indices.add(i);

  const sortedIndices = Array.from(indices).sort((a, b) => a - b);
  let prevIdx = -1;
  for (const idx of sortedIndices) {
    if (prevIdx >= 0 && idx > prevIdx + 1) {
      html += `<div class="tourney-board-gap">· · ·</div>`;
    }
    const entry = sorted[idx];
    const rank = idx + 1;
    const isPlayer = entry.id === playerId;
    let rowZoneColor = 'var(--muted)';
    if (rank <= promoteCut) rowZoneColor = 'var(--good)';
    else if (rank >= demoteCutRank) rowZoneColor = 'var(--danger)';
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
    html += `
      <div class="tourney-row ${isPlayer ? 'is-player' : ''}">
        <span class="tourney-row-rank" style="color:${rowZoneColor}">${medal || '#' + rank}</span>
        <span class="tourney-row-name">${isPlayer ? 'YOU' : entry.name}</span>
        <span class="tourney-row-wave">W${entry.bestWave || '—'}</span>
      </div>`;
    prevIdx = idx;
  }
  html += `</div>`;

  c.innerHTML = html;

  // Wire Begin Tournament Run button
  const playBtn = document.getElementById('tourneyPlayBtn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (game.running) {
        const t2 = document.createElement('div');
        t2.className = 'skin-toast';
        t2.textContent = 'Finish your current run first';
        document.body.appendChild(t2);
        setTimeout(() => t2.remove(), 1400);
        return;
      }
      if (!tourneyConsumeEntry()) return;
      // Flag the next run as a tourney run — score submits on endRun
      game.isTourneyRun = true;
      // Use player's current band's top tier for tourney runs
      const tBand = tourneyBandForTier(save.bestTier || 1);
      save.selectedTier = Math.max(1, Math.min(save.bestTier || 1, tBand.maxTier));
      startBattle();
    });
  }
}
