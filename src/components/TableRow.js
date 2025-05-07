import { Icon } from "@iconify/react";

export default function TableRow({
    candidate,
    index,
    visibleColumns,
    selectedIds,
    handleSelectRow,
    onViewCandidate,
    onDeleteCandidate,
    mode,
}) {
    const percentage = candidate.questions.length
        ? Math.round((candidate.score / (candidate.questions.length * 10)) * 100)
        : 0;

    const getStatusBadge = (status) => {
        const baseStyle =
            "inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold shadow-sm";
        switch (status) {
            case "Pending":
                return <span className={`${baseStyle} bg-yellow-100 text-yellow-800`}>{status}</span>;
            case "Reviewed":
                return <span className={`${baseStyle} bg-[#f28c5e] text-white`}>{status}</span>;
            case "Shortlisted":
                return <span className={`${baseStyle} bg-green-100 text-green-800`}>{status}</span>;
            case "Rejected":
                return <span className={`${baseStyle} bg-red-100 text-red-800`}>{status}</span>;
            default:
                return <span className={`${baseStyle} bg-gray-100 text-gray-800`}>{status || "Pending"}</span>;
        }
    };

    return (
        <tr
            className={`border-b hover:bg-opacity-80 transition duration-200 animate-fade-in ${
                index % 2 === 0
                    ? mode === "dark"
                        ? "bg-gray-900"
                        : "bg-gray-50"
                    : mode === "dark"
                        ? "bg-gray-800"
                        : "bg-white"
            } ${
                mode === "dark" ? "border-gray-700 hover:bg-gray-700 text-white" : "border-gray-200 hover:bg-gray-100 text-[#231812]"
            }`}
        >
            <td className="p-2 sm:p-5">
                <input
                    type="checkbox"
                    checked={selectedIds.includes(candidate.id)}
                    onChange={() => handleSelectRow(candidate.id)}
                    className="h-4 w-4 text-[#f05d23] border-gray-300 rounded focus:ring-[#f05d23]"
                />
            </td>
            {visibleColumns.full_name && <td className="p-2 sm:p-5 text-xs sm:text-base">{candidate.full_name}</td>}
            {visibleColumns.email && <td className="p-2 sm:p-5 text-xs sm:text-base">{candidate.email}</td>}
            {visibleColumns.opening && <td className="p-2 sm:p-5 text-xs sm:text-base">{candidate.opening}</td>}
            {visibleColumns.score && (
                <td className="p-2 sm:p-5 text-xs sm:text-base">
                    {candidate.score}/{candidate.questions.length * 10} ({percentage}%)
                </td>
            )}
            {visibleColumns.status && (
                <td className="p-2 sm:p-5 text-xs sm:text-base">{getStatusBadge(candidate.status)}</td>
            )}
            {visibleColumns.phone && <td className="p-2 sm:p-5 text-xs sm:text-base">{candidate.phone || "-"}</td>}
            {visibleColumns.linkedin && (
                <td className="p-2 sm:p-5 text-xs sm:text-base">{candidate.linkedin || "-"}</td>
            )}
            <td className="p-2 sm:p-5 text-xs sm:text-base flex flex-col sm:flex-row gap-2">
                <button
                    onClick={() => onViewCandidate(candidate)}
                    className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-1 sm:gap-2 transition duration-200 shadow-md text-xs sm:text-base ${
                        mode === "dark"
                            ? "bg-gray-700 text-[#f05d23] hover:bg-gray-600"
                            : "bg-gray-200 text-[#f05d23] hover:bg-gray-300"
                    }`}
                >
                    <Icon icon="mdi:eye" width={16} height={16} />
                    View
                </button>
                <button
                    onClick={() => onDeleteCandidate(candidate.id)}
                    className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full flex items-center gap-1 sm:gap-2 transition duration-200 shadow-md text-xs sm:text-base ${
                        mode === "dark"
                            ? "bg-red-700 text-white hover:bg-red-600"
                            : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                >
                    <Icon icon="mdi:trash-can" width={16} height={16} />
                    Delete
                </button>
            </td>
        </tr>
    );
}