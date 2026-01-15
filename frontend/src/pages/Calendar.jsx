// import { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import Header from '../components/Header';
// import BottomNav from '../components/BottomNav';
// import ItemCard from '../components/ItemCard';
// import api from '../api/axios';

// const Calendar = () => {
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [items, setItems] = useState([]);
//   const [currentMonth, setCurrentMonth] = useState(new Date());

//   useEffect(() => {
//     fetchItems();
//   }, [selectedDate]); // FIXED: This will now re-fetch when date changes

//   const fetchItems = async () => {
//     try {
//       const dateStr = selectedDate.toISOString().split('T')[0];
//       const response = await api.get(`/items?date=${dateStr}`);
//       setItems(response.data.items);
//     } catch (error) {
//       toast.error('Failed to load items');
//     }
//   };

//   const getDaysInMonth = () => {
//     const year = currentMonth.getFullYear();
//     const month = currentMonth.getMonth();
//     const firstDay = new Date(year, month, 1).getDay();
//     const daysInMonth = new Date(year, month + 1, 0).getDate();

//     const days = [];
//     for (let i = 0; i < firstDay; i++) {
//       days.push(null);
//     }
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push(new Date(year, month, i));
//     }
//     return days;
//   };

//   const handleFavorite = async (item) => {
//     try {
//       await api.patch(`/items/${item._id}/favorite`);
//       fetchItems();
//     } catch (error) {
//       toast.error('Failed to update');
//     }
//   };

//   const handlePrevMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
//   };

//   const handleNextMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20">
//       <Header title="Calendar" showSearch={false} />

//       <div className="p-4">
//         <div className="bg-white p-4 rounded-lg shadow mb-4">
//           <div className="flex items-center justify-between mb-4">
//             <button 
//               onClick={handlePrevMonth}
//               className="px-3 py-1 hover:bg-gray-100 rounded"
//             >
//               ← Prev
//             </button>
//             <h2 className="font-bold">
//               {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
//             </h2>
//             <button 
//               onClick={handleNextMonth}
//               className="px-3 py-1 hover:bg-gray-100 rounded"
//             >
//               Next →
//             </button>
//           </div>

//           <div className="grid grid-cols-7 gap-2">
//             {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
//               <div key={day} className="text-center text-xs text-gray-600 font-semibold">
//                 {day}
//               </div>
//             ))}
//             {getDaysInMonth().map((day, i) => (
//               <div
//                 key={i}
//                 onClick={() => day && setSelectedDate(day)}
//                 className={`aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer
//                   ${!day ? 'invisible' : ''}
//                   ${day && day.toDateString() === selectedDate.toDateString() ? 'bg-black text-white' : 'hover:bg-gray-100'}
//                 `}
//               >
//                 {day?.getDate()}
//               </div>
//             ))}
//           </div>
//         </div>

//         <h3 className="font-semibold mb-2">
//           Items for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
//         </h3>
//         <div className="space-y-2">
//           {items.map(item => (
//             <ItemCard
//               key={item._id}
//               item={item}
//               onFavorite={handleFavorite}
//               onCopy={() => {}}
//               onRename={() => {}}
//               onDuplicate={() => {}}
//               onDelete={() => {}}
//               onShare={() => {}}
//               onLock={() => {}}
//             />
//           ))}
//           {items.length === 0 && (
//             <p className="text-center text-gray-500 py-8">No items for this date</p>
//           )}
//         </div>
//       </div>

//       <BottomNav />
//     </div>
//   );
// };

// export default Calendar;


import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ItemCard from '../components/ItemCard';
import api from '../api/axios';

const Calendar = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [items, setItems] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetchItems();
    }, [selectedDate]);

    const fetchItems = async () => {
        try {
            // ✅ FIXED: Format date in local timezone (YYYY-MM-DD)
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            console.log('Fetching items for date:', dateStr); // Debug log

            const response = await api.get(`/items?date=${dateStr}`);
            setItems(response.data.items);
        } catch (error) {
            toast.error('Failed to load items');
        }
    };

    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const handleFavorite = async (item) => {
        try {
            await api.patch(`/items/${item._id}/favorite`);
            fetchItems();
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header title="Calendar" showSearch={false} />

            <div className="p-4">
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={handlePrevMonth}
                            className="px-3 py-1 hover:bg-gray-100 rounded"
                        >
                            ← Prev
                        </button>
                        <h2 className="font-bold">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button
                            onClick={handleNextMonth}
                            className="px-3 py-1 hover:bg-gray-100 rounded"
                        >
                            Next →
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-center text-xs text-gray-600 font-semibold">
                                {day}
                            </div>
                        ))}
                        {getDaysInMonth().map((day, i) => (
                            <div
                                key={i}
                                onClick={() => day && setSelectedDate(day)}
                                className={`aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer
                  ${!day ? 'invisible' : ''}
                  ${day && day.toDateString() === selectedDate.toDateString() ? 'bg-black text-white' : 'hover:bg-gray-100'}
                `}
                            >
                                {day?.getDate()}
                            </div>
                        ))}
                    </div>
                </div>

                <h3 className="font-semibold mb-2">
                    Items for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <div className="space-y-2">
                    {items.map(item => (
                        <ItemCard
                            key={item._id}
                            item={item}
                            onFavorite={handleFavorite}
                            onCopy={() => { }}
                            onRename={() => { }}
                            onDuplicate={() => { }}
                            onDelete={() => { }}
                            onShare={() => { }}
                            onLock={() => { }}
                        />
                    ))}
                    {items.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No items for this date</p>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default Calendar;