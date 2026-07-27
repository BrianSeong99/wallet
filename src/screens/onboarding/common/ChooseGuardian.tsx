import React, { useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
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
import { OnboardingScreen } from './layout';

export type { GuardianOption };

// Brand wordmark per guardian option id. Paths are hardcoded brand-grey
// (#484848); `[&_path]:fill-heading-gray` recolors them to the auto-flipping
// heading token so they stay legible in both themes.
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
        // `.obh` / `.obp`, left-aligned as on `06`. Hand-rolled rather than
        // `OnboardingHeading`, which bakes in `text-center` and composes with
        // clsx, so a `text-left` override would not reliably win.
        <div className="pt-8 shrink-0 flex flex-col gap-stack-tight">
          <h1 className="font-heading font-black text-title leading-[1.12] text-ink">
            {title ?? t('chooseYourGuardian')}
          </h1>
          <p className="text-label leading-[1.45] text-ink-2">{description ?? t('chooseGuardianDescription')}</p>
          <button
            type="button"
            onClick={() => {
              hapticLight();
              setIsInfoOpen(true);
            }}
            // `--accent-ink`, not `--accent`: the raw brand orange measures
            // 2.90:1 on paper and fails SC 1.4.3 at any text size.
            className="self-start text-caption font-bold text-accent-ink underline underline-offset-4"
          >
            {t('learnMoreAboutGuardian')}
          </button>
        </div>
      )}

      {/* Equal columns rather than two fixed 177px tracks, so the grid keeps its
          gutters on a 320px-wide popup instead of overflowing it. */}
      <div className="grid grid-cols-2 auto-rows-fr gap-stack-tight mt-stack-loose">
        {options.map(option => {
          const isSelected = selectedId === option.id;
          const isDefault = option.id === defaultId;
          const isCurrent = currentEndpoint != null && option.endpoint === currentEndpoint;
          const { Logo, paddingXClass } = GUARDIAN_LOGOS[option.id]!;
          return (
            <div key={option.id} className="flex flex-col">
              <button
                type="button"
                onClick={() => handleSelect(option.id)}
                className={cn(
                  'relative flex min-h-25 w-full flex-col overflow-hidden rounded-md-token bg-surface',
                  // The hairline is the CARD's edge — structural separation, not
                  // an outlined tap target. Selection is a ring held OFF the
                  // card by a gap, so it reads as the card lifting rather than
                  // as the border thickening from 2px to 4px.
                  'border border-rule-strong transition-all duration-150',
                  'outline-3 outline-offset-5',
                  isSelected ? 'outline-accent-ink outline-offset-3' : 'outline-transparent',
                  // The always-on outline would otherwise swallow the browser's
                  // default focus ring, so keyboard focus gets its own.
                  'focus-visible:ring-3 focus-visible:ring-accent/50'
                )}
              >
                {(isCurrent || isDefault) && (
                  <div
                    className={cn(
                      'flex h-5 w-full shrink-0 items-center justify-center',
                      // A small glyph on the accent fill needs `--on-accent-sm`
                      // (near-black); white on it is 2.9:1 and fails.
                      isCurrent ? 'bg-surface-3 text-ink' : 'bg-accent text-on-accent-sm'
                    )}
                  >
                    <span className="text-caption font-extrabold tracking-wide">
                      {isCurrent ? t('currentLabel') : t('default')}
                    </span>
                  </div>
                )}
                <div className="flex flex-1 items-center justify-center py-2">
                  <Logo className={clsx('[&_path]:fill-ink', paddingXClass)} />
                </div>
              </button>
              {/* 11px is the type floor; this row was 10px. */}
              <div className="mt-stack-tight px-1 text-center text-caption leading-[1.4] text-ink-2">
                <p>
                  {t('guardianOperatedBy')} <span className="font-bold">{option.operatedBy}</span>
                </p>
                <div className="w-18.75 mx-auto bg-rule h-px" />
                <p className="mt-0.5">
                  {t('guardianLocation')} <span className="font-bold">{option.location}</span>
                </p>
              </div>
            </div>
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
