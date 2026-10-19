import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Image as ImageIcon, Plus, Search } from 'lucide-react';
import PageShell from '../components/PageShell';
import ItemCard from '../components/ItemCard';
import useItemActions from '../hooks/useItemActions';
import api from '../api/axios';
import { cx, EASE } from '../utils/format';
import { EmptyState, ListSkeleton } from '../components/Skeletons';
import { CreateItemDialog } from '../components/Dialogs';

const AllImages = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const fetchImages = useCallback(async () => {
    try {
      const res = await api.get('/items?type=image');
      setItems(res.data.items || []);
    } catch {
      toast.error('Could not load images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  // Shared actions — re-fetches the grid after every mutation.
  const { actions, dialogs } = useItemActions(fetchImages);

  const createImage = async ({ type, name, file }) => {
    if (!file) { toast.error('Please choose an image'); return; }
    const form = new FormData();
    form.append('type', type || 'image');
    form.append('name', name);
    form.append('file', file);
    try {
      await api.post('/items', form);
      toast.success('Image uploaded');
      setCreateOpen(false);
      fetchImages();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not upload image');
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...items].filter((i) => i.name?.toLowerCase().includes(q)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [items, query]);

  return (
    <PageShell title="Images" subtitle="Your photos and pictures, beautifully laid out" accent="sky" showSearch onSearch={setQuery} onAddClick={() => setCreateOpen(true)}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-display font-bold text-ink-900 tracking-tight">All images</h2>
          <p className="text-[13px] text-ink-500">{items.length} image{items.length === 1 ? '' : 's'}</p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="w-btn-primary px-6 py-3 text-sm"><Plus size={16} /> Add image</button>
      </motion.div>

      <div className="grid gap-3.5 md:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          <ListSkeleton rows={3} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            tone="sky"
            title={items.length === 0 ? 'No images yet' : 'No images match that'}
            text={items.length === 0 ? 'Upload your first image and it will appear here.' : 'Try a different search.'}
            action={<button type="button" onClick={() => setCreateOpen(true)} className="w-btn-soft mt-4 px-5 py-2.5 text-sm font-bold">Add image</button>}
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
          title="Add image"
          subtitle="Upload an image file to keep it safe."
          types={['image']}
          defaultType="image"
          onSubmit={createImage}
          onCancel={() => setCreateOpen(false)}
        />
      )}
      {dialogs}
    </PageShell>
  );
};

export default AllImages;