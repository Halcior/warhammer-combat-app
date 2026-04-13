interface EmptyStateProps {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryText?: string;
}

export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryText,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <div className="empty-state__icon-placeholder" />
      </div>

      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__description">{description}</p>

      {primaryAction && (
        <button
          className="button-link button-link--primary"
          onClick={primaryAction.onClick}
        >
          {primaryAction.label}
        </button>
      )}

      {secondaryText && (
        <p className="empty-state__secondary">{secondaryText}</p>
      )}
    </div>
  );
}
