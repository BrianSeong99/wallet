import React, { FC, useCallback, useEffect, useState } from 'react';

import classNames from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { Icon, IconName } from 'app/icons/v2';
import { ProgressIndicator } from 'components/ProgressIndicator';
import { iosPush, pushVariants } from 'lib/animation';
import { hapticLight } from 'lib/mobile/haptics';
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
  /**
   * Omitted on steps with nowhere to go back to, which is what hides the
   * chevron. Welcome never renders a header at all; Confirmation renders one
   * without a back affordance because the wallet already exists by then —
   * both match the design system, where 20 of the 23 `.obtop` rows carry a
   * back button and the three that don't are the Confirmation states.
   */
  onBack?: () => void;
  currentStep: number | null;
  totalSteps: number;
  onboardingType?: 'import' | 'create' | null;
}> = ({ onBack, currentStep, totalSteps }) => {
  const { t } = useTranslation();

  return (
    // The design system's `.obtop`: the step chrome row, gap 0.625rem, padded
    // 0.25rem above / 0.875rem below, inside the onboarding gutter (`px-6`,
    // same as `OnboardingScreen`) so the bar lines up with the content and the
    // action zone underneath it. Was `px-4 pt-4` with no bottom padding, which
    // both sat on a different gutter to the screens and dumped the whole gap
    // onto whatever the step rendered first.
    <div className="w-full flex items-center gap-2.5 px-6 pt-1 pb-3.5">
      {onBack && (
        // `.obtop .obback` — the back chevron shares the progress row, so it
        // costs no vertical space while still carrying a full 44pt tap target
        // (`size-11` = 2.75rem, the touch floor). The negative left margin is
        // the spec's exact -0.8125rem: it is between `-ml-3` (0.75rem) and
        // `-ml-3.5` (0.875rem) on the Tailwind scale, so it is written as an
        // arbitrary rem value rather than rounded to a step that would put the
        // glyph off the gutter line.
        <button
          type="button"
          aria-label={t('back')}
          onClick={() => {
            hapticLight();
            onBack();
          }}
          className={classNames(
            'size-11 -ml-[0.8125rem] flex-none',
            'flex items-center justify-center',
            'p-0 border-0 bg-transparent cursor-pointer',
            'text-ink rounded-full',
            'transition-colors active:bg-surface-2'
          )}
        >
          {/* The mock draws a text `‹`, whose ink measures 6.25 x 9.5px at its
              specified 1.25rem. A text glyph's optical alignment drifts with
              the font, so this uses the repo's own stroked chevron instead:
              at `xs` (1rem) its ink is 5.33 x 9.33px, effectively the same
              mark, and it inherits `text-ink` through `currentColor`. */}
          <Icon name={IconName.ChevronLeftLucide} size="xs" fill="none" aria-hidden />
        </button>
      )}
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
              // Welcome is the first step and renders no header at all, so it
              // is already back-less. Confirmation is the other step the design
              // system leaves without a chevron — the wallet has been created
              // by then, so there is nothing to go back to.
              onBack={step === OnboardingStep.Confirmation ? undefined : onBack}
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
            // Apple's iOS parallax push, per the design system, which chose it
            // over the four competing "push from right" specs the audit found.
            //
            // What was here travelled `1vw` — about 4px on a 402pt screen —
            // over 200ms, with both layers moving the same distance. At that
            // amplitude the transition is essentially invisible, which is why
            // it read as "no animation at all"; and with equal travel there is
            // no parallax, so the screens slid together like a carousel rather
            // than one arriving over the other.
            //
            // It was also `duration: 0` off-mobile, i.e. switched off entirely
            // in the extension and desktop. The design system specifies one
            // page transition for every target, so that condition is gone.
            transition={iosPush}
            variants={pushVariants({ direction: navigationDirection, reduceMotion })}
          >
            {/* Back now lives in `.obtop` as the design system draws it, so the
                bottom secondary "Back" button that used to stack a second
                ActionZone underneath the step's own one is gone. */}
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
