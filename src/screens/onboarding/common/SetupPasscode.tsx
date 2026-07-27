import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Numpad } from 'components/Numpad';
import { cn } from 'lib/ui/util';

import { OnboardingHeading, OnboardingScreen } from './layout';

const PASSCODE_LENGTH = 6;

export type SetupPasscodePhase = 'enter' | 'confirm';

export interface SetupPasscodeScreenProps {
  onSubmit?: (code: string) => void;
  onPhaseChange?: (phase: SetupPasscodePhase) => void;
}

export const SetupPasscodeScreen: React.FC<SetupPasscodeScreenProps> = ({ onSubmit, onPhaseChange }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<SetupPasscodePhase>('enter');

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  const [enteredCode, setEnteredCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [mismatch, setMismatch] = useState(false);

  const activeCode = phase === 'enter' ? enteredCode : confirmCode;
  const setActiveCode = phase === 'enter' ? setEnteredCode : setConfirmCode;

  const handleDigit = useCallback(
    (digit: string) => {
      if (mismatch) setMismatch(false);
      setActiveCode(prev => (prev.length >= PASSCODE_LENGTH ? prev : prev + digit));
    },
    [setActiveCode, mismatch]
  );

  const handleDelete = useCallback(() => {
    if (mismatch) setMismatch(false);
    setActiveCode(prev => prev.slice(0, -1));
  }, [setActiveCode, mismatch]);

  useEffect(() => {
    if (phase === 'enter' && enteredCode.length === PASSCODE_LENGTH) {
      const timer = setTimeout(() => {
        setPhase('confirm');
        setConfirmCode('');
        setMismatch(false);
      }, 150);
      return () => clearTimeout(timer);
    }
    if (phase === 'confirm' && confirmCode.length === PASSCODE_LENGTH) {
      if (confirmCode !== enteredCode) {
        const timer = setTimeout(() => {
          setMismatch(true);
          setConfirmCode('');
        }, 150);
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => {
        onSubmit?.(confirmCode);
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [phase, enteredCode, confirmCode, onSubmit]);

  return (
    <OnboardingScreen testId="onboarding-setup-passcode">
      {/* Headline / helper / dots ride at the top and the pad is pinned to the
          bottom (`.pad.pinned`), so the keys stay under the thumb while the
          block above stays put between the enter and confirm phases. */}
      <div className="flex flex-col items-center w-full shrink-0 gap-stack pt-8">
        <OnboardingHeading>{phase === 'enter' ? t('setUpYourPasscode') : t('confirmYourPasscode')}</OnboardingHeading>

        {/* `.obp`, plus the design system's error variant: the same 13px centred
            line turns `--neg` at 700 rather than moving into a banner, so the
            message stays at the field it is about. */}
        <p className={cn('text-label leading-[1.45] text-center', mismatch ? 'font-bold text-neg' : 'text-ink-2')}>
          {mismatch
            ? t('passcodesDoNotMatch')
            : phase === 'enter'
              ? t('createA6DigitCode')
              : t('reEnterTheSame6Digits')}
        </p>

        {/* `.dots`: filled is `--accent`, empty is `--surface-3`. Both states
            used to be the same hardcoded grey — identical fill and border — so a
            filled dot was indistinguishable from an empty one by colour, and
            neither flipped in dark mode. The 1.12 scale on the filled dot keeps
            the distinction working without relying on hue (SC 1.4.1). */}
        <div className="flex items-center gap-stack pt-stack-tight">
          {Array.from({ length: PASSCODE_LENGTH }).map((_, index) => {
            const filled = index < activeCode.length;
            return (
              <div
                key={index}
                className={cn(
                  'size-3 rounded-full transition-transform duration-150',
                  filled ? 'bg-accent scale-110' : 'bg-surface-3'
                )}
              />
            );
          })}
        </div>
      </div>

      <div className="w-full mt-auto pb-4">
        <Numpad onDigit={handleDigit} onDelete={handleDelete} />
      </div>
    </OnboardingScreen>
  );
};

export default SetupPasscodeScreen;
