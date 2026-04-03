/* ============================================================
   THE LAST EMBER — grave.js
   Phase 1: Awakening from the grave, the mark, first fire, Memory #1.
   All text, timings, and sequence from DESIGN.md §3 Phase 1.
   Pure vanilla JS — no jQuery.
   ============================================================ */

var Grave = {

  name: 'the grave',
  tab:   null,
  panel: null,

  _logEl:     null,
  _actionsEl: null,
  _pendingTimers: [],

  /* --- Module lifecycle --- */

  init: function() {
    /* Register the tab */
    Grave.tab = Header.addLocation('the grave', 'grave', Grave);

    /* Build panel */
    Grave.panel = document.createElement('div');
    Grave.panel.id = 'gravePanel';
    Grave.panel.className = 'location';
    document.getElementById('locationSlider').appendChild(Grave.panel);

    /* Narrative log */
    Grave._logEl = document.createElement('div');
    Grave._logEl.id = 'graveLog';
    Grave._logEl.className = 'log';
    Grave.panel.appendChild(Grave._logEl);

    /* Action buttons area */
    Grave._actionsEl = document.createElement('div');
    Grave._actionsEl.id = 'graveActions';
    Grave._actionsEl.className = 'actions';
    Grave.panel.appendChild(Grave._actionsEl);

    Engine.updateSlider();
  },

  onArrival: function(diff) {
    var phase = $SM.get('game.grave.phase') || 0;

    /* Cancel any running sequence timers */
    Grave._cancelTimers();

    /* Clear display for a fresh render */
    Grave._logEl.innerHTML = '';
    Grave._actionsEl.innerHTML = '';

    if (phase < 5) {
      /* Phase 1 not yet complete — run opening sequence.
         TODO Phase B: restore mid-sequence log state from save.
         For now, always replay from the beginning when arriving. */
      Grave._startOpening();
    } else {
      /* Phase 1 complete — show Phase 2 stub (replaced by haven.js in Phase C) */
      Grave._showPhase2();
    }
  },

  /* --- Opening sequence (GDD §3 Phase 1, exact text) ---
     Timings are cumulative-from-start delays as specified in the GDD.
     Each step's delay = gap from previous event. */

  _startOpening: function() {
    /* Steps before [break the surface].
       Delays match the GDD timestamp gaps:
         0:00 black screen (3s of silence before first word)
         0:03 "dirt."          → delay 3000ms
         0:05 "darkness."      → delay 2000ms
         0:07 "the taste of earth." → delay 2000ms
         0:10 "something burns. your hand." → delay 3000ms
         0:14 "you claw upward."  → delay 4000ms
         0:18 [break the surface] → delay 4000ms                    */
    var steps = [
      { delay: 3000, text: 'dirt.' },
      { delay: 2000, text: 'darkness.' },
      { delay: 2000, text: 'the taste of earth.' },
      { delay: 3000, text: 'something burns. your hand.' },
      { delay: 4000, text: 'you claw upward.' },
      { delay: 4000, button: { id: 'btn-surface', label: 'break the surface', next: Grave._onBreakSurface } }
    ];

    Grave._runSteps(steps);
  },

  /* After [break the surface] (GDD §3 Phase 1)
     0:20 gap from click: 2s
     0:25, 0:30, 0:35: 5s gaps
     0:40 [look around]: 5s gap  */
  _onBreakSurface: function() {
    $SM.set('game.grave.phase', 1);

    var steps = [
      { delay: 2000, text: 'cold air. grey sky. an open grave.' },
      { delay: 5000, text: 'your palm. a mark. glowing faint amber.' },
      { delay: 5000, text: 'around you — black soil. dead grass. a ring of green where you stand.' },
      { delay: 5000, text: 'the mark keeps the sickness back.' },
      { delay: 5000, button: { id: 'btn-look', label: 'look around', next: Grave._onLookAround } }
    ];

    Grave._runSteps(steps);
  },

  /* After [look around] (GDD §3 Phase 1)
     0:45, 0:50, 0:55: 5s gaps
     1:00 [build a fire]: 5s gap  */
  _onLookAround: function() {
    $SM.set('game.grave.phase', 2);

    var steps = [
      { delay: 5000, text: 'a ruined wall. half-collapsed. shelter from the wind.' },
      { delay: 5000, text: 'dead wood scattered. enough for a fire.' },
      { delay: 5000, text: 'the mark flickers. it wants warmth.' },
      { delay: 5000, button: { id: 'btn-fire', label: 'build a fire', next: Grave._onBuildFire } }
    ];

    Grave._runSteps(steps);
  },

  /* After [build a fire] (GDD §3 Phase 1)
     First fire is automatic — no resource cost (GDD §3: "automatic — no resource cost, first time only")
     1:05, 1:10, 1:15: 5s gaps
     1:20 [search near the grave]: 5s gap  */
  _onBuildFire: function() {
    $SM.set('game.grave.phase', 3);
    $SM.set('game.fire.level', 1, true); /* fire starts at level 1 (Flicker) — free */

    var steps = [
      { delay: 5000, text: 'the fire catches. the mark steadies.' },
      { delay: 5000, text: 'the green circle widens. just a little.' },
      { delay: 5000, text: 'something on the ground near the grave.' },
      { delay: 5000, button: { id: 'btn-search', label: 'search near the grave', next: Grave._onSearch } }
    ];

    Grave._runSteps(steps);
  },

  /* After [search near the grave] (GDD §3 Phase 1 + §11 Memory #1)
     1:25: 3s gap
     1:30: Memory #1 — mark vision fires, 5s gap
     1:35: "who was she?" — 5s gap  */
  _onSearch: function() {
    $SM.set('game.grave.phase', 4);

    var steps = [
      { delay: 3000, text: 'a leather cord. a small iron ring. yours, once.' },
      {
        /* Memory #1 (GDD §11):
           Source: Starting area | Thread: Your past
           Text: "a woman's hand, placing the ring in yours.
                  'come back to me.' her face is blurred. the memory fades."  */
        delay: 5000,
        type: 'memory',
        text: "a woman\u2019s hand, placing the ring in yours. \u2018come back to me.\u2019 her face is blurred. the memory fades."
      },
      { delay: 5000, text: 'who was she?' }
    ];

    Grave._runSteps(steps, Grave._onPhase1Complete);
  },

  /* Phase 1 complete — hand off to haven.js */
  _onPhase1Complete: function() {
    $SM.set('game.grave.phase', 5);
    $SM.set('game.memories.count', 1);
    $SM.set('game.memories.found', [1]);

    /* Init haven + memory journal, then travel */
    Haven.init();
    Memory.init();
    Engine.travelTo(Haven);
  },

  /* --- Sequence runner ---
     Processes an array of step objects sequentially.
     Each step fires after its `delay` (ms gap from previous step completing).

     Step shapes:
       { delay, text, type? }          — shows narrative text
       { delay, button: { id, label, next } } — shows an action button; stops until clicked  */

  _runSteps: function(steps, onComplete) {
    var idx = 0;

    function next() {
      if (idx >= steps.length) {
        if (onComplete) onComplete();
        return;
      }

      var step = steps[idx++];

      var t = Engine.setTimeout(function() {
        Grave._pendingTimers = Grave._pendingTimers.filter(function(id) { return id !== t; });

        if (step.text) {
          Grave._addText(step.text, step.type || 'normal');
        }

        if (step.button) {
          /* Button stops the sequence — its click handler drives the next phase */
          Grave._addButton(step.button.id, step.button.label, step.button.next);
        } else {
          next();
        }
      }, step.delay);

      Grave._pendingTimers.push(t);
    }

    next();
  },

  _cancelTimers: function() {
    Grave._pendingTimers.forEach(function(id) { clearTimeout(id); });
    Grave._pendingTimers = [];
  },

  /* --- DOM helpers --- */

  _addText: function(text, type) {
    var el = document.createElement('div');
    el.className = 'narrative';
    if (type === 'memory')    el.classList.add('memory');
    if (type === 'timestamp') el.classList.add('timestamp');
    el.textContent = text;
    Grave._logEl.appendChild(el);

    /* Trigger mark vision BEFORE text fades in (GDD §11) */
    if (type === 'memory') {
      Grave._triggerMarkVision();
    }

    /* Fade in via CSS transition */
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        el.classList.add('visible');
        /* Keep newest text in view */
        Grave._logEl.scrollTop = Grave._logEl.scrollHeight;
      });
    });

    return el;
  },

  _addButton: function(id, label, onClick) {
    /* Replace any existing button */
    Grave._actionsEl.innerHTML = '';

    var btn = document.createElement('button');
    btn.id = id;
    btn.className = 'action-btn';
    btn.textContent = label;
    btn.addEventListener('click', function handler() {
      btn.removeEventListener('click', handler);
      btn.disabled = true;
      Grave._actionsEl.innerHTML = '';
      onClick();
    });
    Grave._actionsEl.appendChild(btn);

    /* Fade in */
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        btn.classList.add('visible');
      });
    });
  },

  /* Mark vision effect (GDD §11):
     "screen darkens slightly, text appears in gold (#C9A94E),
      and the mark animation intensifies for 3 seconds." */
  _triggerMarkVision: function() {
    var overlay = document.getElementById('markVisionOverlay');
    if (!overlay) return;

    overlay.classList.add('active');

    Engine.setTimeout(function() {
      overlay.classList.remove('active');
    }, 3000);
  }

};
