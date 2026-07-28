import colorsDefault, { getColorHex, isColorCode } from './colors';
import { ColorCode } from '../types/colors';

/*
 * `colors.ts` is backed by `tailwind-colors.js`, whose keys are:
 *   primary, grey, blue, yellow, green, red
 * (there is NO `gray` key — so `delete _colors.gray` inside `getRandomColor`
 * is a no-op and `grey` remains in the random pool).
 *
 * The default export IS the internal `_colors` object that every function
 * closes over, which lets us exercise the empty-pool fallback branch by
 * temporarily emptying it (always restored via try/finally).
 */

describe('getColorHex', () => {
  it('returns the hex for a valid color code', () => {
    expect(getColorHex('primary-500')).toBe('#E77537');
    expect(getColorHex('grey-500')).toBe('#818181');
    expect(getColorHex('blue-500')).toBe('#56A1F9');
    expect(getColorHex('green-500')).toBe('#2BA84A');
    expect(getColorHex('red-500')).toBe('#EF4444');
    expect(getColorHex('yellow-500')).toBe('#FEA644');
  });

  it('resolves non-500 shades too', () => {
    expect(getColorHex('primary-50')).toBe('#FFF3EC');
    expect(getColorHex('primary-600')).toBe('#C95A21');
    expect(getColorHex('grey-900')).toBe('#1C1C1C');
  });

  it('throws when the code has no dash', () => {
    expect(() => getColorHex('primary' as ColorCode)).toThrow('Color primary does not exist');
  });

  it('throws when the name part is empty (leading dash)', () => {
    // includes('-500', '-') === true, but split -> ['', '500'] so name is falsy
    expect(() => getColorHex('-500')).toThrow('Color -500 does not exist');
  });

  it('throws when the shade part is empty (trailing dash)', () => {
    // name truthy ('primary'), shade falsy ('') -> hits the !shade branch
    expect(() => getColorHex('primary-')).toThrow('Color primary- does not exist');
  });

  it('throws when the color name is unknown', () => {
    expect(() => getColorHex('purple-500')).toThrow('Color purple does not exist');
  });

  it('throws when the shade is unknown for a known color', () => {
    expect(() => getColorHex('primary-999')).toThrow('Shade 999 does not exist for color primary');
  });
});

describe('isColorCode', () => {
  it('returns true for valid color codes', () => {
    expect(isColorCode('primary-500')).toBe(true);
    expect(isColorCode('grey-25')).toBe(true);
    expect(isColorCode('red-700')).toBe(true);
  });

  it('returns false when the code has no dash', () => {
    expect(isColorCode('primary')).toBe(false);
    expect(isColorCode('')).toBe(false);
  });

  it('returns false when the name part is empty (leading dash)', () => {
    expect(isColorCode('-500')).toBe(false);
  });

  it('returns false when the shade part is empty (trailing dash)', () => {
    expect(isColorCode('primary-')).toBe(false);
  });

  it('returns false for an unknown color name', () => {
    expect(isColorCode('purple-500')).toBe(false);
  });

  it('returns false for an unknown shade of a known color', () => {
    expect(isColorCode('primary-999')).toBe(false);
  });
});

describe('default export', () => {
  it('exposes the full color palette', () => {
    expect(Object.keys(colorsDefault).sort()).toEqual(['blue', 'green', 'grey', 'primary', 'red', 'yellow'].sort());
    expect(colorsDefault.primary!['500']).toBe('#E77537');
  });
});
