# Warhammer Combat App

Aplikacja webowa (React + TypeScript + Vite) do analizy skuteczności ataku w **Warhammer 40,000 (10th edition)**.

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

## Workflow gałęzi

Strategia stabilizacji i łączenia zmian jest opisana w:

- [`docs/branching-strategy.md`](docs/branching-strategy.md)

## Ograniczenia

To narzędzie jest kalkulatorem/symulatorem pomocniczym. Nie implementuje pełnego rules arbitration dla wszystkich edge-case’ów WH40k 10e.
