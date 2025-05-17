import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { templateNameMap } from "../../utils/templateUtils";

export default function AutomationForm({ onSave, onCancel, mode, emailTemplates, handleStatusChange, initialAutomation }) {
    const [condition, setCondition] = useState({ field: "score", operator: ">", value: "" });
    const [action, setAction] = useState({ type: "email", value: "", notifyType: "slack" });
    const [schedule, setSchedule] = useState({ type: "recurring", startDate: "", endDate: "", intervalHours: "1" });
    const [isOperatorOpen, setIsOperatorOpen] = useState(false);
    const [previewCandidates, setPreviewCandidates] = useState([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const statusOptions = ["Accepted", "Pending", "Reviewed", "Shortlisted", "Rejected"];
    const operatorOptions = [
        { value: ">", icon: "mdi:greater-than" },
        { value: "<", icon: "mdi:less-than" },
        { value: "=", icon: "mdi:equal" },
    ];
    const notifyOptions = [
        { value: "slack", icon: "mdi:slack", label: "Slack" },
        { value: "email", icon: "mdi:email", label: "Email" },
    ];
    const frequencyOptions = [
        { value: "1", label: "Every Hour" },
        { value: "2", label: "Every 2 Hours" },
        { value: "6", label: "Every 6 Hours" },
        { value: "12", label: "Every 12 Hours" },
        { value: "24", label: "Daily" },
    ];

    useEffect(() => {
        if (initialAutomation) {
            setCondition({
                field: initialAutomation.condition_field,
                operator: initialAutomation.condition_field === "status" ? "=" : initialAutomation.condition_operator,
                value: initialAutomation.condition_value,
            });
            setAction({
                type: initialAutomation.action_type,
                value: initialAutomation.action_value || "",
                notifyType: initialAutomation.action_type === "notify" ? (initialAutomation.notify_type || "slack") : "slack",
            });
            setSchedule({
                type: initialAutomation.schedule_type === "hourly" ? "recurring" : initialAutomation.schedule_type,
                startDate: initialAutomation.start_date || "",
                endDate: initialAutomation.end_date || "",
                intervalHours: initialAutomation.interval_hours ? String(initialAutomation.interval_hours) : "1",
            });
        }
    }, [initialAutomation]);

    const fetchPreviewCandidates = async () => {
        if (!condition.value) {
            toast.error("Please enter a condition value first!", { icon: "⚠️" });
            return [];
        }

        const { data, error } = await supabase
            .from("candidates")
            .select("id, full_name, email, responses!inner(score, status, submitted_at, user_id)");

        if (error) {
            console.error("Fetch error details:", error);
            toast.error(`Failed to fetch candidates: ${error.message}`, { icon: "❌" });
            return [];
        }

        const filteredCandidates = data.filter((candidate) => {
            const response = candidate.responses;
            if (!response) return false;

            if (condition.field === "score") {
                const score = parseInt(response.score);
                const value = parseInt(condition.value);
                if (condition.operator === ">") return score > value;
                if (condition.operator === "<") return score < value;
                if (condition.operator === "=") return score === value;
            } else if (condition.field === "status") {
                return response.status === condition.value; // Always uses "="
            } else if (condition.field === "submitted_at") {
                const submittedAt = new Date(response.submitted_at);
                const daysAgo = new Date();
                daysAgo.setDate(daysAgo.getDate() - parseInt(condition.value));
                if (condition.operator === ">") return submittedAt > daysAgo;
                if (condition.operator === "<") return submittedAt < daysAgo;
                if (condition.operator === "=") return submittedAt.toDateString() === daysAgo.toDateString();
            }
            return false;
        });

        setPreviewCandidates(filteredCandidates);
        setIsPreviewOpen(true);
        toast.success(`Found ${filteredCandidates.length} matching candidates!`, { icon: "👀" });
        return filteredCandidates;
    };

    const handleRunNow = async () => {
        if (!condition.value || !action.value) {
            toast.error("Please fill in all fields before running!", { icon: "⚠️" });
            return;
        }

        const candidates = await fetchPreviewCandidates();
        if (candidates.length === 0) {
            toast.error("No candidates match this condition to run.", { icon: "ℹ️" });
            return;
        }

        const automation = {
            condition_field: condition.field,
            condition_operator: condition.operator,
            condition_value: condition.value,
            action_type: action.type,
            action_value: action.value,
            notify_type: action.type === "notify" ? action.notifyType : null,
        };

        const response = await fetch("/api/run-automation-now", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ automation }),
        });

        if (response.ok) {
            toast.success(`Automation ran successfully for ${candidates.length} candidates!`, { icon: "🏃" });
        } else {
            const error = await response.json();
            toast.error(`Failed to run automation: ${error.message}`, { icon: "❌" });
        }
    };

    const handleSubmit = () => {
        if (!condition.value || !action.value) {
            toast.error("Please fill in all fields!", { icon: "⚠️" });
            return;
        }
        if (schedule.type === "range" && (!schedule.startDate || !schedule.endDate)) {
            toast.error("Please set start and end dates for range!", { icon: "⚠️" });
            return;
        }
        if (schedule.type === "recurring" && !schedule.intervalHours) {
            toast.error("Please set an interval!", { icon: "⚠️" });
            return;
        }

        const automation = {
            ...(initialAutomation ? { id: initialAutomation.id } : {}),
            condition_field: condition.field,
            condition_operator: condition.operator,
            condition_value: condition.value,
            action_type: action.type,
            action_value: action.value,
            notify_type: action.type === "notify" ? action.notifyType : null,
            active: initialAutomation ? initialAutomation.active : true,
            schedule_type: schedule.type,
            start_date: schedule.type === "range" ? schedule.startDate : null,
            end_date: schedule.type === "range" ? schedule.endDate : null,
            interval_hours: schedule.type === "recurring" ? parseInt(schedule.intervalHours) : null,
        };

        onSave(automation);
        toast.success(initialAutomation ? "Automation updated!" : "Automation activated!", { icon: "🚀" });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}
        >
            <div className={`p-6 rounded-xl shadow-2xl w-full max-w-lg ${mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-[#231812]"}`}>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <Icon icon="mdi:rocket" className="mr-2 text-[#f05d23]" width={24} />
                    {initialAutomation ? "Edit Automation" : "New Automation"}
                </h2>
                <div className="space-y-6">
                    <div>
                        <label className="block font-semibold mb-2 text-sm">Condition</label>
                        <div className="flex gap-3">
                            <select
                                value={condition.field}
                                onChange={(e) => setCondition({ 
                                    ...condition, 
                                    field: e.target.value, 
                                    value: "", 
                                    operator: e.target.value === "status" ? "=" : condition.operator 
                                })}
                                className={`p-2 rounded-lg border flex-1 ${mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                            >
                                <option value="score">Score</option>
                                <option value="submitted_at">Submitted At (days ago)</option>
                                <option value="status">Status</option>
                            </select>
                            {condition.field !== "status" && (
                                <div className="relative w-16">
                                    <button
                                        onClick={() => setIsOperatorOpen(!isOperatorOpen)}
                                        className={`p-2 rounded-lg border w-full flex items-center justify-center ${mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                                    >
                                        <Icon icon={operatorOptions.find((opt) => opt.value === condition.operator)?.icon} width={16} />
                                    </button>
                                    {isOperatorOpen && (
                                        <div className={`absolute mt-1 w-full rounded-lg shadow-lg z-10 ${mode === "dark" ? "bg-gray-700" : "bg-white"}`}>
                                            {operatorOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setCondition({ ...condition, operator: opt.value });
                                                        setIsOperatorOpen(false);
                                                    }}
                                                    className={`p-2 w-full flex justify-center hover:${mode === "dark" ? "bg-gray-600" : "bg-gray-200"}`}
                                                >
                                                    <Icon icon={opt.icon} width={16} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {condition.field === "status" ? (
                                <select
                                    value={condition.value}
                                    onChange={(e) => setCondition({ ...condition, value: e.target.value })}
                                    className={`p-2 rounded-lg border flex-1 ${mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                                >
                                    <option value="">Select Status</option>
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="number"
                                    min="0"
                                    value={condition.value}
                                    onChange={(e) => setCondition({ ...condition, value: e.target.value })}
                                    className={`p-2 rounded-lg border flex-1 ${mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                                    placeholder={condition.field === "score" ? "e.g., 120" : "e.g., 7"}
                                />
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block font-semibold mb-2 text-sm">Action</label>
                        <div className="flex gap-3">
                            <select
                                value={action.type}
                                onChange={(e) => setAction({ ...action, type: e.target.value, value: e.target.value === "notify" ? "" : action.value })}
                                className={`p-2 rounded-lg border flex-1 ${mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                            >
                                <option value="email">Send Email</option>
                                <option value="status">Update Status</option>
                                <option value="notify">Notify Team</option>
                            </select>
                            {action.type === "email" && (
                                <select
                                    value={action.value}
                                    onChange={(e) => setAction({ ...action, value: e.target.value })}
                                    className={`p-2 rounded-lg border flex-1 ${mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                                >
                                    <option value="">Select Template</option>
                                    {emailTemplates.map((template) => (
                                        <option key={template.id} value={template.name}>
                                            {templateNameMap[template.name] || template.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {action.type === "status" && (
                                <select
                                    value={action.value}
                                    onChange={(e) => setAction({ ...action, value: e.target.value })}
                                    className={`p-2 rounded-lg border flex-1 ${mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                                >
                                    <option value="">Select Status</option>
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {action.type === "notify" && (
                                <div className="flex gap-3 w-full">
                                    <select
                                        value={action.notifyType}
                                        onChange={(e) => setAction({ ...action, notifyType: e.target.value })}
                                        className={`p-2 rounded-lg border w-32 ${mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                                    >
                                        {notifyOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        value={action.value}
                                        onChange={(e) => setAction({ ...action, value: e.target.value })}
                                        className={`p-2 rounded-lg border flex-1 ${mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                                        placeholder={
                                            action.notifyType === "slack"
                                                ? "e.g., #gcg-careers"
                                                : "e.g., hello@example.com"
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block font-semibold mb-2 text-sm">Schedule</label>
                        <div className="space-y-4">
                            <select
                                value={schedule.type}
                                onChange={(e) => setSchedule({ ...schedule, type: e.target.value })}
                                className={`p-2 rounded-lg border w-full ${mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                            >
                                <option value="recurring">Recurring</option>
                                <option value="range">Date Range</option>
                            </select>
                            {schedule.type === "range" && (
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <input
                                            type="date"
                                            value={schedule.startDate}
                                            onChange={(e) => setSchedule({ ...schedule, startDate: e.target.value })}
                                            onClick={(e) => e.target.showPicker()}
                                            className={`p-2 rounded-lg border w-full ${mode === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300"}`}
                                        />
                                    </div>
                                    <div className="relative flex-1">
                                        <input
                                            type="date"
                                            value={schedule.endDate}
                                            onChange={(e) => setSchedule({ ...schedule, endDate: e.target.value })}
                                            onClick={(e) => e.target.showPicker()}
                                            className={`p-2 rounded-lg border w-full ${mode === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300"}`}
                                        />
                                    </div>
                                </div>
                            )}
                            {schedule.type === "recurring" && (
                                <div>
                                    <select
                                        value={schedule.intervalHours}
                                        onChange={(e) => setSchedule({ ...schedule, intervalHours: e.target.value })}
                                        className={`p-2 rounded-lg border w-full ${mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                                    >
                                        {frequencyOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        How often to check for matches (runs indefinitely).
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRunNow}
                        className="w-full px-4 py-2 bg-purple-500 text-white rounded-full flex items-center justify-center gap-2 hover:bg-purple-600 transition-colors"
                    >
                        <Icon icon="mdi:play" width={20} />
                        Test Run
                    </motion.button>
                    {isPreviewOpen && (
                        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg max-h-40 overflow-y-auto">
                            <h3 className="text-sm font-semibold mb-2">Preview ({previewCandidates.length} Candidates)</h3>
                            {previewCandidates.length === 0 ? (
                                <p className="text-xs text-gray-500">No candidates match this condition.</p>
                            ) : (
                                previewCandidates.map((candidate) => (
                                    <p key={candidate.id} className="text-xs">
                                        {candidate.full_name} (Score: {candidate.responses?.score || "N/A"}, Status: {candidate.responses?.status || "N/A"})
                                    </p>
                                ))
                            )}
                        </div>
                    )}
                </div>
                <div className="mt-8 flex gap-4 justify-between">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchPreviewCandidates}
                        className="px-4 py-2 bg-blue-500 text-white rounded-full flex items-center gap-2 hover:bg-blue-600 transition-colors"
                    >
                        <Icon icon="mdi:eye" width={20} />
                        Preview Candidates
                    </motion.button>
                    <div className="flex gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-[#f05d23] text-white rounded-full flex items-center gap-2 hover:bg-[#e04c1e] transition-colors"
                        >
                            <Icon icon="mdi:rocket-launch" width={20} />
                            {initialAutomation ? "Update" : "Activate"}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onCancel}
                            className={`px-6 py-2 rounded-full ${mode === "dark" ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-300 hover:bg-gray-400"} transition-colors`}
                        >
                            Cancel
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}