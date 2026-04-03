/* ============================================================
   THE LAST EMBER — save.js
   Save/load edge cases and Page Visibility API.
   GDD §15: "Timers pause when the tab is hidden (Page Visibility API)."
   Pure vanilla JS — no jQuery.
   ============================================================ */

/* Page Visibility API — pause all game timers when tab is hidden.
   GDD §5: "No offline progress. Timers pause when the tab is hidden." */
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    /* Tab hidden: pause game timers */
    if (typeof Haven !== 'undefined' && Haven.pauseTimers) {
      Haven.pauseTimers();
    }
  } else {
    /* Tab visible again: resume from full interval (no catch-up) */
    if (typeof Haven !== 'undefined' && Haven.resumeTimers) {
      Haven.resumeTimers();
    }
  }
});
