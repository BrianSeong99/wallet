import React, { useCallback, useMemo, useState } from 'react';

import classNames from 'clsx';
import { shuffle } from 'lodash';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from 'components/Button';
import { Chip } from 'components/Chip';
import { Toggle } from 'components/Toggle';
import { ActionZone } from 'components/ui/ActionZone';
import { hapticLight } from 'lib/mobile/haptics';

import { OnboardingHeading, OnboardingSubcopy } from '../common/layout';

export interface VerifySeedPhraseScreenProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
  seedPhrase: string[];
  useBiometric?: boolean;
  isHardwareSecurityAvailable?: boolean;
  showIntro?: boolean;
  onBiometricChange?: (value: boolean) => void;
  onSubmit?: () => void;
}

export const VerifySeedPhraseScreen: React.FC<VerifySeedPhraseScreenProps> = ({
  seedPhrase,
  useBiometric = true,
  isHardwareSecurityAvailable = false,
  showIntro = true,
  onBiometricChange,
  className,
  onSubmit,
  ...props
}) => {
  const { t } = useTranslation();
  const shuffledWords = useMemo(() => shuffle(seedPhrase), [seedPhrase]);
  const [firstSelectedWordIndex, setFirstSelectedWord] = useState<number | null>(null);
  const [secondSelectedWordIndex, setSecondSelectedWord] = useState<number | null>(null);

  const onSelectWord = useCallback(
    (index: number) => {
      hapticLight();
      // we select first word if index was not selected before
      if (firstSelectedWordIndex === null && index !== secondSelectedWordIndex) {
        setFirstSelectedWord(index);
        return;
      }
      // if word is already selected, we unselect it
      if (index === firstSelectedWordIndex) {
        setFirstSelectedWord(null);
        return;
      }
      // if first word is selected, we select second word
      if (index === secondSelectedWordIndex) {
        setSecondSelectedWord(null);
        return;
      }
      setSecondSelectedWord(index);
    },
    [firstSelectedWordIndex, secondSelectedWordIndex]
  );
  const isCorrectWordSelected = useMemo(() => {
    if (firstSelectedWordIndex === null || secondSelectedWordIndex === null) {
      return false;
    }
    return (
      shuffledWords[firstSelectedWordIndex] === seedPhrase[0] &&
      shuffledWords[secondSelectedWordIndex] === seedPhrase[11]
    );
  }, [seedPhrase, firstSelectedWordIndex, secondSelectedWordIndex, shuffledWords]);

  return (
    <div
      className={classNames('flex flex-col flex-1', 'bg-app-bg gap-stack-loose px-6 pt-4', className)}
      data-testid="verify-seed-phrase"
      {...props}
    >
      {showIntro && (
        <div className="flex flex-col gap-stack-tight">
          <OnboardingHeading className="text-left">{t('verifySeedPhrase')}</OnboardingHeading>
          <OnboardingSubcopy className="text-left">{t('verifyMessagePrefix')}</OnboardingSubcopy>
          <OnboardingSubcopy className="text-left">
            <Trans i18nKey="verifyMessageSuffix" components={{ b: <span className="font-bold" /> }} />
          </OnboardingSubcopy>
        </div>
      )}

      <article className="grid grid-cols-3 gap-stack-tight w-full">
        {shuffledWords.map((word, index) => (
          <div className="relative" key={`seed-word-${index}`}>
            {(!!firstSelectedWordIndex || firstSelectedWordIndex === 0) && index === firstSelectedWordIndex && (
              <div className="absolute -top-4 left-2 -translate-x-3 bg-accent text-on-accent-sm px-2 py-0.5 rounded-sm-token text-caption font-extrabold whitespace-nowrap">
                {t('first')}
              </div>
            )}
            {(!!secondSelectedWordIndex || secondSelectedWordIndex === 0) && index === secondSelectedWordIndex && (
              <div className="absolute -top-4 left-2 -translate-x-3 bg-accent text-on-accent-sm px-2 py-0.5 rounded-sm-token text-caption font-extrabold whitespace-nowrap">
                {t('last')}
              </div>
            )}
            <button onClick={() => onSelectWord(index)} className="w-full">
              <Chip
                className="w-full cursor-pointer"
                selected={firstSelectedWordIndex === index || secondSelectedWordIndex === index}
                label={word}
              />
            </button>
          </div>
        ))}
      </article>

      {isHardwareSecurityAvailable && (
        <div className="flex flex-col gap-stack w-full">
          <div className="flex flex-col gap-stack-tight">
            <h3 className="font-heading font-extrabold text-subhead text-ink">{t('unlockWallet')}</h3>
            <p className="text-label leading-[1.45] text-ink-2">{t('unlockWalletDescription')}</p>
          </div>
          <div className="flex items-center justify-between gap-stack">
            <p className="text-label text-ink-2 flex-1">{t('passwordsCanBeInsecure')}</p>
            <Toggle value={useBiometric} onChangeValue={onBiometricChange} />
          </div>
        </div>
      )}

      {/* The CTA moves into the shared zone so it lands at the same Y as every
          other onboarding step; the zone's `mt-auto` replaces the bare
          `flex-1` spacer this screen used to push the button down with. */}
      <ActionZone>
        <Button disabled={!isCorrectWordSelected} title={t('continue')} onClick={onSubmit} />
      </ActionZone>
    </div>
  );
};
