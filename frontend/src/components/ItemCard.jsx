import { forwardRef, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MoreVertical,
  Copy as CopyIcon,
  Pencil,
  Files,
  Share2,
  Lock,
  Unlock,
  Trash2,
  FolderOpen,
  ShieldCheck,
  Image as ImageIcon,
  FileText,
  StickyNote,
} from 'lucide-react';
import { cx, EASE, metaFor, formatBytes, formatDate, fileUrl, avatarUrl } from '../utils/format';

/**
 * ItemCard — the shared warm list/grid card.
 * Props are unchanged from the original so every page keeps working, but the
 * handlers should now be real (pass `actions` from useItemActions).
 */
const ItemCard = forwardRef(({
  item,
  onFavorite,
  onCopy,
  onRename,
  onDuplicate,
  onDelete,
  onShare,
  onLock,
  onSecure,
  onClick,
  index = 0,
}, ref) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const wrapRef = useRef(null);
  const meta = metaFor(item.type);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const thumb = item.type === 'image' && item.filePath && !thumbError ? fileUrl(item) : null;
  const isProtected = Boolean(item.password) || item.isLocked;
  const menu = [
    { key: 'rename', icon: Pencil, label: 'Rename', onClick: onRename, show: Boolean(onRename) },
    { key: 'copy', icon: CopyIcon, label: 'Copy details', onClick: onCopy, show: Boolean(onCopy) },
    { key: 'duplicate', icon: Files, label: 'Duplicate', onClick: onDuplicate, show: Boolean(onDuplicate) },
    { key: 'share', icon: Share2, label: 'Share link', onClick: onShare, show: Boolean(onShare) },
    {
      key: 'lock',
      icon: item.password ? Unlock : Lock,
      label: item.password ? 'Remove lock' : 'Lock folder',
      onClick: onLock,
      show: item.type === 'folder' && Boolean(onLock),
    },
    {
      key: 'secure',
      icon: ShieldCheck,
      label: 'Secure in vault',
      onClick: onSecure,
      show: Boolean(onSecure) && !item.isLocked,
    },
    { key: 'delete', icon: Trash2, label: 'Delete', onClick: onDelete, show: Boolean(onDelete), danger: true },
  ].filter((m) => m.show);

  const act = (fn) => (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    fn?.(item);
  };

  return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.32), ease: EASE }}
        ref={wrapRef}
        role="button"
        tabIndex={0}
        onClick={() => onClick?.(item)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onClick?.(item);
        }}
        className={cx(
          "group w-full cursor-pointer rounded-3xl border border-cream-200 bg-white/85 p-3.5 shadow-warm-xs backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-cream-300 hover:bg-white hover:shadow-warm-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-grape/40 relative",
          menuOpen ? "z-50" : "z-10"
        )}
      >
      <div className="flex items-center gap-3.5">
        {item.type === 'image' && item.filePath && !thumbError ? (
          <motion.span
            whileHover={{ rotate: -8, scale: 1.06 }}
            className={cx(
              'grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm',
              item.isProtected ? 'border-rose-200' : ''
            )}
          >
            <img
              src={thumb}
              alt={item.name}
              className="h-full w-full object-cover"
              onError={() => setThumbError(true)}
            />
          </motion.span>
        ) : (
          <motion.span
            whileHover={{ rotate: -8, scale: 1.06 }}
            className={cx(
              'grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm',
              item.isProtected ? 'border-rose-200' : ''
            )}
          >
            <meta.Icon size={20} strokeWidth={2.2} />
          </motion.span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[15px] font-bold text-ink-900">{item.name}</h3>
            {isProtected && (
              <Lock size={13} className="shrink-0 text-brand-tangerine" aria-label="Protected" />
            )}
            {item.isFavorite && <Heart size={13} className="shrink-0 fill-brand-rose text-brand-rose" />}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-500">
            <span className={cx('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', meta.soft)}>
              {meta.label}
            </span>
            <span>{formatDate(item.createdAt)}</span>
            {item.fileSize > 0 && (
              <>
                <span className="text-cream-500">•</span>
                <span>{formatBytes(item.fileSize)}</span>
              </>
            )}
            {item.type === 'note' && item.content?.length > 0 && (
              <>
                <span className="text-cream-500">•</span>
                <span>{item.content.length} chars</span>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {onFavorite && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(item);
              }}
              aria-label={item.isFavorite ? 'Remove from favourites' : 'Add to favourites'}
              className="grid h-9 w-9 place-items-center rounded-full text-ink-500 transition hover:bg-rose-50 hover:text-brand-rose"
            >
              <Heart
                size={17}
                className={cx('transition', item.isFavorite && 'fill-brand-rose text-brand-rose')}
              />
            </motion.button>
          )}

          {menu.length > 0 && (
            <div className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                aria-label="More actions"
                aria-expanded={menuOpen}
                className={cx(
                  'grid h-9 w-9 place-items-center rounded-full transition',
                  menuOpen
                    ? 'bg-gradient-to-br from-brand-coral to-brand-tangerine text-white shadow-warm-glow'
                    : 'text-ink-500 hover:bg-cream-100 hover:text-ink-900'
                )}
              >
                <MoreVertical size={17} />
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close menu"
                      className="fixed inset-0 z-[60] cursor-default"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                    />
                               <motion.div
                                 initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                 animate={{ opacity: 1, y: 0, scale: 1 }}
                                 exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                 transition={{ duration: 0.18, ease: EASE }}
                                 onClick={(e) => e.stopPropagation()}
                                 className="absolute right-0 z-[70] mt-2 w-52 origin-top-right overflow-hidden rounded-3xl border border-cream-200 bg-white p-1.5 shadow-warm-lg"
                               >

                      {menu.map((m) => (
                        <button
                          key={m.key}
                          type="button"
                          onClick={act(m.onClick)}
                          className={cx(
                            'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[13px] font-semibold transition',
                            m.danger
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-ink-700 hover:bg-cream-100 hover:text-ink-900'
                          )}
                        >
                          <m.icon size={15} className={m.danger ? 'text-rose-500' : 'text-ink-500'} />
                          {m.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {item.type === 'note' && item.content?.trim() && (
        <p className="mt-2.5 line-clamp-2 rounded-2xl bg-cream-100/70 px-3 py-2 text-[12.5px] leading-relaxed text-ink-600">
          {item.content}
        </p>
      )}

      {item.type === 'folder' && item.itemCount !== undefined && (
        <p className="mt-2.5 flex items-center gap-1.5 text-[12px] font-medium text-ink-500">
          <FolderOpen size={13} /> {item.itemCount} item{item.itemCount === 1 ? '' : 's'}
        </p>
      )}
    </motion.div>
  );
});

export default ItemCard;