import { isValidMidenAddress as isValidMidenAccountId } from 'utils/miden';

import { encodeAddress, decodeAddress, isValidMidenAddress } from './format';

describe('QR format utilities', () => {
  const testnetAddress = 'mtst1aplqzwh6s4gvcyzsvx726y6xvsgt5qv5qruqqypuyph';
  // bech32 is <hrp>1<data>, and Miden's mainnet HRP is `mm` — so a mainnet
  // address is `mm1…`. This fixture said `m1…`, i.e. HRP `m`, which is not a
  // Miden network at all; it existed only because format.ts carried its own
  // prefix list and tested for exactly that string.
  const mainnetAddress = 'mm1aplqzwh6s4gvcyzsvx726y6xvsgt5qv5qruqqypuyph';
  const devnetAddress = 'mdev1aplqzwh6s4gvcyzsvx726y6xvsgt5qv5qruqqypuyph';

  describe('encodeAddress', () => {
    it('adds miden: prefix to address', () => {
      expect(encodeAddress(testnetAddress)).toBe(`miden:${testnetAddress}`);
    });

    it('encodes mainnet address', () => {
      expect(encodeAddress(mainnetAddress)).toBe(`miden:${mainnetAddress}`);
    });

    it('handles empty string', () => {
      expect(encodeAddress('')).toBe('miden:');
    });
  });

  describe('decodeAddress', () => {
    it('strips miden: prefix', () => {
      expect(decodeAddress(`miden:${testnetAddress}`)).toBe(testnetAddress);
    });

    it('handles uppercase MIDEN: prefix', () => {
      expect(decodeAddress(`MIDEN:${testnetAddress}`)).toBe(testnetAddress);
    });

    it('handles mixed case Miden: prefix', () => {
      expect(decodeAddress(`Miden:${testnetAddress}`)).toBe(testnetAddress);
    });

    it('returns plain address unchanged', () => {
      expect(decodeAddress(testnetAddress)).toBe(testnetAddress);
    });

    it('trims whitespace', () => {
      expect(decodeAddress(`  ${testnetAddress}  `)).toBe(testnetAddress);
    });

    it('trims whitespace with prefix', () => {
      expect(decodeAddress(`  miden:${testnetAddress}  `)).toBe(testnetAddress);
    });
  });

  describe('isValidMidenAddress', () => {
    it('validates testnet address', () => {
      expect(isValidMidenAddress(testnetAddress)).toBe(true);
    });

    it('validates mainnet address', () => {
      expect(isValidMidenAddress(mainnetAddress)).toBe(true);
    });

    it('validates devnet address', () => {
      // `yarn build:devnet` is a shipped build, and this validator gates its
      // scanner: with no devnet prefix here, every devnet QR was rejected.
      expect(isValidMidenAddress(devnetAddress)).toBe(true);
    });

    it('agrees with the wallet-wide validator on every network', () => {
      // Two functions with the same name in two modules used to disagree.
      // They share one prefix list now; this is what stops them drifting again.
      [mainnetAddress, testnetAddress, devnetAddress].forEach(address => {
        expect(isValidMidenAddress(address)).toBe(isValidMidenAccountId(address));
      });
    });

    it('rejects empty string', () => {
      expect(isValidMidenAddress('')).toBe(false);
    });

    it('rejects null', () => {
      expect(isValidMidenAddress(null as unknown as string)).toBe(false);
    });

    it('rejects undefined', () => {
      expect(isValidMidenAddress(undefined as unknown as string)).toBe(false);
    });

    it('rejects non-string', () => {
      expect(isValidMidenAddress(123 as unknown as string)).toBe(false);
    });

    it('rejects address without valid prefix', () => {
      expect(isValidMidenAddress('eth1abc123def456')).toBe(false);
    });

    it('rejects address that is too short', () => {
      expect(isValidMidenAddress('mtst1abc')).toBe(false);
    });

    it('rejects address that is too long', () => {
      const longAddress = 'mtst1' + 'a'.repeat(100);
      expect(isValidMidenAddress(longAddress)).toBe(false);
    });

    it('trims whitespace before validating', () => {
      expect(isValidMidenAddress(`  ${testnetAddress}  `)).toBe(true);
    });

    it('validates address at minimum length boundary', () => {
      // 30 characters minimum
      const minAddress = 'mtst1' + 'a'.repeat(25);
      expect(isValidMidenAddress(minAddress)).toBe(true);
    });

    it('validates address at maximum length boundary', () => {
      // 100 characters maximum
      const maxAddress = 'mtst1' + 'a'.repeat(95);
      expect(isValidMidenAddress(maxAddress)).toBe(true);
    });
  });
});
