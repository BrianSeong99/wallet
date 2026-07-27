import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Icon, IconName } from 'app/icons/v2';
import { Button, ButtonVariant } from 'components/Button';
import { ScreenHeader } from 'components/ScreenHeader';
import { ActionZone } from 'components/ui/ActionZone';

import { OnboardingBody, OnboardingHeading, OnboardingScreen, OnboardingSubcopy } from '../common/layout';

interface ForgotPasswordInfoScreenProps {
  onClose: () => void;
  onSignOut: () => void;
}

/**
 * The most destructive route in the product: signing out clears client storage
 * and the only way back is a 12-word seed phrase. The design system draws it
 * with the lock badged in `--warn` and the "do not sign out unless…" sentence
 * promoted to `--ink` at weight 700, because that sentence is what decides
 * whether the user should be on this screen at all — as ordinary body text it
 * read as a footnote to the explanation above it. Copy is unchanged; only its
 * weight and colour are.
 */
const ForgotPasswordInfoScreen: FC<ForgotPasswordInfoScreenProps> = ({ onClose, onSignOut }) => {
  const { t } = useTranslation();

  return (
    <OnboardingScreen>
      <ScreenHeader
        align="center"
        showBorder={false}
        title={t('forgotPassword')}
        closeLabel={t('close')}
        onClose={onClose}
      />

      <OnboardingBody>
        {/* `.eic` — the status badge, 3.125rem, wash behind the glyph. Both
            halves are tokens, so it flips with the theme: in dark mode
            --warn-wash is a deep amber and --warn is the bright one. */}
        <div className="flex h-12.5 w-12.5 shrink-0 items-center justify-center rounded-full bg-warn-wash text-warn">
          <Icon name={IconName.Lock} size="md" fill="currentColor" />
        </div>

        {/* The rhythm belongs to this column, not to the three children. */}
        <div className="flex flex-col gap-stack-tight">
          <OnboardingHeading>{t('forgotPassword')}</OnboardingHeading>
          <OnboardingSubcopy>{t('forgotPasswordDescription')}</OnboardingSubcopy>
          {/* Subcopy type, promoted to `--ink` at 700. Deliberately NOT
              `<OnboardingSubcopy className="text-ink">`: the primitive bakes in
              `text-ink-2`, and Tailwind emits `.text-ink` BEFORE `.text-ink-2`,
              so the override loses on source order no matter how the class
              attribute is written. */}
          <p className="text-label font-bold leading-[1.45] text-center text-ink">
            {t('forgotPasswordSecondDescription')}
          </p>
        </div>
      </OnboardingBody>

      <ActionZone>
        <Button title={t('signOut')} variant={ButtonVariant.Primary} onClick={onSignOut} />
      </ActionZone>
    </OnboardingScreen>
  );
};

export default ForgotPasswordInfoScreen;
