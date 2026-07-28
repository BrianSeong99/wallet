import React from 'react';

import { Trans, useTranslation } from 'react-i18next';

import Spinner from 'app/atoms/Spinner/Spinner';
import { ReactComponent as ConfirmationHero } from 'app/icons/onboarding/confirmation-illustrantion.svg';
import { Button, ButtonVariant } from 'components/Button';
import { ActionZone } from 'components/ui/ActionZone';

import { OnboardingBody, OnboardingHeading, OnboardingHero, OnboardingSubcopy } from './layout';

const MAX_BIOMETRIC_ATTEMPTS = 3;

export interface ConfirmationScreenProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  biometricAttempts?: number;
  biometricError?: string | null;
  /**
   * Side panel handoff (Chrome): the wallet is being created in the background
   * before the user opens it. While true, show a spinner instead of the
   * ready-state success message + button.
   */
  creating?: boolean;
  onSubmit?: () => void;
  onSwitchToPassword?: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  className,
  isLoading,
  biometricAttempts = 0,
  biometricError,
  creating = false,
  onSubmit,
  onSwitchToPassword,
  ...props
}) => {
  const { t } = useTranslation();

  const showPasswordFallback = biometricAttempts >= MAX_BIOMETRIC_ATTEMPTS;
  const hasError = !!biometricError && biometricAttempts > 0;

  // Side-panel handoff (Chrome): the wallet is still being created in the
  // background. Show a spinner rather than the ready-state success message,
  // otherwise the user sees "Your wallet is ready" before it actually is.
  if (creating) {
    return (
      // The wrapper used to carry `pt-11.5` above an `h-full` child, which made
      // the column 46px taller than the viewport and pushed the "centred"
      // spinner off centre. The zone here is one centred block, per `07a`.
      <div className="w-full h-full">
        <div
          {...props}
          className="flex flex-col items-center justify-center h-full gap-stack-loose bg-app-bg w-full px-6"
        >
          <Spinner />
          <p className="text-label text-ink-2">{t('creatingYourWallet')}</p>
        </div>
      </div>
    );
  }

  const primaryButtonTitle = hasError ? t('retry') : t('openWallet');

  return (
    <div {...props} className="bg-app-bg max-w-full h-full overflow-hidden" data-testid="onboarding-confirmation">
      <div className="min-h-full flex flex-col px-6">
        {/* The success illustration and headline stay even in the error state:
            the wallet genuinely was created and only the unlock method failed,
            so re-framing the screen as a failure would misreport what happened.
            The error is added to the block, not substituted for it. */}
        <OnboardingBody>
          <OnboardingHero>
            <ConfirmationHero />
          </OnboardingHero>
          <OnboardingHeading>
            {/* `--accent-ink`, not `--accent`: the brand orange is 2.90:1 on
                paper and fails SC 1.4.3 as body-weight display text. */}
            <Trans i18nKey="yourWalletIsReady" components={{ highlight: <span className="text-accent-ink" /> }} />
          </OnboardingHeading>
          <OnboardingSubcopy>{t('recoveryPhraseSevenDayReminder')}</OnboardingSubcopy>
          <OnboardingSubcopy>{t('recoveryPhraseDailyReminder')}</OnboardingSubcopy>

          {hasError && (
            <div className="flex flex-col items-center gap-stack-tight">
              <p className="text-caption font-bold leading-[1.45] text-neg text-center">{t('biometricFailed')}</p>
              {!showPasswordFallback && (
                <p className="text-caption leading-[1.45] text-ink-2 text-center">
                  {t('biometricAttemptsRemaining', { count: MAX_BIOMETRIC_ATTEMPTS - biometricAttempts })}
                </p>
              )}
            </div>
          )}
        </OnboardingBody>

        <ActionZone>
          {showPasswordFallback ? (
            <>
              {/* The escape hatch is primary and retry sits beneath it: a user
                  whose face or finger has just failed three times needs the way
                  out more than another attempt. */}
              <Button tabIndex={0} title={t('continueWithPassword')} onClick={onSwitchToPassword} />
              <Button
                tabIndex={0}
                title={t('tryBiometricAgain')}
                variant={ButtonVariant.Secondary}
                onClick={onSubmit}
                isLoading={isLoading}
              />
            </>
          ) : (
            <Button
              tabIndex={0}
              title={primaryButtonTitle}
              // No text-base override here: it would beat Button's text-cta and
              // put the label back below the size white-on-accent needs.
              onClick={onSubmit}
              isLoading={isLoading}
              data-testid="onboarding-confirmation-submit"
            />
          )}
        </ActionZone>
      </div>
    </div>
  );
};
