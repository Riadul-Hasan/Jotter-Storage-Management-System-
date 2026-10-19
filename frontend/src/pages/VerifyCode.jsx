import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const VerifyCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const purpose = location.state?.purpose === 'vault' ? 'vault' : 'account';
  const isVault = purpose === 'vault';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/verify-code', { email, code });

      if (response.data.success) {
        toast.success('Code verified successfully');
        navigate('/reset-password', { state: { email, code, purpose } });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid code';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);

    try {
      const response = await api.post('/auth/resend-code', { email });

      if (response.data.success) {
        toast.success('New code sent to your email');
        setCode('');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend code';
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-ink-500 mb-4">Email not provided</p>
          <Link to="/forgot-password" className="text-brand-grape hover:underline font-bold">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[28px] shadow-warm-lg border border-cream-200 p-8">
        <h1 className="text-2xl font-display font-bold text-center mb-2 text-ink-900">Verify Code</h1>
        <p className="text-ink-500 text-center mb-6 text-sm">
          Enter the 6-digit code sent to {email}
          {isVault && <span className="block mt-1 font-semibold text-brand-grape">for your vault password reset</span>}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              className="w-full px-4 py-2.5 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-grape/40 bg-cream-50/60 text-center text-2xl tracking-widest font-bold text-ink-900"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-ink-900 text-white py-3 rounded-xl font-bold hover:bg-ink-700 transition disabled:bg-ink-300"
          >
            {loading ? 'Verifying…' : 'Verify Code'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full bg-white border border-cream-300 text-ink-700 py-3 rounded-xl font-bold hover:bg-cream-100 transition disabled:bg-cream-100"
          >
            {resending ? 'Resending…' : 'Resend Code'}
          </button>
        </form>

        <p className="text-center text-ink-500 mt-6 text-sm">
          <Link to="/login" className="text-brand-grape hover:underline font-bold">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyCode;