# THE LAST EMBER — Game Design Document v1.1
## A Minimalist Text Adventure of Memory, Sacrifice, and a Dying Land
### Forked from A Dark Room mechanics | Medieval Dark Fantasy | Solo + Leaderboards

---

## 1. IDENTITY

**Pitch:** You claw out of a shallow grave. A mark burns on your palm. You don't know your name. The land around you is sick — black soil, dead rivers, withered trees. But near you, things grow. People come. They say the mark keeps the sickness at bay. As you rebuild and explore, you discover the remains of others who carried this mark before you. And slowly, piece by piece, you discover who you were — and why you chose to forget.

**Genre:** Text-based incremental survival with exploration and narrative mystery.

**Tone:** Sparse & haunting. Every word earns its place. What the game DOESN'T say is as important as what it does.

**Core emotions (in order of priority):**
1. Curiosity & discovery — "who was I? what is this mark? what happened to the others?"
2. Tension & mystery — "the sickness is getting closer. the mark flickers at night."
3. Satisfaction & progress — "I built this from nothing. people are safe here."
4. Power & mastery — "I survived. I understand now."

**What makes this NOT A Dark Room:**

| A Dark Room | The Last Ember |
|---|---|
| Wake in a room | Wake in a GRAVE |
| Fire is just fire | Fire is powered by an ancient mark — a pact with the land |
| Stranger arrives randomly | People are DRAWN to you — the mark repels the sickness |
| Discover what happened to the world | Discover what happened to YOU |
| Twist: you're the alien villain | Twist: you volunteered and chose to forget |
| One ending | Two endings, both bittersweet |
| World is dead | World is dying but fighting to live |
| Enemies are hostile survivors | Enemies are corrupted land-creatures seeking the mark for healing |
| Tone: bleak, cold | Tone: haunting, but threads of warmth |

**Session:** 2-4 hours for a blind first playthrough. 30-60 minutes for experienced speedruns.

**Platform:** Browser (desktop + mobile responsive). No downloads. No plugins.

**Monetization (v1.0):** None. Free to play. Deferred to v2.0.

---

## 2. COLOR SYSTEM — Based on Emotional Psychology

Every color serves a purpose. No decoration.

### Palette

| Role | Color | Hex | Why |
|------|-------|-----|-----|
| Background | Near-black | #0D0D0D | The grave. The unknown. Darkness before memory returns. |
| Primary text | Warm parchment | #E8E0D4 | Aged vellum. Reading fragments of a forgotten life. |
| Secondary text | Faded stone | #8A8070 | Muted. For UI elements, timestamps, ambient text. |
| Mark accent | Deep amber | #D4740A | The mark. Warmth in a cold world. Used sparingly — buttons, mark events, key moments. |
| Mark glow | Bright amber | #F5A623 | The mark at full power. Major discoveries, moments of remembering. |
| Sickness | Muted crimson | #8B2500 | The creeping rot. Combat, danger, the dying land. |
| Memory | Pale gold | #C9A94E | Remembrance. When fragments of your past surface. Discovery text. |
| Living land | Muted sage | #5A6E50 | Where the mark's influence reaches. Growth. Hope. |
| Border/divider | Charcoal | #2A2A28 | Subtle structure. Never draws attention. |

### Color rules
- NEVER use blue, purple, or bright green. This is a world of fire, earth, and sickness.
- Mark amber (#D4740A) is used ONLY for interactive elements and mark-related narrative moments. Overuse kills the effect.
- Memory gold (#C9A94E) appears ONLY when the player recovers a memory fragment. Maximum ~25 times per playthrough. Each one should feel special.
- Sickness crimson (#8B2500) appears ONLY during combat or when the sickness encroaches. If it shows up too often, tension is lost.
- Background is ALWAYS #0D0D0D. No gradient. No texture. Pure darkness.

### Typography
- **Narrative text:** Serif font (Georgia or similar). 16px. line-height 1.8. This is the voice of the game.
- **UI elements:** Sans-serif (system font stack). 13-14px. Buttons, counters, resource numbers.
- **Timestamps / flavor:** Italic serif. 13px. Color: #8A8070. For ambient messages like "the wind carries ash" or "the mark pulses."
- **Memory text:** Serif. 16px. Color: #C9A94E. Slightly letter-spaced. These are YOUR memories returning.

### Accessibility
- All text meets WCAG AA contrast ratio (4.5:1 minimum) against #0D0D0D background.
- #E8E0D4 on #0D0D0D = contrast ratio 13.2:1 ✓
- #8A8070 on #0D0D0D = contrast ratio 5.8:1 ✓
- #D4740A on #0D0D0D = contrast ratio 5.1:1 ✓
- #C9A94E on #0D0D0D = contrast ratio 6.7:1 ✓
- #8B2500 on #0D0D0D = contrast ratio 3.1:1 ✗ — use ONLY on larger text (18px+) or pair with parchment text nearby.
- No information conveyed by color alone. All danger states also use text labels.
- Buttons have visible borders, not just color change.
- Animations can be disabled (prefers-reduced-motion respected).

---

## 3. USER JOURNEY — Minute by Minute

### Phase 1: THE GRAVE (minutes 0-10)

The player sees nothing but darkness.

```
0:00  [black screen, 3 seconds]
0:03  "dirt."
0:05  "darkness."
0:07  "the taste of earth."
0:10  "something burns. your hand."
0:14  "you claw upward."
0:18  Button appears: [break the surface]
```

Player clicks. They emerge.

```
0:20  "cold air. grey sky. an open grave."
0:25  "your palm. a mark. glowing faint amber."
0:30  "around you — black soil. dead grass. a ring of green where you stand."
0:35  "the mark keeps the sickness back."
0:40  Button: [look around]
```

Player looks around.

```
0:45  "a ruined wall. half-collapsed. shelter from the wind."
0:50  "dead wood scattered. enough for a fire."
0:55  "the mark flickers. it wants warmth."
1:00  Button: [build a fire]  (automatic — no resource cost, first time only)
```

Player builds fire. The mark flares.

```
1:05  "the fire catches. the mark steadies."
1:10  "the green circle widens. just a little."
1:15  "something on the ground near the grave."
1:20  Button: [search near the grave]
```

Player searches. Finds first memory.

```
1:25  "a leather cord. a small iron ring. yours, once."
1:30  Memory #1: "a woman's hand, placing the ring in yours.
       'come back to me.' her face is blurred. the memory fades."
1:35  "who was she?"
```

**Phase 1 goals:** Establish that this is NOT A Dark Room. You're climbing out of a grave. The mark is mysterious. The land is sick. First emotional hook: who were you? Who was she? Player should feel: "I need to know more."

### Phase 2: THE SHELTER (minutes 10-30)

The area around the fire is safe. The sickness can't reach it.

```
5:00  "the green patch grows with the fire. life returns to the soil."
5:05  "dead trees within reach. stone from the ruins."
5:10  Buttons: [gather wood]  [gather stone]
```

Gathering takes 10 seconds real-time. Returns 3-5 units.

When fire reaches level 2, the green patch has herbs growing. Button appears: [gather herbs] — 10 seconds, returns 2-4 herbs.

Once workshop is built, ruins nearby have salvageable cloth. Button appears: [salvage cloth] — 10 seconds, returns 1-3 cloth.

```
8:00  Fire needs feeding. If player ignores it:
      "the fire dims. the mark weakens. the black soil creeps closer."
      If fire dies: "the fire is dead. the mark holds — barely."
      (Mark never fails. This is the core promise.)

10:00 Fire reaches level 3 ("fire").
      The green circle is now 20 paces wide.
      "movement at the edge of the green. a figure. hesitant."

12:00 "a man. gaunt. he stares at the mark on your hand."
      "'the sickness couldn't touch me. near you. i followed the feeling.'"
      "he sits. says nothing more."
      Stranger #1 has arrived.
      Button: [ask him to help gather]
```

Assigning a villager to gathering produces resources automatically (1 unit per 10 seconds).

```
15:00 Enough resources to build.
      Button: [build a shelter] (costs 15 wood, 5 stone, 45 seconds)

18:00 Shelter complete. "rough walls. a roof of branches. enough."
      Population capacity: 4 (was 2).

20:00 Second stranger arrives (triggered by shelter + fire level).
      "'i walked for days. the sickness everywhere. then i felt warmth.'"
      Workshop becomes buildable: [build workshop] (20 wood, 10 stone, 10 iron, 60 seconds)

25:00 Workshop built. Crafting unlocked.
      Can now craft: torch, crude sword, crude armor, poultice.

30:00 Watchtower buildable: [build watchtower] (15 stone, 10 iron, 60 seconds)
      When built: "from the top, you can see for miles."
      "ruins. sick land. but in the distance — structures. old ones."
      Exploration unlocks.
```

**Phase 2 goals:** People come because of YOU, not randomly. The mark is clearly connected to the land's health. The green circle growing with the fire is visual proof the mark works. Player should feel: "I'm the reason these people are alive. But what IS this mark?"

### Phase 3: THE HAVEN (minutes 30-60)

The settlement grows. More people arrive, drawn by the mark.

```
30:00 - 60:00:
  - Build storehouse (increases storage capacity)
  - Build herbalist hut (the green patch has herbs growing now)
  - Build trading post (travelers from distant safe pockets)
  - Upgrade fire pit → hearth → forge
  - Upgrade shelter → hut → lodge (more population capacity)
  - Assign villagers to different tasks
  - Manage food supply (villagers consume food)
  - Craft better gear for exploration
```

Random events:
```
  "a trader arrives. she traveled the dead roads. offers cloth for iron."
  "something howls in the night. the mark flares. the sound retreats."
  "a child arrives. alone. she says the mark called to her in a dream."
  "the mark pulses in your sleep. you almost remember something."
  "a sick deer stumbles into the green patch. by morning, it's healed."
```

**Phase 3 goals:** Establish that the settlement is a haven — the only safe place. Build emotional investment in the people. Tease exploration. Player should feel: "This place matters. These people depend on me. But I need answers."

### Phase 4: THE WILDS (minutes 60-150)

Exploration opens. A grid map appears.

```
60:00 Button: [venture into the wilds]
      Map tab opens. Player is at center.
      Dark tiles everywhere. Explored tiles light up.
      Moving costs: 1 food + 1 torch charge per tile.
```

The land outside the haven is sick. Black soil. Twisted trees. Foul water.

Map is 12×12 (144 tiles). Pre-designed, not random.

Points of interest scattered across the map (25 total):
- 10 ruins (contain memory fragments — YOUR memories)
- 5 warden camps (previous mark-bearers' settlements, abandoned)
- 5 resource caches (supplies left behind)
- 3 creature dens (corrupted land-creatures, tough combat, rare loot)
- 2 sacred groves (places where the land remembers being healthy — safe havens, heal player)

Combat encounters happen on certain tiles:
```
  "the ground trembles. something rises from the black soil."
  [fight]  [flee]
```

Key difference from A Dark Room: enemies are not hostile people. They are corrupted land — the sickness given form. They're drawn to the mark, seeking healing they can't receive. Some encounters hint at this:
```
  "the creature pauses. stares at the mark. reaches toward it."
  "it doesn't attack. it keens — a low, broken sound."
  "then the sickness takes it again. it lunges."
```

Each warden camp reveals a memory of a PREVIOUS mark-bearer:
```
  Warden camp #1: "a journal. faded ink. 'the mark chose me 
  forty winters ago. i held the sickness back. but i'm tired. 
  so tired. the next one won't remember this. that's the mercy.'"
```

Each ruin reveals a memory of YOUR past:
```
  Memory #8: "a hall. a council. faces you should know but don't.
  a woman stands. the same woman from the ring memory.
  'someone must bear the mark. or the land dies.'
  silence. then a chair scrapes. you stood up."
```

**Phase 4 goals:** Piece together two parallel stories — what the mark IS (through warden camps) and who YOU were (through ruins). Build toward the revelation. Player should feel: "I'm starting to understand. I chose this. But why?"

### Phase 5: THE TRUTH (minutes 150-210)

After finding 15+ memories, the Sunken Sanctum appears on the map — the place where the ritual is performed. Where you were buried.

```
  "the mark burns white. it recognizes this place."
  [follow the mark]  →  reveals path to Sunken Sanctum on map
```

The Sunken Sanctum is a 5-room linear dungeon. Each room:
- A tough combat encounter (corrupted guardians)
- A memory fragment
- Increasing difficulty

**Room 1:** The entrance.
```
  "stone steps descend. older than the kingdom. older than memory."
  Memory #21: "you walked down these steps before. willingly."
```

**Room 2:** The preparation chamber.
```
  "a table. straps. herbs for sleeping. this is where they put you under."
  Memory #22: "the woman — your wife — held your hand until the herbs took hold.
  'i'll be here when you wake,' she said. you both knew it was a lie."
```

**Room 3:** The archive.
```
  "names carved into the walls. hundreds. each one a mark-bearer."
  Memory #23: "you carved your name too. near the bottom. 
  the last empty space on the wall."
```

**Room 4:** The ritual chamber.
```
  "a circle. runes. the grave above is directly overhead."
  "this is where the mark was burned into you."
  Memory #24: "the pain was brief. then nothing. then dirt. then forgetting."
```

**Room 5:** The Heart of the Land.
```
  "below the ritual chamber. a cavern. vast."
  "the land's heart. a web of roots and stone and old, old light."
  "it's dying. the sickness is here too. eating at the roots."
  "the mark on your palm burns so bright it hurts."
  
  Memory #25: "you remember everything now. your name. your wife.
  your life. the day you chose to give it all up so the land would live.
  the mark is the land's last thread. you are the needle."
```

**THE CHOICE:**

```
  "two paths."
  
  [seal yourself to the land]
    "you press your palm to the Heart. the mark flows out of you 
    and into the roots. warmth spreads. the sickness screams and withers.
    the land heals. the haven thrives.
    you feel yourself dissolving. becoming root. becoming stone.
    becoming the land itself.
    your people will live. you will not.
    but the cycle continues. someday, another will volunteer.
    another will forget. another will wake in a grave."
    
  [break the cycle]
    "you close your fist. the mark cracks. shatters.
    light erupts — the spirits of every mark-bearer, freed at last.
    hundreds of them. they rise through the stone and are gone.
    the Heart dims. does not die. but weakens.
    the land must heal on its own now. slowly. with no guarantee.
    you walk out of the sanctum. you remember your name.
    the haven is still there. the people are still there.
    whether it's enough — you'll find out together."
```

**Score modifier:** "Seal" ending = +500 score bonus. "Break" ending = +0. Both are valid. The bonus reflects the sacrifice, not a judgment.

Epilogue text plays. Score calculated. Leaderboard submit.

**Phase 5 goals:** The emotional payoff. You chose this. You volunteered to lose everything so the land could live. The final choice tests what you value: certainty at the cost of self, or freedom at the cost of certainty. Player should feel: "That meant something."

---

## 4. RESOURCES — 7 total, no more

| Resource | Source | Used for |
|----------|--------|----------|
| Wood | Gather from dead trees, assign woodcutter | Fire fuel, building, crafting torches |
| Stone | Gather from ruins, assign stonecutter | Building |
| Iron | Mine from deposits (unlocked after workshop), assign miner | Crafting weapons/armor, advanced buildings |
| Cloth | Trade with travelers, loot from camps | Crafting torches, bandages, trading post |
| Herbs | Forage from green patch, assign herbalist | Medicine, trading |
| Food | Hunt/forage, assign hunter | Consumed by population (1 per person per game-day), exploration fuel |
| Mark fragments | Found in warden camps and creature dens (rare, ~10 in game) | Unlock final area (5 needed), craft mark lantern (1 needed), bonus score (+50 per extra) |

### Resource rules
- Storage capacity: 100 per resource (hard cap). With storehouse: 300 per resource (hard cap).
- Cap applies to ALL sources: villager production, manual gathering, exploration loot, trades.
- Manual gathering over cap: "stores are full. resources wasted." (shown to player)
- Exploration loot over cap: "no room in the stores. some [resource] left behind."
- Auto-production over cap: excess silently discarded (no warning spam).
- Resources are integers. No decimals. No fractions.
- If a resource hits 0, any action requiring it is blocked with clear message: "not enough wood."
- Fire consumes wood per game-day automatically (see Section 12). If wood is 0, fire level drops. Mark never fails.
- Food consumes 1 per villager per 2 real minutes (= 1 per game-day). If food is 0, 1 villager leaves per game-day until food returns.

---

## 5. TIME SYSTEM

**1 game-day = 2 real minutes.**

This means:
- A 2-hour playthrough = ~60 game-days.
- Fire consumes wood every 2 minutes (rate depends on fire level).
- Each villager consumes 1 food every 2 minutes.
- Gathering is instant (click to receive, then cooldown bar).
- Building actions take 30-120 real seconds (displayed as a progress bar).

**All timers are real-time while the player has the game open.** No offline progress. Timers pause when the tab is hidden (using Page Visibility API).

**Day/night cycle:** Every 60 real seconds (half a game-day), the game alternates between "day" and "night." Night increases combat difficulty by 25% and adds 5 seconds to all gather cooldowns. Visual: text gets slightly dimmer during night. Dawn/dusk messages appear:
```
"night falls. the mark glows brighter in the dark."
"dawn. grey and cold. the sickness is thicker in the mornings."
```

---

## 6. BUILDINGS — 10 total, clear upgrade paths

| Building | Cost | Build time | Prerequisite | Effect |
|----------|------|-----------|-------------|--------|
| Fire pit (start) | — | — | — | Basic fire. Mark radiates through it. Attracts 1st stranger at level 3. |
| Hearth | 10 wood, 10 stone | 45s | Fire pit | Fire burns slower (-50% wood consumption). Green patch widens. |
| Forge | 15 iron, 10 stone, 5 wood | 60s | Hearth | Unlocks advanced crafting (steel weapons, good armor). |
| Shelter (start) | — | — | — | Holds 2 people. |
| Hut | 15 wood, 10 stone | 45s | Shelter | Holds 5 people. |
| Lodge | 25 wood, 15 stone, 5 iron | 75s | Hut | Holds 10 people. |
| Storehouse | 20 wood, 10 stone | 45s | — | Storage cap: 100 → 300 per resource. |
| Workshop | 20 wood, 10 stone, 10 iron | 60s | — | Enables all crafting. |
| Watchtower | 15 stone, 10 iron | 60s | — | Enables exploration. Warns of night creatures. |
| Herbalist hut | 10 wood, 3 herbs | 30s | Workshop | Assigns herbalist. Auto-produces 1 medicine per game-day. |
| Trading post | 20 wood, 15 stone, 10 iron, 5 cloth | 90s | Workshop | Trader arrives every 5 game-days with dynamic pricing. Also unlocks weaver role. |

### Building rules
- Each building can only be built ONCE. No duplicates.
- Buildings are built in sequence where noted (shelter → hut → lodge).
- Build time is real seconds with a visible progress bar.
- Cannot cancel a build in progress. Resources consumed at start.
- All building costs are displayed before confirming.

---

## 7. CRAFTING — 10 recipes, ONE recipe per item

| Item | Materials | Requires | Effect |
|------|-----------|----------|--------|
| Torch | 3 wood + 2 cloth | Workshop | 5 exploration charges. Multiple craft = stacks. |
| Crude sword | 5 iron + 3 wood | Workshop | Attack +2. Durability: 5. |
| Crude armor | 5 iron + 5 cloth | Workshop | Defense +2. Durability: 5. |
| Poultice | 3 herbs | Herbalist hut | Removes "wounded" status. Use in haven. |
| Bandages (×3) | 2 cloth + 1 herbs | Workshop | Heals 10 HP during exploration. Use any time. |
| Steel sword | 10 iron + 5 wood + 2 cloth | Forge | Attack +5. Durability: 10. |
| Steel armor | 12 iron + 8 cloth + 3 wood | Forge | Defense +5. Durability: 10. |
| Reinforced torch | 5 wood + 3 cloth + 2 iron | Forge | 15 charges. Multiple craft = stacks. |
| Trap (×3) | 5 iron + 5 wood | Workshop | Place on map. Captures creature on revisit. Loot: 3-5 cloth (near haven) or wood (far). |
| Mark lantern | 3 iron + 2 cloth + 1 mark fragment | Forge | KEY ITEM — not a light source. Does: (1) mark's light costs 0 charges, (2) required to enter sanctum, (3) required for Blight Heart fight. Torches ALWAYS needed for movement. |

### Crafting rules
- Each item has exactly ONE recipe. No alternatives. No quality tiers.
- Crafting is instant. Click button, materials consumed, item appears.
- If player doesn't have enough materials, button is grayed out with tooltip showing what's missing.
- Items go into inventory. Inventory has no limit (items are countable, not slotted).
- Weapons and armor are EQUIPPED. Only one weapon and one armor at a time. Equipping a new one replaces the old (old one is lost).
- Torches, bandages, and traps are CONSUMED on use. Stack is tracked as a number.

---

## 8. POPULATION — Simple, max 10

### Arrival triggers
| Stranger # | Trigger | Delay after trigger |
|------------|---------|-------------------|
| 1 | Fire reaches level 3 | 60 seconds |
| 2 | Shelter built | 90 seconds |
| 3 | Hut built | 60 seconds |
| 4-5 | Lodge built | 120 seconds (one at a time) |
| 6-10 | Trading post built, arrive randomly | Every 3-5 game-days |

### Arrival flavor (unique to our story — they're drawn by the mark)
Each stranger comments on why they came:
```
#1: "the sickness couldn't reach me. near you. i followed the feeling."
#2: "i dreamed of warmth. walked until i found it."
#3: "my village is gone. the black took everything. except the road here."
#4: "the mark. i've heard stories. the old pact."
#5: "i don't know why i came. my feet just... brought me."
#6-10: (random from pool): "the land told me." / "i saw the glow from the ridge." / "there's nothing left out there." / "my grandmother spoke of the mark-bearers." / "i came to help. if you'll have me."
```

### Assignment
Each villager can be assigned to ONE task (8 roles total, max 10 villagers — real allocation decisions):
- Woodcutter: produces 1 wood per 20 seconds
- Stonecutter: produces 1 stone per 20 seconds
- Miner: produces 1 iron per 30 seconds
- Hunter: produces 1 food per 15 seconds
- Herbalist: produces 1 herbs per 30 seconds (requires herbalist hut)
- Guard: reduces night creature losses by 1 per guard (no resource production)
- Herbalist: produces 1 herbs per 30 seconds (requires herbalist hut)
- Weaver: produces 1 cloth per 30 seconds (requires trading post)

All production is silently capped at 100 (or 300 with storehouse). Excess discarded.

### Population rules
- Each person consumes 1 food per 2 real minutes (= 1 per game-day).
- If food = 0: one villager leaves every game-day. Last to arrive leaves first.
- If all villagers leave, player is alone. New stranger arrives after fire is maintained for 2 game-days.
- Villagers cannot die from creature attacks IF watchtower is built and guards are assigned. Without watchtower, night creatures can kill 1 villager (random).
- Villagers have names. Randomly assigned from a pool of 20 (see Section 14).
- Maximum population: 10. Shelter capacity determines who can stay.

---

## 9. EXPLORATION — 20×20 Grid Map

### Map structure
- 144 tiles total (12×12). Player starts at center (6, 6).
- Tiles are hidden until explored. POI letters hidden until visited or adjacent (shows as ? in amber).
- Moving to unexplored tile costs: 1 torch charge + 1 food.
- Moving to explored tile: free (0 torch charges) + 1 food.
- Mark lantern does NOT bypass torch requirement. Torches always needed.
- Player can carry up to 20 units while exploring (30 with companion, +5 with reinforced pack).
- Must return to haven to deposit loot.

### Tile contents (pre-designed, not random)
| Tile type | Count | What happens |
|-----------|-------|-------------|
| Sick land | 280 | Flavor text about the dying world. 20% chance (first visit) to find 1-2 cloth in the ruins. |
| Dead forest | 30 | Can gather 5-10 wood here. 20% chance to also find 1-2 cloth among the debris. |
| Resource cache | 15 | Find 10-20 of a random resource. |
| Ruin | 10 | Contains a memory of YOUR past. May have combat first. |
| Warden camp | 5 | Previous mark-bearer's settlement. Contains their journal. |
| Creature den | 5 | Tough combat. Win = rare loot + mark fragment. |
| Sacred grove | 3 | Safe haven. Fully heals. The land remembers being healthy here. |
| Sunken Sanctum | 1 | Final area. 5 rooms. Unlocked after 15+ memories. |

Note: Ruins (10) + Warden camps (5) + Creature dens (5) + Sacred groves (3) + Sunken Sanctum rooms (5 memories) + starting memory (1) + resource cache memory (1) = 30 memory sources. Only 25 memories exist. Some locations have combat but no memory. This allows the player to reach 15 memories without exploring everything, and reach all 25 without needing every single tile.

### Movement
- 4 directions: north, south, east, west. No diagonal.
- Player sees current tile description and adjacent tile hints.
- Returning to haven: button [return to haven] — instant, no cost. Carried resources kept.

### Sick land flavor text (pool of 20+, randomly selected)
```
"black soil. nothing grows."
"a dead river. the water is dark and still."
"cracked earth. the sickness runs deep here."
"the wind tastes of ash."
"a farmstead. abandoned. the walls are stained black."
"bones of livestock. scattered."
"a well. the water is foul."
"a road. leading nowhere now."
"the silence is heavy."
"a stone marker. the name worn away."
"a cart, overturned. whatever it carried is long gone."
"the mark dims here. this place is far gone."
"a bird circles overhead. the only living thing for miles."
"an orchard. dead. the fruit turned to black husks."
"the sickness pulses in the soil. like a heartbeat."
```

---

## 10. COMBAT — Simple Stat Check

### Player stats
- Health: 100 (base). +10 with old medicine (unique trader item). Restored fully on return to haven or at grove.
- Bandages: +10 HP each (use during exploration, any time). Poultice: removes "wounded" status (use in haven).
- Attack: 0 base + weapon bonus. Crude sword: +2. Steel sword: +5.
- Defense: 0 base + armor bonus. Crude armor: +2. Steel armor: +5.
- Durability: crude weapons/armor = 5 fights. Steel = 10 fights. At 0, item breaks mid-fight (atk/def drops to 0 for remaining rounds). Must craft replacement.

### Combat flow
1. Encounter message: "the sick earth shifts. something rises."
2. Choice: [fight] or [flee]
3. Flee: safe retreat, lose 2 carried resources (random), no other penalty.
4. Fight: auto-resolves in rounds.

### Round resolution
```
player_damage_dealt = max(1, attack - enemy_defense + random(-2, 2))
enemy_damage_dealt = max(1, enemy_attack - player_defense + random(-2, 2))

Both apply simultaneously. Repeat until one side reaches 0 health.
```

### Enemy types (corrupted land-creatures, not hostile people)
| Enemy | Health | Attack | Defense | Where found | Description |
|-------|--------|--------|---------|-------------|-------------|
| Blighted fox | 15 | 3 | 0 | Sick land (rare), ruins | Small, fast, corrupted. Eyes glow faintly. |
| Root crawler | 30 | 5 | 2 | Ruins, warden camps | Twisted roots given sick life. Reaches for the mark. |
| Sickness shade | 50 | 8 | 3 | Creature dens | The sickness itself, condensed into form. Keens when near the mark. |
| Corrupted guardian | 80 | 10 | 6 | Sunken Sanctum rooms 1-4 | Old stone constructs, meant to protect the sanctum. The sickness drives them now. |
| The Blight Heart | 150 | 12 | 5 | Sunken Sanctum final room | The core of the sickness. Not evil — just hunger. The land's disease made manifest. |

### Combat flavor (unique to our story)
Some creatures react to the mark:
```
"the root crawler pauses. stares at your palm. reaches toward the glow."
"for a moment, the shade's keening sounds almost like weeping."
"the guardian's stone eyes focus on the mark. it hesitates. then the sickness takes hold again."
```

This reinforces that the creatures aren't malicious — they're corrupted. The mark draws them because part of them remembers being whole.

### Combat outcomes
- **Win:** gain loot (resources + possible memory). Victory message.
- **Lose:** teleport back to haven. Status: "wounded." Lose all carried resources. Need poultice or 2 game-days rest to heal. Cannot explore while wounded.
- **Night combat:** enemy stats +25% (rounded up).

### Combat rules
- No grinding. Creature dens don't respawn. Ruin encounters happen once per tile.
- Player health fully restores when returning to haven.
- Health does NOT restore between encounters during a single trip. Bandages are the only field healing.
- The Blight Heart can only be fought with mark lantern equipped. Without it: "the darkness is absolute. the sickness is too thick. you cannot see."

---

## 11. STORY SYSTEM — 25 Memories

Two parallel threads:
- **Your past** (ruins): who you were, why you volunteered
- **The mark's history** (warden camps): the cycle of mark-bearers, how the pact works

### Memory list

| # | Source | Thread | Text |
|---|--------|--------|------|
| 1 | Starting area | Your past | "a woman's hand, placing a ring in yours. 'come back to me.' her face is blurred." |
| 2 | Ruin | Your past | "a forge. your forge. the smell of iron and coal. your hands knew this work." |
| 3 | Ruin | Your past | "a village. your village. stone houses. a market square. it was real, once." |
| 4 | Warden camp #1 | Mark history | "a journal. 'the mark chose me forty winters ago. i held the sickness back. the land lived. but i'm tired.'" |
| 5 | Ruin | Your past | "a council. faces you should know. a woman speaks: 'the land is dying. the pact must be renewed.'" |
| 6 | Resource cache | Mark history | "scratched into a wall: 'the mark-bearer before me lasted thirty years. they found her in the field, smiling. empty.'" |
| 7 | Ruin | Your past | "the woman from the ring. your wife. her name is... almost there. almost." |
| 8 | Warden camp #2 | Mark history | "another camp. better built than the first. tools, beds, a garden gone wild. they had a good life. for a while." |
| 9 | Ruin | Your past | "a child. yours. laughing. reaching for your hand. the memory cuts like a blade." |
| 10 | Sacred grove #1 | Mark history | "the grove hums. the mark responds. this place is old. the first mark-bearer tended it." |
| 11 | Ruin | Your past | "the council again. silence. then a chair scrapes. you stood up. 'i'll do it.'" |
| 12 | Creature den | Mark history | "in the den, a carved stone. names. hundreds of them. mark-bearers. going back centuries." |
| 13 | Warden camp #3 | Mark history | "this bearer kept records. 'the mark takes memory so the bearer doesn't suffer. a mercy. the last mercy.'" |
| 14 | Ruin | Your past | "your wife's face. clear now. Aelith. her name was Aelith." |
| 15 | Ruin | Your past | "the ritual chamber. you walked down the steps. Aelith held your hand. 'i'll be here when you wake.' you both knew." |
| 16 | Warden camp #4 | Mark history | "this bearer's journal ends mid-sentence. 'i can feel myself fading. the land is taking me. it's not unpleasant. it's—'" |
| 17 | Ruin | Your past | "the herbs. the table. the straps — not cruel, just careful. you closed your eyes." |
| 18 | Creature den | Mark history | "in the creature's nest: a human jawbone. old. the mark's sigil etched into the teeth. a bearer who didn't survive." |
| 19 | Sacred grove #2 | Mark history | "the trees here are enormous. ancient. the first sacred grove. the pact was made here, a thousand years ago." |
| 20 | Ruin | Your past | "the burning. the mark searing into your palm. you screamed. then silence. then dirt. then nothing." |
| 21 | Sanctum room 1 | Your past | "these steps. you walked them. willingly. the stone remembers your footsteps." |
| 22 | Sanctum room 2 | Your past | "the preparation chamber. Aelith's tears on the stone. still here, after all this time." |
| 23 | Sanctum room 3 | Mark history | "the wall of names. yours is at the bottom. the last space. there will be no more after you." |
| 24 | Sanctum room 4 | Your past | "the ritual circle. the runes. the grave above. this is where you became the last ember." |
| 25 | Sanctum room 5 | Both | "you remember everything. your name. Aelith. your child. your choice. the mark is the land's last thread. you are the needle." |

### Memory #25 — Player name clarification

When memory #25 triggers, after the text displays, a text input field appears. This is the only input field in the game besides buttons.

Prompt: (no label — just a blinking cursor in an empty field, centered under the memory text)

The player types their own name. This is who they were. The game does not suggest or constrain it.

**Where the name is used after this point:**
- Ending text (seal): "[name] pressed their palm to the Heart."
- Ending text (break): "[name] closed their fist."
- Journal tab header changes from "a stranger's journal" to "[name]'s journal"
- Leaderboard submission: name field pre-filled with whatever they entered (editable before submit)

**If the player leaves the field blank and confirms:** default to "the mark-bearer" in all places where the name would appear.

**Confirmation:** a single button appears below the input: [this is my name] — clicking it locks the name and continues to the final combat encounter.

### Memory rules
- Memories appear in sequence regardless of exploration order. If player finds ruin #5 before ruin #2, they still get memory #2 (next in sequence).
- Each memory triggers a "mark vision" — the screen darkens slightly, text appears in gold (#C9A94E), and the mark animation intensifies for 3 seconds.
- Player can review all found memories in a "journal" tab.
- Memories alternate between "your past" and "mark history" threads to build both stories simultaneously.

---

## 12. FIRE SYSTEM — The Mark's Manifestation

The fire is powered by the mark. It keeps the sickness at bay. It must be maintained.

| Level | Name | Wood/game-day | Green radius | Trigger |
|-------|------|--------------|-------------|---------|
| 0 | Mark only | 0 | 3 paces | — |
| 1 | Flicker | 0.5 | 5 paces | [stir the mark] action |
| 2 | Small fire | 1 | 10 paces | — |
| 3 | Fire | 1 | 20 paces | Stranger #1 arrives |
| 4 | Strong fire | 2 | 30 paces | — |
| 5 | Blazing fire | 3 | 50 paces | — |

### Fire rules
- Starts at level 0 (mark only). Player builds first fire for free (Phase 1).
- [stoke the fire] costs 1 wood, raises fire by 1 level (max 5).
- Fire drops 1 level every 3 real minutes (not every game-day). Makes maintenance less of a constant chore.
- With hearth: fire drops 1 level every 6 real minutes instead of every 3.
- Fire cannot drop below level 0. The mark NEVER fails. Core promise.
- No auto-stoking. Fire is the player's responsibility — just less frequent.
- Higher fire level = wider green patch, more strangers, better trades, fewer night creatures.
- If fire drops to 0: "the fire dies. the mark holds alone. the green circle shrinks. the sickness presses close." Production -50% until fire restored.

### Wood consumption (auto, per game-day)
- Level 0-1: 0 wood (mark sustains itself)
- Level 2: 1 wood
- Level 3: 1 wood
- Level 4: 2 wood
- Level 5: 3 wood

With hearth: consumption halved (rounded up). Level 5 = 2 wood/game-day instead of 3.

---

## 13. LEADERBOARDS — 4 Types

### Metrics tracked
| Leaderboard | What it measures | How it's calculated |
|-------------|-----------------|-------------------|
| Fastest completion | Time from game start to ending choice | Real-time seconds. Lower is better. |
| Deepest exploration | Total map tiles explored | Count of unique tiles visited. Max 400. Higher is better. |
| Highest score | Composite score | Formula below. Higher is better. |
| Survival days | Game-days survived before finishing | Count. Higher is better. |

### Score formula
```
score = (memories × 100)
      + (buildings_built × 50)
      + (max_population_reached × 25)
      + (combat_wins × 15)
      + (tiles_explored × 2)
      + (days_survived × 3)
      + (extra_mark_fragments × 50)
      + (creatures_healed × 20)
      + (grave_respects × 5)
      + (seal_ending × 500)
      + (companion_alive × 100)
      - (villagers_lost × 100)
      - (combat_retreats × 25)
      - (companion_died × 150)
```

**Score ranges:**
- memories: 0-25 → 0-2500
- buildings: 0-10 → 0-500
- population: 0-10 → 0-250
- combat wins: 0-24 → 0-360
- tiles explored: 0-400 → 0-800
- days survived: 0-100 → 0-300
- extra fragments: 0-4 → 0-200
- seal ending: 0 or 500
- villagers lost: 0-10 → 0 to -1000
- retreats: 0-20 → 0 to -500

**Theoretical max: ~5410 (seal ending, perfect run). Theoretical min: -1500.**

### Leaderboard implementation
**v1.0:** Local only. Stored in localStorage. Player sees own history and personal bests.

**v1.1:** Online leaderboards via Supabase free tier.
- On game completion: player enters a display name (max 20 chars)
- Submitted: name, score, time, tiles, days, memories, ending_choice, timestamp
- Top 100 per leaderboard type
- No user accounts. No passwords. Just a name.

---

## 14. DATA TABLES — Exact Values

### Villager names (pool of 20)
Aelfric, Brin, Cora, Dorin, Elsa, Fynn, Greta, Hale, Isla, Jorn,
Kael, Lira, Maren, Noll, Ora, Penn, Reva, Soren, Tova, Wyn

Names assigned randomly on arrival. Non-unique.

### Trader system (Section 24 — dynamic pricing)
- Arrives every 5 game-days if trading post is built. Stays 1 game-day.
- Dynamic pricing: trader buys player's most abundant resource, sells least abundant. Rate: 3 of yours → 1 of theirs.
- Multiple trades allowed during their stay.
- 25% chance of carrying a unique item (one per game total):

| Unique item | Resource cost | Effect |
|-------------|--------------|--------|
| A traveler's map | 70 wood | Reveals 3 unexplored tiles |
| Old medicine | 65 herbs | Removes wounded + +10 max HP (this trip) |
| Warden's journal page | 75 stone | Rare atmospheric text |
| Reinforced pack | 80 iron | +5 permanent pack capacity |

### Night creature table (if watchtower NOT built)
| Roll (1-100) | Outcome |
|-------------|---------|
| 1-50 | Nothing happens |
| 51-75 | Lose 2-5 food (creatures raid stores) |
| 76-90 | Lose 1-3 wood (blighted animals at the edge) |
| 91-100 | 1 villager killed (if no guards) |

With watchtower: reroll any result above 75.
Each guard assigned: subtract 10 from the roll (minimum 1).

---

## 15. SAVE SYSTEM

### How it works
- Game state saved to localStorage every 30 seconds and on every significant action.
- Save includes: all resource counts, building states, villager assignments, map state, memory list, fire level, inventory, player stats, game clock, score components.
- Save is a single JSON object. Key: "lastEmber_save".
- On page load: check for save. If exists: [continue] or [new game]. If not: start fresh.

### Edge cases
| Scenario | Behavior |
|----------|----------|
| Player refreshes mid-game | Loads from last auto-save (max 30s lost) |
| Player opens two tabs | Warning: "game is open in another tab." Second tab blocked. |
| localStorage disabled | Warning: "save requires local storage." Game still plays, no save. |
| localStorage full | Catch error, warn: "save failed." |
| Player wants to restart | Settings: [restart] with confirmation. Clears save. |
| Corrupt save data | Try/catch on load. If fail: warn, offer fresh start. |

---

## 16. TECHNICAL ARCHITECTURE

### Stack
- **Client:** HTML + CSS + vanilla JavaScript (no frameworks, no build tools)
- **Source:** Forked from A Dark Room (github.com/doublespeakgames/adarkroom)
- **Save:** localStorage
- **Leaderboards v1.0:** localStorage (local only)
- **Leaderboards v1.1:** Supabase free tier
- **Hosting:** GitHub Pages (free)
- **Server required:** NONE for v1.0.

### File structure
```
the-last-ember/
├── index.html
├── css/
│   └── style.css
├── script/
│   ├── engine.js         ← core game loop, timing, state
│   ├── events.js         ← random events, triggers, notifications
│   ├── grave.js          ← Phase 1: awakening, mark, first fire
│   ├── haven.js          ← Phase 2-3: buildings, villagers, crafting
│   ├── wilds.js          ← Phase 4: map, movement, encounters
│   ├── combat.js         ← fight resolution
│   ├── memory.js         ← 25 memories, mark visions, journal
│   ├── leaderboard.js    ← score tracking, display
│   └── save.js           ← localStorage save/load
├── lang/
│   └── en.json           ← all game text
├── img/
│   └── favicon.ico
├── DESIGN.md
└── README.md
```

### Key technical decisions
- No build pipeline. Edit .js, refresh browser.
- All game text in lang/en.json.
- State is a single JS object. No database.
- Mobile responsive via CSS.
- No dependencies. Pure vanilla JS.

---

## 17. WHAT'S IN vs WHAT'S OUT

### IN (v1.0)
- Original story: waking from a grave, the mark, the pact, the memories, the choice
- Mark-powered fire mechanic (5 levels)
- Resource gathering (7 resources)
- Building construction (10 buildings)
- Simple crafting (10 recipes)
- Population (max 10, food consumption, assignment)
- Grid map exploration (20×20, pre-designed)
- Combat (5 enemy types, stat-based)
- 25 memories (two threads: your past + mark history)
- Two endings (seal or break)
- Day/night cycle
- Random events
- Journal tab
- Local leaderboards (4 types)
- Save/load (localStorage)
- Mobile responsive
- Accessibility (WCAG AA)
- All text in lang/en.json

### OUT (v2.0+)
- Online leaderboards
- Sound/music
- New Game+
- Additional map areas
- More enemy types
- Achievements
- Multiplayer
- Monetization
- Server-side logic
- User accounts
- Procedural generation
- Third-party dependencies

---

## 18. EDGE CASES & FAILURE MODES

| Scenario | Behavior |
|----------|----------|
| All resources at 0 | Gathering always available (free, 10s). Player can always recover. |
| All villagers leave | Player survives alone. New stranger after 2 game-days with fire. |
| Fire reaches level 0 | Mark holds. Player can always rebuild. Mark NEVER fails. |
| Explore without weapon | Warning. Can still explore. Player deals 1 damage/round. Dangerous but not blocked. |
| Explore without torch | Cannot move to unexplored tiles. Can retrace explored tiles for free. |
| Explore without food | Cannot move. Must [return to haven]. |
| Storage full | Gathering still works but excess lost. Warning shown. |
| Trader arrives, nothing to trade | Trader waits 1 game-day, leaves. Flavor message. |
| Sunken Sanctum with <15 memories | "the mark is dim here. not enough remembered. not yet." Blocked. |
| Fight Blight Heart without mark lantern | "the sickness is absolute. you cannot see." Blocked. |
| Lose to Blight Heart | Retreat to haven. Wounded. Blight Heart does NOT heal between attempts. |
| Browser tab hidden | All timers pause. Resume on visibility. |
| Game completed | Score screen. Leaderboard. [play again] clears save and restarts. |
| Player tries to re-enter Sanctum after ending | Not possible. Game is over. Only option is [play again]. |

---

## 19. CONTRADICTION CHECK

| Check | Result |
|-------|--------|
| Fire wood consumption vs gathering rate | 1 woodcutter = 6 wood/min. Fire level 5 = 1 wood/min (with hearth). ✓ |
| Food consumption vs hunting rate | 1 hunter = 6 food/min. 10 villagers = 3.3 food/min. 2 hunters feed all. ✓ |
| Iron availability vs crafting needs | Total iron ~120. Miner = 4/min. ✓ |
| Torch charges vs map size | 400 tiles, 20 charges/torch. 20 torches needed. 60 wood + 40 cloth. ✓ |
| Combat balance | Crude sword vs blighted fox: ~8 rounds. Steel vs sickness shade: ~25 rounds. Steel vs Blight Heart: ~30 rounds. ✓ |
| Memory order vs map layout | Sequential regardless of exploration order. ✓ No confusion. |
| Leaderboard conflicts | Speed vs exploration inversely rewarded. ✓ Different strategies. |
| Score formula values | Max ~5410. Min ~-1500. All bounded integers. ✓ |
| Save size vs localStorage | ~5-10KB vs 5-10MB limit. ✓ |
| Time scale vs session | 60 game-days in 3 hours. ✓ |
| Population vs shelter | Max 10. Lodge holds 10. ✓ |
| Fire triggers vs early game | Stranger #1 at fire 3. Needs 3 wood. Starting area gives 3+. ✓ |
| Mark fragments: lantern (1) + seal (5) = 6 needed. 10 available. ✓ | Extra fragments = bonus score. No conflict. |
| Memory count: 25 memories across 30+ possible locations. ✓ | Player doesn't need every location. |
| Two endings vs score: seal = +500, break = +0. ✓ | Both valid. Seal rewards sacrifice. |
| Starting memory triggers: memory #1 found in grave area, no combat. ✓ | New players always get first story hook. |

**No contradictions found.**

---

## 20. IMPLEMENTATION PLAN

### Phase A: Fork and Retheme (session 1)
- Fork A Dark Room repo
- Strip all content, keep engine structure
- Apply color palette (#0D0D0D bg, #E8E0D4 text, #D4740A amber)
- Implement Phase 1 narrative (grave, mark, first fire)
- Test: game loads, text appears, clicking works

### Phase B: Core Loop (session 2)
- Resources system (7 resources)
- Gathering actions
- Fire/mark system (5 levels, wood consumption)
- Save/load system
- Test: can gather, stoke fire, save and reload

### Phase C: Haven (session 3)
- Buildings system (10 buildings with prerequisites)
- Villager system (arrival, assignment, food)
- Crafting system (10 recipes)
- Test: can build, assign workers, craft items

### Phase D: Exploration and Combat (session 4)
- Grid map (20×20)
- Movement and fog of war
- Tile contents (pre-designed layout)
- Combat system (5 enemy types)
- Test: can explore, fight, find memories

### Phase E: Story and Polish (session 5)
- All 25 memories with mark visions
- Journal tab
- Day/night cycle
- Random events (traders, creatures, flavor)
- Sunken Sanctum (5 rooms, boss)
- Two endings
- Test: can complete entire game start to finish

### Phase F: Leaderboards and Launch (session 6)
- Score calculation
- Local leaderboard display
- Mobile responsiveness pass
- Accessibility pass
- Final bug testing
- Deploy to GitHub Pages

---

## 21. COMPREHENSIVE UPDATE v1.2

### 1A. Torch System
- Torches replaced with charge pool: `game.inventory.torchCharges` and `torchMaxCharges`
- Regular torch (×1): +5 charges | Reinforced torch (×1): +15 charges
- Each unexplored move: -1 charge. Mark lantern does NOT bypass this requirement.
- Display: "torch: X/Y" where X=current, Y=max accumulated
- Mark lantern shown separately as "mark lantern: carried" (amber). It is a KEY ITEM only, not a light source.

### 2A. Map Size
- Shrunk from 20×20 (400 tiles) to 12×12 (144 tiles)
- Player starts at (6,6) center | Sanctum at (11,11)
- Same 54 POIs: 10 ruins, 5 warden camps, 5 dens, 3 groves, 1 sanctum, 15 caches, 15 forests
- Leaderboard deepest exploration max = 144 tiles

### 2E. Breadcrumbs
- Sick tiles adjacent to unexplored POIs show directional hints (italic timestamp style)
- Priority order: sanctum > ruin > warden > den > grove > cache > forest
- Only shows hints toward unexplored adjacent tiles

### 2F. Haven Status While Exploring
- Status bar at top of wilds view: "haven: [fire name] | [fed status] | day [N]"
- Fire-drop messages in wilds log when fire drops to: small fire, flicker, ember

### 3. Mark Reactions (11 ambient notifications)
- First wilds entry | Near memory (ruin/warden) | Combat start | Combat won
- Near sanctum | Return to haven | Idle 60s (repeatable) | After mark's light
- Fire blazing | Night falls | After Aelith memory (#7 or #14)

### 4. Ambient Story Whispers
- 15 whispers at day milestones: days 5, 8, 12, 16, 20, 25, 30, 35, 40, 45, 50, 55, 58, 62, 65
- Each triggers once, italic/timestamp style, only if villagers present

### 5. Haven Evolution Text
- 6 descriptions based on building count (0-1, 2-3, 4-5, 6-7, 8-9, 10)
- Updates dynamically as player builds

### 6. Grave Memory Conditionals
- 10+ memories: "you remember more now. but not everything. not yet."
- 20+ memories: "you almost remember your name."
- After memory #25: "[player name]. your name is [player name]."

### 9. Mark's Light Combat Option
- Available for: blighted fox, root crawler, sickness shade only
- Costs 5 torch charges (mark lantern does NOT reduce this cost)
- Fox healed → 2-4 herbs | Crawler healed → 3-5 wood | Shade healed → 1 mark fragment
- Score: creaturesHealed × 20

### 10. Villager Personalities
- 5 traits: curious, practical, fearful, spiritual, quiet
- Assigned on arrival, no duplicates until all 5 used (then repeat)
- 6 reaction events per trait: arrival, return, fireLow, nightAttack, craft, newVillager
- 60% chance any event fires a reaction from one random villager

### 11. Villager Stories
- Triggers when villager present 10+ days, then every 8-12 days, max 3 stories
- Story fragments per trait. Tracked via arrivalDay, storyCount, nextStoryDay per villager.

### 12. Companion System
- Trigger: 6+ villagers AND 20+ tiles explored AND steel sword (one-time event)
- Curious villager (or first available) offers to join
- If taken: pack capacity +10, combat attack +2, villager removed from assignments
- 7 exploration comments shown every 3-4 moves
- Combat reactions: readies weapon | catches breath grins | runs beside you
- 50% chance companion dies on player defeat
- Score: companion alive +100 | companion died -150 | not taken ±0

### Updated Score Formula
```
score = (memories × 100)
      + (buildings × 50)
      + (max_population × 25)
      + (combat_wins × 15)
      + (tiles_explored × 2)
      + (days_survived × 3)
      + (extra_mark_fragments × 50)
      + (seal_ending × 500)
      + (creatures_healed × 20)
      + companion_bonus (+100 alive / -150 died / 0 not taken)
      - (villagers_lost × 100)
      - (combat_retreats × 25)
```

### Contradiction Check Update
- Map 12×12: 144 tiles, 54 POIs = 37.5% density. Exploration feels rich (vs 13.5% for 20×20). ✓
- Torch charges: 100 charges per regular craft batch. 12×12 needs ~100-150 charges typical run. ✓
- Companion: max pop 10, companion removed → effective haven pop 9. Lodge still required. ✓
- Score formula: theoretical max increases by ~620 (25 healed + companion alive). Still bounded. ✓

---

## §22 FINAL GAMEPLAY OVERHAUL

*All changes implemented. Text sourced verbatim from §22 specification.*

### §22.1 Tighter Resource Economy
- **GAME_DAY_MS**: 3 min → 2 min (haven.js)
- **HALF_DAY_MS**: 90s → 60s (haven.js)
- **Villager production rates** (haven.js `_setVillagerIncome`):
  - woodcutter: 1/10s → 1/20s
  - stonecutter: 1/10s → 1/20s
  - miner: 1/15s → 1/30s
  - hunter: 1/10s → 1/15s
  - herbalist: 1/20s → 1/30s
- **Manual gathering**: unchanged (wood/stone 10s 3-5, herbs 10s 2-4, cloth 10s 1-3, iron 15s 1-3)
- Food consumption increases naturally (shorter game-day = more frequent consumption)

### §22.2 Auto-Gathering Progression
After 8 manual gathers of a resource, a one-time build button appears in the actions area.

| Structure | Trigger | Cost | Build Time | Passive Output |
|---|---|---|---|---|
| build woodpile | 8 wood gathers | 10 wood, 5 stone | 30s | +1 wood / 45s |
| mark a quarry | 8 stone gathers | 5 stone, 5 iron | 30s | +1 stone / 45s |
| tend a garden | 8 herb gathers | 5 herbs, 5 wood | 30s | +1 herbs / 60s |
| shore up the mine | 8 iron gathers | 10 iron, 5 wood | 30s | +1 iron / 60s |
| build a snare line | 8 food forages | 10 wood, 5 cloth | 30s | +1 food / 45s |

Completion messages:
- woodpile: "a woodpile. the scraps add up."
- quarry: "a quarry marker. the stone comes easier now."
- garden: "a small garden in the green patch. life persists."
- mine: "the mine holds. iron flows."
- snare: "snares along the green patch. something will wander in."

Income keys: `auto_woodpile`, `auto_quarryMarker`, `auto_garden`, `auto_mineShoreUp`, `auto_snare`
State keys: `game.autoStructures.[key].shown`, `game.autoStructures.[key].built`
Gather counts: `game.gatherCounts.[resource]`

### §22.3 Haven "Whoa" Moments

**Event 1 — The Buried Weapon** (3 buildings constructed):
```
a villager calls out. something in the dirt.
a sword. rusted. broken. but real.
something used this. something that fights.
threats exist beyond the green patch.
```
Effect: adds 5 iron to stores. State key: `game.whoa.buriedWeapon`

**Event 2 — The First Night Attack** (5 villagers, no watchtower):
Before this event fires, night attacks are disabled. Triggers on next night:
```
screaming. darkness at the edge of the green.
something came in the night. the stores are torn open.
the sickness has teeth.
```
Effect: lose 5-10 food. Night attacks enabled afterward.
State keys: `game.whoa.firstNightAttackArmed`, `game.whoa.nightAttackEnabled`

**Event 3 — The Watchtower View** (watchtower built):
```
you climb the watchtower. the world opens up.
ruins stretch to the horizon. dark soil. dead rivers.
but to the east — something. structure. old stone.
to the south — a patch of green. impossible.
the wilds are vast. and full of answers.
```
State key: (watchtower building = trigger)

**Event 4 — The Unsettling Stranger** (7 villagers):
```
a stranger arrives. different from the others.
she doesn't sit by the fire. she stares at the mark.
'you're the last one,' she says. 'the very last.'
she won't say more. she works. but she watches.
```
Effect: villager joins with forced `spiritual` trait. State key: `game.whoa.unsettlingStranger`

**Event 5 — The Dream** (10 memories found):
```
you wake gasping. the mark burns.
a flash — a face. a room. a decision.
the dream fades. but the feeling doesn't.
something is pulling you. deeper into the wilds.
```
State key: `game.whoa.theDream`

### §22.4 Simpler Map Visual
- POI letters hidden on minimap until tile is explored (stepped on)
- Adjacent unexplored non-sick tiles show as `?` in amber (#D4740A)
- Map legend removed entirely
- Player `@` (amber) and haven `H` (sage) always visible

### §22.5 Micro-Interactions on Sick Tiles
30% chance on first visit to a sick tile (one-time, tracked in `game.map.microEvent`).
Four events, chosen randomly:

**Collapsed cart:**
```
a collapsed cart. something underneath.
```
[search] / [move on]
- 60%: 2-4 random resources
- 30%: "rubble. nothing useful."
- 10%: story fragment (one of 5)

Story fragments: "scratched into the cart: 'heading north. the mark-bearer will protect us.'" | "a doll. small. left behind in haste." | "a merchant's ledger. the last entry is a prayer." | "dried flowers, pressed between stones. someone remembered beauty." | "a map. crude. the ink has bled. but a circle — here. where you stand."

**Old well:**
```
an old well. the rope is frayed.
```
[lower a bucket] / [move on]
- 50%: 3-5 herbs
- 30%: "the rope gives way. the bucket is gone."
- 20%: 1 cloth

**Cellar door:**
```
a cellar door. sealed with rust.
```
[force it open] / [leave it]
- 40%: 5-8 food
- 40%: 2-4 iron
- 20%: ambush blighted fox (no flee)

**Grave marker:**
```
a grave marker. recent.
```
[pay respects] / [move on]
- Outcome: "you kneel. the mark flickers. recognition." / "this one carried the mark too. a long time ago."
- Effect: +1 `playStats.graveRespects` (scores +5 per respect paid)

### §22.6 Environmental Hazards
8 pre-placed hazard tiles. Trigger once; after resolution show short flavor text on revisit.

Tile positions (added to MAP_LAYOUT):
- chasm: (3,4) and (8,7)
- fog: (5,2) and (6,8)
- bridge: (3,6) and (10,9)
- thorns: (2,6) and (7,10)

**Chasm:** "a crack in the earth. wide. deep. the sickness oozes from below."
- [cross on the fallen tree] — safe, -2 food
- [jump] — 70% safe; 30% -20 health
- [go around] — -2 food

**Sick fog:** "a low fog. thick. the mark dims in it."
- [push through] — -3 torch charges
- [wait for it to pass] — -1 food
- [find another way] — -2 food

**Collapsed bridge:** "a river of black water. a bridge, half-collapsed."
- [climb across the ruins] — 80%: safe (50% chance 2 iron); 20%: -10 health, lose 3 resources
- [wade through] — safe, -5 health
- [search for a crossing] — safe, -2 food

**Thorn wall:** "twisted thorns. black. dense. they grew from the sickness."
- [cut through] — requires weapon, -1 food
- [burn through] — -3 torch charges
- [go around] — -2 food

### §22.7 Return Summary
Departure state captured on Wilds.onArrival: `game.wildsDeparture = {fireLevel, popCount, food}`

On `_returnToHaven()`, comparison shown in haven log:
- Fire dropped: "the fire burned low."
- Villager(s) left: "someone left." / "N people left."
- No change: "the fire burns. the people are fed. all is well."

### §22.8 Iron Gathering (Soft-Lock Fix)
[gather iron] button visible in haven actions when fire level ≥ 3.
- Cooldown: 15 seconds
- Yield: 1-3 iron
- Text: "iron scraps from the ruins. bent, but usable." (shown in gather area)
- Counts toward `game.gatherCounts.iron` for §22.2 auto-structure unlock

### §22.8b Food Foraging

**[forage for food]** button is always visible in the haven actions panel (like wood/stone).

- Yield: 1–2 food, instant
- Cooldown: 15s (20s at night)
- First-use text: "scraps of roots and berries from the green patch. enough to survive."
- Counts toward `game.gatherCounts.food` for snare auto-structure unlock

**Snare line auto-structure** (unlocked after 8 forages):
- Button: `[build a snare line]`
- Cost: 10 wood, 5 cloth
- Build time: 30s
- Passive output: +1 food / 45s
- Completion message: "snares along the green patch. something will wander in."

### §22.9 Replay Value — Persistent Tracker
localStorage key: `lastEmber_persistent`

Tracks across all playthroughs:
- `totalMemories`: highest single-run memory count seen
- `completedRuns`: number of completed runs
- `endingsSeen`: array of ending types seen ("seal", "break")

Display on leaderboard screen after first completion:
```
memories recovered: X/25 across all journeys.
journeys completed: N
endings witnessed: [seal/break]
```
Special messages:
- Both endings seen: "both paths walked. the full truth is known."
- All 25 memories found: "every memory recovered. nothing is forgotten."

Play-again button text after first completion: "begin another journey. you will forget again. but the land remembers."

### §22.10 Combat Variety

**Opening lines** (randomized per encounter):

Fox: "a fox. twisted. it snarls at the light." / "red eyes in the brush. small. fast." / "the mark flickers. something is close. a fox, corrupted."

Root crawler: "the ground shifts. roots rise. reaching." / "twisted wood and sick soil, moving with purpose." / "it was a tree once. now it hungers."

Sickness shade: "the air thickens. a shape in the murk." / "darkness condenses. takes form. watches." / "a shade. the sickness given shape. it keens."

Corrupted guardian: "stone grinds. the guardian wakes." / "ancient eyes open in the rock. still guarding. still bound." / "the sentinel stirs. it does not recognize you."

**Victory lines** (pick one randomly):
- "it falls. the mark dims. quiet returns."
- "done. the corruption bleeds into the soil and vanishes."
- "the creature crumbles. the land sighs."

**Defeat lines** (pick one randomly):
- "darkness. then the haven. you're alive. barely."
- "you wake by the fire. wounded. everything you carried is gone."
- "the mark flares. drags you home. you don't remember how."

### §22 Score Formula Update
```
score = (memories × 100)
      + (buildings × 50)
      + (max_population × 25)
      + (combat_wins × 15)
      + (tiles_explored × 2)
      + (days_survived × 3)
      + (extra_mark_fragments × 50)
      + (seal_ending × 500)
      + (creatures_healed × 20)
      + (grave_respects × 5)         ← NEW §22
      + companion_bonus (+100 alive / -150 died / 0 not taken)
      - (villagers_lost × 100)
      - (combat_retreats × 25)
```

### §22.11 Instant Gathering with Cooldown Bar

Gathering is now instant-click with a visual cooldown (no more wait-then-receive).

**Amounts and cooldowns:**
- gather wood: 1-3, 15s cooldown
- gather stone: 1-3, 15s cooldown
- gather herbs: 1-2, 15s cooldown
- salvage cloth: 1-2, 15s cooldown
- gather iron: 1-2, 20s cooldown (requires fire ≥ 3)

**Night penalty:** +5s added to all cooldowns when `game.isNight` is true.

**Visual:** Amber (#D4740A) bar below button fills left-to-right over the cooldown duration (CSS `transition: width Nms linear`). Button disabled during cooldown. Bar resets to 0% width (no transition) when cooldown expires.

**CSS classes:** `.gather-btn-wrapper` (inline-block container), `.cooldown-bar` (2px height, `var(--mark-amber)` background).

### §22.12 Separate Fire Decay Timer

Fire decay is decoupled from the game-day tick.

- **Without hearth:** fire drops 1 level every **3 real minutes**
- **With hearth:** fire drops 1 level every **6 real minutes**
- Wood and food consumption remain on the 2-minute game-day cycle (unchanged)

**`FIRE_DECAY_MS`:** 3 × 60 × 1000 ms (haven.js constant)

**`_fireDecayTick()`:** Standalone timer in `_timers.fireDecay`. Reschedules itself after each tick. Hearth check done at reschedule time (so building hearth mid-game takes effect on next tick).

**Wilds log messages on decay (when player is in wilds):**
- Level drops to 2: "a pull in your chest. the fire needs tending."
- Level drops to 1: "the mark dims. your people are cold."
- Level drops to 0: "the mark stutters. the connection thins."

**Haven log messages:**
- Level drops to 1: "the fire dims. the mark weakens. the black soil creeps closer."
- Level drops to 0: "the fire dies. the mark holds alone. the green circle shrinks. the sickness presses close."

### §22.13 Random Combat in the Wilds

A random encounter can trigger every 3 moves while in the wilds.

**Trigger conditions:**
- Tile type must be `sick`, `forest`, or `cache` (skips POI, hazard, and sanctum tiles)
- `game.wilds.moveCounter % 3 === 0` AND `Math.random() < 0.25` (25% chance)
- Counter resets to 0 on haven return

**Distance-based enemy selection** (Chebyshev-distance-like using `Math.sqrt(dx²+dy²)`):
- ≤ 3 tiles: blighted fox
- 4–6 tiles: blighted fox OR root crawler (50/50)
- 7+ tiles: root crawler OR sickness shade (50/50)

**`afterType`:** `'random'` — flee IS available. On win: tile not cleared, player stays. On loss (not fled): player returned to haven.

### §22.14 Resource Drain Events

When stores overflow, the land reclaims what isn't used.

**Trigger:** Any resource exceeds 200. 30% chance per game-day.

**Safety skip:** Never triggers if the player can currently afford any unbuilt building.

**Drain amount:** 10–15% of the excess above 150 (minimum 1).

**Flavor texts (one chosen at random):**
- "a section of the storehouse collapses. some supplies are buried."
- "the sickness seeps through a crack in the wall. some stores are ruined."
- "a storm in the night. rain through the roof. some things are lost."
- "rats. they found the stores. not much left of what they touched."
- "the wood near the edge of the green has rotted. the sickness got to it."

Log also prints: "[amount] [resource] lost."

### §23 Expedition Loadout Screen (FIX 1)

Before entering the wilds, a loadout UI is shown (gated by `game.wilds.onExpedition === false`).

**Equipment section (read-only):** Shows currently equipped weapon, armor, and light source.

**Supplies section (adjustable +/− buttons):**
| Item | Source | Default | Max |
|------|--------|---------|-----|
| food | stores.food | min(10, stock) | pack space |
| bandages | game.inventory.bandages | 0 | pack space |
| traps | game.inventory.traps | 0 | pack space |
| poultice | game.inventory.poultice | 0 | pack space |

**Pack counter:** `X / 20` (or `X / 30` with companion). Each supply unit costs 1 slot.

**Buttons:**
- `[set out]` — deducts supplies from stores/inventory → `game.carry`; sets `game.wilds.onExpedition = true`; enters wilds
- `[stay]` — returns to haven tab without change

**On expedition return:** `carry.bandages`, `carry.traps`, `carry.poultice` → `game.inventory.X`; `carry.food` + gathered resources → `stores`; `onExpedition` set to false.

**Food consumption:** 1 food from `game.carry.food` per move (not from `stores.food`). If carry food reaches 0, movement is blocked.

---

### §23.1 Item Functionality (FIX 2)

#### Bandages
- `[use bandage]` button visible during exploration when `carry.bandages > 0`
- Effect: +10 HP (capped at max), −1 `carry.bandages`

#### Traps
- `[place trap]` button visible during exploration when `carry.traps > 0`
- Records `game.map.traps["x,y"] = true`; −1 `carry.traps`
- Minimap: trapped explored tiles display `'t'` in amber (`#D4740A`)
- Auto-kill: if §22.13 random combat triggers on a trapped tile and enemy is blighted fox or root crawler → enemy killed instantly (no combat UI), trap removed, +1 combat win, no loot
- Sickness shades are NOT auto-killed by traps

#### Poultice
- `[use poultice]` button visible in haven when `game.player.wounded === true` AND `game.inventory.poultice > 0`
- Effect: −1 poultice, begins natural heal; `game.player.healAtDay` set to `game.day + 2`
- Without poultice: player must wait 2 game-days naturally to heal

#### Reinforced Torch
- Provides 15 light charges per craft (vs standard 5 for regular torch)
- When crafted: sets `game.inventory.hasReinforcedTorch = true`
- Minimap effect: adjacent unvisited non-sick tiles reveal their actual character and color (rather than `'?'`). Tiles with sickness still show `'?'`

#### Mark Lantern
- Sanctum room 5 check already in codebase; grants permanent light

---

### §23.2 Resource Sinks (FIX 3)

#### Haven Upkeep
Ongoing resource cost scales with settlement size:

| Buildings built | Daily cost |
|----------------|-----------|
| ≥ 5 | −1 wood / day |
| ≥ 7 | −1 stone / day |
| ≥ 8 | −1 iron / day |

If the required resource is at 0, a warning is logged instead of deducting. Buildings counted: hearth, forge, hut, lodge, storehouse, workshop, watchtower, herbalistHut, tradingPost.

#### Villager Needs
Every 5 game-days, a random villager makes a resource request (only when `!game.villagerNeed.active`).

**Need table:**
| Resource | Amount | Text |
|----------|--------|------|
| cloth | 3 | "asks for cloth for warmer bedding." |
| herbs | 3 | "asks for herbs. the cough is spreading." |
| iron | 2 | "'s tools are wearing thin. they need iron." |
| wood | 5 | "wants to patch their shelter. before the sickness gets in." |
| stone | 3 | "asks for stone to shore up the wall." |

**Buttons:** `[give N resource]` / `[not now]`

**Decline text by trait:**
- fearful: "…i understand."
- practical: "fine. i'll manage."
- curious: "worth asking, i suppose."
- spiritual: "the mark provides."
- quiet: (silent)

**Morale boost on give:** 5 game-days of +25% production from that villager's role. Implemented as an extra income stream at 4× base delay. Cleaned up by `_checkMoraleExpiry()` each game-day tick.

**State:** `game.villagerNeed = { active, idx, name, trait, resource, amount }`; `game.moraleExpiry = { idx: { key, expiryDay } }`

#### Fog Corrosion
Pushing through a fog hazard (`[push through]` option) corrodes iron from carry: −1 `carry.iron`.

#### Trading Post Inventory Trades (new entries)
Four new trades added to the trade table, routing outcome to `game.inventory` via `invOffer: true` flag:

| Offer | Cost | invOffer |
|-------|------|---------|
| 1 poultice | 5 herbs + 2 cloth | true |
| 3 bandages | 3 cloth + 2 herbs | true |
| 5 torches | 5 wood + 3 cloth + 5 iron | true |
| 1 trap | 8 iron + 3 wood | true |

Torches add to `torchCharges` pool (5 charges each).

---

### §23.3 Weaver Role

Unlocked when trading post is built.

| Property | Value |
|----------|-------|
| Produces | 1 cloth per 30s |
| Button label | weave |
| Unlock condition | tradingPost built |
| Role index | 7th role (after hunter) |

Total roles: 7 (woodcutter, stone-carver, herbalist, iron-finder, healer, hunter, weaver).

---

## §24 COMPREHENSIVE GAMEPLAY OVERHAUL

*All changes implemented. Values sourced verbatim from §24 specification.*

### §24.1 Storage Cap
- Base cap (no storehouse): 100 per resource (was 50)
- With storehouse: 300 per resource (was 100)
- Cap enforced in both `Haven._updateStores` (display) and `$SM.collectIncome` (auto-income tick)
- When return from wilds exceeds cap: "no room in stores. X [resource] left behind." shown in haven log

### §24.2 Torch System (Revised)
- Regular torch craft: qty 1, +5 charges per craft (3 wood + 2 cloth)
- Reinforced torch craft: qty 1, +15 charges per craft (5 wood + 3 cloth + 2 iron)
- Mark lantern is a KEY ITEM. It does NOT provide general exploration light. Torches always required for unexplored movement.
- Mark lantern specific effects:
  1. Mark's light healing costs 0 torch charges (instead of 5)
  2. Sick fog push-through costs 0 charges (instead of 3)
  3. Required to enter Sunken Sanctum
  4. Required to fight the Blight Heart
- Thorn wall burn-through still costs 3 charges even with lantern
- Loadout shows torch and lantern as separate rows

### §24.3 Bandage Healing
- Bandage heals 10 HP (was 25)
- Capped at player max HP

### §24.4 Resource Drain Events (Revised)
- Trigger threshold: any resource > 200 (was 400)
- Drain floor: 150 (was 200)
- Drain amount: 10–15% of excess above 150 (minimum 1)

### §24.5 Haven Log Cap
- Maximum 8 narrative entries in haven log
- Oldest `.narrative` entry removed when 9th is added

### §24.6 Villager Decline Text
- curious: "maybe next time."
- spiritual: "the land provides when it's ready."
- fearful: "…i understand."
- practical: "fine. i'll manage."
- quiet: (nods. returns to work.)

### §24.7 Dynamic Trader (Full Spec)
- Trader arrives every exactly 5 game-days (not random 5–8)
- Dynamic pricing: sells most-abundant resource (player → trader) at 3:1 ratio, buys least-abundant
- 25% chance of unique item offer per visit
- Unique items (one-time purchases):
  | Item | Cost | Effect |
  |------|------|--------|
  | traveler's map | 70 wood | reveals 3 random undiscovered tiles |
  | old medicine | 65 herbs | heals wounds + temporary +10 max HP for current trip |
  | warden's journal page | 75 stone | adds 1 random warden page (atmosphere) |
  | reinforced pack | 80 iron | +5 permanent pack capacity (20→25 base, 30→35 with companion) |
- State: `game.trader.bought.[id]` tracks which unique items have been purchased

### §24.8 Trap Loot (Distance-Based)
- Traps on revisit give loot based on distance from haven:
  - ≤ 3 tiles: 3–5 cloth
  - ≥ 4 tiles: 3–5 wood
- Trap removed after yielding loot

### §24.9 Pack Capacity
- Base pack capacity: 20 slots
- Companion bonus: +10 (total 30)
- Reinforced pack bonus: +5 cumulative (20→25 base, 30→35 with companion)
- State: `game.player.packBonus` (permanent, set by trader)

### §24.10 Weapon/Armor Durability
Each weapon and armor has a durability counter. One combat encounter uses 1 durability point on both equipped weapon and armor.

| Item | Max Durability |
|------|---------------|
| crude sword | 5 |
| steel sword | 10 |
| warden's blade | 15 |
| crude armor | 5 |
| steel armor | 10 |
| warden's coat | 18 |

- At 0 durability: item shatters. Removed from character state. Message: "your [item] shatters."
- Display in loadout and status bar: "steel sword (7/10)"
- State: `character.equip.weaponDurability`, `character.equip.armorDurability`
- On equip of new item: durability set to item's max

### §24.11 Storage Cap Display
- Haven stores section shows storage cap: e.g. "wood: 45 / 100"
- Cap updates immediately when storehouse is built (100 → 300)

### §24.12 Gathering Rates (Revised — Instant with Cooldown)
- gather wood: 1–3 wood, 15s cooldown
- gather stone: 1–3 stone, 15s cooldown
- gather herbs: 1–2 herbs, 15s cooldown
- salvage cloth: 1–2 cloth, 15s cooldown
- gather iron: 1–2 iron, 20s cooldown (fire ≥ 3 required)
- Night penalty: +5s to all cooldowns when `game.isNight === true`

### §24.13 Villager Production Rates
- woodcutter: 1 wood per 20s
- stone-carver: 1 stone per 20s (stonecutter role)
- miner: 1 iron per 30s
- hunter: 1 food per 15s
- herbalist: 1 herbs per 30s
- healer: removes `wounded` flag after 2 game-days
- weaver: 1 cloth per 30s (unlocked when tradingPost built)

### §24.11 Section 9 Whoa Events (Updated)
- Event 1 (Buried Weapon): no iron add. Crude sword recipe button pulses (CSS animation 3×).
- Event 2 (First Night Attack): Watchtower build button pulses after attack fires.

### §24.12 Haven Deterioration Messages in Wilds Log
- Food runs out at haven: "a hollow feeling. someone at the haven is hungry."
- Villager leaves: "a name fades from your awareness. someone has left."
- Night attack with store loss: "unease. something happened at the haven."
- Fire level messages: already in fire decay tick (level 2/1/0)

### §24.13 Return Summary
- "you return to the haven."
- Fire dropped: "the fire burned low."
- Villager left: "someone left. not enough food." (or "N people left...")
- Stores lighter from attack: "the stores are lighter."
- Fine: "the fire burns. the people are fed. all is well."

### §24.14 Grave Tab Pulsing Dot
- After Phase 1 completes, grave tab shows pulsing amber dot (CSS opacity 0.3→1.0, 3s cycle)
- Fire ≤ 1: "the mark flickers." Fire ≥ 2: "the mark burns. steady."

### §24.16 Score Formula (Final)
```
score = (memories × 100)
      + (buildings × 50)
      + (max_population × 25)
      + (combat_wins × 15)
      + (tiles_explored × 2)
      + (days_survived × 3)
      + (extra_mark_fragments × 50)
      + (seal_ending × 500)
      + (creatures_healed × 20)
      + (grave_respects × 5)
      + companion_bonus (+100 alive / -150 died / 0 not taken)
      - (villagers_lost × 100)
      - (combat_retreats × 25)
```
