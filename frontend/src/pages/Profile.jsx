import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  User, Mail, Clock, ShieldCheck, Folder, StickyNote, Image as ImageIcon, FileText,
  Trash2, Lock, KeyRound, Edit2, Plus, X, FileClock, ExternalLink,
} from 'lucide-react';
import PageShell from '../components/PageShell';
import api from '../api/axios';
import { cx, formatBytes, formatDate, avatarUrl } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/Skeletons';
import { PromptDialog, PasswordDialog } from '../components/Dialogs';

const STATS = [
  { key: 'folders', label: 'Folders', Icon: Folder, dot: 'bg-violet-500', grad: 'from-violet-400 to-purple-500' },
  { key: 'notes', label: 'Notes', Icon: StickyNote, dot: 'bg-amber-500', grad: 'from-amber-400 to-orange-500' },
  { key: 'images', label: 'Images', Icon: ImageIcon, dot: 'bg-sky-500', grad: 'from-sky-400 to-blue-500' },
  { key: 'pdfs', label: 'PDFs', Icon: FileText, dot: 'bg-rose-500', grad: 'from-rose-400 to-pink-500' },
];

const Profile = () => {
  const navigate = useNavigate();
  const { patchUser } = useAuth();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [editName, setEditName] = useState('');
  const [renameOpen, setRenameOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwMode, setPwMode] = useState('change');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showChange, setShowChange] = useState(false);
  const [cp, setCP] = useState({ current: '', new: '', confirm: '' });
  const [confirmDel, setConfirmDel] = useState(false);
  const [delPwd, setDelPwd] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const [u, s] = await Promise.all([api.get('/profile'), api.get('/items/stats')]);
      setUser(u.data.user);
      setAvatarFailed(false);
      setStats(s.data.stats);
      setEditName(u.data.user?.username || '');
    } catch {
      toast.error('Could not load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentItems = useCallback(async () => {
    setRecentLoading(true);
    try {
      const res = await api.get('/items?isLocked=false');
      const list = Array.isArray(res.data?.items) ? res.data.items : [];
      setRecentItems(
        [...list]
          .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
          .slice(0, 5)
      );
    } catch {
      setRecentItems([]);
    } finally {
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  useEffect(() => { fetchRecentItems(); }, [fetchRecentItems]);

  useEffect(() => {
    if (!avatarPreview) return undefined;
    return () => URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  const memberSince = user?.createdAt ? formatDate(user.createdAt) : '—';
  const used = stats?.usedStorage || 0;
  const total = stats?.totalStorage || 15 * 1024 * 1024 * 1024;
  const pct = Math.min(100, Math.round((used / total) * 100));

  const handleAvatar = async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image');
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile picture must be 5 MB or smaller');
      input.value = '';
      return;
    }

    // Copy the bytes out of the file input BEFORE the input is reset.
    //
    // Clearing `input.value` (or otherwise detaching the selection) makes
    // Chrome invalidate the blob that backs the `File`. Both the preview
    // <img> and the multipart XHR then fail with
    // `net::ERR_BLOB_REFERENCED_FILE_UNAVAILABLE` / `net::ERR_ACCESS_DENIED`
    // and the upload silently never reaches the server. Reading the bytes
    // into memory first gives us an independent, upload-safe copy.
    let uploadFile = file;
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      uploadFile = new File([bytes], file.name, {
        type: file.type || 'image/png',
        lastModified: file.lastModified || Date.now(),
      });
    } catch {
      // Fall back to the original file if the bytes cannot be read.
      uploadFile = file;
    }

    const previewUrl = URL.createObjectURL(uploadFile);
    setAvatarFailed(false);
    setAvatarPreview(previewUrl);

    try {
      await saveProfile(editName, uploadFile);
    } finally {
      // Reset the input last, so choosing the very same file again still
      // fires a change event.
      input.value = '';
    }
  };

  const saveProfile = async (nameOverride, avatarOverride) => {
    if (!user) return;

    const nameToSave =
      (typeof nameOverride === 'string' ? nameOverride : editName).trim() ||
      user.username;

    const form = new FormData();
    form.append('username', nameToSave);
    if (avatarOverride) form.append('avatar', avatarOverride);

    try {
      const res = await api.put('/profile', form);
      toast.success(res.data.message || 'Profile updated');
      setEditName(nameToSave);
      
      // Merge the server response into the shared auth state so the header
      // avatar updates immediately — without a page reload.
      if (res.data.user) {
        patchUser(res.data.user);
        setUser((prev) => ({ ...prev, ...res.data.user }));
      }

      // The new picture is a fresh URL, so clear any previous load failure.
      setAvatarFailed(false);
      setAvatarPreview(null);
      await fetchProfile();
    } catch (e) {
      setAvatarPreview(null);
      toast.error(e?.response?.data?.message || 'Update failed');
    }
  };

  const submitChange = async () => {
    if (cp.new !== cp.confirm) { setPwError('New passwords do not match'); return; }
    if (cp.new.length < 6) { setPwError('Password must be 6+ characters'); return; }
    setPwLoading(true);
    try {
      // The API expects `currentPassword` / `newPassword` / `confirmPassword`
      // — sending the local `cp` shape directly always failed with a 400.
      await api.post('/profile/change-password', {
        currentPassword: cp.current,
        newPassword: cp.new,
        confirmPassword: cp.confirm,
      });
      toast.success('Password changed');
      setCP({ current: '', new: '', confirm: '' });
      setPwOpen(false);
      setPwError('');
    } catch (e) {
      setPwError(e?.response?.data?.message || 'Change failed');
    } finally {
      setPwLoading(false);
    }
  };

  const submitVault = async (password) => {
    setPwLoading(true);
    try {
      if (pwMode === 'set') {
        await api.post('/profile/set-lock-password', { lockPassword: password });
        toast.success('Private vault created');
      } else {
        await api.post('/profile/verify-lock-password', { lockPassword: password });
        toast.success('Vault unlocked');
        navigate('/locked-folder', { state: { unlockFromProfile: true } });
      }
      setPwOpen(false);
      setPwError('');
    } catch (e) {
      setPwError(e?.response?.data?.message || 'Incorrect password');
    } finally {
      setPwLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/profile', { data: { password: delPwd } });
      toast.success('Account deleted');
      window.location.href = '/login';
    } catch (e) {
      setPwError(e?.response?.data?.message || 'Password incorrect');
    }
  };

  return (
    <PageShell title="Profile" subtitle="Your personal Jotter space" accent="grape">
      {/* ---------- hero ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 relative rounded-[30px] border border-cream-200 bg-gradient-to-br from-white via-cream-50 to-white p-5 sm:p-7 shadow-warm-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatarPreview || (user?.avatar ? avatarUrl(user.avatar) : '')}
                alt="Avatar"
                className="h-24 w-24 rounded-[2rem] object-cover border border-cream-200 bg-cream-100 shadow-warm-sm"
                onError={() => setAvatarFailed(true)}
                style={{ display: !avatarFailed && (avatarPreview || user?.avatar) ? 'block' : 'none' }}
              />
              {(avatarFailed || (!user?.avatar && !avatarPreview)) && (
                <div className="h-24 w-24 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-cream-300 bg-cream-100 text-ink-400">
                  <User size={28} />
                </div>
              )}
              <label className="absolute bottom-0 right-0 flex items-center justify-center h-8 w-8 rounded-full bg-brand-coral text-white shadow-warm-glow cursor-pointer hover:scale-105 transition">
                <input type="file" accept="image/*" onChange={handleAvatar} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Plus size={14} strokeWidth={2.2} />
              </label>
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-ink-900 leading-tight">{user?.username || '—'}</h2>
              <p className="text-[13px] text-ink-500 flex items-center gap-1.5"><Mail size={14} /> {user?.email || '—'}</p>
              <p className="mt-1 text-[11px] text-cream-700 font-bold uppercase tracking-wider">Member since {memberSince}</p>
            </div>
          </div>
          <div className="flex items-end gap-2 sm:items-start">
            <button type="button" onClick={() => { setEditName(user?.username || ''); setRenameOpen(true); }} className="w-btn-soft px-4 py-2 text-xs font-bold"><Edit2 size={14} /> Rename</button>
            <button type="button" onClick={() => { setPwMode('change'); setPwError(''); setCP({ current: '', new: '', confirm: '' }); setPwOpen(true); }} className="w-btn-soft px-4 py-2 text-xs font-bold"><Lock size={14} /> Change password</button>
          </div>
        </div>
      </motion.div>

      {/* ---------- storage ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 rounded-[26px] border border-cream-200 bg-white/90 p-4 sm:p-5 shadow-warm-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-cream-700">Storage</p>
            <p className="text-lg font-bold text-ink-900">{formatBytes(used)} of {formatBytes(total)}</p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cream-100 text-ink-700">{pct}% used</span>
        </div>
        <div className="h-3 w-full rounded-full border border-cream-200 bg-cream-100/60 overflow-hidden">
          <div className={cx('h-full rounded-full transition-all duration-700', pct < 60 ? 'bg-brand-mint' : pct < 85 ? 'bg-brand-sun' : 'bg-brand-rose')} style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-ink-500">
          <span>Available storage</span>
          <span>{formatBytes(total - used)}</span>
        </div>
      </motion.div>

      {/* ---------- quick stats ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity:  1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {STATS.map((s) => {
          const val = stats?.[s.key]?.count ?? 0;
          return (
            <motion.div
              key={s.key}
              whileHover={{ y: -4 }}
              className="rounded-[22px] border border-cream-200 bg-white/80 p-4 shadow-warm-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`grid h-9 w-9 place-items-center rounded-xl ${s.dot} text-white shadow-sm`}>
                  <s.Icon size={16} strokeWidth={2} />
                </div>
                <span className="text-[10px] font-bold text-ink-400">{val}</span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-cream-700">{s.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ---------- actions ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mb-6 rounded-[26px] border border-cream-200 bg-white/90 p-4 sm:p-5 shadow-warm-sm"
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-cream-700 mb-4">Account &amp; security</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <button
            type="button"
            onClick={() => { setPwError(''); setCP({ current: '', new: '', confirm: '' }); setShowChange(true); }}
            className="w-btn-soft flex items-center gap-2 px-4 py-3 text-sm font-bold text-ink-700"
          >
            <Lock size={16} /> Change password
          </button>
          {user?.hasLockPassword ? (
            <button
              type="button"
              onClick={() => { setPwMode('verify'); setPwError(''); setPwOpen(true); }}
              className="w-btn-soft flex items-center gap-2 px-4 py-3 text-sm font-bold text-ink-700"
            >
              <KeyRound size={16} /> Unlock private vault
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setPwMode('set'); setPwError(''); setPwOpen(true); }}
              className="w-btn-soft flex items-center gap-2 px-4 py-3 text-sm font-bold text-ink-700"
            >
              <ShieldCheck size={16} /> Set vault password
            </button>
          )}
          <button
            type="button"
            onClick={() => { setPwError(''); setDelPwd(''); setConfirmDel(true); }}
            className="w-btn-danger flex items-center gap-2 px-4 py-3 text-sm font-bold"
          >
            <Trash2 size={16} /> Delete account
          </button>
        </div>
      </motion.div>

      {/* ---------- change password (inline) ---------- */}
      {showChange && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 rounded-[22px] border border-cream-200 bg-white/90 p-4 sm:p-5 shadow-warm-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-ink-900">Change password</h3>
            <button type="button" onClick={() => setShowChange(false)} className="p-1.5 rounded-full text-ink-400 hover:bg-cream-100"><X size={16} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="w-label">Current password</label>
              <input type="password" value={cp.current} onChange={(e) => setCP({ ...cp, current: e.target.value })} className="w-field" placeholder="Current password" />
            </div>
            <div>
              <label className="w-label">New password</label>
              <input type="password" value={cp.new} onChange={(e) => setCP({ ...cp, new: e.target.value })} className="w-field" placeholder="New password" />
            </div>
            <div>
              <label className="w-label">Confirm new password</label>
              <input type="password" value={cp.confirm} onChange={(e) => setCP({ ...cp, confirm: e.target.value })} className="w-field" placeholder="Confirm password" />
            </div>
            {pwError && <p className="text-[12px] text-rose-600">{pwError}</p>}
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setShowChange(false)} className="w-btn-soft flex-1 py-2.5 text-sm font-bold">Cancel</button>
              <button type="button" onClick={submitChange} disabled={pwLoading} className="w-btn-primary flex-1 py-2.5 text-sm font-bold">{pwLoading ? 'Changing…' : 'Change password'}</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ---------- recent activity ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-[26px] border border-cream-200 bg-white/90 p-4 shadow-warm-sm sm:p-5"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-cream-700">
              Recent activity
            </p>
            <p className="mt-1 text-xs text-ink-500">
              Your most recently created or updated library items
            </p>
          </div>
          <FileClock size={18} className="shrink-0 text-ink-400" />
        </div>

        {recentLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((row) => (
              <div key={row} className="flex animate-pulse items-center gap-3 rounded-xl bg-cream-50 p-3">
                <div className="h-10 w-10 rounded-xl bg-cream-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/5 rounded bg-cream-200" />
                  <div className="h-2.5 w-1/3 rounded bg-cream-100" />
                </div>
              </div>
            ))}
          </div>
        ) : recentItems.length === 0 ? (
          <EmptyState
            icon={Clock}
            tone="grape"
            title="No recent items"
            text="Create a note, upload an image or add a document and it will appear here."
          />
        ) : (
          <div className="space-y-2">
            {recentItems.map((item) => {
              const type = item.type || 'note';
              const Icon =
                type === 'folder' ? Folder :
                type === 'image' ? ImageIcon :
                type === 'pdf' ? FileText : StickyNote;
              const changedAt = item.updatedAt || item.createdAt;
              const dateLabel = changedAt ? formatDate(changedAt) : 'Date unavailable';

              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => {
                    if (type === 'folder') {
                      navigate('/folders');
                    } else if (type === 'image' && item.filePath) {
                      window.open(avatarUrl(item.filePath), '_blank', 'noopener,noreferrer');
                    } else if (type === 'pdf' && item.filePath) {
                      window.open(avatarUrl(item.filePath), '_blank', 'noopener,noreferrer');
                    } else {
                      navigate('/home');
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-cream-200 bg-white p-3 text-left transition hover:border-cream-300 hover:bg-cream-50"
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white ${type === 'folder' ? 'bg-violet-500' : type === 'image' ? 'bg-sky-500' : type === 'pdf' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                    <Icon size={17} strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink-900">
                      {item.name || 'Untitled item'}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-500">
                      {type.charAt(0).toUpperCase() + type.slice(1)} · {dateLabel}
                    </span>
                  </span>
                  <ExternalLink size={15} className="shrink-0 text-ink-400" />
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
      <PromptDialog
        open={renameOpen}
        title="Rename"
        subtitle="Choose a name that is easy to recognise."
        label="Display name"
        placeholder="Your name"
        initialValue={editName}
        confirmLabel="Save"
        onSubmit={(name) => { setEditName(name); saveProfile(name); setRenameOpen(false); }}
        onCancel={() => setRenameOpen(false)}
      />
      <PasswordDialog
        open={pwOpen}
        mode={pwMode}
        itemName=""
        error={pwError}
        loading={pwLoading}
        onSubmit={submitVault}
        onCancel={() => setPwOpen(false)}
      />
      <PromptDialog
        open={confirmDel}
        title="Delete account"
        subtitle="This cannot be undone. All your items will be removed."
        label="Password"
        placeholder="Enter your password"
        confirmLabel="Delete account"
        onSubmit={(password) => { setDelPwd(password); deleteAccount(); setConfirmDel(false); }}
        onCancel={() => setConfirmDel(false)}
      />
    </PageShell>
  );
};

export default Profile;