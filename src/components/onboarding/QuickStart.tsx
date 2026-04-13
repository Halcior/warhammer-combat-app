interface QuickStartProps {
  onLoadExample: () => void;
  isLoading?: boolean;
}

export function QuickStart({ onLoadExample, isLoading = false }: QuickStartProps) {
  return (
    <div className="quick-start">
      <div className="quick-start__content">
        <h3 className="quick-start__title">⚡ Quick Start</h3>
        <p className="quick-start__description">
          Load a pre-configured example to see how the calculator works
        </p>
      </div>

      <button
        className="button-link button-link--primary"
        onClick={onLoadExample}
        disabled={isLoading}
        aria-label="Load example matchup"
      >
        {isLoading ? "Loading..." : "Load example matchup"}
      </button>
    </div>
  );
}
