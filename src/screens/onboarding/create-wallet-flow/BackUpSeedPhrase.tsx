import React, { HTMLAttributes, useCallback, useEffect, useState } from 'react';

import classNames from 'clsx';
import { useTranslation } from 'react-i18next';

import { IconName } from 'app/icons/v2';
import { Button, ButtonVariant } from 'components/Button';
import { Chip } from 'components/Chip';
import { ActionZone } from 'components/ui/ActionZone';

import { OnboardingHeading, OnboardingSubcopy } from '../common/layout';

export interface BackUpSeedPhraseScreenProps extends HTMLAttributes<HTMLDivElement> {
  seedPhrase: string[];
  onSubmit?: () => void;
}

export const BackUpSeedPhraseScreen: React.FC<BackUpSeedPhraseScreenProps> = ({
  seedPhrase,
  className,
  onSubmit,
  ...props
}) => {
  const { t } = useTranslation();
  const [isWordsVisible, setIsWordsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const onCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(seedPhrase.join(' '));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [seedPhrase]);

  const onWordsVisibilityToggle = useCallback(() => {
    setIsWordsVisible(prev => !prev);
  }, []);

  useEffect(() => {
    document.addEventListener('copy', event => {
      const selectedText = window.getSelection()?.toString();
      const formattedText = selectedText?.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ');
      event.clipboardData?.setData('text/plain', formattedText || '');
      event.preventDefault(); // Prevent the default copy action
    });

    return () => {
      document.removeEventListener('copy', () => {});
    };
  }, []);

  return (
    <div className={classNames('flex flex-col flex-1', 'bg-app-bg gap-stack-loose px-6 pt-4', className)} {...props}>
      <div className="flex flex-col gap-stack-tight">
        <OnboardingHeading>{t('backUpYourWallet')}</OnboardingHeading>
        <OnboardingSubcopy>{t('backUpWalletInstructions')}</OnboardingSubcopy>
        <OnboardingSubcopy>{t('seedPhraseRecoveryCaption')}</OnboardingSubcopy>
      </div>

      <article className="grid grid-cols-3 gap-stack-tight w-full">
        {seedPhrase.map((word, index) => (
          <Chip
            key={`seed-word-${index}`}
            label={
              // --t-caption, matching the design system's `.seedw`: three columns
              // of 12 words inside a 24px gutter do not fit at the Chip's default
              // body size, and the index + word would collide on a small screen.
              // The size sits on the inner element so it cascades over the Chip's
              // own text size without depending on class order.
              <label
                className={classNames(
                  'flex flex-row items-baseline gap-1.5 w-full text-caption',
                  'transition duration-300 ease-in-out justify-between',
                  isWordsVisible ? 'blur-none' : 'blur-sm'
                )}
              >
                <p className="text-ink-2 select-none pointer-events-none">{`${index + 1}.`}</p>
                <p className="flex flex-1 justify-center">{`${word}`}</p>
              </label>
            }
          />
        ))}
      </article>

      {/* The "do not share" line is the one irreversible-loss warning on this
          screen, so it gets the system's notice treatment (`--neg` on
          `--neg-wash`) rather than sitting as a third grey paragraph above the
          words, where it read as fine print. Both tokens flip with the theme. */}
      <p className="w-full rounded-md-token bg-neg-wash px-3 py-2 text-caption font-semibold leading-[1.4] text-neg">
        {t('doNotShareWithAnywone')}
      </p>

      <div className="flex gap-stack-tight w-full">
        {/* Both are filled-secondary rather than one outlined and one bare:
            these sit side by side doing the same kind of job, and an outline on
            a tap target reads as structural separation. They also disagreed
            with each other, which is the drift in miniature.
            `h-11` is the 44pt touch floor -- these were `h-8` (32px), i.e. below
            it -- and no text size is passed, so the Button keeps its own. */}
        <Button
          className="h-11 w-1/2"
          variant={ButtonVariant.Secondary}
          title={t(isWordsVisible ? 'hide' : 'show')}
          iconLeft={isWordsVisible ? IconName.EyeOff : IconName.Eye}
          onClick={onWordsVisibilityToggle}
        />
        <Button
          className="h-11 w-1/2"
          variant={ButtonVariant.Secondary}
          title={t(isCopied ? 'copied' : 'copyToClipboard')}
          iconLeft={isCopied ? IconName.CheckboxCircleFill : IconName.FileCopy}
          onClick={onCopyToClipboard}
        />
      </div>

      <ActionZone>
        <Button title={t('continue')} onClick={onSubmit} />
      </ActionZone>
    </div>
  );
};
