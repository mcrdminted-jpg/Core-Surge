// ============================================================
// skins.js — Core Surge skin equip/apply/persist.
// Owned by: UI/skin AI. No combat math. Pure DOM + save glue.
//
// Saves skin ID on `save.equippedCoreSkin`, then applies it as a
// data-attribute on #tower. The CSS (css/skins.css) does the visual work.
//
// Sentinel is the default core skin and is always auto-equipped.
// Background skins removed — will be rebuilt with new assets.
// ============================================================

// Valid IDs (must match entries in css/skins.css and the Skins tab data arrays)
const CORE_SKIN_IDS = ['sentinel', 'industrial', 'verdant', 'aegis', 'frost', 'royal'];

function applyEquippedSkins() {
  const tower = document.getElementById('tower');
  if (!tower) return;

  // Sentinel is always the fallback — auto-equip if nothing set
  const core = (typeof save !== 'undefined' && save.equippedCoreSkin) || 'sentinel';

  if (core && CORE_SKIN_IDS.includes(core)) {
    tower.setAttribute('data-core-skin', core);
  } else {
    tower.setAttribute('data-core-skin', 'sentinel');
  }
}

function equipCoreSkin(id) {
  if (!CORE_SKIN_IDS.includes(id)) return;
  save.equippedCoreSkin = id;
  if (typeof persistSave === 'function') persistSave();
  applyEquippedSkins();
}

// Apply on load. main.js boot will also call applyEquippedSkins() after
// save is loaded, but this is a safety net in case script order shifts.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyEquippedSkins);
} else {
  applyEquippedSkins();
}
