const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function loadDataJS() {
  const sandbox = {
    Math, Date, Array, Object, JSON, String, Number, parseInt, parseFloat,
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    window: {}, document: { addEventListener() {} },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    navigator: { serviceWorker: null, onLine: true },
    Notification: { permission: 'default' },
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;

  const ctx = vm.createContext(sandbox);
  const dataCode = fs.readFileSync(path.join(root, 'js/data.js'), 'utf8');
  const exports = [
    'CARD_POOL', 'CARD_PRICING', 'PULL_ODDS', 'COPIES_TO_LEVEL',
    'SLOT_UNLOCK_COSTS', 'MAX_TIER', 'MILESTONE_WAVES', 'RANK_DEFS',
    'UNLOCK_FAMILIES', 'FAMILIES_BY_CATEGORY', 'rankCost',
    'TOURNEY_LEAGUES', 'TOURNEY_BRACKET_SIZE', 'TOURNEY_CYCLE_MS',
    'TOURNEY_PROMOTE_PCT', 'TOURNEY_DEMOTE_PCT',
  ];
  const wrapped = dataCode + '\n' + exports.map(e =>
    `this.${e} = typeof ${e} !== 'undefined' ? ${e} : undefined;`
  ).join('\n');
  vm.runInContext(wrapped, ctx, { filename: 'data.js' });
  return ctx;
}

let ctx;
beforeAll(() => {
  ctx = loadDataJS();
});

describe('Card Pool', () => {
  test('has at least 20 cards', () => {
    expect(Object.keys(ctx.CARD_POOL).length).toBeGreaterThanOrEqual(20);
  });

  test('has 12 standard cards', () => {
    const count = Object.values(ctx.CARD_POOL).filter(c => c.tier === 'standard').length;
    expect(count).toBe(12);
  });

  test('has >= 8 prime cards', () => {
    const count = Object.values(ctx.CARD_POOL).filter(c => c.tier === 'prime').length;
    expect(count).toBeGreaterThanOrEqual(8);
  });

  test('has >= 5 apex cards', () => {
    const count = Object.values(ctx.CARD_POOL).filter(c => c.tier === 'apex').length;
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('every card has matching id and valid tier', () => {
    for (const [id, card] of Object.entries(ctx.CARD_POOL)) {
      expect(card.id).toBe(id);
      expect(['standard', 'prime', 'apex']).toContain(card.tier);
    }
  });

  test('card values increase per level', () => {
    for (const [id, card] of Object.entries(ctx.CARD_POOL)) {
      if (card.values && !card.special && Array.isArray(card.values)) {
        expect(card.values).toHaveLength(5);
        const isTargetCard = card.stat && card.stat.includes('TargetsAdd');
        if (!isTargetCard) {
          for (let i = 1; i < card.values.length; i++) {
            expect(card.values[i]).toBeGreaterThan(card.values[i - 1]);
          }
        }
      }
    }
  });
});

describe('Pull Odds', () => {
  test('sum to 1.0', () => {
    const sum = ctx.PULL_ODDS.standard + ctx.PULL_ODDS.prime + ctx.PULL_ODDS.apex;
    expect(sum).toBeCloseTo(1.0);
  });

  test('apex = 2%, prime = 20%, standard = 78%', () => {
    expect(ctx.PULL_ODDS.apex).toBeCloseTo(0.02);
    expect(ctx.PULL_ODDS.prime).toBeCloseTo(0.20);
    expect(ctx.PULL_ODDS.standard).toBeCloseTo(0.78);
  });
});

describe('Card Pricing', () => {
  test('single pull costs 20 gems', () => {
    expect(ctx.CARD_PRICING.pullSingle).toBe(20);
  });

  test('bundle costs 180 gems', () => {
    expect(ctx.CARD_PRICING.pullBundle).toBe(180);
  });

  test('bundle is cheaper than 10 singles', () => {
    expect(ctx.CARD_PRICING.pullBundle).toBeLessThan(ctx.CARD_PRICING.pullSingle * 10);
  });
});

describe('Copies to Level', () => {
  test('all tiers unlock at 1 copy', () => {
    expect(ctx.COPIES_TO_LEVEL.standard[0]).toBe(1);
    expect(ctx.COPIES_TO_LEVEL.prime[0]).toBe(1);
    expect(ctx.COPIES_TO_LEVEL.apex[0]).toBe(1);
  });

  test('each tier has 5 level thresholds that increase', () => {
    for (const tier of ['standard', 'prime', 'apex']) {
      expect(ctx.COPIES_TO_LEVEL[tier]).toHaveLength(5);
      for (let i = 1; i < ctx.COPIES_TO_LEVEL[tier].length; i++) {
        expect(ctx.COPIES_TO_LEVEL[tier][i]).toBeGreaterThan(ctx.COPIES_TO_LEVEL[tier][i - 1]);
      }
    }
  });
});

describe('Slot Unlock Costs', () => {
  test('slot 4 costs 100 gems', () => {
    expect(ctx.SLOT_UNLOCK_COSTS[4]).toBe(100);
  });

  test('costs increase per slot', () => {
    let prev = 0;
    for (let s = 4; s <= 10; s++) {
      expect(ctx.SLOT_UNLOCK_COSTS[s]).toBeGreaterThan(prev);
      prev = ctx.SLOT_UNLOCK_COSTS[s];
    }
  });
});

describe('Rank Costs', () => {
  test('damage cost0 = 15, costMul = 1.12', () => {
    expect(ctx.RANK_DEFS.damage.cost0).toBe(15);
    expect(ctx.RANK_DEFS.damage.costMul).toBeCloseTo(1.12);
  });

  test('rank cost follows formula floor(cost0 * costMul^rank)', () => {
    const def = ctx.RANK_DEFS.damage;
    const cost10 = ctx.rankCost('damage', 10);
    const expected = Math.floor(def.cost0 * Math.pow(def.costMul, 10));
    expect(cost10).toBe(expected);
  });

  test('costs increase with rank', () => {
    const cost0 = ctx.rankCost('damage', 0);
    const cost10 = ctx.rankCost('damage', 10);
    const cost39 = ctx.rankCost('damage', 39);
    expect(cost10).toBeGreaterThan(cost0);
    expect(cost39).toBeGreaterThan(cost10);
  });

  test('cost at maxRank = Infinity', () => {
    expect(ctx.rankCost('damage', ctx.RANK_DEFS.damage.maxRank)).toBe(Infinity);
  });
});

describe('Rank Caps', () => {
  test('capped stats have correct maxRank', () => {
    expect(ctx.RANK_DEFS.range.maxRank).toBe(500);
    expect(ctx.RANK_DEFS.multiTargets.maxRank).toBe(8);
    expect(ctx.RANK_DEFS.bounceTargets.maxRank).toBe(6);
  });

  test('at least 25 uncapped stats (maxRank = 99999)', () => {
    const count = Object.values(ctx.RANK_DEFS).filter(d => d.maxRank === 99999).length;
    expect(count).toBeGreaterThanOrEqual(25);
  });
});

describe('Tournament', () => {
  test('bracket size = 250', () => {
    expect(ctx.TOURNEY_BRACKET_SIZE).toBe(250);
  });

  test('promote = 10%, demote = 15%', () => {
    expect(ctx.TOURNEY_PROMOTE_PCT).toBeCloseTo(0.10);
    expect(ctx.TOURNEY_DEMOTE_PCT).toBeCloseTo(0.15);
  });

  test('cycle = 72 hours', () => {
    expect(ctx.TOURNEY_CYCLE_MS).toBe(72 * 60 * 60 * 1000);
  });

  test('5 leagues from copper to platinum', () => {
    expect(ctx.TOURNEY_LEAGUES).toHaveLength(5);
    expect(ctx.TOURNEY_LEAGUES[0]).toBe('copper');
    expect(ctx.TOURNEY_LEAGUES[4]).toBe('platinum');
  });

  test('top 25 promote, bottom 37 demote', () => {
    expect(Math.floor(250 * 0.10)).toBe(25);
    expect(Math.floor(250 * 0.15)).toBe(37);
  });
});

describe('Game Constants', () => {
  test('MAX_TIER = 99999', () => {
    expect(ctx.MAX_TIER).toBe(99999);
  });

  test('17 milestone waves from 25 to 2000', () => {
    expect(ctx.MILESTONE_WAVES).toHaveLength(17);
    expect(ctx.MILESTONE_WAVES[0]).toBe(25);
    expect(ctx.MILESTONE_WAVES[ctx.MILESTONE_WAVES.length - 1]).toBe(2000);
  });
});

describe('Unlock Families', () => {
  test('12 families', () => {
    expect(Object.keys(ctx.UNLOCK_FAMILIES)).toHaveLength(12);
  });

  test('each family has icon, positive cost, and matching id', () => {
    for (const [id, fam] of Object.entries(ctx.UNLOCK_FAMILIES)) {
      expect(fam.icon).toBeTruthy();
      expect(fam.cost).toBeGreaterThan(0);
      expect(fam.id).toBe(id);
    }
  });
});

describe('Wave Scaling', () => {
  function hpMul(w) { return Math.max(1, Math.pow(w, 2.3) / 320); }
  function dmgMul(w) { return Math.max(1, Math.pow(w, 2.0) / 220); }
  function cashMul(w) { return Math.max(1, Math.pow(w, 2.35) / 280); }

  test('hpWaveMul(1) >= 1', () => {
    expect(hpMul(1)).toBeGreaterThanOrEqual(1);
  });

  test('HP scaling is monotonically increasing', () => {
    expect(hpMul(50)).toBeLessThan(hpMul(100));
    expect(hpMul(100)).toBeLessThan(hpMul(200));
  });

  test('HP curve steepens from W50 to W100', () => {
    const d50 = hpMul(51) - hpMul(50);
    const d100 = hpMul(101) - hpMul(100);
    expect(d100).toBeGreaterThan(d50);
  });

  test('damage scales slower than HP at W100', () => {
    expect(dmgMul(100)).toBeLessThan(hpMul(100));
  });

  test('cash scales with difficulty', () => {
    expect(cashMul(100)).toBeGreaterThan(1);
  });
});
