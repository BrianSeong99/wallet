// ESLint config for `yarn lint:i18n` — all user-facing copy must come from
// the catalogue, never a literal in JSX.
//
// This is .js rather than .json ONLY so the quarantine list below can carry its
// rationale: ESLint rejects any unknown key in a JSON config, including a
// `_comment`, so there is nowhere in JSON to write down why 25 files are exempt.
//
// PRE-EXISTING DEBT, 87 violations across 25 files, quarantined 2026-07-27. The lint:i18n script was `eslint src` with no --ext, so ESLint 8 defaulted to .js and linted exactly three files, none of them components — this rule had never run on the app. Turning it on surfaced these all at once. They are hardcoded English in surfaces unrelated to the send flow, so they are listed here rather than fixed in that PR: the point of the script fix is that ALL NEW CODE is checked from now on. Burn this list down; never add to it.
module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  // Only the i18next RULE is enabled below. The other plugins are registered
  // purely so that inline `eslint-disable` comments in source — written for the
  // main config — resolve to a known rule here instead of erroring with
  // "Definition for rule ... was not found".
  "plugins": [
    "i18next",
    "@typescript-eslint",
    "import",
    "react-hooks",
    "jest"
  ],
  "rules": {
    "i18next/no-literal-string": [
      "error",
      {
        "mode": "jsx-only",
        "markupOnly": true,
        "jsx-components": {
          "include": [
            "*"
          ],
          "exclude": [
            "Trans",
            "T"
          ]
        },
        "jsx-attributes": {
          "include": [
            "title",
            "alt",
            "placeholder",
            "label",
            "aria-label",
            "aria-placeholder",
            "aria-valuetext"
          ],
          "exclude": []
        },
        "words": {
          "exclude": [
            "^[A-Z_]+$",
            "^[0-9.]+$",
            "^\\*+$",
            "^[a-z]{1,3}$",
            "^#[0-9a-fA-F]+$",
            "^[0-9]+px$",
            "^https?://",
            "^/[a-z]",
            "^\\.",
            "^bg-",
            "^text-",
            "^mb-",
            "^mt-",
            "^mx-",
            "^my-",
            "^p-",
            "^w-",
            "^h-",
            "^flex",
            "^opacity-",
            "^<[a-z]+>$",
            "^\\$",
            "^\u2022$",
            "^ALEO$",
            "^:$"
          ]
        },
        "callees": {
          "exclude": [
            "console\\..*",
            "classNames",
            "clsx",
            "navigate",
            "t",
            "i18n\\..*",
            "require",
            "import",
            "Error",
            ".*\\.getElementById",
            ".*\\.querySelector",
            ".*\\.classList\\..*",
            ".*\\.split",
            ".*\\.getData",
            ".*\\.join",
            ".*\\.includes",
            "JSON\\..*",
            "formatAmount",
            "register",
            "downloadData",
            "getMessage"
          ]
        }
      }
    ]
  },
  "overrides": [
    {
      "files": [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/lib/i18n/**"
      ],
      "rules": {
        "i18next/no-literal-string": "off"
      }
    },
    {
      "files": [
        "**/src/app/ConfirmPage.tsx",
        "**/src/app/confirm/AdvancedDetails.tsx",
        "**/src/app/confirm/TransactionAssetView.tsx",
        "**/src/app/pages/Browser/CapsuleBar.tsx",
        "**/src/app/pages/Browser/DappActionsSheet.tsx",
        "**/src/app/pages/Browser/DappActive.tsx",
        "**/src/app/pages/Browser/DappLauncher/DappTile.tsx",
        "**/src/app/pages/Browser/DappLauncher/RecentsRow.tsx",
        "**/src/app/pages/Browser/DappPeekCard.tsx",
        "**/src/app/pages/Browser/DappSwitcher.tsx",
        "**/src/app/pages/Earn.tsx",
        "**/src/app/pages/Receive/PendingTab.tsx",
        "**/src/app/pages/Settings.tsx",
        "**/src/app/pages/TokenDetail.tsx",
        "**/src/app/templates/history/HistoryDetails.tsx",
        "**/src/app/templates/history/HistoryItem.tsx",
        "**/src/components/explore/PriceChangeBadge.tsx",
        "**/src/lib/ui/DetailCard.tsx",
        "**/src/lib/ui/charts.tsx",
        "**/src/screens/earn-flow/EarnDepositAmount.tsx",
        "**/src/screens/earn-flow/EarnDepositReview.tsx",
        "**/src/screens/earn-flow/EarnPositionDetail.tsx",
        "**/src/screens/earn-flow/EarnPositions.tsx",
        "**/src/screens/earn-flow/EarnVaultDetail.tsx",
        "**/src/screens/earn-flow/components.tsx"
      ],
      "rules": {
        "i18next/no-literal-string": "off"
      }
    }
  ]
};
