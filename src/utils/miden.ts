export const isHexAddress = (address: string) => {
  return address.startsWith('0x');
};

/**
 * The bech32 HRPs, exported because they are the ONE place the set is written
 * down. `lib/qr/format.ts` used to keep a second copy and the two disagreed:
 * it tested `m1` for mainnet against this file's `mm1`, and carried no devnet
 * prefix at all. A valid mainnet QR was rejected outright, and on a
 * `yarn build:devnet` bundle EVERY devnet QR was rejected — invisible on
 * testnet, which is what the app is usually built for.
 */
export const MIDEN_MAINNET_PREFIX = 'mm1';
export const MIDEN_TESTNET_PREFIX = 'mtst1';
export const MIDEN_DEVNET_PREFIX = 'mdev1';
export const MIDEN_BECH32_PREFIXES = [MIDEN_MAINNET_PREFIX, MIDEN_TESTNET_PREFIX, MIDEN_DEVNET_PREFIX];

const isValidBech32Address = (address: string) => {
  return MIDEN_BECH32_PREFIXES.some(prefix => address.startsWith(prefix));
};

export const isValidMidenAddress = (address: string) => {
  return isValidBech32Address(address);
};
