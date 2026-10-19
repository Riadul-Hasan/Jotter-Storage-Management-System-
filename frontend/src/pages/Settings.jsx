import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { User, Lock, Bell, Palette, Shield, Trash2, LogOut, ArrowRight, Mail, Phone, KeyRound, ShieldCheck } from 'lucide-react';
import PageShell from '../components/PageShell';
import api from '../api/axios';
import { cx } from '../utils/format';

const SETTINGS = [
  { key: 'profile', icon: User, label: 'Profile', desc: 'Name, email and avatar', accent: 'from-brand-sky to-blue-500', to: '/profile' },
  { key: 'password', icon: Lock, label: 'Change password', desc: 'Update your account password', accent: 'from-brand-rose to-pink-500' },
  { key: 'reset-account', icon: KeyRound, label: 'Reset account password', desc: 'Forgot your login password? Reset via email', accent: 'from-brand-rose to-pink-500' },
  { key: 'reset-vault', icon: ShieldCheck, label: 'Reset vault password', desc: 'Forgot your vault password? Reset via email', accent: 'from-brand-mint to-emerald-500' },
  { key: 'notifications', icon: Bell, label: 'Notifications', desc: 'Get alerts about your items', accent: 'from-brand-sun to-amber-500' },
  { key: 'appearance', icon: Palette, label: 'Appearance', desc: 'Warm light theme and colours', accent: 'from-brand-grape to-purple-500' },
  { key: 'privacy', icon: Shield, label: 'Data & privacy', desc: 'Manage your data and vault', accent: 'from-brand-mint to-emerald-500' },
  { key: 'delete', icon: Trash2, label: 'Delete account', desc: 'Remove your account and data', accent: 'from-red-500 to-rose-600', danger: true },
];

const Settings = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetPurpose, setResetPurpose] = useState('account');

  const handleSignout = async () => {
    try {
      await api.post('/auth/logout');
      toast.success('Logged out — see you soon!');
      window.location.href = '/login';
    } catch {
      toast.error('Logout failed');
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
      toast.success(`Reset code sent to ${resetEmail}`);
      setResetOpen(false);
      navigate('/verify-code', { state: { email: resetEmail, purpose: resetPurpose } });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send code');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <PageShell title="Settings" subtitle="Tailor Jotter to your liking" accent="grape">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <div className="grid gap-3">
          {SETTINGS.map((s) => {
            const isActive = active === s.key;
            return (
              <motion.div
                key={s.key}
                whileHover={{ scale: [1, 1.02, 1] }}
                whileTap={{ scale: 0.98 }}
                className={cx(
                  'group relative flex items-center gap-4 rounded-[22px] border border-cream-200 bg-white/85 px-4 py-4 shadow-warm-xs cursor-pointer transition-all',
                  isActive ? 'bg-brand-grape/10 border-brand-grape/20' : 'hover:bg-white hover:shadow-warm-sm'
                )}
                onClick={() => {
                  if (s.key === 'delete') { setActive('delete'); return; }
                  if (s.key === 'reset-account') { openReset('account'); return; }
                  if (s.key === 'reset-vault') { openReset('vault'); return; }
                  if (s.to) { window.location.href = s.to; }
                  setActive(s.key);
                }}
              >
                <div className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-sm', isActive ? s.accent : 'from-brand-coral to-brand-tangerine')}>
                  <s.icon size={17} strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-ink-900">{s.label}</h4>
                  <p className="text-[12.5px] text-ink-500">{s.desc}</p>
                </div>
                <ArrowRight size={16} className={cx('text-ink-300 group-hover:text-brand-grape transition', isActive && 'text-brand-grape')} />
                {s.danger && <span className="text-[11px] font-bold text-rose-600">{s.desc}</span>}
              </motion.div>
            );
          })}
        </div>

        {active === 'delete' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 rounded-[26px] border border-rose-200 bg-rose-50 p-5 sm:p-6 shadow-warm-sm"
          >
            <div className="flex items-start gap-3">
              <Trash2 size={20} className="mt-0.5 text-rose-600 shrink-0" />
              <div>
                <h4 className="font-bold text-rose-900">Delete your account</h4>
                <p className="text-sm text-rose-700 mt-1">This permanently removes your account and all your items. It cannot be undone.</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setActive(null)} className="flex-1 w-btn-soft py-2.5 text-sm font-bold text-ink-700">Cancel</button>
              <button type="button" onClick={handleSignout} className="flex-1 w-btn-danger py-2.5 text-sm font-bold">Sign out</button>
            </div>
          </motion.div>
        )}

        {/* Reset password dialog */}
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
                  {resetPurpose === 'vault' ? <ShieldCheck size={18} /> : <KeyRound size={18} />}
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
      </motion.div>
    </PageShell>
  );
};

export default Settings;