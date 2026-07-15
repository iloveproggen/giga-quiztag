import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type FrameButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  active?: boolean;
  size?: 'default' | 'compact' | 'large';
};

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
      ? 'dell-button-primary'
      : active
        ? 'dell-button-active'
        : 'dell-button-secondary';

  const sizeClass =
    size === 'compact'
      ? 'dell-button-size-compact'
      : size === 'large'
        ? 'dell-button-size-large'
        : 'dell-button-size-default';

  return (
    <button
      type={type}
      className={`dell-button ${variantClass} ${sizeClass} ${className}`}
      {...props}
    />
  );
}

export function SectionCard({
  title,
  children,
  bodyStyle,
  sticker,
}: {
  title: string;
  children: ReactNode;
  bodyStyle?: CSSProperties;
  sticker?: string;
}) {
  return (
    <section className="dell-panel dell-shadow overflow-hidden">
      <div className="border-b border-[var(--color-frame-ink)] bg-[var(--color-canvas)] px-[var(--space-md)] py-[var(--space-sm)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-dell-ui text-[14px] font-bold uppercase">{title}</p>
          {sticker ? (
            <div className="-rotate-6 border border-[var(--color-frame-ink)] bg-[var(--color-yellow-sticker)] px-[var(--space-sm)] py-[var(--space-xs)]">
              <span className="font-dell-ui text-[11px] font-bold uppercase">
                {sticker}
              </span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="p-[var(--space-md)]" style={bodyStyle}>
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
    <div className="min-h-screen bg-[var(--color-canvas)] p-6">
      <div className="dell-panel dell-shadow mx-auto flex min-h-[320px] w-full max-w-[960px] flex-col justify-center gap-4 bg-[var(--color-tint-steel)] px-[var(--space-section)] py-[var(--space-section)] text-center">
        <p className="font-dell-display text-[clamp(32px,4vw,56px)] leading-none uppercase">
          {title}
        </p>
        <p className="font-dell-body text-[18px] leading-[1.5]">{message}</p>
      </div>
    </div>
  );
}
