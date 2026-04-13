export function WhatYouGet() {
  const features = [
    {
      title: "Expected Damage",
      description: "Average damage output with variance and percentile ranges",
    },
    {
      title: "Kill Chance",
      description: "Probability of eliminating the target in a single attack phase",
    },
    {
      title: "Distribution Analysis",
      description: "Full range of damage outcomes from worst to best case scenarios",
    },
    {
      title: "Breakdown Explanation",
      description: "Step-by-step trace of how each modifier affects the final result",
    },
  ];

  return (
    <div className="what-you-get">
      <h3 className="what-you-get__title">What You Get</h3>

      <ul className="what-you-get__list">
        {features.map((feature, idx) => (
          <li key={idx} className="what-you-get__item">
            <div className="what-you-get__item-icon" />
            <div className="what-you-get__item-content">
              <span className="what-you-get__item-title">{feature.title}</span>
              <span className="what-you-get__item-description">{feature.description}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
