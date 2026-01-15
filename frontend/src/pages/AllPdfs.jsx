import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaDownload } from 'react-icons/fa';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ItemCard from '../components/ItemCard';
import api from '../api/axios';

const AllPdfs = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchPdfs();
    }, []);

    const fetchPdfs = async () => {
        try {
            const res = await api.get('/items?type=pdf');
            setItems(res.data.items);
        } catch (e) {
            toast.error('Failed to load PDFs');
        } finally {
            setLoading(false);
        }
    };

    const handleFavorite = async (item) => {
        try {
            await api.patch(`/items/${item._id}/favorite`);
            fetchPdfs();
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${item.name}"?`)) return;
        try {
            await api.delete(`/items/${item._id}`);
            toast.success('Deleted');
            fetchPdfs();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleCopy = async (item) => {
        try {
            const textToCopy = `Name: ${item.name}\nType: PDF`;
            await navigator.clipboard.writeText(textToCopy);
            toast.success('Copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy');
        }
    };

    // ✅ FIXED: Proper download handler for PDF
    const handleDownload = async (item) => {
        try {
            const response = await fetch(`http://localhost:5000${item.filePath}`);
            const blob = await response.blob();

            const fileName = `${item.name}.pdf`;

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Download started!');
        } catch (error) {
            toast.error('Failed to download PDF');
            console.error('Download error:', error);
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
            <Header title="PDFs" />
            <div className="p-4 space-y-2">
                {items.map(item => (
                    <ItemCard
                        key={item._id}
                        item={item}
                        onClick={() => setSelectedItem(item)}
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
                    <p className="text-center text-gray-500 py-8">No PDFs yet</p>
                )}
            </div>

            <BottomNav />

            {/* View PDF Modal */}
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
                            <iframe
                                src={`http://localhost:5000${selectedItem.filePath}`}
                                className="w-full h-[600px] border rounded-lg"
                                title={selectedItem.name}
                            />
                            <button
                                onClick={() => handleDownload(selectedItem)}
                                className="mt-4 w-full flex items-center gap-2 justify-center bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                            >
                                <FaDownload /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllPdfs;