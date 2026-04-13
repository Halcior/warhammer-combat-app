interface ExampleResultProps {
  title?: string;
  description?: string;
}

export function ExampleResult({ title = "Example Results", description = "This is what you'll see after setting up a matchup" }: ExampleResultProps) {
  return (
    <div className="example-result">
      <div className="example-result__header">
        <h3 className="example-result__title">{title}</h3>
        <p className="example-result__description">{description}</p>
      </div>

      <div className="example-result__content">
        <div className="example-result__card">
          <span className="example-result__label">Attacker</span>
          <span className="example-result__value">Necron Warriors</span>
        </div>

        <div className="example-result__card">
          <span className="example-result__label">Defender</span>
          <span className="example-result__value">Space Marine Tactical Squad</span>
        </div>

        <div className="example-result__card example-result__card--highlight">
          <span className="example-result__label">Expected Damage</span>
          <span className="example-result__value">3.5 avg</span>
        </div>

        <div className="example-result__card example-result__card--highlight">
          <span className="example-result__label">Kill Chance</span>
          <span className="example-result__value">78%</span>
        </div>
      </div>

      <p className="example-result__footer">
        Load your army or try the example above to get started
      </p>
    </div>
  );
}
