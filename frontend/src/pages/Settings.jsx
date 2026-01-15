import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import api from '../api/axios';

const Settings = () => {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await api.post('/profile/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
        confirmPassword: passwords.confirm
      });
      toast.success('Password changed');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt('Enter your password to delete account:');
    if (!password) return;
    try {
      await api.delete('/profile', { data: { password } });
      toast.success('Account deleted');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Settings" showSearch={false} />
      <div className="p-4 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              placeholder="Current Password"
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwords.new}
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <button type="submit" className="w-full bg-black text-white py-2 rounded-lg">
              Change Password
            </button>
          </form>
        </div>

        <button onClick={() => navigate('/terms')} className="w-full  bg-white p-4 rounded-lg shadow text-left">
          Terms & Conditions
        </button>
        <button onClick={() => navigate('/about')} className="w-full bg-white p-4 rounded-lg shadow text-left">
          About Us
        </button>
        <button onClick={handleDeleteAccount} className="w-full bg-red-600 text-white p-4 rounded-lg shadow">
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Settings;