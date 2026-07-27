# Screen index

Every screen in `index.html`, grouped by the flow it belongs to, in page order.

**Generated — do not hand-edit.** Regenerate with `node design-system/screens.mjs` after any
change to `index.html`. Serve the site with `python3 -m http.server 4599 --directory design-system`
and find a screen by searching its caption.

Total: **158 screens** across **11 flows**. The *Specifies* column lists the
shipped source each screen's rationale cites, so this reads in both directions: what a screen
documents, and which screens document a given file.

| Flow | Screens |
|---|--:|
| Onboarding | 30 |
| Home & overview | 12 |
| Send flow | 19 |
| Receive flow | 13 |
| Swap flow | 6 |
| Activity flow | 13 |
| Earn flow gated off | 3 |
| Settings & browser | 19 |
| Security & recovery | 22 |
| dApp browser | 11 |
| Global states | 10 |

---

## Onboarding

<sub>section `#allscreens` · 30 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 1 | 01 · Splash | shipped | — |
| 2 | 02 · Welcome | shipped | — |
| 3 | 03 · Choose protection | shipped — 1/4 | — |
| 4 | 04 · Passcode create | shipped — 2/4 | — |
| 5 | 05 · Passcode confirm | shipped — 2/4 | — |
| 6 | 05e · Passcode mismatch | bug / proposed — error | — |
| 7 | 04a · Face ID scan | shipped — 2/4 | — |
| 8 | 04b · Face ID success | shipped — 2/4 | — |
| 9 | 04a → 04b · Transition | shipped — live | — |
| 10 | 06 · Choose your Guardian | shipped — 3/4 | — |
| 11 | 06a · What is a Guardian? | gap / sheet — info sheet | — |
| 12 | 06b · Create password | bug / proposed — was missing | — |
| 13 | 06b′ · Password strength — low | bug / proposed — was missing | — |
| 14 | 06c · Set up account recovery | bug / proposed — was missing | — |
| 15 | 07a · Creating wallet | bug / proposed — loading | — |
| 16 | 07b · Wallet ready | shipped — 4/4 | — |
| 17 | 07c · Biometric failed | bug / proposed — was missing | — |
| 18 | 08 · Back up your wallet | gap / sheet — deferrable | `HomePrompts.tsx:24` `Welcome.tsx:465–537` `navigator.tsx:165–183` |
| 19 | 08a · Back up later? | gap / sheet — deferral | — |
| 20 | 09 · Verify seed phrase | gap / sheet — deferrable | — |
| 21 | 10 · Import with seed phrase | bug / proposed — path was missing | — |
| 22 | 10e · Invalid seed word | bug / proposed — was missing | `ImportSeedPhrase.tsx:99` |
| 23 | 11 · Import recovery method | bug / proposed — was missing | — |
| 24 | 12 · Unlock | gap / sheet — app-only | — |
| 25 | 12a · Forgot passcode | bug / proposed — redrawn | `RevealSecret.tsx:348–356` |
| 26 | E1 · Create password | shipped — 1/3 | — |
| 27 | E2 · Choose your Guardian | shipped — 2/3 | — |
| 28 | E3 · Wallet ready | shipped — 3/3 | — |
| 29 | E4 · Unlock | gap / sheet — app-only | — |
| 30 | E5 · Forgot password | gap / sheet — extension | `Unlock.tsx:389–396` `Unlock.tsx:352` |

## Home & overview

<sub>section `#allscreens` · 12 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 31 | Token detail · price unavailable | shipped | `binance.ts:128–129` `TokenDetail.tsx:137` `binance.ts:21` |
| 32 | Token detail | shipped | — |
| 33 | Home / Overview | shipped | — |
| 34 | Home · first run | gap / sheet — gap | — |
| 35 | Home · loading | gap / sheet — gap | — |
| 36 | Home · balance hidden | gap / sheet — gap | — |
| 37 | Home · unpriced asset | bug / proposed — bug | `src/lib/prices/binance.ts:21` |
| 38 | Home · offline | gap / sheet — banner | `Explore.tsx:141` |
| 39 | Home · node unreachable | gap / sheet — banner | — |
| 40 | Home · notes to claim | gap / sheet — gap | — |
| 41 | Accounts · list | bug / proposed — proposed | — |
| 42 | Account sheet | bug / proposed — proposed | — |

## Send flow

<sub>section `#allscreens` · 19 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 43 | Send · recipient | shipped | — |
| 44 | Send · recipient, new address | shipped | — |
| 45 | Send · recipient, other network | shipped | — |
| 46 | Send · recipient, unsupported | shipped | — |
| 47 | Send · recipient, typing | shipped | `SendManager.tsx:365–379` |
| 48 | Send · recipient, invalid | shipped | `SendManager.tsx:365–379` |
| 49 | Send · scan | gap / sheet — mobile only | — |
| 50 | Send · other chain | gap / sheet — proposed | — |
| 51 | Send · network | gap / sheet — proposed sheet | — |
| 52 | Send · amount | shipped | — |
| 53 | Send · token picker | gap / sheet — sheet | `SelectToken.tsx:63-79` |
| 54 | Send · review | bug / proposed — From row added | — |
| 55 | Send · in progress | shipped | — |
| 56 | Send · success | shipped | `receipt.ts:30–65` |
| 57 | Contacts · picker | gap / sheet — sheet | `SendManager.tsx:488` `SendManager.tsx:87–108` |
| 58 | Contacts · picker, empty | gap / sheet — sheet | `AccountsList.tsx:46–47` |
| 59 | Address book | gap / sheet — sheet | `Settings.tsx:420–431` `Settings.tsx:303` `AddressBook.tsx:77–78` `AddressBook.tsx:23–37` |
| 60 | Address book · duplicate | gap / sheet — sheet | `AddressBook.tsx:128` |
| 61 | Address book · empty | gap / sheet — sheet | `AddressBook.tsx:68` |

## Receive flow

<sub>section `#allscreens` · 13 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 62 | Pending notes · loading | gap / sheet — gap | — |
| 63 | Receive · address copied | bug / proposed — bug | `AddressTab.tsx:99–106` `CopyButton.tsx:36–49` `en.json:13–14` |
| 64 | Receive · share failed | bug / proposed — bug | `AddressTab.tsx:54–64` `AddressTab.tsx:78–81` |
| 65 | Receive · request an amount | gap / sheet — proposed | `AddressTab.tsx:113–120` `qr/format.ts:10–20` `qr/format.ts:26–41` |
| 66 | Receive · loading | gap / sheet — gap | `PageRouter.tsx:150–157` `ready.tsx:88–101` `QRCode.tsx:3` `AddressTab.tsx:46–51` |
| 67 | Pending notes · empty | gap / sheet — gap | `PendingTab.tsx:189–199` `en.json:641` `en.json:694` `Pending.tsx:264` |
| 68 | Pending notes · fetch failed | bug / proposed — bug | `Pending.tsx:38` `claimable-notes.ts:323–330` `PendingTab.tsx:189` |
| 69 | Pending notes · claiming | bug / proposed — bug | `PendingTab.tsx:235–245` `PendingTab.tsx:514–524` `en.json:93` `Pending.tsx:233–236` `Pending.tsx:228–230` |
| 70 | Pending notes · claim failed | bug / proposed — bug | `PendingTab.tsx:469` `en.json:663` `Pending.tsx:196` `PendingTab.tsx:146–153` `Pending.tsx:186` `en.json:566` |
| 71 | Token detail · loading | bug / proposed — bug | `TokenDetail.tsx:48` `balance.ts:173–179` `balance.ts:31–44` `TokenDetail.tsx:51–53` `en.json:519` |
| 72 | Token detail · zero balance | gap / sheet — gap | `TokenDetail.tsx:86–101` |
| 73 | Token detail · unknown token | gap / sheet — gap | `PageRouter.tsx:178–185` `TokenDetail.tsx:51–53` `TokenLogo.tsx:50–57` `binance.ts:21` `TokenDetail.tsx:137` |
| 74 | Receive | shipped | `AddressTab.tsx:113–120` |

## Swap flow

<sub>section `#allscreens` · 6 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 75 | Swap · success | shipped | — |
| 76 | Swap · review, submitting | gap / sheet — gap | — |
| 77 | Swap · review | shipped | `ReviewSwap.tsx:56–61` |
| 78 | Swap · insufficient balance | shipped | — |
| 79 | Swap · fetching price | shipped | — |
| 80 | Swap | shipped | — |

## Activity flow

<sub>section `#allscreens` · 13 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 81 | Activity | shipped | — |
| 82 | Transaction detail | shipped | — |
| 83 | Activity · empty | gap / sheet — gap | `HistoryView.tsx:158–165` `AllHistory.tsx:66–90` |
| 84 | Activity · loading | gap / sheet — gap | `HistoryView.tsx:157` `History.tsx:42` |
| 85 | Activity · Sent, no matches | bug / proposed — bug | `History.tsx:104–111` `HistoryView.tsx:150` `AllHistory.tsx:29–35` `AllHistory.tsx:79` |
| 86 | Activity · failed transactions | gap / sheet — gap | `History.tsx:140` `get.ts:54` `get.ts:57` `get.ts:14–17` `History.tsx:142–143` `HistoryView.tsx:58` `HistoryView.tsx:71–73` `cancel.ts:35` `cancel.ts:69` |
| 87 | Activity · in progress | gap / sheet — gap | `History.tsx:59–63` `HistoryItem.tsx:87–96` `HistoryView.tsx:177` `AllHistory.tsx:97` `TokenDetail.tsx:117` `cancel.ts:13` `History.tsx:72` `get.ts:21` `History.tsx:215` |
| 88 | Activity · end of list | bug / proposed — bug | `get.ts:68` `History.tsx:82–83` `defaults.tsx:5` `get.ts:62` `History.tsx:87` `HistoryView.tsx:227–233` |
| 89 | Transaction detail · failed | gap / sheet — gap | `cancel.ts:35` `db/types.ts:102` `HistoryDetails.tsx:124–141` `HistoryDetails.tsx:298` `HistoryDetails.tsx:293–328` `IHistoryEntry.ts:25` `DetailCard.tsx:38` |
| 90 | Transaction detail · pending | bug / proposed — bug | `HistoryView.tsx:214` `History.tsx:193` `HistoryDetails.tsx:127` `transactionUtils.ts:78–79` `HistoryDetails.tsx:295` `constants.ts:10–31` |
| 91 | Claim · in progress | gap / sheet — gap | `Pending.tsx:211` `TransactionProgressModal.tsx:350` `Pending.tsx:207–209` `Pending.tsx:189–202` `Pending.tsx:213–226` |
| 92 | Claim · partial failure | gap / sheet — gap | `en.json:545` `Pending.tsx:196` `Pending.tsx:229` `PendingTab.tsx:469` |
| 93 | Pending notes | shipped | `en.json:694` `Pending.tsx:264` |

## Earn flow gated off

<sub>section `#allscreens` · 3 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 94 | Earn · vaults | gap / sheet — gated off | — |
| 95 | Vault detail | gap / sheet — gated off | — |
| 96 | Earn · deposit | gap / sheet — gated off | — |

## Settings & browser

<sub>section `#allscreens` · 19 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 97 | Settings | shipped | — |
| 98 | Settings · general | bug / proposed — bug | `ToggleSwitch.tsx:51` `SettingToggle.tsx:17` `GeneralSettings.tsx:79` |
| 99 | Settings · general, save failed | gap / sheet — gap | `helpers.ts:15–19` `ToggleSwitch.tsx:32` `GeneralSettings.tsx:48–54` |
| 100 | Settings · language | bug / proposed — bug | `LanguageSettings.tsx:9–23` `Settings.tsx:78–88` `Settings.tsx:92` |
| 101 | Settings · advanced, key loading | gap / sheet — gap | `AdvancedSettings.tsx:50` |
| 102 | Settings · advanced, key unavailable | gap / sheet — gap | `AdvancedSettings.tsx:25–27` |
| 103 | Settings · faucet ID | shipped | `AdvancedSettings.tsx:73` `Settings.tsx:246–252` `EditMidenFaucetId.tsx:69` |
| 104 | Settings · faucet ID, saved | shipped | `EditMidenFaucetId.tsx:95` |
| 105 | Settings · faucet ID, rejected | bug / proposed — bug | `EditMidenFaucetId.tsx:52` |
| 106 | Settings · authorized dApps | shipped | `DAppDrawerSettings.tsx:26–28` |
| 107 | Settings · connected dApps | bug / proposed — bug | `DAppSettings.tsx:94–153` `constants.ts:66–69` |
| 108 | Settings · connected dApps, none | gap / sheet — gap | `DAppSettings.tsx:53–59` `DAppDrawerSettings.tsx:61` `Settings.tsx:260–265` |
| 109 | Settings · networks | gap / sheet — gap | `constants.ts:91–105` `Settings.tsx:253–259` `templates/AdvancedSettings.tsx:39–43` `Settings.tsx:49` `constants.ts:40` |
| 110 | Settings · networks, confirm switch | gap / sheet — gap | `Networks.tsx:12–14` `ready.tsx:28–35` |
| 111 | Settings · networks, switching | gap / sheet — gap | `ready.tsx:24–35` |
| 112 | Settings · networks, switch failed | gap / sheet — gap | `Networks.tsx:12–14` `constants.ts:104` |
| 113 | Settings · currency | gap / sheet — gap | `fiat-curency/consts.ts:6–145` `core.tsx:79–101` `store/index.ts:600` `front/provider.tsx:7` `AssetRow.tsx:46` `Explore.tsx:188` `Receive/PendingTab.tsx:51` `SelectAmount.tsx:103` `ReviewAmount.tsx:39` `HistoryDetails.tsx:72` `core.tsx:103–110` |
| 114 | Address book · no results | bug / proposed — bug | `AddressBook.tsx:68–69` |
| 115 | Address book · edit contact | gap / sheet — gap | `AddressBook.tsx:78` |

## Security & recovery

<sub>section `#allscreens` · 22 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 116 | Reveal recovery phrase | shipped | — |
| 117 | Recovery phrase · checking device | bug / proposed — blank frame | `RevealSeedPhrase.tsx:111–113` `RevealSecret.tsx:332–334` `EncryptedWalletFileWalletPassword.tsx:136–138` |
| 118 | Recovery phrase · passcode | shipped — sheet | `RevealSeedPhrase.tsx:185` `RevealSecret.tsx:66` |
| 119 | Recovery phrase · password | shipped — extension | `RevealSeedPhrase.tsx:206–230` `use-secret-state.hook.ts:3` |
| 120 | Private key · acknowledge | shipped | `RevealSecret.tsx:340–358` |
| 121 | Private key · revealed | shipped | `use-secret-state.hook.ts:3` |
| 122 | Reveal secret · expired | bug / proposed — bug | `RevealSeedPhrase.tsx:72–76` |
| 123 | Guardian keys · revealed | shipped | `KeysSettings.tsx:21` |
| 124 | Settings · Keys | gap / sheet — sheet | `KeysSettings.tsx:22` `PageRouter.tsx:280` `KeysSettings.test.tsx:184` |
| 125 | Settings · change passcode | gap / sheet — gap | — |
| 126 | Settings · app lock | gap / sheet — gap | `GeneralSettings.selectors.ts:10` `lib/biometric/index.ts:183–192` `ReviewTransaction.tsx:134` `SwapManager.tsx:206` |
| 127 | Settings · auto-lock | gap / sheet — gap | `fixed-times.ts:7` `lock-up/run-checks.ts:9–10` |
| 128 | Guardian · rotate review | bug / proposed — specced, never built | `en.json:412–418` `GuardianSettings.tsx:112` |
| 129 | Guardian · remove | gap / sheet — gap | `GuardianInfoDrawer.tsx:79` `en.json:404` |
| 130 | Settings · reset wallet | gap / sheet — gap | `Unlock.tsx:280` `Settings.tsx:415` `en.json:9` |
| 131 | Reset wallet · confirm | gap / sheet — gap | `Unlock.tsx:280` `Settings.tsx:433–492` |
| 132 | Encrypted file · unlock | gap / sheet — unrouted | `EncryptedWalletFileWalletPassword.tsx:144` |
| 133 | Encrypted file · name and password | gap / sheet — unrouted | — |
| 134 | Encrypted file · exported | bug / proposed — auto-downloads | `ExportFileComplete.tsx:128–130` |
| 135 | Settings · About | gap / sheet — gap | `en.json:9` `Settings.tsx:415` `About.tsx:30–31` |
| 136 | Account · rename | gap / sheet — gap | `store/index.ts:207` `back/actions.ts:269–279` `vault.ts:846` `front/client.ts:143` `en.json:68` `app/defaults.tsx:21` |
| 137 | Account · delete | bug / proposed — no-op backend | `back/actions.ts:267` `front/client.ts:331` |

## dApp browser

<sub>section `#allscreens` · 11 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 138 | dApp browser | shipped | — |
| 139 | dApp launcher · no recents | gap / sheet — gap | `RecentsRow.tsx:32` `DappActionsSheet.tsx:130–137` `DappLauncher/index.tsx:40` `featured-dapps.ts:152–153` |
| 140 | dApp · active | bug / proposed — bug | `CapsuleBar.tsx:130` `main.css:442` `ProgressBar.tsx:32–38` |
| 141 | dApp · load failed | shipped | `DappActive.tsx:234–248` `CapsuleBar.tsx:238` `DappActive.tsx:219–249` `CapsuleBar.tsx:18–24` |
| 142 | dApp · connect request | shipped | `DappConfirmationModal.tsx:199–211` |
| 143 | dApp · transaction request | bug / proposed — bug | `DappConfirmationModal.tsx:186–197` |
| 144 | dApp · claim note request | gap / sheet — gap | `DappConfirmationModal.tsx:46` `dapp.ts:1384` |
| 145 | dApp · sign message | gap / sheet — gap | `dapp.ts:431` `dapp.ts:1529–1531` `dapp.ts:276` |
| 146 | dApp · private data request | gap / sheet — gap | `dapp.ts:503–504` `dapp.ts:525` `dapp.ts:1529–1531` `dapp.ts:909` `DappConfirmationModal.tsx:138` |
| 147 | dApp · switcher | bug / proposed — bug | `DappSwitcher.tsx:78–79` `DappConfirmationModal.tsx:61–125` |
| 148 | dApp · peek tray | bug / proposed — bug | `DappPeekCard.tsx:43–44` `DappPeekTray.tsx:58` |

## Global states

<sub>section `#allscreens` · 10 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 149 | Lock · probing hardware | gap / sheet — gap | `Unlock.tsx:253–258` |
| 150 | Lock · passcode incorrect | bug / proposed — error | `Unlock.tsx:160` |
| 151 | Lock · rate limited | bug / proposed — bug | `Unlock.tsx:352` |
| 152 | Lock · resume re-auth | gap / sheet — gap | `lib/mobile/back-handler.ts:30` `Unlock.tsx:65–124` |
| 153 | Activity · offline | gap / sheet — gap | `Explore.tsx:141` `App.tsx:17` `ConnectivityIssueBanner.tsx:152` |
| 154 | Toast · link copied | gap / sheet — gap | `NoteToastProvider.tsx:60` `DappActionsSheet.tsx:80–88` |
| 155 | Notifications · rationale | gap / sheet — gap | `native-notifications.ts:50–56` `NoteToastProvider.tsx:37–41` |
| 156 | Camera · permission denied | gap / sheet — gap | `lib/qr/scanner.ts:85–87` `lib/qr/index.ts:2` |
| 157 | Update required | gap / sheet — gap | `PageRouter.tsx:53` |
| 158 | Reset required | bug / proposed — bug | — |

---

## Reverse index — source file to screens

If one of these files changes, the screens beside it may no longer be true.

| Source | Screens that specify it |
|---|---|
| `en.json` | Receive · address copied · Pending notes · empty · Pending notes · claiming · Pending notes · claim failed · Token detail · loading · Claim · partial failure · Pending notes · Guardian · rotate review · Guardian · remove · Settings · reset wallet · Settings · About · Account · rename |
| `Settings.tsx` | Address book · Settings · language · Settings · faucet ID · Settings · connected dApps, none · Settings · networks · Settings · reset wallet · Reset wallet · confirm · Settings · About |
| `HistoryView.tsx` | Activity · empty · Activity · loading · Activity · Sent, no matches · Activity · failed transactions · Activity · in progress · Activity · end of list · Transaction detail · pending |
| `Pending.tsx` | Pending notes · empty · Pending notes · fetch failed · Pending notes · claiming · Pending notes · claim failed · Claim · in progress · Claim · partial failure · Pending notes |
| `Unlock.tsx` | E5 · Forgot password · Settings · reset wallet · Reset wallet · confirm · Lock · probing hardware · Lock · passcode incorrect · Lock · rate limited · Lock · resume re-auth |
| `History.tsx` | Activity · loading · Activity · Sent, no matches · Activity · failed transactions · Activity · in progress · Activity · end of list · Transaction detail · pending |
| `AddressBook.tsx` | Address book · Address book · duplicate · Address book · empty · Address book · no results · Address book · edit contact |
| `AddressTab.tsx` | Receive · address copied · Receive · share failed · Receive · request an amount · Receive · loading · Receive |
| `DappConfirmationModal.tsx` | dApp · connect request · dApp · transaction request · dApp · claim note request · dApp · private data request · dApp · switcher |
| `PendingTab.tsx` | Pending notes · empty · Pending notes · fetch failed · Pending notes · claiming · Pending notes · claim failed · Claim · partial failure |
| `TokenDetail.tsx` | Token detail · price unavailable · Token detail · loading · Token detail · zero balance · Token detail · unknown token · Activity · in progress |
| `constants.ts` | Transaction detail · pending · Settings · connected dApps · Settings · networks · Settings · networks, switch failed |
| `PageRouter.tsx` | Receive · loading · Token detail · unknown token · Settings · Keys · Update required |
| `RevealSecret.tsx` | 12a · Forgot passcode · Recovery phrase · checking device · Recovery phrase · passcode · Private key · acknowledge |
| `RevealSeedPhrase.tsx` | Recovery phrase · checking device · Recovery phrase · passcode · Recovery phrase · password · Reveal secret · expired |
| `AdvancedSettings.tsx` | Settings · advanced, key loading · Settings · advanced, key unavailable · Settings · faucet ID |
| `AllHistory.tsx` | Activity · empty · Activity · Sent, no matches · Activity · in progress |
| `cancel.ts` | Activity · failed transactions · Activity · in progress · Transaction detail · failed |
| `dapp.ts` | dApp · claim note request · dApp · sign message · dApp · private data request |
| `EditMidenFaucetId.tsx` | Settings · faucet ID · Settings · faucet ID, saved · Settings · faucet ID, rejected |
| `Explore.tsx` | Home · offline · Settings · currency · Activity · offline |
| `get.ts` | Activity · failed transactions · Activity · in progress · Activity · end of list |
| `HistoryDetails.tsx` | Transaction detail · failed · Transaction detail · pending · Settings · currency |
| `ready.tsx` | Receive · loading · Settings · networks, confirm switch · Settings · networks, switching |
| `SendManager.tsx` | Send · recipient, typing · Send · recipient, invalid · Contacts · picker |
| `back/actions.ts` | Account · rename · Account · delete |
| `binance.ts` | Token detail · price unavailable · Token detail · unknown token |
| `CapsuleBar.tsx` | dApp · active · dApp · load failed |
| `DappActionsSheet.tsx` | dApp launcher · no recents · Toast · link copied |
| `DAppDrawerSettings.tsx` | Settings · authorized dApps · Settings · connected dApps, none |
| `DAppSettings.tsx` | Settings · connected dApps · Settings · connected dApps, none |
| `EncryptedWalletFileWalletPassword.tsx` | Recovery phrase · checking device · Encrypted file · unlock |
| `front/client.ts` | Account · rename · Account · delete |
| `GeneralSettings.tsx` | Settings · general · Settings · general, save failed |
| `KeysSettings.tsx` | Guardian keys · revealed · Settings · Keys |
| `Networks.tsx` | Settings · networks, confirm switch · Settings · networks, switch failed |
| `NoteToastProvider.tsx` | Toast · link copied · Notifications · rationale |
| `store/index.ts` | Settings · currency · Account · rename |
| `ToggleSwitch.tsx` | Settings · general · Settings · general, save failed |
| `use-secret-state.hook.ts` | Recovery phrase · password · Private key · revealed |
| `About.tsx` | Settings · About |
| `AccountsList.tsx` | Contacts · picker, empty |
| `App.tsx` | Activity · offline |
| `app/defaults.tsx` | Account · rename |
| `AssetRow.tsx` | Settings · currency |
| `balance.ts` | Token detail · loading |
| `claimable-notes.ts` | Pending notes · fetch failed |
| `ConnectivityIssueBanner.tsx` | Activity · offline |
| `CopyButton.tsx` | Receive · address copied |
| `core.tsx` | Settings · currency |
| `DappActive.tsx` | dApp · load failed |
| `DappLauncher/index.tsx` | dApp launcher · no recents |
| `DappPeekCard.tsx` | dApp · peek tray |
| `DappPeekTray.tsx` | dApp · peek tray |
| `DappSwitcher.tsx` | dApp · switcher |
| `db/types.ts` | Transaction detail · failed |
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
| `HomePrompts.tsx` | 08 · Back up your wallet |
| `IHistoryEntry.ts` | Transaction detail · failed |
| `ImportSeedPhrase.tsx` | 10e · Invalid seed word |
| `KeysSettings.test.tsx` | Settings · Keys |
| `LanguageSettings.tsx` | Settings · language |
| `lib/biometric/index.ts` | Settings · app lock |
| `lib/mobile/back-handler.ts` | Lock · resume re-auth |
| `lib/qr/index.ts` | Camera · permission denied |
| `lib/qr/scanner.ts` | Camera · permission denied |
| `lock-up/run-checks.ts` | Settings · auto-lock |
| `main.css` | dApp · active |
| `native-notifications.ts` | Notifications · rationale |
| `navigator.tsx` | 08 · Back up your wallet |
| `ProgressBar.tsx` | dApp · active |
| `qr/format.ts` | Receive · request an amount |
| `QRCode.tsx` | Receive · loading |
| `receipt.ts` | Send · success |
| `Receive/PendingTab.tsx` | Settings · currency |
| `RecentsRow.tsx` | dApp launcher · no recents |
| `ReviewAmount.tsx` | Settings · currency |
| `ReviewSwap.tsx` | Swap · review |
| `ReviewTransaction.tsx` | Settings · app lock |
| `SelectAmount.tsx` | Settings · currency |
| `SelectToken.tsx` | Send · token picker |
| `SettingToggle.tsx` | Settings · general |
| `src/lib/prices/binance.ts` | Home · unpriced asset |
| `SwapManager.tsx` | Settings · app lock |
| `templates/AdvancedSettings.tsx` | Settings · networks |
| `TokenLogo.tsx` | Token detail · unknown token |
| `TransactionProgressModal.tsx` | Claim · in progress |
| `transactionUtils.ts` | Transaction detail · pending |
| `vault.ts` | Account · rename |
| `Welcome.tsx` | 08 · Back up your wallet |
