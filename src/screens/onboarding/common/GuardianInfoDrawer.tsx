import React from 'react';

import { Trans, useTranslation } from 'react-i18next';

import { ReactComponent as WhatIsGuardianHero } from 'app/icons/onboarding/what-is-guardian-hero.svg';
import { Icon, IconName } from 'app/icons/v2';
import { Button, ButtonVariant } from 'components/Button';
import { Drawer, DrawerContent, DrawerTitle } from 'lib/ui/drawer';
import { cn } from 'lib/ui/util';

export interface GuardianInfoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InfoRowProps {
  badge: React.ReactNode;
  title: string;
  description: string;
  /** The rule sits BETWEEN rows (`.isrow + .isrow`), so the first has none. */
  hasDivider?: boolean;
}

/**
 * `.isrow` — the row's own type, not the step-screen type. The title is the
 * 13px display face at 800 and the description the 11px `--ink-2` caption; both
 * were running two steps larger, which is what made the sheet scroll.
 *
 * Left-aligned, as the mock draws it. These were centred, which broke the
 * badge/label relationship: a centred row re-centres on every line-wrap, so the
 * three badges no longer formed a column the eye could scan down.
 */
const InfoRow: React.FC<InfoRowProps> = ({ badge, title, description, hasDivider = true }) => (
  <div className={cn('py-[0.6875rem]', hasDivider && 'border-t border-rule')}>
    {/* `.ish` — `font-heading` sits here so the badge glyph inherits the
        display face, exactly as `.isb` inherits it from `.ish` in the spec. */}
    <div className="flex items-center gap-2 font-heading text-label font-extrabold leading-[1.55] text-ink">
      {badge}
      <h3 className="min-w-0 break-words">{title}</h3>
    </div>
    <p className="mt-1 break-words text-caption leading-[1.45] text-ink-2">{description}</p>
  </div>
);

/**
 * `.isb` — a 20px circle. The glyph colour is passed in rather than fixed to
 * white: on the accent fill a small white glyph is 2.9:1 and fails, so that
 * badge uses `--on-accent-sm`; the positive/negative fills use `--paper`, which
 * flips with the theme instead of staying white on dark's much lighter green.
 */
const IconBadge: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full leading-none', className)}>
    {children}
  </span>
);

export const GuardianInfoDrawer: React.FC<GuardianInfoDrawerProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* Rebuilt on the SHARED sheet anatomy (`.sheetc`): grab handle, dim
          scrim, hairline divider, secondary dismiss.
          This deliberately drops the three things the shipped component added —
          a 6px accent top border, a transparent overlay, and a second 6px accent
          rule under the intro. All three fight the primitive and read as a
          warning banner on dark. The scrim in particular is load-bearing: the
          dim is what isolates the sheet, and `bg-transparent` put it below the
          40–60% floor entirely. Omitting `overlayClassName` is the fix — the
          Drawer primitive's default is already 40% light / 55% dark with a
          non-animated 4px blur, which is exactly the spec. */}
      <DrawerContent className="max-h-[82%] overflow-hidden rounded-t-lg-token bg-surface">
        <div className="flex flex-col overflow-y-auto px-5 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* `.shandle`. Hand-rolled rather than the primitive's `hideHandle`
              affordance, which draws a 2px `primary-500` bar — the spec's
              handle is a 4px `--rule-strong` one. Decorative: vaul still owns
              the drag gesture, so this carries no semantics of its own. */}
          <div aria-hidden className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-rule-strong" />

          <DrawerTitle className="text-center font-heading text-subhead font-extrabold leading-[1.55] text-ink">
            {t('whatIsAGuardian')}
          </DrawerTitle>

          {/* 5.75rem, not the step screens' `--hero-w` (8.75rem): a sheet hero
              is a smaller register than a step illustration. */}
          <WhatIsGuardianHero className="mx-auto mt-2 block h-auto w-[5.75rem] shrink-0" />

          <p className="mt-[0.4375rem] text-center text-label leading-[1.5] text-ink-2">
            <Trans i18nKey="guardianInfoDescription" components={{ b: <span className="font-bold text-ink" /> }} />
          </p>

          {/* `.shdiv` — full-bleed, so the negative margin matches the sheet's
              own `px-5` gutter exactly. It reaches the padding edge and no
              further, so it adds no horizontal overflow. */}
          <div className="-mx-5 my-[0.9375rem] h-px shrink-0 bg-rule" />

          <div className="flex flex-col">
            <InfoRow
              badge={
                <IconBadge className="bg-pos">
                  <Icon name={IconName.Checkmark} size="xs" fill="currentColor" className="text-paper" />
                </IconBadge>
              }
              title={t('guardianInfoWhatItDoesTitle')}
              description={t('guardianInfoWhatItDoesDescription')}
              hasDivider={false}
            />
            <InfoRow
              badge={<IconBadge className="bg-accent text-caption font-extrabold text-on-accent-sm">!</IconBadge>}
              title={t('guardianInfoSwitchingIsEasyTitle')}
              description={t('guardianInfoSwitchingIsEasyDescription')}
            />
            <InfoRow
              badge={
                <IconBadge className="bg-neg">
                  <Icon name={IconName.Close} size="xs" fill="currentColor" className="text-paper" />
                </IconBadge>
              }
              title={t('guardianInfoWhatItCannotDoTitle')}
              description={t('guardianInfoWhatItCannotDoDescription')}
            />
          </div>

          {/* `.shft` — a SECONDARY dismiss. Closing an explainer is not a
              primary action competing with the "Continue" behind it. */}
          <div className="mt-3.5 flex shrink-0 justify-center">
            <Button variant={ButtonVariant.Secondary} title={t('gotIt')} onClick={() => onOpenChange(false)} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GuardianInfoDrawer;
