interface PageHeaderProps {
  title: string;
  subtitle?: string;
  helperText?: string;
}

export function PageHeader({ title, subtitle, helperText }: PageHeaderProps) {
  return (
    <div className="page-header">
      <h1 className="page-header__title">{title}</h1>
      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      {helperText && <p className="page-header__helper">{helperText}</p>}
    </div>
  );
}
