# Analiza stanu kodu i proponowane kolejne kroki (2026-04-09)

## Szybkie podsumowanie

Aplikacja ma solidny trzon domenowy (analityka + symulacje), ale aktualnie gałąź jest w stanie **niestabilnym** i wymaga prac porządkowych przed dalszym rozwojem funkcjonalnym.

Najważniejszy blocker: w kodzie i dokumentacji pozostały markery konfliktów merge (`<<<<<<<`, `=======`, `>>>>>>>`).

## Co potwierdziłem lokalnie

- `npm run check` nie przechodzi.
- Pierwszy twardy błąd: parser ESLint zatrzymuje się na markerze konfliktu w `src/App.tsx`.
- `README.md` również zawiera nierozwiązane konflikty.

## Najpilniejsze zadania (kolejność rekomendowana)

### 1) Stabilizacja repo i CI (must-have)

1. Rozwiązać konflikty merge w:
   - `src/App.tsx`
   - `README.md`
2. Ustalić jedną wersję API symulacji w `App.tsx` (obecnie konflikt między wywołaniem `runSimulationByMode(...)` i innym podejściem).
3. Doprowadzić `npm run check` do PASS jako warunek wejścia w kolejne feature’y.

### 2) Spójność modelu domenowego reguł

1. Ujednolicić model detachmentu/rule options między warstwą danych i runtime.
2. Ograniczyć duplikację reprezentacji (szczególnie między `src/domain/*`, `src/types/*`, `src/data/factions/*`).
3. Dodać „single source of truth” dla mapowania reguł na modyfikatory silnika (`SpecialRule`).

### 3) Testy, które odblokują bezpieczny rozwój

1. Dodać test integracyjny dla głównego flow `App`:
   - wybór jednostki,
   - aktywacja reguł,
   - uruchomienie expected/simulation.
2. Dodać testy kontraktowe dla warstwy mapowania reguł (rule option -> efekt w silniku).
3. Dla każdej nowej reguły: minimum 1 test pozytywny + 1 test edge-case.

### 4) Roadmapa funkcjonalna (po stabilizacji)

1. **Priorytet A:** rozbudowa pokrycia reguł frakcyjnych/detachmentów i ich interakcji.
2. **Priorytet B:** większa transparentność wyniku (źródła modyfikatorów i ich wkład procentowy).
3. **Priorytet C:** porównania scenariuszowe (ten sam weapon profile przy różnych warunkach: cover, charge, half range).
4. **Priorytet D:** import kolejnych frakcji/danych i walidacja jakości parsera danych wejściowych.

## Proponowany backlog na 2 sprinty

### Sprint 1 — „Green CI + porządek techniczny”

- [ ] Naprawa konfliktów merge (`App.tsx`, `README.md`)
- [ ] `npm run check` = PASS
- [ ] Checklista jakości PR (lint/test/build)
- [ ] Krótki dokument ADR: docelowy model rule engine

### Sprint 2 — „Spójny model reguł + testowalność”

- [ ] Refactor warstwy typów reguł/detachmentów
- [ ] Testy kontraktowe mapowania reguł
- [ ] 1–2 kompletne implementacje nowych detachment interactions
- [ ] Aktualizacja README o realne pokrycie zasad

## Definition of Done dla „stabilnej bazy pod rozwój”

- Brak markerów konfliktu merge w repo
- `npm run check` = PASS
- Każda nowa reguła silnika ma test(y)
- README odzwierciedla rzeczywisty stan funkcji i ograniczeń
