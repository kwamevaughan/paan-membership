import { Icon } from "@iconify/react";

export default function PaginationControls({
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    mode,
}) {
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page
    };

    return (
        <div
            className={`p-4 flex flex-col sm:flex-row justify-center items-center gap-4 ${
                mode === "dark" ? "bg-gray-800" : "bg-white"
            }`}
        >
            <div className="flex items-center gap-2">
                <label className={`${mode === "dark" ? "text-gray-300" : "text-[#231812]"} text-sm`}>
                    Items per page:
                </label>
                <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className={`p-1 border rounded-lg ${
                        mode === "dark"
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white text-[#231812] border-gray-300"
                    }`}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        currentPage === 1
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : mode === "dark"
                            ? "bg-[#f05d23] text-white hover:bg-[#d94f1e]"
                            : "bg-[#f05d23] text-white hover:bg-[#d94f1e]"
                    } transition duration-200`}
                >
                    <Icon icon="mdi:chevron-left" width={20} height={20} />
                    Previous
                </button>
                <span className={`${mode === "dark" ? "text-gray-300" : "text-[#231812]"}`}>
                    Page {currentPage} of {totalPages} ({startIndex + 1}-{endIndex} of {totalItems})
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        currentPage === totalPages
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : mode === "dark"
                            ? "bg-[#f05d23] text-white hover:bg-[#d94f1e]"
                            : "bg-[#f05d23] text-white hover:bg-[#d94f1e]"
                    } transition duration-200`}
                >
                    Next
                    <Icon icon="mdi:chevron-right" width={20} height={20} />
                </button>
            </div>
        </div>
    );
}
