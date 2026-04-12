/* ============================================================
   THE LAST EMBER — events.js
   Phase E: Random events — traders, night creatures, ambient flavor.
   All values, tables, and text from DESIGN.md §3 Phase 3, §14.
   Pure vanilla JS — no jQuery.
   ============================================================ */

var Events = {

  _wasNight: false,
  _lastDay:  0,

  /* Section 24: Trading post — dynamic pricing (most abundant → least abundant, 3:1 rate).
     UNIQUE_ITEMS: 25% chance trader carries one. One-time purchases only. */
  STORE_RESOURCES: ['wood', 'stone', 'iron', 'cloth', 'herbs', 'food'],

  UNIQUE_ITEMS: [
    {
      id:       'travelerMap',
      label:    'a traveler\'s map',
      resource: 'wood',
      cost:     70,
      desc:     'reveals 3 undiscovered tiles.',
      effect:   '_applyTravelerMap'
    },
    {
      id:       'oldMedicine',
      label:    'old medicine',
      resource: 'herbs',
      cost:     65,
      desc:     'heals wounds and grants +10 max health.',
      effect:   '_applyOldMedicine'
    },
    {
      id:       'wardenPage',
      label:    'warden\'s journal page',
      resource: 'stone',
      cost:     75,
      desc:     'a fragment of history.',
      effect:   '_applyWardenPage'
    },
    {
      id:       'reinforcedPack',
      label:    'reinforced pack',
      resource: 'iron',
      cost:     80,
      desc:     'increases pack capacity by 5.',
      effect:   '_applyReinforcedPack'
    }
  ],

  WARDEN_PAGE_TEXTS: [
    'the page reads: \u2018the forty-third bearer lasted longest. she sang to the mark. it sang back.\u2019',
    'the page reads: \u2018never go to the sanctum alone. the darkness there has weight.\u2019',
    'the page reads: \u2018the land remembers everyone who bore the mark. even after they forget themselves.\u2019'
  ],

  /* GDD §3 Phase 3 — ambient flavor events (non-mechanical) */
  AMBIENT_POOL: [
    'something howls in the night. the mark flares. the sound retreats.',
    'a sick deer stumbles into the green patch. by morning, it\u2019s healed.',
    'the mark pulses in your sleep. you almost remember something.',
    'the wind carries ash from far away. something burns, out there.',
    'a child arrives. alone. she says the mark called to her in a dream.'
  ],

  /* Section 4: day-milestone ambient whispers */
  WHISPERS: {
    5:  'the mark pulses in your sleep. almost a word.',
    8:  'you catch yourself drawing a symbol in the dirt. you don\u2019t know what it means.',
    12: 'a sick deer stumbles into the green patch. by morning, it\u2019s healed.',
    16: 'the fire crackles. for a moment, you hear a woman\u2019s voice.',
    20: 'one of the children found a coin. old. the face worn smooth.',
    25: 'the mark flares at midnight. no one else wakes.',
    30: 'flowers push through the soil near the fire. small. stubborn.',
    35: 'a bird nests on the watchtower. it sings at dawn.',
    40: 'you dream of a room. a table. a meal you can almost taste.',
    45: 'the green patch reaches further than you expected. life wants to return.',
    50: 'you catch your reflection in still water. the face is a stranger\u2019s.',
    55: 'the mark hums a note. low. constant. like a lullaby.',
    58: 'the oldest villager tells the children a story about the mark-bearers. you listen.',
    62: 'rain falls. clean rain. the first in anyone\u2019s memory.',
    65: 'you wake knowing something you didn\u2019t know before. it slips away before you can name it.'
  },

  init: function() {
    Events._wasNight = !!$SM.get('game.isNight');
    Events._lastDay  = $SM.get('game.day', true) || 0;
    Dispatch('stateUpdate').subscribe(Events._onStateUpdate);
  },

  _onStateUpdate: function(e) {
    if (e.category !== 'game' && e.category !== 'stores') return;
    if ($SM.get('game.grave.phase', true) < 5) return;

    /* Night creature check — fires once on each night start */
    var isNight = !!$SM.get('game.isNight');
    if (isNight !== Events._wasNight) {
      Events._wasNight = isNight;
      if (isNight) Events._nightCreatureRoll();
    }

    /* Day-based events — fires once per new game-day */
    var day = $SM.get('game.day', true) || 0;
    if (day > 0 && day !== Events._lastDay) {
      Events._lastDay = day;
      Events._traderLeaveCheck();
      Events._traderCheck();
      Events._ambientCheck();
      Events._whisperCheck(day);
    }

    /* Final Overhaul §3 Event 5: 10 memories — the dream */
    if (!$SM.get('game.whoa.theDream')) {
      var memCount = ($SM.get('game.memories.found') || []).length;
      if (memCount >= 10) {
        $SM.set('game.whoa.theDream', true, true);
        Engine.setTimeout(function() {
          if (typeof Haven !== 'undefined' && Haven._logEl) {
            Haven._addLog('you wake gasping. the mark burns.');
            Haven._addLog('a flash \u2014 a face. a room. a decision.', 'timestamp');
            Haven._addLog('the dream fades. but the feeling doesn\u2019t.', 'timestamp');
            Haven._addLog('something is pulling you. deeper into the wilds.', 'timestamp');
          }
        }, 2000);
      }
    }

    /* Re-inject trader button if Haven is active but button was cleared */
    if ($SM.get('game.trader.active') &&
        Engine.activeModule === Haven &&
        !document.getElementById('traderBtn')) {
      Events._renderTraderButton();
    }
  },

  /* ----------------------------------------------------------------
     Night creatures (GDD §14)
  ---------------------------------------------------------------- */

  _nightCreatureRoll: function() {
    /* Final Overhaul §3 Event 2: night attacks disabled until first night attack fires */
    if (!$SM.get('game.whoa.nightAttackEnabled')) {
      if ($SM.get('game.whoa.firstNightAttackArmed')) {
        $SM.set('game.whoa.nightAttackEnabled', true, true);
        Events._firstNightAttack();
      }
      return;
    }

    var pop = $SM.get('game.population') || [];
    if (pop.length === 0) return;

    /* GDD §14: guards subtract 10 from roll each */
    var guards = pop.filter(function(v) { return v.assignment === 'guard'; }).length;
    var roll   = Math.floor(Math.random() * 100) + 1;
    roll = Math.max(1, roll - guards * 10);

    /* GDD §14: watchtower — reroll any result above 75 */
    if ($SM.get('game.buildings.watchtower') && roll > 75) {
      roll = Math.floor(Math.random() * 100) + 1;
      roll = Math.max(1, roll - guards * 10);
    }

    /* §17: if player is in wilds, send deterioration message for any attack */
    var attackOccurred = false;

    if (roll <= 50) {
      return; /* nothing happens */

    } else if (roll <= 75) {
      /* 51-75: lose 2-5 food */
      attackOccurred = true;
      var fLoss = 2 + Math.floor(Math.random() * 4);
      var food  = $SM.get('stores.food', true);
      var fTake = Math.min(fLoss, food);
      if (fTake > 0) {
        $SM.add('stores.food', -fTake, true);
        Events._addHavenLog('creatures raid the stores. ' + fTake + ' food taken.');
      } else {
        Events._addHavenLog('something moves in the dark. the mark holds it back.');
        attackOccurred = false;
      }
      $SM.fireUpdate('stores', true);

    } else if (roll <= 90) {
      /* 76-90: lose 1-3 wood */
      attackOccurred = true;
      var wLoss = 1 + Math.floor(Math.random() * 3);
      var wood  = $SM.get('stores.wood', true);
      var wTake = Math.min(wLoss, wood);
      if (wTake > 0) {
        $SM.add('stores.wood', -wTake, true);
        Events._addHavenLog('blighted animals gnaw at the woodpile. ' + wTake + ' wood lost.');
      } else {
        Events._addHavenLog('blighted animals at the edge. nothing to take. they leave.');
        attackOccurred = false;
      }
      $SM.fireUpdate('stores', true);

    } else {
      /* 91-100: 1 villager killed (last-arrived, consistent with food-loss removal) */
      attackOccurred = true;
      pop = $SM.get('game.population') || [];
      if (pop.length > 0) {
        var last   = pop.length - 1;
        var victim = pop[last];
        /* Clear income for the removed villager */
        if (typeof Haven !== 'undefined') Haven._clearVillagerIncome(last);
        pop.pop();
        $SM.set('game.population', pop, true);
        $SM.set('playStats.villagersLost', ($SM.get('playStats.villagersLost') || 0) + 1, true);
        Events._addHavenLog(victim.name.toLowerCase() + ' is gone. taken in the night.');
        if (typeof Haven !== 'undefined') Haven._villagerReact('nightAttack');
        $SM.fireUpdate('game', true);
      }
    }

    /* §17: wilds log message when attack happens while player is exploring */
    if (attackOccurred && typeof Wilds !== 'undefined' && Engine.activeModule === Wilds) {
      Wilds._addLog('unease. something happened at the haven.', 'timestamp');
    }
  },

  /* Final Overhaul §3 Event 2: scripted first night attack */
  _firstNightAttack: function() {
    if (typeof Haven === 'undefined' || !Haven._logEl) return;
    Haven._addLog('screaming. darkness at the edge of the green.');
    Haven._addLog('something came in the night. the stores are torn open.', 'timestamp');
    var fLoss = 5 + Math.floor(Math.random() * 6); /* 5-10 food */
    var food  = $SM.get('stores.food', true);
    var fTake = Math.min(fLoss, food);
    if (fTake > 0) $SM.add('stores.food', -fTake, true);
    Haven._addLog('the sickness has teeth.', 'timestamp');
    $SM.fireUpdate('stores', true);
    /* §9: pulse the watchtower build button */
    Engine.setTimeout(function() {
      if (typeof Haven !== 'undefined') Haven._pulseBuildBtn('watchtower');
    }, 1500);
  },

  /* ----------------------------------------------------------------
     Section 24: Trader (every 5 game-days if trading post built; stays 1 day)
     Dynamic pricing: 3 of most-abundant → 1 of least-abundant.
     25% chance of unique item.
  ---------------------------------------------------------------- */

  _traderCheck: function() {
    if (!$SM.get('game.buildings.tradingPost')) return;
    if ($SM.get('game.trader.active')) return;

    var day     = $SM.get('game.day', true) || 0;
    var lastDay = $SM.get('game.trader.lastDay') || 0;

    /* Section 24: arrives exactly every 5 game-days */
    if (lastDay === 0 || (day - lastDay) >= 5) {
      Events._traderArrive();
    }
  },

  _traderArrive: function() {
    var day = $SM.get('game.day', true) || 0;
    $SM.set('game.trader.active',    true,    true);
    $SM.set('game.trader.lastDay',   day,     true);
    $SM.set('game.trader.expiryDay', day + 1, true);

    /* Section 24: dynamic pricing — most abundant to least abundant, 3:1 */
    var RESOURCES = Events.STORE_RESOURCES;
    var amounts   = {};
    RESOURCES.forEach(function(r) { amounts[r] = $SM.get('stores.' + r, true) || 0; });

    var sorted     = RESOURCES.slice().sort(function(a, b) { return amounts[b] - amounts[a]; });
    var sellRes    = sorted[0]; /* most abundant — trader buys this */
    var buyRes     = sorted[sorted.length - 1]; /* least abundant — trader sells this */

    /* Fallback: if all equal, pick wood to sell and food to buy */
    if (sellRes === buyRes) { sellRes = 'wood'; buyRes = 'food'; }

    var tradeQty = 3; /* player gives 3, gets 1 */
    var trade = {
      want:    {},
      offer:   {}
    };
    trade.want[sellRes] = tradeQty;
    trade.offer[buyRes] = 1;
    $SM.set('game.trader.trade', trade, true);

    /* Section 24: 25% chance of unique item */
    var uniqueItem = null;
    if (Math.random() < 0.25) {
      var available = Events.UNIQUE_ITEMS.filter(function(u) {
        return !$SM.get('game.trader.bought.' + u.id);
      });
      if (available.length > 0) {
        uniqueItem = available[Math.floor(Math.random() * available.length)];
        $SM.set('game.trader.uniqueItem', uniqueItem.id, true);
      }
    } else {
      $SM.remove('game.trader.uniqueItem', true);
    }

    Events._addHavenLog('a trader arrives. she traveled the dead roads.');
    Events._addHavenLog(
      'she\'ll trade ' + buyRes + ' for your ' + sellRes + '. three to one.',
      'timestamp'
    );
    if (uniqueItem) {
      Events._addHavenLog(
        'she also carries ' + uniqueItem.label + '. ' + uniqueItem.desc,
        'timestamp'
      );
    }

    if (Engine.activeModule === Haven) Events._renderTraderButton();
  },

  _traderLeaveCheck: function() {
    if (!$SM.get('game.trader.active')) return;
    var day    = $SM.get('game.day', true) || 0;
    var expiry = $SM.get('game.trader.expiryDay') || 0;
    if (day >= expiry) Events._traderLeave('the trader leaves. the road takes her again.');
  },

  _traderLeave: function(msg) {
    $SM.remove('game.trader.active',     true);
    $SM.remove('game.trader.trade',      true);
    $SM.remove('game.trader.uniqueItem', true);
    $SM.remove('game.trader.expiryDay',  true);
    Events._clearTraderBtn();
    if (msg) Events._addHavenLog(msg, 'timestamp');
  },

  /* Renders the trade button(s) into Haven._actionsEl */
  _renderTraderButton: function() {
    if (!Haven._actionsEl) return;
    Events._clearTraderBtn();

    var trade = $SM.get('game.trader.trade');
    if (!trade) return;

    /* Dynamic trade button */
    var sellRes = Object.keys(trade.want)[0];
    var buyRes  = Object.keys(trade.offer)[0];
    var haveEnough = ($SM.get('stores.' + sellRes, true) || 0) >= trade.want[sellRes];

    var btn = document.createElement('button');
    btn.id          = 'traderBtn';
    btn.className   = 'action-btn visible';
    btn.textContent = 'trade (give 3 ' + sellRes + ', receive 1 ' + buyRes + ')';
    btn.disabled    = !haveEnough;
    btn.addEventListener('click', function() { Events._executeTrade(); });
    Haven._actionsEl.appendChild(btn);

    /* Unique item button if available */
    var uniqueId = $SM.get('game.trader.uniqueItem');
    if (uniqueId) {
      var uItem = Events.UNIQUE_ITEMS.filter(function(u) { return u.id === uniqueId; })[0];
      if (uItem && !$SM.get('game.trader.bought.' + uItem.id)) {
        var canAffordUnique = ($SM.get('stores.' + uItem.resource, true) || 0) >= uItem.cost;
        var uBtn = document.createElement('button');
        uBtn.id          = 'traderUniqueBtn';
        uBtn.className   = 'action-btn visible';
        uBtn.textContent = 'buy ' + uItem.label + ' (' + uItem.cost + ' ' + uItem.resource + ')';
        uBtn.disabled    = !canAffordUnique;
        uBtn.addEventListener('click', function() { Events._buyUniqueItem(uItem); });
        Haven._actionsEl.appendChild(uBtn);
      }
    }
  },

  /* Hook called from Haven._buildButtons — injects any active event buttons */
  _injectHavenButtons: function() {
    if ($SM.get('game.trader.active')) Events._renderTraderButton();
  },

  _clearTraderBtn: function() {
    ['traderBtn', 'traderUniqueBtn'].forEach(function(id) {
      var old = document.getElementById(id);
      if (old && old.parentNode) old.parentNode.removeChild(old);
    });
  },

  _executeTrade: function() {
    var trade = $SM.get('game.trader.trade');
    if (!trade) return;

    var sellRes = Object.keys(trade.want)[0];
    var buyRes  = Object.keys(trade.offer)[0];
    if (($SM.get('stores.' + sellRes, true) || 0) < trade.want[sellRes]) {
      Events._addHavenLog('not enough to trade.');
      return;
    }

    var cap = $SM.get('game.buildings.storehouse') ? Haven.STOREHOUSE_CAP : Haven.BASE_STORE_CAP;

    $SM.add('stores.' + sellRes, -trade.want[sellRes], true);

    if ($SM.get('stores.' + buyRes) === undefined) $SM.set('stores.' + buyRes, 0, true);
    var cur = $SM.get('stores.' + buyRes, true) || 0;
    var add = Math.min(trade.offer[buyRes], cap - cur);
    if (add > 0) $SM.add('stores.' + buyRes, add, true);

    $SM.fireUpdate('stores', true);
    Events._addHavenLog('traded. she nods.');

    /* Allow multiple trades until trader leaves */
    if (Engine.activeModule === Haven) Events._renderTraderButton();
  },

  _buyUniqueItem: function(uItem) {
    if ($SM.get('game.trader.bought.' + uItem.id)) return;
    if (($SM.get('stores.' + uItem.resource, true) || 0) < uItem.cost) {
      Events._addHavenLog('not enough ' + uItem.resource + '.');
      return;
    }
    $SM.add('stores.' + uItem.resource, -uItem.cost, true);
    $SM.set('game.trader.bought.' + uItem.id, true, true);
    $SM.remove('game.trader.uniqueItem', true);
    Events._addHavenLog('you buy ' + uItem.label + '.');
    Events[uItem.effect]();
    $SM.fireUpdate('stores', true);
    if (Engine.activeModule === Haven) Events._renderTraderButton();
  },

  /* Section 24: unique item effects */
  _applyTravelerMap: function() {
    /* Reveal 3 random unexplored tiles on the map */
    var revealed = 0;
    var explored = $SM.get('game.map.explored') || {};
    var attempts = 0;
    while (revealed < 3 && attempts < 200) {
      attempts++;
      var rx = Math.floor(Math.random() * (Wilds ? Wilds.MAP_W : 12));
      var ry = Math.floor(Math.random() * (Wilds ? Wilds.MAP_H : 12));
      var rk = rx + ',' + ry;
      if (!explored[rk]) {
        explored[rk] = true;
        revealed++;
      }
    }
    $SM.set('game.map.explored', explored, true);
    Events._addHavenLog('the map reveals distant paths.', 'timestamp');
  },

  _applyOldMedicine: function() {
    $SM.set('game.player.wounded', false, true);
    /* §24: +10 max HP for current exploration trip only; cleared on haven return */
    $SM.set('game.player.bonusMaxHp', ($SM.get('game.player.bonusMaxHp') || 0) + 10, true);
    $SM.set('game.player.medicineBonusActive', true, true);
    Events._addHavenLog('the old medicine works. your wounds close. you feel stronger.', 'timestamp');
  },

  _applyWardenPage: function() {
    var texts = Events.WARDEN_PAGE_TEXTS;
    var text  = texts[Math.floor(Math.random() * texts.length)];
    Events._addHavenLog(text, 'timestamp');
  },

  _applyReinforcedPack: function() {
    var current = $SM.get('game.player.packBonus') || 0;
    $SM.set('game.player.packBonus', current + 5, true);
    Events._addHavenLog('the pack is sturdier. you can carry more.', 'timestamp');
  },

  _resStr: function(obj) {
    return Object.keys(obj).map(function(r) { return obj[r] + ' ' + r; }).join(', ');
  },

  /* ----------------------------------------------------------------
     Ambient flavor events (GDD §3 Phase 3)
  ---------------------------------------------------------------- */

  _ambientCheck: function() {
    /* ~25% chance per game-day, only when haven is populated */
    if (Math.random() > 0.25) return;
    var pop = $SM.get('game.population') || [];
    if (pop.length === 0) return;
    var text = Events.AMBIENT_POOL[Math.floor(Math.random() * Events.AMBIENT_POOL.length)];
    Events._addHavenLog(text, 'timestamp');
  },

  /* ----------------------------------------------------------------
     Whisper check (Section 4)
  ---------------------------------------------------------------- */

  _whisperCheck: function(day) {
    var shown = $SM.get('game.whispers') || {};
    var text  = Events.WHISPERS[day];
    if (text && !shown[day]) {
      shown[day] = true;
      $SM.set('game.whispers', shown, true);
      var pop = $SM.get('game.population') || [];
      if (pop.length > 0) {
        Events._addHavenLog(text, 'timestamp');
      }
    }
  },

  /* ----------------------------------------------------------------
     Haven log helper
  ---------------------------------------------------------------- */

  _addHavenLog: function(text, type) {
    if (!Haven._logEl) return;
    /* §24.5: enforce 8-entry cap — remove oldest narrative when exceeded */
    var entries = Haven._logEl.querySelectorAll('.narrative');
    if (entries.length >= Haven.LOG_CAP) entries[0].remove();
    var el = document.createElement('div');
    el.className = 'narrative';
    if (type === 'timestamp') el.classList.add('timestamp');
    el.textContent = text;
    Haven._logEl.appendChild(el);
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        el.classList.add('visible');
        Haven._logEl.scrollTop = Haven._logEl.scrollHeight;
      });
    });
  }

};
