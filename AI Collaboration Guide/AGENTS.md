# AGENTS.md

## Project summary

This project is a Warhammer 40k combat and decision-support application.

It is **not** just a toy calculator.
The long-term goal is to build a useful player tool with:

- free core calculator features
- optional low-cost premium convenience features
- gradual evolution toward a stronger analysis workflow tool

---

## Current priorities

Assistants should prioritize work in this order:

1. stability
2. correctness
3. maintainability
4. clarity of UI and outputs
5. future extensibility

Do not optimize for unnecessary complexity.

---

## Product direction

The intended product path is:

1. stable free calculator
2. polished free MVP
3. small premium convenience layer
4. deeper decision-support features

Premium should provide convenience and workflow value, not basic access.

---

## What the app should help users do

- calculate expected damage
- compare units, weapons, and setups
- simulate combat outcomes
- understand why a result happens
- save time when testing scenarios
- make better tabletop decisions

---

## Free vs premium philosophy

### Free should include

- meaningful combat calculations
- comparisons
- rules/modifier support
- enough functionality to make the tool genuinely useful

### Premium should include

- save/load scenarios
- saved presets
- history
- export
- advanced comparison workflows
- deeper workflow/convenience features

### Do not

- hide the basic calculator behind premium
- cripple the free version
- add monetization-first features before product usefulness

---

## Coding rules

### 1. Protect main

- Keep `main` stable
- Prefer small safe changes
- Do not leave conflict markers in committed code
- Do not introduce risky refactors unless explicitly requested

### 2. Keep logic separated

Prefer separation between:

- UI components
- hooks/state
- combat/domain logic
- mapping/parsing utilities

Combat logic should remain reusable outside UI.

### 3. Prefer readable code

- choose explicit logic over clever abstractions
- avoid unnecessary indirection
- keep components understandable

### 4. Build for iteration

New factions, detachments, rule interactions, scenario-saving, and premium features should be addable without large rewrites.

### 5. Do not invent rules silently

If a Warhammer interaction is uncertain:

- do not pretend certainty
- flag ambiguity clearly
- prefer correctness over confidence

---

## UX rules

Prefer:

- faster scenario setup
- clearer output summaries
- visible active modifiers
- easier side-by-side comparisons
- less friction
- less clutter

Avoid:

- deeply nested configuration flows
- overcomplicated screens
- hiding important context
- UI complexity that does not improve usefulness

---

## Current roadmap focus

## Phase 0 - Foundation

Main goals:

- remove broken states
- fix merge conflicts
- clean unstable files
- keep app buildable
- simplify messy areas where useful

## Phase 1 - Free MVP

Main goals:

- stable calculator
- comparison tools
- simulation panel
- readable breakdown
- basic detachment / stratagem / enhancement support
- understandable outputs

## Phase 2 - Premium v1

Main goals:

- saved scenarios
- saved presets
- favorites
- history
- export/share-ready outputs

## Phase 3 - Premium v2

Main goals:

- roster-aware analysis
- batch simulation
- best target suggestions
- best weapon recommendations
- multi-scenario comparison workflows

---

## Assistant behavior

When helping with code:

- prefer the smallest valuable implementation
- explain tradeoffs briefly
- point out risks clearly
- suggest backlog-sized next steps
- keep roadmap alignment in mind

When proposing changes, frame them as:

- problem being solved
- why it matters
- smallest good implementation
- what can wait until later

---

## Things assistants should proactively help with

- removing technical debt that blocks roadmap progress
- spotting architecture issues early
- simplifying overly messy code
- improving feature boundaries
- making future save/preset/workflow features easier to add
- improving naming and readability

---

## Things assistants should avoid

- overengineering
- adding backend/account systems too early
- introducing large abstractions without product value
- rewriting working code without a strong reason
- focusing on theoretical scalability over actual usefulness
- treating the app like a generic frontend sandbox

---

## Branching rules

Preferred workflow:

- branch from `main`
- one feature or fix per branch
- keep PRs small
- resolve all merge conflicts fully
- never commit conflict markers
- do not let long-lived messy branches accumulate

---

## If in doubt

Choose the option that best supports:

- product usefulness
- stable development
- maintainability
- roadmap flexibility
- realistic solo-project execution