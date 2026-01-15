import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ItemCard from '../components/ItemCard';
import api from '../api/axios';

const Folders = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        try {
            const response = await api.get('/items?type=folder');
            setItems(response.data.items);
        } catch (error) {
            toast.error('Failed to load');
        } finally {
            setLoading(false);
        }
    };

    const handleFavorite = async (item) => {
        try {
            await api.patch(`/items/${item._id}/favorite`);
            fetchFolders();
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${item.name}"?`)) return;
        try {
            await api.delete(`/items/${item._id}`);
            toast.success('Deleted');
            fetchFolders();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleCopy = async (item) => {
        try {
            const textToCopy = `Name: ${item.name}\nType: ${item.type}`;
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
            <Header title="Folders" />
            <div className="p-4 space-y-2">
                {items.map(item => (
                    <ItemCard
                        key={item._id}
                        item={item}
                        onClick={() => navigate(`/folder/${item._id}`)}
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
                    <p className="text-center text-gray-500 py-8">No folders yet</p>
                )}
            </div>
            <BottomNav />
        </div>
    );
};

export default Folders;