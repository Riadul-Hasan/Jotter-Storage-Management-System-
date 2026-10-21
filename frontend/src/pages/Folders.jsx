import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Folder, FolderOpen, Plus, ChevronRight, Trash2, Lock, Unlock } from 'lucide-react';
import PageShell from '../components/PageShell';
import api from '../api/axios';
import { cx, EASE } from '../utils/format';
import { EmptyState, ListSkeleton } from '../components/Skeletons';
import { CreateItemDialog, ConfirmDialog, PasswordDialog } from '../components/Dialogs';

const Folders = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, item: null });
  // Lock / unlock dialog — `mode` mirrors PasswordDialog's modes.
  const [pw, setPw] = useState({ open: false, item: null, mode: 'set', error: '', loading: false });

  const fetchFolders = useCallback(async () => {
    try {
      const res = await api.get('/items?type=folder');
      setFolders(res.data.items || []);
    } catch {
      toast.error('Could not load folders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFolders(); }, [fetchFolders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...folders].filter((f) => f.name?.toLowerCase().includes(q)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [folders, query]);

  const createFolder = async ({ type, name }) => {
    try {
      await api.post('/items', { type, name });
      toast.success('Folder created');
      setCreateOpen(false);
      fetchFolders();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not create folder');
    }
  };

  const removeFolder = (id) => {
    api.delete(`/items/${id}`).then(() => { toast.success('Folder deleted'); fetchFolders(); setConfirm({ open: false, item: null }); }).catch(() => toast.error('Could not delete folder'));
  };

  // Opens set-lock or remove-lock depending on the folder's current state.
  // `isLocked` is a computed boolean from the API (the password hash itself
  // is never sent to the client).
  const openLock = (folder) => {
    setPw({
      open: true,
      item: folder,
      mode: folder?.isLocked ? 'remove' : 'set',
      error: '',
      loading: false,
    });
  };

  const submitLock = async (password) => {
    const { item, mode } = pw;
    if (!item) return;
    setPw((s) => ({ ...s, loading: true, error: '' }));
    try {
      if (mode === 'set') {
        await api.post(`/folders/${item._id}/lock`, { password });
        toast.success('Folder locked');
      } else {
        await api.post(`/folders/${item._id}/remove-lock`, { password });
        toast.success('Lock removed');
      }
      setPw({ open: false, item: null, mode: 'set', error: '', loading: false });
      fetchFolders();
    } catch (e) {
      setPw((s) => ({ ...s, loading: false, error: e?.response?.data?.message || 'Something went wrong' }));
    }
  };

  return (
    <PageShell title="Folders" subtitle="Keep your things organised in colourful folders" accent="grape" showSearch onSearch={setQuery} onAddClick={() => setCreateOpen(true)}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-display font-bold text-ink-900 tracking-tight">Your folders</h2>
          <p className="text-[13px] text-ink-500">{folders.length} folder{folders.length === 1 ? '' : 's'}</p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="w-btn-primary px-6 py-3 text-sm"><Plus size={16} /> New folder</button>
      </motion.div>

      <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <ListSkeleton rows={3} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Folder}
            tone="grape"
            title={folders.length === 0 ? 'No folders yet' : 'No folders match that'}
            text={folders.length === 0 ? 'Create your first folder to keep related items together.' : 'Try a different search.'}
            action={<button type="button" onClick={() => setCreateOpen(true)} className="w-btn-soft mt-4 px-5 py-2.5 text-sm font-bold">Create folder</button>}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {visible.map((folder, i) => (
              <motion.div
                key={folder._id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: EASE }}
                className="group relative flex flex-col gap-3 rounded-[26px] border border-cream-200 bg-white/85 p-4 shadow-warm-xs transition-all hover:-translate-y-1 hover:border-cream-300 hover:shadow-warm-sm"
              >
                <div className="flex items-center justify-between">
                   <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-sm">
                     <FolderOpen size={20} strokeWidth={2.2} />
                   </div>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => { setConfirm({ open: true, item: folder }); }} className="p-1.5 rounded-full text-ink-400 hover:bg-rose-50 hover:text-rose-600 transition"><Trash2 size={16} /></button>
                    <button type="button" onClick={() => openLock(folder)} className="p-1.5 rounded-full text-ink-400 hover:bg-cream-100 hover:text-ink-900 transition" title={folder.isLocked ? 'Remove lock' : 'Lock folder'}>{folder.isLocked ? <Unlock size={16} /> : <Lock size={16} />}</button>
                  </div>
                </div>
                <a
                  href={`/folder/${folder._id}`}
                  className="block mt-2 flex items-center gap-2 truncate text-sm font-bold text-ink-900 hover:text-brand-grape transition"
                >
                  {folder.name} <ChevronRight size={14} className="text-ink-400 group-hover:text-brand-grape transition shrink-0" />
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {createOpen && (
        <CreateItemDialog
          open={createOpen}
          title="New folder"
          subtitle="Give your folder a name so you can find things quickly."
          types={['folder']}
          defaultType="folder"
          onSubmit={createFolder}
          onCancel={() => setCreateOpen(false)}
        />
      )}
      {confirm.open && (
        <ConfirmDialog
          open={confirm.open}
          title="Delete folder?"
          message={`“${confirm.item.name}” and everything inside will be deleted.`}
          onConfirm={() => removeFolder(confirm.item._id)}
          onCancel={() => setConfirm({ open: false, item: null })}
        />
      )}
      <PasswordDialog
        open={pw.open}
        mode={pw.mode}
        itemName={pw.item?.name || ''}
        error={pw.error}
        loading={pw.loading}
        onSubmit={submitLock}
        onCancel={() => setPw({ open: false, item: null, mode: 'set', error: '', loading: false })}
      />
    </PageShell>
  );
};

export default Folders;
