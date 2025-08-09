import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";

export default function JobDescriptionModal({ isOpen, onClose, onProceed, selectedOpening }) {
    const [jobDetails, setJobDetails] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    // Move isExpired above useEffect to avoid reference error
    const isExpired = (expiresOn) => new Date(expiresOn) < new Date();

    useEffect(() => {
        if (selectedOpening) {
            const fetchJobDetails = async () => {
                const { data, error } = await supabase
                    .from("job_openings")
                    .select("title, description, file_url, file_id, expires_on")
                    .eq("title", selectedOpening)
                    .single();
                if (error) console.error("Error fetching job details:", error);
                else setJobDetails(data);
            };
            fetchJobDetails();
        }
    }, [selectedOpening]);

    useEffect(() => {
        if (jobDetails && !isExpired(jobDetails.expires_on)) {
            const updateTimer = () => {
                const now = new Date();
                const expires = new Date(jobDetails.expires_on);
                const diff = expires - now;
                if (diff <= 0) {
                    setTimeLeft(null);
                } else {
                    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30)); // Approximate month length
                    const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    setTimeLeft({ months, days, hours, minutes, seconds });
                }
            };
            updateTimer();
            const timer = setInterval(updateTimer, 1000);
            return () => clearInterval(timer);
        }
    }, [jobDetails]);

    if (!isOpen || !selectedOpening || !jobDetails) return null;

    const { title, description, file_url, file_id, expires_on } = jobDetails;

    const googleFileId = file_id || (file_url && file_url.match(/file\/d\/(.+?)\//)?.[1]);
    const previewUrl = googleFileId ? `https://drive.google.com/file/d/${googleFileId}/preview` : null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full mx-4 shadow-2xl transform transition-all duration-300 animate-fade-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-paan-blue rounded-t-xl p-4 flex items-center">
                    <Icon icon="mdi:briefcase" className="w-8 h-8 text-white mr-3" />
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {/* Status and Expiry */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center bg-gray-100 p-3 rounded-lg shadow-sm">
                            <Icon
                                icon={isExpired(expires_on) ? "mdi:alert-circle" : "mdi:check-circle"}
                                className={`w-6 h-6 mr-2 ${isExpired(expires_on) ? "text-red-500" : "text-green-500"}`}
                            />
                            <p className="text-[#231812]">
                                <strong>Status:</strong> {isExpired(expires_on) ? "Expired" : "Active"}
                            </p>
                        </div>
                        <div className="flex items-center bg-gray-100 p-3 rounded-lg shadow-sm">
                            <Icon icon="mdi:calendar-clock" className="w-6 h-6 text-[#f05d23] mr-2" />
                            <p className="text-[#231812]">
                                <strong>{isExpired(expires_on) ? "Expired on" : "Expires on"}:</strong>{" "}
                                {new Date(expires_on).toLocaleDateString("en-GB")}
                            </p>
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    {!isExpired(expires_on) && timeLeft && (
                        <div className="justify-center mb-6 bg-[#fff8f0] p-4 rounded-lg shadow-sm flex items-center gap-2">
                            <Icon icon="mdi:timer" className="w-6 h-6 text-[#f05d23]" />
                            <div className="flex items-center text-[#231812]">
                                <strong className="mr-2">Time Left:</strong>
                                <div className="flex gap-2 text-lg">
                                    {timeLeft.months > 0 && <span>{timeLeft.months} month{timeLeft.months > 1 ? 's' : ''}</span>}
                                    {timeLeft.days > 0 && <span>{timeLeft.days} day{timeLeft.days > 1 ? 's' : ''}</span>}
                                    {timeLeft.hours > 0 && <span>{timeLeft.hours}h</span>}
                                    {timeLeft.minutes > 0 && <span>{timeLeft.minutes}m</span>}
                                    {timeLeft.seconds > 0 && <span>{timeLeft.seconds}s</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {description && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
                            <div className="flex items-center mb-2">
                                <Icon icon="mdi:text-box" className="w-6 h-6 text-[#f05d23] mr-2" />
                                <strong className="text-[#231812]">Description:</strong>
                            </div>
                            <p className="text-[#231812] text-left" dangerouslySetInnerHTML={{ __html: description }} />
                        </div>
                    )}

                    {/* Job Description Viewer */}
                    {file_url && previewUrl && (
                        <div className="mb-6">
                            <div className="flex items-center mb-2">
                                <Icon icon="mdi:document" className="w-6 h-6 text-[#f05d23] mr-2" />
                                <strong className="text-[#231812]">Job Description:</strong>
                            </div>
                            <iframe
                                src={previewUrl}
                                width="100%"
                                height="600px"
                                className="border-2 border-gray-200 rounded-lg shadow-inner"
                                title="Job Description Document"
                                allow="autoplay"
                            />
                        </div>
                    )}
                </div>

                {/* Sticky Footer */}
                <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 rounded-b-xl shadow-md">
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 text-[#231812] rounded-full hover:bg-gray-300 transition duration-200 flex items-center gap-2 shadow-md"
                        >
                            <Icon icon="mdi:close" width={20} height={20} />
                            Cancel
                        </button>
                        <button
                            onClick={onProceed}
                            className="px-6 py-2 bg-paan-blue text-white rounded-full hover:bg-paan-blue-dark transition duration-200 flex items-center gap-2 shadow-md"
                        >
                            Proceed
                            <Icon icon="mdi:arrow-right" width={20} height={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}