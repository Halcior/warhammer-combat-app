# ADR-001: Rule Engine Model

**Status:** Accepted  
**Date:** 2026-04-16  
**Authors:** bpawelec + Claude

---

## Kontekst

Silnik walki (`src/lib/combat/`) oblicza oczekiwane obrażenia i symulacje na podstawie parametrów jednostek, broni i aktywnych modyfikatorów. Zasady frakcji, detachmentów i strategemów muszą trafiać do silnika jako lista `SpecialRule[]`, ale silnik nie wie skąd reguła pochodzi — traktuje całą listę jednakowo.

To stworzyło bug: reguły detachmentu atakującego (np. `LETHAL_HITS`) wyświetlone w panelu **obrońcy** nadal trafiały do `attackerScopedModifierRules`, ponieważ toggle był podpięty do stanu atakującego. Potrzebny był mechanizm świadomości strony.

---

## Decyzja

### 1. `SpecialRule` — atomowy typ efektu

`SpecialRule` (`src/types/combat.ts`) to discriminated union opisujący **jeden efekt mechaniczny**:

```ts
type SpecialRule =
  | { type: "LETHAL_HITS" }
  | { type: "FEEL_NO_PAIN"; value: number }
  | { type: "REROLL_HITS" }
  // ... ~35 typów
```

Każdy typ jest albo **wyłącznie atakującego** (rerolls, extra hits, crits), albo **wyłącznie obrońcy** (FNP, damage reduction, invuln), albo **neutralny** (modyfikatory AP, Strength, Toughness).

### 2. `RuleOption` — konfiguracja wybieralnej reguły

`RuleOption` (`src/types/faction.ts`) opisuje **regułę do zaznaczenia przez gracza**:

```ts
type RuleOption = {
  id: string;
  name: string;
  appliesTo: "attacker" | "defender" | "army" | ...;
  combatRole?: "attacker" | "defender" | "shared";  // explicit override
  modifiers: SpecialRule[];  // efekty przekazywane do silnika
};
```

Pole `combatRole` pozwala jawnie przypisać regułę do strony. Jeśli go brak, strona jest inferowana przez `inferRuleOptionSide()` w `ModifiersPanel`.

### 3. `inferRuleOptionSide()` — inferencja strony

Reguła jest przypisywana do strony według priorytetu:

1. `combatRole` (explicit) — zawsze wygrywa
2. `appliesTo === "attacker"` → attacker
3. `appliesTo === "defender"` → defender  
4. Analiza `modifiers`: jeśli przeważają typy atakującego → attacker, obrońcy → defender
5. Domyślnie: attacker

### 4. `useSidedRuleOptions` — hook świadomy strony

Zamiast jednej płaskiej listy aktywnych ID, hook przechowuje:

```ts
type SidedActiveIds = { attacker: string[]; defender: string[] };
```

`toggleRuleOptionForSide(ruleId, side)` zapisuje aktywację do właściwej strony. ModifiersPanel wywołuje toggle z `inferRuleOptionSide(rule)` jako `side`.

### 5. Guards — ostatnia linia obrony

`guardAttackerModifiers()` i `guardDefenderModifiers()` (`src/lib/combat/combatRoleGuards.ts`) filtrują listy przed przekazaniem do silnika:

```ts
// Przed silnikiem:
attackerScopedModifierRules = guardAttackerModifiers([
  ...attackerRules,
  ...ruleOptions.attackerModifiers,  // już przefiltrowane przez side
]);

defenderScopedModifierRules = guardDefenderModifiers([
  ...defenderRules,
  ...ruleOptions.defenderModifiers,
]);
```

Guards to ochrona przed błędami w danych — nawet jeśli reguła trafi do złej listy, zostanie odfiltrowana.

---

## Przepływ danych

```
FactionConfig.ruleOptions[]
       │
       ├─ inferRuleOptionSide(rule) ──► "attacker" | "defender"
       │
ModifiersPanel renderuje rule w odpowiednim panelu
       │
       └─ toggleRuleOptionForSide(ruleId, side)
               │
       useSidedRuleOptions.activeRuleOptionIdsBySide
               │
       ├─ .attackerModifiers ─► guardAttackerModifiers() ─► silnik (activeModifierRules)
       └─ .defenderModifiers ─► guardDefenderModifiers() ─► silnik (activeDefenderModifierRules)
```

---

## Typy wyłączności reguł

| Kategoria | Typy | Dozwolone w |
|---|---|---|
| Attacker-exclusive | `REROLL_HITS`, `REROLL_WOUNDS`, `LETHAL_HITS`, `DEVASTATING_WOUNDS`, `SUSTAINED_HITS`, `TWIN_LINKED`, `EXTRA_ATTACKS`, `TORRENT`, `FIXED_HIT_ROLL`, `IGNORE_HIT_MODIFIERS`, `CRITICAL_HITS_ON` | tylko `activeModifierRules` |
| Defender-exclusive | `FEEL_NO_PAIN`, `DAMAGE_REDUCTION`, `INVULNERABLE_SAVE`, `SET_SAVE_CHARACTERISTIC` | tylko `activeDefenderModifierRules` |
| Neutralne | `AP_MODIFIER`, `STRENGTH_MODIFIER`, `TOUGHNESS_MODIFIER`, `DAMAGE_MODIFIER`, `HIT_MODIFIER`, `WOUND_MODIFIER`, `IGNORES_COVER`, `MELTA`, `HEAVY`, `LANCE`, `ASSAULT`, `BLAST`, `PRECISION`, `INDIRECT_FIRE` | obydwie listy |

---

## Konsekwencje

**Dobre:**
- Reguła atakującego wyświetlona w panelu obrońcy NIE może wpłynąć na atak (guards + side tracking)
- Dodanie nowej reguły wymaga tylko dodania jej do `ATTACKER_EXCLUSIVE_RULE_TYPES` lub `DEFENDER_EXCLUSIVE_RULE_TYPES` jeśli jest nieambiwalentna
- Testy kontraktowe mogą weryfikować `guardAttackerModifiers` i `guardDefenderModifiers` niezależnie

**Ograniczenia / dług techniczny:**
- `inferRuleOptionSide()` jest heurystyką — reguły z mieszanymi modifiers mogą być źle przypisane; preferuj jawne `combatRole` w danych
- Brak walidacji że `RuleOption.appliesTo` i `combatRole` są spójne z zawartością `modifiers`
- Stratagemy i Enhancementy mają własne hooks (`useStratagemOptions`, `useEnhancementOptions`) bez side-awareness — obsługiwane przez odrębne listy (`attackerScopedModifierRules` vs `defenderScopedModifierRules`)

---

## Alternatywy rozważane

**A) Jeden flat hook z flagą na każdym ID** — `{ id: string, side: "attacker" | "defender" }[]`  
Odrzucone: trudniejsze do subskrybowania w poszczególnych komponentach.

**B) Guards tylko w silniku** — silnik sam filtruje listy  
Odrzucone: silnik nie wie nic o intencji użytkownika — musi ufać że caller robi właściwą segregację; guards przy wejściu są jawniejsze i testowalniejsze.

**C) Osobne hooks per strona** — `useAttackerRuleOptions` + `useDefenderRuleOptions`  
Odrzucone: duplikacja logiki toggle (szczególnie selectionGroup); `useSidedRuleOptions` centralizuje obie strony przy zachowaniu separacji.

---

## Powiązane pliki

- `src/types/combat.ts` — `SpecialRule`, `ConditionalRuleFields`
- `src/types/faction.ts` — `RuleOption`, `DetachmentConfig`, `FactionConfig`
- `src/lib/combat/combatRoleGuards.ts` — `guardAttackerModifiers`, `guardDefenderModifiers`, stałe `*_EXCLUSIVE_RULE_TYPES`
- `src/hooks/useSidedRuleOptions.ts` — side-aware state management
- `src/components/ModifiersPanel.tsx` — `inferRuleOptionSide()`, `buildModifiersPanelModel()`
- `src/lib/combat/expectedDamage.ts` — konsument: `activeModifierRules`, `activeDefenderModifierRules`
