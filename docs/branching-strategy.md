# Branching strategy i stabilizacja `main`

Ten dokument opisuje prosty, praktyczny workflow, który minimalizuje chaos między gałęziami.

## Założenia

- `main` = **zawsze stabilna i deployowalna** wersja.
- Wszystko, co jest ryzykowne lub eksperymentalne, trafia do gałęzi feature.
- Do `main` wchodzimy tylko przez Pull Request + podstawowe checki.

## Nazewnictwo gałęzi

- `main` — stabilna baza
- `feature/<nazwa>` — nowe funkcje
- `fix/<nazwa>` — poprawki błędów
- `chore/<nazwa>` — porządki techniczne
- `release/<wersja>` — opcjonalnie, jeśli chcesz etap release osobno

## Minimalny proces pracy

1. Aktualizuj lokalne `main`.
2. Twórz nową gałąź z `main` (`feature/*`, `fix/*`, itd.).
3. Rób małe, czytelne commity.
4. Otwórz PR do `main`.
5. Przed merge uruchom:
   - `npm run build`
   - `npm run test`
   - `npm run lint`
6. Scalaj tylko zielone PR-y.

## Plan porządkowania obecnego stanu

Gdy repo jest już „rozjechane”:

1. Zrób listę gałęzi i ich celu (co miały wnosić).
2. Wybierz gałąź, która jest najbliżej stabilnej bazy.
3. Zamroź na chwilę development (krótkie okno porządkowe).
4. Każdą istotną zmianę z innych gałęzi przenieś przez oddzielny PR:
   - łatwiej debugować regresje,
   - łatwiej cofnąć pojedynczy merge,
   - mniej konfliktów naraz.
5. Po zakończeniu oznacz stabilny punkt tagiem, np. `v0.1.0`.

### Szybka procedura „połączenia” istniejących gałęzi do stabilnego `main`

Poniżej minimalny, bezpieczny wariant do wykonania krok po kroku:

```bash
# 1) zabezpieczenie aktualnego stanu
git checkout main
git pull origin main
git tag backup/przed-porzadkami-$(date +%Y%m%d)

# 2) dla każdej ważnej gałęzi tworzysz osobny PR branch
git checkout -b merge/<nazwa-zmiany> main
git merge --no-ff <zrodlowa-galaz>

# 3) lokalna walidacja
npm run lint
npm run test
npm run build

# 4) push i PR do main
git push -u origin merge/<nazwa-zmiany>
```

Jeśli `git merge` generuje duży konflikt, zamiast łączyć całą gałąź naraz lepiej przenieść tylko potrzebne commity przez `git cherry-pick <sha>`.

## Definicja „stabilnej wersji”

W tym projekcie stabilna wersja to commit na `main`, który:

- przechodzi `npm run build`,
- przechodzi `npm run test`,
- przechodzi `npm run lint`,
- nie ma otwartych blockerów.

## Dobre praktyki

- Nie merguj dużych „work-in-progress” bezpośrednio do `main`.
- Utrzymuj PR-y małe (najlepiej 1 temat = 1 PR).
- Używaj Conventional Commits (np. `feat:`, `fix:`, `chore:`), żeby historia była czytelna.
- Oznaczaj stabilne wersje tagami i trzymaj krótki changelog.
