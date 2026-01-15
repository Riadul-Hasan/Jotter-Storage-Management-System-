// import { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import Header from '../components/Header';
// import BottomNav from '../components/BottomNav';
// import ItemCard from '../components/ItemCard';
// import api from '../api/axios';

// const AllImages = () => {
//     const [items, setItems] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedItem, setSelectedItem] = useState(null);

//     useEffect(() => {
//         fetchImages();
//     }, []);

//     const fetchImages = async () => {
//         try {
//             const res = await api.get('/items?type=image');
//             setItems(res.data.items);
//         } catch (e) {
//             toast.error('Failed to load images');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleFavorite = async (item) => {
//         try {
//             await api.patch(`/items/${item._id}/favorite`);
//             fetchImages();
//         } catch (error) {
//             toast.error('Failed to update');
//         }
//     };

//     const handleDelete = async (item) => {
//         if (!window.confirm(`Delete "${item.name}"?`)) return;
//         try {
//             await api.delete(`/items/${item._id}`);
//             toast.success('Deleted');
//             fetchImages();
//         } catch (error) {
//             toast.error('Failed to delete');
//         }
//     };

//     const handleCopy = async (item) => {
//         try {
//             const textToCopy = `Name: ${item.name}\nType: Image`;
//             await navigator.clipboard.writeText(textToCopy);
//             toast.success('Copied to clipboard!');
//         } catch (error) {
//             toast.error('Failed to copy');
//         }
//     };

//     // Helper function to get file extension from filePath
//     const getFileExtension = (filePath) => {
//         return filePath.split('.').pop();
//     };

//     // Helper function to create a proper download URL
//     const getDownloadUrl = (item) => {
//         const extension = getFileExtension(item.filePath);
//         const fileName = `${item.name}.${extension}`;
//         return `http://localhost:5000${item.filePath}?download=true&filename=${encodeURIComponent(fileName)}`;
//     };

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50 pb-20">
//             <Header title="Images" />
//             <div className="p-4 space-y-2">
//                 {items.map(item => (
//                     <ItemCard
//                         key={item._id}
//                         item={item}
//                         onClick={() => setSelectedItem(item)}
//                         onFavorite={handleFavorite}
//                         onCopy={handleCopy}
//                         onRename={() => { }}
//                         onDuplicate={() => { }}
//                         onDelete={handleDelete}
//                         onShare={() => { }}
//                         onLock={() => { }}
//                     />
//                 ))}
//                 {items.length === 0 && (
//                     <p className="text-center text-gray-500 py-8">No images yet</p>
//                 )}
//             </div>

//             <BottomNav />

//             {/* View Image Modal */}
//             {selectedItem && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//                         <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
//                             <h2 className="text-lg font-bold">{selectedItem.name}</h2>
//                             <button
//                                 onClick={() => setSelectedItem(null)}
//                                 className="text-gray-600 hover:text-gray-900 text-2xl"
//                             >
//                                 ×
//                             </button>
//                         </div>
//                         <div className="p-4">
//                             <img
//                                 src={`http://localhost:5000${selectedItem.filePath}`}
//                                 alt={selectedItem.name}
//                                 className="w-full h-auto rounded-lg"
//                             />
//                             <a
//                                 href={getDownloadUrl(selectedItem)}
//                                 download={`${selectedItem.name}.${getFileExtension(selectedItem.filePath)}`}
//                                 className="mt-4 flex items-center gap-2 justify-center bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
//                             >
//                                 Download Image
//                             </a>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AllImages;


import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaDownload } from 'react-icons/fa';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ItemCard from '../components/ItemCard';
import api from '../api/axios';

const AllImages = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const res = await api.get('/items?type=image');
            setItems(res.data.items);
        } catch (e) {
            toast.error('Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    const handleFavorite = async (item) => {
        try {
            await api.patch(`/items/${item._id}/favorite`);
            fetchImages();
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${item.name}"?`)) return;
        try {
            await api.delete(`/items/${item._id}`);
            toast.success('Deleted');
            fetchImages();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleCopy = async (item) => {
        try {
            const textToCopy = `Name: ${item.name}\nType: Image`;
            await navigator.clipboard.writeText(textToCopy);
            toast.success('Copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy');
        }
    };

    // ✅ FIXED: Proper download handler
    const handleDownload = async (item) => {
        try {
            const response = await fetch(`http://localhost:5000${item.filePath}`);
            const blob = await response.blob();
            
            // Get file extension from filePath
            const extension = item.filePath.split('.').pop();
            const fileName = `${item.name}.${extension}`;
            
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
            toast.error('Failed to download image');
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
            <Header title="Images" />
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
                    <p className="text-center text-gray-500 py-8">No images yet</p>
                )}
            </div>

            <BottomNav />

            {/* View Image Modal */}
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
                            <img
                                src={`http://localhost:5000${selectedItem.filePath}`}
                                alt={selectedItem.name}
                                className="w-full h-auto rounded-lg"
                            />
                            <button
                                onClick={() => handleDownload(selectedItem)}
                                className="mt-4 w-full flex items-center gap-2 justify-center bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                            >
                                <FaDownload /> Download Image
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllImages;