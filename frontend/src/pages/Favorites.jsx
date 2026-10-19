import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Heart, Sparkles, FolderOpen, FileText, Image as ImageIcon, StickyNote, ArrowUpDown, Plus } from 'lucide-react';
import PageShell from '../components/PageShell';
import ItemCard from '../components/ItemCard';
import useItemActions from '../hooks/useItemActions';
import { ListSkeleton, EmptyState } from '../components/Skeletons';
import api from '../api/axios';
import { cx } from '../utils/format';
import { CreateItemDialog } from '../components/Dialogs';

const FILTERS = [
  { key: 'all', label: 'Everything', icon: Sparkles },
  { key: 'note', label: 'Notes', icon: StickyNote },
  { key: 'image', label: 'Images', icon: ImageIcon },
  { key: 'pdf', label: 'PDFs', icon: FileText },
  { key: 'folder', label: 'Folders', icon: FolderOpen },
];

const Favorites = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [createOpen, setCreateOpen] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await api.get('/items?favorite=true');
      setItems(res.data.items || []);
    } catch {
      toast.error('Could not load favourites');
    } finally {
      setLoading(false);
    }
  }, []);

  const { actions, dialogs } = useItemActions(fetchFavorites);

  const counts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      },
      { note: 0, image: 0, pdf: 0, folder: 0 }
    );
  }, [items]);


  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items;
    if (filter !== 'all') list = list.filter((i) => i.type === filter);
    if (q) list = list.filter((i) => i.name?.toLowerCase().includes(q));
    return [...list].sort((a, b) =>
      sort === 'newest'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : (a.name || '').localeCompare(b.name || '')
    );
  }, [items, filter, query, sort]);

  const createItem = async ({ type, name, content, file }) => {
    try {
      if (file) {
        const fd = new FormData();
        fd.append('type', type);
        fd.append('name', name);
        fd.append('file', file);
        await api.post('/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/items', { type, name, content });
      }
      toast.success('Created');
      setCreateOpen(false);
      fetchFavorites();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not create item');
    }
  };

  return (
    <PageShell
      title="Favourites"
      subtitle="Everything you starred, kept in one warm place"
      accent="rose"
      showSearch
      onSearch={setQuery}
      onAddClick={() => setCreateOpen(true)}
    >
      {/* ---------- hero banner ---------- */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-br from-brand-rose via-pink-500 to-brand-grape p-6 text-white shadow-warm-lg sm:p-8"
      >
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-brand-sun/30 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]">
              <Heart size={12} className="fill-white" /> Starred
            </span>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              {items.length}
              <span className="ml-2 text-lg font-semibold text-white/80">
                item{items.length === 1 ? '' : 's'} you love
              </span>
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-white/85">
              Unstar anything with a single tap and it slides right back into your library.
            </p>
          </div>

          <div className="flex gap-2">
            {[
              { label: 'Notes', value: counts.note, icon: StickyNote },
              { label: 'Images', value: counts.image, icon: ImageIcon },
              { label: 'PDFs', value: counts.pdf, icon: FileText },
            ].map((s) => (
              <motion.div
                key={s.label}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-white/25 bg-white/15 px-3.5 py-2.5 text-center backdrop-blur-md"
              >
                <s.icon size={15} className="mx-auto mb-1" />
                <p className="text-lg font-extrabold leading-none">{s.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/75">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ---------- filters ---------- */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cx('relative', filter === f.key && 'text-white')}
          >
            {filter === f.key && (
              <motion.span
                layoutId="fav-chip"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-rose to-brand-grape shadow-[0_8px_20px_rgba(244,63,94,0.3)]"
              />
            )}
            <span
              className={cx(
                'relative flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition',
                filter === f.key
                  ? 'border-transparent'
                  : 'border-cream-300 bg-white/80 text-ink-600 hover:border-cream-400'
              )}
            >
              <f.icon size={13} />
              {f.label}
              <span
                className={cx(
                  'rounded-full px-1.5 text-[10px]',
                  filter === f.key ? 'bg-white/25 text-white' : 'bg-cream-100 text-ink-500'
                )}
              >
                {counts[f.key]}
              </span>
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setSort((s) => (s === 'newest' ? 'name' : 'newest'))}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-cream-300 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-ink-600 transition hover:border-cream-400"
        >
          <ArrowUpDown size={13} />
          {sort === 'newest' ? 'Newest' : 'A → Z'}
        </button>
      </div>

      {/* ---------- list ---------- */}
      <div className="mt-5">
        {loading ? (
          <ListSkeleton rows={4} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Heart}
            tone="rose"
            title={items.length === 0 ? 'No favourites yet' : 'Nothing matches that'}
            text={
              items.length === 0
                ? 'Tap the heart on any item in your library and it will show up here instantly.'
                : 'Try a different search or filter — your starred items are still safe.'
            }
          />
        ) : (
          <div className="grid gap-3.5 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {visible.map((item, i) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  index={i}
                  onClick={actions.view}
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
          </div>
        )}
      </div>

       {dialogs}
       <CreateItemDialog
         open={createOpen}
         title="New item"
         subtitle="Note, image, PDF or folder — pick a type and give it a name."
         types={['note', 'image', 'pdf', 'folder']}
         defaultType="note"
         onSubmit={createItem}
         onCancel={() => setCreateOpen(false)}
       />
     </PageShell>

  );
};

export default Favorites;