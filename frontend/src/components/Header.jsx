import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Search,
  Menu,
  Lock,
  KeyRound,
  ChevronLeft,
  User,
  Settings as SettingsIcon,
  LifeBuoy,
  LogOut,
  Info,
  Shield,
  Mail,
} from 'lucide-react';
import api from '../api/axios';
import { cx, EASE, avatarUrl } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { PasswordDialog } from './Dialogs';

const ACCENTS = {
  coral: 'from-brand-coral to-brand-tangerine',
  grape: 'from-brand-grape to-purple-500',
  mint: 'from-brand-mint to-emerald-500',
  sky: 'from-brand-sky to-blue-500',
  rose: 'from-brand-rose to-pink-500',
};

const Header = ({
  title = 'Jotter',
  subtitle,
  onSearch,
  showSearch = false,
  accent = 'coral',
  actions,
  back = false,
}) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hasLockPassword, setHasLockPassword] = useState(false);
  const [pw, setPw] = useState({ open: false, mode: 'vault', error: '', loading: false });
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetPurpose, setResetPurpose] = useState('account');
  const location = useLocation();

  // The signed-in user (shared, live) — keeps the header avatar in sync with
  // profile updates without a reload.
  const { user, logout } = useAuth();
  const avatarSrc = user?.avatar ? avatarUrl(user.avatar) : '';

  useEffect(() => {
    let alive = true;
    api
      .get('/auth/me')
      .then((res) => {
        if (alive) setHasLockPassword(Boolean(res.data?.user?.hasLockPassword));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logout();
      toast.success('Logged out — see you soon!');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const openLock = () => {
    if (hasLockPassword) {
      navigate('/locked-folder');
    } else {
      setPw({ open: true, mode: 'set', error: '', loading: false });
    }
  };

  const openReset = (purpose) => {
    setResetPurpose(purpose);
    setResetEmail('');
    setResetOpen(true);
  };

  const submitReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: resetEmail, purpose: resetPurpose });
      toast.success(`Code sent to ${resetEmail}`);
      setResetOpen(false);
      navigate('/verify-code', { state: { email: resetEmail, purpose: resetPurpose } });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send code');
    } finally {
      setResetLoading(false);
    }
  };

  // PasswordDialog validates length/confirmation itself and hands us the value.
  const submitLock = async (password) => {
    setPw((s) => ({ ...s, loading: true, error: '' }));
    try {
      if (pw.mode === 'set') {
        await api.post('/profile/set-lock-password', { lockPassword: password });
        toast.success('Private vault created');
        setHasLockPassword(true);
        setPw((s) => ({ ...s, open: false, loading: false }));
        navigate('/locked-folder');
        return;
      }
      const res = await api.post('/profile/verify-lock-password', { lockPassword: password });
      if (res.data?.success) {
        toast.success('Access granted');
        setPw((s) => ({ ...s, open: false, loading: false }));
        navigate('/locked-folder');
      }
    } catch (e) {
      setPw((s) => ({
        ...s,
        loading: false,
        error:
          e?.response?.data?.message ||
          (pw.mode === 'set' ? 'Could not set password' : 'Incorrect password. Try again.'),
      }));
    }
  };

  const gradient = ACCENTS[accent] || ACCENTS.coral;

  return (
    <>
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="absolute top-0 left-0 right-0 h-3 bg-white/30 backdrop-blur-md -z-10" />
        <motion.div
          initial={{ y: -26, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="container mx-auto rounded-[26px] border border-white/70 bg-white/75 px-4 py-3 shadow-warm-md backdrop-blur-xl sm:px-5"
        >

          <div className="flex items-center gap-3">
            {back && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-cream-200 bg-cream-100 text-ink-600 transition hover:bg-cream-200 hover:text-ink-900"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            <motion.span
              whileHover={{ rotate: -6, scale: 1.05 }}
              className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-warm-sm', gradient)}
            >
              <Lock size={18} strokeWidth={2.4} />
            </motion.span>

            <div className="min-w-0 flex-1">
              <h1 className="w-title truncate text-lg leading-tight sm:text-xl">{title}</h1>
              <p className="w-sub truncate text-[12.5px]">
                {subtitle || 'Your warm little corner of the cloud'}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {actions}

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={openLock}
                  title={hasLockPassword ? 'Open private folder' : 'Create private folder'}
                  className={cx(
                    'grid h-10 w-10 place-items-center rounded-2xl border transition',
                    location.pathname === '/locked-folder' 
                      ? 'hidden' 
                      : 'border-cream-200 bg-white/80 text-ink-600 hover:border-brand-coral/40 hover:text-brand-coral'
                  )}
                >
                  {hasLockPassword ? <KeyRound size={17} /> : <Lock size={17} />}
                </motion.button>

              {/* Avatar — reflects the shared user state, so a new profile
                  picture shows up here the moment it is uploaded. */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                aria-label="Open profile"
                title={user?.username ? `Profile — ${user.username}` : 'Profile'}
                className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl border border-cream-200 bg-white/80"
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={user?.username ? `${user.username} avatar` : 'Avatar'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center text-ink-500">
                    <User size={17} />
                  </span>
                )}
              </motion.button>

              <div className="relative" ref={menuRef}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Menu"
                  className={cx(
                    'grid h-10 w-10 place-items-center rounded-2xl border transition',
                    menuOpen
                      ? 'border-transparent bg-gradient-to-br from-brand-coral to-brand-tangerine text-white shadow-warm-glow'
                      : 'border-cream-200 bg-white/80 text-ink-600 hover:text-ink-900'
                  )}
                >
                  <Menu size={17} />
                </motion.button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <button
                        type="button"
                        aria-label="Close menu"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.22, ease: EASE }}
                        className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-3xl border border-cream-200 bg-white p-1.5 shadow-warm-lg"
                      >
                        {[
                          { label: 'Profile', icon: User, to: '/profile' },
                          { label: 'Settings', icon: SettingsIcon, to: '/settings' },
                          { label: 'Reset password', icon: KeyRound, onClick: () => openReset('account') },
                          { label: hasLockPassword ? 'Reset vault password' : 'Create vault password', icon: Shield, onClick: () => openReset(hasLockPassword ? 'vault' : 'vault') },
                          { label: 'Support', icon: LifeBuoy, to: '/support' },
                          { label: 'About Jotter', icon: Info, to: '/about' },
                        ].map((row, i) => (
                          <button
                            key={row.to || i}
                            type="button"
                            onClick={() => {
                              setMenuOpen(false);
                              if (row.onClick) row.onClick();
                              else navigate(row.to);
                            }}
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-ink-700 transition hover:bg-cream-100 hover:text-ink-900"
                          >
                            <row.icon size={16} className="text-ink-500" /> {row.label}
                          </button>
                        ))}
                        <div className="my-1 h-px bg-cream-200" />
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                        >
                          <LogOut size={16} /> Log out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.4, ease: EASE }}
              className="relative mt-3"
            >
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  onSearch?.(e.target.value);
                }}
                placeholder="Search your library…"
                className="w-field !py-2.5 !pl-10 text-[13.5px]"
              />
            </motion.div>
          )}
        </motion.div>
      </header>

      <PasswordDialog
        open={pw.open}
        mode={pw.mode}
        error={pw.error}
        loading={pw.loading}
        onSubmit={submitLock}
        onCancel={() => setPw((s) => ({ ...s, open: false, error: '' }))}
      />

      {/* Reset password dialog (account / vault) */}
      {resetOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-[28px] border border-cream-200 bg-white shadow-warm-xl p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm" style={{ background: resetPurpose === 'vault' ? 'from-brand-mint to-emerald-500' : 'from-brand-rose to-pink-500' }}>
                {resetPurpose === 'vault' ? <Shield size={18} /> : <Mail size={18} />}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-ink-900">{resetPurpose === 'vault' ? 'Reset vault password' : 'Reset account password'}</h3>
                <p className="text-[13px] text-ink-500">Enter your email to receive a reset code for your {resetPurpose === 'vault' ? 'private vault' : 'account'}.</p>
              </div>
            </div>
            <form onSubmit={submitReset} className="space-y-4">
              <div>
                <label className="w-label block text-sm font-medium text-ink-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-grape/40 bg-cream-50/60"
                  placeholder="you@example.com"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setResetOpen(false)} className="flex-1 w-btn-soft py-3 text-sm font-bold">Cancel</button>
                <button type="submit" disabled={resetLoading} className="flex-1 w-btn-primary py-3 text-sm font-bold">
                  {resetLoading ? 'Sending…' : 'Send code'}
                </button>
              </div>
              <p className="text-center text-[12px] text-ink-400">
                {resetPurpose === 'vault' ? 'Only your vault password will be reset — your login stays the same.' : 'A reset code will be sent to your email.'}
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Header;