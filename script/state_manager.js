/* ============================================================
   THE LAST EMBER — state_manager.js
   All game state read/writes go through $SM.
   Pure vanilla JS — no jQuery.
   ============================================================ */

var StateManager = {

  MAX_STORE: 99999999999999,

  options: {},

  init: function(options) {
    Object.assign(this.options, options || {});

    /* Create top-level state categories */
    var cats = [
      'features',   /* unlocks, location availability */
      'stores',     /* resources: wood, stone, iron, cloth, herbs, food, markFragments */
      'character',  /* player stats, equipped items */
      'income',     /* villager production sources */
      'timers',     /* cooldown tracking */
      'game',       /* fire level, buildings, population, map state */
      'playStats',  /* discoveries found, combat wins, days survived, etc. */
      'config'      /* player settings */
    ];

    for (var i = 0; i < cats.length; i++) {
      if (!$SM.get(cats[i])) $SM.set(cats[i], {});
    }

    Dispatch('stateUpdate').subscribe($SM.handleStateUpdates);
  },

  /* Create all parent objects in the path, then set the leaf value */
  createState: function(stateName, value) {
    var words = stateName.split(/[.\[\]'"]+/).filter(function(w) { return w !== ''; });
    var obj = State;
    for (var i = 0; i < words.length - 1; i++) {
      if (obj[words[i]] === undefined) obj[words[i]] = {};
      obj = obj[words[i]];
    }
    obj[words[words.length - 1]] = value;
    return obj;
  },

  /* Set a single state value.
     noEvent = true skips the stateUpdate publish (use when batching). */
  set: function(stateName, value, noEvent) {
    var fullPath = $SM.buildPath(stateName);

    if (typeof value === 'number' && value > $SM.MAX_STORE) value = $SM.MAX_STORE;

    try {
      eval('(' + fullPath + ') = value');
    } catch(e) {
      $SM.createState(stateName, value);
    }

    /* stores cannot go negative */
    if (stateName.indexOf('stores') === 0 && $SM.get(stateName, true) < 0) {
      eval('(' + fullPath + ') = 0');
      Engine.log('WARNING: ' + stateName + ' clamped to 0.');
    }

    if (!noEvent) {
      Engine.saveGame();
      $SM.fireUpdate(stateName);
    }
  },

  /* Set multiple values under a parent in one batch */
  setM: function(parentName, list, noEvent) {
    $SM.buildPath(parentName);
    if ($SM.get(parentName) === undefined) $SM.set(parentName, {}, true);

    for (var k in list) {
      $SM.set(parentName + '["' + k + '"]', list[k], true);
    }

    if (!noEvent) {
      Engine.saveGame();
      $SM.fireUpdate(parentName);
    }
  },

  /* Add a number to an existing state value */
  add: function(stateName, value, noEvent) {
    var old = $SM.get(stateName, true);
    if (old !== old) { /* NaN check */
      Engine.log('WARNING: ' + stateName + ' was NaN — reset to 0.');
      old = 0;
    }
    if (typeof old !== 'number' || typeof value !== 'number') {
      Engine.log('WARNING: cannot add non-number to ' + stateName);
      return 1;
    }
    $SM.set(stateName, old + value, noEvent);
    return 0;
  },

  /* Add multiple numbers under a parent */
  addM: function(parentName, list, noEvent) {
    var err = 0;
    if ($SM.get(parentName) === undefined) $SM.set(parentName, {}, true);
    for (var k in list) {
      if ($SM.add(parentName + '["' + k + '"]', list[k], true)) err++;
    }
    if (!noEvent) {
      Engine.saveGame();
      $SM.fireUpdate(parentName);
    }
    return err;
  },

  /* Get a state value. Returns undefined if missing, or 0 if requestZero=true. */
  get: function(stateName, requestZero) {
    var result = null;
    var fullPath = $SM.buildPath(stateName);
    try {
      eval('result = (' + fullPath + ')');
    } catch(e) {
      result = undefined;
    }
    if ((!result || result === {}) && requestZero) return 0;
    return result;
  },

  setget: function(stateName, value, noEvent) {
    $SM.set(stateName, value, noEvent);
    return eval('(' + $SM.buildPath(stateName) + ')');
  },

  remove: function(stateName, noEvent) {
    var path = $SM.buildPath(stateName);
    try {
      eval('(delete ' + path + ')');
    } catch(e) {
      Engine.log('WARNING: could not remove ' + stateName);
    }
    if (!noEvent) {
      Engine.saveGame();
      $SM.fireUpdate(stateName);
    }
  },

  removeBranch: function(stateName, noEvent) {
    var branch = $SM.get(stateName);
    for (var i in branch) {
      if (typeof branch[i] === 'object') {
        $SM.removeBranch(stateName + '["' + i + '"]');
      }
    }
    if (Object.keys($SM.get(stateName) || {}).length === 0) {
      $SM.remove(stateName);
    }
    if (!noEvent) {
      Engine.saveGame();
      $SM.fireUpdate(stateName);
    }
  },

  buildPath: function(input) {
    var dot = (input.charAt(0) === '[') ? '' : '.';
    return 'State' + dot + input;
  },

  fireUpdate: function(stateName, save) {
    var category = $SM.getCategory(stateName);
    if (stateName === undefined) stateName = category = 'all';
    Dispatch('stateUpdate').publish({ category: category, stateName: stateName });
    if (save) Engine.saveGame();
  },

  getCategory: function(stateName) {
    var firstOB  = stateName.indexOf('[');
    var firstDot = stateName.indexOf('.');
    var cutoff;
    if (firstOB === -1 || firstDot === -1) {
      cutoff = firstOB > firstDot ? firstOB : firstDot;
    } else {
      cutoff = firstOB < firstDot ? firstOB : firstDot;
    }
    return cutoff === -1 ? stateName : stateName.substr(0, cutoff);
  },

  /* --- Income (villager production — active from Phase C) --- */
  setIncome: function(source, options) {
    var existing = $SM.get('income["' + source + '"]');
    if (typeof existing !== 'undefined') {
      options.timeLeft = existing.timeLeft;
    }
    $SM.set('income["' + source + '"]', options);
  },

  getIncome: function(source) {
    return $SM.get('income["' + source + '"]') || {};
  },

  collectIncome: function() {
    var changed = false;
    var income = $SM.get('income');
    if (typeof income !== 'undefined') {
      for (var source in income) {
        var entry = $SM.get('income["' + source + '"]');
        if (typeof entry.timeLeft !== 'number') entry.timeLeft = 0;
        entry.timeLeft--;

        if (entry.timeLeft <= 0) {
          var ok = true;
          for (var k in entry.stores) {
            if ($SM.get('stores["' + k + '"]', true) + entry.stores[k] < 0) {
              ok = false;
              break;
            }
          }
          if (ok) $SM.addM('stores', entry.stores, true);
          changed = true;
          if (typeof entry.delay === 'number') entry.timeLeft = entry.delay;
        }
      }
    }
    if (changed) $SM.fireUpdate('income', true);
    Engine._incomeTimeout = Engine.setTimeout($SM.collectIncome, 1000);
  },

  handleStateUpdates: function(e) {
    /* Modules subscribe to this to refresh their UI */
  }

};

var $SM = StateManager;
