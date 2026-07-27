import React, { useMemo, useState } from 'react';

import classNames from 'clsx';
import { useTranslation } from 'react-i18next';

import { Icon, IconName } from 'app/icons/v2';
import { Button } from 'components/Button';
import { Input } from 'components/Input';
import { ActionZone } from 'components/ui/ActionZone';
import { DEFAULT_NETWORK, GUARDIAN_OPTIONS, getGuardianOptionsForNetwork } from 'lib/miden-chain/constants';
import { isValidGuardianUrl, sanitizeGuardianUrl } from 'lib/settings/helpers';
import { Badge } from 'lib/ui/badge';
import { cn } from 'lib/ui/util';

import { OnboardingHeading, OnboardingScreen, OnboardingSubcopy } from '../common/layout';
import { WalletType } from '../types';

export interface ImportRecoveryMethodScreenProps {
  isError?: boolean;
  onSubmit: (payload: { walletType: WalletType; guardianEndpoint?: string }) => void;
}

export const ImportRecoveryMethodScreen: React.FC<ImportRecoveryMethodScreenProps> = ({ isError, onSubmit }) => {
  const { t } = useTranslation();

  const [selected, setSelected] = useState<WalletType>(WalletType.Guardian);
  const [endpointInput, setEndpointInput] = useState<string>(GUARDIAN_OPTIONS[0]!.endpoint.get(DEFAULT_NETWORK)!);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [dirty, setDirty] = useState(false);

  const showError = Boolean(isError) && !dirty && selected === WalletType.Guardian;

  const sanitizedEndpoint = sanitizeGuardianUrl(endpointInput);
  const canContinue =
    selected === WalletType.OnChain || (selected === WalletType.Guardian && isValidGuardianUrl(sanitizedEndpoint));

  const handleContinue = () => {
    if (selected === WalletType.OnChain) {
      onSubmit({ walletType: WalletType.OnChain });
      return;
    }
    onSubmit({ walletType: WalletType.Guardian, guardianEndpoint: sanitizedEndpoint });
  };

  const handleSelectGuardian = () => {
    setSelected(WalletType.Guardian);
    setDirty(true);
  };

  const handleSelectOnChain = () => {
    setSelected(WalletType.OnChain);
    setDirty(true);
    setIsCustomizing(false);
  };

  const handleToggleCustom = () => {
    setIsCustomizing(prev => !prev);
    setDirty(true);
  };

  const handleSelectPreset = (endpoint: string) => {
    setEndpointInput(endpoint);
    setIsCustomizing(false);
    setDirty(true);
  };

  // Guardian providers that run on the active network, resolved to their
  // endpoint on it.
  const guardianPresets = useMemo(() => getGuardianOptionsForNetwork(), []);

  const options = useMemo(
    () => [
      {
        id: WalletType.Guardian,
        title: t('importViaGuardian'),
        description: t('importViaGuardianDescription'),
        isDefault: true,
        onSelect: handleSelectGuardian
      },
      {
        id: WalletType.OnChain,
        title: t('importPublicAccount'),
        description: t('importPublicAccountDescription'),
        onSelect: handleSelectOnChain
      }
    ],
    [t]
  );

  return (
    <OnboardingScreen testId="import-recovery-method">
      <div className="flex w-full flex-col gap-stack-loose py-stack-loose">
        <div className="flex flex-col gap-stack-tight">
          <OnboardingHeading>{t('importRecoveryMethodTitle')}</OnboardingHeading>
          <OnboardingSubcopy>{t('chooseRecoveryMethodDescription')}</OnboardingSubcopy>
        </div>

        <div className="flex w-full flex-col gap-stack-tight">
          {options.map(option => {
            const isSelected = selected === option.id;
            const isGuardian = option.id === WalletType.Guardian;
            return (
              // Selection is a 3px --accent-ink outline with an offset, not a
              // border and not a dimmed sibling. The old treatment dropped
              // unselected cards to `opacity-50`, which pushed their body copy
              // under the contrast floor to communicate something the ring
              // already says. The ring is also the design system's own
              // `.ropt.sel` mechanism, shared with the guardian cards.
              <div
                key={option.id}
                className={classNames(
                  'flex cursor-pointer flex-col rounded-md-token bg-surface-2 p-3 text-left',
                  'outline outline-3 outline-offset-2 transition-colors',
                  isSelected ? 'outline-accent-ink' : 'outline-transparent hover:bg-surface-3'
                )}
                onClick={option.onSelect}
              >
                <div className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-body font-extrabold text-ink">{option.title}</h2>
                    {option.isDefault && (
                      // The `accent` variant IS the design system's `.rbadge`
                      // (accent fill + --on-accent-sm). This was hand-painting
                      // `bg-primary-500 text-white` over the `default` variant,
                      // which is 2.9:1 and fails at badge size — the fill/ink
                      // pairs exist precisely so that combination can't be built
                      // at a call site.
                      <Badge variant="accent">{t('default')}</Badge>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-caption leading-[1.45] text-ink-2">{option.description}</p>

                {isGuardian && isSelected && (
                  <div className="mt-stack flex flex-col gap-stack-tight" onClick={e => e.stopPropagation()}>
                    <div className="grid grid-cols-3 gap-stack-tight">
                      {guardianPresets.map(provider => {
                        const isActive = !isCustomizing && sanitizedEndpoint === provider.endpoint;
                        return (
                          // Filled chip + selection ring, never an outlined tap
                          // target. `border-2 border-grey-200` was a bordered
                          // control in a system that reserves borders for
                          // structural separation.
                          <button
                            key={provider.id}
                            type="button"
                            onClick={() => handleSelectPreset(provider.endpoint)}
                            className={cn(
                              'flex flex-col items-start rounded-sm-token bg-surface-3 p-2 text-left',
                              'outline outline-2 outline-offset-2 transition-colors',
                              isActive ? 'outline-accent-ink' : 'outline-transparent'
                            )}
                          >
                            <span className="text-caption font-bold leading-tight text-ink">{provider.name}</span>
                            {/* 10px was below the system's 11px caption floor
                                (Apple's minimum), so this snaps UP to
                                --t-caption rather than staying sub-legible. */}
                            <span className="mt-0.5 text-caption leading-tight text-ink-2">{provider.location}</span>
                          </button>
                        );
                      })}
                    </div>
                    {!isCustomizing && (
                      <div className="flex flex-col gap-1">
                        <span className="text-caption text-ink-2">{t('guardianEndpoint')}</span>
                        <span className="break-all font-inter text-label text-ink">{endpointInput}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleToggleCustom}
                      className="flex items-center gap-1 self-start text-label font-bold text-accent-ink"
                    >
                      <span>{t('useDifferentGuardian')}</span>
                      <Icon name={isCustomizing ? IconName.ChevronUp : IconName.ChevronDown} size="sm" />
                    </button>
                    {isCustomizing && (
                      <Input
                        id="guardian-endpoint-input"
                        value={endpointInput}
                        placeholder={GUARDIAN_OPTIONS[0]!.endpoint.get(DEFAULT_NETWORK)}
                        onChange={event => {
                          setEndpointInput(event.target.value);
                          setDirty(true);
                        }}
                      />
                    )}
                    {showError && (
                      <p className="mt-1 text-caption font-bold leading-[1.45] text-neg">
                        {t('guardianAccountNotFound')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ActionZone>
        <Button title={t('continue')} onClick={handleContinue} disabled={!canContinue} />
      </ActionZone>
    </OnboardingScreen>
  );
};
