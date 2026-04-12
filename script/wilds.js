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

  _descEl:       null,
  _logEl:        null,
  _actionsEl:    null,
  _mapEl:        null,
  _carryEl:      null,
  _havenStatusEl: null,
  _idleTimer:    null,

  /* GDD §9 */
  MAP_W:     12,
  MAP_H:     12,
  START_X:   6,
  START_Y:   6,
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
     Haven at (6,6). Sanctum at (11,11). */
  MAP_LAYOUT: {
    '6,6':   'haven',
    /* Sacred groves (3) */
    '1,1':   'grove',   '10,2':  'grove',   '2,10':  'grove',
    /* Warden camps (5) */
    '3,0':   'warden',  '9,1':   'warden',  '0,7':   'warden',
    '8,9':   'warden',  '4,11':  'warden',
    /* Ruins (10) */
    '5,0':   'ruin',    '11,0':  'ruin',    '0,3':   'ruin',
    '7,2':   'ruin',    '2,4':   'ruin',    '10,4':  'ruin',
    '4,6':   'ruin',    '0,10':  'ruin',    '8,10':  'ruin',    '9,8':   'ruin',
    /* Creature dens (5) */
    '4,2':   'den',     '8,4':   'den',     '1,8':   'den',
    '7,5':   'den',     '3,9':   'den',
    /* Sunken Sanctum (1) */
    '11,11': 'sanctum',
    /* Final Overhaul §6: environmental hazard tiles */
    '3,4':  'chasm',   '8,7':  'chasm',
    '5,2':  'fog',     '6,8':  'fog',
    '3,6':  'bridge',  '10,9': 'bridge',
    '2,6':  'thorns',  '7,10': 'thorns'
  },

  /* Dead forest tiles (15) */
  MAP_FOREST: [
    '0,0','2,0','8,0','11,1','1,3','6,2','11,4','5,7',
    '0,6','11,7','0,11','6,10','5,11','10,11','11,9'
  ],

  /* Resource cache tiles (15) */
  MAP_CACHE: [
    '2,1','6,1','9,3','1,5','5,4','3,7','9,5','10,6',
    '2,9','7,8','5,9','1,11','7,11','10,10','4,4'
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

    Wilds._havenStatusEl = document.createElement('div');
    Wilds._havenStatusEl.className = 'haven-status-bar';
    main.appendChild(Wilds._havenStatusEl);

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

    /* Final Overhaul §4: legend removed — player learns by discovering */

    Engine.updateSlider();
    Dispatch('stateUpdate').subscribe(Wilds._onStateUpdate);
  },

  onArrival: function(diff) {
    /* Section 12: companion travels with player into wilds */
    if ($SM.get('game.companion.alive') && !$SM.get('game.companion.present')) {
      $SM.set('game.companion.present', true,  true);
      $SM.set('game.companion.movesSinceComment', 0, true);
    }

    if ($SM.get('game.player.x') === undefined) {
      $SM.set('game.player.x',       Wilds.START_X, true);
      $SM.set('game.player.y',       Wilds.START_Y, true);
      $SM.set('game.player.health',  100,           true);
      $SM.set('game.player.wounded', false,          true);
      $SM.set('game.carry',          {},             true);
      Wilds._setExplored(Wilds.START_X, Wilds.START_Y);
    }

    /* FIX 1: show loadout screen before departing; skip if already on expedition */
    if (!$SM.get('game.wilds.onExpedition')) {
      Wilds._renderMiniMap();
      Wilds._updateHavenStatus();
      Wilds._showLoadout();
      return;
    }

    Wilds._renderMiniMap();
    Wilds._showCurrentTile();
    Wilds._buildActions();
    Wilds._renderCarry();
    Wilds._updateHavenStatus();

    /* Section 3: first wilds entry */
    Wilds._markReact('firstEntry', 'the mark dims slightly. it doesn\u2019t like being far from the fire.');
  },

  /* Called by engine.js and haven.js when watchtower is built */
  unlock: function() {
    if (Wilds.tab) Wilds.tab.style.display = '';
  },

  /* ----------------------------------------------------------------
     FIX 1: Expedition Loadout Screen
  ---------------------------------------------------------------- */

  _showLoadout: function() {
    if (!Wilds._logEl || !Wilds._actionsEl) return;

    Wilds._logEl.innerHTML    = '';
    Wilds._actionsEl.innerHTML = '';
    if (Wilds._carryEl) Wilds._carryEl.innerHTML = '';

    var hasSteel    = !!$SM.get('game.inventory.steelSword');
    var hasCrude    = !!$SM.get('game.inventory.crudeSword');
    var hasSteelAr  = !!$SM.get('game.inventory.steelArmor');
    var hasCrudeAr  = !!$SM.get('game.inventory.crudeArmor');
    var hasLantern  = !!$SM.get('game.inventory.markLantern');
    var torchCh     = $SM.get('game.inventory.torchCharges', true) || 0;

    var storeFood   = $SM.get('stores.food',              true) || 0;
    var invBandages = $SM.get('game.inventory.bandages',   true) || 0;
    var invTraps    = $SM.get('game.inventory.traps',      true) || 0;
    var invPoultice = $SM.get('game.inventory.poultice',   true) || 0;

    var hasCompanion = !!$SM.get('game.companion.alive');
    /* Section 16/27: 20 base + 10 with companion + any pack bonus from trader */
    var packBonus = $SM.get('game.player.packBonus') || 0;
    var packCap   = Wilds.MAX_CARRY + (hasCompanion ? 10 : 0) + packBonus;

    /* Mutable pack choices */
    var choices = {
      food:     Math.min(10, storeFood),
      bandages: 0,
      traps:    0,
      poultice: 0
    };

    function packTotal() {
      return choices.food + choices.bandages + choices.traps + choices.poultice;
    }

    var screen = document.createElement('div');
    screen.className = 'loadout-screen';

    /* Title */
    var title = document.createElement('div');
    title.className   = 'section-header';
    title.textContent = 'prepare for the wilds';
    screen.appendChild(title);

    /* Equipment (read-only) */
    var eqHdr = document.createElement('div');
    eqHdr.className   = 'loadout-label';
    eqHdr.textContent = 'equipment';
    screen.appendChild(eqHdr);

    /* §24.10: show durability in loadout */
    var weaponText = (hasSteel || hasCrude) ? (Combat.weaponLabel() || 'none \u2014 fists only') : 'none \u2014 fists only';
    var armorText  = (hasSteelAr || hasCrudeAr) ? (Combat.armorLabel() || 'none') : 'none';
    /* Section 23: torch is always the light source; lantern is a key item shown separately */
    var lightText  = torchCh > 0 ? 'torch \u2014 ' + torchCh + ' charges' : 'no light!';

    var eqPairs = [['weapon', weaponText], ['armor', armorText], ['light', lightText]];
    if (hasLantern) eqPairs.push(['mark lantern', 'carried']);

    eqPairs.forEach(function(pair) {
      var row = document.createElement('div');
      row.className = 'loadout-row';
      var lbl = document.createElement('span');
      lbl.className   = 'loadout-item-name';
      lbl.textContent = pair[0] + ':';
      var val = document.createElement('span');
      val.className   = 'loadout-item-value';
      val.textContent = pair[1];
      if (pair[0] === 'light' && torchCh <= 0) val.style.color = 'var(--sickness)';
      if (pair[0] === 'mark lantern') val.style.color = 'var(--mark-amber)';
      row.appendChild(lbl); row.appendChild(val);
      screen.appendChild(row);
    });

    /* Supplies (adjustable) */
    var supHdr = document.createElement('div');
    supHdr.className   = 'loadout-label';
    supHdr.textContent = 'supplies';
    screen.appendChild(supHdr);

    /* Pack counter */
    var packEl = document.createElement('div');
    packEl.className = 'loadout-pack';
    function updatePackEl() {
      var tot = packTotal();
      packEl.textContent = tot + ' / ' + packCap + ' pack slots';
      packEl.style.color = tot > packCap ? 'var(--sickness)' : 'var(--text-secondary)';
    }

    var setOutBtn; /* forward ref for enable/disable */

    function makeAdjRow(label, key, maxVal) {
      var row = document.createElement('div');
      row.className = 'loadout-row';

      var lbl = document.createElement('span');
      lbl.className   = 'loadout-item-name';
      lbl.textContent = label + ':';

      var minus = document.createElement('button');
      minus.className   = 'loadout-adjust';
      minus.textContent = '\u2212';

      var cnt = document.createElement('span');
      cnt.className   = 'loadout-count';
      cnt.textContent = String(choices[key]);

      var plus = document.createElement('button');
      plus.className   = 'loadout-adjust';
      plus.textContent = '+';

      minus.addEventListener('click', function() {
        if (choices[key] > 0) {
          choices[key]--;
          cnt.textContent = String(choices[key]);
          updatePackEl();
          if (setOutBtn) setOutBtn.disabled = packTotal() > packCap;
        }
      });
      plus.addEventListener('click', function() {
        if (choices[key] < maxVal && packTotal() < packCap) {
          choices[key]++;
          cnt.textContent = String(choices[key]);
          updatePackEl();
          if (setOutBtn) setOutBtn.disabled = packTotal() > packCap;
        }
      });

      if (maxVal === 0) {
        lbl.style.color  = 'var(--text-secondary)';
        minus.disabled   = true;
        plus.disabled    = true;
      }

      row.appendChild(lbl); row.appendChild(minus); row.appendChild(cnt); row.appendChild(plus);
      screen.appendChild(row);
    }

    makeAdjRow('food',     'food',     storeFood);
    makeAdjRow('bandages', 'bandages', invBandages);
    makeAdjRow('traps',    'traps',    invTraps);
    makeAdjRow('poultice', 'poultice', invPoultice);

    screen.appendChild(packEl);
    updatePackEl();

    /* Buttons */
    setOutBtn             = document.createElement('button');
    setOutBtn.className   = 'action-btn visible';
    setOutBtn.textContent = 'set out';
    setOutBtn.addEventListener('click', function() { Wilds._setOut(choices); });
    screen.appendChild(setOutBtn);

    var stayBtn             = document.createElement('button');
    stayBtn.className   = 'action-btn visible';
    stayBtn.textContent = 'stay';
    stayBtn.addEventListener('click', function() { Engine.travelTo(Haven); });
    screen.appendChild(stayBtn);

    Wilds._actionsEl.appendChild(screen);
  },

  _setOut: function(choices) {
    /* Remove items from stores/inventory */
    if (choices.food     > 0) $SM.add('stores.food',               -choices.food,     true);
    if (choices.bandages > 0) $SM.add('game.inventory.bandages',   -choices.bandages, true);
    if (choices.traps    > 0) $SM.add('game.inventory.traps',      -choices.traps,    true);
    if (choices.poultice > 0) $SM.add('game.inventory.poultice',   -choices.poultice, true);

    /* Put chosen items in carry */
    var carry = {};
    if (choices.food     > 0) carry.food     = choices.food;
    if (choices.bandages > 0) carry.bandages = choices.bandages;
    if (choices.traps    > 0) carry.traps    = choices.traps;
    if (choices.poultice > 0) carry.poultice = choices.poultice;
    $SM.set('game.carry', carry, true);

    /* Capture haven state for return summary */
    var depResources = ['wood','stone','iron','cloth','herbs','food'];
    var depTotal = depResources.reduce(function(sum, r) { return sum + ($SM.get('stores.' + r, true) || 0); }, 0);
    $SM.set('game.wildsDeparture', {
      fireLevel:  $SM.get('game.fire.level', true) || 0,
      popCount:   ($SM.get('game.population') || []).length,
      food:       $SM.get('stores.food', true) || 0,
      storeTotal: depTotal
    }, true);

    $SM.set('game.wilds.onExpedition', true, true);

    /* Clear loadout and show wilds */
    Wilds._logEl.innerHTML    = '';
    Wilds._actionsEl.innerHTML = '';
    if (Wilds._carryEl) Wilds._carryEl.innerHTML = '';

    Wilds._showCurrentTile();
    Wilds._buildActions();
    Wilds._renderCarry();
    Wilds._markReact('firstEntry', 'the mark dims slightly. it doesn\u2019t like being far from the fire.');
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
  /* Tracks which sick-land tiles already yielded their cloth find */
  _isSickClothFound: function(x, y) {
    return !!($SM.get('game.map.sickCloth') || {})[Wilds._key(x, y)];
  },
  _setSickClothFound: function(x, y) {
    var sc = $SM.get('game.map.sickCloth') || {};
    sc[Wilds._key(x, y)] = true;
    $SM.set('game.map.sickCloth', sc, true);
  },

  /* ----------------------------------------------------------------
     Movement (GDD §9)
  ---------------------------------------------------------------- */

  _move: function(dx, dy) {
    if (Wilds._idleTimer) { clearTimeout(Wilds._idleTimer); Wilds._idleTimer = null; }
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

    /* GDD §9: costs 1 food per tile (FIX 1: from carry) */
    if ((($SM.get('game.carry') || {}).food || 0) < 1) {
      Wilds._addLog('no food. cannot move.');
      return;
    }

    /* Section 23: torch always required for unexplored tiles.
       Mark lantern is a key item — it does NOT provide exploration light. */
    var explored = Wilds._isExplored(nx, ny);
    if (!explored) {
      var charges = $SM.get('game.inventory.torchCharges', true) || 0;
      if (charges < 1) {
        Wilds._addLog('no torch. cannot enter unexplored territory.');
        return;
      }
      $SM.add('game.inventory.torchCharges', -1, true);
    }

    /* FIX 1: food comes from carry, not stores */
    var _mvCarry = $SM.get('game.carry') || {};
    _mvCarry.food = Math.max(0, (_mvCarry.food || 0) - 1);
    $SM.set('game.carry', _mvCarry, true);
    $SM.set('game.player.x', nx, true);
    $SM.set('game.player.y', ny, true);
    Wilds._setExplored(nx, ny);
    $SM.set('playStats.tilesExplored', ($SM.get('playStats.tilesExplored') || 0) + 1, true);

    /* Final Overhaul §13: increment random-combat move counter */
    $SM.set('game.wilds.moveCounter', ($SM.get('game.wilds.moveCounter', true) || 0) + 1, true);

    /* Section 12: companion exploration comment */
    if ($SM.get('game.companion.alive') && $SM.get('game.companion.present')) {
      var moves = ($SM.get('game.companion.movesSinceComment') || 0) + 1;
      var threshold = 3 + Math.floor(Math.random() * 2);
      if (moves >= threshold) {
        $SM.set('game.companion.movesSinceComment', 0, true);
        var comments = Haven.COMPANION_COMMENTS || [];
        if (comments.length > 0) {
          var cmt   = comments[Math.floor(Math.random() * comments.length)];
          var cName = ($SM.get('game.companion.name') || 'your companion').toLowerCase();
          Engine.setTimeout(function() {
            Wilds._addLog(cName + ': \u2018' + cmt + '\u2019', 'timestamp');
          }, 800);
        }
      } else {
        $SM.set('game.companion.movesSinceComment', moves, true);
      }
    }

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

    /* coordinates removed — status bar handled by _buildActions via _renderStatusBar */

    switch (tile) {

      case 'haven':
        Wilds._addLog('the haven. the mark is strong here.');
        break;

      case 'sick':
        Wilds._addLog(Wilds.SICK_FLAVOR[Math.floor(Math.random() * Wilds.SICK_FLAVOR.length)]);
        /* Section 2E: breadcrumb hint toward adjacent unexplored POI */
        Wilds._showBreadcrumb(x, y);
        /* Final Overhaul §5: 30% micro-interaction on first visit */
        if (!Wilds._isCleared(x, y)) {
          var microMap = $SM.get('game.map.microEvent') || {};
          var microK   = Wilds._key(x, y);
          if (!microMap[microK] && Math.random() < 0.3) {
            microMap[microK] = true;
            $SM.set('game.map.microEvent', microMap, true);
            Engine.setTimeout(function() { Wilds._showMicroInteraction(x, y); }, 400);
            return;
          }
        }
        /* GDD §10: rare blighted fox on sick land */
        if (!Wilds._isCleared(x, y) && Math.random() < 0.08) {
          Engine.setTimeout(function() { Wilds._triggerCombat(x, y, 'fox', null); }, 600);
          return;
        }
        /* 20% chance to find 1-2 cloth on first visit — ruins of the fallen kingdom */
        if (!Wilds._isSickClothFound(x, y) && Math.random() < 0.2) {
          Wilds._setSickClothFound(x, y);
          var sickSpace = Wilds._getMaxCarry() - Wilds._getCarryTotal();
          if (sickSpace > 0) {
            var sickCarry = $SM.get('game.carry') || {};
            var sickCloth = Math.min(1 + Math.floor(Math.random() * 2), sickSpace);
            sickCarry.cloth = (sickCarry.cloth || 0) + sickCloth;
            $SM.set('game.carry', sickCarry, true);
            Wilds._addLog(sickCloth + ' cloth found in the ruins.', 'timestamp');
            Wilds._renderCarry();
          }
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
        Wilds._markReact('nearMemory', 'the mark warms. recognition.');
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
        Wilds._markReact('nearMemory', 'the mark warms. recognition.');
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

      /* Final Overhaul §6: environmental hazards */
      case 'chasm':
        if (Wilds._isCleared(x, y)) {
          Wilds._addLog('the chasm. you crossed it before.');
        } else {
          Wilds._addLog('a crack in the earth. wide. deep. the sickness oozes from below.');
          Wilds._showHazardChasm(x, y);
          return;
        }
        break;

      case 'fog':
        if (Wilds._isCleared(x, y)) {
          Wilds._addLog('the fog. you pushed through it before.');
        } else {
          Wilds._addLog('a low fog. thick. the mark dims in it.');
          Wilds._showHazardFog(x, y);
          return;
        }
        break;

      case 'bridge':
        if (Wilds._isCleared(x, y)) {
          Wilds._addLog('the collapsed bridge. you crossed it before.');
        } else {
          Wilds._addLog('a river of black water. a bridge, half-collapsed.');
          Wilds._showHazardBridge(x, y);
          return;
        }
        break;

      case 'thorns':
        if (Wilds._isCleared(x, y)) {
          Wilds._addLog('the thorn wall. a path through the ash.');
        } else {
          Wilds._addLog('twisted thorns. black. dense. they grew from the sickness.');
          Wilds._showHazardThorns(x, y);
          return;
        }
        break;

      case 'sanctum':
        Wilds._markReact('nearSanctum', 'the mark burns. it knows this place.');
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

    /* Final Overhaul §13: random combat every 3 moves (25% chance) on safe tiles */
    var _tile13 = Wilds._getTile(x, y);
    if (_tile13 === 'sick' || _tile13 === 'forest' || _tile13 === 'cache') {
      var _moves = $SM.get('game.wilds.moveCounter', true) || 0;
      if (_moves > 0 && _moves % 3 === 0 && Math.random() < 0.25) {
        var _dx   = x - Wilds.START_X;
        var _dy   = y - Wilds.START_Y;
        var _dist = Math.floor(Math.sqrt(_dx * _dx + _dy * _dy));
        var _eKey;
        if (_dist <= 3)      _eKey = 'fox';
        else if (_dist <= 6) _eKey = Math.random() < 0.5 ? 'fox' : 'crawler';
        else                 _eKey = Math.random() < 0.5 ? 'crawler' : 'shade';

        /* Section 23: check for trap — gives distance-based loot, single use */
        var _trapMap13 = $SM.get('game.map.traps') || {};
        var _tKey13    = Wilds._key(x, y);
        if (_trapMap13[_tKey13] && (_eKey === 'fox' || _eKey === 'crawler')) {
          delete _trapMap13[_tKey13];
          $SM.set('game.map.traps', _trapMap13, true);
          $SM.set('playStats.combatWins', ($SM.get('playStats.combatWins') || 0) + 1, true);
          /* Loot based on distance: ≤3 tiles = cloth (fox zone), 4+ tiles = wood (crawler zone) */
          var _trpRes = (_dist <= 3) ? 'cloth' : 'wood';
          var _trpAmt = 3 + Math.floor(Math.random() * 3); /* 3-5 */
          var _trpSpace = Wilds._getMaxCarry() - Wilds._getCarryTotal();
          var _trpTake  = Math.min(_trpAmt, _trpSpace);
          var _trpCarry = $SM.get('game.carry') || {};
          if (_trpTake > 0) {
            _trpCarry[_trpRes] = (_trpCarry[_trpRes] || 0) + _trpTake;
            $SM.set('game.carry', _trpCarry, true);
          }
          Wilds._addLog('the trap holds a ' + Wilds.ENEMIES[_eKey].name + '. its remains are salvageable.');
          if (_trpTake > 0) Wilds._addLog(_trpTake + ' ' + _trpRes + ' salvaged.', 'timestamp');
          Wilds._renderMiniMap();
          Wilds._renderCarry();
          /* fall through to _buildActions */
        } else {
          Engine.setTimeout(function() { Wilds._triggerCombat(x, y, _eKey, 'random'); }, 600);
          return;
        }
      }
    }

    Wilds._buildActions();

    /* Section 3: idle mark reaction (60s, repeatable) */
    if (Wilds._idleTimer) clearTimeout(Wilds._idleTimer);
    Wilds._idleTimer = Engine.setTimeout(function() {
      if (Engine.activeModule === Wilds && !$SM.get('game.combat.active')) {
        Wilds._addLog('the mark pulses. waiting.', 'timestamp');
      }
    }, 60000);
  },

  /* ----------------------------------------------------------------
     Final Overhaul §5: Micro-interactions on sick tiles
  ---------------------------------------------------------------- */

  MICRO_EVENTS: [
    {
      key: 'cart',
      desc: 'a collapsed cart. something underneath.',
      actions: [
        { label: 'search',   fn: '_microCart' },
        { label: 'move on',  fn: null }
      ]
    },
    {
      key: 'well',
      desc: 'an old well. the rope is frayed.',
      actions: [
        { label: 'lower a bucket', fn: '_microWell' },
        { label: 'move on',        fn: null }
      ]
    },
    {
      key: 'cellar',
      desc: 'a cellar door. sealed with rust.',
      actions: [
        { label: 'force it open', fn: '_microCellar' },
        { label: 'leave it',      fn: null }
      ]
    },
    {
      key: 'grave',
      desc: 'a grave marker. recent.',
      actions: [
        { label: 'pay respects', fn: '_microGrave' },
        { label: 'move on',      fn: null }
      ]
    }
  ],

  CART_FRAGMENTS: [
    'scratched into the cart: \u2018heading north. the mark-bearer will protect us.\u2019',
    'a doll. small. left behind in haste.',
    'a merchant\u2019s ledger. the last entry is a prayer.',
    'dried flowers, pressed between stones. someone remembered beauty.',
    'a map. crude. the ink has bled. but a circle \u2014 here. where you stand.'
  ],

  _showMicroInteraction: function(x, y) {
    var ev = Wilds.MICRO_EVENTS[Math.floor(Math.random() * Wilds.MICRO_EVENTS.length)];
    Wilds._addLog(ev.desc, 'timestamp');
    Wilds._actionsEl.innerHTML = '';
    ev.actions.forEach(function(act) {
      var btn = document.createElement('button');
      btn.className   = 'action-btn visible';
      btn.textContent = act.label;
      btn.addEventListener('click', function() {
        Wilds._actionsEl.innerHTML = '';
        if (act.fn) {
          Wilds[act.fn](x, y);
        } else {
          Wilds._buildActions();
        }
      });
      Wilds._actionsEl.appendChild(btn);
    });
  },

  _microCart: function(x, y) {
    var roll = Math.random();
    if (roll < 0.6) {
      var resources = ['wood', 'stone', 'herbs', 'cloth'];
      var r = resources[Math.floor(Math.random() * resources.length)];
      var amt = 2 + Math.floor(Math.random() * 3); /* 2-4 */
      var space = Wilds._getMaxCarry() - Wilds._getCarryTotal();
      amt = Math.min(amt, space);
      if (amt > 0) {
        var carry = $SM.get('game.carry') || {};
        carry[r] = (carry[r] || 0) + amt;
        $SM.set('game.carry', carry, true);
        Wilds._addLog(amt + ' ' + r + ' found in the rubble.', 'timestamp');
        Wilds._renderCarry();
      }
    } else if (roll < 0.9) {
      Wilds._addLog('rubble. nothing useful.', 'timestamp');
    } else {
      var frag = Wilds.CART_FRAGMENTS[Math.floor(Math.random() * Wilds.CART_FRAGMENTS.length)];
      Wilds._addLog(frag, 'memory');
    }
    Wilds._buildActions();
  },

  _microWell: function(x, y) {
    var roll = Math.random();
    if (roll < 0.5) {
      var amt = 3 + Math.floor(Math.random() * 3); /* 3-5 herbs */
      var space = Wilds._getMaxCarry() - Wilds._getCarryTotal();
      amt = Math.min(amt, space);
      if (amt > 0) {
        var carry = $SM.get('game.carry') || {};
        carry.herbs = (carry.herbs || 0) + amt;
        $SM.set('game.carry', carry, true);
        Wilds._addLog(amt + ' herbs found. the water nourishes.', 'timestamp');
        Wilds._renderCarry();
      }
    } else if (roll < 0.8) {
      Wilds._addLog('the rope gives way. the bucket is gone.', 'timestamp');
    } else {
      var space2 = Wilds._getMaxCarry() - Wilds._getCarryTotal();
      if (space2 > 0) {
        var carry2 = $SM.get('game.carry') || {};
        carry2.cloth = (carry2.cloth || 0) + 1;
        $SM.set('game.carry', carry2, true);
        Wilds._addLog('1 cloth. a rag caught on the stones. still usable.', 'timestamp');
        Wilds._renderCarry();
      }
    }
    Wilds._buildActions();
  },

  _microCellar: function(x, y) {
    var roll = Math.random();
    if (roll < 0.4) {
      var amt = 5 + Math.floor(Math.random() * 4); /* 5-8 food; goes to carry */
      var _space = Wilds._getMaxCarry() - Wilds._getCarryTotal();
      var _take = Math.min(amt, _space);
      if (_take > 0) {
        var _celf = $SM.get('game.carry') || {};
        _celf.food = (_celf.food || 0) + _take;
        $SM.set('game.carry', _celf, true);
        Wilds._addLog(_take + ' food. preserved stores.', 'timestamp');
        Wilds._renderCarry();
      } else {
        Wilds._addLog('food. no room to carry it.', 'timestamp');
      }
    } else if (roll < 0.8) {
      var amt2 = 2 + Math.floor(Math.random() * 3); /* 2-4 iron */
      var space = Wilds._getMaxCarry() - Wilds._getCarryTotal();
      amt2 = Math.min(amt2, space);
      if (amt2 > 0) {
        var carry = $SM.get('game.carry') || {};
        carry.iron = (carry.iron || 0) + amt2;
        $SM.set('game.carry', carry, true);
        Wilds._addLog(amt2 + ' iron. old tools.', 'timestamp');
        Wilds._renderCarry();
      }
    } else {
      /* Ambush: blighted fox, no flee */
      Engine.setTimeout(function() { Wilds._triggerCombat(x, y, 'fox', 'ambush'); }, 400);
      return;
    }
    Wilds._buildActions();
  },

  _microGrave: function(x, y) {
    Wilds._addLog('you kneel. the mark flickers. recognition.', 'timestamp');
    Wilds._addLog('this one carried the mark too. a long time ago.', 'timestamp');
    $SM.set('playStats.graveRespects', ($SM.get('playStats.graveRespects') || 0) + 1, true);
    Wilds._buildActions();
  },

  /* ----------------------------------------------------------------
     Final Overhaul §6: Environmental hazard handlers
  ---------------------------------------------------------------- */

  _showHazardChasm: function(x, y) {
    Wilds._actionsEl.innerHTML = '';
    var food = ($SM.get('game.carry') || {}).food || 0; /* FIX 1 */

    function makeBtn(label, fn) {
      var btn = document.createElement('button');
      btn.className   = 'action-btn visible';
      btn.textContent = label;
      btn.addEventListener('click', function() {
        Wilds._actionsEl.innerHTML = '';
        fn();
      });
      Wilds._actionsEl.appendChild(btn);
    }

    makeBtn('cross on the fallen tree', function() {
      /* Safe, costs 2 extra food (from carry) */
      if (food >= 2) { var _cc1 = $SM.get('game.carry')||{}; _cc1.food=Math.max(0,(_cc1.food||0)-2); $SM.set('game.carry',_cc1,true); }
      Wilds._setCleared(x, y);
      Wilds._addLog('you edge across the tree. slow. careful.', 'timestamp');
      Wilds._buildActions();
    });

    makeBtn('jump', function() {
      if (Math.random() < 0.7) {
        Wilds._setCleared(x, y);
        Wilds._addLog('you clear it. the mark flares.', 'timestamp');
      } else {
        $SM.set('game.player.health', Math.max(1, ($SM.get('game.player.health', true) || 100) - 20), true);
        Wilds._setCleared(x, y);
        Wilds._addLog('you slip. the mark catches you. you land hard. \u221220 health.', 'timestamp');
      }
      Wilds._buildActions();
    });

    makeBtn('go around', function() {
      if (food >= 2) { var _cc2 = $SM.get('game.carry')||{}; _cc2.food=Math.max(0,(_cc2.food||0)-2); $SM.set('game.carry',_cc2,true); }
      Wilds._setCleared(x, y);
      Wilds._addLog('a long way around. but you make it.', 'timestamp');
      Wilds._buildActions();
    });
  },

  _showHazardFog: function(x, y) {
    Wilds._actionsEl.innerHTML = '';
    var torches    = $SM.get('game.inventory.torchCharges', true) || 0;
    var hasLantern = !!$SM.get('game.inventory.markLantern');
    var food       = ($SM.get('game.carry') || {}).food || 0; /* FIX 1 */

    function makeBtn(label, disabled, fn) {
      var btn = document.createElement('button');
      btn.className   = 'action-btn visible';
      btn.textContent = label;
      btn.disabled    = !!disabled;
      btn.addEventListener('click', function() {
        if (btn.disabled) return;
        Wilds._actionsEl.innerHTML = '';
        fn();
      });
      Wilds._actionsEl.appendChild(btn);
    }

    /* §19: fog costs 3 torch charges (0 with mark lantern) */
    var hasLanternFog = !!$SM.get('game.inventory.markLantern');
    makeBtn(
      hasLanternFog ? 'push through (lantern lights the way)' : 'push through (3 torch charges)',
      !hasLanternFog && torches < 3,
      function() {
        if (!hasLanternFog) $SM.add('game.inventory.torchCharges', -3, true);
        Wilds._setCleared(x, y);
        Wilds._addLog('you push through the fog. disoriented but unharmed.', 'timestamp');
        /* FIX 3: fog corrodes 1 iron from pack */
        var _fogCarry = $SM.get('game.carry') || {};
        if ((_fogCarry.iron || 0) > 0) {
          _fogCarry.iron = _fogCarry.iron - 1;
          $SM.set('game.carry', _fogCarry, true);
          Wilds._addLog('the fog eats at the metal. iron corrodes.', 'timestamp');
          Wilds._renderCarry();
        }
        Wilds._buildActions();
      }
    );

    makeBtn('wait for it to pass', false, function() {
      if (food >= 1) { var _fc3 = $SM.get('game.carry')||{}; _fc3.food=Math.max(0,(_fc3.food||0)-1); $SM.set('game.carry',_fc3,true); }
      Wilds._setCleared(x, y);
      Wilds._addLog('you wait. the fog lifts. the path is clear.', 'timestamp');
      Wilds._buildActions();
    });

    makeBtn('find another way', false, function() {
      if (food >= 2) { var _fc4 = $SM.get('game.carry')||{}; _fc4.food=Math.max(0,(_fc4.food||0)-2); $SM.set('game.carry',_fc4,true); }
      Wilds._setCleared(x, y);
      Wilds._addLog('a longer route. you avoid the fog.', 'timestamp');
      Wilds._buildActions();
    });
  },

  _showHazardBridge: function(x, y) {
    Wilds._actionsEl.innerHTML = '';
    var health = $SM.get('game.player.health', true) || 100;
    var food   = ($SM.get('game.carry') || {}).food || 0; /* FIX 1 */

    function makeBtn(label, fn) {
      var btn = document.createElement('button');
      btn.className   = 'action-btn visible';
      btn.textContent = label;
      btn.addEventListener('click', function() {
        Wilds._actionsEl.innerHTML = '';
        fn();
      });
      Wilds._actionsEl.appendChild(btn);
    }

    makeBtn('climb across the ruins', function() {
      if (Math.random() < 0.8) {
        Wilds._setCleared(x, y);
        /* 50% chance 2 iron from bridge bolts */
        if (Math.random() < 0.5) {
          var space = Wilds._getMaxCarry() - Wilds._getCarryTotal();
          var amt   = Math.min(2, space);
          if (amt > 0) {
            var carry = $SM.get('game.carry') || {};
            carry.iron = (carry.iron || 0) + amt;
            $SM.set('game.carry', carry, true);
            Wilds._addLog('the bridge holds. ' + amt + ' iron bolts salvaged.', 'timestamp');
            Wilds._renderCarry();
          } else {
            Wilds._addLog('the bridge holds.', 'timestamp');
          }
        } else {
          Wilds._addLog('the bridge holds.', 'timestamp');
        }
      } else {
        /* Fail: -10 health, lose 3 random resources */
        $SM.set('game.player.health', Math.max(1, health - 10), true);
        Wilds._setCleared(x, y);
        var carry2 = $SM.get('game.carry') || {};
        var lost = 0;
        var rKeys = Object.keys(carry2).filter(function(r) { return carry2[r] > 0; });
        for (var i = 0; i < 3 && rKeys.length > 0; i++) {
          var idx2 = Math.floor(Math.random() * rKeys.length);
          carry2[rKeys[idx2]] = Math.max(0, carry2[rKeys[idx2]] - 1);
          if (carry2[rKeys[idx2]] === 0) rKeys.splice(idx2, 1);
          lost++;
        }
        $SM.set('game.carry', carry2, true);
        Wilds._addLog('a plank gives. you fall. \u221210 health.', 'timestamp');
        if (lost > 0) Wilds._addLog(lost + ' resource' + (lost > 1 ? 's' : '') + ' lost in the water.', 'timestamp');
        Wilds._renderCarry();
      }
      Wilds._buildActions();
    });

    makeBtn('wade through', function() {
      $SM.set('game.player.health', Math.max(1, health - 5), true);
      Wilds._setCleared(x, y);
      Wilds._addLog('the black water burns. but you cross. \u22125 health.', 'timestamp');
      Wilds._buildActions();
    });

    makeBtn('search for a crossing', function() {
      if (food >= 2) { var _bc1 = $SM.get('game.carry')||{}; _bc1.food=Math.max(0,(_bc1.food||0)-2); $SM.set('game.carry',_bc1,true); }
      Wilds._setCleared(x, y);
      Wilds._addLog('you find a shallow point upstream. you cross safely.', 'timestamp');
      Wilds._buildActions();
    });
  },

  _showHazardThorns: function(x, y) {
    Wilds._actionsEl.innerHTML = '';
    var hasSword   = !!$SM.get('game.inventory.steelSword') || !!$SM.get('game.inventory.crudeSword');
    var torches    = $SM.get('game.inventory.torchCharges', true) || 0;
    var hasLantern = !!$SM.get('game.inventory.markLantern');
    var food       = ($SM.get('game.carry') || {}).food || 0; /* FIX 1 */

    function makeBtn(label, disabled, fn) {
      var btn = document.createElement('button');
      btn.className   = 'action-btn visible';
      btn.textContent = label;
      btn.disabled    = !!disabled;
      btn.addEventListener('click', function() {
        if (btn.disabled) return;
        Wilds._actionsEl.innerHTML = '';
        fn();
      });
      Wilds._actionsEl.appendChild(btn);
    }

    makeBtn('cut through', !hasSword, function() {
      if (food >= 1) { var _tc1 = $SM.get('game.carry')||{}; _tc1.food=Math.max(0,(_tc1.food||0)-1); $SM.set('game.carry',_tc1,true); }
      Wilds._setCleared(x, y);
      Wilds._addLog('you hack through the thorns. the mark steadies you.', 'timestamp');
      Wilds._buildActions();
    });

    /* Section 23: torch required regardless of lantern */
    makeBtn(
      'burn through (3 torch charges)',
      torches < 3,
      function() {
        $SM.add('game.inventory.torchCharges', -3, true);
        Wilds._setCleared(x, y);
        Wilds._addLog('the thorns burn. the mark flares as they die.', 'timestamp');
        Wilds._buildActions();
      }
    );

    makeBtn('go around', false, function() {
      if (food >= 2) { var _tc2 = $SM.get('game.carry')||{}; _tc2.food=Math.max(0,(_tc2.food||0)-2); $SM.set('game.carry',_tc2,true); }
      Wilds._setCleared(x, y);
      Wilds._addLog('a long detour. but you pass.', 'timestamp');
      Wilds._buildActions();
    });
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
    /* Section 3: Aelith mark reaction */
    if (idx === 7 || idx === 14) {
      Wilds._markReact('aelith', 'the mark aches. a deep, old ache.');
    }

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
      Combat.start(enemy, x, y, afterType, function(won, fled) {
        if (afterType === 'random') {
          /* Random encounter — tile not cleared; player stays regardless */
          if (!won && !fled) Wilds._returnToHaven();
          else Wilds._buildActions();
        } else if (won) {
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

  _renderStatusBar: function() {
    if (!Wilds._descEl) return;

    var torchCharges    = $SM.get('game.inventory.torchCharges',    true) || 0;
    var torchMaxCharges = $SM.get('game.inventory.torchMaxCharges', true) || 0;
    var hasLantern      = !!$SM.get('game.inventory.markLantern');
    var carryObj        = $SM.get('game.carry') || {};
    var food            = carryObj.food    || 0; /* FIX 1: food from carry */
    var bandagesCarried = carryObj.bandages || 0;
    var carry           = Wilds._getCarryTotal();

    Wilds._descEl.innerHTML = '';

    /* Section 23: torch is always the light source; lantern shown separately as key item */
    var torchSpan = document.createElement('span');
    if (torchCharges <= 0 && torchMaxCharges <= 0) {
      torchSpan.textContent = 'no torch. darkness ahead.';
      torchSpan.style.color = 'var(--sickness)';
    } else {
      var torchLabel = document.createTextNode('torch: ');
      var torchNum   = document.createElement('span');
      torchNum.textContent = torchCharges + '/' + torchMaxCharges;
      if (torchCharges <= 3) torchNum.style.color = 'var(--sickness)';
      torchSpan.appendChild(torchLabel);
      torchSpan.appendChild(torchNum);
    }

    /* Food segment */
    var foodSpan = document.createElement('span');
    if (food <= 0) {
      foodSpan.textContent = 'no food. turn back.';
      foodSpan.style.color = 'var(--sickness)';
    } else {
      var foodLabel = document.createTextNode('food: ');
      var foodNum   = document.createElement('span');
      foodNum.textContent = food;
      if (food <= 3) foodNum.style.color = 'var(--sickness)';
      foodSpan.appendChild(foodLabel);
      foodSpan.appendChild(foodNum);
    }

    /* Pack segment */
    var packSpan = document.createElement('span');
    packSpan.textContent = 'pack: ' + carry + '/' + Wilds._getMaxCarry();

    Wilds._descEl.appendChild(torchSpan);
    Wilds._descEl.appendChild(document.createTextNode(' \u2502 '));
    Wilds._descEl.appendChild(foodSpan);
    Wilds._descEl.appendChild(document.createTextNode(' \u2502 '));
    Wilds._descEl.appendChild(packSpan);

    if (bandagesCarried > 0) {
      var bandageSpan = document.createElement('span');
      var bNum = document.createElement('span');
      bNum.textContent = bandagesCarried;
      if (bandagesCarried <= 3) bNum.style.color = 'var(--sickness)';
      bandageSpan.appendChild(document.createTextNode(' \u2502 bandages: '));
      bandageSpan.appendChild(bNum);
      Wilds._descEl.appendChild(bandageSpan);
    }

    /* Section 23: show mark lantern as a separate key item (not a light source) */
    if (hasLantern) {
      var lanternSpan = document.createElement('span');
      lanternSpan.textContent = ' \u2502 mark lantern: carried';
      lanternSpan.style.color = 'var(--mark-amber)';
      Wilds._descEl.appendChild(lanternSpan);
    }

    /* §24.10: show weapon/armor durability in status bar */
    var wLabel = Combat.weaponLabel();
    if (wLabel) {
      var weapSpan = document.createElement('span');
      weapSpan.textContent = ' \u2502 ' + wLabel;
      Wilds._descEl.appendChild(weapSpan);
    }
    var aLabel = Combat.armorLabel();
    if (aLabel) {
      var armorSpan = document.createElement('span');
      armorSpan.textContent = ' \u2502 ' + aLabel;
      Wilds._descEl.appendChild(armorSpan);
    }
  },

  _buildActions: function() {
    if (!Wilds._actionsEl) return;
    Wilds._actionsEl.innerHTML = '';

    Wilds._renderStatusBar();

    if ($SM.get('game.combat.active')) return;

    var x    = $SM.get('game.player.x', true);
    var y    = $SM.get('game.player.y', true);
    var tile = Wilds._getTile(x, y);

    var _bActCarry = $SM.get('game.carry') || {};
    var food       = _bActCarry.food || 0; /* FIX 1: food from carry */
    var torches    = $SM.get('game.inventory.torchCharges', true) || 0;
    var hasLantern = !!$SM.get('game.inventory.markLantern');
    var wounded    = !!$SM.get('game.player.wounded');

    /* Movement buttons — rendered for all four directions including edges */
    var dirs = [
      { label: 'north', dx: 0,  dy: -1 },
      { label: 'south', dx: 0,  dy:  1 },
      { label: 'west',  dx: -1, dy:  0 },
      { label: 'east',  dx:  1, dy:  0 }
    ];

    dirs.forEach(function(d) {
      var nx = x + d.dx;
      var ny = y + d.dy;

      var btn = document.createElement('button');
      btn.className   = 'action-btn visible';
      btn.textContent = d.label;

      /* Edge of map — render disabled with tooltip */
      if (nx < 0 || nx >= Wilds.MAP_W || ny < 0 || ny >= Wilds.MAP_H) {
        btn.disabled = true;
        btn.title    = 'edge of the map';
        Wilds._actionsEl.appendChild(btn);
        return;
      }

      var isHaven  = (nx === Wilds.START_X && ny === Wilds.START_Y);
      var explored = Wilds._isExplored(nx, ny) || isHaven;
      /* Section 23: lantern does NOT bypass torch requirement for movement */
      var canMove  = !wounded && food >= 1 && (explored || torches > 0);
      btn.disabled = !canMove;

      if (!canMove) {
        /* Explain why the button is disabled */
        if (wounded)                        btn.title = 'you are wounded';
        else if (food < 1)                  btn.title = 'no food';
        else if (!explored && torches < 1)  btn.title = 'no torch';
      } else if (explored && !isHaven) {
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
      gBtn.disabled    = Wilds._getCarryTotal() >= Wilds._getMaxCarry();
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

    /* Section 21: use bandage — heals 10 HP; available any time in exploration */
    var _bandCnt = (_bActCarry.bandages || 0);
    var _curHp   = $SM.get('game.player.health', true) || 100;
    if (_bandCnt > 0 && _curHp < 100) {
      var bandBtn = document.createElement('button');
      bandBtn.className   = 'action-btn visible';
      bandBtn.textContent = 'use bandage (' + _bandCnt + ')';
      bandBtn.addEventListener('click', function() {
        var c = $SM.get('game.carry') || {};
        if ((c.bandages || 0) <= 0) return;
        c.bandages--;
        $SM.set('game.carry', c, true);
        var hp = $SM.get('game.player.health', true) || 0;
        var newHp = Math.min(100, hp + 10);
        $SM.set('game.player.health', newHp, true);
        Wilds._addLog('bandage applied. ' + newHp + ' / 100.', 'timestamp');
        Wilds._buildActions();
        Wilds._renderCarry();
      });
      Wilds._actionsEl.appendChild(bandBtn);
    }

    /* FIX 2: place trap on current tile (not haven) */
    var _trapsCnt  = (_bActCarry.traps || 0);
    var _trapMap   = $SM.get('game.map.traps') || {};
    var _tileKey   = Wilds._key(x, y);
    if (_trapsCnt > 0 && !_trapMap[_tileKey] && tile !== 'haven') {
      var trapBtn = document.createElement('button');
      trapBtn.className   = 'action-btn visible';
      trapBtn.textContent = 'place trap';
      trapBtn.addEventListener('click', function() {
        var c2 = $SM.get('game.carry') || {};
        if ((c2.traps || 0) <= 0) return;
        c2.traps--;
        $SM.set('game.carry', c2, true);
        var tm = $SM.get('game.map.traps') || {};
        tm[Wilds._key(x, y)] = true;
        $SM.set('game.map.traps', tm, true);
        Wilds._addLog('trap set.', 'timestamp');
        Wilds._renderMiniMap();
        Wilds._buildActions();
        Wilds._renderCarry();
      });
      Wilds._actionsEl.appendChild(trapBtn);
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
    var space = Wilds._getMaxCarry() - Wilds._getCarryTotal();
    if (space <= 0) { Wilds._addLog('carrying too much. return to haven first.'); return; }

    var carry = $SM.get('game.carry') || {};

    if (type === 'forest') {
      /* GDD §9: 5-10 wood */
      var amt = Math.min(5 + Math.floor(Math.random() * 6), space);
      carry.wood = (carry.wood || 0) + amt;
      Wilds._addLog(amt + ' wood gathered.');
      /* 20% chance to find 1-2 cloth among the ruins */
      var spaceLeft = Wilds._getMaxCarry() - Wilds._getCarryTotal() - amt;
      if (spaceLeft > 0 && Math.random() < 0.2) {
        var cloth = Math.min(1 + Math.floor(Math.random() * 2), spaceLeft);
        carry.cloth = (carry.cloth || 0) + cloth;
        Wilds._addLog(cloth + ' cloth found among the debris.', 'timestamp');
      }
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
    /* Section 1: use correct storage caps */
    var cap   = $SM.get('game.buildings.storehouse') ? Haven.STOREHOUSE_CAP : Haven.BASE_STORE_CAP;

    /* FIX 1: return inventory items (bandages/traps/poultice) to game.inventory */
    var INV_ITEMS = ['bandages', 'traps', 'poultice'];
    INV_ITEMS.forEach(function(item) {
      if ((carry[item] || 0) > 0) {
        var inv = $SM.get('game.inventory.' + item, true) || 0;
        $SM.set('game.inventory.' + item, inv + carry[item], true);
        delete carry[item];
      }
    });

    /* Deposit remaining resources (including food) to stores */
    var leftBehind = [];
    Object.keys(carry).forEach(function(r) {
      if ((carry[r] || 0) > 0) {
        if ($SM.get('stores.' + r) === undefined) $SM.set('stores.' + r, 0, true);
        var cur  = $SM.get('stores.' + r, true);
        var add  = Math.min(carry[r], cap - cur);
        var lost = carry[r] - add;
        if (add > 0) $SM.add('stores.' + r, add, true);
        /* Section 1: excess loot silently capped — show message per resource left behind */
        if (lost > 0) leftBehind.push(lost + ' ' + r);
      }
    });
    /* Show "left behind" messages after arrival */
    if (leftBehind.length > 0) {
      Engine.setTimeout(function() {
        leftBehind.forEach(function(msg) {
          Haven._addLog('no room in the stores. ' + msg + ' left behind.', 'timestamp');
        });
      }, 500);
    }
    $SM.set('game.carry',          {},    true);
    $SM.set('game.player.health',  100,   true);
    $SM.set('game.player.wounded', false, true);
    $SM.set('game.player.x',       Wilds.START_X, true);
    $SM.set('game.player.y',       Wilds.START_Y, true);

    /* §24: clear old medicine temporary HP bonus on haven return */
    if ($SM.get('game.player.medicineBonusActive')) {
      $SM.remove('game.player.bonusMaxHp',          true);
      $SM.remove('game.player.medicineBonusActive', true);
    }

    /* FIX 1: expedition ends on return */
    $SM.set('game.wilds.onExpedition', false, true);

    /* Final Overhaul §13: reset random-combat move counter on haven return */
    $SM.set('game.wilds.moveCounter', 0, true);

    /* Section 3: return to haven mark reaction */
    Wilds._markReact('returnHaven', 'the mark steadies. home.');

    /* Section 12: companion returns with player */
    if ($SM.get('game.companion.alive')) {
      $SM.set('game.companion.present', false, true);
    }

    /* Section 10: villager react to player returning */
    if (typeof Haven !== 'undefined') Engine.setTimeout(function() { Haven._villagerReact('return'); }, 800);

    /* §17: return summary */
    var dep      = $SM.get('game.wildsDeparture') || {};
    var curFire  = $SM.get('game.fire.level', true) || 0;
    var curPop   = ($SM.get('game.population') || []).length;
    var depFire  = dep.fireLevel  !== undefined ? dep.fireLevel  : curFire;
    var depPop   = dep.popCount   !== undefined ? dep.popCount   : curPop;
    var depStore = dep.storeTotal !== undefined ? dep.storeTotal : 0;
    var curResources = ['wood','stone','iron','cloth','herbs','food'];
    var curTotal = curResources.reduce(function(sum, r) { return sum + ($SM.get('stores.' + r, true) || 0); }, 0);
    var changes  = [];
    if (curFire < depFire) changes.push('the fire burned low.');
    if (curPop < depPop) {
      changes.push(depPop - curPop === 1 ? 'someone left. not enough food.' : (depPop - curPop) + ' people left. not enough food.');
    }
    /* Stores lighter from night attack (exclude normal food consumption from expedition) */
    if (depStore > 0 && curTotal < depStore - curPop /* subtract expected food consumption */) {
      changes.push('the stores are lighter.');
    }

    Engine.travelTo(Haven);

    /* Show summary after a short delay (Haven.onArrival runs synchronously above) */
    if (typeof Haven !== 'undefined') {
      Engine.setTimeout(function() {
        Haven._addLog('you return to the haven.');
        if (changes.length > 0) {
          changes.forEach(function(msg, i) {
            Engine.setTimeout(function() { Haven._addLog(msg, 'timestamp'); }, (i + 1) * 700);
          });
        } else {
          Engine.setTimeout(function() {
            Haven._addLog('the fire burns. the people are fed. all is well.', 'timestamp');
          }, 700);
        }
      }, 300);
    }

    $SM.set('game.wildsDeparture', null, true);
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

    /* Section 12: companion sanctum lines */
    if ($SM.get('game.companion.alive') && $SM.get('game.companion.present')) {
      var cSancName = ($SM.get('game.companion.name') || 'your companion').toLowerCase();
      if (roomIdx === 0) {
        Engine.setTimeout(function() {
          Wilds._addLog(cSancName + ' looks at the stone steps. \u2018this is it, isn\u2019t it.\u2019', 'timestamp');
        }, 1000);
      } else if (roomIdx === 4) {
        Engine.setTimeout(function() {
          Wilds._addLog(cSancName + ' reads your face. \u2018you remember. i can see it.\u2019', 'timestamp');
        }, 3500);
      }
    }

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

    /* GDD §11: room 5 (final) — show name input BEFORE starting blight combat */
    if (roomIdx === 4) {
      Wilds._triggerMemory(25, 800);
      Engine.setTimeout(function() {
        Memory.showNameInput(function() {
          Wilds._startBlightCombat();
        });
      }, 2500);
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

      var x = $SM.get('game.player.x', true);
      var y = $SM.get('game.player.y', true);

      Combat.start(enemy, x, y, 'sanctum', function(won) {
        if (won) {
          Wilds._sanctumRoom(roomIdx + 1);
        } else {
          Wilds._returnToHaven();
        }
      });
    }, 1800);
  },

  /* Starts Blight Heart combat — called after name input confirmed (GDD §11) */
  _startBlightCombat: function() {
    var base    = Wilds.ENEMIES['blight'];
    var isNight = $SM.get('game.isNight') || false;
    var enemy   = {
      key:  'blight',
      name: base.name,
      hp:   isNight ? Math.ceil(base.hp  * 1.25) : base.hp,
      atk:  isNight ? Math.ceil(base.atk * 1.25) : base.atk,
      def:  isNight ? Math.ceil(base.def * 1.25) : base.def,
      loot: base.loot
    };

    /* GDD §18: Blight Heart keeps damage across failed attempts */
    var saved = $SM.get('game.sanctum.blightHp');
    if (saved && saved < enemy.hp) enemy.hp = saved;

    var x = $SM.get('game.player.x', true);
    var y = $SM.get('game.player.y', true);

    Combat.start(enemy, x, y, 'sanctum', function(won) {
      if (won) {
        $SM.remove('game.sanctum.blightHp', true);
        Wilds._sanctumRoom(5); /* advances to _sanctumComplete */
      } else {
        $SM.set('game.sanctum.blightHp', $SM.get('game.combat.lastEnemyHp') || 1, true);
        Wilds._returnToHaven();
      }
    });
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
    var cEndCompanion    = $SM.get('game.companion');
    var cEndAlive        = cEndCompanion && !!cEndCompanion.alive;
    var cEndDied         = cEndCompanion && cEndCompanion.name && !cEndCompanion.alive;
    var cEndName         = cEndCompanion ? (cEndCompanion.name || '') : '';
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

    /* Section 12: companion ending lines */
    if (cEndAlive && choice === 'seal') {
      texts.push(cEndName.toLowerCase() + ' is the last face you see. they\u2019re crying. \u2018it\u2019s not fair,\u2019 they say. but they don\u2019t stop you.');
    } else if (cEndAlive && choice === 'break') {
      texts.push(cEndName.toLowerCase() + ' walks out of the sanctum beside you. the daylight hits your faces. \u2018what now?\u2019 they ask.');
    }
    if (cEndDied) {
      texts.push('you think of ' + cEndName.toLowerCase() + '. gone. because of you. because you let them come.');
    }

    var delay = 0;
    texts.forEach(function(t) {
      delay += 2500;
      Engine.setTimeout(function() { Wilds._addLog(t); }, delay);
    });
    Engine.setTimeout(Wilds._showScore, delay + 3000);
  },

  /* GDD §13 — show score screen via Leaderboard module */
  _showScore: function() {
    Leaderboard.show();
  },

  /* ----------------------------------------------------------------
     Mini-map (GDD §9: fog of war, explored tiles visible)
  ---------------------------------------------------------------- */

  _renderMiniMap: function() {
    if (!Wilds._mapEl) return;
    Wilds._mapEl.innerHTML = '';

    var px   = $SM.get('game.player.x', true);
    var py   = $SM.get('game.player.y', true);
    var VIEW = 5;
    var SIZE = VIEW * 2 + 1; /* 11×11 */

    /* GDD §2 colors; chars per design spec */
    var CHARS  = { sick:'\u00b7', forest:'f', cache:'$', ruin:'r', warden:'w', den:'c', grove:'g', sanctum:'s', haven:'H' };
    var COLORS = {
      sick:    'var(--border)',
      forest:  'var(--text-secondary)',
      cache:   'var(--mark-amber)',
      ruin:    'var(--memory-gold)',
      warden:  'var(--memory-gold)',
      den:     'var(--sickness)',
      grove:   'var(--nature-sage)',
      sanctum: 'var(--mark-glow)',
      haven:   'var(--nature-sage)'
    };

    var trapsMap     = $SM.get('game.map.traps') || {};
    var hasReinforced = !!$SM.get('game.inventory.hasReinforcedTorch');

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
        } else if (wx === 6 && wy === 6) {
          /* §15: haven H always visible */
          cell.textContent = 'H';
          cell.style.color = 'var(--nature-sage)';
        } else if (trapsMap[Wilds._key(wx, wy)] && Wilds._isExplored(wx, wy)) {
          /* FIX 2: trapped tile marker */
          cell.textContent = 't';
          cell.style.color = 'var(--mark-amber)';
        } else if (Wilds._isExplored(wx, wy)) {
          var t = Wilds._getTile(wx, wy);
          cell.textContent = CHARS[t]  || '\u00b7';
          cell.style.color = COLORS[t] || 'var(--border)';
        } else {
          /* Final Overhaul §4: adjacent non-sick unvisited tiles show as '?' */
          var adjToPlayer = (Math.abs(wx - px) + Math.abs(wy - py) === 1);
          var adjTile     = Wilds._getTile(wx, wy);
          if (adjToPlayer && adjTile !== 'sick') {
            /* FIX 2: reinforced torch reveals actual tile char */
            if (hasReinforced) {
              cell.textContent = CHARS[adjTile] || '?';
              cell.style.color = COLORS[adjTile] || 'var(--mark-amber)';
            } else {
              cell.textContent = '?';
              cell.style.color = 'var(--mark-amber)';
            }
          } else {
            cell.textContent = ' ';
          }
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
    hdr.textContent = 'carrying (' + total + '/' + Wilds._getMaxCarry() + ')';
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
    if (Wilds._havenStatusEl && Engine.activeModule === Wilds) {
      Wilds._updateHavenStatus();
    }
    if (e.category === 'game' && Wilds.tab) {
      if ($SM.get('game.buildings.watchtower')) Wilds.tab.style.display = '';
    }
  },

  /* Section 2F — haven status while exploring */
  _updateHavenStatus: function() {
    if (!Wilds._havenStatusEl) return;
    var level    = $SM.get('game.fire.level', true) || 0;
    var fireName = (Haven && Haven.FIRE_NAMES) ? (Haven.FIRE_NAMES[level] || 'mark only') : 'mark only';
    var pop      = $SM.get('game.population') || [];
    var food     = $SM.get('stores.food', true) || 0;
    var day      = $SM.get('game.day', true) || 0;
    var fedStr;
    if (pop.length === 0) {
      fedStr = 'no villagers';
    } else if (food >= pop.length) {
      fedStr = pop.length + ' fed';
    } else if (food === 0) {
      fedStr = pop.length + ' hungry';
    } else {
      fedStr = food + ' fed, ' + (pop.length - food) + ' hungry';
    }
    Wilds._havenStatusEl.textContent = 'haven: ' + fireName + ' | ' + fedStr + ' | day ' + day;
  },

  /* Section 2E — breadcrumb hints toward adjacent unexplored POIs */
  _showBreadcrumb: function(x, y) {
    var PRIORITY = ['sanctum','ruin','warden','den','grove','cache','forest'];
    var HINTS = {
      ruin:    'something catches your eye to the [dir]. worked stone.',
      den:     'the mark flickers. the air feels wrong to the [dir].',
      grove:   'a faint smell. green. alive. somewhere to the [dir].',
      warden:  'old footprints. someone lived nearby. to the [dir].',
      sanctum: 'the mark burns. something ancient lies to the [dir].',
      cache:   'scattered debris to the [dir]. could be useful.',
      forest:  'dead trunks to the [dir]. wood, at least.'
    };
    var dirs = [
      { dx: 0,  dy: -1, label: 'north' },
      { dx: 0,  dy:  1, label: 'south' },
      { dx: -1, dy:  0, label: 'west'  },
      { dx:  1, dy:  0, label: 'east'  }
    ];
    var best = null, bestDir = null, bestPri = 999;
    dirs.forEach(function(d) {
      var nx = x + d.dx, ny = y + d.dy;
      if (nx < 0 || nx >= Wilds.MAP_W || ny < 0 || ny >= Wilds.MAP_H) return;
      if (Wilds._isExplored(nx, ny)) return;
      var t   = Wilds._getTile(nx, ny);
      var pri = PRIORITY.indexOf(t);
      if (pri !== -1 && pri < bestPri) { bestPri = pri; best = t; bestDir = d.label; }
    });
    if (best && HINTS[best]) {
      var hint = HINTS[best].replace('[dir]', bestDir);
      Engine.setTimeout(function() { Wilds._addLog(hint, 'timestamp'); }, 400);
    }
  },

  /* Section 3: one-time mark ambient reactions */
  _markReact: function(key, text) {
    if (key !== 'idle' && $SM.get('game.markReactions.' + key)) return;
    if (key !== 'idle') $SM.set('game.markReactions.' + key, true, true);
    var logEl = Wilds._logEl;
    if (!logEl) return;
    var el = document.createElement('div');
    el.className = 'narrative timestamp';
    el.textContent = text;
    logEl.appendChild(el);
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        el.classList.add('visible');
        logEl.scrollTop = logEl.scrollHeight;
      });
    });
  },

  /* Section 12: companion carry bonus */
  _getMaxCarry: function() {
    var companionBonus = ($SM.get('game.companion.alive') && $SM.get('game.companion.present')) ? 10 : 0;
    /* Section 24: reinforced pack adds 5 slots permanently */
    var packBonus = $SM.get('game.player.packBonus') || 0;
    return Wilds.MAX_CARRY + companionBonus + packBonus;
  },

  /* Section 24: max HP with old medicine bonus */
  _getMaxHp: function() {
    return 100 + ($SM.get('game.player.bonusMaxHp') || 0);
  }

};
