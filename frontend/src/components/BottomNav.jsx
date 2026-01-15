import { useNavigate, useLocation } from 'react-router-dom';
import { AiFillHome, AiFillHeart, AiFillCalendar } from 'react-icons/ai';
import { FaUser, FaPlus } from 'react-icons/fa';

const BottomNav = ({ onAddClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // If onAddClick is not provided, navigate to home to add
  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      // Navigate to home if not already there, then show add modal
      if (location.pathname !== '/home') {
        navigate('/home', { state: { openAddModal: true } });
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-50">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <button
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center ${isActive('/home') ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <AiFillHome size={24} />
          <span className="text-xs mt-1">Home</span>
        </button>

        <button
          onClick={() => navigate('/favorites')}
          className={`flex flex-col items-center ${isActive('/favorites') ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <AiFillHeart size={24} />
          <span className="text-xs mt-1">Favorite</span>
        </button>

        <button
          onClick={handleAddClick}
          className="flex items-center justify-center w-14 h-14 bg-black text-white rounded-full -mt-6 shadow-lg hover:bg-gray-800 transition"
        >
          <FaPlus size={24} />
        </button>

        <button
          onClick={() => navigate('/calendar')}
          className={`flex flex-col items-center ${isActive('/calendar') ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <AiFillCalendar size={24} />
          <span className="text-xs mt-1">Calendar</span>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center ${isActive('/profile') ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <FaUser size={24} />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;