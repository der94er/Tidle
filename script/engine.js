/* ============================================================
   THE LAST EMBER — engine.js
   Core game loop, module routing, save/load, timing.
   Pure vanilla JS — no jQuery.
   ============================================================ */

/* --- Global state object --- */
var State = window.State || {};

/* --- Localization passthrough (full i18n deferred to Phase E) --- */
function _(str) { return str; }

/* --- Pub/sub dispatcher (replaces ADR's $.Dispatch) ---
   Usage:
     Dispatch('stateUpdate').subscribe(fn)
     Dispatch('stateUpdate').publish(data)
     Dispatch('stateUpdate').unsubscribe(fn)
*/
function Dispatch(id) {
  if (!Dispatch._topics) Dispatch._topics = {};
  if (!Dispatch._topics[id]) Dispatch._topics[id] = [];
  var listeners = Dispatch._topics[id];
  return {
    subscribe: function(fn) {
      if (listeners.indexOf(fn) === -1) listeners.push(fn);
    },
    publish: function(data) {
      listeners.slice().forEach(function(fn) { fn(data); });
    },
    unsubscribe: function(fn) {
      var i = listeners.indexOf(fn);
      if (i > -1) listeners.splice(i, 1);
    }
  };
}

/* --- Engine --- */
var Engine = {

  VERSION: '1.0',
  SAVE_KEY: 'lastEmber_save',
  SAVE_DISPLAY: 30 * 1000,

  options: {
    debug: false
  },

  activeModule: null,
  _saveTimer: null,
  _lastNotify: null,

  init: function() {
    /* Create the location slider inside #main */
    var slider = document.createElement('div');
    slider.id = 'locationSlider';
    document.getElementById('main').appendChild(slider);

    /* Build minimal menu */
    Engine._buildMenu();

    /* Keyboard handlers */
    document.addEventListener('keydown', Engine.keyDown);
    document.addEventListener('keyup',   Engine.keyUp);

    /* Core systems */
    Header.init();
    $SM.init();
    Notifications.init();

    /* Load or init game state */
    Engine.loadGame();

    /* Start the income ticker (villager production — active from Phase C) */
    Engine._incomeTimeout = Engine.setTimeout($SM.collectIncome, 1000);

    /* Init modules based on game progress, travel to the right one */
    Grave.init();

    if ($SM.get('game.grave.phase', true) >= 5) {
      /* Player is past Phase 1 — restore Haven */
      Haven.init();
      Engine.travelTo(Haven);
    } else {
      Engine.travelTo(Grave);
    }
  },

  /* --- Menu --- */
  _buildMenu: function() {
    var menu = document.createElement('div');
    menu.className = 'menu';
    document.body.appendChild(menu);

    var restartBtn = document.createElement('span');
    restartBtn.className = 'menuBtn';
    restartBtn.textContent = 'restart.';
    restartBtn.addEventListener('click', Engine.confirmRestart);
    menu.appendChild(restartBtn);
  },

  confirmRestart: function() {
    if (window.confirm('restart the game? all progress will be lost.')) {
      Engine.deleteSave();
    }
  },

  deleteSave: function() {
    try { localStorage.removeItem(Engine.SAVE_KEY); } catch(e) {}
    window.State = {};
    location.reload();
  },

  /* --- Save / load (key: "lastEmber_save" per DESIGN.md §15) --- */
  saveGame: function() {
    try {
      if (typeof Storage === 'undefined' || !localStorage) return;
      localStorage.setItem(Engine.SAVE_KEY, JSON.stringify(State));

      /* Show "saved." notification (throttled) */
      var notify = document.getElementById('saveNotify');
      if (notify) {
        if (Engine._saveTimer) clearTimeout(Engine._saveTimer);
        if (!Engine._lastNotify || Date.now() - Engine._lastNotify > Engine.SAVE_DISPLAY) {
          notify.style.opacity = '1';
          Engine._saveTimer = setTimeout(function() {
            notify.style.opacity = '0';
          }, 1500);
          Engine._lastNotify = Date.now();
        }
      }
    } catch(e) {
      Engine.log('save failed: ' + e.message);
    }
  },

  loadGame: function() {
    try {
      var raw = localStorage.getItem(Engine.SAVE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed) {
          State = parsed;
          Engine.log('loaded save.');
          return;
        }
      }
    } catch(e) {
      Engine.log('save corrupt or missing — starting fresh.');
    }
    State = {};
  },

  /* --- Module routing --- */
  travelTo: function(module) {
    if (Engine.activeModule === module) return;

    var panels    = Array.from(document.querySelectorAll('.location'));
    var panelIdx  = panels.indexOf(module.panel);
    var curIdx    = Engine.activeModule ? panels.indexOf(Engine.activeModule.panel) : 0;
    var diff      = Math.abs(panelIdx - curIdx) || 1;

    /* Update header tabs */
    document.querySelectorAll('.headerButton').forEach(function(btn) {
      btn.classList.remove('selected');
    });
    if (module.tab) module.tab.classList.add('selected');

    /* Slide to panel */
    var slider = document.getElementById('locationSlider');
    if (slider) {
      slider.style.transition = 'left ' + (300 * diff) + 'ms ease';
      slider.style.left = -(panelIdx * 700) + 'px';
    }

    Engine.activeModule = module;
    module.onArrival(diff);
    Notifications.printQueue(module);
  },

  /* Recalculate slider width after adding a new panel */
  updateSlider: function() {
    var slider = document.getElementById('locationSlider');
    if (!slider) return;
    var count = slider.querySelectorAll('.location').length;
    slider.style.width = (count * 700) + 'px';
  },

  /* --- Input --- */
  keyDown: function(e) {
    if (Engine.activeModule && Engine.activeModule.keyDown) {
      Engine.activeModule.keyDown(e);
    }
  },

  keyUp: function(e) {
    if (Engine.activeModule && Engine.activeModule.keyUp) {
      Engine.activeModule.keyUp(e);
    }
  },

  /* --- Timer wrappers (kept for future hyper-mode support) --- */
  setTimeout: function(callback, delay) {
    return setTimeout(callback, delay);
  },

  setInterval: function(callback, interval) {
    return setInterval(callback, interval);
  },

  log: function(msg) {
    if (Engine.options.debug) console.log('[Engine]', msg);
  }

};
