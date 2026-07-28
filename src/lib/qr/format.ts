import { MIDEN_BECH32_PREFIXES } from 'utils/miden';

/**
 * QR code payload format utilities for Miden addresses.
 *
 * Format: miden:<address>
 * Example: miden:mtst1aplqzwh6s4gvcyzsvx726y6xvsgt5qv5qruqqypuyph
 *
 * Follows BIP21/EIP-681 industry convention for URI schemes.
 */

const MIDEN_URI_PREFIX = 'miden:';

/**
 * Encodes a Miden address into a QR code payload.
 * @param address The raw Miden address (e.g., "mtst1aplqzwh6s4gvcyzsvx726y6xvsgt5qv5qruqqypuyph")
 * @returns The encoded URI (e.g., "miden:mtst1aplqzwh6s4gvcyzsvx726y6xvsgt5qv5qruqqypuyph")
 */
export function encodeAddress(address: string): string {
  return `${MIDEN_URI_PREFIX}${address}`;
}

/**
 * Decodes a QR code payload to extract the Miden address.
 * Accepts both:
 * - Full URI format: "miden:mtst1..."
 * - Plain address: "mtst1..."
 *
 * @param payload The scanned QR code content
 * @returns The extracted address
 */
export function decodeAddress(payload: string): string {
  const trimmed = payload.trim();

  // If it has the miden: prefix, strip it
  if (trimmed.toLowerCase().startsWith(MIDEN_URI_PREFIX)) {
    return trimmed.slice(MIDEN_URI_PREFIX.length);
  }

  // Otherwise return as-is (plain address)
  return trimmed;
}

/**
 * Validates if a string is a valid Miden address.
 *
 * The prefix set comes from `utils/miden` rather than being restated here.
 * This function used to carry its own copy and the two disagreed on every
 * network but testnet: `m1` here against `mm1` there, and no devnet prefix at
 * all. Since this is the validator the QR scanner runs, a correct mainnet code
 * was rejected as invalid, and a devnet build rejected every code it could
 * possibly be shown.
 *
 * @param address The address to validate
 * @returns true if the address appears to be a valid Miden address
 */
export function isValidMidenAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  const trimmed = address.trim();

  if (!MIDEN_BECH32_PREFIXES.some(prefix => trimmed.startsWith(prefix))) {
    return false;
  }

  // Miden addresses are bech32 encoded and should have a reasonable length
  // Typical length is around 40-60 characters
  return trimmed.length >= 30 && trimmed.length <= 100;
}
