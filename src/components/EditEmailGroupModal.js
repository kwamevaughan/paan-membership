// components/EditEmailGroupModal.js
import { useState, useEffect } from "react"; // Add useEffect
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export default function EditEmailGroupModal({ isOpen, onClose, group, onSave, mode }) {
    const [name, setName] = useState("");
    const [emails, setEmails] = useState([""]);

    // Sync state with group prop when it changes
    useEffect(() => {
        if (group) {
            setName(group.name || "");
            setEmails(group.emails ? group.emails.split(",").map((email) => email.trim()) : [""]);
        }
    }, [group]);

    const handleAddEmail = () => {
        setEmails([...emails, ""]);
    };

    const handleRemoveEmail = (index) => {
        if (emails.length === 1) {
            toast.error("At least one email is required.");
            return;
        }
        setEmails(emails.filter((_, i) => i !== index));
    };

    const handleEmailChange = (index, value) => {
        const updatedEmails = [...emails];
        updatedEmails[index] = value;
        setEmails(updatedEmails);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedEmails = emails.map((email) => email.trim()).filter((email) => email);
        if (trimmedEmails.length === 0) {
            toast.error("Please provide at least one valid email.");
            return;
        }
        onSave({ ...group, name, emails: trimmedEmails.join(",") });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`p-6 rounded-xl shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto ${
                    mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-[#231812]"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Icon icon="mdi:account-group" className="w-6 h-6 text-[#f05d23]" />
                    Edit Email Group
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Icon
                            icon="mdi:account-group"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#f05d23]"
                        />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Group Name"
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                                mode === "dark"
                                    ? "bg-gray-700 text-gray-200 border-gray-600"
                                    : "bg-gray-50 text-[#231812] border-gray-300"
                            }`}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        {emails.map((email, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Icon
                                        icon="mdi:email"
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#f05d23]"
                                    />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => handleEmailChange(index, e.target.value)}
                                        placeholder={`Email ${index + 1}`}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                                            mode === "dark"
                                                ? "bg-gray-700 text-gray-200 border-gray-600"
                                                : "bg-gray-50 text-[#231812] border-gray-300"
                                        }`}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveEmail(index)}
                                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-200"
                                    title="Remove Email"
                                >
                                    <Icon icon="mdi:delete" width={20} height={20} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddEmail}
                            className="mt-2 text-[#f05d23] hover:underline flex items-center gap-1"
                        >
                            <Icon icon="mdi:plus" width={20} height={20} />
                            Add Another Email
                        </button>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            type="submit"
                            className="flex-1 bg-[#f05d23] text-white py-2 px-4 rounded-full hover:bg-[#d94f1e] transition duration-200 flex items-center justify-center gap-2 shadow-md"
                        >
                            <Icon icon="mdi:content-save" width={20} height={20} />
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-2 rounded-full transition duration-200 flex items-center justify-center gap-2 shadow-md ${
                                mode === "dark"
                                    ? "bg-gray-600 text-white hover:bg-gray-500"
                                    : "bg-gray-200 text-[#231812] hover:bg-gray-300"
                            }`}
                        >
                            <Icon icon="mdi:close" width={20} height={20} />
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}