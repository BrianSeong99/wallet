import React, { FC, useCallback, useEffect, useState } from 'react';

import classNames from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { Button, ButtonVariant } from 'components/Button';
import { ProgressIndicator } from 'components/ProgressIndicator';
import { ActionZone } from 'components/ui/ActionZone';
import { isMobile } from 'lib/platform';
import type { WalletAccount } from 'lib/shared/types';

import { ChooseGuardianScreen } from './common/ChooseGuardian';
import { ChooseProtectionScreen } from './common/ChooseProtection';
import { ConfirmationScreen } from './common/Confirmation';
import { CreatePasswordScreen } from './common/CreatePassword';
import { SetupBiometricScreen } from './common/SetupBiometric';
import { SetupPasscodeScreen } from './common/SetupPasscode';
import { WelcomeScreen } from './common/Welcome';
import { BackUpSeedPhraseScreen } from './create-wallet-flow/BackUpSeedPhrase';
import { SelectRecoveryMethodScreen } from './create-wallet-flow/SelectRecoveryMethod';
import { SelectTransactionTypeScreen } from './create-wallet-flow/SelectTransactionType';
import { VerifySeedPhraseScreen } from './create-wallet-flow/VerifySeedPhrase';
import { ImportRecoveryMethodScreen } from './import-wallet-flow/ImportRecoveryMethod';
import { ImportSeedPhraseScreen } from './import-wallet-flow/ImportSeedPhrase';
import { ImportWalletFileScreen } from './import-wallet-flow/ImportWalletFile';
import { SelectImportTypeScreen } from './import-wallet-flow/SelectImportType';
import { ImportType, OnboardingAction, OnboardingStep, OnboardingType, WalletType } from './types';

export interface OnboardingFlowProps {
  wordslist: string[];
  seedPhrase: string[] | null;
  onboardingType: OnboardingType | null;
  step: OnboardingStep;
  password?: string | null;
  isLoading?: boolean;
  useBiometric?: boolean;
  isHardwareSecurityAvailable?: boolean;
  biometricAttempts?: number;
  biometricError?: string | null;
  guardianLookupError?: boolean;
  /** Side panel handoff (Chrome): wallet is being created in the background. */
  confirmCreating?: boolean;
  onBiometricChange?: (value: boolean) => void;
  onAction?: (action: OnboardingAction) => void;
}

const STEP_TO_PROGRESS: Partial<Record<OnboardingStep, number>> = {
  [OnboardingStep.ChooseProtection]: 1,
  [OnboardingStep.SetupPasscode]: 2,
  [OnboardingStep.SetupBiometric]: 2,
  [OnboardingStep.ChooseGuardian]: 3,
  [OnboardingStep.SelectImportType]: 1,
  [OnboardingStep.ImportFromSeed]: 2,
  [OnboardingStep.ImportFromFile]: 2,
  [OnboardingStep.BackupSeedPhrase]: 1,
  [OnboardingStep.VerifySeedPhrase]: 2,
  [OnboardingStep.CreatePassword]: 3,
  [OnboardingStep.SelectRecoveryMethod]: 4,
  [OnboardingStep.ImportSelectRecoveryMethod]: 4,
  [OnboardingStep.Confirmation]: 4
};

const Header: React.FC<{
  onBack: () => void;
  currentStep: number | null;
  totalSteps: number;
  onboardingType?: 'import' | 'create' | null;
}> = ({ currentStep, totalSteps }) => {
  return (
    // The design system's `.obtop`: the step chrome row, gap 0.625rem, padded
    // 0.25rem above / 0.875rem below, inside the onboarding gutter (`px-6`,
    // same as `OnboardingScreen`) so the bar lines up with the content and the
    // action zone underneath it. Was `px-4 pt-4` with no bottom padding, which
    // both sat on a different gutter to the screens and dumped the whole gap
    // onto whatever the step rendered first.
    <div className="w-full flex items-center gap-2.5 px-6 pt-1 pb-3.5">
      <div className="flex-1 flex justify-center">
        <ProgressIndicator
          currentStep={currentStep ?? 1}
          steps={totalSteps}
          className={currentStep ? '' : 'opacity-0'}
        />
      </div>
    </div>
  );
};

export const OnboardingFlow: FC<OnboardingFlowProps> = ({
  wordslist,
  seedPhrase,
  onboardingType,
  step,
  isLoading,
  useBiometric = true,
  isHardwareSecurityAvailable = false,
  biometricAttempts = 0,
  biometricError = null,
  guardianLookupError = false,
  confirmCreating = false,
  onBiometricChange,
  onAction
}) => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward'>('forward');

  // Override for screens that have internal sub-steps (e.g. SetupPasscode's
  // enter → confirm phase). Reset whenever the top-level step changes so the
  // bump doesn't leak across navigation.
  const [progressOverride, setProgressOverride] = useState<number | null>(null);
  useEffect(() => {
    setProgressOverride(null);
  }, [step]);
  // The choose-protection step only exists where biometric can work (mobile).
  // On the extension/desktop it's skipped, so the create flow is one step
  // shorter — render 3 segments and shift every position down by one.
  const protectionChoiceSkipped = onboardingType === OnboardingType.Create && !isMobile();
  // In that shortened create flow the password screen replaces passcode setup,
  // so it sits at the protection-step position rather than its import-flow one.
  const baseStep =
    step === OnboardingStep.CreatePassword && protectionChoiceSkipped
      ? (STEP_TO_PROGRESS[OnboardingStep.SetupPasscode] ?? null)
      : (STEP_TO_PROGRESS[step] ?? null);
  const rawProgress = progressOverride ?? baseStep;
  const totalSteps = protectionChoiceSkipped ? 3 : 4;
  const currentProgress = protectionChoiceSkipped && rawProgress !== null ? rawProgress - 1 : rawProgress;

  const onForwardAction = useCallback(
    (onboardingAction: OnboardingAction) => {
      setNavigationDirection('forward');
      onAction?.(onboardingAction);
    },
    [onAction]
  );

  const renderStep = useCallback(() => {
    const onWelcomeAction = (action: 'select-wallet-type' | 'select-import-type') => {
      switch (action) {
        case 'select-wallet-type':
          onForwardAction?.({
            id: 'choose-protection'
          });
          break;
        case 'select-import-type':
          onForwardAction?.({
            id: 'select-import-type'
          });
          break;
        default:
          break;
      }
    };

    const onSelectImportTypeSubmit = (payload: ImportType) => {
      switch (payload) {
        case ImportType.SeedPhrase:
          onForwardAction?.({
            id: 'import-from-seed'
          });
          break;
        case ImportType.WalletFile:
          onForwardAction?.({
            id: 'import-from-file'
          });
          break;
        default:
          break;
      }
    };

    const onBackupSeedPhraseSubmit = () =>
      onForwardAction?.({
        id: 'verify-seed-phrase'
      });

    const onVerifySeedPhraseSubmit = () =>
      onForwardAction?.({
        id: 'create-password',
        payload: WalletType.OnChain
      });

    const onCreatePasswordSubmit = (password: string) =>
      onForwardAction?.({ id: 'create-password-submit', payload: { password, enableBiometric: false } });

    const onSelectRecoveryMethodSubmit = (walletType: WalletType) =>
      onForwardAction?.({ id: 'select-recovery-method', payload: walletType });

    const onSelectTransactionTypeSubmit = () =>
      onForwardAction?.({ id: 'select-transaction-type', payload: 'private' });

    const onConfirmSubmit = () => onForwardAction?.({ id: 'confirmation' });

    const onSwitchToPassword = () => onForwardAction?.({ id: 'switch-to-password' });

    const onImportSeedPhraseSubmit = (seedPhrase: string) =>
      onForwardAction?.({ id: 'import-seed-phrase-submit', payload: seedPhrase });

    const onImportFileSubmit = (seedPhrase: string, walletAccounts: WalletAccount[]) => {
      onForwardAction?.({ id: 'import-wallet-file-submit', payload: seedPhrase, walletAccounts });
    };

    const onSelectBiometric = () => onForwardAction?.({ id: 'setup-biometric' });
    const onSelectPasscode = () => onForwardAction?.({ id: 'setup-passcode' });
    const onSetupPasscodeSubmit = (code: string) => onForwardAction?.({ id: 'setup-passcode-submit', payload: code });
    const onSetupBiometricSubmit = () => onForwardAction?.({ id: 'setup-biometric-submit' });
    const onBiometricSwitchToPasscode = () => onForwardAction?.({ id: 'setup-passcode' });
    const onChooseGuardianSubmit = (payload: { guardianId: string; guardianEndpoint: string }) =>
      onForwardAction?.({ id: 'choose-guardian-submit', payload });

    switch (step) {
      case OnboardingStep.Welcome:
        return <WelcomeScreen onSubmit={onWelcomeAction} />;
      case OnboardingStep.ChooseProtection:
        return <ChooseProtectionScreen onSelectBiometric={onSelectBiometric} onSelectPasscode={onSelectPasscode} />;
      case OnboardingStep.SetupPasscode:
        return (
          <SetupPasscodeScreen
            onSubmit={onSetupPasscodeSubmit}
            onPhaseChange={phase => setProgressOverride(phase === 'enter' ? 2 : 3)}
          />
        );
      case OnboardingStep.SetupBiometric:
        return (
          <SetupBiometricScreen onContinue={onSetupBiometricSubmit} onSwitchToPasscode={onBiometricSwitchToPasscode} />
        );
      case OnboardingStep.ChooseGuardian:
        return <ChooseGuardianScreen onSubmit={onChooseGuardianSubmit} />;
      case OnboardingStep.BackupSeedPhrase:
        return <BackUpSeedPhraseScreen seedPhrase={seedPhrase || []} onSubmit={onBackupSeedPhraseSubmit} />;
      case OnboardingStep.VerifySeedPhrase:
        return (
          <VerifySeedPhraseScreen
            seedPhrase={seedPhrase || []}
            useBiometric={useBiometric}
            isHardwareSecurityAvailable={isHardwareSecurityAvailable}
            onBiometricChange={onBiometricChange}
            onSubmit={onVerifySeedPhraseSubmit}
          />
        );
      case OnboardingStep.SelectImportType:
        return <SelectImportTypeScreen onSubmit={onSelectImportTypeSubmit} />;
      case OnboardingStep.ImportFromSeed:
        return <ImportSeedPhraseScreen wordslist={wordslist} onSubmit={onImportSeedPhraseSubmit} />;
      case OnboardingStep.ImportFromFile:
        return <ImportWalletFileScreen onSubmit={onImportFileSubmit} />;
      case OnboardingStep.CreatePassword:
        return <CreatePasswordScreen onSubmit={onCreatePasswordSubmit} />;
      case OnboardingStep.SelectRecoveryMethod:
        return <SelectRecoveryMethodScreen onSubmit={onSelectRecoveryMethodSubmit} />;
      case OnboardingStep.ImportSelectRecoveryMethod:
        return (
          <ImportRecoveryMethodScreen
            isError={guardianLookupError}
            onSubmit={payload => onForwardAction?.({ id: 'import-select-recovery-method', payload })}
          />
        );
      case OnboardingStep.SelectTransactionType:
        return <SelectTransactionTypeScreen onSubmit={onSelectTransactionTypeSubmit} />;
      case OnboardingStep.Confirmation:
        return (
          <ConfirmationScreen
            isLoading={isLoading}
            biometricAttempts={biometricAttempts}
            biometricError={biometricError}
            creating={confirmCreating}
            onSubmit={onConfirmSubmit}
            onSwitchToPassword={onSwitchToPassword}
          />
        );

      default:
        return <></>;
    }
  }, [
    step,
    isLoading,
    onForwardAction,
    seedPhrase,
    wordslist,
    useBiometric,
    isHardwareSecurityAvailable,
    onBiometricChange,
    biometricAttempts,
    biometricError,
    guardianLookupError,
    confirmCreating
  ]);

  const onBack = () => {
    setNavigationDirection('backward');
    onAction?.({ id: 'back' });
  };

  return (
    // `max-w-105` is 26.25rem — the same 420px the inline `maxWidth` used to
    // hardcode, but on the rem scale, so the shell grows with the user's text
    // size instead of clipping the content it frames.
    <div
      data-onboarding-root="true"
      className={classNames('flex flex-col', 'bg-app-bg', 'overflow-hidden', 'w-full h-full mx-auto max-w-105')}
    >
      <div className="flex flex-col flex-1 min-h-0">
        <AnimatePresence mode={'wait'} initial={false}>
          {step !== OnboardingStep.Welcome && (
            <Header
              onBack={onBack}
              currentStep={currentProgress}
              totalSteps={totalSteps}
              onboardingType={onboardingType}
              key={'header'}
            />
          )}
        </AnimatePresence>
        <AnimatePresence mode={'wait'} initial={false}>
          <motion.div
            className="flex flex-col flex-1 min-h-0"
            key={step}
            initial="initialState"
            animate="animateState"
            exit="exitState"
            transition={{
              type: 'tween',
              // Only animate on mobile (disable for Chrome extension)
              duration: isMobile() ? 0.2 : 0
            }}
            variants={{
              initialState: {
                x: reduceMotion ? 0 : navigationDirection === 'forward' ? '1vw' : '-1vw',
                opacity: 0
              },
              animateState: {
                x: 0,
                opacity: 1
              },
              exitState: {
                x: reduceMotion ? 0 : navigationDirection === 'forward' ? '-1vw' : '1vw',
                opacity: 0
              }
            }}
          >
            {renderStep()}
            {step !== OnboardingStep.Welcome &&
              step !== OnboardingStep.ChooseProtection &&
              step !== OnboardingStep.SetupPasscode &&
              step !== OnboardingStep.SetupBiometric &&
              step !== OnboardingStep.ChooseGuardian &&
              step !== OnboardingStep.Confirmation && (
                // The shell's own bottom action, so it gets the shared zone
                // geometry (16 above / 16 below, centred) rather than the
                // hand-rolled `pt-2 pb-4` it had — that was the only bottom
                // action in onboarding still setting its own padding, and it
                // sat 8px higher than every other one. `px-6` matches the
                // onboarding gutter so it aligns with the step's own zone
                // directly above it. Button is already `w-full`, so the
                // explicit `w-full` was redundant.
                // `pt-0` because this zone stacks directly under the step's own
                // one. Each zone pads 16 above and below, so leaving both tops
                // in put 32px between Continue and Back where the system's
                // primary-to-secondary gap is 12. Zeroing the top of the LOWER
                // zone leaves the upper zone's 16px bottom as the single gap.
                //
                // This is a mitigation, not the shape the system draws: the
                // mocks put back as the `‹` chevron in `.obtop`, and `Header`
                // here already accepts an `onBack` it drops on the floor. Moving
                // it there would also add a back affordance to four steps that
                // currently have none, which is a navigation change rather than
                // a restyle — so it needs a decision, not a refactor.
                <ActionZone className="px-6 pt-0">
                  <Button title={t('back')} variant={ButtonVariant.Secondary} onClick={onBack} />
                </ActionZone>
              )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
