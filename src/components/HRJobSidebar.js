// src/components/HRJobSidebar.js
import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function HRJobSidebar({ onSubmitJob, mode }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [expiresOn, setExpiresOn] = useState("");
    const router = useRouter();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let fileUrl = null;

        if (file) {
            fileUrl = "https://drive.google.com/example"; // Placeholder, replace with driveUtils.js
        }

        const jobData = {
            title,
            description: description || null,
            file_url: fileUrl || null,
            expires_on: expiresOn,
            is_expired: false,
        };

        const success = await onSubmitJob(jobData);
        if (success) {
            setTitle("");
            setDescription("");
            setFile(null);
            setExpiresOn("");
        }
    };

    return (
        <div
            className={`w-full md:w-1/3 p-6 rounded-lg shadow-lg animate-fade-in ${
                mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-[#231812]"
            }`}
        >
            <h2 className="text-xl font-semibold mb-4">Add New Job Opening</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 ${
                            mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
                        }`}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 ${
                            mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
                        }`}
                        rows="4"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Upload File (Optional)</label>
                    <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                        className={`w-full p-2 border rounded-lg ${
                            mode === "dark" ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-gray-50 border-gray-300 text-gray-600"
                        }`}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">
                        Expires On <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={expiresOn}
                        onChange={(e) => setExpiresOn(e.target.value)}
                        className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 ${
                            mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
                        }`}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full p-2 bg-[#f05d23] text-white rounded-lg hover:bg-[#d94f1e] transition duration-200 shadow-md"
                >
                    Submit Job
                </button>
            </form>
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Navigation</h3>
                <ul className="space-y-2">
                    <li>
                        <button
                            onClick={() => router.push("/hr/jobs")}
                            className={`w-full text-left p-2 rounded-lg flex items-center ${
                                mode === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                            }`}
                        >
                            <Icon icon="mdi:briefcase" width={20} height={20} className="mr-2 text-[#f05d23]" />
                            Job Postings
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => router.push("/hr/applicants")}
                            className={`w-full text-left p-2 rounded-lg flex items-center ${
                                mode === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                            }`}
                        >
                            <Icon icon="mdi:account-group" width={20} height={20} className="mr-2 text-[#f05d23]" />
                            Applicants
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => router.push("/hr/settings")}
                            className={`w-full text-left p-2 rounded-lg flex items-center ${
                                mode === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                            }`}
                        >
                            <Icon icon="mdi:cog" width={20} height={20} className="mr-2 text-[#f05d23]" />
                            Settings
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}