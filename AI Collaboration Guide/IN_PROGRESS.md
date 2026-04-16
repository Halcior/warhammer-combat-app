# In-Progress Tasks

Based on: [`docs/next-steps-analysis-2026-04-09.md`](../docs/next-steps-analysis-2026-04-09.md)

---

## Current follow-up after Sprint 9 (2026-04-16)

### Recently completed

- `Astra Militarum`
  - `FactionConfig` added
  - `Born Soldiers` implemented as ranged `LETHAL_HITS`

- `Chaos Knights`
  - `FactionConfig` added
  - army rule tracked as `info-only`

- `Thousand Sons`
  - `FactionConfig` added
  - army rule tracked as `info-only`

- `Adeptus Mechanicus`
  - `FactionConfig` added
  - army rule tracked as `info-only`

- `Leagues of Votann`
  - `FactionConfig` added
  - army rule tracked as `info-only`

- Engine upgrades
  - `ASSAULT` now affects attack legality after `Advance`
  - `PISTOL` now affects attack legality in `Engagement Range`

- UI fix
  - `ModifiersPanel` no longer leaks attacker-owned defensive toggles into defender-side active sections

### Best next task

- Continue `Death Guard` with calculator-real effects only.
- Prioritize effects that already map to the current rule engine cleanly.

### Validation standard

- `npx.cmd tsc -b --pretty false`
- `npm.cmd test`
- `npm.cmd run build`

## Sprint 1 — "Green CI + porządek techniczny"

### 1. ✅ Naprawa konfliktów merge - COMPLETE ✅✅✅

**Status:** FULLY RESOLVED on 2026-04-13

#### Final verification:
```bash
$ grep -r "^<{7}|^={7}|^>{7}" .
# Result: No matches found ✅
```

#### Files fixed:
- **README.md** (201 lines)
  - Removed ALL nested merge conflict markers
  - Consolidated Polish + English documentation
  - Clean, professional structure
  - Ready for production

- **App.tsx** — No conflicts (verified clean) ✅

#### Verification checklist:
- [x] No `<<<<<<<` markers in codebase
- [x] No `=======` conflict separators
- [x] No `>>>>>>>` conflict end markers
- [x] README.md is valid Markdown
- [x] All sections are coherent and complete

### 2. ✅ `npm run check` = PASS - COMPLETE ✅✅✅

**Status:** FULLY RESOLVED on 2026-04-16

#### Final verification:
- ✅ ESLint — 0 errors, 0 warnings
- ✅ Vitest — 142/142 tests passing (15 test files)
- ✅ Vite build — clean production build

#### Key fixes applied:
- Extracted `battleStateToggles` and `armyBuilderUtils` to separate lib files (react-refresh violations)
- Replaced all `useEffect(() => setState, [deps])` with previous-props pattern (set-state-in-effect)
- Replaced `useState(Date.now())` with lazy initializer `useState(() => Date.now())` (impure render)
- Replaced `useMemo(fn, [])` with `useMemo(() => fn(), [])` (use-memo React Compiler rule)
- Removed orphaned array data from `SetupPanel.tsx` (parse error)
- Replaced 18× `any` in `WorkspacePage.tsx` with proper types
- Fixed `CombatUnit` → `Unit` in `LoadArmySelector.tsx` and `CalculatorPage.tsx`
- Added `eslint-disable-next-line` comments where extraction was impractical

### 3. ✅ Checklista jakości PR — COMPLETE ✅

**Status:** DONE on 2026-04-16

- Plik: `.github/pull_request_template.md`
- Zawiera: obowiązkowe kroki, reguły silnika, komponenty, typy, checklist dla PR

### 4. ✅ ADR: docelowy model rule engine — COMPLETE ✅

**Status:** DONE on 2026-04-16

- Plik: `docs/ADR-001-rule-engine-model.md`
- Zawiera: kontekst bugu side-awareness, decyzje (SpecialRule, RuleOption, inferRuleOptionSide, useSidedRuleOptions, guards), przepływ danych, tabelę wyłączności, ograniczenia, alternatywy

---

## Sprint 2 — "Spójny model reguł + testowalność" ✅ COMPLETE

**Status:** FULLY DONE on 2026-04-16

### 2.1 ✅ Refactor typów — explicit `combatRole`
- `createImplementedRuleOption` → `combatRole: "attacker"` (pokrywa cały mapper automatycznie)
- `createImplementedDefenderRuleOption` → `combatRole: "defender"`
- Custodes `armyRules.ts` i `shieldHost.ts` — ręcznie dodane `combatRole`
- `flyblownHostRuleOverride` — dodane `combatRole: "defender"`

### 2.2 ✅ Testy kontraktowe mapowania reguł
- Nowy plik: `src/data/factions/__tests__/ruleContract.test.ts`
- 10 testów: walidator po stronie, Custodes army rules, Shield Host, Death Guard army rules, Flyblown Host verminous haze, mapper output
- Wykryto i naprawiono 3 brakujące `combatRole` w `shieldHost.ts`

### 2.3 ✅ Death Guard FactionConfig
- `src/data/factions/DeathGuard/armyRules.ts` — Plague Weapons (attacker) + Disgustingly Resilient (defender)
- `src/data/factions/DeathGuard/faction.ts` — 10 detachmentów, rejestracja w `index.ts`
- `useFactionRules.ts` — ujednolicony przez `getFactionConfigByName`, army rules flow dla wszystkich frakcji z FactionConfig
- `runtimeDetachments.ts` — dodano `armyRules: []` dla frakcji bez FactionConfig

### 2.4 ✅ README / productStatus update
- `productStatus.ts` — Death Guard i World Eaters promowane do "Playable beta"
- Latest changes i in-progress zaktualizowane

### Stats po Sprint 2:
- Testy: 142 → 154 (12 nowych)
- Frakcje z FactionConfig: 1 (Custodes) → 2 (Custodes + Death Guard)
- `combatRole` pokrycie: ~0% → 100% (wszystkie implemented rules)

---

## Definition of Done

For "stabilna baza pod rozwój":

- [x] Brak markerów konfliktu merge w repo
- [x] `npm run check` = PASS
- [x] Każda nowa reguła silnika ma test(y)
- [x] README odzwierciedla rzeczywisty stan funkcji i ograniczeń

---

## Sprint 3 — Necrons + T'au Empire FactionConfig ✅ COMPLETE (2026-04-16)

- `src/data/factions/Necrons/armyRules.ts` — Reanimation Protocols (FNP 4+, defender), Living Metal (info-only)
- `src/data/factions/Necrons/faction.ts` — 12 detachmentów
- `src/data/factions/Tau/armyRules.ts` — Markerlight (+1 Hit, attacker), Saviour Protocols (FNP 5+, defender)
- `src/data/factions/Tau/faction.ts` — 8 detachmentów
- `src/data/factions/index.ts` — zarejestrowane obie frakcje
- Testy: 6 nowych → **160 total**

---

## Sprint 4 — World Eaters FactionConfig ✅ COMPLETE (2026-04-16)

- `src/data/factions/WorldEaters/armyRules.ts` — 3 Blessings of Khorne (REROLL_HITS / REROLL_WOUNDS / LETHAL_HITS, selectionGroup: "we-blessing") + Berzerker Charge (info-only)
- `src/data/factions/WorldEaters/faction.ts` — 8 detachmentów
- Testy: 3 nowe → **163 total**

---

## Sprint 5 — Space Marines FactionConfig ✅ COMPLETE (2026-04-16)

- `src/data/factions/SpaceMarines/armyRules.ts` — Oath of Moment (REROLL_HITS + REROLL_WOUNDS, oba modyfikatory w jednym toggl'u)
- `src/data/factions/SpaceMarines/faction.ts` — 40 detachmentów
- Testy: 2 nowe → **165 total**
- `productStatus.ts`: World Eaters + Space Marines → "Recommended for testing"

---

## Sprint 6 — UI selectionGroup radio buttons ✅ COMPLETE (2026-04-16)

- `src/components/ModifiersPanel.tsx`:
  - `DisplayRule` + `selectionGroup?: string`
  - Nowe komponenty: `SelectionGroupRow` (wrapper z "None" opcją) + `RadioRow` (radio input z tooltipem)
  - `CombatRoleSection` dzieli detachment rules na standalone (checkbox) i grouped (radio)
- Mutex logika już była w `useSidedRuleOptions.ts` — UI teraz to odzwierciedla wizualnie

---

## Sprint 7 — Engine edge case tests ✅ COMPLETE (2026-04-16)

- `src/lib/combat/__tests__/expectedDamage.test.ts` — 3 nowe testy:
  - MELTA: D6=3.5 full range vs D6+2=5.5 half range
  - REROLL_HITS_ONES: boost mniejszy niż full reroll
  - REROLL_WOUNDS_ONES: boost mniejszy niż full reroll
- Testy: +3 → **168 total**

---

## Sprint 8 — Aeldari + CSM + Tyranids FactionConfig ✅ COMPLETE (2026-04-16)

- `src/data/factions/ChaosSpaceMarines/` — Veterans of the Long War (REROLL_WOUNDS melee), 16 detachmentów
- `src/data/factions/Tyranids/` — Synaptic Directives: Voracious Appetite (REROLL_WOUNDS_ONES, implemented) + Onslaught + Metabolic Overdrive (info-only), selectionGroup: "tyranids-directive", 12 detachmentów
- `src/data/factions/Aeldari/` — Strands of Fate + Battle Focus (oboje info-only), 16 detachmentów
- `src/data/factions/index.ts` — 9 FactionConfigs zarejestrowanych
- `productStatus.ts`: CSM + Tyranids + Aeldari → "Playable beta"
- Testy: +8 → **176 total**

---

## Progress Log

### 2026-04-13

**COMPLETED:**
✅ **Sprint 1.1: Fix merge conflicts**
- Resolved all nested conflict markers in README.md
- Verified clean: zero conflicts in entire codebase
- README is now production-ready
- Lines 1-164 clean content, tail removed

**COMPLETED:**
✅ **Sprint 1.2: Get `npm run check` to pass** (2026-04-16)
- ESLint 0 errors, Vitest 142/142, Vite build clean

**NOT STARTED:**
- ⏳ PR quality checklist template
- ⏳ ADR for rule engine model
- ⏳ Sprint 2 tasks (rule refactoring, tests)

### Next Immediate Actions

1. **Verify build status**
   ```bash
   npm run lint    # Check for ESLint errors
   npm run test    # Run Vitest
   npm run build   # Ensure Vite build works
   ```

2. **Create PR template** (`.github/pull_request_template.md`)
   - Quality checklist
   - Testing requirements
   - Documentation rules

3. **Draft ADR document** for rule engine model
   - Current architecture review
   - Detachment override system explanation
   - Planned extensions

---

## Definition of Done

For "stabilna baza pod rozwój":

- ✅ Brak markerów konfliktu merge w repo
- ⏳ `npm run check` = PASS
- ⏳ Każda nowa reguła silnika ma test(y)
- ✅ README odzwierciedla rzeczywisty stan funkcji i ograniczeń

---
