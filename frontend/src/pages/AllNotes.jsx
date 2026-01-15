
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ItemCard from '../components/ItemCard';
import api from '../api/axios';

const AllNotes = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/items?type=note');
      setItems(res.data.items);
    } catch (e) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (item) => {
    try {
      await api.patch(`/items/${item._id}/favorite`);
      fetchNotes();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await api.delete(`/items/${item._id}`);
      toast.success('Deleted');
      fetchNotes();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleCopy = async (item) => {
    try {
      const textToCopy = `${item.name}\n\n${item.content}`;
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Notes" />
      <div className="p-4 space-y-2">
        {items.map(item => (
          <ItemCard
            key={item._id}
            item={item}
            onClick={() => setSelectedItem(item)}
            onFavorite={handleFavorite}
            onCopy={handleCopy}
            onRename={() => {}}
            onDuplicate={() => {}}
            onDelete={handleDelete}
            onShare={() => {}}
            onLock={() => {}}
          />
        ))}
        {items.length === 0 && (
          <p className="text-center text-gray-500 py-8">No notes yet</p>
        )}
      </div>

      <BottomNav />

      {/* View Note Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-bold">{selectedItem.name}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {selectedItem.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllNotes;