import { useState } from 'react';
import { FaEllipsisV, FaHeart, FaRegHeart, FaCopy, FaEdit, FaTrash, FaShare, FaLock } from 'react-icons/fa';
import { MdContentCopy } from 'react-icons/md';

const ItemCard = ({ item, onFavorite, onCopy, onRename, onDuplicate, onDelete, onShare, onLock, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getIcon = () => {
    switch (item.type) {
      case 'folder':
        return '📁';
      case 'note':
        return '📝';
      case 'image':
        return '🖼️';
      case 'pdf':
        return '📄';
      default:
        return '📄';
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    try {
      const d = new Date(date);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div 
      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick && onClick(item)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">{getIcon()}</span>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span>{formatDate(item.createdAt)}</span>
              {item.fileSize > 0 && (
                <>
                  <span>•</span>
                  <span>{formatSize(item.fileSize)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {item.password && <FaLock className="text-gray-400" size={14} />}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(item);
            }}
            className="text-gray-600 hover:text-red-500"
          >
            {item.isFavorite ? <FaHeart className="text-red-500" size={18} /> : <FaRegHeart size={18} />}
          </button>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <FaEllipsisV size={16} />
            </button>

            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onFavorite(item);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {item.isFavorite ? <FaHeart /> : <FaRegHeart />}
                    <span>{item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onCopy(item);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    <FaCopy />
                    <span>Copy</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onRename(item);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    <FaEdit />
                    <span>Rename</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDuplicate(item);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    <MdContentCopy />
                    <span>Duplicate</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onShare(item);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    <FaShare />
                    <span>Share</span>
                  </button>

                  {item.type === 'folder' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onLock(item);
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      <FaLock />
                      <span>{item.password ? 'Unlock' : 'Lock'}</span>
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete(item);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    <FaTrash />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;