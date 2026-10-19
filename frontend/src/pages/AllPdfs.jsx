import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FileText, Plus, Search, Download } from 'lucide-react';
import PageShell from '../components/PageShell';
import ItemCard from '../components/ItemCard';
import useItemActions from '../hooks/useItemActions';
import api from '../api/axios';
import { cx, formatBytes, EASE } from '../utils/format';
import { EmptyState, ListSkeleton } from '../components/Skeletons';
import { CreateItemDialog } from '../components/Dialogs';

const AllPdfs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const fetchPdfs = useCallback(async () => {
    try {
      const res = await api.get('/items?type=pdf');
      setItems(res.data.items || []);
    } catch {
      toast.error('Could not load PDFs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPdfs(); }, [fetchPdfs]);

  // Shared actions — re-fetches the grid after every mutation.
  const { actions, dialogs } = useItemActions(fetchPdfs);

  const createPdf = async ({ type, name, file }) => {
    if (!file) { toast.error('Please choose a PDF'); return; }
    const form = new FormData();
    form.append('type', type || 'pdf');
    form.append('name', name);
    form.append('file', file);
    try {
      await api.post('/items', form);
      toast.success('PDF uploaded');
      setCreateOpen(false);
      fetchPdfs();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not upload PDF');
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...items].filter((i) => i.name?.toLowerCase().includes(q)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [items, query]);

  return (
    <PageShell title="PDFs" subtitle="Your documents, organised and ready to open" accent="rose" showSearch onSearch={setQuery} onAddClick={() => setCreateOpen(true)}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-display font-bold text-ink-900 tracking-tight">All PDFs</h2>
          <p className="text-[13px] text-ink-500">{items.length} document{items.length === 1 ? '' : 's'}</p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="w-btn-primary px-6 py-3 text-sm"><Plus size={16} /> Add PDF</button>
      </motion.div>

      <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <ListSkeleton rows={3} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={FileText}
            tone="rose"
            title={items.length === 0 ? 'No PDFs yet' : 'No PDFs match that'}
            text={items.length === 0 ? 'Upload your first PDF and it will appear here.' : 'Try a different search.'}
            action={<button type="button" onClick={() => setCreateOpen(true)} className="w-btn-soft mt-4 px-5 py-2.5 text-sm font-bold">Add PDF</button>}
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
          title="Add PDF"
          subtitle="Upload a PDF file to keep it at your fingertips."
          types={['pdf']}
          defaultType="pdf"
          onSubmit={createPdf}
          onCancel={() => setCreateOpen(false)}
        />
      )}
      {dialogs}
    </PageShell>
  );
};

export default AllPdfs;