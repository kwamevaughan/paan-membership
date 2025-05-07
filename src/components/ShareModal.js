import { Icon } from "@iconify/react";

export default function ShareModal({ isOpen, onClose, job, mode, onNotify }) {
    if (!isOpen || !job) return null;

    const jobUrl = `https://careers.growthpad.co.ke/jobs/${job.slug}`; // Updated to /jobs/[slug]

    const shareOptions = [
        {
            platform: "Twitter",
            icon: "mdi:twitter",
            url: `https://twitter.com/intent/tweet?text=Check out this job: ${encodeURIComponent(job.title)}&url=${encodeURIComponent(jobUrl)}`,
            color: "hover:bg-blue-500",
        },
        {
            platform: "LinkedIn",
            icon: "mdi:linkedin",
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`,
            color: "hover:bg-blue-700",
        },
        {
            platform: "WhatsApp",
            icon: "mdi:whatsapp",
            url: `https://api.whatsapp.com/send?text=Check out this job: ${encodeURIComponent(job.title)} ${encodeURIComponent(jobUrl)}`,
            color: "hover:bg-green-500",
        },
        {
            platform: "Email",
            icon: "mdi:email",
            url: `mailto:?subject=${encodeURIComponent(job.title)}&body=Check out this job: ${encodeURIComponent(jobUrl)}`,
            color: "hover:bg-gray-600",
        },
        {
            platform: "Facebook",
            icon: "mdi:facebook",
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}&quote=${encodeURIComponent(`Check out this job: ${job.title}`)}`, // Fixed "e= to &quote=
            color: "hover:bg-blue-600",
        },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
                className={`p-6 rounded-lg shadow-lg max-w-md w-full ${
                    mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-[#231812]"
                }`}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Icon icon="mdi:share-variant" className="w-6 h-6 text-[#f05d23]" />
                        Share This Job
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <Icon icon="mdi:close" className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-6">
                    <h4 className="text-lg font-medium mb-2">Share on Social Media</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {shareOptions.map((option) => (
                            <a
                                key={option.platform}
                                href={option.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${option.color} hover:text-white ${
                                    mode === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-[#231812]"
                                }`}
                            >
                                <Icon icon={option.icon} className="w-5 h-5" />
                                {option.platform}
                            </a>
                        ))}
                    </div>
                </div>

                {onNotify && (
                    <div>
                        <button
                            onClick={onNotify}
                            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                                mode === "dark"
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                        >
                            <Icon icon="mdi:account-group" className="w-5 h-5" />
                            Notify Recruiters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}