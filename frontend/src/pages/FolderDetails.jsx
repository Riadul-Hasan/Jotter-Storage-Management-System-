import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FolderOpen, ChevronLeft, Plus, Trash2, Edit2, Lock, Sparkles } from 'lucide-react';
import PageShell from '../components/PageShell';
import ItemCard from '../components/ItemCard';
import useItemActions from '../hooks/useItemActions';
import api from '../api/axios';
import { cx, formatDate, metaFor, EASE } from '../utils/format';
import { EmptyState, ListSkeleton } from '../components/Skeletons';
import { CreateItemDialog, ConfirmDialog, PromptDialog } from '../components/Dialogs';

const FolderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [folder, setFolder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirm, setConfirm] = useState({ open: false });
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [unlockPwd, setUnlockPwd] = useState('');
  const [unlockError, setUnlockError] = useState('');

  const fetchContents = useCallback(async () => {
    try {
      const res = await api.get(`/folders/${id}/contents`);
      setFolder(res.data.folder);
      setItems(res.data.items || []);
    } catch {
      toast.error('Could not load folder contents');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchContents(); }, [fetchContents]);

  const goBack = () => navigate('/folders');

  const visible = useMemo(() => [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [items]);

  // Every card action (view/favourite/copy/rename/duplicate/share/delete/lock)
  // comes from the shared hook; `fetchContents` re-runs after each mutation so
  // the folder view always reflects the change.
  const { actions, dialogs } = useItemActions(fetchContents);

  // Opens the shared PromptDialog from useItemActions (no local dialog, so no
  // stale-state race between the typed value and the API call).
  const openRename = () => folder && actions.rename(folder);

  const deleteFolder = async () => {
    try {
      await api.delete(`/items/${id}`);
      toast.success('Folder deleted');
      setConfirm({ open: false });
      navigate('/folders');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not delete');
    }
  };

  const unlockFolder = async () => {
    try {
      const res = await api.post(`/folders/${id}/unlock`, { password: unlockPwd });
      toast.success('Folder unlocked');
      setUnlockOpen(false);
      setUnlockPwd('');
      setUnlockError('');
      // The unlock response already carries the folder + its contents, so the
      // locked banner disappears immediately without another round-trip.
      if (res.data?.folder) setFolder(res.data.folder);
      if (Array.isArray(res.data?.items)) setItems(res.data.items);
      else fetchContents();
    } catch (e) {
      setUnlockError(e?.response?.data?.message || 'Incorrect password');
    }
  };

  const createItem = async ({ type, name, content, file }) => {
    const form = new FormData();
    form.append('type', type);
    form.append('name', name);
    if (content !== undefined) form.append('content', content);
    if (file) form.append('file', file);
    // THE FIX — without this the backend saves the item at root level and
    // the folder looks empty even though Home/Recent shows the upload.
    form.append('parentFolder', id);
    try {
      await api.post('/items', form);
      toast.success('Item added to folder');
      setCreateOpen(false);
      fetchContents();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not add item');
    }
  };

  return (
    <PageShell
      title={folder ? folder.name : 'Folder'}
      subtitle={folder ? `Folder · ${items.length} item${items.length === 1 ? '' : 's'}` : 'Loading folder…'}
      accent="mint"
      back
    onAddClick={() => setCreateOpen(true)}
    >
      {loading && <ListSkeleton rows={3} />}
      {!loading && folder && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <button type="button" onClick={goBack} className="w-9 h-9 rounded-xl border border-cream-300 bg-white flex items-center justify-center text-ink-700 hover:bg-cream-100 transition"><ChevronLeft size={16} /></button>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm" style={{ background: metaFor('folder').solid }}>
                <FolderOpen size={18} strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-ink-900 leading-tight">{folder.name}</h2>
                <p className="text-[12px] text-ink-500">{items.length} item{items.length === 1 ? '' : 's'} · {formatDate(folder.updatedAt || folder.createdAt)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setCreateOpen(true)} className="w-btn-soft px-4 py-2 text-sm font-bold"><Plus size={15} /> Add item</button>
              <button type="button" onClick={openRename} className="w-btn-soft px-4 py-2 text-sm font-bold"><Edit2 size={15} /> Rename</button>
              <button type="button" onClick={() => setConfirm({ open: true })} className="w-btn-soft px-4 py-2 text-sm font-bold text-rose-600"><Trash2 size={15} /> Delete</button>
            </div>
          </motion.div>

          {folder.isLocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-[26px] border border-cream-200 bg-white/90 p-6 sm:p-8 shadow-warm-sm text-center"
            >
              <div className="grid h-14 w-14 mx-auto mb-4 place-items-center rounded-full bg-gradient-to-br from-brand-grape to-purple-500 text-white shadow-[0_8px_20px_rgba(139,92,246,0.3)]"><Lock size={24} strokeWidth={2} /></div>
              <h3 className="text-lg font-bold text-ink-900 mb-2">This folder is locked</h3>
              <p className="text-ink-500 mb-6">Enter the folder password to view its contents.</p>
              {unlockOpen ? (
                <div className="space-y-3">
                  <input type="password" value={unlockPwd} onChange={(e) => setUnlockPwd(e.target.value)} placeholder="Folder password" className="w-field" />
                  {unlockError && <p className="text-[12px] text-rose-600">{unlockError}</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setUnlockOpen(false)} className="flex-1 w-btn-soft py-2.5 text-sm font-bold">Cancel</button>
                    <button type="button" onClick={unlockFolder} className="flex-1 w-btn-primary py-2.5 text-sm font-bold">Unlock</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => { setUnlockPwd(''); setUnlockError(''); setUnlockOpen(true); }} className="w-btn-primary px-7 py-3 text-sm">Unlock folder</button>
              )}
            </motion.div>
          )}

          {!folder.isLocked && (
            <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
              {visible.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  tone="mint"
                  title="Folder is empty"
                  text="Add a note, image or PDF and it will appear here."
                  action={<button type="button" onClick={() => setCreateOpen(true)} className="w-btn-soft mt-4 px-5 py-2.5 text-sm font-bold">Add item</button>}
                />
              ) : (
                <AnimatePresence mode="popLayout">
                  {visible.map((item, i) => (
                    <ItemCard
                      key={item._id}
                      item={item}
                      index={i}
                      onClick={() => item.type === 'folder' ? navigate(`/folder/${item._id}`) : actions.view(item)}
                      onFavorite={actions.toggleFavorite}
                      onCopy={actions.copy}
                      onRename={actions.rename}
                      onDuplicate={actions.duplicate}
                      onDelete={actions.remove}
                      onShare={actions.share}
                      onLock={actions.lockFolder}
                      onSecure={actions.secureItem}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          )}
        </>
      )}

      {createOpen && (
        <CreateItemDialog
          open={createOpen}
          title="Add item"
          subtitle="Add a new note, image or PDF to this folder."
          types={['note', 'image', 'pdf']}
          defaultType="note"
          onSubmit={createItem}
          onCancel={() => setCreateOpen(false)}
        />
      )}
      {confirm.open && (
        <ConfirmDialog
          open={confirm.open}
          title="Delete folder?"
          message={`“${folder.name}” and everything inside will be deleted.`}
          onConfirm={deleteFolder}
          onCancel={() => setConfirm({ open: false })}
        />
      )}
      {/* Shared view/rename/duplicate/share/lock dialogs from useItemActions */}
      {dialogs}
    </PageShell>
  );
};

export default FolderDetails;
