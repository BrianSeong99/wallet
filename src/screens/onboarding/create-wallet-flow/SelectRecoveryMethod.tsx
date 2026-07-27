import React, { useMemo } from 'react';

import classNames from 'clsx';
import { useTranslation } from 'react-i18next';

import { Button } from 'components/Button';
import { ActionZone } from 'components/ui/ActionZone';
import { Badge } from 'lib/ui/badge';

import { OnboardingHeading, OnboardingSubcopy } from '../common/layout';
import { WalletType } from '../types';

export type RecoveryOption = {
  id: WalletType;
  title: string;
  description: string;
  isDefault?: boolean;
  isLast?: boolean;
};

export interface SelectRecoveryMethodScreenProps extends Omit<React.ButtonHTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  onSubmit?: (payload: WalletType) => void;
  options?: RecoveryOption[];
}

export const SelectRecoveryMethodScreen = ({
  onSubmit,
  options: optionsProp,
  ...props
}: SelectRecoveryMethodScreenProps) => {
  const { t } = useTranslation();
  const defaultOptions: RecoveryOption[] = useMemo(
    () => [
      {
        id: WalletType.Guardian,
        title: t('guardianRecovery'),
        description: t('guardianRecoveryDescription'),
        isDefault: true
      },
      {
        id: WalletType.OffChain,
        title: t('fullyPrivateRecovery'),
        description: t('fullyPrivateRecoveryDescription'),
        isLast: true
      }
    ],
    [t]
  );
  const options = optionsProp || defaultOptions;
  const [selected, setSelected] = React.useState<WalletType>(options.find(o => o.isDefault)?.id || options[0]!.id);

  const handleContinue = () => {
    onSubmit?.(selected);
  };

  return (
    <div className="flex-1 flex flex-col items-center bg-transparent pt-6 h-full px-6 gap-stack" {...props}>
      <div className="flex flex-col gap-stack-tight w-full">
        <OnboardingHeading>{t('chooseRecoveryMethod')}</OnboardingHeading>
        <OnboardingSubcopy>{t('chooseRecoveryMethodDescription')}</OnboardingSubcopy>
      </div>
      <div className="flex flex-col w-full">
        {options.map(option => (
          // Selection is an accent ring held off the card by a gap, not a
          // dimmed sibling: `opacity-50` on the UNSELECTED option pushed its
          // title and description below contrast minimums, and the option a
          // user has to read to make an irreversible choice is exactly the
          // wrong thing to fade. The ring's PRESENCE carries the state, so it
          // is not colour-only either (SC 1.4.1).
          <div
            key={option.id}
            className={classNames(
              'flex flex-col p-3 rounded-md-token cursor-pointer bg-surface-2',
              'outline-3 transition-[outline-color,outline-offset] duration-150 ease-hover',
              selected === option.id ? 'outline-accent outline-offset-3' : 'outline-transparent outline-offset-5',
              {
                'mb-stack-tight': !option.isLast,
                'mb-stack-loose': option.isLast
              }
            )}
            onClick={() => setSelected(option.id)}
          >
            <div className="flex flex-row justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-body text-ink">{option.title}</h2>
                {option.isDefault && <Badge variant="accent">{t('default')}</Badge>}
              </div>
            </div>
            <p className="text-caption leading-[1.45] text-ink-2 mt-1">{option.description}</p>
          </div>
        ))}
      </div>
      <ActionZone>
        <Button title={t('continue')} onClick={handleContinue} />
      </ActionZone>
    </div>
  );
};
