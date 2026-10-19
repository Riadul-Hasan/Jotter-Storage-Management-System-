import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { KeyRound, ShieldCheck } from 'lucide-react';
import api from '../api/axios';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, code } = location.state || {};
  const purpose = location.state?.purpose === 'vault' ? 'vault' : 'account';
  const isVault = purpose === 'vault';

  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.password !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        email,
        code,
        password: passwords.password,
        confirmPassword: passwords.confirmPassword
      });

      if (res.data?.purpose === 'vault') {
        toast.success('Vault password reset — your vault is ready');
        navigate('/locked-folder');
      } else {
        toast.success('Password reset successfully');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !code) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-ink-500 mb-4">This reset session expired. Please start again.</p>
          <Link to="/forgot-password" className="text-brand-grape hover:underline font-bold">
            Start over
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[28px] shadow-warm-lg border border-cream-200 p-8">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-grape to-purple-500 text-white shadow-[0_8px_20px_rgba(139,92,246,0.3)] mx-auto mb-5">
          {isVault ? <ShieldCheck size={24} /> : <KeyRound size={24} />}
        </div>
        <h1 className="text-2xl font-display font-bold text-center mb-2 text-ink-900">
          {isVault ? 'New vault password' : 'Reset password'}
        </h1>
        <p className="text-ink-500 text-center mb-6 text-sm">Enter your new password</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwords.password}
              onChange={(e) => setPasswords({...passwords, password: e.target.value})}
              required
              minLength={isVault ? 4 : 6}
              className="w-full px-4 py-2.5 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-grape/40 bg-cream-50/60"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              required
              minLength={isVault ? 4 : 6}
              className="w-full px-4 py-2.5 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-grape/40 bg-cream-50/60"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink-900 text-white py-3 rounded-xl font-bold hover:bg-ink-700 transition disabled:bg-ink-300"
          >
            {loading ? 'Resetting…' : isVault ? 'Reset Vault Password' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;