import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function TableStatusGrid({ tables, loading, stats, onRefresh }) {

  const navigate = useNavigate();

  const handleTableClick = (table) => {
    if (table.is_occupied) {
      // Navigate to the checkout page with the table ID
      navigate(`/restaurant/admin/checkout/${table.public_id}`);
    } else {
      // Optional: Open a drawer for available tables
      console.log("Table is available");
    }
  };


  const getTableStatus = (table) => {
    if (table.is_occupied) {
      return { color: "bg-red-500", label: "Occupied" };
    }
    if (table.is_reserved_manual) {
      return { color: "bg-amber-500", label: "Reserved" };
    }
    if (!table.is_active) {
      return { color: "bg-gray-400", label: "Inactive" };
    }
    return { color: "bg-emerald-500", label: "Available" };
  };

  // Count each status from the tables array
  const counts = tables.reduce(
    (acc, table) => {
      if (table.is_occupied) acc.occupied += 1;
      else if (table.is_reserved_manual) acc.reserved += 1;
      else if (!table.is_active) acc.inactive += 1;
      else acc.available += 1;
      return acc;
    },
    { available: 0, occupied: 0, reserved: 0, inactive: 0 }
  );

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900">
      {/* 1. Header Section (Pinned) */}
      <div className=" p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800 dark:text-white leading-none">
            Floor Plan
          </h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-semibold">
            Live status
          </p>
          <p className="text-[12px] text-gray-400 dark:text-gray-500leading-snug">
            Real-time overview of all tables — track availability, occupancy, and reservations across the floor.
          </p>
        </div>
      </div>

      {/* 2. Compact Stats Bar (Pinned) */}
      <div className="flex-none grid grid-cols-4 gap-2 px-4 py-3 bg-gray-50/50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <p className="text-[9px] uppercase text-gray-400 font-bold">Free</p>
          <p className="text-sm font-black text-emerald-500 leading-tight">
            {stats.available}
          </p>
        </div>
        <div className="text-center border-l border-gray-200 dark:border-gray-700">
          <p className="text-[9px] uppercase text-gray-400 font-bold">Busy</p>
          <p className="text-sm font-black text-red-500 leading-tight">
            {stats.occupied}
          </p>
        </div>
        <div className="text-center border-l border-gray-200 dark:border-gray-700">
          <p className="text-[9px] uppercase text-gray-400 font-bold">Hold</p>
          <p className="text-sm font-black text-amber-500 leading-tight">
            {stats.reserved}
          </p>
        </div>
        <div className="text-center border-l border-gray-200 dark:border-gray-700">
          <p className="text-[9px] uppercase text-gray-400 font-bold">Total</p>
          <p className="text-sm font-black dark:text-white leading-tight">
            {stats.total}
          </p>
        </div>
      </div>

      {/* 3. Scrollable Table Grid Area */}
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        {loading && tables.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-gray-400 animate-pulse">
            Loading Floor Map...
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2">
            {tables.map((table) => {
              const status = getTableStatus(table);
              return (
                <div
                  key={table.public_id}
                  onClick={() => handleTableClick(table)}
                  className={`flex flex-col justify-between p-2 rounded-lg border border-transparent 
                    ${status.color} text-white min-h-[68px] transition-transform active:scale-95 shadow-sm`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-black leading-none">
                      {table.table_number}
                    </span>
                    <Users size={10} className="opacity-60" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase truncate leading-tight opacity-90">
                      {status.label}
                    </span>
                    <span className="text-[8px] font-medium opacity-75">
                      Cap: {table.capacity}P
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Legend with counts (Pinned at Bottom) */}
      <div className="flex-none p-2 px-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-bold uppercase tracking-tighter text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Available
          <span className="ml-0.5 text-emerald-500">{counts.available}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Occupied
          <span className="ml-0.5 text-red-500">{counts.occupied}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Reserved
          <span className="ml-0.5 text-amber-500">{counts.reserved}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          Inactive
          <span className="ml-0.5 text-gray-400">{counts.inactive}</span>
        </div>
      </div>
    </div>
  );
}