import {
  StickyNote,
  Image as ImageIcon,
  FileText,
  Folder,
  FolderOpen,
} from 'lucide-react';

export const API_BASE = 'http://localhost:5000';
export const EASE = [0.16, 1, 0.3, 1];

/**
 * Build a fully-qualified avatar URL (handles relative /uploads paths).
 *
 * Uploaded avatars always get a unique filename (timestamp + random), so the
 * URL itself changes on every upload and the browser can never serve a stale
 * picture for a new avatar.
 */
export const avatarUrl = (avatar = '') => {
  if (!avatar) return '';
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
  return `${API_BASE}${avatar}`;
};

/** Tiny class-name joiner. */
export const cx = (...parts) => parts.filter(Boolean).join(' ');

/* ----------------------------------------------------------------- */
/*  Type metadata — one source of truth for icons, labels and colour  */
/* ----------------------------------------------------------------- */
export const TYPE_META = {
  note: {
    label: 'Note',
    Icon: StickyNote,
    solid: 'from-amber-400 to-orange-500',
    soft: 'bg-amber-100 text-amber-700',
    ring: 'ring-amber-200',
    dot: 'bg-amber-500',
  },
  image: {
    label: 'Image',
    Icon: ImageIcon,
    solid: 'from-sky-400 to-blue-500',
    soft: 'bg-sky-100 text-sky-700',
    ring: 'ring-sky-200',
    dot: 'bg-sky-500',
  },
  pdf: {
    label: 'PDF',
    Icon: FileText,
    solid: 'from-rose-400 to-pink-500',
    soft: 'bg-rose-100 text-rose-700',
    ring: 'ring-rose-200',
    dot: 'bg-rose-500',
  },
  folder: {
    label: 'Folder',
    Icon: FolderOpen,
    solid: 'from-violet-400 to-purple-500',
    soft: 'bg-violet-100 text-violet-700',
    ring: 'ring-violet-200',
    dot: 'bg-violet-500',
  },
};

export const metaFor = (type) => TYPE_META[type] || TYPE_META.pdf;

/* ----------------------------------------------------------------- */
/*  Formatters                                                        */
/* ----------------------------------------------------------------- */
export const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatDate = (value, opts) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatLongDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

export const relTime = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
};

/** Local-timezone YYYY-MM-DD key (never UTC-shifted). */
export const dayKey = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

export const snippet = (text = '', len = 140) => {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > len ? `${clean.slice(0, len)}…` : clean;
};

/* ----------------------------------------------------------------- */
/*  File helpers                                                      */
/* ----------------------------------------------------------------- */
export const fileUrl = (item) =>
  item?.filePath ? `${API_BASE}${item.filePath}` : '';

export const downloadItem = async (item) => {
  const response = await fetch(fileUrl(item));
  if (!response.ok) throw new Error('Download failed');
  const blob = await response.blob();
  const ext = (item.filePath || '').split('.').pop();
  const fileName = ext ? `${item.name}.${ext}` : item.name;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
};

/** Human-readable text for the clipboard when copying an item. */
export const itemAsText = (item) => {
  if (item.type === 'note' && item.content) return item.content;
  let out = `Name: ${item.name}\nType: ${metaFor(item.type).label}`;
  if (item.type === 'folder') out += `\nItems inside: ${item.itemCount ?? 0}`;
  if (item.createdAt) out += `\nCreated: ${formatDate(item.createdAt)}`;
  if (item.fileSize) out += `\nSize: ${formatBytes(item.fileSize)}`;
  return out;
};

/* ----------------------------------------------------------------- */
/*  Motion presets                                                    */
/* ----------------------------------------------------------------- */
export const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: EASE },
});

export const staggerGroup = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
};
