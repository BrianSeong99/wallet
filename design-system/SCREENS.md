# Screen index

Every screen in `index.html`, grouped by the flow it belongs to, in page order.

**Generated — do not hand-edit.** Regenerate with `node design-system/screens.mjs` after any
change to `index.html`. Serve the site with `python3 -m http.server 4599 --directory design-system`
and find a screen by searching its caption.

Total: **178 screens** across **14 flows**. The *Specifies* column lists the
shipped source each screen's rationale cites, so this reads in both directions: what a screen
documents, and which screens document a given file.

| Flow | Screens |
|---|--:|
| Welcome | 2 |
| Home / Wallet overview | 2 |
| Send → Review → Sign — where the Tier-2 evidence lands | 3 |
| Onboarding | 30 |
| Home & overview | 14 |
| Send flow | 30 |
| Receive flow | 13 |
| Swap flow | 6 |
| Activity flow | 13 |
| Earn flow gated off | 3 |
| Settings & browser | 19 |
| Security & recovery | 22 |
| dApp browser | 11 |
| Global states | 10 |

---

## Welcome

<sub>section `#screens` · 2 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 1 | Current· live build | shipped | — |
| 2 | Proposed· Crust | shipped | — |

## Home / Wallet overview

<sub>section `#screens` · 2 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 3 | Current· live build (fresh wallet) | shipped | — |
| 4 | Proposed· Crust | shipped | — |

## Send → Review → Sign — where the Tier-2 evidence lands

<sub>section `#screens` · 3 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 5 | 1 · Amount | shipped | — |
| 6 | 2 · Review | shipped | — |
| 7 | 3 · Signing | shipped | — |

## Onboarding

<sub>section `#allscreens` · 30 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 8 | 01 · Splash | shipped | — |
| 9 | 02 · Welcome | shipped | — |
| 10 | 03 · Choose protection | shipped — 1/4 | — |
| 11 | 04 · Passcode create | shipped — 2/4 | — |
| 12 | 05 · Passcode confirm | shipped — 2/4 | — |
| 13 | 05e · Passcode mismatch | bug / proposed — error | — |
| 14 | 04a · Face ID scan | shipped — 2/4 | — |
| 15 | 04b · Face ID success | shipped — 2/4 | — |
| 16 | 04a → 04b · Transition | shipped — live | — |
| 17 | 06 · Choose your Guardian | shipped — 3/4 | — |
| 18 | 06a · What is a Guardian? | gap / sheet — info sheet | — |
| 19 | 06b · Create password | shipped — shipped | — |
| 20 | 06b′ · Password strength — low | shipped — shipped | — |
| 21 | 06c · Set up account recovery | shipped — shipped | — |
| 22 | 07a · Creating wallet | bug / proposed — loading | — |
| 23 | 07b · Wallet ready | shipped — 4/4 | — |
| 24 | 07c · Biometric failed | shipped — shipped | — |
| 25 | 08 · Back up your wallet | gap / sheet — deferrable | `HomePrompts.tsx:24` `Welcome.tsx:465–537` `navigator.tsx:165–183` |
| 26 | 08a · Back up later? | gap / sheet — deferral | — |
| 27 | 09 · Verify seed phrase | gap / sheet — deferrable | — |
| 28 | 10 · Import with seed phrase | shipped — shipped | — |
| 29 | 10e · Invalid seed word | shipped — shipped | `ImportSeedPhrase.tsx:99` |
| 30 | 11 · Import recovery method | shipped — shipped | — |
| 31 | 12 · Unlock | gap / sheet — app-only | — |
| 32 | 12a · Forgot passcode | shipped — shipped | — |
| 33 | E1 · Create password | shipped — 1/3 | — |
| 34 | E2 · Choose your Guardian | shipped — 2/3 | — |
| 35 | E3 · Wallet ready | shipped — 3/3 | — |
| 36 | E4 · Unlock | gap / sheet — app-only | — |
| 37 | E5 · Forgot password | gap / sheet — extension | `Unlock.tsx:389–396` `Unlock.tsx:352` |

## Home & overview

<sub>section `#allscreens` · 14 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 38 | Token detail · price unavailable | shipped | `binance.ts:128–129` `TokenDetail.tsx:137` `binance.ts:21` |
| 39 | Token detail · unpriced | bug / proposed — fork | `binance.ts:21` `TokenDetail.tsx:137` `TokenDetail.tsx:236` |
| 40 | Token detail | shipped | — |
| 41 | Home / Overview | shipped | `HomePrompts.tsx:47` `PromptCarousel.tsx:92–93` `BalanceCard.tsx:182–191` `Explore.tsx:192` |
| 42 | Home · first run | gap / sheet — gap | — |
| 43 | Home · loading | gap / sheet — gap | — |
| 44 | Home · balance hidden | gap / sheet — gap | — |
| 45 | Home · unpriced asset | bug / proposed — bug | `src/lib/prices/binance.ts:21` |
| 46 | Home · offline | gap / sheet — banner | `Explore.tsx:141` |
| 47 | Home · node unreachable | gap / sheet — banner | — |
| 48 | Home · notes to claim | gap / sheet — gap | — |
| 49 | Notification detail | gap / sheet — gap | `ConnectivityIssueBanner.tsx:49–82` `ConnectivityIssueBanner.tsx:91–105` |
| 50 | Accounts · list | bug / proposed — proposed | `BalanceCard.tsx:182` `Explore.tsx:192` |
| 51 | Account sheet | bug / proposed — proposed | — |

## Send flow

<sub>section `#allscreens` · 30 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 52 | Send · recipient | shipped | — |
| 53 | Send · recipient, filled | shipped | `lib/qr/format.test.ts:4` `QRCode.test.tsx:47` `SelectRecipient.tsx:65–66` |
| 54 | Send · recipient, new address | shipped | `QRCode.test.tsx:154` |
| 55 | Send · recipient, other network | gap / sheet — proposed | — |
| 56 | Send · recipient, unsupported | shipped | — |
| 57 | Send · recipient, typing | shipped | `lib/qr/format.test.ts:4` `QRCode.test.tsx:47` `SendManager.tsx:365–379` |
| 58 | Send · recipient, invalid | shipped | `SendManager.tsx:365–379` |
| 59 | Send · scan | gap / sheet — mobile only | — |
| 60 | Send · scan, detected | gap / sheet — gap | `format.ts:1–8` `format.ts:30–40` `format.ts:49–67` |
| 61 | Send · scan, unreadable | gap / sheet — gap | `lib/qr/index.ts:2` `utils/miden.ts:5` `lib/qr/format.ts:58` `format.ts:57–62` `utils/miden.ts:7` |
| 62 | Send · scan, unsupported network | gap / sheet — gap | `utils/miden.ts:14–16` `lib/qr/format.ts:49–67` `scanner.ts:72–74` |
| 63 | Send · scan, no code found | gap / sheet — gap | `scanner.ts:46–48` `scanner.ts:99–102` |
| 64 | Send · network | bug / proposed — proposed | `lib/miden/db/types.ts:33` |
| 65 | Send · amount | shipped — shipped | `SelectAmount.tsx:124–150` `SendManager.tsx:116` `TabLayout.tsx:42` `SendManager.tsx:84–85` `SelectAmount.tsx:136–148` `AmountInput.tsx:70–88` `SelectAmount.tsx:108–118` `AmountInput.tsx:81` `AmountInput.tsx:101` `AmountInput.tsx:84` `AmountInput.tsx:13–19` `binance.ts:21` |
| 66 | Send · amount, zero | gap / sheet — gap | `SelectAmount.tsx:70` `SendManager.tsx:46` `AmountInput.tsx:48` `AmountInput.tsx:75` `SelectAmount.tsx:84–88` |
| 67 | Send · amount, insufficient | gap / sheet — gap | `SendManager.tsx:317` `SelectAmount.tsx:144` |
| 68 | Send · amount, max | gap / sheet — proposed | `AssetField.tsx:27` `SelectAmount.tsx:46–48` |
| 69 | Send · amount, other chain | bug / proposed — proposed | `db/types.ts:22` |
| 70 | Send · token picker | gap / sheet — sheet | `SelectToken.tsx:63-79` |
| 71 | Send · review | shipped — shipped | — |
| 72 | Send · route | gap / sheet — proposed | `success/receipt.ts:69–79` `lib/miden/db/types.ts:22` `types.ts:187` |
| 73 | Send · review, other chain | gap / sheet — proposed | `lib/miden/db/types.ts:29–36` `types.ts:187` `TransactionSuccess.tsx:12–20` `TransactionSuccess.test.tsx:149` |
| 74 | Send · in progress | shipped | — |
| 75 | Send · success | shipped | `receipt.ts:30–65` |
| 76 | Send · success, other chain | bug / proposed — bug | `BridgeSuccess.tsx:59` `BridgeSuccess.tsx:25–30` `receipt.ts:43–48` `receipt.ts:30–66` `en.json:474` `types.ts:187` `TransactionSuccess.tsx:12–20` |
| 77 | Contacts · picker | gap / sheet — sheet | `SendManager.tsx:488` `SendManager.tsx:87–108` |
| 78 | Contacts · picker, empty | gap / sheet — sheet | `AccountsList.tsx:46–47` |
| 79 | Address book | gap / sheet — sheet | `Settings.tsx:420–431` `Settings.tsx:303` `AddressBook.tsx:77–78` `AddressBook.tsx:23–37` `AddressBook.tsx:78` |
| 80 | Address book · duplicate | gap / sheet — sheet | `AddressBook.tsx:128` |
| 81 | Address book · empty | gap / sheet — sheet | `AddressBook.tsx:68` |

## Receive flow

<sub>section `#allscreens` · 13 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 82 | Pending notes · loading | gap / sheet — gap | — |
| 83 | Receive · address copied | bug / proposed — bug | `AddressTab.tsx:99–106` `CopyButton.tsx:36–49` `en.json:13–14` |
| 84 | Receive · share failed | bug / proposed — bug | `AddressTab.tsx:54–64` `AddressTab.tsx:78–81` |
| 85 | Receive · request an amount | gap / sheet — proposed | `AddressTab.tsx:113–120` `qr/format.ts:10–20` `qr/format.ts:26–41` |
| 86 | Receive · loading | gap / sheet — gap | `PageRouter.tsx:150–157` `ready.tsx:88–101` `QRCode.tsx:3` `AddressTab.tsx:46–51` |
| 87 | Pending notes · empty | gap / sheet — gap | `PendingTab.tsx:189–199` `en.json:641` `en.json:694` `Pending.tsx:264` |
| 88 | Pending notes · fetch failed | bug / proposed — bug | `Pending.tsx:38` `claimable-notes.ts:323–330` `PendingTab.tsx:189` |
| 89 | Pending notes · claiming | bug / proposed — bug | `PendingTab.tsx:235–245` `PendingTab.tsx:514–524` `en.json:93` `Pending.tsx:233–236` `Pending.tsx:228–230` |
| 90 | Pending notes · claim failed | bug / proposed — bug | `PendingTab.tsx:469` `en.json:663` `Pending.tsx:196` `PendingTab.tsx:146–153` `Pending.tsx:186` `en.json:566` |
| 91 | Token detail · loading | bug / proposed — bug | `TokenDetail.tsx:48` `balance.ts:173–179` `balance.ts:31–44` `TokenDetail.tsx:51–53` `en.json:519` |
| 92 | Token detail · zero balance | gap / sheet — gap | `TokenDetail.tsx:86–101` |
| 93 | Token detail · unknown token | gap / sheet — gap | `PageRouter.tsx:178–185` `TokenDetail.tsx:51–53` `TokenLogo.tsx:50–57` `binance.ts:21` `TokenDetail.tsx:137` |
| 94 | Receive | shipped | `AddressTab.tsx:113–120` |

## Swap flow

<sub>section `#allscreens` · 6 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 95 | Swap · success | shipped | — |
| 96 | Swap · review, submitting | gap / sheet — gap | — |
| 97 | Swap · review | shipped | `ReviewSwap.tsx:56–61` |
| 98 | Swap · insufficient balance | shipped | — |
| 99 | Swap · fetching price | shipped | — |
| 100 | Swap | shipped | — |

## Activity flow

<sub>section `#allscreens` · 13 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 101 | Activity | shipped | — |
| 102 | Transaction detail | shipped | — |
| 103 | Activity · empty | gap / sheet — gap | `HistoryView.tsx:158–165` `AllHistory.tsx:66–90` |
| 104 | Activity · loading | gap / sheet — gap | `HistoryView.tsx:157` `History.tsx:42` |
| 105 | Activity · Sent, no matches | bug / proposed — bug | `History.tsx:104–111` `HistoryView.tsx:150` `AllHistory.tsx:29–35` `AllHistory.tsx:79` |
| 106 | Activity · failed transactions | gap / sheet — gap | `History.tsx:140` `get.ts:54` `get.ts:57` `get.ts:14–17` `History.tsx:142–143` `HistoryView.tsx:58` `HistoryView.tsx:71–73` `cancel.ts:35` `cancel.ts:69` |
| 107 | Activity · in progress | gap / sheet — gap | `History.tsx:59–63` `HistoryItem.tsx:87–96` `HistoryView.tsx:177` `AllHistory.tsx:97` `TokenDetail.tsx:117` `cancel.ts:13` `History.tsx:72` `get.ts:21` `History.tsx:215` |
| 108 | Activity · end of list | bug / proposed — bug | `get.ts:68` `History.tsx:82–83` `defaults.tsx:5` `get.ts:62` `History.tsx:87` `HistoryView.tsx:227–233` |
| 109 | Transaction detail · failed | gap / sheet — gap | `cancel.ts:35` `db/types.ts:102` `HistoryDetails.tsx:124–141` `HistoryDetails.tsx:298` `HistoryDetails.tsx:293–328` `IHistoryEntry.ts:25` `DetailCard.tsx:38` |
| 110 | Transaction detail · pending | bug / proposed — bug | `HistoryView.tsx:214` `History.tsx:193` `HistoryDetails.tsx:127` `transactionUtils.ts:78–79` `HistoryDetails.tsx:295` `constants.ts:10–31` |
| 111 | Claim · in progress | gap / sheet — gap | `Pending.tsx:211` `TransactionProgressModal.tsx:350` `Pending.tsx:207–209` `Pending.tsx:189–202` `Pending.tsx:213–226` |
| 112 | Claim · partial failure | gap / sheet — gap | `en.json:545` `Pending.tsx:196` `Pending.tsx:229` `PendingTab.tsx:469` |
| 113 | Pending notes | shipped | `en.json:694` `Pending.tsx:264` |

## Earn flow gated off

<sub>section `#allscreens` · 3 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 114 | Earn · vaults | gap / sheet — gated off | — |
| 115 | Vault detail | gap / sheet — gated off | — |
| 116 | Earn · deposit | gap / sheet — gated off | — |

## Settings & browser

<sub>section `#allscreens` · 19 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 117 | Settings | shipped | — |
| 118 | Settings · general | bug / proposed — bug | `ToggleSwitch.tsx:51` `SettingToggle.tsx:17` `GeneralSettings.tsx:79` |
| 119 | Settings · general, save failed | gap / sheet — gap | `helpers.ts:15–19` `ToggleSwitch.tsx:32` `GeneralSettings.tsx:48–54` |
| 120 | Settings · language | bug / proposed — bug | `LanguageSettings.tsx:9–23` `Settings.tsx:78–88` `Settings.tsx:92` |
| 121 | Settings · advanced, key loading | gap / sheet — gap | `AdvancedSettings.tsx:50` |
| 122 | Settings · advanced, key unavailable | gap / sheet — gap | `AdvancedSettings.tsx:25–27` |
| 123 | Settings · faucet ID | shipped | `AdvancedSettings.tsx:73` `Settings.tsx:246–252` `EditMidenFaucetId.tsx:69` |
| 124 | Settings · faucet ID, saved | shipped | `EditMidenFaucetId.tsx:95` |
| 125 | Settings · faucet ID, rejected | bug / proposed — bug | `EditMidenFaucetId.tsx:52` |
| 126 | Settings · authorized dApps | shipped | `DAppDrawerSettings.tsx:26–28` |
| 127 | Settings · connected dApps | bug / proposed — bug | `DAppSettings.tsx:94–153` `constants.ts:66–69` |
| 128 | Settings · connected dApps, none | gap / sheet — gap | `DAppSettings.tsx:53–59` `DAppDrawerSettings.tsx:61` `Settings.tsx:260–265` |
| 129 | Settings · networks | gap / sheet — gap | `constants.ts:91–105` `Settings.tsx:253–259` `templates/AdvancedSettings.tsx:39–43` `Settings.tsx:49` `constants.ts:40` |
| 130 | Settings · networks, confirm switch | gap / sheet — gap | `Networks.tsx:12–14` `ready.tsx:28–35` |
| 131 | Settings · networks, switching | gap / sheet — gap | `ready.tsx:24–35` |
| 132 | Settings · networks, switch failed | gap / sheet — gap | `Networks.tsx:12–14` `constants.ts:104` |
| 133 | Settings · currency | gap / sheet — gap | `fiat-curency/consts.ts:6–145` `core.tsx:79–101` `store/index.ts:600` `front/provider.tsx:7` `AssetRow.tsx:46` `Explore.tsx:188` `Receive/PendingTab.tsx:51` `SelectAmount.tsx:103` `ReviewAmount.tsx:39` `HistoryDetails.tsx:72` `core.tsx:103–110` |
| 134 | Address book · no results | bug / proposed — bug | `AddressBook.tsx:68–69` |
| 135 | Address book · edit contact | gap / sheet — gap | `AddressBook.tsx:78` |

## Security & recovery

<sub>section `#allscreens` · 22 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 136 | Reveal recovery phrase | shipped | — |
| 137 | Recovery phrase · checking device | bug / proposed — blank frame | `RevealSeedPhrase.tsx:111–113` `RevealSecret.tsx:332–334` `EncryptedWalletFileWalletPassword.tsx:136–138` |
| 138 | Recovery phrase · passcode | shipped — sheet | `RevealSeedPhrase.tsx:185` `RevealSecret.tsx:66` |
| 139 | Recovery phrase · password | shipped — extension | `RevealSeedPhrase.tsx:206–230` `use-secret-state.hook.ts:3` |
| 140 | Private key · acknowledge | shipped | `RevealSecret.tsx:340–358` |
| 141 | Private key · revealed | shipped | `use-secret-state.hook.ts:3` |
| 142 | Reveal secret · expired | bug / proposed — bug | `RevealSeedPhrase.tsx:72–76` |
| 143 | Guardian keys · revealed | shipped | `KeysSettings.tsx:21` |
| 144 | Settings · Keys | gap / sheet — sheet | `KeysSettings.tsx:22` `PageRouter.tsx:280` `KeysSettings.test.tsx:184` |
| 145 | Settings · change passcode | gap / sheet — gap | — |
| 146 | Settings · app lock | gap / sheet — gap | `GeneralSettings.selectors.ts:10` `lib/biometric/index.ts:183–192` `ReviewTransaction.tsx:134` `SwapManager.tsx:206` |
| 147 | Settings · auto-lock | gap / sheet — gap | `fixed-times.ts:7` `lock-up/run-checks.ts:9–10` |
| 148 | Guardian · rotate review | bug / proposed — specced, never built | `en.json:412–418` `GuardianSettings.tsx:112` |
| 149 | Guardian · remove | gap / sheet — gap | `GuardianInfoDrawer.tsx:79` `en.json:404` |
| 150 | Settings · reset wallet | gap / sheet — gap | `Unlock.tsx:280` `Settings.tsx:415` `en.json:9` |
| 151 | Reset wallet · confirm | gap / sheet — gap | `Unlock.tsx:280` `Settings.tsx:433–492` |
| 152 | Encrypted file · unlock | gap / sheet — unrouted | `EncryptedWalletFileWalletPassword.tsx:144` |
| 153 | Encrypted file · name and password | gap / sheet — unrouted | — |
| 154 | Encrypted file · exported | bug / proposed — auto-downloads | `ExportFileComplete.tsx:128–130` |
| 155 | Settings · About | gap / sheet — gap | `en.json:9` `Settings.tsx:415` `About.tsx:30–31` |
| 156 | Account · rename | gap / sheet — gap | `store/index.ts:207` `back/actions.ts:269–279` `vault.ts:846` `front/client.ts:143` `en.json:68` `app/defaults.tsx:21` |
| 157 | Account · delete | bug / proposed — no-op backend | `back/actions.ts:267` `front/client.ts:331` |

## dApp browser

<sub>section `#allscreens` · 11 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 158 | dApp browser | shipped | — |
| 159 | dApp launcher · no recents | gap / sheet — gap | `RecentsRow.tsx:32` `DappActionsSheet.tsx:130–137` `DappLauncher/index.tsx:40` `featured-dapps.ts:152–153` |
| 160 | dApp · active | bug / proposed — bug | `CapsuleBar.tsx:130` `main.css:442` `ProgressBar.tsx:32–38` |
| 161 | dApp · load failed | shipped | `DappActive.tsx:234–248` `CapsuleBar.tsx:238` `DappActive.tsx:219–249` `CapsuleBar.tsx:18–24` |
| 162 | dApp · connect request | shipped | `DappConfirmationModal.tsx:199–211` |
| 163 | dApp · transaction request | bug / proposed — bug | `DappConfirmationModal.tsx:186–197` |
| 164 | dApp · claim note request | gap / sheet — gap | `DappConfirmationModal.tsx:46` `dapp.ts:1384` |
| 165 | dApp · sign message | gap / sheet — gap | `dapp.ts:431` `dapp.ts:1529–1531` `dapp.ts:276` |
| 166 | dApp · private data request | gap / sheet — gap | `dapp.ts:503–504` `dapp.ts:525` `dapp.ts:1529–1531` `dapp.ts:909` `DappConfirmationModal.tsx:138` |
| 167 | dApp · switcher | bug / proposed — bug | `DappSwitcher.tsx:78–79` `DappConfirmationModal.tsx:61–125` |
| 168 | dApp · peek tray | bug / proposed — bug | `DappPeekCard.tsx:43–44` `DappPeekTray.tsx:58` |

## Global states

<sub>section `#allscreens` · 10 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 169 | Lock · probing hardware | gap / sheet — gap | `Unlock.tsx:253–258` |
| 170 | Lock · passcode incorrect | bug / proposed — error | `Unlock.tsx:160` |
| 171 | Lock · rate limited | bug / proposed — bug | `Unlock.tsx:352` |
| 172 | Lock · resume re-auth | gap / sheet — gap | `lib/mobile/back-handler.ts:30` `Unlock.tsx:65–124` |
| 173 | Activity · offline | gap / sheet — gap | `Explore.tsx:141` `App.tsx:17` `ConnectivityIssueBanner.tsx:152` |
| 174 | Toast · link copied | gap / sheet — gap | `NoteToastProvider.tsx:60` `DappActionsSheet.tsx:80–88` |
| 175 | Notifications · rationale | gap / sheet — gap | `native-notifications.ts:50–56` `NoteToastProvider.tsx:37–41` |
| 176 | Camera · permission denied | gap / sheet — gap | `lib/qr/scanner.ts:85–87` `lib/qr/index.ts:2` |
| 177 | Update required | gap / sheet — gap | `PageRouter.tsx:53` |
| 178 | Reset required | bug / proposed — bug | — |

---

## Reverse index — source file to screens

If one of these files changes, the screens beside it may no longer be true.

| Source | Screens that specify it |
|---|---|
| `en.json` | Send · success, other chain · Receive · address copied · Pending notes · empty · Pending notes · claiming · Pending notes · claim failed · Token detail · loading · Claim · partial failure · Pending notes · Guardian · rotate review · Guardian · remove · Settings · reset wallet · Settings · About · Account · rename |
| `Settings.tsx` | Address book · Settings · language · Settings · faucet ID · Settings · connected dApps, none · Settings · networks · Settings · reset wallet · Reset wallet · confirm · Settings · About |
| `HistoryView.tsx` | Activity · empty · Activity · loading · Activity · Sent, no matches · Activity · failed transactions · Activity · in progress · Activity · end of list · Transaction detail · pending |
| `Pending.tsx` | Pending notes · empty · Pending notes · fetch failed · Pending notes · claiming · Pending notes · claim failed · Claim · in progress · Claim · partial failure · Pending notes |
| `Unlock.tsx` | E5 · Forgot password · Settings · reset wallet · Reset wallet · confirm · Lock · probing hardware · Lock · passcode incorrect · Lock · rate limited · Lock · resume re-auth |
| `History.tsx` | Activity · loading · Activity · Sent, no matches · Activity · failed transactions · Activity · in progress · Activity · end of list · Transaction detail · pending |
| `SendManager.tsx` | Send · recipient, typing · Send · recipient, invalid · Send · amount · Send · amount, zero · Send · amount, insufficient · Contacts · picker |
| `TokenDetail.tsx` | Token detail · price unavailable · Token detail · unpriced · Token detail · loading · Token detail · zero balance · Token detail · unknown token · Activity · in progress |
| `AddressBook.tsx` | Address book · Address book · duplicate · Address book · empty · Address book · no results · Address book · edit contact |
| `AddressTab.tsx` | Receive · address copied · Receive · share failed · Receive · request an amount · Receive · loading · Receive |
| `DappConfirmationModal.tsx` | dApp · connect request · dApp · transaction request · dApp · claim note request · dApp · private data request · dApp · switcher |
| `Explore.tsx` | Home / Overview · Home · offline · Accounts · list · Settings · currency · Activity · offline |
| `PendingTab.tsx` | Pending notes · empty · Pending notes · fetch failed · Pending notes · claiming · Pending notes · claim failed · Claim · partial failure |
| `SelectAmount.tsx` | Send · amount · Send · amount, zero · Send · amount, insufficient · Send · amount, max · Settings · currency |
| `binance.ts` | Token detail · price unavailable · Token detail · unpriced · Send · amount · Token detail · unknown token |
| `constants.ts` | Transaction detail · pending · Settings · connected dApps · Settings · networks · Settings · networks, switch failed |
| `PageRouter.tsx` | Receive · loading · Token detail · unknown token · Settings · Keys · Update required |
| `RevealSeedPhrase.tsx` | Recovery phrase · checking device · Recovery phrase · passcode · Recovery phrase · password · Reveal secret · expired |
| `AdvancedSettings.tsx` | Settings · advanced, key loading · Settings · advanced, key unavailable · Settings · faucet ID |
| `AllHistory.tsx` | Activity · empty · Activity · Sent, no matches · Activity · in progress |
| `cancel.ts` | Activity · failed transactions · Activity · in progress · Transaction detail · failed |
| `dapp.ts` | dApp · claim note request · dApp · sign message · dApp · private data request |
| `EditMidenFaucetId.tsx` | Settings · faucet ID · Settings · faucet ID, saved · Settings · faucet ID, rejected |
| `get.ts` | Activity · failed transactions · Activity · in progress · Activity · end of list |
| `HistoryDetails.tsx` | Transaction detail · failed · Transaction detail · pending · Settings · currency |
| `lib/miden/db/types.ts` | Send · network · Send · route · Send · review, other chain |
| `QRCode.test.tsx` | Send · recipient, filled · Send · recipient, new address · Send · recipient, typing |
| `ready.tsx` | Receive · loading · Settings · networks, confirm switch · Settings · networks, switching |
| `RevealSecret.tsx` | Recovery phrase · checking device · Recovery phrase · passcode · Private key · acknowledge |
| `types.ts` | Send · route · Send · review, other chain · Send · success, other chain |
| `AmountInput.tsx` | Send · amount · Send · amount, zero |
| `back/actions.ts` | Account · rename · Account · delete |
| `BalanceCard.tsx` | Home / Overview · Accounts · list |
| `CapsuleBar.tsx` | dApp · active · dApp · load failed |
| `ConnectivityIssueBanner.tsx` | Notification detail · Activity · offline |
| `DappActionsSheet.tsx` | dApp launcher · no recents · Toast · link copied |
| `DAppDrawerSettings.tsx` | Settings · authorized dApps · Settings · connected dApps, none |
| `DAppSettings.tsx` | Settings · connected dApps · Settings · connected dApps, none |
| `db/types.ts` | Send · amount, other chain · Transaction detail · failed |
| `EncryptedWalletFileWalletPassword.tsx` | Recovery phrase · checking device · Encrypted file · unlock |
| `format.ts` | Send · scan, detected · Send · scan, unreadable |
| `front/client.ts` | Account · rename · Account · delete |
| `GeneralSettings.tsx` | Settings · general · Settings · general, save failed |
| `HomePrompts.tsx` | 08 · Back up your wallet · Home / Overview |
| `KeysSettings.tsx` | Guardian keys · revealed · Settings · Keys |
| `lib/qr/format.test.ts` | Send · recipient, filled · Send · recipient, typing |
| `lib/qr/format.ts` | Send · scan, unreadable · Send · scan, unsupported network |
| `lib/qr/index.ts` | Send · scan, unreadable · Camera · permission denied |
| `Networks.tsx` | Settings · networks, confirm switch · Settings · networks, switch failed |
| `NoteToastProvider.tsx` | Toast · link copied · Notifications · rationale |
| `receipt.ts` | Send · success · Send · success, other chain |
| `scanner.ts` | Send · scan, unsupported network · Send · scan, no code found |
| `store/index.ts` | Settings · currency · Account · rename |
| `ToggleSwitch.tsx` | Settings · general · Settings · general, save failed |
| `TransactionSuccess.tsx` | Send · review, other chain · Send · success, other chain |
| `use-secret-state.hook.ts` | Recovery phrase · password · Private key · revealed |
| `utils/miden.ts` | Send · scan, unreadable · Send · scan, unsupported network |
| `About.tsx` | Settings · About |
| `AccountsList.tsx` | Contacts · picker, empty |
| `App.tsx` | Activity · offline |
| `app/defaults.tsx` | Account · rename |
| `AssetField.tsx` | Send · amount, max |
| `AssetRow.tsx` | Settings · currency |
| `balance.ts` | Token detail · loading |
| `BridgeSuccess.tsx` | Send · success, other chain |
| `claimable-notes.ts` | Pending notes · fetch failed |
| `CopyButton.tsx` | Receive · address copied |
| `core.tsx` | Settings · currency |
| `DappActive.tsx` | dApp · load failed |
| `DappLauncher/index.tsx` | dApp launcher · no recents |
| `DappPeekCard.tsx` | dApp · peek tray |
| `DappPeekTray.tsx` | dApp · peek tray |
| `DappSwitcher.tsx` | dApp · switcher |
| `defaults.tsx` | Activity · end of list |
| `DetailCard.tsx` | Transaction detail · failed |
| `ExportFileComplete.tsx` | Encrypted file · exported |
| `featured-dapps.ts` | dApp launcher · no recents |
| `fiat-curency/consts.ts` | Settings · currency |
| `fixed-times.ts` | Settings · auto-lock |
| `front/provider.tsx` | Settings · currency |
| `GeneralSettings.selectors.ts` | Settings · app lock |
| `GuardianInfoDrawer.tsx` | Guardian · remove |
| `GuardianSettings.tsx` | Guardian · rotate review |
| `helpers.ts` | Settings · general, save failed |
| `HistoryItem.tsx` | Activity · in progress |
| `IHistoryEntry.ts` | Transaction detail · failed |
| `ImportSeedPhrase.tsx` | 10e · Invalid seed word |
| `KeysSettings.test.tsx` | Settings · Keys |
| `LanguageSettings.tsx` | Settings · language |
| `lib/biometric/index.ts` | Settings · app lock |
| `lib/mobile/back-handler.ts` | Lock · resume re-auth |
| `lib/qr/scanner.ts` | Camera · permission denied |
| `lock-up/run-checks.ts` | Settings · auto-lock |
| `main.css` | dApp · active |
| `native-notifications.ts` | Notifications · rationale |
| `navigator.tsx` | 08 · Back up your wallet |
| `ProgressBar.tsx` | dApp · active |
| `PromptCarousel.tsx` | Home / Overview |
| `qr/format.ts` | Receive · request an amount |
| `QRCode.tsx` | Receive · loading |
| `Receive/PendingTab.tsx` | Settings · currency |
| `RecentsRow.tsx` | dApp launcher · no recents |
| `ReviewAmount.tsx` | Settings · currency |
| `ReviewSwap.tsx` | Swap · review |
| `ReviewTransaction.tsx` | Settings · app lock |
| `SelectRecipient.tsx` | Send · recipient, filled |
| `SelectToken.tsx` | Send · token picker |
| `SettingToggle.tsx` | Settings · general |
| `src/lib/prices/binance.ts` | Home · unpriced asset |
| `success/receipt.ts` | Send · route |
| `SwapManager.tsx` | Settings · app lock |
| `TabLayout.tsx` | Send · amount |
| `templates/AdvancedSettings.tsx` | Settings · networks |
| `TokenLogo.tsx` | Token detail · unknown token |
| `TransactionProgressModal.tsx` | Claim · in progress |
| `TransactionSuccess.test.tsx` | Send · review, other chain |
| `transactionUtils.ts` | Transaction detail · pending |
| `vault.ts` | Account · rename |
| `Welcome.tsx` | 08 · Back up your wallet |
