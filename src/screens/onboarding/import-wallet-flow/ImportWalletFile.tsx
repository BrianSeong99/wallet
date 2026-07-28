import React, { useRef, useState } from 'react';

import { useImportStore } from '@miden-sdk/react/lazy';
import classNames from 'clsx';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField, { PASSWORD_ERROR_CAPTION } from 'app/atoms/FormField';
import { Icon, IconName } from 'app/icons/v2';
import { Button } from 'components/Button';
import { ActionZone } from 'components/ui/ActionZone';
import { decrypt, decryptJson, deriveKey, generateKey } from 'lib/miden/passworder';
import { importDb } from 'lib/miden/repo';
import { getMidenClient } from 'lib/miden/sdk/miden-client';
import type { WalletAccount } from 'lib/shared/types';
import { DecryptedWalletFile, ENCRYPTED_WALLET_FILE_PASSWORD_CHECK, EncryptedWalletFile } from 'screens/shared';

import { OnboardingHeading, OnboardingScreen, OnboardingSubcopy } from '../common/layout';

interface FormData {
  password?: string;
}

export interface ImportWalletFileScreenProps {
  className?: string;
  onSubmit?: (seedPhrase: string, walletAccounts: WalletAccount[]) => void;
}

type WalletFile = EncryptedWalletFile & {
  name: string;
};

// A staged payload that's decrypted successfully and is waiting on the
// user to acknowledge the "imported accounts were stripped" notice
// before the final onSubmit. Null when no decryption has succeeded yet
// OR when the decrypted file carried zero omitted imported accounts (in
// which case the flow proceeds without a second click).
type PendingRestore = {
  seedPhrase: string;
  walletAccounts: WalletAccount[];
  omittedImportedAccountCount: number;
};

// TODO: This needs to move forward in the onboarding steps, likely needs some sort of next thing feature
export const ImportWalletFileScreen: React.FC<ImportWalletFileScreenProps> = ({ className, onSubmit }) => {
  const { t } = useTranslation();
  const { importStore } = useImportStore();
  const walletFileRef = useRef<HTMLInputElement>(null);
  const [walletFile, setWalletFile] = useState<WalletFile | null>(null);
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [isRestoreError, setIsRestoreError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<PendingRestore | null>(null);

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid }
  } = useForm<FormData>({
    mode: 'onChange'
  });

  const filePassword = watch('password') ?? '';

  const handleClear = () => {
    setWalletFile(null);
    setPendingRestore(null);
    // Reset the error flags too, otherwise a failed attempt on the previous
    // file leaks a stale error caption/red border onto the next file the
    // moment it's selected, before any action is taken on it.
    setIsRestoreError(false);
    setIsWrongPassword(false);
  };

  const handleImportSubmit = async () => {
    if (!walletFile || !onSubmit) return;

    // Second click of a two-step confirmation: decryption already
    // happened, user has now acknowledged the omitted-accounts notice.
    if (pendingRestore) {
      onSubmit(pendingRestore.seedPhrase, pendingRestore.walletAccounts);
      return;
    }

    // Decryption is the only step that depends on the password, so it is the
    // only step whose failure means "wrong password". Keep it in its own
    // try/catch; anything after it is a client/store/import failure that must
    // surface a distinct error (see below).
    let decryptedWallet: DecryptedWalletFile;
    try {
      const passKey = await generateKey(filePassword);
      const saltByteArray = Object.values(walletFile.salt) as number[];
      const saltU8 = new Uint8Array(saltByteArray);
      const derivedKey = await deriveKey(passKey, saltU8);

      // First, try decrypting `encryptedPasswordCheck`
      const decryptedCheck = await decrypt(walletFile.encryptedPasswordCheck, derivedKey);

      if (decryptedCheck !== ENCRYPTED_WALLET_FILE_PASSWORD_CHECK) {
        setIsWrongPassword(true); // Show error div
        return;
      }

      // Reset error state if it was previously set
      setIsWrongPassword(false);

      // Proceed with full decryption
      decryptedWallet = await decryptJson({ dt: walletFile.dt, iv: walletFile.iv }, derivedKey);
    } catch (error) {
      console.error('Decryption failed:', error);
      setIsWrongPassword(true); // Ensure error appears in case of failure
      return;
    }

    // Password was correct and the file decrypted cleanly. The remaining work
    // (spinning up the miden-client, resolving its store name, and writing the
    // dumps into IndexedDB) is independent of the password, so a failure here
    // is NOT a wrong password — reporting it as one traps the user in an
    // infinite retry loop with the correct password. Surface a distinct,
    // actionable restore error instead.
    try {
      setIsRestoreError(false);

      const midenClientDbContent = decryptedWallet.midenClientDbContent;
      const walletDbContent = decryptedWallet.walletDbContent;
      const seedPhrase = decryptedWallet.seedPhrase;
      const walletAccounts = decryptedWallet.accounts;
      const omittedImportedAccountCount = decryptedWallet.omittedImportedAccountCount ?? 0;

      // Restore the miden-client dump into the SAME IndexedDB store the active
      // client reads from. The export path writes it out via the client's
      // `storeIdentifier()` (defaulting to `MidenClientDB_<network>`), so the
      // restore must target that exact store name. A hardcoded literal here
      // leaves the running client reading its own empty DB, so account/balance
      // state stays invisible and balances read as 0 (issue #253).
      const storeName = await (await getMidenClient()).client.storeIdentifier();
      await importStore(midenClientDbContent, storeName);
      await importDb(walletDbContent);

      // Mirror the export-side warning on the restore side: if the
      // exporter stripped imported accounts, surface the count here
      // and require an explicit second click before completing the
      // restore. Otherwise the user would silently discover the
      // accounts are missing after the fact.
      if (omittedImportedAccountCount > 0) {
        setPendingRestore({ seedPhrase, walletAccounts, omittedImportedAccountCount });
        return;
      }

      onSubmit(seedPhrase, walletAccounts);
    } catch (error) {
      console.error('Wallet restore failed:', error);
      setIsRestoreError(true);
    }
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return; // Ignore if the drag is over a childelement
    setIsDragging(false);
  };

  const onDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    processFiles(e.dataTransfer.files);
    setIsDragging(false);
  };

  const onUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO error modals/alerts
    processFiles(e.target.files);
  };

  const processFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      const parts = file.name.split('.');
      const fileType = parts[parts.length - 1];
      const reader = new FileReader();

      if (fileType !== 'json') {
        alert('File type must be .json');
        return;
      }

      reader.onload = () => {
        try {
          const decoder = new TextDecoder();
          const decodedContent = decoder.decode(reader.result as ArrayBuffer);
          const jsonContent = JSON.parse(decodedContent);

          setWalletFile({ ...jsonContent, name: file.name });
        } catch (e) {
          console.error(e);
          alert('Invalid JSON file');
        }
      };

      reader.onerror = () => {
        alert('Error with file reader');
      };

      reader.readAsArrayBuffer(file);
    } else {
      alert('Select 1 file');
      return;
    }
  };

  const uploadFileComponent = (): JSX.Element => {
    return (
      // --accent-ink, not the raw brand orange: --accent measures 2.90:1 as
      // text on --paper, so an accent-coloured link has to use the ink pair.
      <span onClick={onUploadFileClick} className="cursor-pointer font-bold text-accent-ink">
        {t('chooseFromDevice')}
      </span>
    );
  };

  const onUploadFileClick = () => {
    if (walletFileRef != null && walletFileRef.current != null) {
      walletFileRef.current.click();
    }
  };

  return (
    <OnboardingScreen className={className}>
      <form className="flex w-full flex-1 flex-col" onSubmit={handleSubmit(handleImportSubmit)}>
        <div className="flex w-full flex-col gap-stack-loose py-stack-loose">
          <div className="flex flex-col gap-stack-tight">
            <OnboardingHeading>{t('importWallet')}</OnboardingHeading>
            <OnboardingSubcopy>{t('importWithEncryptedWalletFileDescription')}</OnboardingSubcopy>
          </div>

          {walletFile == null ? (
            // The dashed rule stays: it is the drop-target boundary, i.e.
            // structural separation, not a bordered tap target. Only its colour
            // moves onto theme-flipping tokens.
            <div
              className={classNames(
                'flex flex-col items-center gap-stack-tight p-8',
                'rounded-lg-token border border-dashed transition-colors',
                // --rule-strong, not --rule: at 8% the dashed edge is the only
                // thing marking the drop target and it all but disappears on
                // the cream ground.
                isDragging ? 'border-accent bg-accent-wash' : 'border-rule-strong'
              )}
              onDrop={onDropFile}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={e => {
                e.preventDefault();
              }}
            >
              <Icon name={IconName.UploadFile} size="xxl" />
              <p className="text-center text-label text-ink">
                {t('dragAndDropFile')} {uploadFileComponent()}
              </p>
              <p className="text-caption text-ink-2">{t('jsonFileType')}</p>
              <div>
                <input className="hidden" ref={walletFileRef} onChange={onUploadFile} type="file" />
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between rounded-md-token bg-surface-2 px-3 py-4">
              <div className="flex items-center gap-3">
                <Icon name={IconName.UploadedFile} size="md" />
                <div className="flex items-center break-all text-label text-ink">{walletFile.name}</div>
              </div>
              <button type="button" className="shrink-0 text-ink-2" onClick={handleClear}>
                <Icon name={IconName.Close} fill="currentColor" size="md" />
              </button>
            </div>
          )}

          {walletFile != null && pendingRestore == null && (
            <div className="flex w-full flex-col gap-stack-tight">
              <p className="text-label text-ink">{t('enterDecryptionPassword')}</p>
              <FormField
                {...register('password', {
                  required: PASSWORD_ERROR_CAPTION
                })}
                label={t('password')}
                id="newwallet-password"
                type="password"
                name="password"
                placeholder="********"
                errorCaption={
                  isWrongPassword
                    ? 'Wrong password'
                    : isRestoreError
                      ? "Couldn't restore the wallet. Please try again."
                      : errors.password?.message
                }
              />
            </div>
          )}

          {pendingRestore != null && (
            // --neg / --neg-wash instead of a raw red ramp plus dark: overrides.
            // The tokens already flip, so the dark variants were re-specifying
            // (and slightly contradicting) what the theme does for free.
            <div className="w-full rounded-md-token bg-neg-wash px-3 py-2 text-caption font-semibold leading-[1.4] text-neg">
              {t('encryptedFileImportedAccountsOmittedRestoreNotice', {
                importedCount: String(pendingRestore.omittedImportedAccountCount)
              })}
            </div>
          )}
        </div>

        <ActionZone>
          {/* Was FormSubmitButton with `className="w-full text-base"` plus an
              inline `padding: '12px 0px'` — the text-base override beat
              Button's --t-cta and dropped white-on-accent below the size it
              needs to stay legible. `type="submit"` keeps the react-hook-form
              submit path intact. */}
          <Button
            type="submit"
            title={pendingRestore != null ? t('continueImport') : t('import')}
            isLoading={isSubmitting}
            disabled={pendingRestore != null ? false : !isValid || !walletFile}
          />
        </ActionZone>
      </form>
    </OnboardingScreen>
  );
};
