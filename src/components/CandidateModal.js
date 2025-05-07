// src/components/CandidateModal.js
import { useState } from "react";
import { Icon } from "@iconify/react";

export default function CandidateModal({ candidate, isOpen, onClose, onStatusChange, mode }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isAnswersModalOpen, setIsAnswersModalOpen] = useState(false);

    if (!isOpen || !candidate) return null;

    const handleDocumentPreview = (url) => {
        const fileId = url.split("id=")[1].split("&")[0];
        const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        setPreviewUrl(previewUrl);
        setIsPreviewModalOpen(true);
    };

    const closePreviewModal = () => {
        setIsPreviewModalOpen(false);
        setPreviewUrl(null);
    };

    const openAnswersModal = () => setIsAnswersModalOpen(true);
    const closeAnswersModal = () => setIsAnswersModalOpen(false);

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case "Reviewed": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case "Shortlisted": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "Rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
        }
    };

    const maxScore = candidate.questions ? candidate.questions.length * 10 : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60]"> {/* Changed to z-60 */}            <div className={`rounded-xl shadow-2xl transform transition-all duration-300 animate-fade-in w-full max-w-3xl mx-4 flex flex-col max-h-[90vh] overflow-hidden ${mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-[#231812]"}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-[#f05d23] to-[#d94f1e] rounded-t-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Icon icon="mdi:account" className="w-8 h-8 text-white" />
                        <h2 className="text-2xl font-bold text-white truncate">{candidate.full_name}</h2>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition duration-200">
                        <Icon icon="mdi:close" width={24} height={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Profile Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                                <Icon icon="mdi:email" className="w-5 h-5 text-[#f05d23] mt-1" />
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-base">{candidate.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Icon icon="mdi:phone" className="w-5 h-5 text-[#f05d23] mt-1" />
                                <div>
                                    <p className="text-sm font-medium">Phone</p>
                                    <p className="text-base">{candidate.phone || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Icon icon="mdi:linkedin" className="w-5 h-5 text-[#f05d23] mt-1" />
                                <div>
                                    <p className="text-sm font-medium">LinkedIn</p>
                                    <a href={candidate.linkedin} target="_blank" className="text-[#f05d23] hover:underline text-base break-all">
                                        {candidate.linkedin || "N/A"}
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Icon icon="mdi:briefcase" className="w-5 h-5 text-[#f05d23] mt-1" />
                                <div>
                                    <p className="text-sm font-medium">Opening</p>
                                    <p className="text-base">{candidate.opening}</p>
                                </div>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:star" className="w-5 h-5 text-[#f05d23]" />
                            <p className="text-sm font-medium">Score: </p>
                            <p className="text-base">
                                {candidate.score}/{maxScore} (
                                {maxScore > 0 ? Math.round((candidate.score / maxScore) * 100) : 0}%)
                            </p>
                        </div>

                        {/* Documents */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <Icon icon="mdi:file-document" className="w-5 h-5 text-[#f05d23]" />
                                Documents
                            </h3>
                            <div className="flex gap-4 flex-wrap">
                                {candidate.resumeUrl && (
                                    <button
                                        onClick={() => handleDocumentPreview(candidate.resumeUrl)}
                                        className="flex items-center gap-2 px-3 py-1 bg-[#f05d23] text-white rounded-full hover:bg-[#d94f1e] transition duration-200 shadow-md"
                                    >
                                        <Icon icon="mdi:file-document" className="w-5 h-5" />
                                        Resume
                                    </button>
                                )}
                                {candidate.coverLetterUrl && (
                                    <button
                                        onClick={() => handleDocumentPreview(candidate.coverLetterUrl)}
                                        className="flex items-center gap-2 px-3 py-1 bg-[#f05d23] text-white rounded-full hover:bg-[#d94f1e] transition duration-200 shadow-md"
                                    >
                                        <Icon icon="mdi:file-document" className="w-5 h-5" />
                                        Cover Letter
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Interview Answers */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <Icon icon="mdi:chat-question" className="w-5 h-5 text-[#f05d23]" />
                                Interview Answers
                            </h3>
                            <button
                                onClick={openAnswersModal}
                                className="flex items-center gap-2 px-4 py-2 bg-[#f05d23] text-white rounded-full hover:bg-[#d94f1e] transition duration-200 shadow-md"
                            >
                                <Icon icon="mdi:eye" className="w-5 h-5" />
                                View Answers ({candidate.answers.length})
                            </button>
                        </div>

                        {/* Status */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <Icon icon="mdi:tag" className="w-5 h-5 text-[#f05d23]" />
                                Status
                            </h3>
                            <select
                                value={candidate.status || "Pending"}
                                onChange={(e) => onStatusChange(candidate.id, e.target.value)}
                                className={`p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] w-full ${getStatusColor(candidate.status)}`}
                            >
                                {["Pending", "Reviewed", "Shortlisted", "Rejected"].map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t border-gray-200 dark:border-gray-700 rounded-b-xl shadow-md ${mode === "dark" ? "bg-gray-800" : "bg-white"}`}>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-[#231812] dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-200 flex items-center gap-2 shadow-md"
                        >
                            <Icon icon="mdi:close" width={20} height={20} />
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Preview Modal */}
            {isPreviewModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-70"> {/* Changed to z-70 */}                    <div className={`rounded-xl shadow-2xl w-full max-w-4xl mx-4 flex flex-col max-h-[90vh] ${mode === "dark" ? "bg-gray-800" : "bg-white"}`}>
                        <div className="bg-gradient-to-r from-[#f05d23] to-[#d94f1e] rounded-t-xl p-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Document Preview</h2>
                            <button onClick={closePreviewModal} className="text-white hover:text-gray-200 transition duration-200">
                                <Icon icon="mdi:close" width={24} height={24} />
                            </button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            <iframe
                                src={previewUrl}
                                width="100%"
                                height="100%"
                                className="border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-inner min-h-[600px]"
                                title="Document Preview"
                                allow="autoplay"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Answers Modal */}
            {isAnswersModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-70"> {/* Changed to z-70 */}                    <div className={`rounded-xl shadow-2xl w-full max-w-4xl mx-4 flex flex-col max-h-[90vh] ${mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-[#231812]"}`}>
                        <div className="bg-gradient-to-r from-[#f05d23] to-[#d94f1e] rounded-t-xl p-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Interview Answers for {candidate.full_name}</h2>
                            <button onClick={closeAnswersModal} className="text-white hover:text-gray-200 transition duration-200">
                                <Icon icon="mdi:close" width={24} height={24} />
                            </button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="space-y-4">
                                {candidate.answers && candidate.answers.length > 0 && candidate.questions && candidate.questions.length > 0 ? (
                                    candidate.answers.map((answer, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-lg shadow-sm transition-all hover:shadow-md ${mode === "dark" ? "bg-gray-700" : "bg-gray-50"}`}
                                        >
                                            <p className="font-semibold text-[#f05d23]">
                                                {candidate.questions[idx]?.text || `Question ${idx + 1}`}
                                            </p>
                                            <p className="mt-1">{Array.isArray(answer) ? answer.join(", ") : answer || "No answer provided"}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 italic">No interview answers submitted yet.</p>
                                )}
                            </div>
                        </div>
                        <div className={`p-4 border-t border-gray-200 dark:border-gray-700 rounded-b-xl shadow-md ${mode === "dark" ? "bg-gray-800" : "bg-white"}`}>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={closeAnswersModal}
                                    className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-[#231812] dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-200 flex items-center gap-2 shadow-md"
                                >
                                    <Icon icon="mdi:close" width={20} height={20} />
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}