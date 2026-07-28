import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Icon, IconName } from 'app/icons/v2';
import { Button, ButtonVariant } from 'components/Button';
import { ScreenHeader } from 'components/ScreenHeader';
import { ActionZone } from 'components/ui/ActionZone';

import {
  OnboardingBody,
  OnboardingHeading,
  OnboardingHero,
  OnboardingScreen,
  OnboardingSubcopy
} from './common/layout';

interface ResetRequiredScreenProps {
  onConfirm: () => void;
}

/**
 * Dead-end screen: the stored account can no longer be read, so the only route
 * forward is a reset. Composed from the shared onboarding primitives rather
 * than the generic `Message` block, because `Message` fixes its own heading at
 * 24px — a size that is not on the type ramp — and its own icon box, which is
 * what let this screen render the logo at 218px against a 140px hero spec.
 */
const ResetRequiredScreen: FC<ResetRequiredScreenProps> = ({ onConfirm }) => {
  const { t } = useTranslation();

  return (
    <OnboardingScreen>
      <ScreenHeader align="center" showBorder={false} title={t('resetRequired')} />

      <OnboardingBody>
        <OnboardingHero>
          <Icon name={IconName.MidenLogo} size="3xl" />
        </OnboardingHero>

        {/* The rhythm belongs to this column, not to the three children —
            that is what keeps the block spaced the same as every other step. */}
        <div className="flex flex-col gap-stack-tight">
          <OnboardingHeading>{t('resetRequired')}</OnboardingHeading>
          <OnboardingSubcopy>{t('resetRequiredDescription')}</OnboardingSubcopy>
          <OnboardingSubcopy>{t('resetRequiredSecondDescription')}</OnboardingSubcopy>
        </div>
      </OnboardingBody>

      <ActionZone>
        <Button title={t('reset')} variant={ButtonVariant.Primary} onClick={onConfirm} />
      </ActionZone>
    </OnboardingScreen>
  );
};

export default ResetRequiredScreen;
