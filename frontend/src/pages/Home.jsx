import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ItemCard from '../components/ItemCard';
import api from '../api/axios';
import { useLocation } from 'react-router-dom';


const Home = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentItems, setRecentItems] = useState([]);
    const [allRecentItems, setAllRecentItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addType, setAddType] = useState('');
    const [formData, setFormData] = useState({ name: '', content: '', file: null });
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [renameItem, setRenameItem] = useState(null);
    const [newName, setNewName] = useState('');
    const [showLockModal, setShowLockModal] = useState(false);
    const [lockItem, setLockItem] = useState(null);
    const [lockPassword, setLockPassword] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const location = useLocation();



    // Check if we should open add modal from navigation
    useEffect(() => {
        if (location.state?.openAddModal) {
            setShowAddModal(true);
            // Clear the state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, recentRes] = await Promise.all([
                api.get('/items/stats'),
                api.get('/items/recent')
            ]);

            setStats(statsRes.data.stats);
            setRecentItems(recentRes.data.items);
            setAllRecentItems(recentRes.data.items);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    };

    const handleSearch = (query) => {
        if (query) {
            const filtered = allRecentItems.filter(item =>
                item.name.toLowerCase().includes(query.toLowerCase())
            );
            setRecentItems(filtered);
        } else {
            setRecentItems(allRecentItems);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();
            data.append('type', addType);
            data.append('name', formData.name);

            if (addType === 'note') {
                data.append('content', formData.content);
            }

            if (formData.file) {
                data.append('file', formData.file);
            }

            await api.post('/items', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success(`${addType.charAt(0).toUpperCase() + addType.slice(1)} created successfully`);
            setShowAddModal(false);
            setAddType('');
            setFormData({ name: '', content: '', file: null });
            fetchData();
        } catch (error) {
            toast.error('Failed to create item');
        }
    };

    const handleFavorite = async (item) => {
        try {
            await api.patch(`/items/${item._id}/favorite`);
            toast.success(item.isFavorite ? 'Removed from favorites' : 'Added to favorites');
            fetchData();
        } catch (error) {
            toast.error('Failed to update favorite');
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${item.name}"?`)) return;

        try {
            await api.delete(`/items/${item._id}`);
            toast.success('Item deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete item');
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
            toast.success('Item duplicated successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to duplicate item');
        }
    };

    const handleShare = async (item) => {
        try {
            const response = await api.post(`/items/${item._id}/share`);
            navigator.clipboard.writeText(response.data.shareLink);
            toast.success('Share link copied to clipboard');
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
            toast.success('Item renamed successfully');
            setShowRenameModal(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to rename item');
        }
    };

    const handleLock = (item) => {
        setLockItem(item);
        setLockPassword('');
        setShowLockModal(true);
    };

    const submitLock = async () => {
        try {
            if (lockItem.password) {
                await api.post(`/folders/${lockItem._id}/remove-lock`, { password: lockPassword });
                toast.success('Lock removed successfully');
            } else {
                await api.post(`/folders/${lockItem._id}/lock`, { password: lockPassword });
                toast.success('Folder locked successfully');
            }
            setShowLockModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update lock');
        }
    };

    const handleItemClick = (item) => {
        if (item.type === 'folder') {
            navigate(`/folder/${item._id}`);
        } else {
            setSelectedItem(item);
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
            <Header title="Jotter" onSearch={handleSearch} />

            <div className="p-4 space-y-4">
                {/* Storage Card */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Storage</h2>
                        <span className="text-sm text-gray-600">
                            {formatBytes(stats?.usedStorage)} / 15 GB
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(stats?.usedStorage / stats?.totalStorage) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Category Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div
                        onClick={() => navigate('/folders')}
                        className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition"
                    >
                        <div className="text-3xl mb-2">📁</div>
                        <h3 className="font-semibold">Folders</h3>
                        <p className="text-sm text-gray-600">{stats?.folders.count} items</p>
                        <p className="text-xs text-gray-500">{formatBytes(stats?.folders.size)}</p>
                    </div>

                    <div
                        onClick={() => navigate('/notes')}
                        className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition"
                    >
                        <div className="text-3xl mb-2">📝</div>
                        <h3 className="font-semibold">Notes</h3>
                        <p className="text-sm text-gray-600">{stats?.notes.count} items</p>
                        <p className="text-xs text-gray-500">{formatBytes(stats?.notes.size)}</p>
                    </div>

                    <div
                        onClick={() => navigate('/images')}
                        className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition"
                    >
                        <div className="text-3xl mb-2">🖼️</div>
                        <h3 className="font-semibold">Images</h3>
                        <p className="text-sm text-gray-600">{stats?.images.count} items</p>
                        <p className="text-xs text-gray-500">{formatBytes(stats?.images.size)}</p>
                    </div>

                    <div
                        onClick={() => navigate('/pdfs')}
                        className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition"
                    >
                        <div className="text-3xl mb-2">📄</div>
                        <h3 className="font-semibold">PDFs</h3>
                        <p className="text-sm text-gray-600">{stats?.pdfs.count} items</p>
                        <p className="text-xs text-gray-500">{formatBytes(stats?.pdfs.size)}</p>
                    </div>
                </div>

                {/* Recent Items */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">Recent</h2>
                    <div className="space-y-2">
                        {recentItems.map(item => (
                            <ItemCard
                                key={item._id}
                                item={item}
                                onClick={handleItemClick}
                                onFavorite={handleFavorite}
                                onCopy={handleCopy}
                                onRename={handleRename}
                                onDuplicate={handleDuplicate}
                                onDelete={handleDelete}
                                onShare={handleShare}
                                onLock={handleLock}
                            />
                        ))}
                        {recentItems.length === 0 && (
                            <p className="text-center text-gray-500 py-8">No items found</p>
                        )}
                    </div>
                </div>
            </div>

            <BottomNav onAddClick={() => setShowAddModal(true)} />

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        {!addType ? (
                            <>
                                <h2 className="text-xl font-bold mb-4">Create New</h2>
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

            {/* Lock Modal */}
            {showLockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">
                            {lockItem?.password ? 'Remove Lock' : 'Lock Folder'}
                        </h2>
                        <input
                            type="password"
                            placeholder="Enter password (4-6 digits)"
                            value={lockPassword}
                            onChange={(e) => setLockPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={submitLock}
                                className="flex-1 bg-black text-white py-2 rounded-lg"
                            >
                                {lockItem?.password ? 'Remove' : 'Lock'}
                            </button>
                            <button
                                onClick={() => setShowLockModal(false)}
                                className="flex-1 border border-gray-300 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Item Details Modal */}
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
                                    <a
                                        href={`http://localhost:5000${selectedItem.filePath}`}
                                        download
                                        className="mt-4 flex items-center gap-2 justify-center bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                                    >
                                        Download
                                    </a>
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
                                    <a
                                        href={`http://localhost:5000${selectedItem.filePath}`}
                                        download
                                        className="mt-4 flex items-center gap-2 justify-center bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                                    >
                                        Download PDF
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;