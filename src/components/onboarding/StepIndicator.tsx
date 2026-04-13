interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { num: 1, label: "Select units" },
    { num: 2, label: "Adjust conditions" },
    { num: 3, label: "View results" },
  ];

  return (
    <div className="step-indicator">
      {steps.map((step, idx) => (
        <div key={step.num} className="step-indicator__item">
          <div
            className={`step-indicator__dot ${
              currentStep >= step.num ? "step-indicator__dot--active" : ""
            }`}
          >
            {currentStep > step.num ? (
              <span className="step-indicator__checkmark">✓</span>
            ) : (
              step.num
            )}
          </div>
          <span className="step-indicator__label">{step.label}</span>

          {idx < steps.length - 1 && (
            <div
              className={`step-indicator__line ${
                currentStep > step.num ? "step-indicator__line--active" : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
