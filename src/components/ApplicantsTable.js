import { useState } from "react";
import toast from "react-hot-toast";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import MobileCard from "./MobileCard";
import ColumnSelector from "./ColumnSelector";
import PaginationControls from "./PaginationControls";
import { Icon } from "@iconify/react";

export default function ApplicantsTable({
    candidates,
    mode,
    onViewCandidate,
    onDeleteCandidate,
    onSort,
    sortField,
    sortDirection,
    selectedIds,
    setSelectedIds,
    handleBulkDelete,
    setIsExportModalOpen,
}) {
    const [visibleColumns, setVisibleColumns] = useState({
        full_name: true,
        email: true,
        opening: true,
        status: true,
        phone: false,
        linkedin: false,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [columnWidths, setColumnWidths] = useState({
        full_name: 150,
        email: 200,
        opening: 150,
        status: 100,
        phone: 150,
        linkedin: 200,
    });

    const allColumns = [
        { key: "full_name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "opening", label: "Opening" },
        { key: "status", label: "Status" },
        { key: "phone", label: "Phone" },
        { key: "linkedin", label: "LinkedIn" },
    ];

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(candidates.map((c) => c.id));
            toast.success(`Selected all ${candidates.length} candidates`, { icon: "✅" });
        } else {
            setSelectedIds([]);
            toast.success("Cleared selection", { icon: "✅" });
        }
    };

    const handleSelectRow = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };

    const handleColumnResize = (e, columnKey) => {
        const startX = e.clientX;
        const startWidth = columnWidths[columnKey];

        const onMouseMove = (moveEvent) => {
            const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX)); // Min width of 50px
            setColumnWidths((prevWidths) => ({
                ...prevWidths,
                [columnKey]: newWidth,
            }));
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    // Pagination logic
    const totalItems = candidates.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedCandidates = candidates.slice(startIndex, endIndex);

    return (
        <div
            className={`rounded-lg shadow-lg overflow-hidden border-t-4 border-[#f05d23] ${
                mode === "dark" ? "bg-gray-800" : "bg-white"
            }`}
        >
            <div className="flex flex-col sm:flex-row justify-between items-center p-2 gap-4">
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className={`px-4 py-2 rounded-full flex items-center gap-2 transition duration-200 shadow-md ${
                            mode === "dark"
                                ? "bg-red-700 text-white hover:bg-red-600"
                                : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                    >
                        <Icon icon="mdi:trash-can" width={20} height={20} />
                        Delete Selected ({selectedIds.length})
                    </button>
                )}
                <div className="flex items-center gap-4 ml-auto">
                    <ColumnSelector
                        allColumns={allColumns}
                        visibleColumns={visibleColumns}
                        setVisibleColumns={setVisibleColumns}
                        mode={mode}
                    />
                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        className={`px-4 py-2 rounded-full flex items-center gap-2 transition duration-200 shadow-md ${
                            mode === "dark"
                                ? "bg-[#f05d23] text-white hover:bg-[#d94f1e]"
                                : "bg-[#f05d23] text-white hover:bg-[#d94f1e]"
                        }`}
                    >
                        <Icon icon="mdi:export" width={20} height={20} />
                        Export
                    </button>
                </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#f05d23] scrollbar-track-gray-200">
                <table className="w-full hidden sm:table">
                    <TableHeader
                        allColumns={allColumns}
                        visibleColumns={visibleColumns}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={onSort}
                        selectedIds={selectedIds}
                        candidates={candidates}
                        handleSelectAll={handleSelectAll}
                        mode={mode}
                        columnWidths={columnWidths}
                        onColumnResize={handleColumnResize} // Pass the resize handler to TableHeader
                    />
                    <tbody>
                        {paginatedCandidates.map((candidate, index) => (
                            <TableRow
                                key={candidate.id}
                                candidate={candidate}
                                index={index}
                                visibleColumns={visibleColumns}
                                selectedIds={selectedIds}
                                handleSelectRow={handleSelectRow}
                                onViewCandidate={onViewCandidate}
                                onDeleteCandidate={onDeleteCandidate}
                                mode={mode}
                                columnWidths={columnWidths} // Pass column widths to TableRow
                            />
                        ))}
                    </tbody>
                </table>

                <div className="sm:hidden space-y-4 p-2">
                    {paginatedCandidates.map((candidate) => (
                        <MobileCard
                            key={candidate.id}
                            candidate={candidate}
                            visibleColumns={visibleColumns}
                            selectedIds={selectedIds}
                            handleSelectRow={handleSelectRow}
                            onViewCandidate={onViewCandidate}
                            onDeleteCandidate={onDeleteCandidate}
                            mode={mode}
                        />
                    ))}
                </div>

                {paginatedCandidates.length === 0 && (
                    <p
                        className={`text-center p-4 italic ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}
                    >
                        No applicants available on this page.
                    </p>
                )}
            </div>

            {totalItems > 0 && (
                <PaginationControls
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    totalItems={totalItems}
                    totalPages={totalPages}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    mode={mode}
                />
            )}
        </div>
    );
}
