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
  _evolEl:      null,

  _timers: { gameDay: null, dayNight: null, fireDecay: null },
  _buildTimer: null,

  /* GDD §12 — fire level names */
  FIRE_NAMES: ['mark only', 'flicker', 'small fire', 'fire', 'strong fire', 'blazing fire'],

  /* GDD §12 — wood auto-consumed per game-day (indexed by fire level) */
  FIRE_WOOD_COST: [0, 0, 1, 1, 2, 3],

  /* GDD §5 — 1 game-day = 2 real minutes (food/wood consumption cycle) */
  GAME_DAY_MS: 2 * 60 * 1000,

  /* GDD §5 — day/night toggle every half game-day = 60 seconds */
  HALF_DAY_MS: 60 * 1000,

  /* Final Overhaul §12 — fire decays 1 level every 5 real minutes */
  FIRE_DECAY_MS: 5 * 60 * 1000,

  /* Final Overhaul §11 — instant gather with cooldown (per-resource amounts below) */
  GATHER_COOLDOWN_MS: 15 * 1000, /* default 15s; iron uses 20s; night adds 5s */
  GATHER_MIN: 1,
  GATHER_MAX: 3,

  /* Section 1 — base storage cap 100, storehouse raises to 300 */
  BASE_STORE_CAP: 100,
  STOREHOUSE_CAP: 300,

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
    herbalistHut: { label: 'herbalist hut',  cost: { wood: 10, herbs: 3 },                        time: 30000, prereq: 'workshop'  },
    tradingPost:  { label: 'trading post',   cost: { wood: 20, stone: 15, iron: 10, cloth: 5 },   time: 90000, prereq: 'workshop'  }
  },

  /* GDD §7 — 10 crafting recipes */
  CRAFTING: [
    { id: 'torch',           label: 'torch',                    cost: { wood: 3, cloth: 2 },              req: 'workshop',     qty: 1,  inv: 'torches',           stack: true  },
    { id: 'crudeSword',      label: 'crude sword',              cost: { iron: 5, wood: 3 },              req: 'workshop',     qty: 1,  inv: 'crudeSword',         stack: false },
    { id: 'crudeArmor',      label: 'crude armor',              cost: { iron: 5, cloth: 5 },             req: 'workshop',     qty: 1,  inv: 'crudeArmor',         stack: false },
    { id: 'poultice',        label: 'poultice',                 cost: { herbs: 3 },                      req: 'herbalistHut', qty: 1,  inv: 'poultice',           stack: true  },
    { id: 'bandages',        label: 'bandages (\xd73)',         cost: { cloth: 2, herbs: 1 },            req: 'workshop',     qty: 3,  inv: 'bandages',           stack: true  },
    { id: 'steelSword',      label: 'steel sword',              cost: { iron: 10, wood: 5, cloth: 2 },   req: 'forge',        qty: 1,  inv: 'steelSword',         stack: false },
    { id: 'steelArmor',      label: 'steel armor',              cost: { iron: 12, cloth: 8, wood: 3 },   req: 'forge',        qty: 1,  inv: 'steelArmor',         stack: false },
    { id: 'reinforcedTorch', label: 'reinforced torch',         cost: { wood: 5, cloth: 3, iron: 2 },    req: 'forge',        qty: 1,  inv: 'reinforcedTorches',  stack: true  },
    { id: 'trap',            label: 'trap (\xd73)',             cost: { iron: 5, wood: 5 },              req: 'workshop',     qty: 3,  inv: 'traps',              stack: true  },
    { id: 'markLantern',     label: 'mark lantern',             cost: { iron: 3, cloth: 2, markFragments: 1 }, req: 'forge', qty: 1,  inv: 'markLantern',        stack: false }
  ],

  /* Final Overhaul §2 — auto-gathering structures (unlock after 8 manual gathers) */
  AUTO_STRUCTURES: {
    woodpile:     { resource: 'wood',  label: 'build woodpile',      cost: { wood: 10, stone: 5 }, time: 30000, income: { stores: { wood:  1 }, delay: 45 }, msg: 'a woodpile. the scraps add up.' },
    quarryMarker: { resource: 'stone', label: 'mark a quarry',        cost: { stone: 5, iron: 5 },  time: 30000, income: { stores: { stone: 1 }, delay: 45 }, msg: 'a quarry marker. the stone comes easier now.' },
    garden:       { resource: 'herbs', label: 'tend a garden',        cost: { herbs: 5, wood: 5 },  time: 30000, income: { stores: { herbs: 1 }, delay: 60 }, msg: 'a small garden in the green patch. life persists.' },
    mineShoreUp:  { resource: 'iron',  label: 'shore up the mine',    cost: { iron: 10, wood: 5 },  time: 30000, income: { stores: { iron:  1 }, delay: 60 }, msg: 'the mine holds. iron flows.' }
  },

  /* FIX 3: villager resource requests — every 5 game-days */
  VILLAGER_NEEDS: [
    { resource: 'cloth', amount: 3, text: 'asks for cloth for warmer bedding.' },
    { resource: 'herbs', amount: 3, text: 'asks for herbs. the cough is spreading.' },
    { resource: 'iron',  amount: 2, text: '\u2019s tools are wearing thin. they need iron.' },
    { resource: 'wood',  amount: 5, text: 'wants to patch their shelter. before the sickness gets in.' },
    { resource: 'stone', amount: 3, text: 'asks for stone to shore up the wall.' }
  ],

  VILLAGER_DECLINE: {
    fearful:   '\u2026i understand.',
    practical: 'fine. i\u2019ll manage.',
    curious:   'maybe next time.',
    spiritual: 'the land provides when it\u2019s ready.',
    quiet:     null /* quiet: just a nod */
  },

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

    Haven._evolEl = document.createElement('div');
    Haven._evolEl.id        = 'havenEvol';
    Haven._evolEl.className = 'haven-evol';
    main.appendChild(Haven._evolEl);

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
    Haven._updateEvolText();
    Haven._checkCompanionTrigger();
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

    /* Fire decay now handled by _fireDecayTick (Final Overhaul §12) */

    /* GDD §4 — food: 1 per villager per game-day */
    Haven._consumeFood();

    /* Increment game day (GDD §13 score component) */
    var day = $SM.get('game.day', true);
    $SM.set('game.day', day + 1, true);
    Haven._checkVillagerStories();

    /* GDD §8 — trading post random arrivals */
    Haven._checkTradingPostArrival();

    /* Final Overhaul §14: resource drain events */
    Haven._checkResourceDrain();

    /* FIX 3: haven upkeep, villager needs, morale expiry */
    Haven._checkHavenUpkeep();
    Haven._checkVillagerNeeds();
    Haven._checkMoraleExpiry();

    /* FIX 2: natural wound healing after 2 game-days */
    if ($SM.get('game.player.wounded')) {
      var healAtDay = $SM.get('game.player.healAtDay') || 0;
      var curDay2   = $SM.get('game.day', true) || 0;
      if (curDay2 >= healAtDay) {
        $SM.set('game.player.wounded', false, true);
        $SM.remove('game.player.healAtDay', true);
        Haven._addLog('the wound heals. slowly. but it heals.');
        Haven._buildButtons();
      }
    }

    $SM.fireUpdate('stores', true);

    /* Reschedule — game-day interval is fixed; fire decay handled separately */
    Haven._timers.gameDay = Engine.setTimeout(Haven._gameDayTick, Haven.GAME_DAY_MS);
  },

  /* GDD §5 — day/night toggle every 90 real seconds */
  _dayNightTick: function() {
    var isNight = !($SM.get('game.isNight') || false);
    $SM.set('game.isNight', isNight, true);

    if (isNight) {
      Haven._addLog('night falls. the mark glows brighter in the dark.', 'timestamp');
      /* Section 3: night falls mark reaction */
      if (typeof Wilds !== 'undefined') {
        Wilds._markReact('nightFalls', 'the mark brightens in the darkness. a small defiance.');
      }
      document.body.classList.add('night');
    } else {
      Haven._addLog('dawn. grey and cold. the sickness is thicker in the mornings.', 'timestamp');
      document.body.classList.remove('night');
    }

    Haven._timers.dayNight = Engine.setTimeout(Haven._dayNightTick, Haven.HALF_DAY_MS);
  },

  /* Final Overhaul §12: fire decays 1 level every 5 min (10 min with hearth) */
  _fireDecayTick: function() {
    var level = $SM.get('game.fire.level', true);
    if (level > 0) {
      var newLevel = level - 1;
      $SM.set('game.fire.level', newLevel, true);
      Haven._updateFireDisplay();

      /* §7: ambient messages for player in the wilds */
      if (typeof Wilds !== 'undefined' && Engine.activeModule === Wilds) {
        if (newLevel === 2) {
          Wilds._addLog('a pull in your chest. the fire needs tending.', 'timestamp');
        } else if (newLevel === 1) {
          Wilds._addLog('the mark dims. your people are cold.', 'timestamp');
        } else if (newLevel === 0) {
          Wilds._addLog('the mark stutters. the connection thins.', 'timestamp');
        }
      }

      if (newLevel === 0) {
        Haven._addLog('the fire dies. the mark holds alone. the green circle shrinks. the sickness presses close.');
        $SM.set('game.fire.dead', true, true);
      } else if (newLevel === 1) {
        Haven._addLog('the fire dims. the mark weakens. the black soil creeps closer.');
        Haven._villagerReact('fireLow');
      }
    }

    var nextDecay = $SM.get('game.buildings.hearth') ? Haven.FIRE_DECAY_MS * 2 : Haven.FIRE_DECAY_MS;
    Haven._timers.fireDecay = Engine.setTimeout(Haven._fireDecayTick, nextDecay);
  },

  _startTimers: function() {
    Haven._pauseTimers();
    Haven._timers.gameDay   = Engine.setTimeout(Haven._gameDayTick,   Haven.GAME_DAY_MS);
    Haven._timers.dayNight  = Engine.setTimeout(Haven._dayNightTick,  Haven.HALF_DAY_MS);
    var decayMs = $SM.get('game.buildings.hearth') ? Haven.FIRE_DECAY_MS * 2 : Haven.FIRE_DECAY_MS;
    Haven._timers.fireDecay = Engine.setTimeout(Haven._fireDecayTick, decayMs);
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
    if (Haven._timers.gameDay)   { clearTimeout(Haven._timers.gameDay);   Haven._timers.gameDay   = null; }
    if (Haven._timers.dayNight)  { clearTimeout(Haven._timers.dayNight);  Haven._timers.dayNight  = null; }
    if (Haven._timers.fireDecay) { clearTimeout(Haven._timers.fireDecay); Haven._timers.fireDecay = null; }
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
      /* §17: hollow feeling message in wilds log when food runs out */
      if (typeof Wilds !== 'undefined' && Engine.activeModule === Wilds) {
        Wilds._addLog('a hollow feeling. someone at the haven is hungry.', 'timestamp');
      }
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

    /* Watchtower: Final Overhaul §3 Event 3 — revelation view */
    if (key === 'watchtower') {
      if (typeof Wilds !== 'undefined') Wilds.unlock();
      Engine.setTimeout(function() {
        Haven._addLog('you climb the watchtower. the world opens up.');
        Haven._addLog('ruins stretch to the horizon. dark soil. dead rivers.', 'timestamp');
        Haven._addLog('but to the east \u2014 something. structure. old stone.', 'timestamp');
        Haven._addLog('to the south \u2014 a patch of green. impossible.', 'timestamp');
        Haven._addLog('the wilds are vast. and full of answers.', 'timestamp');
      }, 1500);
    }

    /* Villager triggers for this building */
    Haven._onBuildingComplete(key);

    /* Check whoa moments */
    Haven._checkWhoaMoments();

    /* Refresh UI */
    Haven._buildBuildingButtons();
    Haven._updateEvolText();
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
    /* Section 10: existing villagers react to new arrival */
    Haven._villagerReact('newVillager');
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

    /* No duplicate names — remove already-used names from the pool */
    var usedNames = pop.map(function(v) { return v.name; });
    var namePool  = Haven.VILLAGER_NAMES.filter(function(n) { return usedNames.indexOf(n) === -1; });
    if (!namePool.length) namePool = Haven.VILLAGER_NAMES; /* fallback: 20 names > 10 villager max */
    var name = namePool[Math.floor(Math.random() * namePool.length)];
    var trait      = Haven._assignTrait();
    var arrivalDay = $SM.get('game.day', true) || 0;
    pop.push({ name: name, assignment: 'idle', trait: trait, arrivalDay: arrivalDay, storyCount: 0 });
    $SM.set('game.population', pop, true);
    /* GDD §13 score component: track peak population */
    var maxPop = $SM.get('playStats.maxPop') || 0;
    if (pop.length > maxPop) $SM.set('playStats.maxPop', pop.length, true);

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
    /* Section 10: personality arrival reaction (after villager is in pop) */
    Engine.setTimeout(function() { Haven._villagerReact('arrival'); }, 500);
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
    /* §17: deterioration message in wilds log */
    if (typeof Wilds !== 'undefined' && Engine.activeModule === Wilds) {
      Wilds._addLog('a name fades from your awareness. someone has left.', 'timestamp');
    }
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
      /* FIX: weaver requires trading post */
      if ($SM.get('game.buildings.tradingPost')) roles.push('weaver');

      roles.forEach(function(role) {
        var btn = document.createElement('button');
        btn.className   = 'assign-btn';
        /* Abbreviated labels to fit the column */
        var labels = {
          idle: 'idle', woodcutter: 'wood', stonecutter: 'stone',
          miner: 'mine', hunter: 'hunt', guard: 'guard', herbalist: 'herb', weaver: 'weave'
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
      woodcutter:  { stores: { wood:  1 }, delay: 20 },
      stonecutter: { stores: { stone: 1 }, delay: 20 },
      miner:       { stores: { iron:  1 }, delay: 30 },
      hunter:      { stores: { food:  1 }, delay: 15 },
      herbalist:   { stores: { herbs: 1 }, delay: 30 },
      weaver:      { stores: { cloth: 1 }, delay: 30 } /* FIX: requires tradingPost */
    };
    var entry = rates[role];
    if (!entry) return; /* idle, guard — no production */

    /* Initialise target resource store if missing */
    for (var r in entry.stores) {
      if ($SM.get('stores.' + r) === undefined) $SM.set('stores.' + r, 0, true);
    }
    /* Ensure cloth store exists for weaver */
    if (role === 'weaver' && $SM.get('stores.cloth') === undefined) $SM.set('stores.cloth', 0, true);

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

  /* §9: briefly pulse (highlight) a build button by building key */
  _pulseBuildBtn: function(buildKey) {
    var btn = Haven._buildingsEl && Haven._buildingsEl.querySelector('[data-building="' + buildKey + '"]');
    if (!btn) return;
    btn.classList.add('pulse-highlight');
    Engine.setTimeout(function() { btn.classList.remove('pulse-highlight'); }, 3000);
  },

  /* §9: briefly pulse (highlight) a craft button by recipe id */
  _pulseCraftBtn: function(recipeId) {
    var btn = Haven._craftingEl && Haven._craftingEl.querySelector('[data-recipe="' + recipeId + '"]');
    if (!btn) return;
    btn.classList.add('pulse-highlight');
    Engine.setTimeout(function() { btn.classList.remove('pulse-highlight'); }, 3000);
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

    /* Section 23: Torch and reinforced torch use charge pool.
       Regular torch: 5 charges per craft. Reinforced torch: 15 charges per craft. */
    if (recipe.id === 'torch' || recipe.id === 'reinforcedTorch') {
      var chargesPerItem    = (recipe.id === 'torch') ? 5 : 15;
      var totalNew          = recipe.qty * chargesPerItem;
      var curCharges        = $SM.get('game.inventory.torchCharges',    true) || 0;
      var curMaxCharges     = $SM.get('game.inventory.torchMaxCharges', true) || 0;
      $SM.set('game.inventory.torchCharges',    curCharges    + totalNew, true);
      $SM.set('game.inventory.torchMaxCharges', curMaxCharges + totalNew, true);
      /* FIX 2: flag that player has ever crafted reinforced torch (reveals adj tile chars) */
      if (recipe.id === 'reinforcedTorch') $SM.set('game.inventory.hasReinforcedTorch', true, true);
      Haven._addLog(recipe.label + ' crafted.');
      Haven._buildCraftingButtons();
      $SM.fireUpdate('stores', true);
      return;
    }

    /* Add to inventory */
    var invKey   = 'game.inventory.' + recipe.inv;
    var existing = $SM.get(invKey);

    if (recipe.stack) {
      $SM.set(invKey, (typeof existing === 'number' ? existing : 0) + recipe.qty, true);
    } else {
      /* Weapons/armor: equipping replaces old (GDD §7) */
      $SM.set(invKey, true, true);
      /* §24.10: set initial durability on weapon/armor craft */
      var durMap = { crudeSword: 5, steelSword: 10, crudeArmor: 5, steelArmor: 10 };
      if (durMap[recipe.inv] !== undefined) {
        if (recipe.inv === 'crudeSword' || recipe.inv === 'steelSword') {
          $SM.set('game.player.weaponDurability', durMap[recipe.inv], true);
        } else {
          $SM.set('game.player.armorDurability', durMap[recipe.inv], true);
        }
      }
    }

    Haven._addLog(recipe.label + ' crafted.');
    /* Section 10: personality craft reaction for weapons/armor */
    if (['crudeSword','steelSword','crudeArmor','steelArmor'].indexOf(recipe.id) !== -1) {
      Haven._villagerReact('craft');
    }
    Haven._buildCraftingButtons();
    $SM.fireUpdate('stores', true);
  },

  /* ----------------------------------------------------------------
     Action buttons (GDD §3)
  ---------------------------------------------------------------- */

  _buildButtons: function() {
    Haven._actionsEl.innerHTML = '';
    /* §11: instant 1-3 units, 15s cooldown */
    Haven._makeGatherButton('gather wood',  'wood',  1, 3, 15000);
    Haven._makeGatherButton('gather stone', 'stone', 1, 3, 15000);
    Haven._makeStokeButton();
    /* Gather herbs — green patch established at fire level 2+ */
    if ($SM.get('game.fire.level', true) >= 2) {
      Haven._makeGatherButton('gather herbs', 'herbs', 1, 2, 15000);
    }
    /* Salvage cloth — ruins have old fabric once workshop is built */
    if ($SM.get('game.buildings.workshop')) {
      Haven._makeGatherButton('salvage cloth', 'cloth', 1, 2, 15000);
    }
    /* Final Overhaul §8: gather iron when fire ≥ 3 (anti-softlock); §11: 1-2 units, 20s */
    if ($SM.get('game.fire.level', true) >= 3) {
      Haven._makeGatherButton('gather iron', 'iron', 1, 2, 20000);
    }
    /* Final Overhaul §2: auto-structure build buttons */
    Object.keys(Haven.AUTO_STRUCTURES).forEach(function(key) {
      var shown = $SM.get('game.autoStructures.' + key + '.shown');
      var built = $SM.get('game.autoStructures.' + key + '.built');
      if (shown && !built) Haven._makeAutoStructureButton(key, Haven.AUTO_STRUCTURES[key]);
    });
    /* FIX 2: use poultice when wounded */
    if ($SM.get('game.player.wounded')) {
      var poulticeInv = $SM.get('game.inventory.poultice', true) || 0;
      if (poulticeInv > 0) {
        var pBtn = document.createElement('button');
        pBtn.className   = 'action-btn visible';
        pBtn.textContent = 'use poultice';
        pBtn.addEventListener('click', function() {
          if (($SM.get('game.inventory.poultice', true) || 0) <= 0) return;
          $SM.add('game.inventory.poultice', -1, true);
          $SM.set('game.player.wounded', false, true);
          $SM.remove('game.player.healAtDay', true);
          Haven._addLog('the poultice draws out the infection. the wound closes.');
          Haven._buildButtons();
        });
        Haven._actionsEl.appendChild(pBtn);
      }
    }

    /* FIX 3: villager need choice buttons */
    var vneed = $SM.get('game.villagerNeed');
    if (vneed && vneed.active) Haven._renderVillagerNeedButtons(vneed);

    if (typeof Events !== 'undefined') Events._injectHavenButtons();
  },

  /* Final Overhaul §11: instant-click gather with cooldown bar.
     Resources awarded immediately; button goes on cooldown afterward.
     Night: +5s to all cooldowns. */
  _makeGatherButton: function(label, resource, min, max, cooldownMs) {
    var gMin         = (min        !== undefined) ? min        : Haven.GATHER_MIN;
    var gMax         = (max        !== undefined) ? max        : Haven.GATHER_MAX;
    var baseCooldown = (cooldownMs !== undefined) ? cooldownMs : Haven.GATHER_COOLDOWN_MS;

    var wrapper = document.createElement('div');
    wrapper.className = 'gather-btn-wrapper';

    var btn = document.createElement('button');
    btn.className        = 'action-btn visible';
    btn.dataset.resource = resource;
    btn.textContent      = label;

    var bar = document.createElement('div');
    bar.className = 'cooldown-bar';

    wrapper.appendChild(btn);
    wrapper.appendChild(bar);

    btn.addEventListener('click', function() {
      if (btn.disabled) return;

      /* Instant resource award */
      var amount  = gMin + Math.floor(Math.random() * (gMax - gMin + 1));
      var cap     = $SM.get('game.buildings.storehouse') ? Haven.STOREHOUSE_CAP : Haven.BASE_STORE_CAP;
      var current = $SM.get('stores.' + resource, true);

      if (current >= cap) {
        Notifications.notify(Haven, 'stores are full. resources wasted.');
      } else {
        $SM.add('stores.' + resource, Math.min(amount, cap - current));
      }

      /* Final Overhaul §2: track gather count for auto-structure unlock */
      var count = ($SM.get('game.gatherCounts.' + resource) || 0) + 1;
      $SM.set('game.gatherCounts.' + resource, count, true);
      Haven._checkAutoStructureUnlock(resource);

      /* Start cooldown — night adds 5 seconds */
      var isNight = $SM.get('game.isNight') || false;
      var totalMs = baseCooldown + (isNight ? 5000 : 0);

      btn.disabled = true;
      bar.style.transition = 'none';
      bar.style.width      = '0%';
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          bar.style.transition = 'width ' + totalMs + 'ms linear';
          bar.style.width      = '100%';
        });
      });

      Engine.setTimeout(function() {
        btn.disabled         = false;
        bar.style.transition = 'none';
        bar.style.width      = '0%';
      }, totalMs);
    });

    Haven._actionsEl.appendChild(wrapper);
    return btn;
  },

  /* Final Overhaul §2: check if an auto-structure should be revealed */
  _checkAutoStructureUnlock: function(resource) {
    var count = $SM.get('game.gatherCounts.' + resource) || 0;
    if (count < 8) return;
    var structKey = null;
    Object.keys(Haven.AUTO_STRUCTURES).forEach(function(k) {
      if (Haven.AUTO_STRUCTURES[k].resource === resource) structKey = k;
    });
    if (!structKey) return;
    if ($SM.get('game.autoStructures.' + structKey + '.shown')) return;
    if ($SM.get('game.autoStructures.' + structKey + '.built'))  return;
    $SM.set('game.autoStructures.' + structKey + '.shown', true, true);
    Haven._buildButtons();
  },

  /* Final Overhaul §2: render an auto-structure build button */
  _makeAutoStructureButton: function(key, s) {
    var costParts = Object.keys(s.cost).map(function(r) { return s.cost[r] + ' ' + r; });
    var btn = document.createElement('button');
    btn.className   = 'action-btn visible';
    btn.textContent = s.label + ' (' + costParts.join(', ') + ')';
    btn.disabled    = !Haven._canAfford(s.cost);
    btn.addEventListener('click', function() {
      if (btn.disabled) return;
      Haven._buildAutoStructure(key, s, btn);
    });
    Haven._actionsEl.appendChild(btn);
  },

  /* Final Overhaul §2: execute an auto-structure build */
  _buildAutoStructure: function(key, s, btn) {
    if (!Haven._canAfford(s.cost)) return;
    for (var r in s.cost) { $SM.add('stores.' + r, -s.cost[r], true); }
    btn.disabled    = true;
    btn.textContent = s.label + ' (building\u2026)';
    Engine.setTimeout(function() {
      $SM.set('game.autoStructures.' + key + '.built', true, true);
      Haven._addLog(s.msg);
      $SM.setIncome('auto_' + key, s.income);
      Haven._buildButtons();
      $SM.fireUpdate('stores', true);
    }, s.time);
  },

  /* Section 7: resource drain events — check if any resource exceeds 200 */
  _checkResourceDrain: function() {
    var RESOURCES   = ['wood', 'stone', 'iron', 'cloth', 'herbs', 'food'];
    var THRESHOLD   = 200;
    var DRAIN_FLOOR = 150;
    var DRAIN_TEXTS = [
      'a section of the storehouse collapses. some supplies are buried.',
      'the sickness seeps through a crack in the wall. some stores are ruined.',
      'a storm in the night. rain through the roof. some things are lost.',
      'rats. they found the stores. not much left of what they touched.',
      'the wood near the edge of the green has rotted. the sickness got to it.'
    ];

    /* Check if any resource exceeds threshold */
    var overflowing = RESOURCES.filter(function(r) {
      return ($SM.get('stores.' + r, true) || 0) > THRESHOLD;
    });
    if (overflowing.length === 0) return;

    /* 30% chance per game-day */
    if (Math.random() > 0.30) return;

    /* Safety: skip if player can afford any unbuilt building */
    var canAffordUnbuilt = Object.keys(Haven.BUILDINGS).some(function(key) {
      return !$SM.get('game.buildings.' + key) && Haven._canAfford(Haven.BUILDINGS[key].cost);
    });
    if (canAffordUnbuilt) return;

    /* Pick a random overflowing resource and drain 10-15% of excess above DRAIN_FLOOR */
    var r       = overflowing[Math.floor(Math.random() * overflowing.length)];
    var current = $SM.get('stores.' + r, true) || 0;
    var excess  = Math.max(0, current - DRAIN_FLOOR);
    var pct     = 0.10 + Math.random() * 0.05; /* 10-15% */
    var drain   = Math.max(1, Math.floor(excess * pct));

    $SM.add('stores.' + r, -drain, true);

    var text = DRAIN_TEXTS[Math.floor(Math.random() * DRAIN_TEXTS.length)];
    Haven._addLog(text);
    Haven._addLog(drain + ' ' + r + ' lost.', 'timestamp');
  },

  /* FIX 3: haven upkeep — passive resource drain once enough buildings exist */
  _checkHavenUpkeep: function() {
    var BKEYS  = ['hearth','forge','hut','lodge','storehouse','workshop','watchtower','herbalistHut','tradingPost'];
    var bCount = 0;
    BKEYS.forEach(function(k) { if ($SM.get('game.buildings.' + k)) bCount++; });

    if (bCount >= 5) {
      if (($SM.get('stores.wood', true) || 0) > 0) {
        $SM.add('stores.wood', -1, true);
      } else {
        Haven._addLog('the walls are cracking. wood is needed.', 'timestamp');
      }
    }
    if (bCount >= 7) {
      if (($SM.get('stores.stone', true) || 0) > 0) {
        $SM.add('stores.stone', -1, true);
      } else {
        Haven._addLog('the walls are cracking. stone is needed.', 'timestamp');
      }
    }
    if (bCount >= 8) {
      if (($SM.get('stores.iron', true) || 0) > 0) {
        $SM.add('stores.iron', -1, true);
      } else {
        Haven._addLog('the tools are wearing thin. iron is needed.', 'timestamp');
      }
    }
  },

  /* FIX 3: villager needs — check every 5 game-days */
  _checkVillagerNeeds: function() {
    var day = $SM.get('game.day', true) || 0;
    if (day > 0 && day % 5 === 0 && !$SM.get('game.villagerNeed.active')) {
      Haven._triggerVillagerNeed();
    }
  },

  _triggerVillagerNeed: function() {
    var pop = $SM.get('game.population') || [];
    if (!pop.length) return;
    var needDef = Haven.VILLAGER_NEEDS[Math.floor(Math.random() * Haven.VILLAGER_NEEDS.length)];
    var v       = pop[Math.floor(Math.random() * pop.length)];
    var vName   = v.name.toLowerCase();

    /* iron request uses possessive prefix */
    var logText = (needDef.resource === 'iron')
      ? vName + needDef.text
      : vName + ' ' + needDef.text;

    $SM.set('game.villagerNeed', {
      active:   true,
      idx:      pop.indexOf(v),
      name:     v.name,
      trait:    v.trait,
      resource: needDef.resource,
      amount:   needDef.amount
    }, true);

    Haven._addLog(logText);
    if (Engine.activeModule === Haven) Haven._buildButtons();
  },

  _renderVillagerNeedButtons: function(vneed) {
    var resource  = vneed.resource;
    var amount    = vneed.amount;
    var canGive   = ($SM.get('stores.' + resource, true) || 0) >= amount;

    var giveBtn = document.createElement('button');
    giveBtn.className   = 'action-btn visible';
    giveBtn.textContent = 'give ' + amount + ' ' + resource;
    giveBtn.disabled    = !canGive;
    giveBtn.addEventListener('click', function() {
      if (($SM.get('stores.' + resource, true) || 0) < amount) return;
      $SM.add('stores.' + resource, -amount, true);
      $SM.set('game.villagerNeed.active', false, true);
      Haven._addLog(vneed.name.toLowerCase() + ' thanks you.', 'timestamp');
      Haven._grantMoraleBoost(vneed.idx, resource);
      Haven._buildButtons();
    });
    Haven._actionsEl.appendChild(giveBtn);

    var notNowBtn = document.createElement('button');
    notNowBtn.className   = 'action-btn visible';
    notNowBtn.textContent = 'not now';
    notNowBtn.addEventListener('click', function() {
      $SM.set('game.villagerNeed.active', false, true);
      var declineText = Haven.VILLAGER_DECLINE[vneed.trait];
      if (declineText) {
        Haven._addLog(vneed.name.toLowerCase() + ': \u2018' + declineText + '\u2019', 'timestamp');
      } else {
        Haven._addLog(vneed.name.toLowerCase() + ' nods. returns to work.', 'timestamp');
      }
      Haven._buildButtons();
    });
    Haven._actionsEl.appendChild(notNowBtn);
  },

  /* FIX 3: morale boost — extra income stream for 5 game-days (+25%) */
  _grantMoraleBoost: function(idx, resource) {
    var pop = $SM.get('game.population') || [];
    var v   = pop[idx];
    if (!v || !v.assignment || v.assignment === 'idle' || v.assignment === 'guard') return;

    var delays = { woodcutter: 20, stonecutter: 20, miner: 30, hunter: 15, herbalist: 30, weaver: 30 };
    var resMap  = { woodcutter: 'wood', stonecutter: 'stone', miner: 'iron', hunter: 'food', herbalist: 'herbs', weaver: 'cloth' };
    var delay   = delays[v.assignment];
    var prodRes = resMap[v.assignment];
    if (!delay || !prodRes) return;

    /* Extra income: 1 unit per 4× base delay = 25% more production */
    var moraleKey    = 'morale' + idx;
    var moraleIncome = { stores: {}, delay: delay * 4 };
    moraleIncome.stores[prodRes] = 1;
    $SM.setIncome(moraleKey, moraleIncome);

    var expiryDay    = ($SM.get('game.day', true) || 0) + 5;
    var moraleExpiry = $SM.get('game.moraleExpiry') || {};
    moraleExpiry[idx] = { key: moraleKey, expiryDay: expiryDay };
    $SM.set('game.moraleExpiry', moraleExpiry, true);
  },

  /* FIX 3: remove morale boost after 5 game-days */
  _checkMoraleExpiry: function() {
    var curDay      = $SM.get('game.day', true) || 0;
    var moraleExpiry = $SM.get('game.moraleExpiry') || {};
    var changed     = false;
    Object.keys(moraleExpiry).forEach(function(idx) {
      var entry = moraleExpiry[idx];
      if (curDay >= entry.expiryDay) {
        var iKey = 'income["' + entry.key + '"]';
        if ($SM.get(iKey) !== undefined) $SM.remove(iKey, true);
        delete moraleExpiry[idx];
        changed = true;
      }
    });
    if (changed) $SM.set('game.moraleExpiry', moraleExpiry, true);
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

      /* Section 3: fire blazing mark reaction */
      if ((level + 1) === 5 && typeof Wilds !== 'undefined') {
        Wilds._markReact('fireBlaze', 'the mark glows bright. the green patch pulses with warmth.');
      }

      if (level === 0) $SM.set('game.fire.dead', false, true);

      Haven._updateFireDisplay();
      Haven._checkFireStrangerTrigger();
      /* Show gather herbs button the moment fire reaches level 2 */
      if (level < 2 && (level + 1) >= 2) Haven._buildButtons();
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
    /* §24.11: show cap for capped resources (wood/stone/iron/cloth/herbs/food) */
    var cappedResources = ['wood', 'stone', 'iron', 'cloth', 'herbs', 'food'];
    if (cappedResources.indexOf(name) !== -1) {
      var cap = $SM.get('game.buildings.storehouse') ? Haven.STOREHOUSE_CAP : Haven.BASE_STORE_CAP;
      cnt.textContent = (value !== undefined ? value : 0) + ' / ' + cap;
    } else {
      cnt.textContent = (value !== undefined) ? value : 0;
    }

    row.appendChild(lbl);
    row.appendChild(cnt);
    Haven._storesEl.appendChild(row);
  },

  /* Section 14: cap at 8 visible log entries — oldest scroll off */
  LOG_CAP: 8,

  _addLog: function(text, type, delay) {
    function render() {
      var el = document.createElement('div');
      el.className = 'narrative';
      if (type === 'timestamp') el.classList.add('timestamp');
      el.textContent = text;
      Haven._logEl.appendChild(el);

      /* Enforce 8-entry cap: remove oldest when exceeded */
      var entries = Haven._logEl.querySelectorAll('.narrative');
      while (entries.length > Haven.LOG_CAP) {
        Haven._logEl.removeChild(Haven._logEl.firstChild);
        entries = Haven._logEl.querySelectorAll('.narrative');
      }

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
      Haven._updateEvolText();
      Haven._checkCompanionTrigger();
      Haven._checkWhoaMoments();
    }
  },

  /* Final Overhaul §3: scripted "whoa" moments */
  _checkWhoaMoments: function() {
    if ($SM.get('game.grave.phase', true) < 5) return;

    /* Event 1: 3 buildings → buried weapon */
    if (!$SM.get('game.whoa.buriedWeapon')) {
      var bCount = 0;
      ['hearth','forge','hut','lodge','storehouse','workshop','watchtower','herbalistHut','tradingPost']
        .forEach(function(k) { if ($SM.get('game.buildings.' + k)) bCount++; });
      if (bCount >= 3) {
        $SM.set('game.whoa.buriedWeapon', true, true);
        Engine.setTimeout(function() {
          Haven._addLog('a villager calls out. something in the dirt.');
          Haven._addLog('a sword. rusted. broken. but real.', 'timestamp');
          Haven._addLog('something used this. something that fights.', 'timestamp');
          /* Pulse the crude sword recipe button to draw attention */
          Haven._pulseCraftBtn('crudeSword');
        }, 2000);
      }
    }

    /* Event 2: 5 villagers, no watchtower → arm first night attack */
    if (!$SM.get('game.whoa.firstNightAttackArmed') && !$SM.get('game.whoa.nightAttackEnabled')) {
      var pop2 = $SM.get('game.population') || [];
      if (pop2.length >= 5 && !$SM.get('game.buildings.watchtower')) {
        $SM.set('game.whoa.firstNightAttackArmed', true, true);
      }
    }

    /* Event 4: 7 villagers → unsettling stranger */
    if (!$SM.get('game.whoa.unsettlingStranger')) {
      var pop4 = $SM.get('game.population') || [];
      var cap4 = Haven._getPopCap();
      if (pop4.length >= 7 && pop4.length < cap4) {
        $SM.set('game.whoa.unsettlingStranger', true, true);
        Engine.setTimeout(function() {
          Haven._addLog('a stranger arrives. different from the others.');
          Haven._addLog('she doesn\u2019t sit by the fire. she stares at the mark.', 'timestamp');
          Haven._addLog('\u2018you\u2019re the last one,\u2019 she says. \u2018the very last.\u2019', 'timestamp');
          Haven._addLog('she won\u2019t say more. she works. but she watches.', 'timestamp');
          var pop5 = $SM.get('game.population') || [];
          var usedNames = pop5.map(function(v) { return v.name; });
          var namePool  = Haven.VILLAGER_NAMES.filter(function(n) { return usedNames.indexOf(n) === -1; });
          if (!namePool.length) namePool = Haven.VILLAGER_NAMES;
          var name = namePool[Math.floor(Math.random() * namePool.length)];
          var arrivalDay = $SM.get('game.day', true) || 0;
          pop5.push({ name: name, assignment: 'idle', trait: 'spiritual', arrivalDay: arrivalDay, storyCount: 0 });
          $SM.set('game.population', pop5, true);
          var maxPop = $SM.get('playStats.maxPop') || 0;
          if (pop5.length > maxPop) $SM.set('playStats.maxPop', pop5.length, true);
          Haven._updatePopDisplay();
          $SM.fireUpdate('game', true);
        }, 3000);
      }
    }
  },

  /* Section 5: haven evolution text */
  _updateEvolText: function() {
    if (!Haven._evolEl) return;
    var buildings = 0;
    ['hearth','forge','hut','lodge','storehouse','workshop','watchtower','herbalistHut','tradingPost']
      .forEach(function(k) { if ($SM.get('game.buildings.' + k)) buildings++; });
    var text;
    if      (buildings <= 1) text = 'a fire in the ruins. the green patch is small. fragile. the sickness presses close.';
    else if (buildings <= 3) text = 'a camp. rough but standing. the green pushes back against the black soil.';
    else if (buildings <= 5) text = 'a settlement takes shape. the air smells cleaner here. someone planted seeds.';
    else if (buildings <= 7) text = 'a village. paths worn between buildings. smoke rising. it looks almost normal.';
    else if (buildings <= 9) text = 'a haven. gardens growing. children playing in the green. the mark hums steady.';
    else                     text = 'a home. walls strong. people safe. the green stretches wide. you built this from nothing.';
    Haven._evolEl.textContent = text;
  },

  /* Section 10: assign personality trait */
  _assignTrait: function() {
    var pool = $SM.get('game.traitPool');
    if (!pool || !pool.length) {
      pool = ['curious', 'practical', 'fearful', 'spiritual', 'quiet'];
      for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
      }
    }
    var trait = pool.shift();
    $SM.set('game.traitPool', pool, true);
    return trait;
  },

  /* Section 10: villager personality reaction */
  _villagerReact: function(eventKey) {
    if (Math.random() > 0.6) return;
    var pop = $SM.get('game.population') || [];
    if (!pop.length) return;
    var v = pop[Math.floor(Math.random() * pop.length)];
    if (!v || !v.trait) return;
    var lines = Haven.PERSONALITY_LINES[v.trait];
    if (!lines || !lines[eventKey]) return;
    var text = lines[eventKey];
    if (v.trait === 'quiet') {
      Haven._addLog(text, 'timestamp');
    } else {
      Haven._addLog(v.name.toLowerCase() + ': \u2018' + text + '\u2019', 'timestamp');
    }
  },

  /* Section 11: villager stories */
  _checkVillagerStories: function() {
    var pop     = $SM.get('game.population') || [];
    var day     = $SM.get('game.day', true) || 0;
    var changed = false;

    pop.forEach(function(v) {
      if (v.arrivalDay === undefined) { v.arrivalDay = day; changed = true; }
      if (v.storyCount === undefined) { v.storyCount = 0;   changed = true; }

      var daysPresent = day - v.arrivalDay;
      var sc          = v.storyCount;

      if (sc === 0 && daysPresent >= 10) {
        Haven._tellVillagerStory(v, 0);
        v.storyCount    = 1;
        v.nextStoryDay  = day + 8 + Math.floor(Math.random() * 5);
        changed         = true;
      } else if (sc === 1 && v.nextStoryDay && day >= v.nextStoryDay) {
        Haven._tellVillagerStory(v, 1);
        v.storyCount   = 2;
        v.nextStoryDay = day + 8 + Math.floor(Math.random() * 5);
        changed        = true;
      } else if (sc === 2 && v.nextStoryDay && day >= v.nextStoryDay) {
        Haven._tellVillagerStory(v, 2);
        v.storyCount = 3;
        changed      = true;
      }
    });

    if (changed) $SM.set('game.population', pop, true);
  },

  _tellVillagerStory: function(v, storyIdx) {
    var stories = Haven.VILLAGER_STORIES[v.trait || 'quiet'];
    if (!stories || !stories[storyIdx]) return;
    var text = stories[storyIdx];
    if (v.trait === 'quiet') {
      Haven._addLog(text, 'timestamp');
    } else {
      Haven._addLog(v.name.toLowerCase() + ': \u2018' + text + '\u2019', 'timestamp');
    }
  },

  /* Section 12: companion trigger */
  _checkCompanionTrigger: function() {
    if ($SM.get('game.companion.eventShown')) return;
    if ($SM.get('game.companion.refused'))    return;
    if ($SM.get('game.companion.alive'))      return;

    var pop      = $SM.get('game.population') || [];
    var tiles    = $SM.get('playStats.tilesExplored') || 0;
    var hasSword = !!$SM.get('game.inventory.steelSword');

    if (pop.length < 6 || tiles < 20 || !hasSword) return;

    $SM.set('game.companion.eventShown', true, true);

    var companionV = null;
    for (var i = 0; i < pop.length; i++) {
      if (pop[i].trait === 'curious') { companionV = pop[i]; break; }
    }
    if (!companionV) companionV = pop[0];
    if (!companionV) return;

    var cTrigName = companionV.name;
    Haven._addLog(cTrigName + ' approaches after you return from the wilds.', 'timestamp');
    Engine.setTimeout(function() {
      Haven._addLog('\u2018let me come with you. i can carry supplies. i can fight.\u2019');
      Engine.setTimeout(function() {
        Haven._addLog('\u2018you shouldn\u2019t go alone out there.\u2019');
        Engine.setTimeout(function() {
          var takeBtn = document.createElement('button');
          takeBtn.className   = 'action-btn visible';
          takeBtn.textContent = 'take them';
          takeBtn.addEventListener('click', function() {
            Haven._takeCompanion(companionV);
            takeBtn.parentNode && takeBtn.parentNode.removeChild(takeBtn);
            refuseBtn.parentNode && refuseBtn.parentNode.removeChild(refuseBtn);
          });
          var refuseBtn = document.createElement('button');
          refuseBtn.className   = 'action-btn visible';
          refuseBtn.textContent = 'too dangerous';
          refuseBtn.addEventListener('click', function() {
            $SM.set('game.companion.refused', true, true);
            Haven._addLog('\u2026i understand.', 'timestamp');
            Engine.setTimeout(function() {
              Haven._addLog(cTrigName.toLowerCase() + ' watches you leave alone. says nothing.', 'timestamp');
            }, 3000);
            takeBtn.parentNode   && takeBtn.parentNode.removeChild(takeBtn);
            refuseBtn.parentNode && refuseBtn.parentNode.removeChild(refuseBtn);
          });
          Haven._actionsEl.appendChild(takeBtn);
          Haven._actionsEl.appendChild(refuseBtn);
        }, 1500);
      }, 1000);
    }, 800);
  },

  _takeCompanion: function(v) {
    $SM.set('game.companion', {
      name:              v.name,
      trait:             v.trait || 'curious',
      alive:             true,
      present:           false,
      movesSinceComment: 0
    }, true);
    Haven._addLog(v.name.toLowerCase() + ' joins you.', 'timestamp');

    /* Remove from population */
    var pop = $SM.get('game.population') || [];
    var idx = -1;
    for (var i = 0; i < pop.length; i++) {
      if (pop[i].name === v.name) { idx = i; break; }
    }
    if (idx !== -1) {
      Haven._clearVillagerIncome(idx);
      pop.splice(idx, 1);
      $SM.set('game.population', pop, true);
    }
    Haven._updatePopDisplay();
    $SM.fireUpdate('game', true);
  },

  /* Section 10: villager personality reaction lines */
  PERSONALITY_LINES: {
    curious: {
      arrival:     'what is that mark? i\u2019ve never seen anything like it.',
      return:      'what did you find out there? tell me everything.',
      fireLow:     '\u2026do you think the sickness can reach us here?',
      nightAttack: 'did you see what they looked like? were they always like that?',
      craft:       'are you expecting trouble out there?',
      newVillager: 'another one. the mark is getting stronger.'
    },
    practical: {
      arrival:     'you need help. i can work.',
      return:      'good. we were running low.',
      fireLow:     'the fire needs wood. i\u2019ll handle it.',
      nightAttack: 'we need better walls.',
      craft:       'about time.',
      newVillager: 'more hands. good.'
    },
    fearful: {
      arrival:     'please. the sickness is everywhere else. let me stay.',
      return:      'you came back. i wasn\u2019t sure you would.',
      fireLow:     'it\u2019s getting cold. that means it\u2019s getting closer.',
      nightAttack: 'i can\u2019t do this. i can\u2019t.',
      craft:       'is it that bad out there?',
      newVillager: 'more people. more mouths. is there enough?'
    },
    spiritual: {
      arrival:     'the mark. the old stories were true.',
      return:      'the land speaks through you. can you hear it?',
      fireLow:     'the mark is tired. like the ones before.',
      nightAttack: 'the sickness is testing us.',
      craft:       'the old wardens carried blades too. it didn\u2019t save them.',
      newVillager: 'the mark calls. they answer. as it has always been.'
    },
    quiet: {
      arrival:     '(says nothing. sits by the fire.)',
      return:      '(nods.)',
      fireLow:     '(stares at the ember. says nothing.)',
      nightAttack: '(holds a stone. knuckles white.)',
      craft:       '(watches closely.)',
      newVillager: '(makes room by the fire.)'
    }
  },

  /* Section 11: villager story fragments per trait */
  VILLAGER_STORIES: {
    curious: [
      'i was a teacher. before. the children\u2026 (stops.)',
      'i kept one book. hid it from the sickness. i read it to myself some nights.',
      'if the sickness ends\u2026 do you think the schools could come back?'
    ],
    practical: [
      'i walked for six days to reach the mark\u2019s glow.',
      'i buried my husband on day two of the walk. kept going.',
      'don\u2019t tell me if you\u2019re not planning to come back from out there.'
    ],
    fearful: [
      'i watched my village disappear. the black just\u2026 swallowed it.',
      'i still hear them sometimes. calling from the sick land.',
      'promise me you won\u2019t leave us. promise.'
    ],
    spiritual: [
      'my mother spoke of the mark-bearers. she said they were chosen.',
      'i pray to the old stones. i don\u2019t know if anything hears.',
      'you carry more than the mark. you carry all of us.'
    ],
    quiet: [
      '(you find a small carving by the fire. a bird. delicate.)',
      '(a flower appears at your door. no one claims it.)',
      '(the quiet one catches your eye. holds it. looks away.)'
    ]
  },

  /* Section 12: companion exploration comments */
  COMPANION_COMMENTS: [
    'this place\u2026 people lived here once.',
    'the mark is brighter when you walk.',
    'do you remember any of it? the life before?',
    'i\u2019m glad i came.',
    'the sickness is thick here. stay close.',
    'look \u2014 was that a bird? i haven\u2019t seen one outside the haven.',
    'what do you think the wardens felt? at the end?'
  ]

};
