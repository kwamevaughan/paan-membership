// src/components/PreviewModal.js
import { Icon } from "@iconify/react";

export default function PreviewModal({ isOpen, url, onClose, mode }) {
    const handleClose = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        console.log("Closing preview modal only");
        onClose();
    };

    if (!isOpen || !url) return null;

    // If url is already a preview URL, use it directly; otherwise, extract fileId
    const previewUrl = url.includes("/preview")
        ? url
        : url && url.includes("id=")
            ? `https://drive.google.com/file/d/${url.split("id=")[1].split("&")[0]}/preview`
            : null;

    if (!previewUrl) {
        console.error("Invalid URL for preview:", url);
        return null; // Or render an error message
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100]">
            <div className="absolute inset-0" onClick={handleClose} />
            <div
                className={`relative rounded-xl shadow-2xl w-full max-w-4xl mx-4 flex flex-col max-h-[90vh] ${
                    mode === "dark" ? "bg-gray-800" : "bg-white"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-r from-[#f05d23] to-[#d94f1e] rounded-t-xl p-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">File Preview</h2>
                    <button
                        onClick={handleClose}
                        className="text-white hover:text-gray-200 transition duration-200"
                    >
                        <Icon icon="mdi:close" width={24} height={24} />
                    </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    <iframe
                        src={previewUrl}
                        width="100%"
                        height="600px"
                        className={`border-2 rounded-lg shadow-inner ${
                            mode === "dark" ? "border-gray-700" : "border-gray-200"
                        }`}
                        title="Job Description Document"
                        allow="autoplay"
                    />
                </div>
            </div>
        </div>
    );
}