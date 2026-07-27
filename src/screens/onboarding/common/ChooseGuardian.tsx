import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { ReactComponent as GatewayLogo } from 'app/icons/guardian-operator-logs/gateway.svg';
import { ReactComponent as LambdaClassLogo } from 'app/icons/guardian-operator-logs/lambdaclass.svg';
import { ReactComponent as OpenZeppelinLogo } from 'app/icons/guardian-operator-logs/open-zeppelin.svg';
import { Button } from 'components/Button';
import { Input } from 'components/Input';
import { ActionZone } from 'components/ui/ActionZone';
import { getGuardianOptionsForNetwork } from 'lib/miden-chain/constants';
import { hapticLight } from 'lib/mobile/haptics';
import { isValidGuardianUrl, sanitizeGuardianUrl } from 'lib/settings/helpers';
import type { GuardianOption } from 'lib/shared/types';
import { cn } from 'lib/ui/util';

import { GuardianInfoDrawer } from './GuardianInfoDrawer';
import { OnboardingHeading, OnboardingScreen, OnboardingSubcopy } from './layout';

export type { GuardianOption };

// Brand wordmark per guardian option id. The marks are third-party trademarks
// shipped at a fixed #484848 and are deliberately NOT recoloured: altering a
// partner's mark is a usage problem, not a design choice. #484848 measures
// 9.15:1 on the light card but only 1.72:1 on the dark one, so dark mode puts
// each mark on a white plate (see `.glogo` below) instead of repainting it.
// `paddingXClass` is per-mark optical padding — the wordmarks have very
// different aspect ratios and would otherwise touch the plate's edges.
const GUARDIAN_LOGOS: Record<string, { Logo: ImportedSVGComponent; paddingXClass: string }> = {
  'open-zeppelin': { Logo: OpenZeppelinLogo, paddingXClass: 'px-4' },
  gateway: { Logo: GatewayLogo, paddingXClass: 'px-3' },
  'lambda-class': { Logo: LambdaClassLogo, paddingXClass: 'px-5' }
};

export interface ChooseGuardianScreenProps {
  onSubmit?: (payload: { guardianId: string; guardianEndpoint: string }) => void;
  // Highlight (and default-skip) the option matching this endpoint — used by
  // GuardianSettings to mark the user's currently-active guardian.
  currentEndpoint?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  // When true, hide the page-level header (title/description/learn-more) so the
  // host screen can supply its own framing.
  hideHeader?: boolean;
  // When true, show a "custom Guardian URL" field below the provider grid.
  allowCustomEndpoint?: boolean;
}

export const ChooseGuardianScreen: React.FC<ChooseGuardianScreenProps> = ({
  onSubmit,
  currentEndpoint,
  title,
  description,
  submitLabel,
  hideHeader = false,
  allowCustomEndpoint = false
}) => {
  const { t } = useTranslation();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  // Providers that run a Guardian on the active network, resolved to their
  // endpoint on it.
  const options = useMemo(() => getGuardianOptionsForNetwork(), []);

  // In the switch context (GuardianSettings passes `currentEndpoint`) pre-select
  // the CURRENT operator, so the user has to deliberately pick a different one to
  // switch — never nudge them onto another operator by default. In the create
  // flow (no `currentEndpoint`) default to the first provider.
  const defaultId = useMemo(() => {
    if (currentEndpoint) {
      const current = options.find(o => o.endpoint === currentEndpoint);
      if (current) return current.id;
    }
    return options[0]?.id ?? '';
  }, [currentEndpoint, options]);

  const [selectedId, setSelectedId] = useState<string>(defaultId);
  // Until the user makes an explicit choice, keep the selection in sync with
  // `defaultId` so a `currentEndpoint` that resolves after mount (async store
  // hydration) still updates the highlighted card.
  const userSelectedRef = useRef(false);
  useEffect(() => {
    if (!userSelectedRef.current) setSelectedId(defaultId);
  }, [defaultId]);

  const handleSelect = (id: string) => {
    hapticLight();
    userSelectedRef.current = true;
    setSelectedId(id);
    setIsCustom(false);
  };

  const handleContinue = () => {
    if (isCustom) {
      const sanitized = sanitizeGuardianUrl(customUrl);
      if (!isValidGuardianUrl(sanitized)) {
        setCustomError(t('invalidUrl'));
        return;
      }
      setCustomError(null);
      onSubmit?.({ guardianId: 'custom', guardianEndpoint: sanitized });
      return;
    }
    const selected = options.find(o => o.id === selectedId) ?? options[0];
    if (!selected) return;
    onSubmit?.({ guardianId: selected.id, guardianEndpoint: selected.endpoint });
  };

  return (
    <OnboardingScreen testId="onboarding-choose-guardian">
      {!hideHeader && (
        // `.obh` / `.obp`, LEFT-aligned as screen `06` draws them. Both compose
        // through `cn` (twMerge), so the `text-left` override beats the
        // components' own `text-center` default instead of merely tying with it.
        // `pt-4` is `.obh`'s own `margin-top:1rem`; the step chrome row
        // (`.obtop`) above is the navigator's and carries its own padding.
        <div className="shrink-0 flex flex-col gap-stack-tight pt-4">
          <OnboardingHeading className="text-left">{title ?? t('chooseYourGuardian')}</OnboardingHeading>
          <OnboardingSubcopy className="text-left">{description ?? t('chooseGuardianDescription')}</OnboardingSubcopy>
          <button
            type="button"
            onClick={() => {
              hapticLight();
              setIsInfoOpen(true);
            }}
            // `--accent-ink`, not `--accent`: the raw brand orange measures
            // 2.90:1 on paper and fails SC 1.4.3 at any text size. It flips to
            // the brand hue in dark, where the same orange clears on #191919.
            // No underline — the mock draws this as weight-700 accent text.
            className="self-start text-caption font-bold text-accent-ink"
          >
            {t('learnMoreAboutGuardian')}
          </button>
        </div>
      )}

      {/* `.gguard`. Equal fractional columns rather than two fixed 177px tracks,
          so the grid keeps its gutters on a 320px-wide popup instead of
          overflowing it, and `auto-rows-fr` equalises rows whatever the option
          count is — the provider list is data (3 on this network, 4 in the
          mock), so the grid must not assume a count. */}
      <div className="mt-stack grid shrink-0 grid-cols-2 auto-rows-fr gap-[0.5625rem]">
        {options.map(option => {
          const isSelected = selectedId === option.id;
          const isDefault = option.id === defaultId;
          const isCurrent = currentEndpoint != null && option.endpoint === currentEndpoint;
          const { Logo, paddingXClass } = GUARDIAN_LOGOS[option.id]!;
          return (
            // `.gcard` — the WHOLE card is the tap target, meta included, so the
            // hit area matches the thing the user is choosing.
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              aria-pressed={isSelected}
              className={cn(
                'relative flex min-h-[6.3125rem] w-full flex-col overflow-hidden rounded-md-token bg-surface text-center',
                // `pt-5` reserves the band's height on EVERY card, badged or
                // not, which is what keeps all cards the same box.
                'pt-5',
                // The hairline is the CARD's edge — structural separation, not
                // an outlined tap target — so it is a 1.5px shadow rim rather
                // than a border that would shift layout when it changed.
                'shadow-[0_0_0_0.09375rem_var(--rule-strong)]',
                // Selection is a ring held OFF the card by a gap, so it reads
                // as the card lifting rather than as its border thickening.
                // `--accent-ink`, not `--accent`: the raw brand orange is
                // 2.90:1 on paper and would fail SC 1.4.11 as a ring.
                'outline-3 outline-offset-5 outline-transparent',
                'transition-[outline-color,outline-offset] duration-150 motion-reduce:transition-none',
                isSelected && 'outline-accent-ink outline-offset-3',
                // The always-on outline would otherwise swallow the browser's
                // default focus ring, so keyboard focus gets its own.
                'focus-visible:ring-3 focus-visible:ring-accent/50'
              )}
            >
              {(isCurrent || isDefault) && (
                // `.band` — absolutely positioned into the reserved `pt-5`.
                <span
                  className={cn(
                    'absolute inset-x-0 top-0 flex h-5 items-center justify-center',
                    'text-caption font-extrabold tracking-[0.02em]',
                    // A small glyph on the accent fill needs `--on-accent-sm`
                    // (near-black); white on it is 2.9:1 and fails.
                    isCurrent ? 'bg-surface-3 text-ink' : 'bg-accent text-on-accent-sm'
                  )}
                >
                  {isCurrent ? t('currentLabel') : t('default')}
                </span>
              )}
              {/* `.glogo` — flex:1 so wordmarks of different intrinsic heights
                  still centre in the same well. In dark mode the well becomes a
                  white plate: the marks are fixed #484848 and fall to 1.72:1 on
                  the dark card, well under the 3:1 a meaningful graphic needs.
                  `pure-white`, not `white` — `bg-white` is an auto-flipping
                  token here and would turn the plate dark again. */}
              <div
                className={cn(
                  'flex flex-1 items-center justify-center gap-[0.3125rem] px-2.5 py-1.5 min-h-[2.375rem]',
                  'dark:mx-2.5 dark:my-1.5 dark:min-h-[1.875rem] dark:rounded-sm-token dark:bg-pure-white dark:px-2',
                  '[&>svg]:max-h-6 [&>svg]:w-auto [&>svg]:max-w-full'
                )}
              >
                <Logo className={paddingXClass} />
              </div>
              {/* `.gmeta` — 11px is the type floor; this row was 10px. */}
              <div className="px-1 pb-[0.4375rem] text-caption leading-[1.4] text-ink-2">
                <p>
                  {t('guardianOperatedBy')} <span className="font-bold">{option.operatedBy}</span>
                </p>
                <p>
                  {t('guardianLocation')} <span className="font-bold">{option.location}</span>
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {allowCustomEndpoint && (
        <div className="mt-stack-loose flex flex-col gap-stack-tight shrink-0">
          <button
            type="button"
            onClick={() => {
              hapticLight();
              setIsCustom(prev => !prev);
              setCustomError(null);
            }}
            className="self-start text-caption font-bold text-accent-ink"
          >
            {t('useCustomGuardianUrl')}
          </button>
          {isCustom && (
            <>
              <Input
                id="custom-guardian-endpoint"
                value={customUrl}
                placeholder="https://"
                onChange={event => {
                  setCustomUrl(event.target.value);
                  if (customError) setCustomError(null);
                }}
              />
              {customError && <p className="text-caption font-bold text-neg">{customError}</p>}
            </>
          )}
        </div>
      )}

      <ActionZone>
        <Button title={submitLabel ?? t('continue')} onClick={handleContinue} />
      </ActionZone>

      <GuardianInfoDrawer open={isInfoOpen} onOpenChange={setIsInfoOpen} />
    </OnboardingScreen>
  );
};

export default ChooseGuardianScreen;
