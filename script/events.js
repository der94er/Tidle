/* ============================================================
   THE LAST EMBER — events.js
   Phase E: Random events — traders, night creatures, ambient flavor.
   All values, tables, and text from DESIGN.md §3 Phase 3, §14.
   Pure vanilla JS — no jQuery.
   ============================================================ */

var Events = {

  _wasNight: false,
  _lastDay:  0,

  /* GDD §14 — trader goods table (exact values) */
  TRADE_TABLE: [
    { offer: { cloth: 5 },           want: { iron: 5 },            rare: false },
    { offer: { herbs: 5 },           want: { wood: 5 },            rare: false },
    { offer: { iron: 3 },            want: { stone: 5 },           rare: false },
    { offer: { markFragments: 1 },   want: { iron: 20, cloth: 10 }, rare: true  },
    { offer: { food: 10 },           want: { herbs: 5 },           rare: false },
    { offer: { cloth: 3, herbs: 3 }, want: { stone: 10 },          rare: false }
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

    if (roll <= 50) {
      return; /* nothing happens */

    } else if (roll <= 75) {
      /* 51-75: lose 2-5 food */
      var fLoss = 2 + Math.floor(Math.random() * 4);
      var food  = $SM.get('stores.food', true);
      var fTake = Math.min(fLoss, food);
      if (fTake > 0) {
        $SM.add('stores.food', -fTake, true);
        Events._addHavenLog('creatures raid the stores. ' + fTake + ' food taken.');
      } else {
        Events._addHavenLog('something moves in the dark. the mark holds it back.');
      }
      $SM.fireUpdate('stores', true);

    } else if (roll <= 90) {
      /* 76-90: lose 1-3 wood */
      var wLoss = 1 + Math.floor(Math.random() * 3);
      var wood  = $SM.get('stores.wood', true);
      var wTake = Math.min(wLoss, wood);
      if (wTake > 0) {
        $SM.add('stores.wood', -wTake, true);
        Events._addHavenLog('blighted animals gnaw at the woodpile. ' + wTake + ' wood lost.');
      } else {
        Events._addHavenLog('blighted animals at the edge. nothing to take. they leave.');
      }
      $SM.fireUpdate('stores', true);

    } else {
      /* 91-100: 1 villager killed (last-arrived, consistent with food-loss removal) */
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
  },

  /* ----------------------------------------------------------------
     Trader (GDD §14: every 5-8 game-days if trading post built)
  ---------------------------------------------------------------- */

  _traderCheck: function() {
    if (!$SM.get('game.buildings.tradingPost')) return;
    if ($SM.get('game.trader.active')) return;

    var day      = $SM.get('game.day', true) || 0;
    var lastDay  = $SM.get('game.trader.lastDay') || 0;
    var interval = 5 + Math.floor(Math.random() * 4); /* 5, 6, 7, or 8 */

    if (lastDay === 0 || (day - lastDay) >= interval) {
      Events._traderArrive();
    }
  },

  _traderArrive: function() {
    var day = $SM.get('game.day', true) || 0;
    $SM.set('game.trader.active',    true,    true);
    $SM.set('game.trader.lastDay',   day,     true);
    $SM.set('game.trader.expiryDay', day + 1, true);

    /* GDD §14: 10% chance of rare (mark fragment) trade */
    var isRare = Math.random() < 0.1;
    var pool   = Events.TRADE_TABLE.filter(function(t) { return t.rare === isRare; });
    if (pool.length === 0) pool = Events.TRADE_TABLE.filter(function(t) { return !t.rare; });
    var trade  = pool[Math.floor(Math.random() * pool.length)];
    $SM.set('game.trader.offer', trade, true);

    /* GDD §3 Phase 3 exact opening line */
    Events._addHavenLog('a trader arrives. she traveled the dead roads.');
    Events._addHavenLog(
      'she offers ' + Events._resStr(trade.offer) + ' for ' + Events._resStr(trade.want) + '.',
      'timestamp'
    );

    if (Engine.activeModule === Haven) Events._renderTraderButton();
  },

  _traderLeaveCheck: function() {
    if (!$SM.get('game.trader.active')) return;
    var day    = $SM.get('game.day', true) || 0;
    var expiry = $SM.get('game.trader.expiryDay') || 0;
    if (day >= expiry) Events._traderLeave('the trader leaves. the road takes her again.');
  },

  _traderLeave: function(msg) {
    $SM.remove('game.trader.active',    true);
    $SM.remove('game.trader.offer',     true);
    $SM.remove('game.trader.expiryDay', true);
    Events._clearTraderBtn();
    if (msg) Events._addHavenLog(msg, 'timestamp');
  },

  /* Renders the trade button into Haven._actionsEl */
  _renderTraderButton: function() {
    if (!Haven._actionsEl) return;
    Events._clearTraderBtn();

    var trade = $SM.get('game.trader.offer');
    if (!trade) return;

    var btn = document.createElement('button');
    btn.id          = 'traderBtn';
    btn.className   = 'action-btn visible';
    btn.textContent = 'trade (' + Events._resStr(trade.offer) + ' for ' + Events._resStr(trade.want) + ')';
    btn.disabled    = !Events._canAffordTrade(trade.want);

    btn.addEventListener('click', function() { Events._executeTrade(); });
    Haven._actionsEl.appendChild(btn);
  },

  /* Hook called from Haven._buildButtons — injects any active event buttons */
  _injectHavenButtons: function() {
    if ($SM.get('game.trader.active')) Events._renderTraderButton();
  },

  _clearTraderBtn: function() {
    var old = document.getElementById('traderBtn');
    if (old && old.parentNode) old.parentNode.removeChild(old);
  },

  _executeTrade: function() {
    var trade = $SM.get('game.trader.offer');
    if (!trade) return;

    if (!Events._canAffordTrade(trade.want)) {
      Events._addHavenLog('not enough to trade.');
      return;
    }

    var cap = $SM.get('game.buildings.storehouse') ? 100 : 50;

    /* Deduct what trader wants */
    Object.keys(trade.want).forEach(function(r) {
      var key = (r === 'markFragments') ? 'stores.markFragments' : 'stores.' + r;
      $SM.add(key, -trade.want[r], true);
    });

    /* Add what trader offers (cap-aware) */
    Object.keys(trade.offer).forEach(function(r) {
      var key = (r === 'markFragments') ? 'stores.markFragments' : 'stores.' + r;
      if ($SM.get(key) === undefined) $SM.set(key, 0, true);
      var cur = $SM.get(key) || 0;
      var add = Math.min(trade.offer[r], cap - cur);
      if (add > 0) $SM.add(key, add, true);
    });

    $SM.fireUpdate('stores', true);
    Events._addHavenLog('traded. she nods and leaves.');
    Events._traderLeave(null);
  },

  _canAffordTrade: function(want) {
    for (var r in want) {
      var key = (r === 'markFragments') ? 'stores.markFragments' : 'stores.' + r;
      if (($SM.get(key) || 0) < want[r]) return false;
    }
    return true;
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
