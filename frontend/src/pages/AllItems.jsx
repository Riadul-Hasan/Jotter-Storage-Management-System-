import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { LayoutGrid, List, Search, StickyNote, Image as ImageIcon, FileText, FolderOpen, X, Grid3X3, Plus } from 'lucide-react';
import PageShell from '../components/PageShell';
import ItemCard from '../components/ItemCard';
import useItemActions from '../hooks/useItemActions';
import api from '../api/axios';
import { cx, formatBytes, formatDate, metaFor } from '../utils/format';
import { EmptyState, ListSkeleton } from '../components/Skeletons';

const TYPE_TABS = [
  { key: 'all', label: 'All', icon: LayoutGrid },
  { key: 'note', label: 'Notes', icon: StickyNote },
  { key: 'image', label: 'Images', icon: ImageIcon },
  { key: 'pdf', label: 'PDFs', icon: FileText },
  { key: 'folder', label: 'Folders', icon: FolderOpen },
];

const iconFor = (type) => {
  if (type === 'note') return StickyNote;
  if (type === 'image') return ImageIcon;
  if (type === 'pdf') return FileText;
  if (type === 'folder') return FolderOpen;
  return FileText;
};

const labelFor = (type) => {
  if (type === 'note') return 'Note';
  if (type === 'image') return 'Image';
  if (type === 'pdf') return 'PDF';
  if (type === 'folder') return 'Folder';
  return type;
};

const AllItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const fetchAllItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/items');
      setItems(res.data.items || []);
    } catch {
      toast.error('Could not load items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllItems();
  }, [fetchAllItems]);

  const { actions, dialogs } = useItemActions(fetchAllItems);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => {
        if (activeTab !== 'all' && i.type !== activeTab) return false;
        if (!q) return true;
        return i.name?.toLowerCase().includes(q) || (i.content || '').toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const aTime = new Date(b.updatedAt || b.createdAt).getTime();
        const bTime = new Date(a.updatedAt || a.createdAt).getTime();
        return aTime - bTime;
      });
  }, [items, query, activeTab]);

  const counts = useMemo(() => {
    const total = items.length;
    return {
      all: total,
      notes: items.filter((i) => i.type === 'note').length,
      images: items.filter((i) => i.type === 'image').length,
      pdfs: items.filter((i) => i.type === 'pdf').length,
      folders: items.filter((i) => i.type === 'folder').length,
    };
  }, [items]);

  return (
    <PageShell
      title="All items"
      subtitle={`Everything in your library — ${counts.all} item${counts.all === 1 ? '' : 's'}`}
      accent="grape"
      showSearch
      onSearch={setQuery}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-display font-bold text-ink-900 tracking-tight">All items</h2>
          <p className="text-[13px] text-ink-500">{counts.all} item{counts.all === 1 ? '' : 's'} across notes, images, PDFs and folders</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all items…"
              className="w-56 lg:w-72 rounded-full border border-cream-300 bg-white/80 py-2.5 pl-10 pr-4 text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-grape/40"
            />
          </div>
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-white/80 px-4 py-2 text-xs font-bold text-ink-600 hover:border-cream-400"
          >
            {viewMode === 'grid' ? <List size={14} /> : <Grid3X3 size={14} />}
            {viewMode === 'grid' ? 'List' : 'Grid'}
          </button>
        </div>
      </motion.div>

      <div className="mb-5 flex flex-wrap gap-2">
        {TYPE_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition',
              activeTab === key
                ? 'bg-ink-900 text-white'
                : 'border border-cream-300 bg-white/80 text-ink-600 hover:border-cream-400'
            )}
          >
            <Icon size={13} />
            {label}
            <span className="text-[10px] opacity-70">({counts[key] || 0})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={X}
          tone="coral"
          title={query ? 'No matches' : 'No items yet'}
          text={query
            ? 'Try a different search term.'
            : 'Create your first item with the button above and it will appear here.'}
          action={<button type="button" className="w-btn-primary mt-4 px-5 py-2.5 text-sm"><Plus size={15} /> Create item</button>}
        />
      ) : viewMode === 'grid' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
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
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-cream-200 text-xs font-bold uppercase tracking-wider text-ink-500">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Size</th>
              </tr>
            </thead>
             <tbody>
                 {filtered.map((item, i) => {
                   const Icon = iconFor(item.type);
                   return (
                     <motion.tr
                       key={item._id}
                       initial={{ opacity: 0, y: 8 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.4) }}
                       className="border-b border-cream-100 transition hover:bg-cream-50/60"
                     >
                       <td className="px-4 py-3">
                         <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold', metaFor(item.type).soft)}>
                           <Icon size={12} />
                           {labelFor(item.type)}
                         </span>
                       </td>
                       <td className="px-4 py-3 text-sm font-semibold text-ink-900">{item.name}</td>
                       <td className="px-4 py-3 text-[12px] text-ink-500">{formatDate(item.updatedAt || item.createdAt)}</td>
                       <td className="px-4 py-3 text-right text-[12px] text-ink-500">{item.fileSize ? formatBytes(item.fileSize) : '—'}</td>
                     </motion.tr>
                   );
                 })}
             </tbody>

          </table>
        </motion.div>
      )}

      {dialogs}
    </PageShell>
  );
};

export default AllItems;
