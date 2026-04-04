/* ============================================================
   THE LAST EMBER — memory.js
   Phase E: Journal tab + player name input at memory #25.
   All memory texts from DESIGN.md §11.
   Pure vanilla JS — no jQuery.
   ============================================================ */

var Memory = {

  name: 'journal',
  tab:   null,
  panel: null,
  _logEl: null,

  /* GDD §11 memory #1 — shown by grave.js inline; repeated here for journal */
  MEMORY_1: 'a woman\u2019s hand, placing a ring in yours. \u2018come back to me.\u2019 her face is blurred.',

  /* Thread classification: memories about your own life vs. previous mark-bearers */
  THREAD_PAST: { 1:true, 2:true, 3:true, 5:true, 7:true, 9:true, 11:true,
                 14:true, 15:true, 17:true, 20:true, 21:true, 22:true, 24:true, 25:true },

  _toRoman: function(n) {
    var vals = [10, 9, 5, 4, 1];
    var syms = ['x', 'ix', 'v', 'iv', 'i'];
    var r = '';
    for (var i = 0; i < vals.length; i++) {
      while (n >= vals[i]) { r += syms[i]; n -= vals[i]; }
    }
    return r;
  },

  init: function() {
    if (Memory.tab) return;

    Memory.tab = Header.addLocation('journal', 'journal', Memory);
    Memory.tab.style.display = 'none'; /* hidden until first memory found */

    Memory.panel = document.createElement('div');
    Memory.panel.id        = 'journalPanel';
    Memory.panel.className = 'location';
    document.getElementById('locationSlider').appendChild(Memory.panel);

    Memory._logEl = document.createElement('div');
    Memory._logEl.className = 'log';
    Memory.panel.appendChild(Memory._logEl);

    /* Restore journal tab visibility after page reload */
    var found = $SM.get('game.memories.found') || [];
    if (found.length > 0) Memory.tab.style.display = '';

    Engine.updateSlider();
    Dispatch('stateUpdate').subscribe(Memory._onStateUpdate);
  },

  onArrival: function(diff) {
    Memory._render();
  },

  _render: function() {
    if (!Memory._logEl) return;
    Memory._logEl.innerHTML = '';

    /* GDD §11: journal header = "[name]'s journal" or "a stranger's journal" */
    var name = $SM.get('game.playerName');
    var hdr  = document.createElement('div');
    hdr.className   = 'section-header';
    hdr.textContent = name ? name.toLowerCase() + '\u2019s journal' : 'a stranger\u2019s journal';
    Memory._logEl.appendChild(hdr);

    var found = ($SM.get('game.memories.found') || []).slice().sort(function(a, b) { return a - b; });

    if (found.length === 0) {
      var empty = document.createElement('div');
      empty.className   = 'narrative timestamp visible';
      empty.textContent = 'no memories recovered yet.';
      Memory._logEl.appendChild(empty);
      return;
    }

    /* Collect only valid (non-null) entries before rendering so dividers work correctly */
    var entries = found.map(function(idx) {
      return { idx: idx, text: Memory._getText(idx) };
    }).filter(function(e) { return !!e.text; });

    entries.forEach(function(e, i) {
      var entry = document.createElement('div');
      entry.className = 'memory-entry';

      /* Roman numeral */
      var numEl = document.createElement('span');
      numEl.className   = 'memory-numeral';
      numEl.textContent = Memory._toRoman(i + 1) + '.';
      entry.appendChild(numEl);

      /* Memory text — gold (GDD §2) */
      var textEl = document.createElement('div');
      textEl.className   = 'narrative memory visible';
      textEl.textContent = e.text;
      entry.appendChild(textEl);

      /* Thread label */
      var threadEl = document.createElement('div');
      threadEl.className   = 'memory-thread';
      threadEl.textContent = Memory.THREAD_PAST[e.idx]
        ? '\u2014 a fragment of your past'
        : '\u2014 the mark-bearers before you';
      entry.appendChild(threadEl);

      Memory._logEl.appendChild(entry);

      /* Thin divider between entries (not after the last) */
      if (i < entries.length - 1) {
        var hr = document.createElement('hr');
        hr.className = 'memory-divider';
        Memory._logEl.appendChild(hr);
      }
    });
  },

  /* Retrieve memory text by index */
  _getText: function(idx) {
    if (idx === 1) return Memory.MEMORY_1;
    if (typeof Wilds !== 'undefined' && Wilds.MEMORIES && Wilds.MEMORIES[idx]) {
      return Wilds.MEMORIES[idx];
    }
    return null;
  },

  _onStateUpdate: function(e) {
    if (e.category !== 'game') return;

    var found = $SM.get('game.memories.found') || [];

    /* Unlock journal tab on first memory found */
    if (found.length > 0 && Memory.tab && Memory.tab.style.display === 'none') {
      Memory.tab.style.display = '';
    }

    /* Keep journal up to date when it's the active panel */
    if (Engine.activeModule === Memory) {
      Memory._render();
    }
  },

  /* Called by wilds.js _sanctumRoom when room 4 is reached (memory #25).
     GDD §11: "after the text displays, a text input field appears."
     Shows blinking-cursor input, [this is my name] button, then calls
     callback() to begin the Blight Heart combat. */
  showNameInput: function(callback) {
    if (!Wilds._actionsEl) {
      if (callback) callback();
      return;
    }
    Wilds._actionsEl.innerHTML = '';

    var wrapper = document.createElement('div');
    wrapper.className = 'name-input-wrapper';

    /* GDD §11: "no label — just a blinking cursor in an empty field" */
    var input = document.createElement('input');
    input.type      = 'text';
    input.maxLength = 30;
    input.className = 'name-input';

    /* GDD §11: single button: [this is my name] */
    var btn = document.createElement('button');
    btn.className   = 'action-btn visible';
    btn.textContent = 'this is my name';

    btn.addEventListener('click', function() {
      /* GDD §11: blank → default "the mark-bearer" */
      var name = input.value.trim() || 'the mark-bearer';
      $SM.set('game.playerName', name, true);
      /* Update journal header if open */
      if (Engine.activeModule === Memory) Memory._render();
      Wilds._actionsEl.innerHTML = '';
      if (callback) callback();
    });

    wrapper.appendChild(input);
    wrapper.appendChild(btn);
    Wilds._actionsEl.appendChild(wrapper);

    /* Auto-focus */
    Engine.setTimeout(function() { input.focus(); }, 50);
  }

};
