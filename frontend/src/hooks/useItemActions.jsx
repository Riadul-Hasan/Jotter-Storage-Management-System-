import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { ConfirmDialog, PromptDialog, PasswordDialog, ItemViewer } from '../components/Dialogs';
import { copyText, downloadItem, itemAsText, metaFor } from '../utils/format';

/**
 * useItemActions
 * --------------
 * Single source of truth for item actions (favourite, copy, rename, duplicate,
 * share, delete, lock, view, download). Every page wires the same `actions`
 * object into <ItemCard /> and renders the returned `dialogs`, so behaviour is
 * identical — and correct — across the whole app.
 *
 * @param {() => void} onRefresh  called after any mutation so the page refetches.
 */
export default function useItemActions(onRefresh) {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState({ open: false, item: null, title: '', message: '' });
  const [prompt, setPrompt] = useState({ open: false, item: null });
  const [pw, setPw] = useState({ open: false, item: null, mode: 'set', error: '', loading: false });
  const [viewer, setViewer] = useState({ open: false, item: null });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    if (typeof onRefresh === 'function') onRefresh();
  }, [onRefresh]);

  const err = (e, fallback) => toast.error(e?.response?.data?.message || fallback);

  /* ------------------------------- actions ------------------------------ */
  const toggleFavorite = useCallback(
    async (item) => {
      try {
        const res = await api.patch(`/items/${item._id}/favorite`);
        toast.success(res.data?.message || 'Updated');
        setViewer((v) => (v.item?._id === item._id ? { ...v, item: res.data.item } : v));
        refresh();
      } catch (e) {
        err(e, 'Could not update favourite');
      }
    },
    [refresh]
  );

  const copy = useCallback(async (item) => {
    try {
      await copyText(itemAsText(item));
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Could not copy');
    }
  }, []);

  const rename = useCallback((item) => {
    setPrompt({ open: true, item });
  }, []);

  const submitRename = useCallback(
    async (name) => {
      const item = prompt.item;
      if (!item) return;
      setBusy(true);
      try {
        await api.put(`/items/${item._id}`, { name });
        toast.success('Renamed');
        setPrompt((p) => ({ ...p, open: false }));
        refresh();
      } catch (e) {
        err(e, 'Could not rename');
      } finally {
        setBusy(false);
      }
    },
    [prompt.item, refresh]
  );

  const duplicate = useCallback(
    async (item) => {
      try {
        await api.post(`/items/${item._id}/duplicate`);
        toast.success('Duplicated');
        refresh();
      } catch (e) {
        err(e, 'Could not duplicate');
      }
    },
    [refresh]
  );

  const share = useCallback(async (item) => {
    try {
      const res = await api.post(`/items/${item._id}/share`);
      await copyText(res.data.shareLink);
      toast.success('Share link copied');
    } catch (e) {
      err(e, 'Could not create share link');
    }
  }, []);

  const remove = useCallback((item) => {
    setConfirm({
      open: true,
      item,
      title: 'Delete this item?',
      message: `“${item?.name ?? ''}” will be removed permanently.`,
      detail:
        item?.type === 'folder'
          ? 'Everything inside this folder will be deleted too. This cannot be undone.'
          : 'This cannot be undone.',
    });
  }, []);

  const confirmRemove = useCallback(async () => {
    const item = confirm.item;
    if (!item) return;
    setBusy(true);
    try {
      await api.delete(`/items/${item._id}`);
      toast.success('Deleted');
      setConfirm((c) => ({ ...c, open: false }));
      setViewer((v) => (v.item?._id === item._id ? { open: false, item: null } : v));
      refresh();
    } catch (e) {
      err(e, 'Could not delete');
    } finally {
      setBusy(false);
    }
  }, [confirm.item, refresh]);

  const view = useCallback((item) => {
    if (!item || item.type === 'folder') return false;
    setViewer({ open: true, item });
    return true;
  }, []);

  const download = useCallback(async (item) => {
    try {
      await downloadItem(item);
      toast.success('Download started');
    } catch {
      toast.error('Could not download');
    }
  }, []);

  /**
   * Opens the password dialog for the right job:
   *  - 'set'    → folder without a password: create one (POST /folders/:id/lock)
   *  - 'remove' → folder with a password: remove it (POST /folders/:id/remove-lock)
   *  - 'vault'  → item already in the private vault: restore it
   *               (POST /items/:id/unlock, needs the VAULT password)
   * Note: the API never sends the password hash; it sends a computed boolean
   * `isLocked` (folder → has password, others → stored vault flag).
   */
  const lockFolder = useCallback((item) => {
    const locked = Boolean(item?.isLocked);
    const mode = locked ? (item?.type === 'folder' ? 'remove' : 'vault') : 'set';
    setPw({ open: true, item, mode, error: '', loading: false });
  }, []);

  /**
   * "Secure in vault" — available on EVERY item type from the 3-dot menu.
   * Asks for the vault password (POST /items/:id/lock) and hides the item.
   */
  const secureItem = useCallback((item) => {
    setPw({ open: true, item, mode: 'secure', error: '', loading: false });
  }, []);

  /** Jump into the emailed reset flow for a forgotten vault password. */
  const forgotVaultPassword = useCallback(() => {
    setPw((s) => ({ ...s, open: false, error: '' }));
    navigate('/forgot-password', { state: { purpose: 'vault' } });
  }, [navigate]);

  const submitPassword = useCallback(
    async (password) => {
      const { item, mode } = pw;
      if (!item) return;
      setPw((s) => ({ ...s, loading: true, error: '' }));
      try {
        if (mode === 'set') {
          await api.post(`/folders/${item._id}/lock`, { password });
          toast.success('Folder locked');
        } else if (mode === 'remove') {
          await api.post(`/folders/${item._id}/remove-lock`, { password });
          toast.success('Protection removed');
        } else if (mode === 'secure') {
          // Move any item into the private vault (vault password required)
          await api.post(`/items/${item._id}/lock`, { password });
          toast.success('Secured in your private vault');
        } else {
          // Restore an item from the private vault (vault password required)
          await api.post(`/items/${item._id}/unlock`, { password });
          toast.success('Moved out of the vault');
        }
        setPw((s) => ({ ...s, open: false, loading: false, error: '' }));
        refresh();
      } catch (e) {
        setPw((s) => ({
          ...s,
          loading: false,
          error: e?.response?.data?.message || 'Something went wrong',
        }));
      }
    },
    [pw, refresh]
  );

  const actions = {
    toggleFavorite,
    copy,
    rename,
    duplicate,
    share,
    remove,
    view,
    download,
    lockFolder,
    secureItem,
    forgotVaultPassword,
    // Aliases matching the older ItemCard prop names
    onFavorite: toggleFavorite,
    onCopy: copy,
    onRename: rename,
    onDuplicate: duplicate,
    onDelete: remove,
    onShare: share,
    onLock: lockFolder,
    onSecure: secureItem,
    onClick: view,
  };

  const closeConfirm = () => setConfirm((c) => ({ ...c, open: false }));
  const closePrompt = () => setPrompt((p) => ({ ...p, open: false }));
  const closePw = () => setPw((s) => ({ ...s, open: false, error: '' }));
  const closeViewer = () => setViewer((v) => ({ ...v, open: false }));

  const dialogs = (
    <>
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        detail={confirm.detail}
        loading={busy}
        onConfirm={confirmRemove}
        onCancel={closeConfirm}
      />

      <PromptDialog
        open={prompt.open}
        title="Rename item"
        subtitle="Pick a name you will recognise later."
        label="New name"
        placeholder="Untitled"
        initialValue={prompt.item?.name || ''}
        confirmLabel="Rename"
        loading={busy}
        onSubmit={submitRename}
        onCancel={closePrompt}
      />

      <PasswordDialog
        open={pw.open}
        mode={pw.mode}
        itemName={pw.item?.name || ''}
        error={pw.error}
        loading={pw.loading}
        onSubmit={submitPassword}
        onCancel={closePw}
        onForgot={forgotVaultPassword}
      />

      <ItemViewer
        open={viewer.open}
        item={viewer.item}
        busy={busy}
        onCopy={copy}
        onDownload={download}
        onFavorite={toggleFavorite}
        onClose={closeViewer}
      />
    </>
  );

  return { actions, dialogs, busy };
}