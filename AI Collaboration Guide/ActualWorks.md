# Current Work Tracker — handoff dla CODEXA

> **Stan na: 2026-04-16**
> Poprzedni agent: Claude (Sonnet 4.6)
> Następny agent: CODEXA

---

## STAN BIEŻĄCY — snapshot

| Metryka | Wartość |
|---|---|
| Testy | **176/176** (17 plików testowych) |
| `npm run check` | **PASS** (ESLint 0 errors, build zielony) |
| FactionConfig zarejestrowane | **9** (patrz tabela poniżej) |
| Ostatni sprint | Sprint 8 — DONE |
| Następny sprint | **Sprint 9 — CODEXA startuje tutaj** |

### Zarejestrowane FactionConfig (`src/data/factions/index.ts`)

| Frakcja | Status | army rules |
|---|---|---|
| Adeptus Custodes | ✅ Recommended | Martial Ka'tah (2 opcje) |
| Aeldari | ✅ Playable beta | Strands of Fate + Battle Focus (info-only) |
| Chaos Space Marines | ✅ Playable beta | Veterans of the Long War (REROLL_WOUNDS melee) |
| Death Guard | ✅ Playable beta | Plague Weapons + Disgustingly Resilient |
| Necrons | ✅ Recommended | Reanimation Protocols (FNP 4+) |
| Space Marines | ✅ Recommended | Oath of Moment (REROLL_HITS + REROLL_WOUNDS) |
| T'au Empire | ✅ Recommended | Markerlight + Saviour Protocols |
| Tyranids | ✅ Playable beta | Synaptic Directives (Voracious Appetite + 2× info-only) |
| World Eaters | ✅ Recommended | Blessings of Khorne (3× mutex radio) + Berzerker Charge |

### Frakcje BEZ FactionConfig (tylko dane, brak army rules)

Adepta Sororitas, Adeptus Mechanicus, Astra Militarum, Chaos Daemons, Chaos Knights, Drukhari, Grey Knights, Imperial Agents, Imperial Knights, Leagues of Votann, **Orks**, Thousand Sons

---

## ⏳ Sprint 9 — Orks + Grey Knights + Sororitas (STARTUJ TUTAJ)

### Priorytet wykonania: Orks → Grey Knights → Adepta Sororitas

---

### 9.1 Orks FactionConfig

**Dane:** `src/data/normalized/detachments-by-faction/` — sprawdź czy jest `orks.json`
**Detachmenty:** Lista IDs z pliku `orks.json` (node -e "const d = require('./src/data/normalized/detachments-by-faction/orks.json'); d.forEach(x=>console.log(x.id))")

**Army rule do implementacji:**

`Waaagh!` — 10th ed army rule:
- Ork CORE units w fazie fight otrzymują +1 Attack w momencie ogłoszenia Waaagh!
- Typ modyfikatora: `ATTACKS_MODIFIER`, value: 1, attackType: "melee"
- `combatRole: "attacker"`, `supportLevel: "implemented"`, `isToggle: true`
- Wskazówka: toggle aktywuj gdy gracz Orków ogłasza Waaagh! w tej rundzie

```ts
// src/data/factions/Orks/armyRules.ts
export const orksArmyRules: RuleOption[] = [
  {
    id: "orks-waaagh",
    name: "Waaagh!",
    displayLabel: "Waaagh! (declared)",
    description: "Waaagh! has been called. CORE units get +1 Attack in melee this battle round.",
    modifiers: [{ type: "ATTACKS_MODIFIER", value: 1, attackType: "melee" }],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "fight",
    isToggle: true,
    supportLevel: "implemented",
    engineTags: ["waaagh", "attacks-modifier-melee"],
  },
];
```

**Testy do dodania (ruleContract.test.ts):**
1. `army rules have correct side assignment`
2. `Waaagh! is an attacker rule with ATTACKS_MODIFIER (melee)`

---

### 9.2 Grey Knights FactionConfig

**Dane:** `grey-knights.json`

**Army rules do implementacji:**

Grey Knights army rule "Supreme Force" / "Brotherhood of Psykers" — w 10th ed skupia się na psionice i reinforcementach, brak direct calculator equivalent.

```ts
// src/data/factions/GreyKnights/armyRules.ts
export const greyKnightsArmyRules: RuleOption[] = [
  {
    id: "gk-brotherhood-of-psykers",
    name: "Brotherhood of Psykers",
    displayLabel: "Brotherhood of Psykers",
    description: "Grey Knights can use Psychic powers and benefit from Warp dice. Psychic reinforcement mechanic — no direct calculator effect.",
    modifiers: [],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "any",
    isToggle: false,
    supportLevel: "info-only",
    engineTags: [],
  },
];
```

**Testy:** 2 testy (side assignment, all info-only)

---

### 9.3 Adepta Sororitas FactionConfig

**Dane:** `adepta-sororitas.json`

**Army rules do implementacji:**

"Acts of Faith" — Miracle dice system (podobny do Strands of Fate — bank kostek pre-game i substitute). Zbyt złożone do pełnej implementacji.

```ts
// src/data/factions/AdeptaSororitas/armyRules.ts
export const adeptaSororitasArmyRules: RuleOption[] = [
  {
    id: "sororitas-acts-of-faith",
    name: "Acts of Faith",
    displayLabel: "Acts of Faith",
    description: "Miracle dice earned each phase can substitute for dice rolls. Variable effect — no fixed calculator equivalent.",
    modifiers: [],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "any",
    isToggle: false,
    supportLevel: "info-only",
    engineTags: [],
  },
];
```

**Testy:** 2 testy (side assignment, all info-only)

---

### 9.4 Rejestracja i testy

Po każdej frakcji:
1. Dodaj do `src/data/factions/index.ts` (import + wywołanie w getFactionConfigs)
2. Dodaj testy do `src/data/factions/__tests__/ruleContract.test.ts`
3. `npm run check` po każdej frakcji (nie czekaj na koniec)

Po wszystkich:
- Aktualizuj `src/data/productStatus.ts`:
  - Orks → "Playable beta" (ma Waaagh! implemented)
  - Grey Knights + Sororitas → "Playable beta" (info-only ale zarejestrowane)
  - `latestChanges` — opisz co zostało dodane
- Aktualizuj `ActualWorks.md` — oznacz 9.1–9.4 jako ✅, dodaj Sprint 10

---

## Architektura — kluczowe pliki

### Typy i silnik

| Plik | Rola |
|---|---|
| `src/types/combat.ts` | `SpecialRule` discriminated union — WSZYSTKIE typy modyfikatorów |
| `src/types/faction.ts` | `RuleOption`, `DetachmentConfig`, `FactionConfig` |
| `src/lib/combat/combatRoleGuards.ts` | `ATTACKER_EXCLUSIVE_RULE_TYPES` / `DEFENDER_EXCLUSIVE_RULE_TYPES` |
| `src/lib/combat/expectedDamage.ts` | Silnik obliczeń — tu trafiają `SpecialRule[]` |

### Dane frakcji

| Plik | Rola |
|---|---|
| `src/data/factions/index.ts` | **Rejestr FactionConfig** — tu dodawać nowe frakcje |
| `src/data/factions/__tests__/ruleContract.test.ts` | **Testy kontraktowe** — uruchom po każdej nowej frakcji |
| `src/data/mappers/mapNormalizedDetachmentToFactionConfig.ts` | Mapper JSON → DetachmentConfig; `createImplementedRuleOption` / `createImplementedDefenderRuleOption` |
| `src/data/detachmentRules/registry.ts` | Ręczne overrides dla konkretnych detachmentów |
| `src/data/normalized/detachments-by-faction/*.json` | Surowe dane detachmentów z Wahapedii |

### Hooki i UI

| Plik | Rola |
|---|---|
| `src/hooks/useSidedRuleOptions.ts` | Toggle state + **mutex logika dla selectionGroup** |
| `src/hooks/useFactionRules.ts` | Ładuje detachmenty + army rules dla wybranej frakcji |
| `src/components/ModifiersPanel.tsx` | UI reguł: `ToggleRow` (checkbox), `RadioRow` + `SelectionGroupRow` (mutex radio) |

### Dane aplikacji

| Plik | Rola |
|---|---|
| `src/data/productStatus.ts` | Status frakcji wyświetlany w panelu Updates |

---

## Pattern dla nowej frakcji (krok po kroku)

```
1. Sprawdź detachmenty:
   node -e "const d = require('./src/data/normalized/detachments-by-faction/FACTION.json'); d.forEach(x=>console.log(x.id, x.factionName))"

2. Stwórz src/data/factions/FACTION/armyRules.ts
   - eksportuj const factionArmyRules: RuleOption[]
   - każde implemented rule: combatRole, appliesTo, modifiers, supportLevel: "implemented"
   - każde info-only rule: modifiers: [], supportLevel: "info-only"
   - mutex rules: selectionGroup: "faction-group-name"

3. Stwórz src/data/factions/FACTION/faction.ts
   - const factionDetachmentIds = ["id1", "id2", ...] as const
   - export function getFACTIONFactionConfig(detachments: NormalizedDetachment[]): FactionConfig
   - filtruj przez: d.factionName === "Exact Faction Name" && d.id === id

4. Dodaj do src/data/factions/index.ts:
   import { getFACTIONFactionConfig } from "./FACTION/faction";
   // i do tablicy w getFactionConfigs()

5. Dodaj testy do src/data/factions/__tests__/ruleContract.test.ts:
   import { factionArmyRules } from "../FACTION/armyRules";
   describe("FACTION rule contracts", () => {
     it("army rules have correct side assignment", () => { validateRuleOptions(...) });
     // + testy specyficzne dla implemented rules
   });

6. npm run check — musi być PASS przed kontynuacją
```

---

## Kluczowe konwencje

### selectionGroup (mutex toggle)
Gdy gracz może wybrać TYLKO JEDNĄ opcję z grupy (np. Blessings of Khorne, Synaptic Directives):
```ts
{ ..., selectionGroup: "unique-group-id", isToggle: true }
```
- `useSidedRuleOptions.ts` automatycznie dezaktywuje inne opcje tej samej grupy
- `ModifiersPanel.tsx` renderuje jako radio buttons z opcją "None"
- info-only rules w selectionGroup: `isToggle: false`, `modifiers: []`

### combatRole obowiązkowe dla implemented rules
Każda reguła z `supportLevel: "implemented"` i `modifiers.length > 0` MUSI mieć `combatRole`.
Brak tego → test kontraktowy failuje.

### Typy modyfikatorów — szybka ściągawka

| SpecialRule type | Dotyczy |
|---|---|
| `REROLL_HITS` | re-roll wszystkich trafień (attacker) |
| `REROLL_HITS_ONES` | re-roll tylko 1 na trafienie (attacker) |
| `REROLL_WOUNDS` | re-roll wszystkich zranień (attacker) |
| `REROLL_WOUNDS_ONES` | re-roll tylko 1 na zranienie (attacker) |
| `LETHAL_HITS` | 6 na trafienie = automatyczne zranienie (attacker) |
| `DEVASTATING_WOUNDS` | 6 na zranienie = mortal wounds (attacker) |
| `FEEL_NO_PAIN` | FNP save, value = próg (np. 5 = FNP 5+) (defender) |
| `DAMAGE_REDUCTION` | reducja obrażeń, value = ile (defender) |
| `ATTACKS_MODIFIER` | +/- Attacks per model, attackType: "melee"\|"ranged" |
| `HIT_MODIFIER` | +/- do rzutu trafienia |
| `WOUND_MODIFIER` | +/- do rzutu zranienia |
| `AP_MODIFIER` | +/- do AP broni |
| `STRENGTH_MODIFIER` | +/- do Strength broni |
| `DAMAGE_MODIFIER` | +/- do Damage broni |
| `CRITICAL_HITS_ON` | krytyczne trafienie na N+ zamiast 6+ |
| `MELTA` | dodatkowe damage przy half range, value = ile |

Pełna lista: `src/types/combat.ts`

---

## Historia sprintów (skrót)

| Sprint | Data | Co zrobiono | Testy |
|---|---|---|---|
| 1 | 2026-04-13/16 | Green CI, merge conflicts, PR template, ADR | 142 |
| 2 | 2026-04-16 | combatRole refactor, testy kontraktowe, Death Guard FC | 154 |
| 3 | 2026-04-16 | Necrons FC + T'au Empire FC | 160 |
| 4 | 2026-04-16 | World Eaters FC (Blessings mutex) | 163 |
| 5 | 2026-04-16 | Space Marines FC (Oath of Moment) | 165 |
| 6 | 2026-04-16 | UI: selectionGroup → radio buttons w ModifiersPanel | 165 |
| 7 | 2026-04-16 | Engine edge case testy (MELTA, REROLL_*_ONES) | 168 |
| 8 | 2026-04-16 | CSM FC + Tyranids FC + Aeldari FC | 176 |
| **9** | TBD | **Orks + Grey Knights + Adepta Sororitas FC** | ~184? |
