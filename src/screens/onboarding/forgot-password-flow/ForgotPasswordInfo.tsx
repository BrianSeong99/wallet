import React, { FC, useState } from 'react';

import classNames from 'clsx';
import { useTranslation } from 'react-i18next';

import { Button, ButtonVariant } from 'components/Button';
import { ActionZone } from 'components/ui/ActionZone';
import { hapticLight } from 'lib/mobile/haptics';

import { OnboardingHeading, OnboardingScreen, OnboardingSubcopy } from '../common/layout';

interface ForgotPasswordInfoScreenProps {
  onClose: () => void;
  onSignOut: () => void;
}

type AckId = 'erased' | 'data' | 'guardian' | 'phrase';

/**
 * Four affirmations, not three facts and a checkbox.
 *
 * The consequence rows used to be prose above a single Sign Out button —
 * a badge, two paragraphs and a CTA — which the user could skip in one thumb
 * movement. They are the gate now: each is a statement in the FIRST PERSON that
 * has to be true before the most destructive route in the product will run, and
 * the last one is the possession claim the shipped copy already demanded
 * rhetorically. Reading is optional; affirming is not.
 *
 * The close affordance in the header is gone with it. Cancel sits in the action
 * zone and does the same thing, and two dismissals on one screen is one more
 * escape than a destructive decision should offer. Hardware back still works.
 */
const ACKS: Array<{ id: AckId; titleKey: string; descKey: string }> = [
  { id: 'erased', titleKey: 'forgotAckErased', descKey: 'forgotAckErasedDesc' },
  { id: 'data', titleKey: 'forgotAckData', descKey: 'forgotAckDataDesc' },
  { id: 'guardian', titleKey: 'forgotAckGuardian', descKey: 'forgotAckGuardianDesc' },
  { id: 'phrase', titleKey: 'forgotAckPhrase', descKey: 'forgotAckPhraseDesc' }
];

const ForgotPasswordInfoScreen: FC<ForgotPasswordInfoScreenProps> = ({ onClose, onSignOut }) => {
  const { t } = useTranslation();
  const [acked, setAcked] = useState<Set<AckId>>(new Set());

  const toggle = (id: AckId) => {
    hapticLight();
    setAcked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allAcked = acked.size === ACKS.length;

  return (
    <OnboardingScreen testId="forgot-password-info">
      {/* Left-aligned, and with no header above them: this screen is a decision,
          not a step in a flow, so it carries no back bar and no progress dots. */}
      <OnboardingHeading className="text-left mt-0">{t('forgotPassword')}</OnboardingHeading>
      <OnboardingSubcopy className="text-left">{t('forgotPasswordDescription')}</OnboardingSubcopy>

      {/* `.notice` — the one sentence that decides whether the user should be on
          this screen at all, in the negative wash. `color-mix()` is unusable at
          our browserslist floor (Safari 14; it needs 16.4), so --neg-wash is a
          real token that flips with the theme. */}
      <div className="mt-2.5 flex gap-2 rounded-md-token bg-neg-wash px-3 py-2.25 text-caption font-semibold leading-[1.4] text-neg">
        <span aria-hidden>⚠</span>
        <span>{t('forgotPasswordSecondDescription')}</span>
      </div>

      {/* `.acklist`. The label lives INSIDE the list so it belongs to it by
          structure rather than by proximity — the first draft hung it outside
          and it ended up further from its own rows than the paragraphs above
          were from each other. */}
      <div className="mt-2 flex flex-col">
        <div className="mb-1.5 text-caption font-bold tracking-[0.02em] text-ink-2">{t('forgotAckConfirmAll')}</div>

        {ACKS.map(ack => {
          const on = acked.has(ack.id);
          return (
            // Rows are separated by a hairline rather than by margin, so the
            // ladder reads as ONE object with four rungs instead of four
            // unrelated fields. Each row is its own 44pt target.
            <label
              key={ack.id}
              className={classNames(
                'flex cursor-pointer items-start gap-2.75 py-2.5 min-h-11',
                '[&+label]:border-t [&+label]:border-rule'
              )}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggle(ack.id)}
                className="sr-only"
                data-testid={`ack-${ack.id}`}
              />
              {/* Circular BY DIRECTION, not by borrowing the radio affordance:
                  the convention is square for multi-select, but these are not
                  exclusive options and carry no group label implying a choice
                  between them. The mark is aligned to the first line. */}
              <span
                aria-hidden
                className={classNames(
                  'mt-px flex size-5.5 shrink-0 items-center justify-center rounded-full',
                  'text-label font-extrabold',
                  'transition-[background-color,transform] duration-[var(--dur-base)] motion-reduce:transition-none',
                  on ? 'scale-[1.06] bg-accent text-on-accent' : 'bg-surface-3'
                )}
              >
                {on ? '✓' : ''}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-heading text-label font-extrabold leading-[1.3] text-ink">{t(ack.titleKey)}</span>
                <span className="mt-0.5 text-caption leading-[1.4] text-ink-2">{t(ack.descKey)}</span>
              </span>
            </label>
          );
        })}
      </div>

      <ActionZone>
        {/* The reassurance sits HERE, not in the ladder. "Your funds are on the
            network" is true and worth saying, but it is not something to
            affirm — inside the ladder it would have let the user tick their way
            past the destruction notice while agreeing to good news. It sits
            directly above the buttons because that is where it is needed: it
            answers the question you ask yourself with your thumb over Sign
            Out. */}
        <p className="mb-1 text-left text-caption leading-[1.45] text-ink-2">{t('forgotFundsSafe')}</p>
        {/* `.zpair` — two peers at equal width. Sign Out is the destructive one
            and stays inert until all four rungs are true. */}
        <div className="flex gap-2.5">
          <Button title={t('cancel')} variant={ButtonVariant.Secondary} onClick={onClose} className="flex-1" />
          <Button
            title={t('signOut')}
            variant={ButtonVariant.Primary}
            disabled={!allAcked}
            onClick={onSignOut}
            className="flex-1"
          />
        </div>
      </ActionZone>
    </OnboardingScreen>
  );
};

export default ForgotPasswordInfoScreen;
