/* ============================================================
   THE LAST EMBER — leaderboard.js
   Phase F: Score calculation, local leaderboard (4 types).
   All formula values from DESIGN.md §13.
   Pure vanilla JS — no jQuery.
   ============================================================ */

var Leaderboard = {

  SAVE_KEY: 'lastEmber_scores',

  /* GDD §13 score formula */
  _calculateScore: function() {
    var memories      = $SM.get('playStats.memories')       || 0;
    var maxPop        = $SM.get('playStats.maxPop')          || 0;
    var combatWins    = $SM.get('playStats.combatWins')      || 0;
    var tilesExplored = $SM.get('playStats.tilesExplored')   || 0;
    var days          = $SM.get('game.day')                  || 0;
    var sealEnding    = $SM.get('playStats.sealEnding')      || 0;
    var villagersLost = $SM.get('playStats.villagersLost')   || 0;
    var retreats      = $SM.get('playStats.combatRetreats')  || 0;
    var extraFrags    = $SM.get('stores.markFragments')      || 0;

    /* Count buildings built (9 buildable, GDD §6) */
    var buildings = 0;
    ['hearth','forge','hut','lodge','storehouse','workshop','watchtower','herbalistHut','tradingPost']
      .forEach(function(k) { if ($SM.get('game.buildings.' + k)) buildings++; });

    return (memories      * 100)
         + (buildings     *  50)
         + (maxPop        *  25)
         + (combatWins    *  15)
         + (tilesExplored *   2)
         + (days          *   3)
         + (extraFrags    *  50)
         + (sealEnding    * 500)
         - (villagersLost * 100)
         - (retreats      *  25);
  },

  /* Save the completed run and update personal bests */
  _saveRun: function() {
    var score     = Leaderboard._calculateScore();
    var endMs     = Date.now();
    var startMs   = $SM.get('game.startTime') || endMs;
    var elapsedSec = Math.max(0, Math.floor((endMs - startMs) / 1000));

    var run = {
      score:    score,
      time:     elapsedSec,
      tiles:    $SM.get('playStats.tilesExplored') || 0,
      days:     $SM.get('game.day')                || 0,
      memories: $SM.get('playStats.memories')      || 0,
      ending:   $SM.get('game.ending')             || 'break',
      name:     $SM.get('game.playerName')         || 'the mark-bearer',
      date:     endMs
    };

    var data = Leaderboard._load();
    data.runs = data.runs || [];
    data.runs.push(run);
    /* Keep last 20 runs */
    if (data.runs.length > 20) data.runs = data.runs.slice(-20);

    /* Update personal bests (4 leaderboard types per GDD §13) */
    data.bests = data.bests || {};
    if (!data.bests.highScore || run.score > data.bests.highScore.score) {
      data.bests.highScore = run;
    }
    if (!data.bests.fastest || (elapsedSec > 0 && elapsedSec < data.bests.fastest.time)) {
      data.bests.fastest = run;
    }
    if (!data.bests.deepest || run.tiles > data.bests.deepest.tiles) {
      data.bests.deepest = run;
    }
    if (!data.bests.survival || run.days > data.bests.survival.days) {
      data.bests.survival = run;
    }

    Leaderboard._save(data);
    return run;
  },

  /* Replaces _showScore stub in wilds.js — called after ending texts finish */
  show: function() {
    var run  = Leaderboard._saveRun();
    var data = Leaderboard._load();

    if (!Wilds._logEl || !Wilds._actionsEl) return;
    Wilds._logEl.innerHTML    = '';
    Wilds._actionsEl.innerHTML = '';

    /* ── Score breakdown ── */
    var memories      = $SM.get('playStats.memories')      || 0;
    var maxPop        = $SM.get('playStats.maxPop')         || 0;
    var combatWins    = $SM.get('playStats.combatWins')     || 0;
    var tilesExplored = $SM.get('playStats.tilesExplored')  || 0;
    var days          = $SM.get('game.day')                 || 0;
    var sealEnding    = $SM.get('playStats.sealEnding')     || 0;
    var villagersLost = $SM.get('playStats.villagersLost')  || 0;
    var retreats      = $SM.get('playStats.combatRetreats') || 0;
    var extraFrags    = $SM.get('stores.markFragments')     || 0;
    var buildings     = 0;
    ['hearth','forge','hut','lodge','storehouse','workshop','watchtower','herbalistHut','tradingPost']
      .forEach(function(k) { if ($SM.get('game.buildings.' + k)) buildings++; });

    Leaderboard._line('score: ' + run.score, 'score-total');
    Leaderboard._line('time: ' + Leaderboard._fmtTime(run.time), 'score-time');

    Leaderboard._line('');
    Leaderboard._line('breakdown', 'section-header');
    Leaderboard._stat('memories recovered', memories,      100,   false);
    Leaderboard._stat('buildings built',    buildings,      50,   false);
    Leaderboard._stat('max population',     maxPop,         25,   false);
    Leaderboard._stat('combat wins',        combatWins,     15,   false);
    Leaderboard._stat('tiles explored',     tilesExplored,   2,   false);
    Leaderboard._stat('days survived',      days,            3,   false);
    if (extraFrags > 0)    Leaderboard._stat('extra fragments', extraFrags, 50, false);
    if (sealEnding)        Leaderboard._line('seal ending: +500', 'score-stat');
    if (villagersLost > 0) Leaderboard._stat('villagers lost',  villagersLost, 100, true);
    if (retreats > 0)      Leaderboard._stat('retreats',        retreats,       25, true);

    /* ── Personal bests ── */
    if (data.bests && Object.keys(data.bests).length > 0) {
      Leaderboard._line('');
      Leaderboard._line('personal bests', 'section-header');
      if (data.bests.highScore) Leaderboard._line('highest score: ' + data.bests.highScore.score,                           'score-stat');
      if (data.bests.fastest)   Leaderboard._line('fastest completion: ' + Leaderboard._fmtTime(data.bests.fastest.time),   'score-stat');
      if (data.bests.deepest)   Leaderboard._line('deepest exploration: ' + data.bests.deepest.tiles + ' tiles',            'score-stat');
      if (data.bests.survival)  Leaderboard._line('longest survival: ' + data.bests.survival.days + ' days',                'score-stat');
    }

    /* ── Play again ── */
    var btn = document.createElement('button');
    btn.className   = 'action-btn visible';
    btn.textContent = 'play again';
    btn.addEventListener('click', function() { Engine.confirmRestart(); });
    Wilds._actionsEl.appendChild(btn);
  },

  /* ----------------------------------------------------------------
     Helpers
  ---------------------------------------------------------------- */

  _stat: function(label, value, mult, negative) {
    var pts = value * mult * (negative ? -1 : 1);
    var sign = negative ? '\u2212' : '+';
    Leaderboard._line(label + ': ' + value + '  (' + sign + pts + ')', 'score-stat');
  },

  _line: function(text, cls) {
    if (!Wilds._logEl) return;
    var el = document.createElement('div');
    if (!cls || cls === '') {
      el.className   = 'narrative visible';
      el.textContent = '\u00a0'; /* non-breaking space for blank lines */
    } else if (cls === 'section-header') {
      el.className   = 'section-header';
      el.textContent = text;
    } else {
      el.className   = 'narrative ' + cls + ' visible';
      el.textContent = text;
    }
    Wilds._logEl.appendChild(el);
  },

  _fmtTime: function(sec) {
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    return (h > 0 ? h + 'h ' : '') + m + 'm ' + pad(s) + 's';
    function pad(n) { return n < 10 ? '0' + n : n; }
  },

  _load: function() {
    try {
      var raw = localStorage.getItem(Leaderboard.SAVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return { runs: [], bests: {} };
  },

  _save: function(data) {
    try { localStorage.setItem(Leaderboard.SAVE_KEY, JSON.stringify(data)); } catch(e) {}
  }

};
