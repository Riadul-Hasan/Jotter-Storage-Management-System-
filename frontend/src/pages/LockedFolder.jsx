import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaLock } from 'react-icons/fa'; // ✅ ADDED THIS IMPORT
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ItemCard from '../components/ItemCard';
import api from '../api/axios';

const LockedFolder = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState('');
  const [formData, setFormData] = useState({ name: '', content: '', file: null });
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameItem, setRenameItem] = useState(null);
  const [newName, setNewName] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchLockedItems();
  }, []);

  const fetchLockedItems = async () => {
    try {
      const response = await api.get('/items/locked');
      setItems(response.data.items);
    } catch (error) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append('type', addType);
      data.append('name', formData.name);
      data.append('isLocked', 'true'); // Mark as locked item
      
      if (addType === 'note') {
        data.append('content', formData.content);
      }
      
      if (formData.file) {
        data.append('file', formData.file);
      }

      await api.post('/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(`${addType.charAt(0).toUpperCase() + addType.slice(1)} added to private folder`);
      setShowAddModal(false);
      setAddType('');
      setFormData({ name: '', content: '', file: null });
      fetchLockedItems();
    } catch (error) {
      toast.error('Failed to create item');
    }
  };

  const handleFavorite = async (item) => {
    try {
      await api.patch(`/items/${item._id}/favorite`);
      fetchLockedItems();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;

    try {
      await api.delete(`/items/${item._id}`);
      toast.success('Item deleted');
      fetchLockedItems();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleCopy = async (item) => {
    try {
      const textToCopy = `Name: ${item.name}\nType: ${item.type}\nCreated: ${new Date(item.createdAt).toLocaleDateString()}`;
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleDuplicate = async (item) => {
    try {
      await api.post(`/items/${item._id}/duplicate`);
      toast.success('Item duplicated');
      fetchLockedItems();
    } catch (error) {
      toast.error('Failed to duplicate');
    }
  };

  const handleShare = async (item) => {
    try {
      const response = await api.post(`/items/${item._id}/share`);
      navigator.clipboard.writeText(response.data.shareLink);
      toast.success('Share link copied');
    } catch (error) {
      toast.error('Failed to generate share link');
    }
  };

  const handleRename = (item) => {
    setRenameItem(item);
    setNewName(item.name);
    setShowRenameModal(true);
  };

  const submitRename = async () => {
    try {
      await api.put(`/items/${renameItem._id}`, { name: newName });
      toast.success('Item renamed');
      setShowRenameModal(false);
      fetchLockedItems();
    } catch (error) {
      toast.error('Failed to rename');
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
      <Header title="🔒 Private Folder" showSearch={false} />

      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            🔐 This is your private folder. Only you can access items here.
          </p>
        </div>

        <div className="space-y-2">
          {items.map(item => (
            <ItemCard
              key={item._id}
              item={item}
              onClick={(item) => setSelectedItem(item)}
              onFavorite={handleFavorite}
              onCopy={handleCopy}
              onRename={handleRename}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onShare={handleShare}
              onLock={() => {}}
            />
          ))}
          {items.length === 0 && (
            <div className="text-center py-12">
              <FaLock className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No items in private folder yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Add First Item
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNav onAddClick={() => setShowAddModal(true)} />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            {!addType ? (
              <>
                <h2 className="text-xl font-bold mb-4">Add to Private Folder</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setAddType('note')}
                    className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    📝 Note
                  </button>
                  <button
                    onClick={() => setAddType('image')}
                    className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    🖼️ Image
                  </button>
                  <button
                    onClick={() => setAddType('pdf')}
                    className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    📄 PDF
                  </button>
                  <button
                    onClick={() => setAddType('folder')}
                    className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    📁 Folder
                  </button>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full mt-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <form onSubmit={handleAdd}>
                <h2 className="text-xl font-bold mb-4">
                  Create {addType.charAt(0).toUpperCase() + addType.slice(1)}
                </h2>
                
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                />

                {addType === 'note' && (
                  <textarea
                    placeholder="Content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                  />
                )}

                {(addType === 'image' || addType === 'pdf') && (
                  <input
                    type="file"
                    accept={addType === 'image' ? 'image/*' : '.pdf'}
                    onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
                    required
                    className="w-full mb-3"
                  />
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setAddType('');
                      setFormData({ name: '', content: '', file: null });
                    }}
                    className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Rename Item</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={submitRename}
                className="flex-1 bg-black text-white py-2 rounded-lg"
              >
                Rename
              </button>
              <button
                onClick={() => setShowRenameModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-bold">View Item</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {selectedItem.type === 'note' && (
                <>
                  <h3 className="text-xl font-bold mb-4">{selectedItem.name}</h3>
                  <div className="whitespace-pre-wrap text-gray-700">{selectedItem.content}</div>
                </>
              )}
              {selectedItem.type === 'image' && (
                <>
                  <h3 className="text-xl font-bold mb-4">{selectedItem.name}</h3>
                  <img 
                    src={`http://localhost:5000${selectedItem.filePath}`} 
                    alt={selectedItem.name}
                    className="w-full h-auto rounded-lg"
                  />
                </>
              )}
              {selectedItem.type === 'pdf' && (
                <>
                  <h3 className="text-xl font-bold mb-4">{selectedItem.name}</h3>
                  <iframe
                    src={`http://localhost:5000${selectedItem.filePath}`}
                    className="w-full h-96 border rounded-lg"
                    title={selectedItem.name}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LockedFolder;