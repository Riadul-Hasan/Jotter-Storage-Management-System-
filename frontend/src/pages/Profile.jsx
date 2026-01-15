import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import api from '../api/axios';
import { FaUser, FaCog, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setUser(response.data.user);
      setUsername(response.data.user.username);
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', username);
    if (avatar) formData.append('avatar', avatar);

    try {
      await api.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile updated');
      setShowEditModal(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Profile" showSearch={false} />
      
      <div className="p-4">
        <div className="bg-white p-6 rounded-lg shadow mb-4 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <FaUser size={40} className="text-gray-400" />
            )}
          </div>
          <h2 className="text-xl font-bold">{user.username}</h2>
          <p className="text-gray-600 text-sm">{user.email}</p>
          <button
            onClick={() => setShowEditModal(true)}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg"
          >
            Edit Profile
          </button>
        </div>

        <div className="bg-white rounded-lg shadow divide-y">
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50"
          >
            <FaCog size={20} />
            <span>Settings</span>
          </button>
          <button
            onClick={() => navigate('/support')}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50"
          >
            <FaQuestionCircle size={20} />
            <span>Support</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-red-600"
          >
            <FaSignOutAlt size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <BottomNav />

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files[0])}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-black text-white py-2 rounded-lg">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;