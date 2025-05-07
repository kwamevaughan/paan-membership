import { Icon } from "@iconify/react";

export default function MobileCard({
    candidate,
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
        <div
            className={`p-3 rounded-lg border animate-fade-in ${
                mode === "dark" ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-800"
            }`}
        >
            <div className="flex items-center gap-2 mb-2">
                <input
                    type="checkbox"
                    checked={selectedIds.includes(candidate.id)}
                    onChange={() => handleSelectRow(candidate.id)}
                    className="h-4 w-4 text-[#f05d23] border-gray-300 rounded focus:ring-[#f05d23]"
                />
                {visibleColumns.full_name && <div className="text-sm font-semibold">{candidate.full_name}</div>}
            </div>
            {visibleColumns.email && (
                <div className="text-xs mb-1">
                    <span className="font-medium">Email:</span> {candidate.email}
                </div>
            )}
            {visibleColumns.opening && (
                <div className="text-xs mb-1">
                    <span className="font-medium">Opening:</span> {candidate.opening}
                </div>
            )}
            {visibleColumns.score && (
                <div className="text-xs mb-1">
                    <span className="font-medium">Score:</span> {candidate.score}/{candidate.questions.length * 10} ({percentage}%)
                </div>
            )}
            {visibleColumns.status && <div className="text-xs mb-2">{getStatusBadge(candidate.status)}</div>}
            {visibleColumns.phone && (
                <div className="text-xs mb-1">
                    <span className="font-medium">Phone:</span> {candidate.phone || "-"}
                </div>
            )}
            {visibleColumns.linkedin && (
                <div className="text-xs mb-1">
                    <span className="font-medium">LinkedIn:</span> {candidate.linkedin || "-"}
                </div>
            )}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => onViewCandidate(candidate)}
                    className={`px-2 py-1 rounded-full flex items-center gap-1 transition duration-200 shadow-md text-xs ${
                        mode === "dark"
                            ? "bg-gray-700 text-[#f05d23] hover:bg-gray-600"
                            : "bg-gray-200 text-[#f05d23] hover:bg-gray-300"
                    }`}
                >
                    <Icon icon="mdi:eye" width={14} height={14} />
                    View
                </button>
                <button
                    onClick={() => onDeleteCandidate(candidate.id)}
                    className={`px-2 py-1 rounded-full flex items-center gap-1 transition duration-200 shadow-md text-xs ${
                        mode === "dark"
                            ? "bg-red-700 text-white hover:bg-red-600"
                            : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                >
                    <Icon icon="mdi:trash-can" width={14} height={14} />
                    Delete
                </button>
            </div>
        </div>
    );
}