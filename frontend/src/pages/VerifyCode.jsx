import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const VerifyCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
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
        navigate('/reset-password', { state: { email, code } });
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Email not provided</p>
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Verify Code</h1>
        <p className="text-gray-600 text-center mb-6">
          Enter the 6-digit code sent to {email}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition disabled:bg-gray-100"
          >
            {resending ? 'Resending...' : 'Resend Code'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyCode;