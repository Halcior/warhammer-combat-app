# Architecture & Product Direction

## Project goal

This project is evolving into an **advanced Warhammer 40k damage calculator**.

It should answer questions like:
- how much damage does this attack deal on average?
- what is the low / average / high roll scenario?
- what is the kill chance against a specific target?
- how do faction rules, detachment rules and modifiers change the output?

## What this project is not (for now)

This is **not** a full turn simulator or complete 40k rules engine.

Out of scope for now:
- full turn / phase sequencing across entire armies
- movement simulation
- mission / objective logic
- list building as the primary purpose
- complete tabletop state simulation

## Product definition

The target product is:

**Advanced damage calculator with:**
- real datasheet imports from CSV
- weapon / unit / keyword support
- faction and detachment rule support
- deterministic expected-value mode
- probabilistic simulation mode (Monte Carlo)
- outcome summaries such as kill chance and low/average/high results

## Core modes

### 1. Expected value mode
Fast analytical calculation.

Use cases:
- quick comparison between weapons
- fast UI feedback while changing inputs
- easy debugging of rules

### 2. Simulation mode
Repeated random trials for probabilistic output.

Use cases:
- low / median / high scenarios
- kill chance
- confidence ranges / percentiles
- showing weapon volatility

## Current architecture direction

### Runtime app responsibilities
- choose attacker / defender / weapon
- apply active rules and conditions
- run calculator or simulation
- render outputs cleanly

### Import pipeline responsibilities
- load raw CSV data
- normalize datasheets into app-friendly units
- extract weapons / keywords / abilities
- generate stable TypeScript data files

## Planned structure

```text
src/
  app/
    App.tsx
  features/
    combat/
      components/
      logic/
      hooks/
    results/
      components/
    comparison/
      components/
    faction-rules/
      hooks/
  entities/
    unit/
    faction/
    weapon/
  shared/
    combat-engine/
    ui/
    utils/
  data/
    generated/
    factions/

scripts/
  import40k/
```

## Priority roadmap

### Priority 1 — project cleanup
- clean folder structure
- reduce App.tsx responsibility
- separate UI from combat logic
- make generated data clearly separate from hand-written config

### Priority 2 — improve importer quality
- better filtering of invalid wargear rows
- stronger parsing of weapon rules from text
- cleaner unit / weapon IDs
- groundwork for loadouts and options

### Priority 3 — rules pipeline
- formalize how modifiers are applied
- separate info-only rules from implemented rules
- support more faction / detachment effects without hardcoding everything into UI

### Priority 4 — simulation engine
- add Monte Carlo mode
- surface median, percentiles and kill chance
- compare deterministic expected value vs simulation output

### Priority 5 — loadouts and options
- support optional wargear and loadout choices
- connect datasheet options to selectable weapon setups

## Design principles

- prefer correctness over feature count
- prefer explicit supported rules over fake “everything supported” UI
- do not edit generated data manually
- fix import / parsing issues in generator, not in output
- keep fast expected mode even after simulation mode exists

## Short-term target

Build a trustworthy calculator for:
- attacker
- weapon/loadout
- defender
- conditions
- faction/detachment modifiers
- expected output + probabilistic output

That is the current direction of the project.
