import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export default function ColumnSelector({ allColumns, visibleColumns, setVisibleColumns, mode }) {
    const handleToggleColumn = (key) => {
        setVisibleColumns((prev) => {
            const newState = { ...prev, [key]: !prev[key] };
            const visibleCount = Object.values(newState).filter(Boolean).length;
            if (visibleCount === 0) {
                toast.error("At least one column must be visible!", { icon: "⚠️" });
                return prev;
            }
            toast.success(`${newState[key] ? "Show" : "Hide"} ${allColumns.find((c) => c.key === key).label}`, {
                icon: "✅",
            });
            return newState;
        });
    };

    return (
        <div className="relative group">
            <button
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition duration-200 shadow-md ${
                    mode === "dark"
                        ? "bg-gray-700 text-[#f05d23] hover:bg-gray-600"
                        : "bg-gray-200 text-[#f05d23] hover:bg-gray-300"
                }`}
            >
                <Icon icon="mdi:table-column" width={20} height={20} />
                Columns
            </button>
            <div
                className={`absolute right-0 top-full mt-0 w-48 hidden group-hover:flex flex-col ${
                    mode === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-black"
                } rounded-lg shadow-lg z-50 border ${mode === "dark" ? "border-gray-700" : "border-gray-200"}`}
            >
                {allColumns.map((col) => (
                    <label
                        key={col.key}
                        className={`flex items-center gap-2 p-2 hover:${mode === "dark" ? "bg-gray-700" : "bg-gray-100"} cursor-pointer transition-colors`}
                    >
                        <input
                            type="checkbox"
                            checked={visibleColumns[col.key]}
                            onChange={() => handleToggleColumn(col.key)}
                            className="h-4 w-4 text-[#f05d23] border-gray-300 rounded focus:ring-[#f05d23]"
                        />
                        <span className={`text-sm ${mode === "dark" ? "text-gray-300" : "text-[#231812]"}`}>
                            {col.label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}