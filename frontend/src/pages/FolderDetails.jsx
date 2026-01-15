import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ItemCard from '../components/ItemCard';
import api from '../api/axios';

const FolderDetails = () => {
  const { id } = useParams();
  const [folder, setFolder] = useState(null);
  const [items, setItems] = useState([]);
  const [showUnlock, setShowUnlock] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchFolder();
  }, [id]);

  const fetchFolder = async () => {
    try {
      const res = await api.get(`/folders/${id}/contents`);
      if (res.data.isLocked && !res.data.items) {
        setShowUnlock(true);
      } else {
        setFolder(res.data.folder);
        setItems(res.data.items);
      }
    } catch (error) {
      toast.error('Failed to load');
    }
  };

  const handleUnlock = async () => {
    try {
      const res = await api.post(`/folders/${id}/unlock`, { password });
      if (res.data.success) {
        setShowUnlock(false);
        fetchFolder();
      }
    } catch (error) {
      toast.error('Incorrect password');
    }
  };

  if (showUnlock) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Folder Locked</h2>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />
          <button onClick={handleUnlock} className="w-full bg-black text-white py-2 rounded-lg">
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title={folder?.name || 'Folder'} showSearch={false} />
      <div className="p-4 space-y-2">
        {items.map(item => (
          <ItemCard
            key={item._id}
            item={item}
            onFavorite={async (i) => { await api.patch(`/items/${i._id}/favorite`); fetchFolder(); }}
            onCopy={() => {}}
            onRename={() => {}}
            onDuplicate={() => {}}
            onDelete={() => {}}
            onShare={() => {}}
            onLock={() => {}}
          />
        ))}
      </div>
      <BottomNav />
    </div>
  );
};

export default FolderDetails;