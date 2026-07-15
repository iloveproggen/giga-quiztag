import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type FrameButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  active?: boolean;
  size?: 'default' | 'compact' | 'large';
};

type StatusPillTone = 'neutral' | 'success' | 'warning' | 'danger' | 'dark';

export function FrameButton({
  variant = 'primary',
  active = false,
  size = 'default',
  className = '',
  type = 'button',
  ...props
}: FrameButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'ui-button-primary'
      : active
        ? 'ui-button-active'
        : 'ui-button-secondary';

  const sizeClass =
    size === 'compact'
      ? 'ui-button-compact'
      : size === 'large'
        ? 'ui-button-large'
        : 'ui-button-default';

  return (
    <button
      type={type}
      className={`ui-button ${variantClass} ${sizeClass} ${className}`}
      {...props}
    />
  );
}

export function StatusPill({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: StatusPillTone;
  className?: string;
}) {
  const toneClass =
    tone === 'success'
      ? 'ui-pill-success'
      : tone === 'warning'
        ? 'ui-pill-warning'
        : tone === 'danger'
          ? 'ui-pill-danger'
          : tone === 'dark'
            ? 'ui-pill-dark'
            : 'ui-pill-neutral';

  return <span className={`ui-pill ${toneClass} ${className}`}>{children}</span>;
}

export function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
}) {
  return (
    <div className="ui-panel rounded-2xl border border-slate-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      {helper ? <p className="mt-2 text-sm text-slate-600">{helper}</p> : null}
    </div>
  );
}

export function TeamAvatar({
  color,
  label,
  size = 'default',
}: {
  color?: string;
  label: string;
  size?: 'small' | 'default' | 'large';
}) {
  const sizeClass =
    size === 'small'
      ? 'h-9 w-9 text-sm'
      : size === 'large'
        ? 'h-16 w-16 text-2xl'
        : 'h-12 w-12 text-lg';

  return (
    <div
      className={`flex items-center justify-center rounded-2xl border border-slate-300 font-bold uppercase text-slate-900 ${sizeClass}`}
      style={{ backgroundColor: color ?? '#e5e7eb' }}
    >
      {label}
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  bodyStyle,
  bodyClassName = '',
  sticker,
  actions,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  bodyStyle?: CSSProperties;
  bodyClassName?: string;
  sticker?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`ui-panel overflow-hidden ${className}`}>
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-900">
              {title}
            </p>
            {subtitle ? (
              <p className="text-sm leading-6 text-slate-600">{subtitle}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {actions}
            {sticker ? <StatusPill>{sticker}</StatusPill> : null}
          </div>
        </div>
      </div>

      <div className={`p-5 ${bodyClassName}`} style={bodyStyle}>
        {children}
      </div>
    </section>
  );
}

export function HydrationPlaceholder({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="ui-panel flex min-h-[320px] flex-col items-center justify-center gap-5 px-8 py-10 text-center">
          <StatusPill tone="dark">Sync laeuft</StatusPill>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">
              {title}
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
