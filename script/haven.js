/* ============================================================
   THE LAST EMBER — haven.js
   Phase 2-3: The Haven — fire, gathering, buildings, villagers, crafting.
   All text, timings, and values from DESIGN.md.
   Pure vanilla JS — no jQuery.
   ============================================================ */

var Haven = {

  name: 'the haven',
  tab:   null,
  panel: null,

  _fireEl:      null,
  _logEl:       null,
  _storesEl:    null,
  _actionsEl:   null,
  _buildingsEl: null,
  _craftingEl:  null,
  _popEl:       null,

  _timers: { gameDay: null, dayNight: null },
  _buildTimer: null,

  /* GDD §12 — fire level names */
  FIRE_NAMES: ['mark only', 'flicker', 'small fire', 'fire', 'strong fire', 'blazing fire'],

  /* GDD §12 — wood auto-consumed per game-day (indexed by fire level) */
  FIRE_WOOD_COST: [0, 0, 1, 1, 2, 3],

  /* GDD §5 — 1 game-day = 3 real minutes */
  GAME_DAY_MS: 3 * 60 * 1000,

  /* GDD §5 — day/night toggle every half game-day = 90 seconds */
  HALF_DAY_MS: 90 * 1000,

  /* GDD §3, §18 — gathering: 10s cooldown, 3-5 units returned */
  GATHER_COOLDOWN_MS: 10 * 1000,
  GATHER_MIN: 3,
  GATHER_MAX: 5,

  /* GDD §4 — base storage cap 50, storehouse raises to 100 */
  BASE_STORE_CAP: 50,
  STOREHOUSE_CAP: 100,

  /* GDD §8 — shelter (start) holds 2; hut 5; lodge 10 */
  START_POP_CAP: 2,

  /* GDD §14 — villager names pool of 20 */
  VILLAGER_NAMES: [
    'Aelfric', 'Brin', 'Cora', 'Dorin', 'Elsa', 'Fynn', 'Greta', 'Hale',
    'Isla', 'Jorn', 'Kael', 'Lira', 'Maren', 'Noll', 'Ora', 'Penn',
    'Reva', 'Soren', 'Tova', 'Wyn'
  ],

  /* GDD §8 — exact arrival flavor text for strangers 1-5 */
  STRANGER_FLAVOR: [
    /* 1 */ 'the sickness couldn\u2019t touch me. near you. i followed the feeling.',
    /* 2 */ 'i dreamed of warmth. walked until i found it.',
    /* 3 */ 'my village is gone. the black took everything. except the road here.',
    /* 4 */ 'the mark. i\u2019ve heard stories. the old pact.',
    /* 5 */ 'i don\u2019t know why i came. my feet just\u2026 brought me.'
  ],

  /* GDD §8 — strangers 6-10 random arrival pool */
  STRANGER_FLAVOR_POOL: [
    'the land told me.',
    'i saw the glow from the ridge.',
    'there\u2019s nothing left out there.',
    'my grandmother spoke of the mark-bearers.',
    'i came to help. if you\u2019ll have me.'
  ],

  /* GDD §6 — building definitions (all 9 buildable; fire pit + shelter are start buildings) */
  BUILDINGS: {
    hearth:       { label: 'hearth',        cost: { wood: 10, stone: 10 },                       time: 45000, prereq: null        },
    forge:        { label: 'forge',          cost: { iron: 15, stone: 10, wood: 5 },              time: 60000, prereq: 'hearth'    },
    hut:          { label: 'hut',            cost: { wood: 15, stone: 10 },                       time: 45000, prereq: null        },
    lodge:        { label: 'lodge',          cost: { wood: 25, stone: 15, iron: 5 },              time: 75000, prereq: 'hut'       },
    storehouse:   { label: 'storehouse',     cost: { wood: 20, stone: 10 },                       time: 45000, prereq: null        },
    workshop:     { label: 'workshop',       cost: { wood: 20, stone: 10, iron: 10 },             time: 60000, prereq: null        },
    watchtower:   { label: 'watchtower',     cost: { stone: 15, iron: 10 },                       time: 60000, prereq: null        },
    herbalistHut: { label: 'herbalist hut',  cost: { wood: 10, herbs: 5 },                        time: 30000, prereq: 'workshop'  },
    tradingPost:  { label: 'trading post',   cost: { wood: 20, stone: 15, iron: 10, cloth: 5 },   time: 90000, prereq: 'workshop'  }
  },

  /* GDD §7 — 10 crafting recipes */
  CRAFTING: [
    { id: 'torch',           label: 'torch (\xd75)',            cost: { wood: 3, cloth: 2 },              req: 'workshop',     qty: 5,  inv: 'torches',           stack: true  },
    { id: 'crudeSword',      label: 'crude sword',              cost: { iron: 5, wood: 3 },              req: 'workshop',     qty: 1,  inv: 'crudeSword',         stack: false },
    { id: 'crudeArmor',      label: 'crude armor',              cost: { iron: 5, cloth: 5 },             req: 'workshop',     qty: 1,  inv: 'crudeArmor',         stack: false },
    { id: 'poultice',        label: 'poultice',                 cost: { herbs: 3 },                      req: 'herbalistHut', qty: 1,  inv: 'poultice',           stack: true  },
    { id: 'bandages',        label: 'bandages (\xd73)',         cost: { cloth: 2, herbs: 1 },            req: 'workshop',     qty: 3,  inv: 'bandages',           stack: true  },
    { id: 'steelSword',      label: 'steel sword',              cost: { iron: 10, wood: 5, cloth: 2 },   req: 'forge',        qty: 1,  inv: 'steelSword',         stack: false },
    { id: 'steelArmor',      label: 'steel armor',              cost: { iron: 12, cloth: 8, wood: 3 },   req: 'forge',        qty: 1,  inv: 'steelArmor',         stack: false },
    { id: 'reinforcedTorch', label: 'reinforced torch (\xd75)', cost: { wood: 5, cloth: 3, iron: 2 },    req: 'forge',        qty: 5,  inv: 'reinforcedTorches',  stack: true  },
    { id: 'trap',            label: 'trap (\xd73)',             cost: { iron: 5, wood: 5 },              req: 'workshop',     qty: 3,  inv: 'traps',              stack: true  },
    { id: 'markLantern',     label: 'mark lantern',             cost: { iron: 3, cloth: 2, markFragments: 1 }, req: 'forge', qty: 1,  inv: 'markLantern',        stack: false }
  ],

  /* --- Module lifecycle --- */

  init: function() {
    if (Haven.tab) return;

    Haven.tab = Header.addLocation('the haven', 'haven', Haven);

    Haven.panel = document.createElement('div');
    Haven.panel.id = 'havenPanel';
    Haven.panel.className = 'location';
    document.getElementById('locationSlider').appendChild(Haven.panel);

    /* Two-column layout */
    var layout = document.createElement('div');
    layout.className = 'haven-layout';
    Haven.panel.appendChild(layout);

    /* ── Left: main column ── */
    var main = document.createElement('div');
    main.className = 'haven-main';
    layout.appendChild(main);

    Haven._fireEl = document.createElement('div');
    Haven._fireEl.id = 'havenFire';
    Haven._fireEl.className = 'fire-status';
    main.appendChild(Haven._fireEl);

    Haven._logEl = document.createElement('div');
    Haven._logEl.id = 'havenLog';
    Haven._logEl.className = 'log';
    main.appendChild(Haven._logEl);

    Haven._actionsEl = document.createElement('div');
    Haven._actionsEl.id = 'havenActions';
    Haven._actionsEl.className = 'actions';
    main.appendChild(Haven._actionsEl);

    Haven._buildingsEl = document.createElement('div');
    Haven._buildingsEl.id = 'havenBuildings';
    Haven._buildingsEl.className = 'buildings-section';
    main.appendChild(Haven._buildingsEl);

    Haven._craftingEl = document.createElement('div');
    Haven._craftingEl.id = 'havenCrafting';
    Haven._craftingEl.className = 'crafting-section';
    main.appendChild(Haven._craftingEl);

    /* ── Right: stores + population column ── */
    var right = document.createElement('div');
    right.className = 'haven-right';
    layout.appendChild(right);

    Haven._storesEl = document.createElement('div');
    Haven._storesEl.id = 'havenStores';
    Haven._storesEl.className = 'stores';
    right.appendChild(Haven._storesEl);

    Haven._popEl = document.createElement('div');
    Haven._popEl.id = 'havenPop';
    Haven._popEl.className = 'population';
    right.appendChild(Haven._popEl);

    /* Pre-initialise wood and stone */
    if ($SM.get('stores.wood')  === undefined) $SM.set('stores.wood',  0, true);
    if ($SM.get('stores.stone') === undefined) $SM.set('stores.stone', 0, true);

    /* Init population array if missing */
    if (!$SM.get('game.population')) $SM.set('game.population', [], true);

    Engine.updateSlider();
    Dispatch('stateUpdate').subscribe(Haven._onStateUpdate);
  },

  onArrival: function(diff) {
    Haven._updateFireDisplay();
    Haven._updateStores();
    Haven._buildButtons();
    Haven._buildBuildingButtons();
    Haven._buildCraftingButtons();
    Haven._updatePopDisplay();

    /* Phase 2 intro — once on first arrival */
    if (!$SM.get('game.haven.introShown')) {
      $SM.set('game.haven.introShown', true);
      Haven._showPhase2Intro();
    }

    /* Restore any build timer lost on page refresh */
    Haven._restoreBuildTimer();

    /* Restore any stranger arrivals lost on page refresh */
    Haven._restoreStrangerTimers();

    Haven._startTimers();
  },

  /* ----------------------------------------------------------------
     Phase 2 intro (GDD §3 Phase 2, exact text)
  ---------------------------------------------------------------- */

  _showPhase2Intro: function() {
    Haven._addLog('the green patch grows with the fire. life returns to the soil.', 'normal', 2000);
    Haven._addLog('dead trees within reach. stone from the ruins.', 'normal', 7000);
  },

  /* ----------------------------------------------------------------
     Fire system (GDD §12)
  ---------------------------------------------------------------- */

  _gameDayTick: function() {
    var level    = $SM.get('game.fire.level', true);
    var woodCost = Haven.FIRE_WOOD_COST[level] || 0;

    /* GDD §12: hearth halves wood consumption, rounded up */
    if ($SM.get('game.buildings.hearth')) {
      woodCost = Math.ceil(woodCost / 2);
    }

    if (woodCost > 0) {
      var wood       = $SM.get('stores.wood', true);
      var actualCost = Math.min(woodCost, wood);
      if (actualCost > 0) $SM.add('stores.wood', -actualCost, true);
    }

    /* Fire decays -1 level per game-day (GDD §12) */
    if (level > 0) {
      var newLevel = level - 1;
      $SM.set('game.fire.level', newLevel, true);
      Haven._updateFireDisplay();

      if (newLevel === 0) {
        /* GDD §12 exact text */
        Haven._addLog('the fire dies. the mark holds alone. the green circle shrinks. the sickness presses close.');
        $SM.set('game.fire.dead', true, true);
      } else if (newLevel === 1) {
        /* GDD §3 Phase 2 exact text */
        Haven._addLog('the fire dims. the mark weakens. the black soil creeps closer.');
      }
    }

    /* GDD §4 — food: 1 per villager per game-day */
    Haven._consumeFood();

    /* Increment game day (GDD §13 score component) */
    var day = $SM.get('game.day', true);
    $SM.set('game.day', day + 1, true);

    /* GDD §8 — trading post random arrivals */
    Haven._checkTradingPostArrival();

    $SM.fireUpdate('stores', true);

    /* Reschedule — hearth doubles the decay interval (GDD §6) */
    var nextMs = $SM.get('game.buildings.hearth') ? Haven.GAME_DAY_MS * 2 : Haven.GAME_DAY_MS;
    Haven._timers.gameDay = Engine.setTimeout(Haven._gameDayTick, nextMs);
  },

  /* GDD §5 — day/night toggle every 90 real seconds */
  _dayNightTick: function() {
    var isNight = !($SM.get('game.isNight') || false);
    $SM.set('game.isNight', isNight, true);

    if (isNight) {
      Haven._addLog('night falls. the mark glows brighter in the dark.', 'timestamp');
      document.body.classList.add('night');
    } else {
      Haven._addLog('dawn. grey and cold. the sickness is thicker in the mornings.', 'timestamp');
      document.body.classList.remove('night');
    }

    Haven._timers.dayNight = Engine.setTimeout(Haven._dayNightTick, Haven.HALF_DAY_MS);
  },

  _startTimers: function() {
    Haven._pauseTimers();
    var dayMs = $SM.get('game.buildings.hearth') ? Haven.GAME_DAY_MS * 2 : Haven.GAME_DAY_MS;
    Haven._timers.gameDay  = Engine.setTimeout(Haven._gameDayTick,  dayMs);
    Haven._timers.dayNight = Engine.setTimeout(Haven._dayNightTick, Haven.HALF_DAY_MS);
  },

  pauseTimers: function() {
    Haven._pauseTimers();
  },

  resumeTimers: function() {
    if ($SM.get('game.grave.phase', true) >= 5) {
      Haven._startTimers();
    }
  },

  _pauseTimers: function() {
    if (Haven._timers.gameDay)  { clearTimeout(Haven._timers.gameDay);  Haven._timers.gameDay  = null; }
    if (Haven._timers.dayNight) { clearTimeout(Haven._timers.dayNight); Haven._timers.dayNight = null; }
  },

  /* ----------------------------------------------------------------
     Food consumption (GDD §4)
  ---------------------------------------------------------------- */

  _consumeFood: function() {
    var pop = $SM.get('game.population') || [];
    if (pop.length === 0) return;

    var food = $SM.get('stores.food', true);
    if (food >= pop.length) {
      $SM.add('stores.food', -pop.length, true);
    } else {
      /* GDD §4: food=0 → one villager leaves per game-day, last to arrive first */
      $SM.set('stores.food', 0, true);
      Haven._removeVillager();
    }
  },

  /* ----------------------------------------------------------------
     Building system (GDD §6)
  ---------------------------------------------------------------- */

  _buildBuildingButtons: function() {
    if (!Haven._buildingsEl) return;
    Haven._buildingsEl.innerHTML = '';

    /* Show progress bar while building — one build at a time (GDD §6) */
    var inProgress = $SM.get('game.build.inProgress');
    if (inProgress && Haven.BUILDINGS[inProgress]) {
      Haven._renderBuildProgress(inProgress);
      return;
    }

    var anyVisible = false;
    Object.keys(Haven.BUILDINGS).forEach(function(key) {
      var b = Haven.BUILDINGS[key];

      /* Skip if already built */
      if ($SM.get('game.buildings.' + key)) return;

      /* Skip if prereq not met */
      if (b.prereq && !$SM.get('game.buildings.' + b.prereq)) return;

      Haven._makeBuildButton(key, b);
      anyVisible = true;
    });

    if (anyVisible) {
      var hdr = document.createElement('div');
      hdr.className   = 'section-header';
      hdr.textContent = 'build';
      Haven._buildingsEl.insertBefore(hdr, Haven._buildingsEl.firstChild);
    }
  },

  _makeBuildButton: function(key, b) {
    var btn = document.createElement('button');
    btn.className        = 'action-btn build-btn';
    btn.dataset.building = key;

    var costParts = Object.keys(b.cost).map(function(r) {
      return b.cost[r] + ' ' + r;
    });
    btn.textContent = 'build ' + b.label + ' (' + costParts.join(', ') + ')';

    var canAfford = Haven._canAfford(b.cost);
    btn.disabled  = !canAfford;

    if (!canAfford) {
      var missing = Object.keys(b.cost).filter(function(r) {
        return ($SM.get('stores.' + r) || 0) < b.cost[r];
      }).map(function(r) {
        return 'need ' + (b.cost[r] - ($SM.get('stores.' + r) || 0)) + ' more ' + r;
      });
      btn.title = missing.join(', ');
    }

    requestAnimationFrame(function() {
      requestAnimationFrame(function() { btn.classList.add('visible'); });
    });

    btn.addEventListener('click', function() {
      if (btn.disabled) return;
      Haven._startBuild(key, b);
    });

    Haven._buildingsEl.appendChild(btn);
  },

  _canAfford: function(cost) {
    for (var r in cost) {
      var key = (r === 'markFragments') ? 'stores.markFragments' : 'stores.' + r;
      if (($SM.get(key) || 0) < cost[r]) return false;
    }
    return true;
  },

  /* GDD §6: resources consumed at start, cannot cancel */
  _startBuild: function(key, b) {
    for (var r in b.cost) {
      $SM.add('stores.' + r, -b.cost[r], true);
    }

    var endMs = Date.now() + b.time;
    $SM.set('game.build.inProgress', key, true);
    $SM.set('game.build.endMs',      endMs, true);
    Engine.saveGame();

    Haven._buildBuildingButtons();

    Haven._buildTimer = Engine.setTimeout(function() {
      Haven._completeBuild(key, b);
    }, b.time);
  },

  _renderBuildProgress: function(key) {
    var b = Haven.BUILDINGS[key];
    if (!b) return;

    var endMs     = $SM.get('game.build.endMs') || Date.now();
    var totalMs   = b.time;
    var remaining = Math.max(0, Math.ceil((endMs - Date.now()) / 1000));

    var wrapper = document.createElement('div');
    wrapper.className = 'build-progress';

    var lbl = document.createElement('div');
    lbl.className   = 'build-label';
    lbl.textContent = 'building ' + b.label + '\u2026';

    var track = document.createElement('div');
    track.className = 'progress-track';
    var fill = document.createElement('div');
    fill.className = 'progress-fill';
    fill.id        = 'buildProgressFill';
    track.appendChild(fill);

    var timerEl = document.createElement('span');
    timerEl.className   = 'build-timer';
    timerEl.textContent = remaining + 's';

    wrapper.appendChild(lbl);
    wrapper.appendChild(track);
    wrapper.appendChild(timerEl);
    Haven._buildingsEl.appendChild(wrapper);

    /* Set initial fill */
    var elapsed = totalMs - (endMs - Date.now());
    fill.style.width = Math.min(100, Math.round((elapsed / totalMs) * 100)) + '%';

    /* Countdown */
    var interval = setInterval(function() {
      remaining--;
      var f = document.getElementById('buildProgressFill');
      if (f) {
        var rem = endMs - Date.now();
        f.style.width = Math.min(100, Math.round(((totalMs - rem) / totalMs) * 100)) + '%';
      }
      if (timerEl.parentNode) timerEl.textContent = Math.max(0, remaining) + 's';
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
  },

  _completeBuild: function(key, b) {
    $SM.set('game.buildings.' + key, true, true);
    $SM.remove('game.build.inProgress', true);
    $SM.remove('game.build.endMs',      true);

    /* Narrative log on completion */
    var logs = {
      hearth:       'the hearth is built. the fire burns warmer. slower.',
      forge:        'the forge is hot. steel is possible now.',
      hut:          'rough walls. a roof of branches. enough.',
      lodge:        'the lodge is finished. more can stay.',
      storehouse:   'the storehouse stands. more can be kept now.',
      workshop:     'the workshop is ready. tools can be made here.',
      watchtower:   'from the top, you can see for miles.',
      herbalistHut: 'the herbalist hut is complete. the green patch gives more now.',
      tradingPost:  'the trading post is built. travelers may come.'
    };
    if (logs[key]) Haven._addLog(logs[key]);

    /* Watchtower extra line (GDD §3 Phase 2) */
    if (key === 'watchtower') {
      Haven._addLog('ruins. sick land. but in the distance \u2014 structures. old ones.');
    }

    /* Villager triggers for this building */
    Haven._onBuildingComplete(key);

    /* Refresh UI */
    Haven._buildBuildingButtons();
    Haven._buildCraftingButtons();
    Haven._buildButtons();
    $SM.fireUpdate('game', true);
  },

  /* Restore in-progress build after page refresh */
  _restoreBuildTimer: function() {
    var key = $SM.get('game.build.inProgress');
    if (!key || !Haven.BUILDINGS[key]) return;

    var endMs     = $SM.get('game.build.endMs') || 0;
    var remaining = endMs - Date.now();

    if (remaining <= 0) {
      /* Completed while offline — finish immediately */
      Haven._completeBuild(key, Haven.BUILDINGS[key]);
    } else {
      Haven._buildTimer = Engine.setTimeout(function() {
        Haven._completeBuild(key, Haven.BUILDINGS[key]);
      }, remaining);
    }
  },

  /* ----------------------------------------------------------------
     Villager system (GDD §8)
  ---------------------------------------------------------------- */

  /* Called after a building completes — checks which stranger to queue */
  _onBuildingComplete: function(key) {
    /* GDD §8: Stranger #2 — hut built, 90s delay
       (GDD §8 lists "Shelter built" but shelter is a start building;
        hut is the first buildable housing upgrade.) */
    if (key === 'hut' && !$SM.get('game.strangers.triggered2')) {
      $SM.set('game.strangers.triggered2', true, true);
      Engine.setTimeout(function() { Haven._addVillager(1); }, 90000);
    }

    /* GDD §8: Stranger #3 — lodge built, 60s delay */
    if (key === 'lodge' && !$SM.get('game.strangers.triggered3')) {
      $SM.set('game.strangers.triggered3', true, true);
      Engine.setTimeout(function() { Haven._addVillager(2); }, 60000);
    }
  },

  /* Called after each villager arrives — chains the next arrival */
  _onVillagerArrived: function(strangerIdx) {
    /* GDD §8: Strangers #4-5 — triggered by lodge built, 120s apart */
    if (strangerIdx === 2 && $SM.get('game.buildings.lodge') && !$SM.get('game.strangers.triggered4')) {
      $SM.set('game.strangers.triggered4', true, true);
      Engine.setTimeout(function() { Haven._addVillager(3); }, 120000);
    } else if (strangerIdx === 3 && $SM.get('game.buildings.lodge') && !$SM.get('game.strangers.triggered5')) {
      $SM.set('game.strangers.triggered5', true, true);
      Engine.setTimeout(function() { Haven._addVillager(4); }, 120000);
    }
  },

  /* Called from stoke button when fire level changes */
  _checkFireStrangerTrigger: function() {
    var pop   = $SM.get('game.population') || [];
    var level = $SM.get('game.fire.level', true);

    /* GDD §8: Stranger #1 — fire reaches level 3, 60s delay
       GDD §3 Phase 2: "movement at the edge of the green. a figure. hesitant." */
    if (pop.length === 0 && level >= 3 && !$SM.get('game.strangers.triggered1')) {
      $SM.set('game.strangers.triggered1', true, true);
      Haven._addLog('movement at the edge of the green. a figure. hesitant.');
      Engine.setTimeout(function() { Haven._addVillager(0); }, 60000);
    }
  },

  /* GDD §8: Strangers 6-10 — trading post built, every 3-5 game-days */
  _checkTradingPostArrival: function() {
    if (!$SM.get('game.buildings.tradingPost')) return;
    var pop = $SM.get('game.population') || [];
    var count = pop.length;
    if (count < 5 || count >= 10) return; /* only after first 5 arrive */
    if (count >= Haven._getPopCap()) return;

    var day         = $SM.get('game.day', true);
    var lastDay     = $SM.get('game.strangers.lastTradingPostDay') || 0;
    var interval    = 3 + Math.floor(Math.random() * 3); /* 3, 4, or 5 game-days */

    if (!lastDay || (day - lastDay) >= interval) {
      $SM.set('game.strangers.lastTradingPostDay', day, true);
      var flavor = Haven.STRANGER_FLAVOR_POOL[Math.floor(Math.random() * Haven.STRANGER_FLAVOR_POOL.length)];
      Haven._addVillagerWithFlavor(count, flavor);
    }
  },

  /* Restore pending stranger arrivals lost on page refresh */
  _restoreStrangerTimers: function() {
    var pop   = $SM.get('game.population') || [];
    var count = pop.length;
    var QUICK = 5000; /* 5s "arrival pending" delay */

    if ($SM.get('game.strangers.triggered1') && count < 1) {
      Engine.setTimeout(function() { Haven._addVillager(0); }, QUICK);
    }
    if ($SM.get('game.strangers.triggered2') && count < 2) {
      Engine.setTimeout(function() { Haven._addVillager(1); }, QUICK);
    }
    if ($SM.get('game.strangers.triggered3') && count < 3) {
      Engine.setTimeout(function() { Haven._addVillager(2); }, QUICK);
    }
    if ($SM.get('game.strangers.triggered4') && count < 4) {
      Engine.setTimeout(function() { Haven._addVillager(3); }, QUICK);
    }
    if ($SM.get('game.strangers.triggered5') && count < 5) {
      Engine.setTimeout(function() { Haven._addVillager(4); }, QUICK);
    }
  },

  _getPopCap: function() {
    if ($SM.get('game.buildings.lodge')) return 10;
    if ($SM.get('game.buildings.hut'))   return 5;
    return Haven.START_POP_CAP; /* shelter = start, holds 2 */
  },

  _addVillager: function(strangerIdx) {
    var flavor = (strangerIdx < Haven.STRANGER_FLAVOR.length)
      ? Haven.STRANGER_FLAVOR[strangerIdx]
      : Haven.STRANGER_FLAVOR_POOL[Math.floor(Math.random() * Haven.STRANGER_FLAVOR_POOL.length)];
    Haven._addVillagerWithFlavor(strangerIdx, flavor);
  },

  _addVillagerWithFlavor: function(strangerIdx, flavor) {
    var pop = $SM.get('game.population') || [];
    var cap = Haven._getPopCap();

    if (pop.length >= cap || pop.length >= 10) return;

    /* Initialize food store on first arrival if not present */
    if ($SM.get('stores.food') === undefined) $SM.set('stores.food', 0, true);

    var name = Haven.VILLAGER_NAMES[Math.floor(Math.random() * Haven.VILLAGER_NAMES.length)];
    pop.push({ name: name, assignment: 'idle' });
    $SM.set('game.population', pop, true);

    /* GDD §3 Phase 2 + §8 — stranger arrival narrative */
    if (strangerIdx === 0) {
      /* First stranger: full narrative from GDD §3 Phase 2 */
      Haven._addLog('a man. gaunt. he stares at the mark on your hand.');
      Haven._addLog('\u2018' + flavor + '\u2019', 'timestamp');
      Haven._addLog('he sits. says nothing more.');
    } else {
      Haven._addLog('a figure arrives.');
      Haven._addLog('\u2018' + flavor + '\u2019', 'timestamp');
    }

    Haven._updatePopDisplay();
    Haven._onVillagerArrived(strangerIdx);
    $SM.fireUpdate('game', true);
  },

  /* GDD §4: last to arrive leaves first */
  _removeVillager: function() {
    var pop = $SM.get('game.population') || [];
    if (pop.length === 0) return;

    var leaving = pop[pop.length - 1];
    Haven._clearVillagerIncome(pop.length - 1);

    pop.pop();
    $SM.set('game.population', pop, true);

    Haven._addLog(leaving.name.toLowerCase() + ' leaves. not enough food.');
    Haven._updatePopDisplay();
    $SM.fireUpdate('game', true);
  },

  /* ----------------------------------------------------------------
     Villager assignment (GDD §8)
  ---------------------------------------------------------------- */

  _updatePopDisplay: function() {
    if (!Haven._popEl) return;
    Haven._popEl.innerHTML = '';

    var pop = $SM.get('game.population') || [];
    if (pop.length === 0) return;

    var hdr = document.createElement('div');
    hdr.className   = 'section-header';
    hdr.textContent = 'people';
    Haven._popEl.appendChild(hdr);

    var cap = Haven._getPopCap();
    var capEl = document.createElement('div');
    capEl.className   = 'pop-cap';
    capEl.textContent = pop.length + ' / ' + cap;
    Haven._popEl.appendChild(capEl);

    pop.forEach(function(v, idx) {
      /* Name + current role row */
      var nameRow = document.createElement('div');
      nameRow.className = 'villager-row';

      var nameEl = document.createElement('span');
      nameEl.className   = 'villager-name';
      nameEl.textContent = v.name.toLowerCase();

      var roleEl = document.createElement('span');
      roleEl.className   = 'villager-role';
      roleEl.textContent = v.assignment;

      nameRow.appendChild(nameEl);
      nameRow.appendChild(roleEl);
      Haven._popEl.appendChild(nameRow);

      /* Assignment buttons */
      var assignRow = document.createElement('div');
      assignRow.className = 'assign-row';

      var roles = ['idle', 'woodcutter', 'stonecutter', 'miner', 'hunter', 'guard'];
      /* GDD §8: herbalist requires herbalist hut */
      if ($SM.get('game.buildings.herbalistHut')) roles.push('herbalist');

      roles.forEach(function(role) {
        var btn = document.createElement('button');
        btn.className   = 'assign-btn';
        /* Abbreviated labels to fit the column */
        var labels = {
          idle: 'idle', woodcutter: 'wood', stonecutter: 'stone',
          miner: 'mine', hunter: 'hunt', guard: 'guard', herbalist: 'herb'
        };
        btn.textContent = labels[role] || role;
        if (v.assignment === role) btn.classList.add('active');

        btn.addEventListener('click', function() {
          Haven._assignVillager(idx, role);
        });

        assignRow.appendChild(btn);
      });

      Haven._popEl.appendChild(assignRow);
    });
  },

  _assignVillager: function(idx, role) {
    var pop = $SM.get('game.population') || [];
    if (!pop[idx]) return;

    Haven._clearVillagerIncome(idx);
    pop[idx].assignment = role;
    $SM.set('game.population', pop, true);
    Haven._setVillagerIncome(idx, role);
    Haven._updatePopDisplay();
    $SM.fireUpdate('game', true);
  },

  /* GDD §8 — production rates per role */
  _setVillagerIncome: function(idx, role) {
    var rates = {
      woodcutter:  { stores: { wood:  1 }, delay: 10 },
      stonecutter: { stores: { stone: 1 }, delay: 10 },
      miner:       { stores: { iron:  1 }, delay: 15 },
      hunter:      { stores: { food:  1 }, delay: 10 },
      herbalist:   { stores: { herbs: 1 }, delay: 20 }
    };
    var entry = rates[role];
    if (!entry) return; /* idle, guard — no production */

    /* Initialise target resource store if missing */
    for (var r in entry.stores) {
      if ($SM.get('stores.' + r) === undefined) $SM.set('stores.' + r, 0, true);
    }

    $SM.setIncome('vlg' + idx, { stores: entry.stores, delay: entry.delay });
  },

  _clearVillagerIncome: function(idx) {
    var key = 'income["vlg' + idx + '"]';
    if ($SM.get(key) !== undefined) $SM.remove(key, true);
  },

  /* ----------------------------------------------------------------
     Crafting system (GDD §7)
  ---------------------------------------------------------------- */

  _buildCraftingButtons: function() {
    if (!Haven._craftingEl) return;
    Haven._craftingEl.innerHTML = '';

    var hasWorkshop     = !!$SM.get('game.buildings.workshop');
    var hasForge        = !!$SM.get('game.buildings.forge');
    var hasHerbalistHut = !!$SM.get('game.buildings.herbalistHut');

    if (!hasWorkshop && !hasForge && !hasHerbalistHut) return;

    var hdr = document.createElement('div');
    hdr.className   = 'section-header';
    hdr.textContent = 'craft';
    Haven._craftingEl.appendChild(hdr);

    Haven.CRAFTING.forEach(function(recipe) {
      var reqMet = (recipe.req === 'workshop'     && hasWorkshop)    ||
                   (recipe.req === 'forge'         && hasForge)       ||
                   (recipe.req === 'herbalistHut'  && hasHerbalistHut);
      if (!reqMet) return;
      Haven._makeCraftButton(recipe);
    });
  },

  _makeCraftButton: function(recipe) {
    var btn = document.createElement('button');
    btn.className      = 'action-btn craft-btn';
    btn.dataset.recipe = recipe.id;

    var costParts = Object.keys(recipe.cost).map(function(r) {
      return recipe.cost[r] + ' ' + r;
    });
    btn.textContent = recipe.label + ' (' + costParts.join(', ') + ')';

    var canAfford = Haven._canAfford(recipe.cost);
    btn.disabled  = !canAfford;

    if (!canAfford) {
      /* GDD §7: tooltip shows what's missing */
      var missing = Object.keys(recipe.cost).filter(function(r) {
        var key = (r === 'markFragments') ? 'stores.markFragments' : 'stores.' + r;
        return ($SM.get(key) || 0) < recipe.cost[r];
      }).map(function(r) {
        var key  = (r === 'markFragments') ? 'stores.markFragments' : 'stores.' + r;
        var have = $SM.get(key) || 0;
        return 'need ' + (recipe.cost[r] - have) + ' more ' + r;
      });
      btn.title = missing.join(', ');
    }

    requestAnimationFrame(function() {
      requestAnimationFrame(function() { btn.classList.add('visible'); });
    });

    btn.addEventListener('click', function() {
      if (btn.disabled) return;
      Haven._craftItem(recipe);
    });

    Haven._craftingEl.appendChild(btn);
  },

  /* GDD §7: crafting is instant */
  _craftItem: function(recipe) {
    if (!Haven._canAfford(recipe.cost)) {
      Notifications.notify(Haven, 'not enough materials.');
      return;
    }

    /* Consume materials */
    for (var r in recipe.cost) {
      var sk = (r === 'markFragments') ? 'stores.markFragments' : 'stores.' + r;
      $SM.add(sk, -recipe.cost[r], true);
    }

    /* Add to inventory */
    var invKey   = 'game.inventory.' + recipe.inv;
    var existing = $SM.get(invKey);

    if (recipe.stack) {
      $SM.set(invKey, (typeof existing === 'number' ? existing : 0) + recipe.qty, true);
    } else {
      /* Weapons/armor: equipping replaces old (GDD §7) */
      $SM.set(invKey, true, true);
    }

    Haven._addLog(recipe.label + ' crafted.');
    Haven._buildCraftingButtons();
    $SM.fireUpdate('stores', true);
  },

  /* ----------------------------------------------------------------
     Action buttons (GDD §3)
  ---------------------------------------------------------------- */

  _buildButtons: function() {
    Haven._actionsEl.innerHTML = '';
    Haven._makeGatherButton('gather wood',  'wood');
    Haven._makeGatherButton('gather stone', 'stone');
    Haven._makeStokeButton();
  },

  /* GDD §3: 10s cooldown, 3-5 units. Night: +25% cooldown (GDD §5) */
  _makeGatherButton: function(label, resource) {
    var btn = document.createElement('button');
    btn.className = 'action-btn visible';
    btn.dataset.resource = resource;
    btn.textContent = label;

    btn.addEventListener('click', function() {
      if (btn.disabled) return;
      btn.disabled = true;

      var isNight   = $SM.get('game.isNight') || false;
      var totalMs   = isNight ? Math.ceil(Haven.GATHER_COOLDOWN_MS * 1.25) : Haven.GATHER_COOLDOWN_MS;
      var remaining = Math.ceil(totalMs / 1000);

      btn.textContent = label + ' (' + remaining + 's)';

      var countdown = Engine.setInterval(function() {
        remaining--;
        if (remaining > 0) {
          btn.textContent = label + ' (' + remaining + 's)';
        } else {
          clearInterval(countdown);

          var amount  = Haven.GATHER_MIN + Math.floor(Math.random() * (Haven.GATHER_MAX - Haven.GATHER_MIN + 1));
          var cap     = $SM.get('game.buildings.storehouse') ? Haven.STOREHOUSE_CAP : Haven.BASE_STORE_CAP;
          var current = $SM.get('stores.' + resource, true);

          if (current >= cap) {
            /* GDD §18 exact text */
            Notifications.notify(Haven, 'stores are full. resources wasted.');
          } else {
            $SM.add('stores.' + resource, Math.min(amount, cap - current));
          }

          btn.disabled    = false;
          btn.textContent = label;
        }
      }, 1000);
    });

    Haven._actionsEl.appendChild(btn);
    return btn;
  },

  /* GDD §12: stoke costs 1 wood, raises fire +1 level (max 5) */
  _makeStokeButton: function() {
    var btn = document.createElement('button');
    btn.id          = 'btn-stoke';
    btn.className   = 'action-btn visible';
    btn.textContent = 'stoke the fire';
    Haven._updateStokeButtonState(btn);

    btn.addEventListener('click', function() {
      if (btn.disabled) return;

      var wood  = $SM.get('stores.wood',     true);
      var level = $SM.get('game.fire.level', true);

      if (wood < 1) {
        Notifications.notify(Haven, 'not enough wood.');
        return;
      }
      if (level >= 5) return;

      $SM.add('stores.wood', -1, true);
      $SM.set('game.fire.level', level + 1);

      if (level === 0) $SM.set('game.fire.dead', false, true);

      Haven._updateFireDisplay();
      Haven._checkFireStrangerTrigger();
    });

    Haven._actionsEl.appendChild(btn);
    return btn;
  },

  _updateStokeButtonState: function(btn) {
    btn = btn || document.getElementById('btn-stoke');
    if (!btn) return;
    var wood  = $SM.get('stores.wood',     true);
    var level = $SM.get('game.fire.level', true);
    btn.disabled = (wood < 1 || level >= 5);
  },

  /* ----------------------------------------------------------------
     Display
  ---------------------------------------------------------------- */

  _updateFireDisplay: function() {
    if (!Haven._fireEl) return;
    var level = $SM.get('game.fire.level', true);
    var name  = Haven.FIRE_NAMES[level] || 'mark only';
    Haven._fireEl.textContent = name;
    Haven._fireEl.className   = 'fire-status fire-level-' + level;
  },

  _updateStores: function() {
    if (!Haven._storesEl) return;
    Haven._storesEl.innerHTML = '';

    /* GDD §4 — display resources that exist in state */
    var order = ['wood', 'stone', 'iron', 'cloth', 'herbs', 'food'];
    order.forEach(function(r) {
      var val = $SM.get('stores.' + r);
      if (val !== undefined) Haven._renderStoreRow(r, val);
    });

    var frags = $SM.get('stores.markFragments');
    if (frags !== undefined) Haven._renderStoreRow('mark fragments', frags);
  },

  _renderStoreRow: function(name, value) {
    var row = document.createElement('div');
    row.className = 'store-row';

    var lbl = document.createElement('span');
    lbl.className   = 'store-label';
    lbl.textContent = name;

    var cnt = document.createElement('span');
    cnt.className   = 'store-count';
    cnt.textContent = (value !== undefined) ? value : 0;

    row.appendChild(lbl);
    row.appendChild(cnt);
    Haven._storesEl.appendChild(row);
  },

  _addLog: function(text, type, delay) {
    function render() {
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
    if (delay) { Engine.setTimeout(render, delay); } else { render(); }
  },

  /* ----------------------------------------------------------------
     State update handler
  ---------------------------------------------------------------- */

  _onStateUpdate: function(e) {
    if (!Haven._storesEl) return;

    if (e.category === 'stores' || e.category === 'income') {
      Haven._updateStores();
      Haven._updateStokeButtonState();
      /* Update craft button affordability in place (avoids rebuilding while typing) */
      Haven.CRAFTING.forEach(function(recipe) {
        var btn = Haven._craftingEl && Haven._craftingEl.querySelector('[data-recipe="' + recipe.id + '"]');
        if (!btn) return;
        btn.disabled = !Haven._canAfford(recipe.cost);
      });
      /* Update build button affordability in place */
      if (!$SM.get('game.build.inProgress')) {
        Object.keys(Haven.BUILDINGS).forEach(function(key) {
          var btn = Haven._buildingsEl && Haven._buildingsEl.querySelector('[data-building="' + key + '"]');
          if (!btn) return;
          btn.disabled = !Haven._canAfford(Haven.BUILDINGS[key].cost);
        });
      }
    }

    if (e.category === 'game') {
      Haven._updateFireDisplay();
      Haven._updateStokeButtonState();
      Haven._updatePopDisplay();
      Haven._buildBuildingButtons();
      Haven._buildCraftingButtons();
    }
  }

};
