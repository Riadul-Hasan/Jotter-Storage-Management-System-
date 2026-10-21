import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  AlertTriangle,
  Info,
  Pencil,
  Lock,
  Unlock,
  KeyRound,
  Download,
  Copy,
  Heart,
  Plus,
  FolderPlus,
  FilePlus2,
  ImagePlus,
  FileText,
  StickyNote,
  FolderOpen,
} from 'lucide-react';
import { TYPE_META, metaFor, cx, EASE, fileUrl, formatBytes, formatDate } from '../utils/format';

/* =================================================================== */
/*  Modal shell — shared animated overlay for every dialog             */
/* =================================================================== */
const Shell = ({ open, onClose, children, size = 'max-w-md', dismissable = true }) => {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || 'unset';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissable ? onClose : undefined}
            className="absolute inset-0 cursor-default bg-ink-900/45 backdrop-blur-[6px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 44, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320, mass: 0.7 }}
            className={cx(
              'relative w-full overflow-hidden rounded-[28px] border border-cream-200 bg-white shadow-warm-xl',
              size
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Head = ({ tone = 'grape', icon: Icon, title, subtitle, onClose }) => {
  const tones = {
    grape: 'from-violet-500 to-purple-500 shadow-[0_8px_20px_rgba(139,92,246,0.3)]',
    coral: 'from-brand-coral to-brand-tangerine shadow-warm-glow',
    danger: 'from-brand-rose to-red-500 shadow-[0_8px_20px_rgba(244,63,94,0.3)]',
    mint: 'from-brand-mint to-emerald-500 shadow-[0_8px_20px_rgba(18,184,134,0.3)]',
    sky: 'from-brand-sky to-blue-500 shadow-[0_8px_20px_rgba(59,163,255,0.3)]',
  };
  return (
    <div className="flex items-start gap-3.5 px-6 pb-4 pt-6">
      {Icon && (
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.08 }}
          className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white', tones[tone])}
        >
          <Icon size={20} strokeWidth={2.2} />
        </motion.span>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="w-title text-lg leading-tight text-ink-900">{title}</h3>
        {subtitle && <p className="w-sub mt-1 text-[13px]">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-500 transition hover:bg-cream-100 hover:text-ink-900"
      >
        <X size={18} />
      </button>
    </div>
  );
};

const Foot = ({ children }) => (
  <div className="flex flex-col-reverse gap-2.5 border-t border-cream-200 bg-cream-100/60 px-6 py-4 sm:flex-row sm:justify-end">
    {children}
  </div>
);

/* =================================================================== */
/*  ConfirmDialog — replaces window.confirm everywhere                 */
/* =================================================================== */
export const ConfirmDialog = ({
  open,
  title,
  message,
  detail,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <Shell open={open} onClose={onCancel}>
    <Head
      tone={tone}
      icon={tone === 'danger' ? AlertTriangle : tone === 'mint' ? Check : Info}
      title={title}
      subtitle={message}
      onClose={onCancel}
    />
    {detail && (
      <p className="mx-6 mb-2 rounded-2xl border border-cream-200 bg-cream-100/70 px-4 py-3 text-[13px] text-ink-600">
        {detail}
      </p>
    )}
    <Foot>
      <button type="button" onClick={onCancel} className="w-btn-soft px-5 py-3 text-sm">
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className={cx(tone === 'danger' ? 'w-btn-danger' : 'w-btn-primary', 'px-6 py-3 text-sm')}
      >
        {loading ? 'Working…' : confirmLabel}
      </button>
    </Foot>
  </Shell>
);

/* =================================================================== */
/*  PromptDialog — single field (rename, create, search-free inputs)   */
/* =================================================================== */
export const PromptDialog = ({
  open,
  title,
  subtitle,
  label = 'Name',
  initialValue = '',
  placeholder = '',
  confirmLabel = 'Save',
  icon = Pencil,
  loading = false,
  onSubmit,
  onCancel,
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(initialValue);
      const t = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 120);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open, initialValue]);

  const submit = (e) => {
    e?.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
  };

  return (
    <Shell open={open} onClose={onCancel}>
      <form onSubmit={submit}>
        <Head tone="grape" icon={icon} title={title} subtitle={subtitle} onClose={onCancel} />
        <div className="px-6 pb-5">
          <label className="w-label" htmlFor="prompt-field">
            {label}
          </label>
          <input
            id="prompt-field"
            ref={inputRef}
            className="w-field"
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <Foot>
          <button type="button" onClick={onCancel} className="w-btn-soft px-5 py-3 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="w-btn-primary px-6 py-3 text-sm"
          >
            {loading ? 'Saving…' : confirmLabel}
          </button>
        </Foot>
      </form>
    </Shell>
  );
};

/* =================================================================== */
/*  PasswordDialog — lock / unlock / remove-lock / enter-the-vault     */
/* =================================================================== */
const PASSWORD_COPY = {
  set: {
    icon: Lock,
    tone: 'coral',
    title: 'Protect this folder',
    subtitle: 'Choose a password of at least 4 characters.',
    cta: 'Lock folder',
  },
  unlock: {
    icon: KeyRound,
    tone: 'grape',
    title: 'Folder locked',
    subtitle: 'Enter the password to reveal what’s inside.',
    cta: 'Unlock',
  },
  remove: {
    icon: Unlock,
    tone: 'danger',
    title: 'Remove protection?',
    subtitle: 'Confirm the password to make this folder public again.',
    cta: 'Remove lock',
  },
  vault: {
    icon: Unlock,
    tone: 'mint',
    title: 'Restore from vault',
    subtitle: 'Enter your vault password to move this item back to your library.',
    cta: 'Restore item',
  },
  secure: {
    icon: Lock,
    tone: 'grape',
    title: 'Move to private vault',
    subtitle: 'Enter your vault password to secure this item.',
    cta: 'Secure item',
  },
  verify: {
    icon: Lock,
    tone: 'grape',
    title: 'Unlock your vault',
    subtitle: 'Enter your vault password to see your protected items.',
    cta: 'Unlock vault',
  },
};

export const PasswordDialog = ({
  open,
  mode = 'set',
  itemName = '',
  error = '',
  loading = false,
  onSubmit,
  onCancel,
  onForgot,
}) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');
  const inputRef = useRef(null);

  const copy = PASSWORD_COPY[mode] || PASSWORD_COPY.set;
  const shownError = localError || error;

  useEffect(() => {
    if (open) {
      setPassword('');
      setConfirm('');
      setLocalError('');
      const t = setTimeout(() => inputRef.current?.focus(), 140);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open, mode]);

  const submit = (e) => {
    e?.preventDefault();
    if (mode === 'set') {
      if (password.length < 4) {
        setLocalError('Password must be at least 4 characters.');
        return;
      }
      if (password !== confirm) {
        setLocalError('Passwords do not match.');
        return;
      }
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }
    setLocalError('');
    onSubmit(password);
  };

  const subtitle =
    mode === 'vault' && itemName
      ? `Enter your vault password to move “${itemName}” back to your library.`
      : mode === 'secure' && itemName
      ? `“${itemName}” will be hidden in your private vault until you restore it.`
      : copy.subtitle;

  return (
    <Shell open={open} onClose={onCancel}>
      <form onSubmit={submit}>
        <Head tone={copy.tone} icon={copy.icon} title={copy.title} subtitle={subtitle} onClose={onCancel} />
        <div className="space-y-3 px-6 pb-5">
          <div>
            <label className="w-label" htmlFor="pw-1">
              {mode === 'set' ? 'New password' : 'Password'}
            </label>
            <input
              id="pw-1"
              ref={inputRef}
              type="password"
              autoComplete="off"
              className="w-field tracking-[0.3em]"
              value={password}
              placeholder="••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {mode === 'set' && (
            <div>
              <label className="w-label" htmlFor="pw-2">
                Confirm password
              </label>
              <input
                id="pw-2"
                type="password"
                autoComplete="off"
                className="w-field tracking-[0.3em]"
                value={confirm}
                placeholder="••••"
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          )}
          {shownError && (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-[13px] font-medium text-rose-600"
            >
              <AlertTriangle size={14} /> {shownError}
            </motion.p>
          )}
               {onForgot && mode !== 'set' && (
                 <p className="text-center text-[12.5px] text-ink-500">
                   Forgot your password?{' '}
                   <button
                     type="button"
                     onClick={onForgot}
                     className="font-bold text-brand-grape underline-offset-2 hover:underline"
                   >
                     Reset it
                   </button>
                 </p>
               )}
               

        </div>
        <Foot>
          <button type="button" onClick={onCancel} className="w-btn-soft px-5 py-3 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !password}
            className={cx(mode === 'remove' ? 'w-btn-danger' : 'w-btn-primary', 'px-6 py-3 text-sm')}
          >
            {loading ? 'Checking…' : copy.cta}
          </button>
        </Foot>
      </form>
    </Shell>
  );
};

/* =================================================================== */
/*  CreateItemDialog — one dialog to create notes/images/PDFs/folders  */
/* =================================================================== */
const CREATE_TYPES = {
  note: { Icon: StickyNote, label: 'Note' },
  image: { Icon: ImagePlus, label: 'Image' },
  pdf: { Icon: FileText, label: 'PDF' },
  folder: { Icon: FolderPlus, label: 'Folder' },
};

export const CreateItemDialog = ({
  open,
  title = 'Create something new',
  subtitle,
  types = ['note', 'image', 'pdf', 'folder'],
  defaultType = 'note',
  namePlaceholder = 'Untitled',
  contentPlaceholder = 'Start writing…',
  isLocked = false,
  loading = false,
  error = '',
  onSubmit,
  onCancel,
}) => {
  const [type, setType] = useState(defaultType);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const nameRef = useRef(null);

  useEffect(() => {
    if (open) {
      setType(defaultType);
      setName('');
      setContent('');
      setFile(null);
      const t = setTimeout(() => nameRef.current?.focus(), 140);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open, defaultType]);

  const needsFile = type === 'image' || type === 'pdf';
  const canSubmit = name.trim().length > 0 && (!needsFile || Boolean(file));

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    onSubmit({ type, name: name.trim(), content: content.trim(), file });
  };

  return (
    <Shell open={open} onClose={onCancel} size="max-w-lg">
      <form onSubmit={submit}>
        <Head tone="coral" icon={Plus} title={title} subtitle={subtitle} onClose={onCancel} />

        <div className="space-y-4 px-6 pb-5">
          {types.length > 1 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {types.map((t) => {
                const meta = CREATE_TYPES[t];
                if (!meta) return null;
                const active = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t);
                      setFile(null);
                    }}
                    className={cx(
                      'flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 transition-all duration-300',
                      active
                        ? '-translate-y-0.5 border-transparent bg-gradient-to-br from-brand-coral to-brand-tangerine text-white shadow-warm-glow'
                        : 'border-cream-200 bg-cream-100/60 text-ink-600 hover:border-cream-300 hover:bg-cream-100'
                    )}
                  >
                    <meta.Icon size={18} strokeWidth={2.2} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div>
            <label className="w-label" htmlFor="create-name">
              Name
            </label>
            <input
              id="create-name"
              ref={nameRef}
              className="w-field"
              value={name}
              placeholder={namePlaceholder}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {type === 'note' && (
            <div>
              <label className="w-label" htmlFor="create-content">
                Content <span className="normal-case tracking-normal text-ink-400">(optional)</span>
              </label>
              <textarea
                id="create-content"
                rows={4}
                className="w-field resize-none leading-relaxed"
                value={content}
                placeholder={contentPlaceholder}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          )}

          {needsFile && (
            <div>
              <label className="w-label">
                File <span className="normal-case tracking-normal text-ink-400">(required)</span>
              </label>
              <input
                type="file"
                accept={type === 'image' ? 'image/*' : 'application/pdf'}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full cursor-pointer rounded-2xl border border-dashed border-cream-400 bg-cream-100/60 px-4 py-3 text-sm text-ink-600 file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-ink-800 hover:border-brand-coral/60 focus:outline-none"
              />
              {file && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center gap-2 text-[13px] font-medium text-brand-mint"
                >
                  <Check size={14} /> {file.name}
                </motion.p>
              )}
            </div>
          )}

          {isLocked && (
            <p className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] font-medium text-amber-700">
              <Lock size={14} /> This item goes straight into your private vault.
            </p>
          )}

          {error && (
            <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-[13px] font-medium text-rose-600">
              <AlertTriangle size={14} /> {error}
            </p>
          )}
        </div>

        <Foot>
          <button type="button" onClick={onCancel} className="w-btn-soft px-5 py-3 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit || loading} className="w-btn-primary px-6 py-3 text-sm">
            {loading ? 'Creating…' : 'Create'}
          </button>
        </Foot>
      </form>
    </Shell>
  );
};

/* =================================================================== */
/*  ItemViewer — animated lightbox for notes / images / PDFs           */
/* =================================================================== */
export const ItemViewer = ({
  open,
  item,
  onClose,
  onCopy,
  onDownload,
  onFavorite,
  busy = false,
}) => {
  if (!item) return null;
  const meta = metaFor(item.type);
  const hasFile = Boolean(item.filePath);

  return (
    <Shell open={open} onClose={onClose} size="max-w-3xl" dismissable>
      <Head
        tone="sky"
        icon={meta.Icon}
        title={item.name}
        subtitle={`${meta.label} · ${item.fileSize ? formatBytes(item.fileSize) : 'no file'} · ${formatDate(item.createdAt)}`}
        onClose={onClose}
      />

      <div className="max-h-[62vh] w-full overflow-y-auto px-6 pb-4">
        {item.type === 'note' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="whitespace-pre-wrap rounded-3xl border border-cream-200 bg-gradient-to-br from-cream-100 to-white p-5 text-[15px] leading-relaxed text-ink-800"
          >
            {item.content?.trim() ? item.content : 'This note is empty.'}
          </motion.div>
        )}

        {item.type === 'image' && hasFile && (
          <motion.img
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: EASE }}
            src={fileUrl(item)}
            alt={item.name}
            className="mx-auto max-h-[58vh] w-auto rounded-3xl border border-cream-200 object-contain"
          />
        )}

        {item.type === 'pdf' && hasFile && (
          <iframe
            src={fileUrl(item)}
            title={item.name}
            className="h-[58vh] w-full rounded-3xl border border-cream-200 bg-cream-100"
          />
        )}

        {item.type !== 'note' && !hasFile && (
          <p className="rounded-3xl border border-dashed border-cream-300 bg-cream-100/60 p-8 text-center text-sm text-ink-500">
            No file attached to this item.
          </p>
        )}
      </div>

      <Foot>
        {onFavorite && (
          <button
            type="button"
            onClick={() => onFavorite(item)}
            disabled={busy}
            className="w-btn-soft px-5 py-3 text-sm"
          >
            <Heart size={16} className={item.isFavorite ? 'fill-brand-rose text-brand-rose' : ''} />
            {item.isFavorite ? 'Unfavourite' : 'Favourite'}
          </button>
        )}
        {item.type === 'note' && onCopy && (
          <button type="button" onClick={() => onCopy(item)} className="w-btn-soft px-5 py-3 text-sm">
            <Copy size={16} /> Copy text
          </button>
        )}
        {hasFile && onDownload && (
          <button type="button" onClick={() => onDownload(item)} className="w-btn-primary px-6 py-3 text-sm">
            <Download size={16} /> Download
          </button>
        )}
        {!hasFile && (
          <button type="button" onClick={onClose} className="w-btn-primary px-6 py-3 text-sm">
            Close
          </button>
        )}
      </Foot>
    </Shell>
  );
};

export default {
  ConfirmDialog,
  PromptDialog,
  PasswordDialog,
  CreateItemDialog,
  ItemViewer,
};
