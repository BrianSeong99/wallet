import React from 'react';

import { useTranslation } from 'react-i18next';

import { ReactComponent as ProtectedIllustration } from 'app/icons/onboarding/protected-illustration.svg';
import { Button, ButtonVariant } from 'components/Button';
import { ActionZone } from 'components/ui/ActionZone';

import { OnboardingBody, OnboardingHeading, OnboardingHero, OnboardingScreen } from './layout';

export interface ChooseProtectionScreenProps {
  onSelectBiometric?: () => void;
  onSelectPasscode?: () => void;
}

/**
 * Step 1 of 4 and the first screen after Welcome, so it sets the shape every
 * other step copies: `.obmid` (illustration + headline, optically centred) over
 * the action zone.
 *
 * The illustration used to render at an inline `width: 278` against a 140px
 * spec — nearly double — which is what made the flow read as illustration-heavy
 * rather than calm, and made the headline fight the artwork for the eye.
 * `OnboardingHero` puts it back on `--hero-w`.
 */
export const ChooseProtectionScreen: React.FC<ChooseProtectionScreenProps> = ({
  onSelectBiometric,
  onSelectPasscode
}) => {
  const { t } = useTranslation();
  return (
    <OnboardingScreen testId="onboarding-choose-protection">
      <OnboardingBody className="gap-stack-loose">
        <OnboardingHero>
          <ProtectedIllustration />
        </OnboardingHero>
        <OnboardingHeading>{t('chooseHowToProtect')}</OnboardingHeading>
      </OnboardingBody>

      <ActionZone>
        <Button title={t('useFaceIdOrBiometric')} onClick={onSelectBiometric} />
        <Button title={t('setUpYourPasscode')} variant={ButtonVariant.Secondary} onClick={onSelectPasscode} />
      </ActionZone>
    </OnboardingScreen>
  );
};

export default ChooseProtectionScreen;
