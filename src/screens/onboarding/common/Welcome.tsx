import React from 'react';

import { useTranslation } from 'react-i18next';

import { ReactComponent as BreadLogo } from 'app/icons/brand/new-bread.svg';
import { Icon, IconName } from 'app/icons/v2';
import { Button } from 'components/Button';
import { ActionZone, GhostAction } from 'components/ui/ActionZone';
import { hapticLight } from 'lib/mobile/haptics';

import { OnboardingBody, OnboardingHero, OnboardingScreen } from './layout';

export interface WelcomeScreenProps extends Omit<React.ButtonHTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  onSubmit?: (action: Actions) => void;
}

export type Actions = 'select-wallet-type' | 'select-import-type';

/**
 * Welcome is the ONE onboarding screen that is not a step, and it is typed
 * accordingly. The design system gives it its own block (`.mwel`) rather than
 * folding it into `.obh`/`.obp`: the wordmark is `--t-display` (72) at weight
 * 700 with `line-height:.99`, and the subcopy is the bigger 20px/500 welcome
 * copy in `--ink` — not the 13px `--ink-2` supporting line every step uses.
 * Using `OnboardingHeading`/`OnboardingSubcopy` here would flatten the brand
 * moment into a step, which is exactly what the separate block exists to stop.
 */
export const WelcomeScreen = ({ onSubmit }: WelcomeScreenProps) => {
  const { t } = useTranslation();
  return (
    <OnboardingScreen testId="onboarding-welcome">
      {/* `.mwel .mid` — centred column, 2rem of air top and bottom, and 1rem
          between logo, wordmark and copy (the `stack-loose` step). */}
      <OnboardingBody className="gap-stack-loose py-8">
        <OnboardingHero>
          <BreadLogo />
        </OnboardingHero>
        <h1 className="font-heading font-bold text-display-xl leading-[0.99] tracking-tight text-center text-ink">
          <span className="block">{t('welcome')}</span>
          <span className="block">
            {t('toLowercase')} {t('midenWallet')}
          </span>
        </h1>
        <p className="text-xl font-medium leading-[1.3] text-center text-ink">{t('breadWalletDescription')}</p>
      </OnboardingBody>
      <ActionZone>
        <Button tabIndex={0} title={t('getStarted')} onClick={() => onSubmit?.('select-wallet-type')} />
        <GhostAction
          id="import-link"
          title={t('recoverYourAccount')}
          iconRight={<Icon name={IconName.ChevronRight} size="xs" className="p-0.5" />}
          onClick={() => {
            hapticLight();
            onSubmit?.('select-import-type');
          }}
        />
      </ActionZone>
    </OnboardingScreen>
  );
};
