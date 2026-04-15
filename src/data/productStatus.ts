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
  { label: "Best-tested factions", value: "Custodes, Necrons, Tau, World Eaters" },
];

export const latestChanges: StatusSection = {
  title: "Latest changes",
  items: [
    "Battle Workspace now supports saved-army matchup flow with explicit attacker weapon selection and battle-state setup.",
    "Army Builder uses cleaner saved loadouts and supports attached leader editing with live points updates.",
    "App startup is lighter: units and detachments now load by faction instead of one giant upfront bundle.",
    "Rules and modifiers are separated more clearly by attacker and defender context for faster scanning.",
  ],
};

export const inProgress: StatusSection = {
  title: "In progress",
  items: [
    "Further Death Guard support and wider faction rule coverage across detachments and abilities.",
    "More practical Army Builder validation for loadouts, hosts and attached leaders.",
    "More aggressive loading optimization for very large factions like Space Marines and Aeldari.",
    "More tester guidance around faction coverage, known limitations and expected workflow.",
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
    factions: ["Adeptus Custodes", "Necrons", "Tau Empire", "World Eaters"],
    note: "These have the most complete gameplay-facing rule coverage right now.",
  },
  {
    label: "Playable beta",
    tone: "beta",
    factions: ["Death Guard"],
    note: "Already useful, but still being actively expanded and stabilized.",
  },
  {
    label: "Data present, rules still partial",
    tone: "partial",
    factions: [
      "Adepta Sororitas",
      "Adeptus Mechanicus",
      "Astra Militarum",
      "Chaos Daemons",
      "Chaos Knights",
      "Chaos Space Marines",
      "Drukhari",
      "Grey Knights",
      "Imperial Agents",
      "Imperial Knights",
      "Leagues of Votann",
      "Orks",
      "Space Marines",
      "Thousand Sons",
      "Tyranids",
    ],
    note: "These are available in the data model, but should not be treated as deeply supported yet.",
  },
];
