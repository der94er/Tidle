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

  /* Final Overhaul §10 — randomized combat text */
  OPENING_LINES: {
    fox:      ['a fox. twisted. it snarls at the light.', 'red eyes in the brush. small. fast.', 'the mark flickers. something is close. a fox, corrupted.'],
    crawler:  ['the ground shifts. roots rise. reaching.', 'twisted wood and sick soil, moving with purpose.', 'it was a tree once. now it hungers.'],
    shade:    ['the air thickens. a shape in the murk.', 'darkness condenses. takes form. watches.', 'a shade. the sickness given shape. it keens.'],
    guardian: ['stone grinds. the guardian wakes.', 'ancient eyes open in the rock. still guarding. still bound.', 'the sentinel stirs. it does not recognize you.']
  },
  VICTORY_LINES: [
    'it falls. the mark dims. quiet returns.',
    'done. the corruption bleeds into the soil and vanishes.',
    'the creature crumbles. the land sighs.'
  ],
  DEFEAT_LINES: [
    'darkness. then the haven. you\u2019re alive. barely.',
    'you wake by the fire. wounded. everything you carried is gone.',
    'the mark flares. drags you home. you don\u2019t remember how.'
  ],

  /* §24.10 — Durability: max values per item */
  ITEM_DURABILITY: {
    crudeSword:  5,
    steelSword:  10,
    crudeArmor:  8,
    steelArmor:  12
  },

  /* Return the active weapon inv-key, or null */
  _equippedWeapon: function() {
    if ($SM.get('game.inventory.steelSword')) return 'steelSword';
    if ($SM.get('game.inventory.crudeSword')) return 'crudeSword';
    return null;
  },

  _equippedArmor: function() {
    if ($SM.get('game.inventory.steelArmor')) return 'steelArmor';
    if ($SM.get('game.inventory.crudeArmor')) return 'crudeArmor';
    return null;
  },

  /* Decrement durability on weapon + armor; break at 0. Called once per combat. */
  _wearEquipment: function() {
    var weapon = Combat._equippedWeapon();
    var armor  = Combat._equippedArmor();

    if (weapon) {
      var wMax = Combat.ITEM_DURABILITY[weapon] || 10;
      var wCur = $SM.get('game.player.weaponDurability', true);
      if (typeof wCur !== 'number') wCur = wMax; /* initialise if missing */
      wCur = Math.max(0, wCur - 1);
      $SM.set('game.player.weaponDurability', wCur, true);
      if (wCur === 0) {
        var wLabel = weapon === 'steelSword' ? 'steel sword' : 'crude sword';
        $SM.remove('game.inventory.' + weapon, true);
        $SM.remove('game.player.weaponDurability', true);
        Engine.setTimeout(function() { Wilds._addLog('your ' + wLabel + ' shatters.', 'timestamp'); }, 600);
      }
    }

    if (armor) {
      var aMax = Combat.ITEM_DURABILITY[armor] || 8;
      var aCur = $SM.get('game.player.armorDurability', true);
      if (typeof aCur !== 'number') aCur = aMax;
      aCur = Math.max(0, aCur - 1);
      $SM.set('game.player.armorDurability', aCur, true);
      if (aCur === 0) {
        var aLabel = armor === 'steelArmor' ? 'steel armor' : 'crude armor';
        $SM.remove('game.inventory.' + armor, true);
        $SM.remove('game.player.armorDurability', true);
        Engine.setTimeout(function() { Wilds._addLog('your ' + aLabel + ' shatters.', 'timestamp'); }, 900);
      }
    }
  },

  /* §24.10 — Label a weapon with its durability: "steel sword (7/10)" */
  weaponLabel: function() {
    var weapon = Combat._equippedWeapon();
    if (!weapon) return null;
    var label  = weapon === 'steelSword' ? 'steel sword' : 'crude sword';
    var atk    = weapon === 'steelSword' ? 5 : 2;
    var max    = Combat.ITEM_DURABILITY[weapon];
    var cur    = $SM.get('game.player.weaponDurability', true);
    if (typeof cur !== 'number') cur = max;
    return label + ' (' + cur + '/' + max + ') \u2014 atk +' + atk;
  },

  armorLabel: function() {
    var armor = Combat._equippedArmor();
    if (!armor) return null;
    var label  = armor === 'steelArmor' ? 'steel armor' : 'crude armor';
    var def    = armor === 'steelArmor' ? 5 : 2;
    var max    = Combat.ITEM_DURABILITY[armor];
    var cur    = $SM.get('game.player.armorDurability', true);
    if (typeof cur !== 'number') cur = max;
    return label + ' (' + cur + '/' + max + ') \u2014 def +' + def;
  },

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

    $SM.set('game.combat.active',      true,     true);
    $SM.set('game.combat.enemyHp',     enemy.hp, true);
    $SM.set('game.combat.lastEnemyHp', enemy.hp, true);
    $SM.set('game.combat.openingShown', false,   true);

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

    /* Final Overhaul §10: randomized opening line (first render only) */
    var opening = Combat.OPENING_LINES[e.key];
    if (opening && !$SM.get('game.combat.openingShown')) {
      $SM.set('game.combat.openingShown', true, true);
      Wilds._addLog(opening[Math.floor(Math.random() * opening.length)]);
    } else {
      Wilds._addLog(e.name + '.');
    }
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

    /* [flee] — not available in sanctum or ambush */
    if (Combat._afterType !== 'sanctum' && Combat._afterType !== 'ambush') {
      var fleeBtn = document.createElement('button');
      fleeBtn.className   = 'action-btn visible';
      fleeBtn.textContent = 'flee';
      fleeBtn.addEventListener('click', function() { Combat._doFlee(); });
      Wilds._actionsEl.appendChild(fleeBtn);
    }

    /* §22: mark's light — fox, crawler, shade only. Costs 5 torch charges (0 with mark lantern). */
    var eKey = Combat._enemy && Combat._enemy.key;
    if (eKey === 'fox' || eKey === 'crawler' || eKey === 'shade') {
      var torchCharges = $SM.get('game.inventory.torchCharges', true) || 0;
      var lantern      = !!$SM.get('game.inventory.markLantern');
      var canLight     = lantern || torchCharges >= 5;

      var lightBtn = document.createElement('button');
      lightBtn.className   = 'action-btn visible';
      lightBtn.textContent = 'offer the mark\u2019s light';
      lightBtn.disabled    = !canLight;
      if (!canLight) lightBtn.title = 'need 5 torch charges (or mark lantern)';
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

    /* §24.10: wear equipment each combat round */
    Combat._wearEquipment();

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

    var vLine = Combat.VICTORY_LINES[Math.floor(Math.random() * Combat.VICTORY_LINES.length)];
    Wilds._addLog(vLine);

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
    $SM.set('game.player.wounded',   true,  true);
    $SM.set('game.player.healAtDay', ($SM.get('game.day', true) || 0) + 2, true);
    $SM.set('game.carry',            {},    true); /* GDD §10: lose all carried resources */
    $SM.set('game.wilds.onExpedition', false, true); /* expedition ends on loss */
    $SM.set('playStats.combatLosses', ($SM.get('playStats.combatLosses') || 0) + 1, true);

    var dLine = Combat.DEFEAT_LINES[Math.floor(Math.random() * Combat.DEFEAT_LINES.length)];
    Wilds._addLog(dLine);

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

  /* §22: mark's light data */
  MARK_LIGHT_LOOT: {
    fox:     { resource: 'herbs', min: 2, max: 4 },
    crawler: { resource: 'wood',  min: 3, max: 5 }
    /* shade: no resource reward */
  },

  MARK_LIGHT_TEXT: {
    fox:     'the fox\u2019s eyes clear. it nuzzles the green before leaving.',
    crawler: 'the roots settle back into the soil. a shoot of green appears.',
    shade:   'the shade dissolves. where it stood, the air is clean.'
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
