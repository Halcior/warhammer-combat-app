# AI Collaboration Guide

This document explains how AI coding assistants should support development of this project.

## Project goal

This application is a **Warhammer 40k decision-support tool**, not just a toy calculator.

The long-term direction is:

- free core calculator for all users
- optional low-cost premium for advanced convenience features
- gradual evolution from simple damage calculator into a more complete **analysis and workflow tool**

The product should help users:

- calculate expected damage
- compare weapons and units
- simulate combat scenarios
- understand why a result happens
- save time when testing matchups
- make better tabletop decisions

---

## Product philosophy

Assistants should treat this project as a **practical tool for players**, not as a generic demo app.

When making suggestions or implementing features, prioritize:

1. clarity
2. correctness
3. maintainability
4. user usefulness
5. extensibility

Do **not** optimize for flashy architecture without product value.

Do **not** add complexity unless it supports the roadmap.

---

## Development priorities

### Current core priorities

Focus on improving the application in this order:

1. **stability and correctness**
2. **clean UI/UX**
3. **useful core gameplay features**
4. **clean internal architecture**
5. **future premium-friendly feature structure**

If a choice must be made, prefer a solution that is easier to maintain and easier to extend.

---

## Roadmap

## Phase 0 - Foundation

Goal: create a stable and clean base.

Key objectives:

- eliminate merge conflicts and broken states
- keep `main` stable
- clean branch strategy
- remove dead code and conflict markers
- ensure main flows work correctly
- improve code readability where needed
- avoid overengineering

Examples of important work:

- fix broken imports
- fix simulation flow
- clean `App.tsx`
- reduce chaos in state handling
- separate UI logic from combat logic
- keep components readable

Success criteria:

- app runs reliably
- main branch is safe to build on
- new features can be added without fear of breaking everything

---

## Phase 1 - Free MVP

Goal: deliver a useful public version.

Core features:

- basic combat calculator
- compare two weapons / setups
- support for rules, modifiers, detachments, enhancements, stratagems
- simulation panel
- readable attack breakdown
- basic faction support
- stable and understandable UI

Important principles:

- free version must already be useful
- avoid fake “demo” feeling
- users should be able to do real scenario testing
- keep onboarding simple

Suggested support work:

- improve labels and wording in UI
- make outputs easier to understand
- reduce unnecessary clicks
- make panels consistent
- make results visually easier to compare

Success criteria:

- users can run meaningful calculations quickly
- users understand results without reading code
- the app feels like a real tool

---

## Phase 2 - Premium v1

Goal: introduce a small paid upgrade with symbolic pricing.

Premium should provide **convenience**, not basic access.

Likely premium features:

- saved scenarios
- saved presets
- favorite matchups
- scenario history
- export/share-ready results
- advanced comparison workflows
- better organization of saved data

Important rule:

Do **not** lock the core calculator behind premium.

Premium should answer this question:

> “What would a frequent user gladly pay a small amount for because it saves time?”

Suggested pricing philosophy:

- low-friction
- symbolic
- hobby-friendly
- closer to “support + convenience unlock” than aggressive monetization

Success criteria:

- free remains useful
- premium feels worth paying for
- premium features clearly save time

---

## Phase 3 - Premium v2

Goal: evolve from calculator into a deeper decision-support tool.

Potential advanced features:

- roster-aware calculations
- batch simulations
- best target suggestions
- best weapon into target recommendations
- saved loadouts
- multi-target comparisons
- scenario templates
- matchup assistant features
- better filtering/search over units and scenarios

This is the stage where the app becomes more than “calculator”.

Assistants should favor designs that make this future possible.

That means:

- avoid hardcoding everything into one massive component
- keep domain logic separated from UI
- design state and data models so saved scenarios are possible
- make simulation and explanation pipelines reusable

---

## Phase 4 - Ecosystem / Scale

Goal: prepare for broader product maturity if usage justifies it.

Possible future directions:

- user accounts
- cloud sync
- shareable links
- community scenario presets
- mobile/PWA improvements
- imports from roster tools
- broader game system support

These are **not** immediate priorities unless explicitly requested.

Do not push account systems or backend complexity too early.

---

## Free vs Premium rules

Assistants must respect this split.

### Free should include

- meaningful combat calculations
- comparison of results
- rules/modifier support
- enough functionality to make the app genuinely useful

### Premium should include

- time-saving features
- organization features
- workflow features
- deeper analysis features
- convenience and power-user tools

### Premium should not be

- basic functionality hidden behind a wall
- annoying restrictions designed only to force payment
- artificial limitations that make the free version useless

---

## Coding principles

When helping on code, follow these rules.

### 1. Protect `main`

Prefer safe changes.

Avoid risky refactors unless explicitly asked.

If something is broken, fix the smallest correct surface first.

### 2. Avoid giant god-components

If a file becomes messy, split by responsibility:

- domain logic
- hooks/state
- presentational components
- utility functions

### 3. Prefer explicit logic over cleverness

This project benefits more from readable code than from clever abstractions.

### 4. Keep domain logic reusable

Combat math, simulation, rule mapping, and explanation logic should be usable independently of UI.

### 5. Design for iteration

New factions, rules, detachments, and premium features should be addable without rewriting the app.

### 6. Do not silently invent game logic

If a rule interaction is uncertain, flag it clearly instead of pretending certainty.

Correctness matters more than sounding smart.

---

## UX principles

When suggesting UI/UX changes:

- reduce friction
- make important outputs obvious
- improve comparison readability
- avoid clutter
- keep terminology understandable for players
- prioritize fast scenario testing

Good UX ideas:

- better grouping of controls
- clearer summaries
- visible active modifiers
- easier compare flows
- cleaner simulation output
- persistent presets later

Bad UX ideas:

- too many nested settings
- forcing users through long forms
- hiding important context
- overcomplicating screens for casual use

---

## What assistants should proactively help with

Helpful assistant behavior includes:

- spotting architecture issues before they grow
- suggesting cleaner feature boundaries
- identifying premium-friendly future hooks
- improving naming and structure
- simplifying state flow
- reducing technical debt
- helping write roadmap-aligned TODOs
- proposing feature scopes that fit the product direction

---

## What assistants should avoid

Do not:

- overengineer architecture prematurely
- introduce backend systems too early
- push enterprise-style abstractions
- rewrite large working areas without clear benefit
- optimize for theoretical scalability over actual product progress
- turn the app into a generic frontend exercise
- add monetization mechanisms before product value is clear

---

## Branch and merge guidelines

Assistants should encourage this workflow:

- branch from `main`
- one feature/fix per branch
- keep PR scope small
- avoid long-lived messy branches
- resolve conflicts fully before merge
- never leave conflict markers in committed code

If conflict markers exist, fixing them is a top priority.

---

## Preferred assistant output style

When helping with implementation:

- be practical
- be direct
- recommend the smallest valuable step
- prefer backlog-sized suggestions
- explain tradeoffs simply
- point out risks clearly

When proposing work, structure it as:

- what problem this solves
- why it matters for the roadmap
- the smallest good implementation
- what can wait until later

---

## Current strategic direction summary

This project should evolve like this:

1. stable free calculator
2. polished free MVP
3. small premium convenience layer
4. stronger analysis workflows
5. possible ecosystem expansion later

The main business idea is:

> free useful tool + small premium for convenience and power-user workflows

Not:

> aggressive paywall
> overbuilt SaaS too early
> monetization before utility

---

## Final instruction for assistants

When in doubt, choose the option that best supports:

- product usefulness
- stable development
- gradual monetization
- long-term maintainability
- realistic solo/small-project execution