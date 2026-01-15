import { useState, useEffect } from 'react';
import { FaSearch, FaBars, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';

const Header = ({ title, onSearch, showSearch = true }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockPassword, setLockPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasLockPassword, setHasLockPassword] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  useEffect(() => {
    checkLockPassword();
  }, []);

  const checkLockPassword = async () => {
    try {
      const response = await api.get('/auth/me');
      // Check if user has set a lock password (you'll need to add this field to user model)
      setHasLockPassword(response.data.user.hasLockPassword || false);
    } catch (error) {
      console.error('Failed to check lock password');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleLockClick = () => {
    setShowLockModal(true);
    setIsSettingPassword(!hasLockPassword);
    setLockPassword('');
    setConfirmPassword('');
  };

  const handleSetPassword = async () => {
    if (lockPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    if (lockPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await api.post('/profile/set-lock-password', { lockPassword });
      toast.success('Lock password set successfully!');
      setHasLockPassword(true);
      setShowLockModal(false);
      setLockPassword('');
      setConfirmPassword('');
      // Navigate to locked folder
      navigate('/locked-folder');
    } catch (error) {
      toast.error('Failed to set password');
    }
  };

  const handleUnlockFolder = async () => {
    try {
      const response = await api.post('/profile/verify-lock-password', { lockPassword });
      if (response.data.success) {
        toast.success('Access granted!');
        setShowLockModal(false);
        setLockPassword('');
        // Navigate to locked folder
        navigate('/locked-folder');
      }
    } catch (error) {
      toast.error('Incorrect password!');
      setLockPassword('');
    }
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900">{title || 'Jotter'}</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLockClick} 
              className="text-gray-600 hover:text-blue-600 transition"
              title="Private Folder"
            >
              <FaLock size={20} />
            </button>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-600 relative"
            >
              <FaBars size={20} />
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        navigate('/profile');
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>

        {showSearch && (
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Lock Password Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              🔒 {isSettingPassword ? 'Set Lock Password' : 'Private Folder'}
            </h2>
            
            {isSettingPassword ? (
              <>
                <p className="text-gray-600 mb-4">
                  Create a password to protect your private folder
                </p>
                <input
                  type="password"
                  placeholder="Enter password (min 4 characters)"
                  value={lockPassword}
                  onChange={(e) => setLockPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                  autoFocus
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSetPassword()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSetPassword}
                    className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
                  >
                    Set Password
                  </button>
                  <button
                    onClick={() => {
                      setShowLockModal(false);
                      setLockPassword('');
                      setConfirmPassword('');
                    }}
                    className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Enter password to access private folder
                </p>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={lockPassword}
                  onChange={(e) => setLockPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUnlockFolder()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUnlockFolder}
                    className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
                  >
                    Unlock
                  </button>
                  <button
                    onClick={() => {
                      setShowLockModal(false);
                      setLockPassword('');
                    }}
                    className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;