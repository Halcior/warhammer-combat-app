export type StatusSection = {
  title: string;
  items: string[];
};

export type FactionSupportGroup = {
  label: string;
  tone: "ready" | "beta" | "partial";
  factions: string[];
  note: string;
};

export type ReleaseSnapshotItem = {
  label: string;
  value: string;
};

export const releaseSnapshot: ReleaseSnapshotItem[] = [
  { label: "Current build", value: "Public alpha" },
  { label: "Best test flow", value: "Calculator + Workspace + saved armies" },
  { label: "Best-tested factions", value: "Custodes, CSM, Necrons, Orks, Space Marines, Tau, Tyranids, World Eaters" },
];

export const latestChanges: StatusSection = {
  title: "Latest changes",
  items: [
    "Orks now have FactionConfig support with Waaagh! implemented as a real melee attack boost toggle. Grey Knights and Adepta Sororitas are now registered with info-only army rules.",
    "Chaos Space Marines: Veterans of the Long War (re-roll Wound rolls in melee) now toggleable. Tyranids: Synaptic Directives added — Voracious Appetite (re-roll Wounds of 1) implemented, others info-only.",
    "Aeldari detachments now registered (16 total). Army rules Strands of Fate and Battle Focus listed as info-only — no direct calculator equivalent.",
    "Space Marines: Oath of Moment (re-roll Hit + Wound rolls) toggleable. World Eaters Blessings of Khorne mutex radio group.",
    "Necrons: Reanimation Protocols (FNP 4+). T'au Empire: Markerlight (+1 to hit) + Saviour Protocols (FNP 5+).",
    "Attacker and defender rules are now strictly separated — a rule in the Defender panel can never boost the attacker.",
  ],
};

export const inProgress: StatusSection = {
  title: "In progress",
  items: [
    "Expanding Death Guard detachment rule coverage beyond Flyblown Host and Mortarion's Hammer.",
    "Edge case engine rules: critical hit thresholds, melta damage, blast weapons.",
    "UI polish: Blessings of Khorne should display as a radio group (one selection) rather than independent checkboxes.",
    "More aggressive loading optimization for very large factions like Space Marines and Aeldari.",
  ],
};

export const knownLimitations: StatusSection = {
  title: "Known limitations",
  items: [
    "Not every datasheet rule or codex interaction is implemented yet, especially movement, mission play and broader table-state mechanics.",
    "Army Builder is practical, but it is not yet a full legality validator for every list-building edge case.",
    "Faction support is intentionally uneven right now; some factions are much more battle-ready than others.",
    "Simulation is strongest for direct attack and defense interactions, not full turn sequencing.",
  ],
};

export const factionSupportGroups: FactionSupportGroup[] = [
  {
    label: "Recommended for testing",
    tone: "ready",
    factions: ["Adeptus Custodes", "Necrons", "Orks", "Space Marines", "Tau Empire", "World Eaters"],
    note: "These have the most complete gameplay-facing rule coverage right now.",
  },
  {
    label: "Playable beta",
    tone: "beta",
    factions: ["Adepta Sororitas", "Aeldari", "Chaos Space Marines", "Death Guard", "Grey Knights", "Tyranids"],
    note: "Army rules and detachments registered. Key rules implemented; full coverage still expanding.",
  },
  {
    label: "Data present, rules still partial",
    tone: "partial",
    factions: [
      "Adeptus Mechanicus",
      "Astra Militarum",
      "Chaos Daemons",
      "Chaos Knights",
      "Drukhari",
      "Imperial Agents",
      "Imperial Knights",
      "Leagues of Votann",
      "Thousand Sons",
    ],
    note: "These are available in the data model, but should not be treated as deeply supported yet.",
  },
];
