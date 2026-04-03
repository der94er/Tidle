/* ============================================================
   THE LAST EMBER — haven.js
   Phase 2-3: The Haven — fire management, gathering, resources.
   All text, timings, and values from DESIGN.md.
   Pure vanilla JS — no jQuery.
   ============================================================ */

var Haven = {

  name: 'the haven',
  tab:   null,
  panel: null,

  _fireEl:    null,
  _logEl:     null,
  _storesEl:  null,
  _actionsEl: null,

  _timers: { gameDay: null, dayNight: null },

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

  /* --- Module lifecycle --- */

  init: function() {
    if (Haven.tab) return; /* already initialised */

    Haven.tab = Header.addLocation('the haven', 'haven', Haven);

    /* Outer panel */
    Haven.panel = document.createElement('div');
    Haven.panel.id = 'havenPanel';
    Haven.panel.className = 'location';
    document.getElementById('locationSlider').appendChild(Haven.panel);

    /* Two-column layout: main content + stores */
    var layout = document.createElement('div');
    layout.className = 'haven-layout';
    Haven.panel.appendChild(layout);

    /* ── Left: main column ── */
    var main = document.createElement('div');
    main.className = 'haven-main';
    layout.appendChild(main);

    /* Fire level status */
    Haven._fireEl = document.createElement('div');
    Haven._fireEl.id = 'havenFire';
    Haven._fireEl.className = 'fire-status';
    main.appendChild(Haven._fireEl);

    /* Narrative log */
    Haven._logEl = document.createElement('div');
    Haven._logEl.id = 'havenLog';
    Haven._logEl.className = 'log';
    main.appendChild(Haven._logEl);

    /* Action buttons */
    Haven._actionsEl = document.createElement('div');
    Haven._actionsEl.id = 'havenActions';
    Haven._actionsEl.className = 'actions';
    main.appendChild(Haven._actionsEl);

    /* ── Right: stores column ── */
    Haven._storesEl = document.createElement('div');
    Haven._storesEl.id = 'havenStores';
    Haven._storesEl.className = 'stores';
    layout.appendChild(Haven._storesEl);

    /* Pre-initialise wood and stone so they appear in stores immediately */
    if ($SM.get('stores.wood')  === undefined) $SM.set('stores.wood',  0, true);
    if ($SM.get('stores.stone') === undefined) $SM.set('stores.stone', 0, true);

    Engine.updateSlider();

    /* Subscribe to state changes for live store/fire updates */
    Dispatch('stateUpdate').subscribe(Haven._onStateUpdate);
  },

  onArrival: function(diff) {
    Haven._updateFireDisplay();
    Haven._updateStores();
    Haven._buildButtons();

    /* Phase 2 intro — show once on first arrival (GDD §3 Phase 2) */
    if (!$SM.get('game.haven.introShown')) {
      $SM.set('game.haven.introShown', true);
      Haven._showPhase2Intro();
    }

    /* Start (or restart after tab-switch) the game-loop timers */
    Haven._startTimers();
  },

  /* ----------------------------------------------------------------
     Phase 2 intro text (GDD §3 Phase 2, exact text)
  ---------------------------------------------------------------- */

  _showPhase2Intro: function() {
    Haven._addLog('the green patch grows with the fire. life returns to the soil.', 'normal', 2000);
    Haven._addLog('dead trees within reach. stone from the ruins.', 'normal', 7000);
  },

  /* ----------------------------------------------------------------
     Fire system (DESIGN.md §12)
  ---------------------------------------------------------------- */

  /* Called every GAME_DAY_MS (180 real seconds = 1 game-day).
     1. Auto-consume wood based on current fire level.
     2. Drop fire by 1 level.
     3. Show narrative messages at critical thresholds.
     4. Increment the game-day counter.              */
  _gameDayTick: function() {
    var level    = $SM.get('game.fire.level', true);
    var woodCost = Haven.FIRE_WOOD_COST[level] || 0;

    /* Auto-consume wood (GDD §12) */
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

    /* Increment game day (score: days_survived per GDD §13) */
    var day = $SM.get('game.day', true);
    $SM.set('game.day', day + 1, true);

    /* Batch fire one update + save */
    $SM.fireUpdate('stores', true);

    /* Reschedule — hearth doubles the decay interval (GDD §6) */
    var nextMs = $SM.get('game.buildings.hearth') ? Haven.GAME_DAY_MS * 2 : Haven.GAME_DAY_MS;
    Haven._timers.gameDay = Engine.setTimeout(Haven._gameDayTick, nextMs);
  },

  /* Day/night toggle every HALF_DAY_MS = 90 seconds (GDD §5) */
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

  /* Called by save.js Page Visibility API when tab is hidden */
  pauseTimers: function() {
    Haven._pauseTimers();
  },

  /* Called by save.js when tab becomes visible — timers restart from
     full interval (no offline progress, GDD §5)                     */
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
     Action buttons
  ---------------------------------------------------------------- */

  _buildButtons: function() {
    Haven._actionsEl.innerHTML = '';
    Haven._makeGatherButton('gather wood',  'wood');
    Haven._makeGatherButton('gather stone', 'stone');
    Haven._makeStokeButton();
  },

  /* Gather button (GDD §3): 10s cooldown, 3-5 units.
     Night: +25% cooldown (GDD §5).                   */
  _makeGatherButton: function(label, resource) {
    var btn = document.createElement('button');
    btn.className = 'action-btn visible';
    btn.dataset.resource = resource;
    btn.textContent = label;

    btn.addEventListener('click', function() {
      if (btn.disabled) return;
      btn.disabled = true;

      /* Night penalty (GDD §5: gathering speed -25%) */
      var isNight    = $SM.get('game.isNight') || false;
      var totalMs    = isNight ? Math.ceil(Haven.GATHER_COOLDOWN_MS * 1.25) : Haven.GATHER_COOLDOWN_MS;
      var remaining  = Math.ceil(totalMs / 1000);

      btn.textContent = label + ' (' + remaining + 's)';

      var countdown = Engine.setInterval(function() {
        remaining--;
        if (remaining > 0) {
          btn.textContent = label + ' (' + remaining + 's)';
        } else {
          clearInterval(countdown);

          /* GDD §3: returns 3-5 units */
          var amount  = Haven.GATHER_MIN + Math.floor(Math.random() * (Haven.GATHER_MAX - Haven.GATHER_MIN + 1));
          var cap     = $SM.get('game.buildings.storehouse') ? Haven.STOREHOUSE_CAP : Haven.BASE_STORE_CAP;
          var current = $SM.get('stores.' + resource, true);

          if (current >= cap) {
            /* GDD §18 exact text */
            Notifications.notify(Haven, 'stores are full. resources wasted.');
          } else {
            $SM.add('stores.' + resource, Math.min(amount, cap - current));
          }

          btn.disabled = false;
          btn.textContent = label;
        }
      }, 1000);
    });

    Haven._actionsEl.appendChild(btn);
    return btn;
  },

  /* Stoke button: -1 wood, +1 fire level (GDD §12).
     Shows "tend the mark" when fire is dead (level 0). */
  _makeStokeButton: function() {
    var btn = document.createElement('button');
    btn.id  = 'btn-stoke';
    btn.className = 'action-btn visible';
    btn.textContent = 'stoke the fire'; /* GDD §12 */
    Haven._updateStokeButtonState(btn);

    btn.addEventListener('click', function() {
      if (btn.disabled) return;

      var wood  = $SM.get('stores.wood',     true);
      var level = $SM.get('game.fire.level', true);

      if (wood < 1) {
        /* GDD §4 */
        Notifications.notify(Haven, 'not enough wood.');
        return;
      }
      if (level >= 5) return;

      $SM.add('stores.wood', -1, true);
      $SM.set('game.fire.level', level + 1);

      /* Clear "dead" flag when fire is restarted */
      if (level === 0) $SM.set('game.fire.dead', false, true);

      Haven._updateFireDisplay();
    });

    Haven._actionsEl.appendChild(btn);
    return btn;
  },

  _updateStokeButtonText: function(btn) {
    btn = btn || document.getElementById('btn-stoke');
    if (!btn) return;
    /* GDD §12: button is always "stoke the fire" */
    btn.textContent = 'stoke the fire';
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

    /* GDD §4 — 7 resources, display only those present in state */
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
    if (e.category === 'stores') {
      Haven._updateStores();
      Haven._updateStokeButtonState();
    }
    if (e.category === 'game') {
      Haven._updateFireDisplay();
      Haven._updateStokeButtonState();
    }
  }

};
