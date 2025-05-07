import { Icon } from "@iconify/react";

export default function TableHeader({
    allColumns,
    visibleColumns,
    sortField,
    sortDirection,
    onSort,
    selectedIds,
    candidates,
    handleSelectAll,
    mode,
}) {
    const getSortIcon = (field) => {
        if (sortField !== field)
            return <Icon icon="mdi:sort" className="w-4 sm:w-5 h-4 sm:h-5 ml-1 opacity-50" />;
        return sortDirection === "asc" ? (
            <Icon icon="mdi:sort-ascending" className="w-4 sm:w-5 h-4 sm:h-5 ml-1" />
        ) : (
            <Icon icon="mdi:sort-descending" className="w-4 sm:w-5 h-4 sm:h-5 ml-1" />
        );
    };

    return (
        <thead className="sticky top-0 z-10">
            <tr className={`${mode === "dark" ? "bg-gray-800 text-white" : "bg-gray-200 text-[#231812]"}`}>
                <th className="p-2 sm:p-5">
                    <input
                        type="checkbox"
                        checked={selectedIds.length === candidates.length && candidates.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-[#f05d23] border-gray-300 rounded focus:ring-[#f05d23]"
                    />
                </th>
                {allColumns.map(
                    (col) =>
                        visibleColumns[col.key] && (
                            <th
                                key={col.key}
                                className="p-2 sm:p-5 text-left text-xs sm:text-sm font-semibold cursor-pointer"
                                onClick={() => onSort(col.key)}
                            >
                                <span className="inline-flex items-center">
                                    {col.label} {getSortIcon(col.key)}
                                </span>
                            </th>
                        )
                )}
                <th className="p-2 sm:p-5 text-left text-xs sm:text-sm font-semibold">Actions</th>
            </tr>
        </thead>
    );
}