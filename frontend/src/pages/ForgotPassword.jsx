import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { KeyRound, ShieldCheck } from 'lucide-react';
import api from '../api/axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const purpose = location.state?.purpose === 'vault' ? 'vault' : 'account';
  const isVault = purpose === 'vault';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email, purpose });

      if (response.data.success) {
        toast.success('Verification code sent to your email');
        navigate('/verify-code', { state: { email, purpose } });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send code';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[28px] shadow-warm-lg border border-cream-200 p-8">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-grape to-purple-500 text-white shadow-[0_8px_20px_rgba(139,92,246,0.3)] mx-auto mb-5">
          {isVault ? <ShieldCheck size={24} /> : <KeyRound size={24} />}
        </div>
        <h1 className="text-2xl font-display font-bold text-center mb-2 text-ink-900">
          {isVault ? 'Reset vault password' : 'Forgot password'}
        </h1>
        <p className="text-ink-500 text-center mb-6 text-sm">
          {isVault
            ? 'Enter your account email and we will send you a code to reset your private vault password.'
            : 'Enter your email to receive a verification code.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-grape/40 bg-cream-50/60"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink-900 text-white py-3 rounded-xl font-bold hover:bg-ink-700 transition disabled:bg-ink-300"
          >
            {loading ? 'Sending…' : 'Send Code'}
          </button>
        </form>

        <p className="text-center text-ink-500 mt-6 text-sm">
          Remember your password?{' '}
          <Link to="/login" className="text-brand-grape hover:underline font-bold">
            Sign In
          </Link>
        </p>
        {isVault && (
          <p className="text-center mt-2 text-[12px] text-ink-400">
            Only your vault password will be changed — your login stays the same.
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;