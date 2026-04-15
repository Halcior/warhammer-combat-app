import { PageHeader } from "../PageHeader";
import {
  factionSupportGroups,
  inProgress,
  knownLimitations,
  latestChanges,
  releaseSnapshot,
} from "../../data/productStatus";

function StatusList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="card status-card">
      <p className="panel-eyebrow">{title}</p>
      <ul className="status-card__list">
        {items.map((item) => (
          <li key={item} className="status-card__item">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function UpdatesPage() {
  return (
    <div className="updates-page">
      <PageHeader
        title="Release Notes"
        subtitle="A quick read for testers: what is ready, what is moving, and where the current build is strongest."
        helperText="This page is here to set expectations before deeper testing, not to be a full historical changelog."
      />

      <section className="card release-snapshot">
        <div className="release-snapshot__intro">
          <p className="panel-eyebrow">Tester snapshot</p>
          <h2 className="release-snapshot__title">Best used as a focused alpha, not a finished codex simulator.</h2>
          <p className="release-snapshot__text">
            The current build is already strong for matchup exploration, saved-army testing and fast attack math,
            especially when you stay inside the best-supported factions.
          </p>
        </div>

        <div className="release-snapshot__grid">
          {releaseSnapshot.map((item) => (
            <div key={item.label} className="release-snapshot__item">
              <span className="release-snapshot__label">{item.label}</span>
              <strong className="release-snapshot__value">{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="updates-grid">
        <StatusList title={latestChanges.title} items={latestChanges.items} />
        <StatusList title={inProgress.title} items={inProgress.items} />
      </div>

      <section className="card support-status">
        <p className="panel-eyebrow">Faction support</p>
        <div className="support-status__grid">
          {factionSupportGroups.map((group) => (
            <article
              key={group.label}
              className={`support-status__group support-status__group--${group.tone}`}
            >
              <h3 className="support-status__title">{group.label}</h3>
              <p className="support-status__note">{group.note}</p>
              <div className="support-status__chips">
                {group.factions.map((faction) => (
                  <span key={faction} className="support-status__chip">
                    {faction}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <StatusList title={knownLimitations.title} items={knownLimitations.items} />
    </div>
  );
}
