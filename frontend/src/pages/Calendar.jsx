import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Calendar as CalIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Image as ImageIcon,
  StickyNote,
  FileText,
  FolderOpen,
  Clock,
} from 'lucide-react';
import PageShell from '../components/PageShell';
import api from '../api/axios';
import { cx, dayKey, formatDate, relTime, metaFor } from '../utils/format';
import { EmptyState, ListSkeleton } from '../components/Skeletons';
import { ConfirmDialog, CreateItemDialog } from '../components/Dialogs';
import useItemActions from '../hooks/useItemActions';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const TYPE_ICON = {
  note: StickyNote,
  image: ImageIcon,
  pdf: FileText,
  folder: FolderOpen,
};

const Calendar = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, item: null });
  const [createOpen, setCreateOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.get('/items');
      setItems(res.data.items || []);
    } catch {
      toast.error('Could not load your library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const byDay = useMemo(() => {
    const map = {};
    items.forEach((it) => {
      const k = dayKey(it.createdAt);
      (map[k] || (map[k] = [])).push(it);
    });
    return map;
  }, [items]);

  const days = [];
  for (let i = firstDay - 1; i >= 0; i--) days.push({ date: new Date(year, month, daysInPrev - i), fromPrev: true });
  for (let d = 1; d <= daysInMonth; d++) days.push({ date: new Date(year, month, d) });
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) days.push({ date: new Date(year, month + 1, d), fromNext: true });

  const todayKey = dayKey(new Date());
  const selectedKey = selectedDay ? dayKey(selectedDay.date) : null;
  const dayItems = selectedKey ? (byDay[selectedKey] || []) : [];

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => setViewDate(new Date());

  const { actions, dialogs } = useItemActions(fetchItems);

  const removeItem = (id) => {
    api.delete(`/items/${id}`)
      .then(() => { toast.success('Removed from calendar'); fetchItems(); setConfirm({ open: false, item: null }); })
      .catch(() => toast.error('Could not remove item'));
  };

  // Creates an item stamped with TODAY so it lands on the current calendar
  // day (the backend sets createdAt = now).
  const createItem = async ({ type, name, content, file }) => {
    try {
      if (file) {
        const form = new FormData();
        form.append('type', type);
        form.append('name', name);
        form.append('file', file);
        await api.post('/items', form);
      } else {
        await api.post('/items', { type, name, content });
      }
      toast.success('Added to today');
      setCreateOpen(false);
      fetchItems();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not create item');
    }
  };

  return (
    <PageShell title="Calendar" subtitle="Your notes and memories, day by day" accent="sky" showSearch onAddClick={() => setCreateOpen(true)}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={prevMonth} className="w-10 h-10 rounded-2xl border border-cream-300 bg-white flex items-center justify-center text-ink-700 hover:bg-cream-100 transition"><ChevronLeft size={18} /></button>
          <h2 className="text-2xl font-display font-bold text-ink-900 tracking-tight">{MONTHS[month]} {year}</h2>
          <button type="button" onClick={nextMonth} className="w-10 h-10 rounded-2xl border border-cream-300 bg-white flex items-center justify-center text-ink-700 hover:bg-cream-100 transition"><ChevronRight size={18} /></button>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={goToday} className="px-3 py-1.5 rounded-xl border border-cream-300 bg-white text-[11px] font-bold text-ink-700 hover:bg-cream-100 transition uppercase tracking-wider">Today</button>
          <button type="button" onClick={() => setCreateOpen(true)} className="w-btn-soft px-4 py-2 text-[13px]"><Plus size={15} /> Add to today</button>
        </div>
      </motion.div>

      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[11px] font-bold uppercase tracking-wider text-ink-400">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const key = dayKey(day.date);
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const list = byDay[key] || [];
          const curMonth = !day.fromPrev && !day.fromNext;
          return (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.012 }}
              onClick={() => { if (!curMonth) return; setSelectedDay(day); }}
              className={cx(
                'aspect-square min-h-[76px] rounded-3xl border flex flex-col items-center justify-center p-1.5 text-[12px] transition-all cursor-pointer select-none group',
                !curMonth && 'border-transparent text-ink-200 cursor-default',
                isSelected && 'bg-gradient-to-br from-brand-sky to-blue-500 text-white shadow-[0_10px_24px_rgba(59,163,255,0.35)]',
                isToday && !isSelected && 'border-brand-sky bg-brand-sky/15 text-brand-sky font-bold',
                list.length > 0 && !isSelected && !isToday && 'bg-white/60 border-cream-300',
                !list.length && !isSelected && !isToday && 'bg-white/50 border-cream-200 hover:bg-cream-100 hover:border-cream-300'
              )}
            >
              <span className={cx('font-semibold', isSelected ? 'text-white' : (isToday ? 'text-brand-sky' : (!curMonth ? 'text-ink-300' : 'text-ink-700')))}>{day.date.getDate()}</span>
              {list.length > 0 && !isSelected && (
                <div className="mt-1 flex gap-1">
                  {list.slice(0, 3).map((it) => (
                    <span key={it._id} className="w-2 h-2 rounded-full" style={{ backgroundColor: metaFor(it.type).dot }} />
                  ))}
                  {list.length > 3 && <span className="w-2 h-2 rounded-full opacity-40" style={{ backgroundColor: '#9B8E7B' }} />}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence mode="popLayout">
        {selectedDay && (
          <motion.div
            key="day-detail"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="mt-6 rounded-[30px] border border-cream-200 bg-white/90 p-4 sm:p-6 shadow-warm-lg backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">{selectedDay.date.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                <h3 className="text-lg font-bold text-ink-900">{formatDate(selectedDay.date)}</h3>
              </div>
              <button type="button" onClick={() => setSelectedDay(null)} className="p-2 rounded-full text-ink-400 hover:bg-cream-100 hover:text-ink-900 transition"><X size={18} /></button>
            </div>
            {dayItems.length === 0 ? (
              <p className="text-sm text-ink-500 text-center py-6">Nothing saved on this day yet. Add a note, image or PDF and it will appear here.</p>
            ) : (
              <div className="space-y-2">
                {dayItems.map((it) => {
                  const Icon = TYPE_ICON[it.type];
                  return (
                    <motion.div
                      key={it._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2.5 rounded-2xl border border-cream-200 bg-white/70 px-3 py-2 cursor-pointer hover:bg-white transition-colors"
                      onClick={() => actions.view(it)}
                    >
                      <div className="grid h-8 w-8 place-items-center rounded-xl text-white" style={{ background: metaFor(it.type).solid }}>
                        <Icon size={14} strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-bold text-ink-900">{it.name}</h4>
                        <p className="truncate text-[11.5px] text-ink-500">{relTime(it.createdAt)} · {metaFor(it.type).label}</p>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setConfirm({ open: true, item: it }); }} className="p-1.5 rounded-full text-ink-400 hover:bg-rose-50 hover:text-rose-600 transition"><X size={14} /></button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {confirm.open && (
        <ConfirmDialog
          open={confirm.open}
          title="Remove from calendar?"
          message={`“${confirm.item.name}” will be taken off this day.`}
          onConfirm={() => removeItem(confirm.item._id)}
          onCancel={() => setConfirm({ open: false, item: null })}
        />
      )}

      <CreateItemDialog
        open={createOpen}
        title="Add to today"
        subtitle="Note, image or PDF — it lands on today's date."
        types={['note', 'image', 'pdf']}
        defaultType="note"
        onSubmit={createItem}
        onCancel={() => setCreateOpen(false)}
      />
      {dialogs}
    </PageShell>
  );
};

export default Calendar;