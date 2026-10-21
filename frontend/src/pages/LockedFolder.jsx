import { forwardRef } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Lock, Sparkles, List, Layout, StickyNote, Image as ImageIcon, FileText, Check,
  FolderOpen, Plus, Search as SearchIcon,
} from 'lucide-react';
import PageShell from '../components/PageShell';
import api from '../api/axios';
import { cx, formatBytes, formatDate, metaFor, avatarUrl } from '../utils/format';
import { EmptyState, ListSkeleton } from '../components/Skeletons';
import { PasswordDialog } from '../components/Dialogs';
import useItemActions from '../hooks/useItemActions';

const TYPE_ICON = {
  note: StickyNote,
  image: ImageIcon,
  pdf: FileText,
  folder: FolderOpen,
};

const CATEGORY_ORDER = ['folder', 'image', 'note', 'pdf'];

const categoryLabel = (type) => {
  const labels = { folder: 'Folders', image: 'Images', note: 'Notes', pdf: 'PDFs' };
  return labels[type] || type;
};

const VaultItem = forwardRef(({ item, index, onRemoveLock, list, onClick }, ref) => {
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [unlockPwd, setUnlockPwd] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const meta = metaFor(item.type);
  const thumb = item.type === 'image' && item.filePath ? avatarUrl(item.filePath) : null;

  const doUnlock = async () => {
    try {
      await api.post(`/items/${item._id}/unlock`, { password: unlockPwd });
      toast.success('Moved back to your library');
      setUnlockOpen(false);
      setUnlockPwd('');
      setUnlockError('');
      onRemoveLock();
    } catch (e) {
      setUnlockError(e?.response?.data?.message || 'Incorrect password');
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      onClick={() => onClick?.(item)}
      className={cx(
        'relative cursor-pointer rounded-[22px] border border-cream-200 bg-white/80 p-3.5 shadow-warm-xs transition-all hover:-translate-y-1 hover:border-cream-300 hover:shadow-warm-sm',
        list ? 'flex items-center gap-3 px-4 py-3' : 'flex flex-col gap-3 p-4'
      )}
    >
      <div className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm overflow-hidden', meta.solid)}>
        {thumb ? (
          <img src={thumb} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <meta.Icon size={18} strokeWidth={2.2} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-bold text-ink-900">{item.name}</h4>
          {item.isLocked && <span className="text-[10px] font-bold bg-rose-50 text-rose-700 rounded-full px-2 py-0.5">Locked</span>}
        </div>
        <p className="text-[11.5px] text-ink-500">{meta.label} · {formatDate(item.createdAt)}</p>
        {item.fileSize && <p className="text-[11px] text-ink-400">{formatBytes(item.fileSize)}</p>}
      </div>
      <div className={cx('flex items-center gap-2', list ? 'ml-auto' : 'mt-3')}>
        <button type="button" onClick={(e) => { e.stopPropagation(); setUnlockPwd(''); setUnlockError(''); setUnlockOpen(true); }} className="p-2 rounded-xl text-ink-400 hover:bg-rose-50 hover:text-rose-600 transition" title="Restore to library"><Check size={16} /></button>
      </div>
      {unlockOpen && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-[22px] border border-cream-200">
          <div className="w-full max-w-sm p-4">
            <p className="text-sm font-bold text-ink-900 mb-1">Restore to library</p>
            <p className="text-xs text-ink-500 mb-3">Enter the vault password</p>
            <input type="password" value={unlockPwd} onChange={(e) => setUnlockPwd(e.target.value)} placeholder="Password" className="w-field mb-3" onKeyDown={(e) => e.key === 'Enter' && doUnlock()} />
            {unlockError && <p className="text-[12px] text-rose-600 mb-3">{unlockError}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); setUnlockOpen(false); }} className="flex-1 w-btn-soft py-2 text-sm font-bold">Cancel</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); doUnlock(); }} className="flex-1 w-btn-primary py-2 text-sm font-bold">Continue</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
});

const LockedFolder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isExitingRef = useRef(false);
  const prevPathRef = useRef(location.pathname);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState('checking');
  useEffect(() => {
    if (stage !== 'open') {
      prevPathRef.current = location.pathname;
      return;
    }
    if (location.pathname !== prevPathRef.current) {
      setPendingTarget(location.pathname);
      setShowExitConfirm(true);
      navigate(prevPathRef.current, { replace: true });
    }
  }, [location.pathname, stage, navigate]);
  useEffect(() => {
    if (stage !== 'open') return;
    const origPush = window.history.pushState.bind(window.history);
    const origReplace = window.history.replaceState.bind(window.history);
    const handleNav = (url) => {
      if (isExitingRef.current) return false;
      const path = typeof url === 'string' ? url : (url && url.pathname) || '';
      const target = path.split('?')[0];
      if (!target || target === location.pathname) return false;
      
      setPendingTarget(target);
      setShowExitConfirm(true);
      
      // Prevent the navigation from actually happening by not calling the original state method
      return true;
    };
    window.history.pushState = (state, title, url) => {
      if (handleNav(url)) return; 
      return origPush(state, title, url);
    };
    window.history.replaceState = (state, title, url) => {
      if (handleNav(url)) return;
      return origReplace(state, title, url);
    };
    return () => {
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
    };
  }, [stage, location.pathname]);
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [view, setView] = useState('grid');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingTarget, setPendingTarget] = useState('/home');

  const fetchLocked = useCallback(async () => {
    try {
      const res = await api.get('/items/locked');
      setItems(res.data.items || []);
    } catch {
      toast.error('Could not load the vault');
    } finally {
      setLoading(false);
    }
  }, []);

  const { actions, dialogs } = useItemActions(fetchLocked);

  const removeLock = useCallback(() => {
    fetchLocked();
  }, [fetchLocked]);

  const handleNavigate = (targetPath) => {
    if (stage === 'open') {
      setPendingTarget(targetPath || '/home');
      setShowExitConfirm(true);
    } else {
      navigate(targetPath);
    }
  };

  const confirmExit = () => {
    const target = pendingTarget || '/home';
    setShowExitConfirm(false);
    isExitingRef.current = true;
    prevPathRef.current = target;
    navigate(target, { replace: true });
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  /* ---------- Import-to-vault ---------- */
  const [importOpen, setImportOpen] = useState(false);
  const [libraryItems, setLibraryItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [importLoading, setImportLoading] = useState(false);
  const [importQuery, setImportQuery] = useState('');

  const fetchLibrary = useCallback(async () => {
    try {
      const res = await api.get('/items?isLocked=false');
      setLibraryItems(res.data.items || []);
    } catch {
      toast.error('Could not load library items');
    }
  }, []);

  const visibleLibrary = useMemo(() => {
    const q = importQuery.trim().toLowerCase();
    return [...libraryItems]
      .filter((i) => i.name?.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [libraryItems, importQuery]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isSelected = (id) => selectedIds.has(id);

  const doImport = async () => {
    if (selectedIds.size === 0) return;
    setImportLoading(true);
    setImportError('');
    try {
      await api.post('/items/bulk-lock', { ids: Array.from(selectedIds), password: importPwd });
      toast.success(`${selectedIds.size} item${selectedIds.size === 1 ? '' : 's'} moved to vault`);
      setImportOpen(false);
      setSelectedIds(new Set());
      setImportPwd('');
      fetchLocked();
    } catch (e) {
      setImportError(e?.response?.data?.message || 'Import failed. Please check your vault password.');
    } finally {
      setImportLoading(false);
    }
  };

  const [importPwd, setImportPwd] = useState('');
  const [importError, setImportError] = useState('');

  useEffect(() => { fetchLibrary(); }, [fetchLibrary]);

  useEffect(() => {
    let alive = true;
    if (location.state?.unlockFromProfile) {
      if (alive) setStage('open');
      return;
    }
    api.get('/auth/me').then((res) => {
      if (!alive) return;
      setStage(Boolean(res.data?.user?.hasLockPassword) ? 'locked' : 'setup');
    }).catch(() => { if (alive) setStage('locked'); });
    return () => { alive = false; };
  }, [location]);

  useEffect(() => { if (stage === 'open') fetchLocked(); }, [stage, fetchLocked]);

  const submitVault = async (password) => {
    setPwLoading(true);
    try {
      if (stage === 'setup') {
        await api.post('/profile/set-lock-password', { lockPassword: password });
        toast.success('Private vault created');
      } else {
        await api.post('/profile/verify-lock-password', { lockPassword: password });
        toast.success('Vault unlocked');
      }
      setStage('open');
      setPwError('');
    } catch (e) {
      setPwError(e?.response?.data?.message || 'Incorrect password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <PageShell title="Private vault" subtitle="Your password-protected items stay hidden here" accent="grape">
      {stage === 'checking' && (
        <div className="flex h-[60vh] items-center justify-center"><ListSkeleton rows={3} /></div>
      )}

      {(stage === 'setup' || stage === 'locked') && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex h-[55vh] flex-col items-center justify-center">
          <div className="rounded-[34px] border border-cream-200 bg-white/90 p-8 sm:p-12 shadow-warm-lg max-w-md w-full">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-grape to-purple-500 text-white shadow-[0_8px_24px_rgba(139,92,246,0.35)] mb-6">
              {stage === 'setup' ? <Sparkles size={26} strokeWidth={2} /> : <Lock size={26} strokeWidth={2} />}
            </div>
            <h3 className="text-xl font-display font-bold text-ink-900 text-center mb-2">{stage === 'setup' ? 'Create your vault' : 'Unlock your vault'}</h3>
            <p className="text-center text-ink-500 text-sm mb-6">{stage === 'setup' ? 'Set a password to protect your private items. Only you can open the vault.' : 'Enter your vault password to see your protected items.'}</p>
            <p className={cx('text-[12px] text-center mb-6', pwError ? 'text-rose-600' : 'text-ink-500')}>{pwError}</p>
          </div>
        </motion.div>
      )}

      {stage === 'open' && (
        <>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-display font-bold text-ink-900 tracking-tight">Vault items</h2>
              <p className="text-[13px] text-ink-500">{items.length} protected item{items.length === 1 ? '' : 's'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setView(view === 'grid' ? 'list' : 'grid')} className={cx('w-10 h-10 rounded-2xl border border-cream-300 bg-white flex items-center justify-center text-ink-700 hover:bg-cream-100 transition', view === 'grid' && 'bg-brand-grape/10 border-brand-grape/20 text-brand-grape')}>{view === 'grid' ? <List size={16} /> : <Layout size={16} />}</button>
              <button
                type="button"
                onClick={() => { setImportOpen(true); fetchLibrary(); }}
                className="w-btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
              >
                <Plus size={16} /> Import to vault
              </button>
            </div>
          </motion.div>
          <div className={cx('grid gap-3.5 md:grid-cols-2 lg:grid-cols-3', view === 'grid' ? '' : 'flex flex-col')}>
            {items.length === 0 ? (
              <EmptyState icon={Lock} tone="grape" title="Your vault is empty" text="Lock a folder from Home or Folders and it will appear here, protected by your password." />
            ) : (
              view === 'grid' ? (
                <AnimatePresence mode="popLayout">{items.map((item, i) => <VaultItem key={item._id} item={item} index={i} onRemoveLock={removeLock} onClick={actions.view} />)}</AnimatePresence>
              ) : (
                <div className="space-y-2.5">{items.map((item, i) => <VaultItem key={item._id} item={item} index={i} onRemoveLock={removeLock} list onClick={actions.view} />)}</div>
              )
            )}
          </div>
          {dialogs}
        </>
      )}

      <PasswordDialog
        open={stage === 'setup' || stage === 'locked'}
        mode={stage === 'setup' ? 'set' : 'verify'}
        itemName=""
        error={pwError}
        loading={pwLoading}
        onSubmit={submitVault}
        onCancel={() => { setPwError(''); navigate('/home'); }}
        onForgot={() => { setPwError(''); setStage('setup'); }}
      />

      {/* Exit Confirmation Dialog */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-cream-200 text-center"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-display font-bold text-ink-900 mb-2">Terminate Session?</h3>
              <p className="text-ink-500 text-sm mb-6">
                Are you sure to terminate session for your secure folder?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={cancelExit} 
                  className="flex-1 py-3 rounded-2xl font-bold text-ink-600 bg-cream-100 hover:bg-cream-200 transition"
                >
                  No

                </button>
                <button 
                  onClick={confirmExit} 
                  className="flex-1 py-3 rounded-2xl font-bold text-white bg-ink-900 hover:bg-ink-800 transition"
                >
                  Yes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------- Import-to-vault dialog ---------- */}
      {importOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 0.95 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-cream-200 bg-white shadow-warm-xl"
          >
            <div className="flex items-start gap-3 px-6 pb-4 pt-6">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-mint to-emerald-500 text-white shadow-warm-sm">
                <Plus size={20} strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="w-title text-lg font-bold text-ink-900">Import to vault</h3>
                <p className="w-sub mt-1 text-[13px]">Select items from your library to protect in your private vault.</p>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5">
              <div className="relative mb-4">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
                <input
                  type="search"
                  value={importQuery}
                  onChange={(e) => setImportQuery(e.target.value)}
                  placeholder="Search library items…"
                  className="w-field !py-2.5 !pl-10 text-[13.5px]"
                />
              </div>

              <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                {CATEGORY_ORDER.map((cat) => {
                  const catItems = visibleLibrary.filter((item) => item.type === cat);
                  const CatIcon = TYPE_ICON[cat];
                  if (catItems.length === 0) return null;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => catItems.forEach((item) => toggleSelect(item._id))}
                      className="flex items-center gap-2 rounded-xl border border-cream-300 bg-white px-3 py-2 text-[12px] font-semibold text-ink-600 transition hover:bg-cream-100"
                    >
                      <CatIcon size={14} />
                      {categoryLabel(cat)} ({catItems.length})
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                {visibleLibrary.length === 0 ? (
                  <div className="py-8 text-center text-[13px] text-ink-400">
                    No library items available to import.
                  </div>
                ) : (
                  visibleLibrary.map((item) => {
                    const ItemIcon = TYPE_ICON[item.type] || FolderOpen;
                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => toggleSelect(item._id)}
                        className={cx(
                          'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition',
                          isSelected(item._id)
                            ? 'border-brand-grape/50 bg-brand-grape/10'
                            : 'border-cream-200 bg-white hover:border-cream-300 hover:bg-cream-50'
                        )}
                      >
                        <div className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-sm', metaFor(item.type).solid)}>
                          <ItemIcon size={16} strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-ink-900">{item.name}</p>
                          <p className="truncate text-[11px] text-ink-500">{categoryLabel(item.type)}</p>
                        </div>
                        {isSelected(item._id) && <Check size={16} className="text-brand-grape" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t border-cream-200 px-6 pb-6 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[12px] font-bold text-ink-700">
                  {selectedIds.size} item{selectedIds.size === 1 ? '' : 's'} selected
                </span>
                {selectedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedIds(new Set())}
                    className="text-[11px] font-bold text-rose-600 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {selectedIds.size > 0 && (
                <>
                  <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
                      <Lock size={14} className="shrink-0" />
                      Enter your vault password to import these items.
                  </div>
                  <input
                    type="password"
                    value={importPwd}
                    onChange={(e) => setImportPwd(e.target.value)}
                    placeholder="Vault password"
                    className="w-field mt-3 text-[13px] tracking-[0.2em]"
                    onKeyDown={(e) => e.key === 'Enter' && doImport()}
                  />
                </>
              )}

              {importError && <p className="mt-2 text-[12px] text-rose-600">{importError}</p>}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setImportOpen(false)}
                  className="w-btn-soft flex-1 py-3 text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={doImport}
                  disabled={selectedIds.size === 0 || importLoading || !importPwd}
                  className="w-btn-primary flex-1 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {importLoading ? 'Importing…' : 'Import to vault'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </PageShell>
  );
};

export default LockedFolder;
