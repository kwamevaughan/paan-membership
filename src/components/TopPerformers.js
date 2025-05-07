// src/components/TopPerformers.js
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export default function TopPerformers({ candidates, setEmailData, setIsEmailModalOpen, mode }) {
    const topThree = candidates.sort((a, b) => b.score - a.score).slice(0, 3);

    const handleEmailClick = (candidate) => {
        toast.loading("Preparing email...");
        setEmailData({
            fullName: candidate.full_name,
            email: candidate.email,
            opening: candidate.opening,
            status: candidate.status,
            subject: `Congratulations, ${candidate.full_name}!`,
            body: `<p>Dear ${candidate.full_name},</p><p>We’re impressed with your score of ${candidate.score}!</p><p>Next steps...</p>`,
        });
        setIsEmailModalOpen(true);
        toast.dismiss();
    };

    return (
        <div
            className={`border-t-4 border-[#f05d23] p-6 rounded-xl shadow-lg hover:shadow-xl animate-fade-in transition-shadow duration-500 mb-6 ${
                mode === "dark" ? "bg-gray-800" : "bg-white"
            }`}
        >
            <h3
                className={`text-lg font-semibold mb-6 ${
                    mode === "dark" ? "text-white" : "text-[#231812]"
                }`}
            >
                Top Performers
            </h3>
            <ul className="space-y-4 max-h-[300px] overflow-y-auto">
                {topThree.map((candidate, index) => (
                    <li
                        key={candidate.id}
                        className={`relative p-4 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 ${
                            mode === "dark"
                                ? "bg-gradient-to-r from-gray-700 to-gray-600 text-white"
                                : "bg-gradient-to-r from-gray-50 to-gray-100 text-[#231812]"
                        }`}
                        style={{
                            borderLeft: `4px solid ${index === 0 ? "#f05d23" : index === 1 ? "#d94f1e" : "#f28c5e"}`, // Gradient ranking
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <p className="font-medium text-base">
                                    {candidate.full_name} - {candidate.opening}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm">
                                        Score: {candidate.score}
                                    </span>
                                    <div className="w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${candidate.score}%`,
                                                background: `linear-gradient(to right, #f05d23, #d94f1e)`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleEmailClick(candidate)}
                                className="group flex items-center gap-1 px-3 py-1 bg-[#f05d23] text-white rounded-full hover:bg-[#d94f1e] transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                <Icon
                                    icon="mdi:email"
                                    className="w-4 h-4 group-hover:scale-110 transition-transform"
                                />
                                Email
                            </button>
                        </div>
                        <span
                            className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${
                                index === 0
                                    ? "bg-[#f05d23] text-white"
                                    : index === 1
                                        ? "bg-[#d94f1e] text-white"
                                        : "bg-[#f28c5e] text-[#231812]"
                            }`}
                        >
                            #{index + 1}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}