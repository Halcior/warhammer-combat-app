# Warhammer Combat App

<<<<<<< HEAD
<<<<<<< ours
<<<<<<< ours
Aplikacja webowa do szybkiej analizy skuteczności ataku w **Warhammer 40,000 (10th edition)**.
Pozwala porównać bronie i jednostki, włączyć wybrane modyfikatory/reguły oraz sprawdzić wynik zarówno analitycznie (expected value), jak i symulacyjnie (Monte Carlo).
=======
Aplikacja webowa (React + TypeScript + Vite) do analizy skuteczności ataku w **Warhammer 40,000 (10th edition)**.
>>>>>>> 84a08e4b37faab1dc06065f90388def063853d67

## Co potrafi teraz

- szybkie obliczenia analityczne (expected value) dla sekwencji hit → wound → save → damage,
- tryb symulacji Monte Carlo (dla dokładniejszego rozkładu wyników),
- porównanie dwóch profili broni w tym samym kontekście celu,
- podstawowa obsługa reguł specjalnych (np. Rapid Fire, Blast, Torrent, Twin-linked, Lethal Hits, Sustained Hits, Devastating Wounds, Melta, Heavy, Lance, Ignores Cover).

## Stack

- React 19
- TypeScript 5
- Vite 8
- Vitest
- ESLint

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

<<<<<<< HEAD
<<<<<<< ours
> Dane wejściowe są czytane z katalogu `CSV/`.

---

## 4) Ograniczenia / known gaps

Aplikacja celowo upraszcza część reguł i nie modeluje całego rulesetu WH40k 10e.

- Brak pełnego modelu fazy gry (ruch, charge, fight sequencing, timing windows).
- Część keywordów jest rozpoznawana/parowana, ale nie wszystkie mają pełną implementację efektu w silniku.
- Brak pełnej obsługi interakcji wielowarstwowych (np. złożone łańcuchy faction/detachment/stratagem + wyjątki).
- Brak modelu celu z wieloma profilami obronnymi w obrębie jednej jednostki (mixed durability / mixed saves).
- Brak pełnej obsługi mechanik sytuacyjnych typu line of sight, engagement edge cases, precyzyjne targetowanie modeli i allocation wound-by-wound.
- Parser importu danych opiera się na heurystykach tekstowych i może wymagać ręcznej korekty dla nietypowych zapisów.

W praktyce narzędzie jest najlepsze do **szybkiej analizy porównawczej** i sanity-checków decyzji, a nie jako pełny silnik turniejowego rules arbitration.

---

## 5) Przykładowy workflow

1. **Wybór jednostek**
   - wybierz frakcję atakującego i obrońcy,
   - wybierz jednostkę, broń i liczbę modeli po obu stronach.

2. **Ustawienie modyfikatorów/reguł**
   - zaznacz warunki starcia (cover, half range, charge, stationary),
   - aktywuj reguły faction/detachment i manualne modyfikatory.

3. **Odczyt wyniku analitycznego**
   - sprawdź expected hits/wounds/unsaved,
   - sprawdź expected damage oraz expected slain models.

4. **Uruchomienie symulacji (opcjonalnie)**
   - przełącz tryb na `Accurate`,
   - ustaw liczbę przebiegów i uruchom Monte Carlo,
   - porównaj średnią, medianę, percentyle, szansę na kill/wipe.

5. **Porównanie broni**
   - wybierz drugą broń tej samej jednostki,
   - porównaj efektywność w tym samym kontekście obrony celu.
=======
=======

>>>>>>> theirs
=======

>>>>>>> theirs
## Mapper heuristic for multi-profile units

When a normalized unit has multiple model profiles, the mapper picks a primary profile using a business heuristic:
- prefer a rank-and-file profile over leader/variant profiles (e.g. Sergeant, Superior, Exarch, Champion, Captain),
- if every profile looks like a variant, keep the original source order as fallback (no alphabetical sorting).

This is a proxy for "most common model" until explicit composition counts are available in normalized data.
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
=======
Aplikacja webowa (React + TypeScript + Vite) do analizy starć jednostek Warhammer 40k.

## Cel na teraz: jedna stabilna baza

Jeśli masz bałagan między gałęziami a `main`, najlepszym podejściem jest najpierw ustabilizować jeden punkt odniesienia, a dopiero potem rozwijać funkcje.

W repozytorium dodałem prosty workflow, który to porządkuje:

1. Ustalenie **jednej gałęzi stabilnej** (`main`).
2. Zbieranie zmian z innych gałęzi przez PR-y do `main`.
3. Szybki smoke test (`npm run build`, `npm run test`, `npm run lint`) przed każdym mergem.
4. Oznaczanie stabilnych punktów tagami (`v0.1.0`, `v0.2.0`, itd.).

Szczegóły procesu (w tym gotowa sekwencja komend do łączenia gałęzi) są opisane w: [`docs/branching-strategy.md`](docs/branching-strategy.md).

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

>>>>>>> theirs
=======
>>>>>>> 84a08e4b37faab1dc06065f90388def063853d67
## Skrypty

```bash
npm run dev
npm run build
npm run test
npm run lint
npm run import:custodes
```

- `dev` — start lokalnego środowiska
- `build` — kompilacja TypeScript + build Vite
- `test` — testy jednostkowe (Vitest)
- `lint` — linting (ESLint)
- `import:custodes` — import/generowanie danych Adeptus Custodes

<<<<<<< HEAD
1. Wybierz gałąź, która ma być bazą stabilną (najczęściej `main`).
2. Zrób backup aktualnego stanu (tag lub osobna gałąź).
3. Wyrównaj różnice z aktywnych gałęzi tylko przez PR-y.
4. Po przejściu testów oznacz release tagiem.
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
## Workflow gałęzi

Strategia stabilizacji i łączenia zmian jest opisana w:

- [`docs/branching-strategy.md`](docs/branching-strategy.md)

## Ograniczenia

To narzędzie jest kalkulatorem/symulatorem pomocniczym. Nie implementuje pełnego rules arbitration dla wszystkich edge-case’ów WH40k 10e.
>>>>>>> 84a08e4b37faab1dc06065f90388def063853d67
