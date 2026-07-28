import React, { FC } from 'react';

import classNames from 'clsx';

import { Icon, IconName } from 'app/icons/v2';
import { hapticLight } from 'lib/mobile/haptics';

export type PromptCardVariant = 'default' | 'warning' | 'critical';

export interface PromptCardProps {
  title: string;
  body?: string;
  variant?: PromptCardVariant;
  onClick?: () => void;
  onDismiss?: () => void;
  /**
   * Label for an inline action. Prompts that ask the user to DO something
   * carry it here rather than relying on the whole card being tappable — the
   * connectivity notices ("Try again" / "Retry sync") and the unclaimed-notes
   * notice ("Claim") all need a named action, and a bare chevron does not say
   * what will happen.
   */
  ctaLabel?: string;
  onCta?: () => void;
  className?: string;
}

export const PromptCard: FC<PromptCardProps> = ({
  title,
  body,
  onClick,
  onDismiss,
  ctaLabel,
  onCta,
  className
}) => {
  const handleClick = () => {
    if (!onClick) return;
    hapticLight();
    onClick();
  };

  const handleDismiss = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!onDismiss) return;
    hapticLight();
    onDismiss();
  };

  const handleCta = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!onCta) return;
    hapticLight();
    onCta();
  };

  const Trail = onDismiss ? (
    <button
      type="button"
      onClick={handleDismiss}
      aria-label="Dismiss"
      className="shrink-0 flex items-center justify-center w-6 h-6 -mr-1 text-text-tertiary-token"
    >
      <Icon name={IconName.Close} className="w-4 h-4" fill="currentColor" />
    </button>
  ) : (
    <Icon name={IconName.ChevronRight} size="xs" className="dark:stroke-pure-white" />
  );

  return (
    <div
      role={onClick ? 'button' : undefined}
      onClick={onClick ? handleClick : undefined}
      className={classNames('w-full bg-surface-input rounded-10', 'flex items-center gap-3 px-4 py-3', className)}
    >
      <div className="flex flex-col gap-1 min-w-0 flex-1 text-ink">
        <div className={classNames('text-body font-bold font-heading leading-tight truncate')}>{title}</div>
        {/* Two lines, then clamp. `connectivityNodeBody` is the longest string
            in the system and a 2-line clamp cut it mid-sentence — it read
            "Your balance may be" and stopped. Three is what that string and
            the guardian prompt need. */}
        {body && <div className="text-caption font-normal text-ink-2 line-clamp-3">{body}</div>}
      </div>
      {ctaLabel && onCta && (
        <button
          type="button"
          onClick={handleCta}
          className="shrink-0 min-h-11 rounded-full bg-surface px-3 text-caption font-bold text-ink"
        >
          {ctaLabel}
        </button>
      )}
      {Trail}
    </div>
  );
};

export default PromptCard;
