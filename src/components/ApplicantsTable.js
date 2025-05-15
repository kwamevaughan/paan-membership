import { useState } from "react";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import ColumnSelector from "./ColumnSelector";

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
    primaryContactName: true,
    primaryContactEmail: true,
    opening: true,
    status: true,
    primaryContactPhone: false,
    primaryContactLinkedin: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [columnWidths, setColumnWidths] = useState({
    primaryContactName: 150,
    primaryContactEmail: 150,
    opening: 150,
    status: 150,
    primaryContactPhone: 150,
    primaryContactLinkedin: 150,
  });

  const allColumns = [
    { key: "primaryContactName", label: "Name" },
    { key: "primaryContactEmail", label: "Email" },
    { key: "opening", label: "Opening" },
    { key: "status", label: "Status" },
    { key: "primaryContactPhone", label: "Phone" },
    { key: "primaryContactLinkedin", label: "LinkedIn" },
  ];

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(candidates.map((c) => c.id));
      toast.success(`Selected all ${candidates.length} candidates`, {
        icon: "✅",
      });
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

  // Column resize handler
const handleColumnResize = (e, columnKey) => {
  const startX = e.clientX;
  const startWidth = columnWidths[columnKey];

  const onMouseMove = (moveEvent) => {
    const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
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

  // Status badge renderer
  const getStatusBadge = (status) => {
    const baseStyle =
      "inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:scale-105";
    switch (status) {
      case "Pending":
        return (
          <span
            className={`${baseStyle} bg-amber-100/80 text-amber-900 backdrop-blur-md hover:bg-amber-200/90`}
          >
            <span className="mr-1.5 h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            {status}
          </span>
        );
      case "Reviewed":
        return (
          <span
            className={`${baseStyle} bg-blue-100/80 text-blue-900 backdrop-blur-md hover:bg-blue-200/90`}
          >
            <span className="mr-1.5 h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            {status}
          </span>
        );
      case "Shortlisted":
        return (
          <span
            className={`${baseStyle} bg-green-100/80 text-green-900 backdrop-blur-md hover:bg-green-200/90`}
          >
            <span className="mr-1.5 h-2.5 w-2.5 rounded-full bg-green-500"></span>
            {status}
          </span>
        );
      case "Rejected":
        return (
          <span
            className={`${baseStyle} bg-red-100/80 text-red-900 backdrop-blur-md hover:bg-red-200/90`}
          >
            <span className="mr-1.5 h-2.5 w-2.5 rounded-full bg-red-500"></span>
            {status}
          </span>
        );
      default:
        return (
          <span
            className={`${baseStyle} bg-gray-100/80 text-gray-900 backdrop-blur-md hover:bg-gray-200/90`}
          >
            <span className="mr-1.5 h-2.5 w-2.5 rounded-full bg-gray-500"></span>
            {status || "Pending"}
          </span>
        );
    }
  };

  // Sort icon renderer
  const getSortIcon = (field) => {
    if (sortField !== field)
      return (
        <Icon
          icon="heroicons:arrows-up-down"
          className="w-4 h-4 ml-1 opacity-60 transition-all hover:opacity-100"
        />
      );
    return sortDirection === "asc" ? (
      <Icon icon="heroicons:arrow-up" className="w-4 h-4 ml-1 text-[#f05d23]" />
    ) : (
      <Icon
        icon="heroicons:arrow-down"
        className="w-4 h-4 ml-1 text-[#f05d23]"
      />
    );
  };

  // Pagination logic
  const totalItems = candidates.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCandidates = candidates.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Theme-specific styles
  const isDark = mode === "dark";
  const cardBg = isDark
    ? "bg-gray-900/85 backdrop-blur-2xl"
    : "bg-white/85 backdrop-blur-2xl";
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const borderColor = isDark ? "border-gray-700/60" : "border-gray-200/60";
  const buttonHoverBg = isDark
    ? "hover:bg-gray-700/90"
    : "hover:bg-gray-100/90";
  const secondaryBg = isDark ? "bg-gray-800/70" : "bg-gray-50/70";

  return (
    <div
      className={`rounded-2xl overflow-hidden border ${borderColor} shadow-2xl ${cardBg} transition-all duration-300 animate-fade-in`}
    >
      {/* Accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#3c82f6] to-[#dbe9fe]"></div>

      {/* Toolbar */}
      <div
        className={`flex flex-col sm:flex-row justify-between items-center p-5 gap-4 border-b ${borderColor} ${secondaryBg} backdrop-blur-md`}
      >
        <div className="flex items-center gap-4">
          <h2 className={`text-2xl font-semibold ${textColor}`}>Applicants</h2>
          <span
            className={`bg-[#f05d23] text-white px-3 py-1 text-sm rounded-full font-medium shadow-md animate-pulse`}
          >
            {totalItems}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105 
                ${
                  isDark
                    ? "bg-red-600/80 hover:bg-red-700/90 backdrop-blur-md"
                    : "bg-red-500/80 hover:bg-red-600/90 backdrop-blur-md"
                } text-white shadow-md hover:shadow-xl`}
            >
              <Icon icon="heroicons:trash" className="w-5 h-5" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}
          <ColumnSelector
            allColumns={allColumns}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            mode={mode}
          />
          <button
            onClick={() => setIsExportModalOpen(true)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105 
              ${
                isDark
                  ? "bg-gray-700/80 hover:bg-gray-600/90 backdrop-blur-md"
                  : "bg-gray-100/80 hover:bg-gray-200/90 backdrop-blur-md"
              } ${textColor} shadow-md hover:shadow-xl`}
          >
            <Icon icon="heroicons:document-arrow-down" className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#f05d23]/80 scrollbar-track-gray-200/50">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead className="sticky top-0 z-10">
            <tr
              className={`${secondaryBg} border-b ${borderColor} backdrop-blur-md`}
            >
              <th className="sticky left-0 z-20 p-4 w-12">
                <div
                  className={`flex justify-center items-center h-6 w-6 border ${borderColor} rounded-lg ${secondaryBg} shadow-sm`}
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === candidates.length &&
                      candidates.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 accent-[#f05d23] cursor-pointer rounded focus:ring-2 focus:ring-[#f05d23]/50"
                    title="Select all candidates"
                  />
                </div>
              </th>
              {allColumns.map(
                (col) =>
                  visibleColumns[col.key] && (
                    <th
                      key={col.key}
                      className={`p-4 text-left font-medium text-sm ${
                        isDark ? "text-gray-200" : "text-gray-700"
                      } relative select-none`}
                      style={{ width: `${columnWidths[col.key]}px` }}
                    >
                      <div className="flex items-center">
                        <button
                          className={`inline-flex items-center rounded-lg px-3 py-1.5 transition-all duration-200 ${buttonHoverBg} hover:shadow-sm`}
                          onClick={() => onSort(col.key)}
                          title={`Sort by ${col.label}`}
                        >
                          {col.label} {getSortIcon(col.key)}
                        </button>
                        <div
                          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize ${
                            isDark
                              ? "bg-gray-600/50 hover:bg-gray-500/70"
                              : "bg-gray-300/50 hover:bg-gray-400/70"
                          } transition-all duration-200 rounded-r-md`}
                          onMouseDown={(e) => handleColumnResize(e, col.key)}
                          title="Resize column"
                        ></div>
                      </div>
                    </th>
                  )
              )}
              <th
                className={`p-4 text-left font-medium text-sm ${
                  isDark ? "text-gray-200" : "text-gray-700"
                } w-48`}
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {paginatedCandidates.map((candidate, index) => (
              <tr
                key={candidate.id}
                className={`group transition-all duration-200 border-b ${borderColor} ${
                  index % 2 === 0
                    ? isDark
                      ? "bg-gray-800/40"
                      : "bg-white/40"
                    : isDark
                    ? "bg-gray-750/40"
                    : "bg-gray-50/30"
                } hover:scale-[1.01] hover:shadow-md backdrop-blur-sm`}
              >
                <td className="sticky left-0 z-10 p-4">
                  <div
                    className={`flex justify-center items-center h-6 w-6 border ${borderColor} rounded-lg ${
                      index % 2 === 0
                        ? isDark
                          ? "bg-gray-800/40 group-hover:bg-gray-700/50"
                          : "bg-white/40 group-hover:bg-gray-100/50"
                        : isDark
                        ? "bg-gray-750/40 group-hover:bg-gray-700/50"
                        : "bg-gray-50/30 group-hover:bg-gray-100/50"
                    } backdrop-blur-sm shadow-sm`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(candidate.id)}
                      onChange={() => handleSelectRow(candidate.id)}
                      className="h-4 w-4 accent-[#f05d23] rounded focus:ring-2 focus:ring-[#f05d23]/50"
                    />
                  </div>
                </td>
                {visibleColumns.primaryContactName && (
                  <td
                    className={`p-4 ${textColor} font-medium text-sm`}
                    style={{ width: columnWidths.primaryContactName }}
                  >
                    {candidate.primaryContactName}
                  </td>
                )}
                {visibleColumns.primaryContactEmail && (
                  <td
                    className={`p-4 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    } text-sm`}
                    style={{ width: columnWidths.primaryContactEmail }}
                  >
                    {candidate.primaryContactEmail}
                  </td>
                )}
                {visibleColumns.opening && (
                  <td
                    className={`p-4 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    } text-sm`}
                    style={{ width: columnWidths.opening }}
                  >
                    {candidate.opening}
                  </td>
                )}
                {visibleColumns.status && (
                  <td className="p-4" style={{ width: columnWidths.status }}>
                    {getStatusBadge(candidate.status)}
                  </td>
                )}
                {visibleColumns.primaryContactPhone && (
                  <td
                    className={`p-4 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    } text-sm`}
                    style={{ width: columnWidths.primaryContactPhone }}
                  >
                    {candidate.primaryContactPhone || "—"}
                  </td>
                )}
                {visibleColumns.primaryContactLinkedin && (
                  <td
                    className={`p-4 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    } text-sm`}
                    style={{ width: columnWidths.primaryContactLinkedin }}
                  >
                    {candidate.primaryContactLinkedin ? (
                      <a
                        href={candidate.primaryContactLinkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#f05d23] hover:text-[#f28c5e] transition-all duration-200 flex items-center gap-1.5"
                      >
                        <Icon icon="mdi:linkedin" className="w-5 h-5" />
                        Profile
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                )}
                <td className="p-4 space-x-3">
                  <button
                    onClick={() => onViewCandidate(candidate)}
                    className={`px-4 py-2 rounded-lg inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200 transform hover:scale-105
                      ${
                        isDark
                          ? "text-gray-100 bg-gray-700/80 hover:bg-gray-600/90 backdrop-blur-md"
                          : "text-gray-700 bg-gray-100/80 hover:bg-gray-200/90 backdrop-blur-md"
                      } shadow-md hover:shadow-xl`}
                  >
                    <Icon icon="heroicons:eye" className="w-5 h-5" />
                    View
                  </button>
                  <button
                    onClick={() => onDeleteCandidate(candidate.id)}
                    className={`px-4 py-2 rounded-lg inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200 transform hover:scale-105
                      ${
                        isDark
                          ? "text-red-100 bg-red-900/60 hover:bg-red-800/80 backdrop-blur-md"
                          : "text-red-700 bg-red-100/80 hover:bg-red-200/90 backdrop-blur-md"
                      } shadow-md hover:shadow-xl`}
                  >
                    <Icon icon="heroicons:trash" className="w-5 h-5" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {paginatedCandidates.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center py-16 px-4 ${textColor} ${secondaryBg} backdrop-blur-md`}
          >
            <Icon
              icon="heroicons:inbox"
              className="w-16 h-16 text-gray-400 mb-4"
            />
            <h3 className="text-2xl font-semibold mb-2">No applicants found</h3>
            <p
              className={`text-center text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Try adjusting your filters or add new applicants.
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div
          className={`p-5 border-t flex justify-center items-center ${borderColor} flex flex-col sm:flex-row justify-between items-center gap-4 ${secondaryBg} backdrop-blur-md`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Showing {startIndex + 1}-{endIndex} of {totalItems} applicants
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <label
                className={`text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Per page:
              </label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className={`p-2 text-sm border rounded-lg ${
                  isDark
                    ? "bg-gray-800/80 text-white border-gray-600/60 backdrop-blur-md"
                    : "bg-white/80 text-gray-800 border-gray-300/60 backdrop-blur-md"
                } focus:ring-2 focus:ring-[#f05d23]/50 transition-all duration-200 shadow-sm hover:shadow-md`}
              >
                {[5, 10, 25, 50].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex rounded-lg shadow-sm">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border ${borderColor} 
                  ${
                    currentPage === 1
                      ? isDark
                        ? "bg-gray-800/60 text-gray-500"
                        : "bg-gray-100/60 text-gray-400"
                      : isDark
                      ? "bg-gray-700/90 text-gray-200 hover:bg-gray-600/90 backdrop-blur-md"
                      : "bg-white/80 text-gray-600 hover:bg-gray-50/90 backdrop-blur-md"
                  } transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105`}
              >
                <span className="sr-only">First Page</span>
                <Icon
                  icon="heroicons:chevron-double-left"
                  className="h-5 w-5"
                />
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-3 py-2 border-t border-b ${borderColor} 
                  ${
                    currentPage === 1
                      ? isDark
                        ? "bg-gray-800/60 text-gray-500"
                        : "bg-gray-100/60 text-gray-400"
                      : isDark
                      ? "bg-gray-700/90 text-gray-200 hover:bg-gray-600/90 backdrop-blur-md"
                      : "bg-white/80 text-gray-600 hover:bg-gray-50/90 backdrop-blur-md"
                  } transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105`}
              >
                <span className="sr-only">Previous</span>
                <Icon icon="heroicons:chevron-left" className="h-5 w-5" />
              </button>

              <div
                className={`relative inline-flex items-center px-4 py-2 border-t border-b ${borderColor} 
                ${
                  isDark
                    ? "bg-gray-700/90 text-white backdrop-blur-md"
                    : "bg-white/80 text-gray-700 backdrop-blur-md"
                } shadow-md`}
              >
                <span className="text-sm font-medium">Page</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      handlePageChange(page);
                    }
                  }}
                  className={`w-14 text-center mx-2 py-1 rounded-lg border ${
                    isDark
                      ? "bg-gray-800/80 text-white border-gray-600/60 backdrop-blur-md"
                      : "bg-white/80 text-gray-800 border-gray-300/60 backdrop-blur-md"
                  } focus:ring-2 focus:ring-[#f05d23]/50 transition-all duration-200 shadow-sm`}
                />
                <span className="text-sm font-medium">of {totalPages}</span>
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-3 py-2 border-t border-b ${borderColor} 
                  ${
                    currentPage === totalPages
                      ? isDark
                        ? "bg-gray-800/60 text-gray-500"
                        : "bg-gray-100/60 text-gray-400"
                      : isDark
                      ? "bg-gray-700/90 text-gray-200 hover:bg-gray-600/90 backdrop-blur-md"
                      : "bg-white/80 text-gray-600 hover:bg-gray-50/90 backdrop-blur-md"
                  } transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105`}
              >
                <span className="sr-only">Next</span>
                <Icon icon="heroicons:chevron-right" className="h-5 w-5" />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border ${borderColor} 
                  ${
                    currentPage === totalPages
                      ? isDark
                        ? "bg-gray-800/60 text-gray-500"
                        : "bg-gray-100/60 text-gray-400"
                      : isDark
                      ? "bg-gray-700/90 text-gray-200 hover:bg-gray-600/90 backdrop-blur-md"
                      : "bg-white/80 text-gray-600 hover:bg-gray-50/90 backdrop-blur-md"
                  } transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105`}
              >
                <span className="sr-only">Last Page</span>
                <Icon
                  icon="heroicons:chevron-double-right"
                  className="h-5 w-5"
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}