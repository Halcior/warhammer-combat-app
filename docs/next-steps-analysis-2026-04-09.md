# Analiza stanu kodu i proponowane kolejne kroki (2026-04-09)

## Szybkie podsumowanie

Projekt ma działający trzon domenowy (`expected` + `simulation`) i przechodzące testy jednostkowe,
ale obecny stan gałęzi nie jest jeszcze „production-ready”, bo pipeline jakości (lint/build) nie przechodzi.

## Co działa

- Testy jednostkowe: **45/45 PASS**.
- Architektura ma sensowny podział na:
  - `src/lib/combat` (silnik domenowy),
  - `src/hooks` i `src/components` (UI + stan),
  - `src/data` (mapowanie i dane wejściowe).

## Główne problemy blokujące stabilność

1. **README zawiera markery konfliktu merge** (`<<<<<<<`, `=======`, `>>>>>>>`).
   - To sygnał nieskończonego scalania i ryzyko niespójnej dokumentacji.

2. **Build nie przechodzi (TypeScript)**:
   - `talonsOfTheEmperor.ts`: użycie pola `description`, którego nie ma w typie `DetachmentDefinition`.
   - `expectedDamage.ts`: nieużywana zmienna `activeEngineTags`.

3. **Lint nie przechodzi (React hooks + unused vars)**:
   - `useFactionRules.ts`: `setState` w `useEffect`, co łamie regułę `react-hooks/set-state-in-effect`.
   - powtórzenie problemu nieużywanej zmiennej `activeEngineTags`.

4. **Niespójność modeli detachmentów**:
   - W kodzie są równolegle różne reprezentacje (`domain/detachment.ts` vs runtime config `types/faction.ts`),
     co utrudnia rozwój reguł i importów.

## Proponowana kolejność prac (plan 2 sprintów)

### Sprint 1 — „Stabilizacja main”

1. **Naprawić blokery CI**
   - Usunąć markery konfliktu z `README.md` i ujednolicić treść.
   - Ujednolicić typy detachmentów (albo rozszerzyć `DetachmentDefinition`, albo przestać go używać w runtime config).
   - Rozwiązać lint w `useFactionRules` (wyprowadzić inicjalizację `selectedDetachmentId` bez efektu wymuszającego setState).
   - Usunąć/zaimplementować użycie `activeEngineTags`.

2. **Dodać gate jakości lokalnie i w CI**
   - Jedna komenda np. `npm run check` => `lint + test + build`.
   - Ustawić wymagane checki przed mergem do `main`.

3. **Minimalna higiena dokumentacji**
   - README: stan faktyczny funkcji + lista ograniczeń + workflow branchowania.

### Sprint 2 — „Porządkowanie domeny reguł”

1. **Jeden model reguł i detachmentów**
   - Spiąć import/normalizację z modelem runtime.
   - Zdefiniować jedno źródło prawdy dla:
     - `RuleOption`,
     - `DetachmentConfig`,
     - mapowania do `SpecialRule`/engine tags.

2. **Warstwa Army Rules jako osobny moduł**
   - Nie dokładać wszystkiego do listy modifierów broni.
   - Dodać kontekst: army/detachment/phase w jednym obiekcie wejściowym do silnika.

3. **Weryfikowalność implementacji reguł**
   - Tabela „support level” + testy kontraktowe dla każdej reguły (implemented/planned/info-only).

## Definition of Done dla „stabilnego main”

- `npm run lint` = PASS
- `npm run test` = PASS
- `npm run build` = PASS
- README bez konfliktów merge
- Co najmniej 1 test dla każdej nowej reguły engine

## Rekomendacja praktyczna na najbliższy PR

Najpierw zrobić **PR „Stabilizacja jakości i typów”** (bez nowych feature’ów), który:

- czyści README,
- naprawia typy detachmentów,
- naprawia lint/build,
- dodaje skrypt agregujący checki.

Dopiero na tej bazie rozwijać army rules i kolejne detachmenty.
