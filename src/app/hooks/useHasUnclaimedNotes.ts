import { useAccount } from 'lib/miden/front';
import { useClaimableNotes } from 'lib/miden/front/claimable-notes';

/**
 * Whether the account has any claimable (unclaimed) notes.
 * Drives the red-dot indicators on the Activity tab and the
 * pending-notes header button.
 */
export function useHasUnclaimedNotes(): boolean {
  return useUnclaimedNotesCount() > 0;
}

/**
 * How many claimable notes the account has. The Home prompt states the count
 * rather than just the fact — "2 notes waiting to be claimed" tells the user
 * whether this is one stray payment or a backlog, and the dot on the Activity
 * tab already covers the binary case.
 */
export function useUnclaimedNotesCount(): number {
  const account = useAccount();
  const { data: claimableNotes } = useClaimableNotes(account.publicKey);
  return claimableNotes?.length ?? 0;
}
