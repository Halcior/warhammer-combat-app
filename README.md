# Warhammer Combat App

<<<<<<< ours
Aplikacja webowa do szybkiej analizy skuteczności ataku w **Warhammer 40,000 (10th edition)**.
Pozwala porównać bronie i jednostki, włączyć wybrane modyfikatory/reguły oraz sprawdzić wynik zarówno analitycznie (expected value), jak i symulacyjnie (Monte Carlo).

## 1) Cel aplikacji i zakres wspieranych zasad

### Cel
- Skrócić czas liczenia obrażeń i strat modeli dla pojedynczego kontekstu ataku.
- Umożliwić porównanie dwóch profili broni bez ręcznego przeliczania tabeli Hit/Wound/Save.
- Dać dwa tryby wyniku:
  - **Fast** – wynik analityczny (wartości oczekiwane),
  - **Accurate** – symulacja Monte Carlo (rozkład wyników, min/max, percentyle, szansa wipe).

### Obecnie modelowane elementy mechaniki
- Sekwencja: liczba ataków → trafienia → rany → save → obrażenia → zabite modele.
- Modyfikacje i reguły broni/jednostki:
  - **Rapid Fire**, **Blast**, **Torrent**, **Twin-linked**, **Lethal Hits**, **Sustained Hits**,
  - **Devastating Wounds**, **Anti-X**, **Melta**, **Heavy**, **Lance**, **Ignores Cover**.
- Warunki starcia:
  - cover celu,
  - half range,
  - stationary,
  - charge turn,
  - zgodność z keywordem Anti,
  - liczebność atakujących i broniących modeli.

---

## 2) Krótki opis architektury

### `src/lib/combat`
Silnik domenowy obliczeń:
- funkcje prawdopodobieństwa i przeliczeń (hit/wound/save/damage),
- kalkulacja wyniku oczekiwanego,
- moduł symulacji Monte Carlo oraz agregacji statystyk.

### `src/components`
Warstwa UI React:
- konfiguracja stron starcia (atakujący, obrońca, broń, warunki),
- panel modyfikatorów i reguł,
- prezentacja wyniku expected,
- prezentacja wyniku symulacyjnego,
- porównanie dwóch broni.

### `src/data`
Warstwa danych i mapowania:
- statyczne dane frakcji/jednostek,
- wygenerowane dane (`generated/`, `normalized/`),
- mapery normalizowanych rekordów do modelu combat.

---

## 3) Uruchomienie i import danych

## Wymagania
- Node.js 20+ (zalecane LTS),
- npm.

## Instalacja
```bash
npm install
```

## Komendy developerskie
```bash
npm run dev
npm run build
npm run test
npm run lint
```

- `dev` – start lokalnego środowiska Vite,
- `build` – TypeScript build + bundling produkcyjny,
- `test` – testy jednostkowe (Vitest),
- `lint` – analiza statyczna ESLint.

## Import / generowanie danych

### `import:custodes`
```bash
npm run import:custodes
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
>>>>>>> theirs
```
<<<<<<< ours
<<<<<<< ours
Skrypt uruchamia `scripts/import40k/generateUnits.mjs` i generuje plik:
- `src/data/generated/units.generated.ts`

<<<<<<< ours
### Pozostałe skrypty w `scripts/`
- `scripts/wahapedia-normalizer/normalizeData.mjs` – normalizacja surowych CSV do JSON:
  - `src/data/normalized/factions.json`
  - `src/data/normalized/units.json`

Uruchomienie przykładowe:
```bash
node scripts/wahapedia-normalizer/normalizeData.mjs
```

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
## Skrypty

- `npm run dev` — uruchamia aplikację lokalnie
- `npm run build` — buduje produkcyjny bundle
- `npm run test` — uruchamia testy (Vitest)
- `npm run lint` — uruchamia linting
- `npm run import:custodes` — importuje dane jednostek Adeptus Custodes

## Proponowany następny krok

1. Wybierz gałąź, która ma być bazą stabilną (najczęściej `main`).
2. Zrób backup aktualnego stanu (tag lub osobna gałąź).
3. Wyrównaj różnice z aktywnych gałęzi tylko przez PR-y.
4. Po przejściu testów oznacz release tagiem.
>>>>>>> theirs
