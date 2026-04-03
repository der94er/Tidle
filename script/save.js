/* ============================================================
   THE LAST EMBER — save.js
   GDD §15: Boot gate (continue vs new game), two-tab detection,
   Page Visibility API timer pause/resume.
   Pure vanilla JS — no jQuery.
   ============================================================ */

/* GDD §5: timers pause when tab is hidden (Page Visibility API) */
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    if (typeof Haven !== 'undefined') Haven.pauseTimers();
  } else {
    if (typeof Haven !== 'undefined') Haven.resumeTimers();
  }
});

var Save = {

  TAB_KEY:     'lastEmber_tab',
  TAB_TIMEOUT: 12000, /* ms — tabs older than this are considered dead */
  _heartbeat:  null,

  /* Entry point — called from DOMContentLoaded instead of Engine.init().
     GDD §15: two-tab check → continue/new game → Engine.init(). */
  boot: function() {
    if (Save._isAnotherTabOpen()) {
      Save._showTwoTabWarning();
      return;
    }
    Save._claimTab();

    var hasSave = false;
    try { hasSave = !!localStorage.getItem(Engine.SAVE_KEY); } catch(e) {}

    if (hasSave) {
      Save._showContinueScreen();
    } else {
      Engine.init();
    }
  },

  /* ----------------------------------------------------------------
     Two-tab detection (GDD §15)
  ---------------------------------------------------------------- */

  _isAnotherTabOpen: function() {
    try {
      var ts = parseInt(localStorage.getItem(Save.TAB_KEY), 10);
      return !isNaN(ts) && (Date.now() - ts) < Save.TAB_TIMEOUT;
    } catch(e) { return false; }
  },

  _claimTab: function() {
    try { localStorage.setItem(Save.TAB_KEY, Date.now().toString()); } catch(e) {}

    /* Heartbeat — refresh claim every 5s so it doesn't expire */
    Save._heartbeat = setInterval(function() {
      try { localStorage.setItem(Save.TAB_KEY, Date.now().toString()); } catch(e) {}
    }, 5000);

    window.addEventListener('beforeunload', function() {
      clearInterval(Save._heartbeat);
      try { localStorage.removeItem(Save.TAB_KEY); } catch(e) {}
    });
  },

  /* GDD §15 exact text: "game is open in another tab." */
  _showTwoTabWarning: function() {
    var el = document.createElement('div');
    el.className   = 'two-tab-warning';
    el.textContent = 'game is open in another tab.';
    document.body.appendChild(el);
  },

  /* ----------------------------------------------------------------
     Continue vs New Game (GDD §15)
  ---------------------------------------------------------------- */

  _showContinueScreen: function() {
    var overlay = document.createElement('div');
    overlay.id        = 'bootOverlay';
    overlay.className = 'boot-overlay';

    var title = document.createElement('div');
    title.className   = 'boot-title';
    title.textContent = 'the last ember';
    overlay.appendChild(title);

    var sub = document.createElement('div');
    sub.className   = 'boot-sub';
    sub.textContent = 'a save exists.';
    overlay.appendChild(sub);

    var continueBtn = document.createElement('button');
    continueBtn.className   = 'action-btn visible';
    continueBtn.textContent = 'continue';
    continueBtn.addEventListener('click', function() {
      document.body.removeChild(overlay);
      Engine.init();
    });
    overlay.appendChild(continueBtn);

    var newBtn = document.createElement('button');
    newBtn.className   = 'action-btn visible';
    newBtn.textContent = 'new game';
    newBtn.addEventListener('click', function() {
      if (window.confirm('start a new game? current progress will be lost.')) {
        try { localStorage.removeItem(Engine.SAVE_KEY); } catch(e) {}
        document.body.removeChild(overlay);
        Engine.init();
      }
    });
    overlay.appendChild(newBtn);

    document.body.appendChild(overlay);
  }

};
