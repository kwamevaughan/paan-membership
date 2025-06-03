"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

// Client-only Editor component
const EditorComponent = dynamic(() => import("./EditorComponent"), {
  ssr: false,
});

export default function EmailModal({
  isOpen,
  onClose,
  emailData,
  onSend,
  mode,
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && emailData) {
      setSubject(emailData.subject || "");
      setBody(emailData.body || "");
      setIsClosing(false);
    } else {
      setSubject("");
      setBody("");
    }
  }, [isOpen, emailData]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleSendClick = () => {
    if (!subject.trim()) {
      toast.error("Please add a subject to your email", {
        style: {
          background: mode === "dark" ? "#1F2937" : "#FFFFFF",
          color: mode === "dark" ? "#F3F4F6" : "#111827",
          border: `1px solid ${mode === "dark" ? "#374151" : "#E5E7EB"}`,
        },
      });
      return;
    }

    const isBodyEmpty = !body || body.trim() === "" || body === "<p><br></p>";
    if (isBodyEmpty) {
      toast.error("Please add content to your email", {
        style: {
          background: mode === "dark" ? "#1F2937" : "#FFFFFF",
          color: mode === "dark" ? "#F3F4F6" : "#111827",
          border: `1px solid ${mode === "dark" ? "#374151" : "#E5E7EB"}`,
        },
      });
      return;
    }

    const loadingToastId = toast.loading("Sending email...", {
      style: {
        background: mode === "dark" ? "#1F2937" : "#FFFFFF",
        color: mode === "dark" ? "#F3F4F6" : "#111827",
        border: `1px solid ${mode === "dark" ? "#374151" : "#E5E7EB"}`,
      },
    });
    onSend({ ...emailData, subject, body, toastId: loadingToastId });
  };

  if (!isOpen || !emailData) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-4xl h-[75vh] max-h-[700px] rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        } ${
          mode === "dark"
            ? "bg-gray-900/30 backdrop-blur-xl border border-gray-700/30"
            : "bg-white/30 backdrop-blur-xl border border-gray-200/30"
        } flex flex-col`}
      >
        {/* Header */}
        <div
          className="relative"
          style={{
            background:
              "linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(59, 130, 246, 0.8) 50%, rgba(96, 165, 250, 0.8) 100%)",
          }}
        >
          <div className="relative p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon
                  icon="ph:paper-plane-tilt-fill"
                  className="w-6 h-6 text-white"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Compose Email</h2>
                <p className="text-white/80 text-sm">
                  To {emailData.fullName || "Candidate"}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 flex items-center justify-center group"
            >
              <Icon
                icon="ph:x"
                className="w-5 h-5 text-white group-hover:scale-110 transition-transform"
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0 bg-white/40 backdrop-blur-sm">
          <div className="space-y-6">
            {/* Recipient */}
            <div className="space-y-2">
              <label
                className={`text-sm font-semibold flex items-center gap-2 ${
                  mode === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                <Icon icon="ph:user" className="w-4 h-4" />
                Recipient
              </label>
              <div
                className={`relative rounded-2xl transition-all duration-200 backdrop-blur-sm ${
                  mode === "dark"
                    ? "bg-gray-800/30 border border-gray-700/30"
                    : "bg-white/40 border border-gray-200/40"
                }`}
              >
                <div className="flex items-center p-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold mr-3 text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(59, 130, 246, 0.8) 50%, rgba(96, 165, 250, 0.8) 100%)",
                    }}
                  >
                    {emailData.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        mode === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {emailData.fullName || "Candidate"}
                    </p>
                    <p
                      className={`text-sm ${
                        mode === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {emailData.email || ""}
                    </p>
                  </div>
                  <Icon
                    icon="ph:check-circle-fill"
                    className="w-5 h-5 text-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label
                className={`text-sm font-semibold flex items-center gap-2 ${
                  mode === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                <Icon icon="ph:text-aa" className="w-4 h-4" />
                Subject Line
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 backdrop-blur-sm ${
                    mode === "dark"
                      ? "bg-gray-800/30 border-gray-700/30 text-white placeholder-gray-500 focus:border-blue-500/50 focus:bg-gray-800/50"
                      : "bg-white/40 border-gray-200/40 text-gray-900 placeholder-gray-400 focus:border-blue-500/50 focus:bg-white/60"
                  }`}
                />
                {subject && (
                  <Icon
                    icon="ph:check-circle-fill"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500"
                  />
                )}
              </div>
            </div>

            {/* Body */}
            <div className="space-y-2 flex-1">
              <label
                className={`text-sm font-semibold flex items-center gap-2 ${
                  mode === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                <Icon icon="ph:text-align-left" className="w-4 h-4" />
                Email Content
              </label>
              <div
                className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 min-h-[280px] backdrop-blur-sm ${
                  mode === "dark"
                    ? "bg-gray-800/30 border-gray-700/30 focus-within:border-blue-500/50"
                    : "bg-white/40 border-gray-200/40 focus-within:border-blue-500/50"
                }`}
              >
                <EditorComponent
                  initialValue={body}
                  onBlur={(newContent) => setBody(newContent)}
                  mode={mode}
                  holderId="jodit-editor-email-modal"
                  height="250"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Glassmorphic Effect */}
        <div
          className={`flex-shrink-0 p-6 border-t ${
            mode === "dark"
              ? "bg-gray-900/20 border-gray-700/30"
              : "bg-white/20 border-gray-200/30"
          } backdrop-blur-xl`}
        >
          <div className="flex items-center justify-between">
            {/* Status indicators */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    subject.trim() ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <span
                  className={`text-sm ${
                    mode === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Subject {subject.trim() ? "✓" : "required"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    body && body.trim() && body !== "<p><br></p>"
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                />
                <span
                  className={`text-sm ${
                    mode === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Content{" "}
                  {body && body.trim() && body !== "<p><br></p>"
                    ? "✓"
                    : "required"}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm ${
                  mode === "dark"
                    ? "bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 border border-gray-600/30"
                    : "bg-gray-100/40 text-gray-700 hover:bg-gray-200/50 border border-gray-200/40"
                }`}
              >
                <Icon icon="ph:x" className="w-4 h-4" />
                Cancel
              </button>

              <button
                onClick={handleSendClick}
                disabled={
                  !subject.trim() ||
                  !body ||
                  body.trim() === "" ||
                  body === "<p><br></p>"
                }
                className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  !subject.trim() ||
                  !body ||
                  body.trim() === "" ||
                  body === "<p><br></p>"
                    ? "bg-gray-400 text-white"
                    : "text-white shadow-blue-500/25"
                }`}
                style={{
                  background:
                    !subject.trim() ||
                    !body ||
                    body.trim() === "" ||
                    body === "<p><br></p>"
                      ? undefined
                      : "linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(59, 130, 246, 0.8) 50%, rgba(96, 165, 250, 0.8) 100%)",
                }}
                onMouseEnter={(e) => {
                  if (
                    subject.trim() &&
                    body &&
                    body.trim() !== "" &&
                    body !== "<p><br></p>"
                  ) {
                    e.target.style.background =
                      "linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(59, 130, 246, 0.9) 50%, rgba(96, 165, 250, 0.9) 100%)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (
                    subject.trim() &&
                    body &&
                    body.trim() !== "" &&
                    body !== "<p><br></p>"
                  ) {
                    e.target.style.background =
                      "linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(59, 130, 246, 0.8) 50%, rgba(96, 165, 250, 0.8) 100%)";
                  }
                }}
              >
                <Icon icon="ph:paper-plane-tilt-fill" className="w-5 h-5" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
