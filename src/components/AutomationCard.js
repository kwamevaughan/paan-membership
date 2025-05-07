import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { templateNameMap } from "../../utils/templateUtils";

export default function AutomationCard({ automation, mode, onToggle, onDelete, onEdit }) {
    const [timeLeft, setTimeLeft] = useState("");

    const operatorIcons = {
        ">": <Icon icon="mdi:greater-than" width={16} />,
        "<": <Icon icon="mdi:less-than" width={16} />,
        "=": <Icon icon="mdi:equal" width={16} />,
    };

    const notifyIcons = {
        slack: <Icon icon="mdi:slack" width={16} className="inline mr-1" />,
        email: <Icon icon="mdi:email" width={16} className="inline mr-1" />,
    };

    const scheduleText = () => {
        if (automation.schedule_type === "forever" || automation.schedule_type === "recurring") {
            return `Every ${automation.interval_hours} hour${automation.interval_hours > 1 ? "s" : ""}`;
        }
        if (automation.schedule_type === "range") {
            return `From ${new Date(automation.start_date).toLocaleDateString()} to ${new Date(automation.end_date).toLocaleDateString()}`;
        }
        if (automation.schedule_type === "hourly") {
            return `Every ${automation.interval_hours} hour${automation.interval_hours > 1 ? "s" : ""}`;
        }
        return "";
    };

    const getActionValueDisplay = () => {
        if (automation.action_type === "email") {
            return templateNameMap[automation.action_value] || automation.action_value;
        }
        if (automation.action_type === "notify") {
            const notifyIcon = notifyIcons[automation.notify_type || "slack"];
            return (
                <span>
                    {notifyIcon}
                    {automation.action_value}
                </span>
            );
        }
        return automation.action_value;
    };

    useEffect(() => {
        if (automation.active && (automation.schedule_type === "recurring" || automation.schedule_type === "forever" || automation.schedule_type === "hourly")) {
            const updateCountdown = () => {
                const lastRun = new Date(automation.last_run || "1970-01-01");
                const intervalMs = automation.interval_hours * 60 * 60 * 1000;
                const nextRun = new Date(lastRun.getTime() + intervalMs);
                const now = new Date();
                const diffMs = nextRun - now;

                if (diffMs <= 0) {
                    setTimeLeft("Running soon...");
                } else {
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
                    setTimeLeft(`Next run in ${hours}h ${minutes}m ${seconds}s`);
                }
            };

            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);
            return () => clearInterval(interval);
        } else {
            setTimeLeft("");
        }
    }, [automation]);

    const handleToggle = (e) => {
        e.stopPropagation();
        onToggle(automation.id, !automation.active);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(automation.id);
    };

    const handleCardClick = () => {
        onEdit(automation);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            onClick={handleCardClick}
            className={`p-4 rounded-lg shadow-lg hover:shadow-none transition-shadow duration-300 ease-in-out cursor-pointer flex flex-col gap-3 ${
                mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-[#231812]"
            } ${automation.active ? "border-l-4 border-green-500" : "border-l-4 border-red-500"}`}
        >
            <div className="flex-1">
                <p className="text-sm flex flex-wrap items-center gap-1">
                    <span className="font-semibold">If</span> {automation.condition_field}{' '}
                    {operatorIcons[automation.condition_operator]}{' '}
                    {automation.condition_value},{' '}
                    <span className="font-semibold">then</span> {automation.action_type}{' '}
                    <span className="text-[#f05d23] font-medium">"{getActionValueDisplay()}"</span>
                </p>
                <p className="text-xs mt-1 flex items-center gap-1">
                    <Icon icon={automation.active ? "mdi:play" : "mdi:pause"} width={14} />
                    {automation.active ? "Running" : "Paused"}
                </p>
                <p className="text-xs text-gray-500 mt-1">{scheduleText()}</p>
                {timeLeft && (
                    <p className="text-xs text-gray-500 mt-1">{timeLeft}</p>
                )}
            </div>
            <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={automation.active}
                        onChange={handleToggle}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-[#f05d23] rounded focus:ring-[#f05d23]"
                    />
                    <span className="text-sm">{automation.active ? "Active" : "Inactive"}</span>
                </label>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-700"
                >
                    <Icon icon="mdi:trash-can-outline" width={20} />
                </motion.button>
            </div>
        </motion.div>
    );
}