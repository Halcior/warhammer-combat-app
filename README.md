# Warhammer 40k Combat Analyzer

Aplikacja webowa (React + TypeScript + Vite) do szybkiej analizy skuteczności ataku w **Warhammer 40,000 (10th edition)**.

Pozwala porównać bronie i jednostki, włączyć wybrane modyfikatory/reguły oraz sprawdzić wynik zarówno analitycznie (expected value), jak i symulacyjnie (Monte Carlo).

## Możliwości

- **Obliczenia analityczne** (expected value) dla sekwencji hit → wound → save → damage
- **Symulacja Monte Carlo** dla dokładniejszego rozkładu wyników
- **Porównanie broni** — dwie konfiguracje w tym samym kontekście
- **Reguły specjalne** — obsługa Rapid Fire, Blast, Torrent, Twin-linked, Lethal Hits, Sustained Hits, Devastating Wounds, Melta, Heavy, Lance, Ignores Cover
- **Reguły frakcji i detachmentów** — wsparcie dla Adeptus Custodes, Necrons, Tau, Death Guard, World Eaters
- **Saved Armies** — zapis i zarządzanie zestawami jednostek
- **Workspace** — porównywanie dwóch armii jednocześnie

## Stack techniczny

- React 19
- TypeScript 5
- Vite 5
- Vitest
- ESLint

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

## Komendy deweloperskie

```bash
npm run dev      # Start lokalnego serwera dev
npm run build    # Kompilacja produkcyjna
npm run preview  # Preview produktu
npm run test     # Testy jednostkowe (Vitest)
npm run check    # Lint + typecheck
npm run lint     # ESLint
npm run import:custodes  # Import danych Adeptus Custodes
```

## Architektura

### Pipeline danych

```
CSV (Wahapedia) → generator → normalized JSON → mapper → faction config
```

### Struktura silnika

- **Expected value engine** — szybkie obliczenia deterministyczne
- **Monte Carlo simulator** — dokładne rozkłady z losowością
- **Rule registry** — system reguł specjalnych i modyfikatorów
- **Detachment system** — obsługa reguł detachmentów z overridami

### Struktura `src/`

```
src/
├── components/              # React komponenty UI
│   ├── AppNav.tsx          # Nawigacja między widokami
│   ├── SetupPanel.tsx      # Panel wyboru jednostek
│   ├── ModifiersPanel.tsx  # Panel modyfikatorów
│   ├── SimulationPanel.tsx # Panel symulacji
│   ├── ArmiesView.tsx      # Widok zarządzania armiami
│   └── WorkspaceView.tsx   # Widok workspace do porównań
├── hooks/
│   ├── useBattleSetup.ts       # Stan ustawień bitwy
│   ├── useAttackModifiers.ts   # Stan modyfikatorów
│   ├── useFactionRules.ts      # Reguły frakcji
│   └── useArmyPresets.ts       # Zarządzanie armiami
├── lib/
│   ├── combat/         # Silnik obliczeń
│   ├── storage/        # Persistence (localStorage)
│   └── rules.ts        # Logika reguł
├── data/
│   ├── units.ts                   # Baza jednostek
│   ├── detachments.ts             # Reguły detachmentów
│   ├── detachmentRules/           # Implementacje reguł
│   └── factions/                  # Konfiguracje frakcji
├── domain/
│   ├── rule.ts                    # Typ Rule
│   └── detachment.ts              # Typ Detachment
├── types/
│   ├── army.ts                    # Typy army/preset
│   ├── combat.ts                  # Typy bitwy/modyfikatorów
│   └── faction.ts                 # Typy frakcji
└── App.tsx                        # Główny komponent
```

## Ograniczenia i Known Gaps

Aplikacja celowo upraszcza część reguł i nie modeluje całego rulesetu WH40k 10e:

- Brak pełnego modelu fazy gry (ruch, charge, fight sequencing)
- Część keywordów jest rozpoznawana, ale nie wszystkie mają pełną implementację w silniku
- Brak pełnej obsługi złożonych interakcji (faction + detachment + stratagem razem)
- Brak modelu celu z wieloma profilami obronnymi
- Brak precyzyjnego modelowania line of sight i edge cases targetowania
- Parser importu danych opiera się na heurystykach i może wymagać ręcznej korekty

W praktyce narzędzie jest najlepsze do **szybkiej analizy porównawczej** i sanity-checków decyzji.

## Workflow

1. **Wybór jednostek** — frakcja, jednostka, broń, liczba modeli
2. **Ustawienie warunków** — cover, half range, charge, stationary, reguły
3. **Odczyt wyniku** — expected hits/wounds/damage
4. **Symulacja (opcjonalnie)** — Monte Carlo dla percentyli i rozkładu
5. **Porównanie broni** — druga broń w tym samym kontekście
6. **Zapisane Armie** — twoż zestawy i użyj w Workspace do porównań

## Heurystyka mapowania profili wielomodelowych

Gdy jednostka normalizowana ma wiele profilów modeli, mapper wybiera profil główny:
- preferuje profil rank-and-file nad wariantami (Sergeant, Superior, Exarch, Champion, Captain)
- jeśli wszystko to warianty, zachowuje oryginalną kolejność źródłową
- to proxy dla "najpopularniejszego modelu" do czasu aż będą dostępne jawne liczby składu

## Dane

Dane wejściowe są czytane z katalogu `CSV/`. System obsługuje import z formatów Wahapedia.

## Persistence

Aplikacja zapisuje w `localStorage`:
- **UI session** — aktualny widok (calculator/armies/workspace) oraz załadowane armie
- **Battle setup** — ostatnio wybrane fakcje, jednostki, bronie i liczby modeli
- **Army presets** — użytkownika zapisane konfiguracje armii (max 3 darmowych)

## Workflow gałęzi i CI

Strategia stabilizacji i łączenia zmian: [`docs/branching-strategy.md`](docs/branching-strategy.md)

## Status i Roadmapa

### Phase 0 — Foundation (bieżąca)
- ✅ Stabilizacja repo i CI
- ✅ Usunięcie konfliktów merge
- ⚙️  Spójny model reguł
- ⚙️  Testy dla głównych flow'ów

### Phase 1 — Free MVP (planowana)
- Podstawowy kalkulator ✅
- Porównanie bronie i setup'ów ✅
- Modyfikatory i reguły ✅
- Symulacje i wyjaśnienia ✅
- Saved armies (presets) ✅
- Workspace do porównań armii ✅

### Phase 2+ — Premium i ekspansja
- Więcej frakcji i detachmentów
- Zaawansowana analiza scenariuszowa
- Batch testing
- Importy rosteru

Szczegóły: [`AI Collaboration Guide/ROADMAP.md`](AI%20Collaboration%20Guide/ROADMAP.md)

## Development Guide

Więcej o procesie development'u: [`AI Collaboration Guide/BOT_GUIDE.md`](AI%20Collaboration%20Guide/BOT_GUIDE.md)
