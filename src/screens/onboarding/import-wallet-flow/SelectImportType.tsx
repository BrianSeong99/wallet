import React, { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { ReactComponent as ArrowRightIcon } from 'app/icons/arrow-right.svg';

import { OnboardingHeading, OnboardingScreen, OnboardingSubcopy } from '../common/layout';
import { ImportType } from '../types';

export interface SelectImportTypeScreenProps extends Omit<React.ButtonHTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  onSubmit?: (payload: ImportType) => void;
}

type ImportTypeOption = {
  id: ImportType;
  title: string;
  description: string;
  isLast?: boolean;
};

export const SelectImportTypeScreen = ({ onSubmit }: SelectImportTypeScreenProps) => {
  const { t } = useTranslation();

  const ImportTypeOptions: ImportTypeOption[] = useMemo(
    () => [
      {
        id: ImportType.SeedPhrase,
        title: t('importWithSeedPhrase'),
        description: t('importWithSeedPhraseDescription')
      },
      {
        id: ImportType.WalletFile,
        title: t('importWithEncryptedWalletFile'),
        description: t('importWithEncryptedWalletFileDescription'),
        isLast: true
      }
    ],
    [t]
  );

  // No ActionZone here on purpose: this screen has no bottom action. The two
  // option cards ARE the actions — tapping one advances the flow — so there is
  // nothing to pin. The screen previously carried its own bottom padding in two
  // disagreeing values (`pb-6` on the header, `pb-4` on the list); both are gone
  // in favour of the container-owned `gap-stack-*` rhythm.
  return (
    <OnboardingScreen testId="import-select-type">
      <div className="flex w-full flex-col gap-stack-loose py-stack-loose">
        <div className="flex flex-col gap-stack-tight">
          <OnboardingHeading>{t('chooseImportType')}</OnboardingHeading>
          <OnboardingSubcopy>{t('chooseImportTypeDescription')}</OnboardingSubcopy>
        </div>

        <div className="flex flex-col gap-stack-tight">
          {ImportTypeOptions.map(option => (
            <div
              key={option.id}
              className="flex w-full cursor-pointer flex-col rounded-md-token bg-surface-2 p-3 text-left transition-colors hover:bg-surface-3"
              onClick={() => onSubmit?.(option.id)}
            >
              <div className="flex flex-row items-center justify-between gap-2">
                <h2 className="font-heading text-body font-extrabold text-ink">{option.title}</h2>
                <ArrowRightIcon fill="currentColor" className="size-4 shrink-0 text-ink-3" />
              </div>
              <p className="mt-1 text-caption leading-[1.45] text-ink-2">{option.description}</p>
            </div>
          ))}
        </div>
      </div>
    </OnboardingScreen>
  );
};
