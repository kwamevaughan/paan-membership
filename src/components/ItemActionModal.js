import { Icon } from "@iconify/react";

export default function ItemActionModal({
  isOpen,
  onClose,
  title,
  children,
  mode,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay with glassmorphic effect */}
      <div
        className={`fixed inset-0 backdrop-blur-md bg-black/30 dark:bg-gray-900/40 transition-opacity duration-300
          ${mode === "dark" ? "bg-gray-900/40" : "bg-black/50"}`}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-4xl rounded-2xl shadow-2xl transform transition-all
          ${
            mode === "dark"
              ? "bg-gray-900/95 text-white"
              : "bg-white/95 text-gray-900"
          } 
          backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
              >
                <Icon icon="heroicons:x-mark" className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
