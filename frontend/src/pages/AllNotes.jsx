import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { StickyNote, Plus, Search } from 'lucide-react';
import PageShell from '../components/PageShell';
import ItemCard from '../components/ItemCard';
import useItemActions from '../hooks/useItemActions';
import api from '../api/axios';
import { cx, EASE } from '../utils/format';
import { EmptyState, ListSkeleton } from '../components/Skeletons';
import { CreateItemDialog } from '../components/Dialogs';

const AllNotes = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await api.get('/items?type=note');
      setItems(res.data.items || []);
    } catch {
      toast.error('Could not load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // Shared actions (view/favourite/copy/rename/duplicate/share/delete/lock)
  // — re-fetches the list after every mutation.
  const { actions, dialogs } = useItemActions(fetchNotes);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...items].filter((i) => i.name?.toLowerCase().includes(q) || (i.content || '').toLowerCase().includes(q)).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [items, query]);

  const createNote = async ({ type, name, content }) => {
    try {
      await api.post('/items', { type, name, content });
      toast.success('Note created');
      setCreateOpen(false);
      fetchNotes();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not create note');
    }
  };

  return (
    <PageShell title="Notes" subtitle="Your thoughts, captured and always within reach" accent="amber" showSearch onSearch={setQuery} onAddClick={() => setCreateOpen(true)}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-display font-bold text-ink-900 tracking-tight">All notes</h2>
          <p className="text-[13px] text-ink-500">{items.length} note{items.length === 1 ? '' : 's'}</p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="w-btn-primary px-6 py-3 text-sm"><Plus size={16} /> New note</button>
      </motion.div>

      <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <ListSkeleton rows={3} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={StickyNote}
            tone="amber"
            title={items.length === 0 ? 'No notes yet' : 'No notes match that'}
            text={items.length === 0 ? 'Create your first note and start writing.' : 'Try a different search.'}
            action={<button type="button" onClick={() => setCreateOpen(true)} className="w-btn-soft mt-4 px-5 py-2.5 text-sm font-bold">Create note</button>}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {visible.map((item, i) => (
              <ItemCard
                key={item._id}
                item={item}
                index={i}
                onClick={() => actions.view(item)}
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

      {createOpen && (
        <CreateItemDialog
          open={createOpen}
          title="New note"
          subtitle="Give your note a name and write down what matters."
          types={['note']}
          defaultType="note"
          onSubmit={createNote}
          onCancel={() => setCreateOpen(false)}
        />
      )}
      {dialogs}
    </PageShell>
  );
};

export default AllNotes;