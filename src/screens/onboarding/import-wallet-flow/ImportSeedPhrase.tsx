import React, { useCallback, useMemo, useState } from 'react';

import { validateMnemonic } from 'bip39';
import { useTranslation } from 'react-i18next';

import { formatMnemonic } from 'app/defaults';
import { Button } from 'components/Button';
import { Input } from 'components/Input';
import { ActionZone } from 'components/ui/ActionZone';

import { OnboardingHeading, OnboardingScreen, OnboardingSubcopy } from '../common/layout';

const DELIMITERS = /[\s,;.\-:/\\_|]+/;
const PHRASE_LENGTH = 12;

export interface ImportSeedPhraseScreenProps {
  className?: string;
  wordslist: string[];
  isError?: boolean;
  onSubmit?: (seedPhrase: string) => void;
}

export const ImportSeedPhraseScreen: React.FC<ImportSeedPhraseScreenProps> = ({
  className,
  wordslist,
  isError: isErrorProp,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [seedPhrase, setSeedPhrase] = useState<string[]>(Array.from({ length: PHRASE_LENGTH }, () => ''));

  // Map seep phrase words to wordslist.
  // If a word is not in the wordslist, it's index is mapped to true,
  // otherwise, it's mapped to false
  const errorsMap = useMemo(() => {
    return seedPhrase.map(word => (word ? !wordslist.includes(word) : false));
  }, [seedPhrase, wordslist]);

  const isError = useMemo(() => errorsMap.some(error => error) || isErrorProp, [errorsMap, isErrorProp]);

  // All 12 words are present and belong to the wordlist.
  const allWordsKnown = useMemo(() => seedPhrase.every(word => wordslist.includes(word)), [seedPhrase, wordslist]);

  // A restore also requires a valid BIP-39 checksum. Without this, any 12 words
  // from the wordlist (e.g. a repeated word) would pass and silently derive an
  // unrelated wallet instead of restoring the user's existing one.
  const isChecksumValid = useMemo(() => validateMnemonic(formatMnemonic(seedPhrase.join(' '))), [seedPhrase]);

  const isValid = isChecksumValid && allWordsKnown;

  // Distinguish a per-word typo (word not in wordlist) from a checksum mismatch
  // (every word is known but the phrase is not a valid mnemonic).
  const isChecksumError = allWordsKnown && !isChecksumValid;

  const handleSubmit = useCallback(() => {
    if (onSubmit && isValid) {
      onSubmit(seedPhrase.join(' '));
    }
  }, [onSubmit, isValid, seedPhrase]);

  const onInputPaste: React.ClipboardEventHandler = useCallback(
    event => {
      event.preventDefault();
      const clipboardData = event.clipboardData.getData('text').trim();
      const words = clipboardData.split(DELIMITERS);
      setSeedPhrase(words);
    },
    [setSeedPhrase]
  );

  return (
    <OnboardingScreen className={className} testId="import-seed-phrase">
      <div className="flex w-full flex-col gap-stack-loose py-stack-loose">
        <div className="flex flex-col gap-stack-tight">
          <OnboardingHeading className="text-left">{t('importWallet')}</OnboardingHeading>
          <OnboardingSubcopy className="text-left">{t('enterYourWalletSeedPhrase')}</OnboardingSubcopy>
        </div>

        <div className="flex flex-col gap-stack-tight">
          <div className="grid grid-cols-3 gap-stack-tight">
            {Array.from({ length: PHRASE_LENGTH }).map((_, index) => (
              <Input
                id={`seed-phrase-input-${index}`}
                key={index}
                value={seedPhrase[index]}
                prefix={`${index + 1}.`}
                onPaste={onInputPaste}
                onChange={event => {
                  const newSeedPhrase = [...seedPhrase];
                  newSeedPhrase[index] = event.target.value;
                  setSeedPhrase(newSeedPhrase);
                }}
              />
            ))}
          </div>

          {/* The wordlist constraint is a standing condition of the field, not
              a failure, so it reads as a neutral notice under the grid rather
              than as a third line of centred subcopy competing with the title.
              Errors below it use --neg; this deliberately does not. */}
          <p className="rounded-md-token bg-surface-2 px-3 py-2 text-caption font-semibold leading-[1.4] text-ink-2">
            {t('onlyMidenSeedPhrasesAreSupported')}
          </p>

          {/* NOT FIXED HERE, deliberately: `importSeedPhraseError` does not
              exist in public/_locales/en/en.json, so this paragraph resolves to
              nothing and a mistyped word gives a dead Continue button with no
              explanation. The design system's copy for it ("Word 3 isn't in the
              Miden word list. Check the spelling.") needs a NEW key with a word
              -index placeholder, and inventing product copy is out of scope for
              a re-skin. Styled correctly so it lands right the moment the key
              lands. The sibling defect — `errorsMap` already knows WHICH word is
              wrong but is collapsed to one boolean, so no field is ringed —
              depends on the same copy decision. */}
          {isError && <p className="text-caption font-bold leading-[1.45] text-neg">{t('importSeedPhraseError')}</p>}
          {isChecksumError && (
            <p className="text-caption font-bold leading-[1.45] text-neg">{t('justValidPreGeneratedMnemonic')}</p>
          )}
        </div>
      </div>

      <ActionZone>
        <Button id={'submit-button'} title={t('continue')} onClick={handleSubmit} disabled={!isValid} />
      </ActionZone>
    </OnboardingScreen>
  );
};
