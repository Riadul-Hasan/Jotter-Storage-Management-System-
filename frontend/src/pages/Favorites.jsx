import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ItemCard from '../components/ItemCard';
import api from '../api/axios';
import { FaDownload } from 'react-icons/fa';

const Favorites = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const response = await api.get('/items?favorite=true');
            setItems(response.data.items);
        } catch (error) {
            toast.error('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (item) => {
        try {
            const response = await fetch(`http://localhost:5000${item.filePath}`);
            const blob = await response.blob();

            const extension = item.filePath.split('.').pop();
            const fileName = `${item.name}.${extension}`;

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Download started!');
        } catch (error) {
            toast.error('Failed to download');
            console.error('Download error:', error);
        }
    };

    const handleFavorite = async (item) => {
        try {
            await api.patch(`/items/${item._id}/favorite`);
            toast.success('Removed from favorites');
            fetchFavorites();
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${item.name}"?`)) return;
        try {
            await api.delete(`/items/${item._id}`);
            toast.success('Item deleted');
            fetchFavorites();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleCopy = async (item) => {
        try {
            let textToCopy = `Name: ${item.name}\nType: ${item.type}`;
            if (item.type === 'note' && item.content) {
                textToCopy += `\n\n${item.content}`;
            }
            await navigator.clipboard.writeText(textToCopy);
            toast.success('Copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy');
        }
    };

    const handleItemClick = (item) => {
        // Only open modal for viewable items (not folders)
        if (item.type !== 'folder') {
            setSelectedItem(item);
        }
    };

    // Helper function for download URLs
    const getDownloadUrl = (item) => {
        return `http://localhost:5000${item.filePath}`;
    };

    // Helper function for download filename
    const getDownloadFilename = (item) => {
        const extension = item.filePath.split('.').pop();
        return `${item.name}.${extension}`;
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
            <Header title="Favorites" />

            <div className="p-4 space-y-2">
                {items.map(item => (
                    <ItemCard
                        key={item._id}
                        item={item}
                        onClick={handleItemClick}
                        onFavorite={handleFavorite}
                        onCopy={handleCopy}
                        onRename={() => { }}
                        onDuplicate={() => { }}
                        onDelete={handleDelete}
                        onShare={() => { }}
                        onLock={() => { }}
                    />
                ))}
                {items.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No favorites yet</p>
                        <p className="text-gray-400 text-sm mt-2">
                            Tap the ♡ icon on any item to add it to favorites
                        </p>
                    </div>
                )}
            </div>

            <BottomNav />

            {/* View Item Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
                            <h2 className="text-lg font-bold">{selectedItem.name}</h2>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="text-gray-600 hover:text-gray-900 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4">
                            {/* Note View */}
                            {selectedItem.type === 'note' && (
                                <>
                                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed mb-4">
                                        {selectedItem.content}
                                    </div>
                                    <button
                                        onClick={() => handleCopy(selectedItem)}
                                        className="w-full flex items-center gap-2 justify-center bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                                    >
                                        Copy Content
                                    </button>
                                </>
                            )}

                            {/* Image View */}
                            {selectedItem.type === 'image' && (
                                <>
                                    <img
                                        src={getDownloadUrl(selectedItem)}
                                        alt={selectedItem.name}
                                        className="w-full h-auto rounded-lg mb-4"
                                    />
                                    <button
                                        onClick={() => handleDownload(selectedItem)}
                                        className="w-full flex items-center gap-2 justify-center bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                                    >
                                        <FaDownload /> Download Image
                                    </button>
                                </>
                            )}

                            {/* PDF View */}
                            {selectedItem.type === 'pdf' && (
                                <>
                                    <iframe
                                        src={getDownloadUrl(selectedItem)}
                                        className="w-full h-[600px] border rounded-lg mb-4"
                                        title={selectedItem.name}
                                    />
                                    <button
                                        onClick={() => handleDownload(selectedItem)}
                                        className="w-full flex items-center gap-2 justify-center bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                                    >
                                        <FaDownload /> Download PDF
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Favorites;