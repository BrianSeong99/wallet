import React from 'react';

import { Trans, useTranslation } from 'react-i18next';

import { ReactComponent as WhatIsGuardianHero } from 'app/icons/onboarding/what-is-guardian-hero.svg';
import { Icon, IconName } from 'app/icons/v2';
import { Button } from 'components/Button';
import { Drawer, DrawerContent, DrawerTitle } from 'lib/ui/drawer';

import { OnboardingHero } from './layout';

export interface GuardianInfoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InfoRowProps {
  badge: React.ReactNode;
  title: string;
  description: string;
  hasDivider?: boolean;
}

/**
 * `.isrow` — the row's own type, not the step-screen type. The title is the
 * 13px display face at 800 and the description the 11px `--ink-2` caption; both
 * were running two steps larger, which is what made the sheet scroll.
 */
const InfoRow: React.FC<InfoRowProps> = ({ badge, title, description, hasDivider = true }) => (
  <div className={hasDivider ? 'border-b border-rule' : undefined}>
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-stack-tight text-center">
      <div className="flex max-w-full items-center gap-stack-tight">
        {badge}
        <h3 className="min-w-0 break-words text-left font-heading text-label font-extrabold leading-[1.2] text-ink">
          {title}
        </h3>
      </div>
      <p className="mt-1 break-words text-caption leading-[1.45] text-ink-2">{description}</p>
    </div>
  </div>
);

/**
 * 20px circle, per `.isb`. The glyph colour is passed in rather than fixed to
 * white: on the accent fill a small white glyph is 2.9:1 and fails, so that
 * badge uses `--on-accent-sm`; the positive/negative fills use `--paper`, which
 * flips with the theme instead of staying white on dark's light green.
 */
const IconBadge: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`flex size-5 shrink-0 items-center justify-center rounded-full ${className}`}>{children}</div>
);

export const GuardianInfoDrawer: React.FC<GuardianInfoDrawerProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* InfoSheet anatomy, kept as shipped: 6px accent top border, centred
          title, hero, centred intro, a 6px accent rule, divider-separated rows
          and ONE full-width dismiss. The transparent overlay is deliberate —
          this sheet explains the screen behind it, so it must not dim it. */}
      <DrawerContent
        className="max-h-[78vh] overflow-hidden rounded-t-lg-token border-t-6 border-accent bg-surface"
        overlayClassName="bg-transparent backdrop-blur-0 dark:bg-transparent"
      >
        <div className="flex flex-col overflow-y-auto px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <DrawerTitle className="text-center font-heading text-title font-extrabold leading-[1.1] text-ink">
            {t('whatIsAGuardian')}
          </DrawerTitle>

          <OnboardingHero className="mx-auto mt-stack-tight">
            <WhatIsGuardianHero />
          </OnboardingHero>

          <p className="mx-auto mt-stack max-w-lg text-center text-label leading-[1.5] text-ink-2">
            <Trans i18nKey="guardianInfoDescription" components={{ b: <span className="font-bold text-ink" /> }} />
          </p>

          <div className="mt-stack-loose h-1.5 w-full shrink-0 rounded-full bg-accent" />

          <div className="mt-stack flex flex-col">
            <InfoRow
              badge={
                <IconBadge className="bg-pos">
                  <Icon name={IconName.Checkmark} size="xs" fill="currentColor" className="text-paper" />
                </IconBadge>
              }
              title={t('guardianInfoWhatItDoesTitle')}
              description={t('guardianInfoWhatItDoesDescription')}
            />
            <InfoRow
              badge={
                <IconBadge className="bg-accent">
                  <span className="font-heading text-caption font-extrabold leading-none text-on-accent-sm">!</span>
                </IconBadge>
              }
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
              hasDivider={false}
            />
          </div>

          <div className="mt-stack-loose flex justify-center">
            <Button title={t('gotIt')} onClick={() => onOpenChange(false)} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GuardianInfoDrawer;
