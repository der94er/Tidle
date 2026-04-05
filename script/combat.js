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
    var base = 0;
    if ($SM.get('game.inventory.steelSword'))  base = 5;
    else if ($SM.get('game.inventory.crudeSword')) base = 2;
    /* Section 12: companion +2 attack */
    if ($SM.get('game.companion.alive') && $SM.get('game.companion.present')) base += 2;
    return base;
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

    /* Section 3: combat start mark reaction */
    Wilds._markReact('combatStart', 'the mark flares. hot. defensive.');

    /* Reset companion greeting flag */
    if ($SM.get('game.companion.alive')) $SM.set('game.companion.combatGreeted', false, true);
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

    /* Section 12: companion readies weapon (first render only) */
    if ($SM.get('game.companion.alive') && $SM.get('game.companion.present') && !$SM.get('game.companion.combatGreeted')) {
      $SM.set('game.companion.combatGreeted', true, true);
      var cRName = ($SM.get('game.companion.name') || 'your companion').toLowerCase();
      Wilds._addLog(cRName + ' readies their weapon.', 'timestamp');
    }

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

    /* Section 9: mark's light — fox, crawler, shade only */
    var eKey = Combat._enemy && Combat._enemy.key;
    if (eKey === 'fox' || eKey === 'crawler' || eKey === 'shade') {
      var torchCharges = $SM.get('game.inventory.torchCharges', true) || 0;
      var lantern      = !!$SM.get('game.inventory.markLantern');
      var canLight     = lantern || torchCharges >= 5;

      var lightBtn = document.createElement('button');
      lightBtn.className   = 'action-btn visible';
      lightBtn.textContent = 'offer the mark\u2019s light';
      lightBtn.disabled    = !canLight;
      if (!canLight) lightBtn.title = 'need 5 torch charges';
      lightBtn.addEventListener('click', function() { Combat._doMarkLight(); });
      Wilds._actionsEl.appendChild(lightBtn);
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

    /* Section 3: combat won mark reaction */
    Wilds._markReact('combatWon', 'the mark settles. watchful.');

    /* Loot goes into carry (GDD §10) */
    var carry      = $SM.get('game.carry') || {};
    var carryTotal = Wilds._getCarryTotal();

    Object.keys(e.loot).forEach(function(r) {
      var range = e.loot[r];
      var amt   = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
      if (amt <= 0) return;
      var space = Wilds._getMaxCarry() - carryTotal;
      var take  = Math.min(amt, space);
      if (take > 0) {
        carry[r]    = (carry[r] || 0) + take;
        carryTotal += take;
        Wilds._addLog(take + ' ' + r + ' taken.', 'timestamp');
      }
    });
    $SM.set('game.carry', carry, true);
    Wilds._renderCarry();

    /* Section 12: companion win line */
    if ($SM.get('game.companion.alive') && $SM.get('game.companion.present')) {
      var cWName = ($SM.get('game.companion.name') || 'your companion').toLowerCase();
      Engine.setTimeout(function() {
        Wilds._addLog(cWName + ' catches their breath. grins.', 'timestamp');
      }, 500);
    }

    if (Combat._callback) Combat._callback(true);
  },

  _lose: function() {
    $SM.set('game.combat.active',  false, true);
    $SM.remove('game.combat.enemyHp',    true);
    $SM.set('game.player.wounded', true,  true);
    $SM.set('game.carry',          {},    true); /* GDD §10: lose all carried resources */
    $SM.set('playStats.combatLosses', ($SM.get('playStats.combatLosses') || 0) + 1, true);

    Wilds._addLog('you fall. the mark holds \u2014 barely.');

    /* Section 12: companion may die on player loss */
    var companion = $SM.get('game.companion');
    if (companion && companion.alive && companion.present) {
      var cLName = companion.name.toLowerCase();
      if (Math.random() < 0.5) {
        $SM.set('game.companion.alive',   false, true);
        $SM.set('game.companion.present', false, true);
        Wilds._addLog('you wake in the haven. wounded. alone. ' + cLName + ' did not return.');
        var pop2 = $SM.get('game.population') || [];
        var other = pop2.length > 0 ? pop2[0].name.toLowerCase() : 'someone';
        Engine.setTimeout(function() { if (Haven._logEl) Haven._addLog('the haven is quiet.', 'timestamp'); }, 30000);
        Engine.setTimeout(function() { if (Haven._logEl) Haven._addLog(other + ' places ' + cLName + '\u2019s tool by the fire.', 'timestamp'); }, 90000);
        Engine.setTimeout(function() { if (Haven._logEl) Haven._addLog('no one asks to come with you again.', 'timestamp'); }, 150000);
      } else {
        $SM.set('game.companion.present', false, true);
        Wilds._addLog('you wake in the haven. ' + cLName + ' dragged you back. barely.');
        Engine.setTimeout(function() {
          Wilds._addLog(cLName + ' tends your wounds. says nothing for a long time.', 'timestamp');
        }, 2000);
      }
    } else {
      Wilds._addLog('you wake at the haven. wounded. everything carried is lost.', 'timestamp');
    }

    if (Combat._callback) Combat._callback(false);
  },

  /* Section 9: mark's light data */
  MARK_LIGHT_LOOT: {
    fox:     { resource: 'herbs',          min: 2, max: 4 },
    crawler: { resource: 'wood',           min: 3, max: 5 },
    shade:   { resource: 'markFragments',  min: 1, max: 1 }
  },

  MARK_LIGHT_TEXT: {
    fox:     'you hold out your hand. the mark\u2019s light washes over the fox. its eyes clear. it stands still for a moment, then disappears into the brush.',
    crawler: 'the roots recoil from the light, then soften. uncurl. sink back into the soil. where they settle, a shoot of green appears.',
    shade:   'the light passes through the shade. it keens \u2014 high and thin \u2014 and then dissolves. where it stood, a shard of condensed mark-light remains.'
  },

  _doMarkLight: function() {
    var e        = Combat._enemy;
    var lantern  = !!$SM.get('game.inventory.markLantern');
    var charges  = $SM.get('game.inventory.torchCharges', true) || 0;
    if (!lantern && charges < 5) return;
    if (!lantern) $SM.add('game.inventory.torchCharges', -5, true);

    $SM.set('game.combat.active', false, true);
    $SM.remove('game.combat.enemyHp', true);

    Wilds._logEl.innerHTML     = '';
    Wilds._actionsEl.innerHTML = '';

    var text = Combat.MARK_LIGHT_TEXT[e.key];
    if (text) Wilds._addLog(text);

    /* Section 3: mark light reaction */
    Wilds._markReact('markLight', 'the mark hums. something like approval.');

    /* Loot */
    var loot       = Combat.MARK_LIGHT_LOOT[e.key];
    var carry      = $SM.get('game.carry') || {};
    var carryTotal = Wilds._getCarryTotal();
    if (loot) {
      var amt   = loot.min + Math.floor(Math.random() * (loot.max - loot.min + 1));
      var space = Wilds._getMaxCarry() - carryTotal;
      var take  = Math.min(amt, space);
      if (take > 0) {
        carry[loot.resource] = (carry[loot.resource] || 0) + take;
        $SM.set('game.carry', carry, true);
        Engine.setTimeout(function() {
          Wilds._addLog(take + ' ' + loot.resource + ' received.', 'timestamp');
          Wilds._renderCarry();
        }, 1000);
      }
    }

    /* Track healed creatures */
    $SM.set('playStats.creaturesHealed', ($SM.get('playStats.creaturesHealed') || 0) + 1, true);

    /* Companion reaction */
    if ($SM.get('game.companion.alive') && $SM.get('game.companion.present')) {
      var cName = ($SM.get('game.companion.name') || 'your companion').toLowerCase();
      Engine.setTimeout(function() {
        Wilds._addLog(cName + ' watches the light. \u2018beautiful,\u2019 they whisper.', 'timestamp');
      }, 1500);
    }

    Engine.setTimeout(function() {
      if (Combat._callback) Combat._callback(true);
    }, 1200);
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
    /* Section 12: companion flee line */
    if ($SM.get('game.companion.alive') && $SM.get('game.companion.present')) {
      var cFName = ($SM.get('game.companion.name') || 'your companion').toLowerCase();
      Wilds._addLog(cFName + ' runs beside you.', 'timestamp');
    }
    if (lost > 0) Wilds._addLog(lost + ' resource' + (lost > 1 ? 's' : '') + ' scattered in the retreat.', 'timestamp');
    Wilds._renderCarry();

    /* Flee = callback(false, true) — no haven return, stay on tile */
    if (Combat._callback) Combat._callback(false, true);
  }

};
