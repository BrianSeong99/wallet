import { iosPush, pushVariants } from './transitions';

/**
 * These lock the *invariants* of the push, not the literal numbers — the point
 * of the effect is the RELATIONSHIP between the two layers, and that is what
 * regressed twice: once when both layers travelled the same 1vw (no parallax,
 * and too small to see), and once when `AnimatePresence mode="wait"` meant the
 * layers never coexisted at all so there was nothing to be parallax between.
 */

const x = (v: unknown) => parseFloat(String(v).replace('%', ''));

describe('iosPush', () => {
  it('uses the design system duration and curve', () => {
    expect(iosPush.duration).toBe(0.54);
    expect(iosPush.ease).toEqual([0.32, 0.72, 0, 1]);
  });
});

describe('pushVariants — forward', () => {
  const v = pushVariants({ direction: 'forward' });

  it('brings the incoming screen from off-screen right to rest', () => {
    expect(x(v.initialState.x)).toBeGreaterThan(95);
    expect(x(v.animateState.x)).toBe(0);
  });

  it('moves the outgoing screen a FRACTION of the incoming distance — this is the parallax', () => {
    const incoming = Math.abs(x(v.initialState.x));
    const outgoing = Math.abs(x(v.exitState.x));

    expect(outgoing).toBeLessThan(incoming / 2);
    // Equal travel means no parallax at all: the two screens slide together
    // like a carousel instead of one arriving over the other.
    expect(outgoing).not.toBe(incoming);
  });

  it('sends the two layers in opposite directions', () => {
    expect(Math.sign(x(v.initialState.x))).toBe(-Math.sign(x(v.exitState.x)));
  });

  it('dims the outgoing layer so the incoming one reads as on top', () => {
    expect(v.exitState.opacity).toBeLessThan(1);
  });

  it('never travels a full 100%, which would show a seam at the join', () => {
    expect(Math.abs(x(v.initialState.x))).toBeLessThan(100);
  });
});

describe('pushVariants — backward', () => {
  const back = pushVariants({ direction: 'backward' });
  const fwd = pushVariants({ direction: 'forward' });

  it('is not simply the forward animation reversed', () => {
    // Going back UNCOVERS the previous screen, so the outgoing layer leaves at
    // full width and full opacity rather than being dimmed and held back.
    expect(Math.abs(x(back.exitState.x))).toBeGreaterThan(Math.abs(x(fwd.exitState.x)));
    expect(back.exitState.opacity).toBe(1);
  });

  it('mirrors the incoming direction', () => {
    expect(Math.sign(x(back.initialState.x))).toBe(-Math.sign(x(fwd.initialState.x)));
  });
});

describe('pushVariants — reduced motion', () => {
  const v = pushVariants({ direction: 'forward', reduceMotion: true });

  it('cross-fades with no travel', () => {
    for (const state of ['initialState', 'animateState', 'exitState'] as const) {
      expect(v[state]).not.toHaveProperty('x');
    }
    expect(v.initialState.opacity).toBe(0);
    expect(v.animateState.opacity).toBe(1);
    expect(v.exitState.opacity).toBe(0);
  });
});

describe('pushVariants — RTL', () => {
  it('mirrors the whole gesture', () => {
    const ltr = pushVariants({ direction: 'forward' });
    const rtl = pushVariants({ direction: 'forward', isRTL: true });

    expect(x(rtl.initialState.x)).toBe(-x(ltr.initialState.x));
    expect(x(rtl.exitState.x)).toBe(-x(ltr.exitState.x));
  });
});
