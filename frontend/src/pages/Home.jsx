import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Plus, FileText, Image as ImageIcon, File, Folder as FolderIcon, Clock, Star, ChevronRight, ArrowUpRight, Search, X, Shield, Zap, Sparkles, LayoutGrid, HardDrive, TrendingUp, Layers, Rocket, FolderOpen, StickyNote, Heart, Calendar, Home as HomeIcon } from 'lucide-react';
import api from '../api/axios';
import PageShell from '../components/PageShell';
import ItemCard from '../components/ItemCard';
import useItemActions from '../hooks/useItemActions';
import { cx, EASE, formatBytes, relTime, metaFor, initialsOf } from '../utils/format';
import { EmptyState, ListSkeleton, Stagger } from '../components/Skeletons';
import { CreateItemDialog, ConfirmDialog, PasswordDialog } from '../components/Dialogs';

/* ------------------------------------------------------------------ */
/*  Design tokens & small helpers                                      */
/* ------------------------------------------------------------------ */

const rise = (delay = 0, inView = true) => ({
  initial: { opacity: 0, y: 26 },
  ...(inView ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 } } : { animate: { opacity: 1, y: 0 } }),
  transition: { duration: 0.6, delay, ease: EASE },
});

const staggerItem = { hidden: { opacity: 0, y: 24, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } } };

const formatBytesFriendly = (bytes) => { if (!bytes || bytes <= 0) return '0 B'; const k = 1024, sizes = ['B','KB','MB','GB']; const i = Math.floor(Math.log(bytes)/Math.log(k)); return parseFloat((bytes/Math.pow(k,i)).toFixed(2)) + ' ' + sizes[i]; };


const TYPE_CONFIG = {
  note: { icon: StickyNote, label: 'Notes', route: '/notes', accent: 'amber' },
  image: { icon: ImageIcon, label: 'Images', route: '/images', accent: 'sky' },
  pdf: { icon: FileText, label: 'PDFs', route: '/pdfs', accent: 'rose' },
  folder: { icon: FolderOpen, label: 'Folders', route: '/folders', accent: 'grape' },
};

const QUICK_LINKS = [
  { label: 'Calendar', desc: 'Browse by day', route: '/calendar', Icon: Calendar, accent: 'sky' },
  { label: 'Favourites', desc: 'Starred items', route: '/favorites', Icon: Heart, accent: 'rose' },
  { label: 'Folders', desc: 'Stay organised', route: '/folders', Icon: FolderOpen, accent: 'grape' },
  { label: 'Vault', desc: 'Private & locked', route: '/locked-folder', Icon: Shield, accent: 'mint' },
];

const TIPS = [
  'Tap the heart on any card to pin it to Favourites.',
  'Lock a folder to hide it behind a password.',
  'Your private vault never appears in search or recents.',
  'Rename anything in one tap — no more messy file names.',
];

const SectionHeading = ({ eyebrow, title, desc, action }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-200 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
        <Sparkles size={12} /> {eyebrow}
      </span>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink-900">{title}</h2>
      {desc && <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-ink-500">{desc}</p>}
    </div>
    {action}
  </div>
);

const StatCard = ({ label, value, sub, Icon, accent, onClick, index = 0 }) => (
  <motion.button
    type="button"
    onClick={onClick}
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5, delay: index * 0.06, ease: EASE }}
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
    className="group rounded-[26px] border border-cream-200 bg-white/85 p-4 text-left shadow-warm-xs backdrop-blur-sm transition-shadow hover:shadow-warm-md"
  >
    <span className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-warm-sm"
      style={{ backgroundImage: accent === 'amber' ? 'linear-gradient(135deg,#fbbf24,#f97316)' : accent === 'sky' ? 'linear-gradient(135deg,#38bdf8,#3b82f6)' : accent === 'rose' ? 'linear-gradient(135deg,#fb7185,#e11d48)' : accent === 'grape' ? 'linear-gradient(135deg,#a78bfa,#7c3aed)' : 'linear-gradient(135deg,#ff6b5b,#ff9f43)' }}>
      <Icon size={19} strokeWidth={2.2} />
    </span>
    <p className="font-display text-2xl font-extrabold tracking-tight text-ink-900">{value}</p>
    <p className="text-[12px] font-bold text-ink-700">{label}</p>
    {sub && <p className="mt-0.5 text-[11.5px] text-ink-500">{sub}</p>}
  </motion.button>
);

/* ------------------------------------------------------------------ */
/*  Home — dashboard                                                   */
/* ------------------------------------------------------------------ */
const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);

  const fetchAll = useCallback(async () => {
    setStatsLoading(true);
    setRecentLoading(true);
    try {
      const [s, r] = await Promise.all([
        api.get('/items/stats'),
        api.get('/items/recent?limit=8'),
      ]);
      setStats(s.data?.stats || null);
      setRecent(r.data?.items || []);
    } catch {
      toast.error('Could not load your dashboard');
    } finally {
      setStatsLoading(false);
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    api.get('/auth/me').then((res) => {
      setUserName(res.data?.user?.name || '');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const { actions, dialogs } = useItemActions(fetchAll);

  const counts = useMemo(() => ({
    notes: stats?.notes?.count || 0,
    images: stats?.images?.count || 0,
    pdfs: stats?.pdfs?.count || 0,
    folders: stats?.folders?.count || 0,
  }), [stats]);

  const totalItems = counts.notes + counts.images + counts.pdfs + counts.folders;
  const used = stats?.usedStorage || 0;
  const total = stats?.totalStorage || 15 * 1024 * 1024 * 1024;
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  const firstName = (userName || 'there').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

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
      fetchAll();
      // Always land on the Home "Recently updated" rail so the freshly
      // created item is the first thing the user sees.
      navigate('/home');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not create item');
    }
  };

  const filteredRecent = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recent;
    return recent.filter((i) => i.name?.toLowerCase().includes(q));
  }, [recent, query]);
  
  const viewAllItems = () => {
    // "View all" now shows EVERY item across the entire system
    // (notes, images, PDFs and folders) — not just folders.
    navigate('/items');
  };

  const hourNow = new Date().getHours();
  const greetIcon = hourNow < 12 ? 'morning' : hourNow < 18 ? 'afternoon' : 'evening';

  return (
    <PageShell title={`Hello, ${firstName}`} subtitle={`${greeting} — here is your library at a glance`} accent="coral" showSearch onSearch={setQuery} onAddClick={() => setCreateOpen(true)}>
      {/* ---------- hero ---------- */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="relative overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-br from-brand-coral via-brand-tangerine to-brand-sun p-6 text-white shadow-warm-lg sm:p-8"
      >
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]">
              <Zap size={12} /> {greetIcon} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              {greeting}, {firstName}
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-white/85">
              {totalItems === 0 ? 'Your library is empty — create your first note, image, PDF or folder to get started.' : `You have ${totalItems} item${totalItems === 1 ? '' : 's'} · ${formatBytes(used)} used of ${formatBytes(total)}.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-ink-900 shadow-warm-md transition hover:scale-[1.03]">
                <Plus size={16} strokeWidth={2.6} /> New item
              </button>
              <button type="button" onClick={() => navigate('/folders')} className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/25">
                <LayoutGrid size={15} /> Browse all <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
      <div className="w-full max-w-xs rounded-[26px] border border-white/50 bg-white p-4 shadow-warm-md shadow-cream-50/40 sm:p-5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 text-ink-700"><HardDrive size={14} className="text-brand-grape" /> Storage</span>
          <span className="bg-cream-100 px-2.5 py-0.5 rounded-full text-ink-700">{pct}% used</span>
        </div>
        <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-cream-100">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: EASE }} className="h-full rounded-full bg-gradient-to-r from-brand-coral to-brand-tangerine shadow-[0_0_10px_rgba(255,107,91,0.45)]" />
        </div>
        <p className="mt-2 text-center text-sm font-semibold text-ink-800">{formatBytes(used)} of {formatBytes(total)}</p>
        <div className="mt-3 flex items-center justify-center gap-3 text-xs font-bold">
          <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 text-ink-700"><Layers size={11} className="text-brand-grape" /> {counts.folders} folders</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 text-ink-700"><TrendingUp size={11} className="text-brand-sky" /> {counts.notes} notes</span>
        </div>
      </div>

        </div>
      </motion.section>

      {/* ---------- stats ---------- */}
      <section className="mt-8">
        <SectionHeading eyebrow="Overview" title="Your library" desc="Counts update live as you add notes, images, PDFs and folders." />
        {statsLoading ? (
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (<div key={i} className="w-skeleton h-36 rounded-[26px]" />))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            {Object.entries(TYPE_CONFIG).map(([key, cfg], i) => (
              <StatCard key={key} label={cfg.label} value={counts[key] ?? 0}
                sub={key === 'note' ? 'quick thoughts' : key === 'image' ? 'visual memories' : key === 'pdf' ? 'documents' : 'collections'}
                Icon={cfg.icon} accent={cfg.accent} index={i} onClick={() => navigate(cfg.route)} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- quick links ---------- */}
      <section className="mt-8">
        <SectionHeading eyebrow="Jump back in" title="Quick actions" desc="One tap to your calendar, favourites, folders or private vault." />
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {QUICK_LINKS.map((q, i) => (
            <motion.button key={q.route + q.label} type="button" onClick={() => navigate(q.route)}
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-3 rounded-[26px] border border-cream-200 bg-white/85 p-4 text-left shadow-warm-xs backdrop-blur-sm transition-shadow hover:shadow-warm-md">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white shadow-warm-sm"
                style={{ backgroundImage: q.accent === 'sky' ? 'linear-gradient(135deg,#38bdf8,#3b82f6)' : q.accent === 'rose' ? 'linear-gradient(135deg,#fb7185,#e11d48)' : q.accent === 'grape' ? 'linear-gradient(135deg,#a78bfa,#7c3aed)' : 'linear-gradient(135deg,#34d399,#059669)' }}>
                <q.Icon size={19} strokeWidth={2.2} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-extrabold text-ink-900">{q.label}</span>
                <span className="block text-[12px] text-ink-500">{q.desc}</span>
              </span>
              <ChevronRight size={15} className="ml-auto shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-ink-600" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* ---------- recents ---------- */}
      <section className="mt-10">
        <SectionHeading eyebrow="Fresh and recent" title="Recently updated"
          desc={query.trim() ? `Filtering by "${query.trim()}"` : 'Your latest edits across notes, images, PDFs and folders.'}
          action={(
           <div className="flex gap-2">
             {query.trim() && (
               <button type="button" onClick={() => setQuery('')} className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white/80 px-4 py-2 text-xs font-bold text-ink-600 hover:border-cream-400">
                 <X size={13} /> Clear
               </button>
             )}
             <button type="button" onClick={viewAllItems} className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-ink-700">
               View all <ChevronRight size={13} />
             </button>
           </div>

          )} />
        {recentLoading ? (
          <ListSkeleton rows={4} />
        ) : filteredRecent.length === 0 ? (
          <EmptyState icon={Clock} tone="coral"
            title={recent.length === 0 ? 'Nothing here yet' : 'No matches'}
            text={recent.length === 0 ? 'Create your first item with the button above and it will appear here.' : 'Try a different search.'}
            action={recent.length === 0 ? (<button type="button" onClick={() => setCreateOpen(true)} className="w-btn-primary mt-4 px-5 py-2.5 text-sm"><Plus size={15} /> Create item</button>) : undefined} />
        ) : (
          <Stagger className="grid gap-3.5 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredRecent.map((item, i) => (
                <ItemCard key={item._id} item={item} index={i}
                  onClick={actions.view} onFavorite={actions.toggleFavorite} onCopy={actions.copy}
                  onRename={actions.rename} onDuplicate={actions.duplicate} onDelete={actions.remove}
                  onShare={actions.share} onLock={actions.lockFolder} onSecure={actions.secureItem} />
              ))}
            </AnimatePresence>
          </Stagger>
        )}
      </section>

      {/* ---------- tip ---------- */}
      <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.55, ease: EASE }}
        className="mt-10 flex items-start gap-3.5 rounded-[28px] border border-cream-200 bg-gradient-to-br from-white to-cream-100/70 p-5 shadow-warm-xs">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-grape to-purple-500 text-white shadow-warm-sm">
          <Sparkles size={19} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500">Jotter tip</p>
          <AnimatePresence mode="wait">
            <motion.p key={tipIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }} className="mt-1 text-[14px] font-medium leading-relaxed text-ink-800">
              {TIPS[tipIdx]}
            </motion.p>
          </AnimatePresence>
          <div className="mt-2.5 flex gap-1.5">
            {TIPS.map((_, i) => (
              <button key={i} type="button" aria-label={`Tip ${i + 1}`} onClick={() => setTipIdx(i)}
                className={cx('h-1.5 rounded-full transition-all', i === tipIdx ? 'w-6 bg-ink-900' : 'w-1.5 bg-ink-200 hover:bg-ink-400')} />
            ))}
          </div>
        </div>
      </motion.section>

      <CreateItemDialog open={createOpen} title="New item" subtitle="Note, image, PDF or folder — pick a type and give it a name."
        types={['note', 'image', 'pdf', 'folder']} defaultType="note" onSubmit={createItem} onCancel={() => setCreateOpen(false)} />
      {dialogs}
    </PageShell>
  );
}

export default Home;
