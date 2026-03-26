Projekt

Warhammer Combat App
Cel:
Zaawansowany kalkulator + symulator walki WH40k z:

detachment rules
stratagemami
enhancementami
Monte Carlo simulation
expected math engine
CSV → normalized data pipeline
Aktualna architektura
DATA PIPELINE

CSV (Wahapedia dump)
→ generator
→ normalized JSON
→ mapper
→ faction config
→ rule options
→ active modifiers
→ combat engine

SYSTEM DETACHMENTS (NOWY)

Detachment system działa tak:

normalizedDetachment
→ mapper
→ RuleOption
→ override registry
→ engine modifiers

Override system:

detachmentRules/
  registry.ts
  types.ts
  adeptusCustodes/
    shieldHost.ts

Override pattern:

rule -> override(rule) -> rule z modifierami

Support levels:

info-only
partial
implemented
Martial Mastery – Shield Host

Real rule:

choose one each battle round:

crit hits on 5+
AP +1 melee

Current implementation (temporary):

BOTH ACTIVE AT ONCE
(bo szybciej było zrobić end-to-end)

Docelowo:

RuleOption split:

Martial Mastery – Crit Mode
Martial Mastery – AP Mode
NOWE ENGINE RULE TYPES

Dodane:

CRITICAL_HITS_ON
AP_MODIFIER

UI jeszcze nie ma labeli → pokazuje unknown rule

To nie bug engine.

COMBAT ENGINE STRUCTURE

Expected:

expectedDamage.ts

Simulation:

simulateAttackContext.ts

Monte Carlo:

analyzeSimulation.ts

Flow:

weapon + modifiers + conditions
→ combinedRules
→ attack loop
→ save logic
→ damage
→ slain models

Simulation philosophy

Simulation ma być:

probabilistyczna
realistyczna
army rule aware
detachment aware
stratagem aware

Docelowo:

Output:

min kills
max kills
avg kills
kill distribution
damage distribution
kill probability
CURRENT PROBLEMS
1. Rule override działa ale:
UI label missing
Martial Ka'tah not modelled
Detachment effects global instead of conditional
2. Rule pipeline complexity rośnie

Need:

RULE GRAPH

Nie:

flat list

NEXT BIG SYSTEM TO BUILD
ARMY RULE LAYER

Currently missing:

Martial Ka'tah
Oath of Moment
Miracle Dice
etc

Without this:

detachment rules nie są w pełni poprawne

NEXT ENGINE EVOLUTION

Now:

weapon-centric engine

Later:

army-context engine

Needed abstraction:

CombatContext
ArmyContext
UnitContext
DetachmentContext
PhaseContext
LONG TERM VISION

App = Warhammer combat sandbox

Features planned:

full detachment logic
stratagem timing engine
army rules
phase simulation
aura system
targeting simulation
expected + monte carlo hybrid
matchup analyzer
army builder integration
IMPORTANT LESSONS LEARNED
CSV import był kluczowy
Normalization layer = MUST
Rule override system = VERY GOOD decision
Simulation + expected = best combo
Branch chaos is dangerous
Engine rules must be declarative
CURRENT BRANCH

feature/detachments-import

Stable point.

NEXT SAFE STEP

Finish:

Shield Host properly

Then:

template all detachments

Then:

army rules layer