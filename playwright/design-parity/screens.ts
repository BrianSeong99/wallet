/**
 * The screen map for the design-parity harness.
 *
 * Each entry pairs ONE screen in the Crust design system with the same screen in
 * the real extension build, so the two can be captured under identical conditions
 * and diffed.
 *
 * `designCaption` matches the `.scrcap` label in `design-system/index.html`
 * ("02 · Welcome"); matching is a case-insensitive substring so the numbering can
 * shift without breaking the map.
 *
 * `drive` runs against the extension page and must leave the app on the screen
 * being compared. Keep these to real user actions — clicking what a person would
 * click — so the harness exercises the shipped flow rather than a synthetic route.
 */
import type { Page } from '@playwright/test';

export interface ParityScreen {
  /** Stable id — used for output filenames. */
  id: string;
  /** Substring of the `.scrcap` caption in the design system. */
  designCaption: string;
  /** Human label for the report. */
  label: string;
  /**
   * Navigate the app to this screen. Receives a page already on the onboarding
   * entry point. Return `false` to skip (screen not reachable in this build).
   */
  drive: (page: Page) => Promise<boolean>;
}

/** Click a visible element by its text, returning false if it never appears. */
async function clickByText(page: Page, text: string, timeoutMs = 8000): Promise<boolean> {
  const target = page.getByText(text, { exact: false }).first();
  try {
    await target.waitFor({ state: 'visible', timeout: timeoutMs });
  } catch {
    return false;
  }
  await target.click();
  return true;
}

export const PARITY_SCREENS: ParityScreen[] = [
  {
    id: 'welcome',
    designCaption: 'Welcome',
    label: 'Onboarding · Welcome',
    // The entry screen — already there after load, so nothing to drive.
    drive: async page => {
      const heading = page.getByText('Welcome', { exact: false }).first();
      try {
        await heading.waitFor({ state: 'visible', timeout: 15000 });
        return true;
      } catch {
        return false;
      }
    }
  },
  {
    id: 'choose-protection',
    designCaption: 'Choose protection',
    label: 'Onboarding · Choose protection',
    drive: async page => {
      if (!(await clickByText(page, 'Get started', 15000))) return false;
      const heading = page.getByText('protect your wallet', { exact: false }).first();
      try {
        await heading.waitFor({ state: 'visible', timeout: 10000 });
        return true;
      } catch {
        return false;
      }
    }
  },
  {
    id: 'passcode-create',
    designCaption: 'Passcode create',
    label: 'Onboarding · Create passcode',
    drive: async page => {
      if (!(await clickByText(page, 'Get started', 15000))) return false;
      if (!(await clickByText(page, 'Set up your passcode', 10000))) return false;
      // The numpad is the tell that we landed on the passcode screen.
      try {
        await page.getByText('1', { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 });
        return true;
      } catch {
        return false;
      }
    }
  }
];
