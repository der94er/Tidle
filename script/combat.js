/* ============================================================
   THE LAST EMBER — combat.js
   Phase 4: Combat resolution.
   GDD §10: auto-resolves in rounds, simultaneous damage,
   fight/flee, win/lose outcomes.
   Pure vanilla JS — no jQuery.
   ============================================================ */

var Combat = {

  _callback:  null,
  _enemy:     null,
  _afterType: null,

  /* GDD §10 — player attack = base 0 + weapon bonus */
  _getPlayerAttack: function() {
    /* Use best available weapon in inventory */
    if ($SM.get('game.inventory.steelSword'))  return 5;
    if ($SM.get('game.inventory.crudeSword'))  return 2;
    return 0;
  },

  _getPlayerDefense: function() {
    if ($SM.get('game.inventory.steelArmor'))  return 5;
    if ($SM.get('game.inventory.crudeArmor'))  return 2;
    return 0;
  },

  /* entry point — called by Wilds._triggerCombat and Wilds._sanctumRoom */
  start: function(enemy, x, y, afterType, callback) {
    Combat._callback  = callback;
    Combat._afterType = afterType;
    Combat._enemy     = JSON.parse(JSON.stringify(enemy)); /* deep copy */

    $SM.set('game.combat.active',    true,     true);
    $SM.set('game.combat.enemyHp',   enemy.hp, true);
    $SM.set('game.combat.lastEnemyHp', enemy.hp, true);

    Combat._render();
  },

  _render: function() {
    if (!Wilds._logEl || !Wilds._actionsEl) return;

    Wilds._logEl.innerHTML    = '';
    Wilds._actionsEl.innerHTML = '';

    var e        = Combat._enemy;
    var playerHp = $SM.get('game.player.health',   true);
    var enemyHp  = $SM.get('game.combat.enemyHp',  true);

    Wilds._addLog(e.name + '.');
    Wilds._addLog('your health: ' + playerHp + ' / 100',      'timestamp');
    Wilds._addLog('enemy health: ' + enemyHp + ' / ' + Combat._enemy.hp, 'timestamp');

    /* [fight] button */
    var fightBtn = document.createElement('button');
    fightBtn.className   = 'action-btn visible';
    fightBtn.textContent = 'fight';
    fightBtn.addEventListener('click', function() { Combat._doRound(); });
    Wilds._actionsEl.appendChild(fightBtn);

    /* [flee] — not available in sanctum */
    if (Combat._afterType !== 'sanctum') {
      var fleeBtn = document.createElement('button');
      fleeBtn.className   = 'action-btn visible';
      fleeBtn.textContent = 'flee';
      fleeBtn.addEventListener('click', function() { Combat._doFlee(); });
      Wilds._actionsEl.appendChild(fleeBtn);
    }
  },

  /* GDD §10 formula: both sides attack simultaneously each round */
  _doRound: function() {
    var e        = Combat._enemy;
    var playerHp = $SM.get('game.player.health',  true);
    var enemyHp  = $SM.get('game.combat.enemyHp', true);

    var pAtk = Combat._getPlayerAttack();
    var pDef = Combat._getPlayerDefense();

    /* GDD §10: max(1, attack - defense + rand(-2,2)) */
    var pDealt = Math.max(1, pAtk - e.def + (Math.floor(Math.random() * 5) - 2));
    var eDealt = Math.max(1, e.atk - pDef + (Math.floor(Math.random() * 5) - 2));

    enemyHp  = Math.max(0, enemyHp  - pDealt);
    playerHp = Math.max(0, playerHp - eDealt);

    $SM.set('game.combat.enemyHp',    enemyHp,  true);
    $SM.set('game.combat.lastEnemyHp', enemyHp, true);
    $SM.set('game.player.health',      playerHp, true);

    Wilds._logEl.innerHTML    = '';
    Wilds._actionsEl.innerHTML = '';

    Wilds._addLog('you deal ' + pDealt + '. the ' + e.name + ' deals ' + eDealt + '.');

    if (enemyHp <= 0 && playerHp <= 0) {
      /* Both down simultaneously — player survives (mark never fails, GDD §12) */
      Combat._win();
    } else if (enemyHp <= 0) {
      Combat._win();
    } else if (playerHp <= 0) {
      Combat._lose();
    } else {
      /* Ongoing — re-render fight/flee */
      Wilds._addLog('your health: ' + playerHp + ' / 100',           'timestamp');
      Wilds._addLog('enemy health: ' + enemyHp + ' / ' + e.hp, 'timestamp');
      Combat._render();
    }
  },

  _win: function() {
    var e = Combat._enemy;
    $SM.set('game.combat.active', false, true);
    $SM.remove('game.combat.enemyHp',     true);
    $SM.set('playStats.combatWins', ($SM.get('playStats.combatWins') || 0) + 1, true);

    Wilds._addLog('the ' + e.name + ' falls.');

    /* Loot goes into carry (GDD §10) */
    var carry      = $SM.get('game.carry') || {};
    var carryTotal = Wilds._getCarryTotal();

    Object.keys(e.loot).forEach(function(r) {
      var range = e.loot[r];
      var amt   = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
      if (amt <= 0) return;
      var space = Wilds.MAX_CARRY - carryTotal;
      var take  = Math.min(amt, space);
      if (take > 0) {
        carry[r]    = (carry[r] || 0) + take;
        carryTotal += take;
        Wilds._addLog(take + ' ' + r + ' taken.', 'timestamp');
      }
    });
    $SM.set('game.carry', carry, true);
    Wilds._renderCarry();

    if (Combat._callback) Combat._callback(true);
  },

  _lose: function() {
    $SM.set('game.combat.active',  false, true);
    $SM.remove('game.combat.enemyHp',    true);
    $SM.set('game.player.wounded', true,  true);
    $SM.set('game.carry',          {},    true); /* GDD §10: lose all carried resources */
    $SM.set('playStats.combatLosses', ($SM.get('playStats.combatLosses') || 0) + 1, true);

    Wilds._addLog('you fall. the mark holds \u2014 barely.');
    Wilds._addLog('you wake at the haven. wounded. everything carried is lost.', 'timestamp');

    if (Combat._callback) Combat._callback(false);
  },

  /* GDD §10: flee = safe retreat, lose 2 random carried resources */
  _doFlee: function() {
    var carry     = $SM.get('game.carry') || {};
    var resources = Object.keys(carry).filter(function(r) { return carry[r] > 0; });
    var lost      = 0;

    for (var i = 0; i < 2 && resources.length > 0; i++) {
      var idx = Math.floor(Math.random() * resources.length);
      var r   = resources[idx];
      carry[r] = Math.max(0, carry[r] - 1);
      if (carry[r] === 0) resources.splice(idx, 1);
      lost++;
    }

    $SM.set('game.carry',         carry, true);
    $SM.set('game.combat.active', false, true);
    $SM.remove('game.combat.enemyHp',   true);
    $SM.set('playStats.combatRetreats', ($SM.get('playStats.combatRetreats') || 0) + 1, true);

    Wilds._logEl.innerHTML    = '';
    Wilds._actionsEl.innerHTML = '';
    Wilds._addLog('you flee.');
    if (lost > 0) Wilds._addLog(lost + ' resource' + (lost > 1 ? 's' : '') + ' scattered in the retreat.', 'timestamp');
    Wilds._renderCarry();

    /* Flee = callback(false, true) — no haven return, stay on tile */
    if (Combat._callback) Combat._callback(false, true);
  }

};
