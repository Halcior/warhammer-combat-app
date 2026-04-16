## Co robi ten PR?

<!-- Krótki opis zmian. Co zostało dodane, naprawione lub zmienione? -->

## Dlaczego?

<!-- Motywacja. Co rozwiązuje ten PR — bug, feature, dług techniczny? -->

## Jak testować?

<!-- Kroki do ręcznego sprawdzenia zmian w przeglądarce. -->

1. 
2. 

---

## Checklista

### Obowiązkowe

- [ ] `npm run check` przechodzi (lint + test + build)
- [ ] Brak nowych błędów TypeScript (`tsc -b`)
- [ ] Żadnych zakomentowanych `console.log` / martwego kodu

### Reguły / logika silnika

- [ ] Nowe reguły mają test w `src/lib/combat/__tests__/` lub `src/hooks/__tests__/`
- [ ] Żadna reguła atakującego nie trafia do `defenderScopedModifierRules` (guard sprawdzony)
- [ ] `guardAttackerModifiers` / `guardDefenderModifiers` użyte tam gdzie trzeba

### Komponenty

- [ ] Pliki eksportujące stałe/funkcje poza komponentem mają `eslint-disable react-refresh/only-export-components` lub zostały wyekstrahowane do `src/lib/`
- [ ] Brak `useEffect(() => setState, [deps])` — używamy previous-props pattern
- [ ] Brak `useState(Date.now())` bez lazy initializer

### Dane / typy

- [ ] Brak `any` w interfejsach komponentów (szczególnie w `WorkspacePage`, `CalculatorPage`)
- [ ] Nowe pola w `ArmyPresetV2` są opcjonalne lub mają migrację

---

## Typ zmiany

- [ ] Bug fix
- [ ] Nowy feature
- [ ] Refactor / dług techniczny
- [ ] Dokumentacja
- [ ] Dane (nowe frakcje / jednostki / zasady)
