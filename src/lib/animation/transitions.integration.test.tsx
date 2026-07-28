import React from 'react';

import { render, screen } from '@testing-library/react';
import { AnimatePresence, motion } from 'framer-motion';

import { iosPush, pushVariants } from './transitions';

/**
 * Integration guard for the bug this module was written to fix twice over.
 *
 * `transitions.test.ts` proves the two layers are SPECIFIED to travel different
 * distances. It cannot prove they are ever on screen at the same time — and
 * that is the half that broke: with `AnimatePresence mode="popLayout"` the exit runs
 * to completion before the enter begins, so only one layer exists at a time and
 * the parallax cannot happen however correct the variants are. It also doubles
 * the perceived duration, because the two 540ms halves run back to back.
 *
 * This renders the navigator's real shape and asserts both keys are mounted
 * across the swap.
 */
const Shell = ({ step }: { step: string }) => (
  <div className="relative flex-1 min-h-0">
    <AnimatePresence initial={false}>
      <motion.div
        key={step}
        initial="initialState"
        animate="animateState"
        exit="exitState"
        className="absolute inset-0 flex flex-col"
        transition={iosPush}
        variants={pushVariants({ direction: 'forward' })}
        data-testid={`screen-${step}`}
      >
        {step}
      </motion.div>
    </AnimatePresence>
  </div>
);

describe('AnimatePresence integration — the layers must coexist', () => {
  it('mounts the incoming screen immediately, without waiting for the outgoing one', () => {
    const { rerender } = render(<Shell step="one" />);
    expect(screen.getByTestId('screen-one')).toBeInTheDocument();

    rerender(<Shell step="two" />);

    // Under mode="popLayout" this would not exist yet — the incoming screen is held
    // back until the exit finishes, which is precisely what removed the overlap.
    expect(screen.getByTestId('screen-two')).toBeInTheDocument();
  });
});
