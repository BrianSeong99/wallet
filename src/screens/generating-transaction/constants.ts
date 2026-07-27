export const AUTO_CLOSE_DELAY_MS = 10_000;
export const SUCCESS_RECEIPT_DELAY_MS = 1_500;
export const TRANSACTION_LOOP_INTERVAL_MS = 10_000;
export const EXPLORER_TITLE = 'Midenscan';

// SVG paint / inline-style values, so they carry `var(--token)` strings rather
// than Tailwind classes. Both resolve to the same bytes they used to hardcode
// (#90BA89 / #E77537) in light and dark, so pointing them at the token layer
// moves no pixels — it just means the step indicators follow the tokens when
// --status-positive gets its fill-vs-ink split.
export const SUCCESS_GREEN = 'var(--status-positive)';
export const PROCESSING_ORANGE = 'var(--accent)';
// No Crust equivalent: the pending-step ring is the iOS system grey, and the
// nearest rule token (--rule-strong, rgba(63,63,63,.16)) is far lighter.
export const PENDING_STEP_COLOR = '#C7C7CC';

export const TRANSACTION_STEPS = [
  {
    id: 'guardian-approving',
    labelKey: 'transactionStepGuardianApproved',
    defaultLabel: 'Guardian approved'
  },
  {
    id: 'generating-proof',
    labelKey: 'transactionStepProofGenerated',
    defaultLabel: 'Proof generated'
  },
  {
    id: 'submitting',
    labelKey: 'transactionStepSubmitting',
    defaultLabel: 'Submitting'
  },
  {
    id: 'syncing-guardian',
    labelKey: 'transactionStepSyncingGuardian',
    defaultLabel: 'Syncing with Guardian'
  }
] as const;
