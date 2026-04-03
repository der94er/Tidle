/* ============================================================
   THE LAST EMBER — wilds.js
   Phase 4: The Wilds — 20×20 grid map, movement, exploration,
   memories, Sunken Sanctum, two endings.
   All values, tile counts, and texts from DESIGN.md.
   Pure vanilla JS — no jQuery.
   ============================================================ */

var Wilds = {

  name: 'the wilds',
  tab:   null,
  panel: null,

  _descEl:    null,
  _logEl:     null,
  _actionsEl: null,
  _mapEl:     null,
  _carryEl:   null,

  /* GDD §9 */
  MAP_W:     20,
  MAP_H:     20,
  START_X:   10,
  START_Y:   10,
  MAX_CARRY: 20,

  /* GDD §9 — sick land flavor pool (exact text from DESIGN.md §9) */
  SICK_FLAVOR: [
    'black soil. nothing grows.',
    'a dead river. the water is dark and still.',
    'cracked earth. the sickness runs deep here.',
    'the wind tastes of ash.',
    'a farmstead. abandoned. the walls are stained black.',
    'bones of livestock. scattered.',
    'a well. the water is foul.',
    'a road. leading nowhere now.',
    'the silence is heavy.',
    'a stone marker. the name worn away.',
    'a cart, overturned. whatever it carried is long gone.',
    'the mark dims here. this place is far gone.',
    'a bird circles overhead. the only living thing for miles.',
    'an orchard. dead. the fruit turned to black husks.',
    'the sickness pulses in the soil. like a heartbeat.'
  ],

  /* GDD §11 — memory texts in sequence (#1 is in grave.js; 21-25 in sanctum) */
  MEMORIES: [
    null, /* 0: unused */
    null, /* 1: grave.js */
    'a forge. your forge. the smell of iron and coal. your hands knew this work.',
    'a village. your village. stone houses. a market square. it was real, once.',
    'a journal. \u2018the mark chose me forty winters ago. i held the sickness back. the land lived. but i\u2019m tired.\u2019',
    'a council. faces you should know. a woman speaks: \u2018the land is dying. the pact must be renewed.\u2019',
    'scratched into a wall: \u2018the mark-bearer before me lasted thirty years. they found her in the field, smiling. empty.\u2019',
    'the woman from the ring. your wife. her name is\u2026 almost there. almost.',
    'another camp. better built than the first. tools, beds, a garden gone wild. they had a good life. for a while.',
    'a child. yours. laughing. reaching for your hand. the memory cuts like a blade.',
    'the grove hums. the mark responds. this place is old. the first mark-bearer tended it.',
    'the council again. silence. then a chair scrapes. you stood up. \u2018i\u2019ll do it.\u2019',
    'in the den, a carved stone. names. hundreds of them. mark-bearers. going back centuries.',
    'this bearer kept records. \u2018the mark takes memory so the bearer doesn\u2019t suffer. a mercy. the last mercy.\u2019',
    'your wife\u2019s face. clear now. Aelith. her name was Aelith.',
    'the ritual chamber. you walked down the steps. Aelith held your hand. \u2018i\u2019ll be here when you wake.\u2019 you both knew.',
    'this bearer\u2019s journal ends mid-sentence. \u2018i can feel myself fading. the land is taking me. it\u2019s not unpleasant. it\u2019s\u2014\u2019',
    'the herbs. the table. the straps \u2014 not cruel, just careful. you closed your eyes.',
    'in the creature\u2019s nest: a human jawbone. old. the mark\u2019s sigil etched into the teeth. a bearer who didn\u2019t survive.',
    'the trees here are enormous. ancient. the first sacred grove. the pact was made here, a thousand years ago.',
    'the burning. the mark searing into your palm. you screamed. then silence. then dirt. then nothing.',
    /* 21-25: Sunken Sanctum rooms */
    'these steps. you walked them. willingly. the stone remembers your footsteps.',
    'the preparation chamber. Aelith\u2019s tears on the stone. still here, after all this time.',
    'the wall of names. yours is at the bottom. the last space. there will be no more after you.',
    'the ritual circle. the runes. the grave above. this is where you became the last ember.',
    'you remember everything. your name. Aelith. your child. your choice. the mark is the land\u2019s last thread. you are the needle.'
  ],

  /* GDD §9 — pre-designed map (sparse; rest is sick land)
     Haven at (10,10). Sanctum at (19,19). */
  MAP_LAYOUT: {
    '10,10': 'haven',
    /* Sacred groves (3) */
    '3,3':   'grove',  '16,4':  'grove',  '8,17':  'grove',
    /* Warden camps (5) */
    '2,2':   'warden', '17,3':  'warden', '5,15':  'warden',
    '14,16': 'warden', '10,6':  'warden',
    /* Ruins (10) */
    '5,2':   'ruin',   '12,1':  'ruin',   '4,7':   'ruin',
    '7,12':  'ruin',   '15,8':  'ruin',   '3,18':  'ruin',
    '13,14': 'ruin',   '18,10': 'ruin',   '9,4':   'ruin',
    '16,19': 'ruin',
    /* Creature dens (5) */
    '6,6':   'den',    '14,5':  'den',    '2,14':  'den',
    '18,15': 'den',    '11,18': 'den',
    /* Sunken Sanctum (1) */
    '19,19': 'sanctum'
  },

  /* Dead forest tiles (30) */
  MAP_FOREST: [
    '1,0','4,0','8,0','15,0','18,0','0,3','11,3','0,7','19,5',
    '7,8','13,6','1,10','19,10','6,11','16,11','0,13','18,13',
    '4,14','12,15','7,16','1,17','15,17','19,17','0,18','6,18',
    '13,18','4,19','9,19','14,19','17,19'
  ],

  /* Resource cache tiles (15) */
  MAP_CACHE: [
    '7,1','16,2','1,5','12,6','17,8','3,9','8,9','15,10',
    '1,11','13,11','6,13','18,12','4,16','9,16','16,17'
  ],

  /* GDD §11 — MEMORIES index given at each visit-order of each tile type */
  RUIN_MEMORIES:   [2, 3, 5, 7, 9, 11, 14, 15, 17, 20],
  WARDEN_MEMORIES: [4, 8, 13, 16],
  GROVE_MEMORIES:  [10, 19],
  DEN_MEMORIES:    [12, 18],
  CACHE_MEMORY:    6,

  /* GDD §10 — enemy definitions */
  ENEMIES: {
    fox:      { name: 'blighted fox',       hp: 15,  atk: 3,  def: 0, loot: { wood:  [1, 3] } },
    crawler:  { name: 'root crawler',       hp: 30,  atk: 5,  def: 2, loot: { stone: [1, 4] } },
    shade:    { name: 'sickness shade',     hp: 50,  atk: 8,  def: 3, loot: { herbs: [1, 3], markFragments: [0, 1] } },
    guardian: { name: 'corrupted guardian', hp: 80,  atk: 10, def: 6, loot: { iron:  [2, 5] } },
    blight:   { name: 'the Blight Heart',   hp: 150, atk: 12, def: 5, loot: {} }
  },

  /* GDD §10 — mark-reaction flavor */
  MARK_REACTION: {
    crawler:  'the root crawler pauses. stares at your palm. reaches toward the glow.',
    shade:    'for a moment, the shade\u2019s keening sounds almost like weeping.',
    guardian: 'the guardian\u2019s stone eyes focus on the mark. it hesitates. then the sickness takes hold again.'
  },

  /* GDD §3 Phase 5 — sanctum room definitions */
  SANCTUM_ROOMS: [
    { desc: 'stone steps descend. older than the kingdom. older than memory.',              memory: 21, enemy: 'guardian' },
    { desc: 'a table. straps. herbs for sleeping. this is where they put you under.',       memory: 22, enemy: 'guardian' },
    { desc: 'names carved into the walls. hundreds. each one a mark-bearer.',               memory: 23, enemy: 'guardian' },
    { desc: 'a circle. runes. the grave above is directly overhead.',                       memory: 24, enemy: 'guardian' },
    { desc: 'below the ritual chamber. a cavern. vast. the land\u2019s heart. a web of roots and stone and old, old light. it\u2019s dying. the sickness is here too. eating at the roots. the mark on your palm burns so bright it hurts.', memory: 25, enemy: 'blight' }
  ],

  /* --- Module lifecycle --- */

  init: function() {
    if (Wilds.tab) return;

    Wilds.tab = Header.addLocation('the wilds', 'wilds', Wilds);
    Wilds.tab.style.display = 'none'; /* hidden until watchtower built */

    Wilds.panel = document.createElement('div');
    Wilds.panel.id        = 'wildsPanel';
    Wilds.panel.className = 'location';
    document.getElementById('locationSlider').appendChild(Wilds.panel);

    var layout = document.createElement('div');
    layout.className = 'wilds-layout';
    Wilds.panel.appendChild(layout);

    /* ── Left: main column ── */
    var main = document.createElement('div');
    main.className = 'wilds-main';
    layout.appendChild(main);

    Wilds._descEl = document.createElement('div');
    Wilds._descEl.className = 'tile-coord';
    main.appendChild(Wilds._descEl);

    Wilds._logEl = document.createElement('div');
    Wilds._logEl.className = 'log';
    main.appendChild(Wilds._logEl);

    Wilds._actionsEl = document.createElement('div');
    Wilds._actionsEl.className = 'actions';
    main.appendChild(Wilds._actionsEl);

    Wilds._carryEl = document.createElement('div');
    Wilds._carryEl.className = 'carry-display';
    main.appendChild(Wilds._carryEl);

    /* ── Right: mini-map column ── */
    var right = document.createElement('div');
    right.className = 'wilds-right';
    layout.appendChild(right);

    var mapLbl = document.createElement('div');
    mapLbl.className   = 'section-header';
    mapLbl.textContent = 'map';
    right.appendChild(mapLbl);

    Wilds._mapEl = document.createElement('div');
    Wilds._mapEl.className = 'mini-map';
    right.appendChild(Wilds._mapEl);

    Engine.updateSlider();
    Dispatch('stateUpdate').subscribe(Wilds._onStateUpdate);
  },

  onArrival: function(diff) {
    if ($SM.get('game.player.x') === undefined) {
      $SM.set('game.player.x',       Wilds.START_X, true);
      $SM.set('game.player.y',       Wilds.START_Y, true);
      $SM.set('game.player.health',  100,           true);
      $SM.set('game.player.wounded', false,          true);
      $SM.set('game.carry',          {},             true);
      Wilds._setExplored(Wilds.START_X, Wilds.START_Y);
    }

    Wilds._renderMiniMap();
    Wilds._showCurrentTile();
    Wilds._buildActions();
    Wilds._renderCarry();
  },

  /* Called by engine.js and haven.js when watchtower is built */
  unlock: function() {
    if (Wilds.tab) Wilds.tab.style.display = '';
  },

  /* ----------------------------------------------------------------
     Map helpers
  ---------------------------------------------------------------- */

  _getTile: function(x, y) {
    if (x < 0 || x >= Wilds.MAP_W || y < 0 || y >= Wilds.MAP_H) return 'wall';
    var key = x + ',' + y;
    if (Wilds.MAP_LAYOUT[key])                return Wilds.MAP_LAYOUT[key];
    if (Wilds.MAP_FOREST.indexOf(key) !== -1) return 'forest';
    if (Wilds.MAP_CACHE.indexOf(key)  !== -1) return 'cache';
    return 'sick';
  },

  _key: function(x, y) { return x + ',' + y; },

  _isExplored: function(x, y) {
    return !!($SM.get('game.map.explored') || {})[Wilds._key(x, y)];
  },
  _setExplored: function(x, y) {
    var e = $SM.get('game.map.explored') || {};
    e[Wilds._key(x, y)] = true;
    $SM.set('game.map.explored', e, true);
  },
  _isCleared: function(x, y) {
    return !!($SM.get('game.map.cleared') || {})[Wilds._key(x, y)];
  },
  _setCleared: function(x, y) {
    var c = $SM.get('game.map.cleared') || {};
    c[Wilds._key(x, y)] = true;
    $SM.set('game.map.cleared', c, true);
  },
  _isGathered: function(x, y) {
    return !!($SM.get('game.map.gathered') || {})[Wilds._key(x, y)];
  },
  _setGathered: function(x, y) {
    var g = $SM.get('game.map.gathered') || {};
    g[Wilds._key(x, y)] = true;
    $SM.set('game.map.gathered', g, true);
  },

  /* ----------------------------------------------------------------
     Movement (GDD §9)
  ---------------------------------------------------------------- */

  _move: function(dx, dy) {
    if ($SM.get('game.combat.active')) return;

    var x  = $SM.get('game.player.x', true);
    var y  = $SM.get('game.player.y', true);
    var nx = x + dx;
    var ny = y + dy;

    if (nx < 0 || nx >= Wilds.MAP_W || ny < 0 || ny >= Wilds.MAP_H) return;

    /* Moving onto haven tile = return */
    if (nx === Wilds.START_X && ny === Wilds.START_Y) {
      Wilds._returnToHaven();
      return;
    }

    /* GDD §10: cannot explore while wounded */
    if ($SM.get('game.player.wounded')) {
      Wilds._addLog('you are wounded. return to haven to recover.');
      return;
    }

    /* GDD §9: costs 1 food per tile */
    if ($SM.get('stores.food', true) < 1) {
      Wilds._addLog('no food. cannot move.');
      return;
    }

    /* GDD §18: torch required for unexplored tiles */
    var explored   = Wilds._isExplored(nx, ny);
    var hasLantern = !!$SM.get('game.inventory.markLantern');
    if (!explored && !hasLantern) {
      var t  = $SM.get('game.inventory.torches',           true) || 0;
      var rt = $SM.get('game.inventory.reinforcedTorches', true) || 0;
      if (t < 1 && rt < 1) {
        Wilds._addLog('no torch. cannot enter unexplored territory.');
        return;
      }
      if (t > 0) {
        $SM.add('game.inventory.torches', -1, true);
      } else {
        $SM.add('game.inventory.reinforcedTorches', -1, true);
      }
    }

    $SM.add('stores.food', -1, true);
    $SM.set('game.player.x', nx, true);
    $SM.set('game.player.y', ny, true);
    Wilds._setExplored(nx, ny);
    $SM.set('playStats.tilesExplored', ($SM.get('playStats.tilesExplored') || 0) + 1, true);

    Wilds._logEl.innerHTML = '';
    Wilds._renderMiniMap();
    Wilds._showCurrentTile();
    Wilds._renderCarry();
    $SM.fireUpdate('game', true);
  },

  /* ----------------------------------------------------------------
     Tile arrival effects
  ---------------------------------------------------------------- */

  _showCurrentTile: function() {
    var x    = $SM.get('game.player.x', true);
    var y    = $SM.get('game.player.y', true);
    var tile = Wilds._getTile(x, y);

    if (Wilds._descEl) Wilds._descEl.textContent = x + ', ' + y;

    switch (tile) {

      case 'haven':
        Wilds._addLog('the haven. the mark is strong here.');
        break;

      case 'sick':
        Wilds._addLog(Wilds.SICK_FLAVOR[Math.floor(Math.random() * Wilds.SICK_FLAVOR.length)]);
        /* GDD §10: rare blighted fox on sick land */
        if (!Wilds._isCleared(x, y) && Math.random() < 0.08) {
          Engine.setTimeout(function() { Wilds._triggerCombat(x, y, 'fox', null); }, 600);
          return;
        }
        break;

      case 'forest':
        Wilds._addLog('dead trees. brittle and grey.');
        if (!Wilds._isGathered(x, y)) {
          Wilds._addLog('enough wood here to be worth taking.');
        } else {
          Wilds._addLog('already stripped. nothing left.');
        }
        break;

      case 'cache':
        if (!Wilds._isGathered(x, y)) {
          Wilds._addLog('something left behind. supplies. weathered but intact.');
          if (!$SM.get('game.map.cacheMemoryFound')) {
            $SM.set('game.map.cacheMemoryFound', true, true);
            Wilds._triggerMemory(Wilds.CACHE_MEMORY, 800);
          }
        } else {
          Wilds._addLog('an empty cache. already taken.');
        }
        break;

      case 'ruin':
        Wilds._addLog('ruins. old stone. the sickness has been here a long time.');
        if (!Wilds._isCleared(x, y)) {
          if (Math.random() < 0.6) {
            Engine.setTimeout(function() { Wilds._triggerCombat(x, y, 'crawler', 'ruin'); }, 600);
            return;
          }
          Wilds._setCleared(x, y);
          Wilds._triggerRuinMemory();
        } else {
          Wilds._addLog('you have been here before.');
        }
        break;

      case 'warden':
        Wilds._addLog('a camp. old. someone lived here, kept the sickness back.');
        if (!Wilds._isCleared(x, y)) {
          if (Math.random() < 0.4) {
            Engine.setTimeout(function() { Wilds._triggerCombat(x, y, 'crawler', 'warden'); }, 600);
            return;
          }
          Wilds._setCleared(x, y);
          Wilds._triggerWardenMemory();
        } else {
          Wilds._addLog('the camp is quiet. already searched.');
        }
        break;

      case 'den':
        Wilds._addLog('something lives here. the sickness is thick.');
        if (!Wilds._isCleared(x, y)) {
          Engine.setTimeout(function() { Wilds._triggerCombat(x, y, 'shade', 'den'); }, 600);
          return;
        }
        Wilds._addLog('the den is empty. you cleared it already.');
        break;

      case 'grove':
        Wilds._addLog('the land remembers being healthy here.');
        if (!Wilds._isCleared(x, y)) {
          Wilds._setCleared(x, y);
          $SM.set('game.player.health',  100,   true);
          $SM.set('game.player.wounded', false,  true);
          Wilds._addLog('the mark pulses. your wounds close. the sickness retreats.');
          Wilds._triggerGroveMemory();
        } else {
          Wilds._addLog('the grove is peaceful. the mark rests here.');
        }
        break;

      case 'sanctum':
        var found = ($SM.get('game.memories.found') || []).length;
        if (found < 15) {
          /* GDD §18 exact text */
          Wilds._addLog('the mark is dim here. not enough remembered. not yet.');
        } else if (!$SM.get('game.sanctum.complete')) {
          Wilds._addLog('the mark burns white. it recognises this place.');
          Engine.setTimeout(function() {
            Wilds._addLog('follow the mark.', 'timestamp');
            Wilds._buildActions();
          }, 1200);
          return;
        } else {
          Wilds._addLog('the sanctum. the choice was made here.');
        }
        break;
    }

    Wilds._buildActions();
  },

  /* ----------------------------------------------------------------
     Memory triggers (GDD §11)
  ---------------------------------------------------------------- */

  _triggerMemory: function(idx, delay) {
    var text = Wilds.MEMORIES[idx];
    if (!text) return;
    var found = $SM.get('game.memories.found') || [];
    if (found.indexOf(idx) !== -1) return;
    found.push(idx);
    $SM.set('game.memories.found', found,        true);
    $SM.set('game.memories.count', found.length, true);
    $SM.set('playStats.memories',  found.length, true);

    Engine.setTimeout(function() {
      var overlay = document.getElementById('markVisionOverlay');
      if (overlay) {
        overlay.classList.add('active');
        Engine.setTimeout(function() { overlay.classList.remove('active'); }, 3000);
      }
      Wilds._addLog(text, 'memory');
    }, delay || 0);
  },

  _triggerRuinMemory: function() {
    var n = ($SM.get('game.map.ruinCount') || 0) + 1;
    $SM.set('game.map.ruinCount', n, true);
    var idx = Wilds.RUIN_MEMORIES[n - 1];
    if (idx) Wilds._triggerMemory(idx, 800);
  },
  _triggerWardenMemory: function() {
    var n = ($SM.get('game.map.wardenCount') || 0) + 1;
    $SM.set('game.map.wardenCount', n, true);
    var idx = Wilds.WARDEN_MEMORIES[n - 1];
    if (idx) Wilds._triggerMemory(idx, 800);
  },
  _triggerGroveMemory: function() {
    var n = ($SM.get('game.map.groveCount') || 0) + 1;
    $SM.set('game.map.groveCount', n, true);
    var idx = Wilds.GROVE_MEMORIES[n - 1];
    if (idx) Wilds._triggerMemory(idx, 1200);
  },
  _triggerDenMemory: function() {
    var n = ($SM.get('game.map.denCount') || 0) + 1;
    $SM.set('game.map.denCount', n, true);
    var idx = Wilds.DEN_MEMORIES[n - 1];
    if (idx) Wilds._triggerMemory(idx, 800);
  },

  /* ----------------------------------------------------------------
     Combat trigger (GDD §10)
  ---------------------------------------------------------------- */

  _triggerCombat: function(x, y, enemyKey, afterType) {
    var base    = Wilds.ENEMIES[enemyKey];
    var isNight = $SM.get('game.isNight') || false;
    var enemy   = {
      key:  enemyKey,
      name: base.name,
      hp:   isNight ? Math.ceil(base.hp  * 1.25) : base.hp,
      atk:  isNight ? Math.ceil(base.atk * 1.25) : base.atk,
      def:  isNight ? Math.ceil(base.def * 1.25) : base.def,
      loot: base.loot
    };

    /* GDD §10 — mark reaction flavor */
    if (Wilds.MARK_REACTION[enemyKey]) {
      Wilds._addLog(Wilds.MARK_REACTION[enemyKey], 'timestamp');
    } else {
      Wilds._addLog('the sick earth shifts. something rises.');
    }

    Engine.setTimeout(function() {
      Combat.start(enemy, x, y, afterType, function(won) {
        if (won) {
          Wilds._setCleared(x, y);
          if (afterType === 'ruin')   Wilds._triggerRuinMemory();
          if (afterType === 'warden') Wilds._triggerWardenMemory();
          if (afterType === 'den')    Wilds._triggerDenMemory();
          Wilds._buildActions();
        } else {
          Wilds._returnToHaven();
        }
      });
    }, 800);
  },

  /* ----------------------------------------------------------------
     Actions
  ---------------------------------------------------------------- */

  _buildActions: function() {
    if (!Wilds._actionsEl) return;
    Wilds._actionsEl.innerHTML = '';

    if ($SM.get('game.combat.active')) return;

    var x    = $SM.get('game.player.x', true);
    var y    = $SM.get('game.player.y', true);
    var tile = Wilds._getTile(x, y);

    var food       = $SM.get('stores.food', true);
    var torches    = ($SM.get('game.inventory.torches',           true) || 0) +
                     ($SM.get('game.inventory.reinforcedTorches', true) || 0);
    var hasLantern = !!$SM.get('game.inventory.markLantern');
    var wounded    = !!$SM.get('game.player.wounded');

    /* Movement buttons */
    var dirs = [
      { label: 'north', dx: 0,  dy: -1 },
      { label: 'south', dx: 0,  dy:  1 },
      { label: 'west',  dx: -1, dy:  0 },
      { label: 'east',  dx:  1, dy:  0 }
    ];

    dirs.forEach(function(d) {
      var nx = x + d.dx;
      var ny = y + d.dy;
      if (nx < 0 || nx >= Wilds.MAP_W || ny < 0 || ny >= Wilds.MAP_H) return;

      var btn = document.createElement('button');
      btn.className   = 'action-btn visible';
      btn.textContent = d.label;

      var isHaven  = (nx === Wilds.START_X && ny === Wilds.START_Y);
      var explored = Wilds._isExplored(nx, ny) || isHaven;
      var canMove  = !wounded && food >= 1 && (explored || hasLantern || torches > 0);
      btn.disabled = !canMove;

      if (explored && !isHaven) {
        var adj = Wilds._getTile(nx, ny);
        if (adj !== 'sick') btn.title = adj;
      }

      btn.addEventListener('click', function() { if (!btn.disabled) Wilds._move(d.dx, d.dy); });
      Wilds._actionsEl.appendChild(btn);
    });

    /* Gather — forest or cache */
    if ((tile === 'forest' || tile === 'cache') && !Wilds._isGathered(x, y)) {
      var gBtn = document.createElement('button');
      gBtn.className   = 'action-btn visible';
      gBtn.textContent = tile === 'forest' ? 'gather wood' : 'search cache';
      gBtn.disabled    = Wilds._getCarryTotal() >= Wilds.MAX_CARRY;
      gBtn.addEventListener('click', function() { Wilds._gatherTile(x, y, tile); });
      Wilds._actionsEl.appendChild(gBtn);
    }

    /* Sanctum enter */
    if (tile === 'sanctum') {
      var memFound = ($SM.get('game.memories.found') || []).length;
      if (memFound >= 15 && !$SM.get('game.sanctum.complete')) {
        var enterBtn = document.createElement('button');
        enterBtn.className   = 'action-btn visible';
        enterBtn.textContent = 'follow the mark';
        enterBtn.addEventListener('click', function() { Wilds._enterSanctum(); });
        Wilds._actionsEl.appendChild(enterBtn);
      }
    }

    /* Return to haven — always available (GDD §9) */
    var retBtn = document.createElement('button');
    retBtn.className   = 'action-btn visible';
    retBtn.textContent = 'return to haven';
    retBtn.addEventListener('click', function() { Wilds._returnToHaven(); });
    Wilds._actionsEl.appendChild(retBtn);
  },

  /* ----------------------------------------------------------------
     Gathering (GDD §9)
  ---------------------------------------------------------------- */

  _gatherTile: function(x, y, type) {
    var space = Wilds.MAX_CARRY - Wilds._getCarryTotal();
    if (space <= 0) { Wilds._addLog('carrying too much. return to haven first.'); return; }

    var carry = $SM.get('game.carry') || {};

    if (type === 'forest') {
      /* GDD §9: 5-10 wood */
      var amt = Math.min(5 + Math.floor(Math.random() * 6), space);
      carry.wood = (carry.wood || 0) + amt;
      Wilds._addLog(amt + ' wood gathered.');
    } else {
      /* GDD §9: 10-20 of random resource */
      var res  = ['wood','stone','iron','cloth','herbs','food'][Math.floor(Math.random() * 6)];
      var cAmt = Math.min(10 + Math.floor(Math.random() * 11), space);
      carry[res] = (carry[res] || 0) + cAmt;
      Wilds._addLog(cAmt + ' ' + res + ' found in the cache.');
    }

    $SM.set('game.carry', carry, true);
    Wilds._setGathered(x, y);
    Wilds._renderCarry();
    Wilds._buildActions();
  },

  _getCarryTotal: function() {
    var carry = $SM.get('game.carry') || {};
    return Object.keys(carry).reduce(function(s, r) { return s + (carry[r] || 0); }, 0);
  },

  /* GDD §9: return to haven — instant, no cost; deposit carry; restore health */
  _returnToHaven: function() {
    var carry = $SM.get('game.carry') || {};
    var cap   = $SM.get('game.buildings.storehouse') ? 100 : 50;

    Object.keys(carry).forEach(function(r) {
      if ((carry[r] || 0) > 0) {
        if ($SM.get('stores.' + r) === undefined) $SM.set('stores.' + r, 0, true);
        var cur = $SM.get('stores.' + r, true);
        var add = Math.min(carry[r], cap - cur);
        if (add > 0) $SM.add('stores.' + r, add, true);
      }
    });
    $SM.set('game.carry',          {},    true);
    $SM.set('game.player.health',  100,   true);
    $SM.set('game.player.wounded', false, true);
    $SM.set('game.player.x',       Wilds.START_X, true);
    $SM.set('game.player.y',       Wilds.START_Y, true);

    Engine.travelTo(Haven);
  },

  /* ----------------------------------------------------------------
     Sunken Sanctum (GDD §3 Phase 5)
  ---------------------------------------------------------------- */

  _enterSanctum: function() {
    $SM.set('game.sanctum.entered', true, true);
    Wilds._sanctumRoom(0);
  },

  _sanctumRoom: function(roomIdx) {
    if (roomIdx >= Wilds.SANCTUM_ROOMS.length) {
      Wilds._sanctumComplete();
      return;
    }

    $SM.set('game.sanctum.room', roomIdx, true);
    var room = Wilds.SANCTUM_ROOMS[roomIdx];

    Wilds._logEl.innerHTML    = '';
    Wilds._actionsEl.innerHTML = '';
    Wilds._addLog(room.desc);

    /* GDD §10: mark lantern required for final room */
    if (roomIdx === 4 && !$SM.get('game.inventory.markLantern')) {
      Wilds._addLog('the darkness is absolute. the sickness is too thick. you cannot see.');
      var retBtn = document.createElement('button');
      retBtn.className   = 'action-btn visible';
      retBtn.textContent = 'retreat';
      retBtn.addEventListener('click', function() { Wilds._returnToHaven(); });
      Wilds._actionsEl.appendChild(retBtn);
      return;
    }

    Wilds._triggerMemory(room.memory, 800);

    Engine.setTimeout(function() {
      var base    = Wilds.ENEMIES[room.enemy];
      var isNight = $SM.get('game.isNight') || false;
      var enemy   = {
        key:  room.enemy,
        name: base.name,
        hp:   isNight ? Math.ceil(base.hp  * 1.25) : base.hp,
        atk:  isNight ? Math.ceil(base.atk * 1.25) : base.atk,
        def:  isNight ? Math.ceil(base.def * 1.25) : base.def,
        loot: base.loot
      };

      /* GDD §18: Blight Heart keeps damage between attempts */
      if (room.enemy === 'blight') {
        var saved = $SM.get('game.sanctum.blightHp');
        if (saved && saved < enemy.hp) enemy.hp = saved;
      }

      var x = $SM.get('game.player.x', true);
      var y = $SM.get('game.player.y', true);

      Combat.start(enemy, x, y, 'sanctum', function(won) {
        if (won) {
          if (room.enemy === 'blight') $SM.remove('game.sanctum.blightHp', true);
          Wilds._sanctumRoom(roomIdx + 1);
        } else {
          if (room.enemy === 'blight') {
            $SM.set('game.sanctum.blightHp', $SM.get('game.combat.lastEnemyHp') || 1, true);
          }
          Wilds._returnToHaven();
        }
      });
    }, 1800);
  },

  _sanctumComplete: function() {
    $SM.set('game.sanctum.complete', true, true);
    Wilds._logEl.innerHTML    = '';
    Wilds._actionsEl.innerHTML = '';
    Wilds._addLog('two paths.');

    Engine.setTimeout(function() {
      /* GDD §3 Phase 5 — the choice */
      var sealBtn = document.createElement('button');
      sealBtn.className   = 'action-btn visible';
      sealBtn.textContent = 'seal yourself to the land';
      sealBtn.addEventListener('click', function() { Wilds._ending('seal'); });

      var breakBtn = document.createElement('button');
      breakBtn.className   = 'action-btn visible';
      breakBtn.textContent = 'break the cycle';
      breakBtn.addEventListener('click', function() { Wilds._ending('break'); });

      Wilds._actionsEl.appendChild(sealBtn);
      Wilds._actionsEl.appendChild(breakBtn);
    }, 1500);
  },

  /* GDD §3 Phase 5 — exact ending texts */
  _ending: function(choice) {
    $SM.set('game.ending',          choice,             true);
    $SM.set('playStats.sealEnding', choice === 'seal' ? 1 : 0, true);

    Wilds._actionsEl.innerHTML = '';
    Wilds._logEl.innerHTML     = '';

    var name  = $SM.get('game.playerName') || 'the mark-bearer';
    var texts = choice === 'seal' ? [
      name + ' pressed their palm to the Heart.',
      'the mark flows out of you and into the roots. warmth spreads. the sickness screams and withers.',
      'the land heals. the haven thrives.',
      'you feel yourself dissolving. becoming root. becoming stone. becoming the land itself.',
      'your people will live. you will not.',
      'but the cycle continues. someday, another will volunteer.',
      'another will forget. another will wake in a grave.'
    ] : [
      name + ' closed their fist.',
      'the mark cracks. shatters.',
      'light erupts \u2014 the spirits of every mark-bearer, freed at last.',
      'hundreds of them. they rise through the stone and are gone.',
      'the Heart dims. does not die. but weakens.',
      'the land must heal on its own now. slowly. with no guarantee.',
      'you walk out of the sanctum. you remember your name.',
      'the haven is still there. the people are still there.',
      'whether it\u2019s enough \u2014 you\u2019ll find out together.'
    ];

    var delay = 0;
    texts.forEach(function(t) {
      delay += 2500;
      Engine.setTimeout(function() { Wilds._addLog(t); }, delay);
    });
    Engine.setTimeout(Wilds._showScore, delay + 3000);
  },

  /* Score stub — Phase F */
  _showScore: function() {
    var btn = document.createElement('button');
    btn.className   = 'action-btn visible';
    btn.textContent = 'play again';
    btn.addEventListener('click', function() { Engine.confirmRestart(); });
    Wilds._actionsEl.innerHTML = '';
    Wilds._actionsEl.appendChild(btn);
  },

  /* ----------------------------------------------------------------
     Mini-map (GDD §9: fog of war, explored tiles visible)
  ---------------------------------------------------------------- */

  _renderMiniMap: function() {
    if (!Wilds._mapEl) return;
    Wilds._mapEl.innerHTML = '';

    var px   = $SM.get('game.player.x', true);
    var py   = $SM.get('game.player.y', true);
    var VIEW = 4;
    var SIZE = VIEW * 2 + 1; /* 9×9 */

    var CHARS  = { sick:'\u00b7', forest:'f', cache:'c', ruin:'r', warden:'w', den:'d', grove:'g', sanctum:'x', haven:'h' };
    var COLORS = {
      sick:'var(--text-secondary)', forest:'var(--nature-sage)', cache:'var(--mark-amber)',
      ruin:'var(--text-primary)',   warden:'var(--text-primary)', den:'var(--sickness)',
      grove:'var(--nature-sage)',   sanctum:'var(--mark-glow)',   haven:'var(--mark-amber)'
    };

    for (var row = 0; row < SIZE; row++) {
      for (var col = 0; col < SIZE; col++) {
        var wx   = px - VIEW + col;
        var wy   = py - VIEW + row;
        var cell = document.createElement('div');
        cell.className = 'map-cell';

        if (wx === px && wy === py) {
          cell.textContent = '@';
          cell.style.color = 'var(--mark-amber)';
        } else if (wx < 0 || wx >= Wilds.MAP_W || wy < 0 || wy >= Wilds.MAP_H) {
          cell.textContent = ' ';
        } else if (Wilds._isExplored(wx, wy)) {
          var t = Wilds._getTile(wx, wy);
          cell.textContent = CHARS[t]  || '\u00b7';
          cell.style.color = COLORS[t] || 'var(--text-secondary)';
        } else {
          var adj = Math.abs(wx - px) <= 1 && Math.abs(wy - py) <= 1;
          cell.textContent = adj ? '?' : ' ';
          cell.style.color = 'var(--border)';
        }
        Wilds._mapEl.appendChild(cell);
      }
    }
    Wilds._mapEl.style.gridTemplateColumns = 'repeat(' + SIZE + ', 1fr)';
  },

  /* ----------------------------------------------------------------
     Carry display
  ---------------------------------------------------------------- */

  _renderCarry: function() {
    if (!Wilds._carryEl) return;
    Wilds._carryEl.innerHTML = '';
    var carry = $SM.get('game.carry') || {};
    var total = Wilds._getCarryTotal();
    if (total === 0) return;

    var hdr = document.createElement('div');
    hdr.className   = 'section-header';
    hdr.textContent = 'carrying (' + total + '/' + Wilds.MAX_CARRY + ')';
    Wilds._carryEl.appendChild(hdr);

    Object.keys(carry).forEach(function(r) {
      if (!carry[r]) return;
      var row = document.createElement('div');
      row.className = 'store-row';
      var lbl = document.createElement('span'); lbl.className = 'store-label'; lbl.textContent = r;
      var cnt = document.createElement('span'); cnt.className = 'store-count'; cnt.textContent = carry[r];
      row.appendChild(lbl); row.appendChild(cnt);
      Wilds._carryEl.appendChild(row);
    });
  },

  /* ----------------------------------------------------------------
     Log
  ---------------------------------------------------------------- */

  _addLog: function(text, type) {
    if (!Wilds._logEl) return;
    var el = document.createElement('div');
    el.className = 'narrative';
    if (type === 'timestamp') el.classList.add('timestamp');
    if (type === 'memory')    el.classList.add('memory');
    el.textContent = text;
    Wilds._logEl.appendChild(el);
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        el.classList.add('visible');
        Wilds._logEl.scrollTop = Wilds._logEl.scrollHeight;
      });
    });
  },

  /* ----------------------------------------------------------------
     State update
  ---------------------------------------------------------------- */

  _onStateUpdate: function(e) {
    if (e.category === 'game' && Wilds.tab) {
      if ($SM.get('game.buildings.watchtower')) Wilds.tab.style.display = '';
    }
  }

};
