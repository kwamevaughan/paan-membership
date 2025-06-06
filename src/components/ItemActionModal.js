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
    <div className="fixed inset-0 z-[50] overflow-y-auto">
      {/* Enhanced Glassmorphic Background */}
      <div
        className={`fixed inset-0 transition-all duration-500 backdrop-blur-sm
          ${
            mode === "dark"
              ? "bg-gradient-to-br from-slate-900/20 via-blue-900/10 to-blue-900/20"
              : "bg-gradient-to-br from-white/20 via-blue-50/30 to-blue-50/20"
          }`}
        onClick={onClose}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 123, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(100, 149, 237, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-2xl rounded-3xl transform transition-all duration-500 max-h-[85vh] overflow-hidden
            shadow-2xl shadow-black/20
            ${
              mode === "dark"
                ? "bg-gray-900/40 text-white border border-white/10"
                : "bg-white/30 text-gray-900 border border-white/20"
            } 
            backdrop-blur-lg`}
          style={{
            backdropFilter: "blur(12px) saturate(180%)", // Reduce blur here
            WebkitBackdropFilter: "blur(12px) saturate(180%)", // Reduce blur here
            background:
              mode === "dark"
                ? "linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.3) 100%)"
                : "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 1) 100%)",
          }}
        >
          {/* Premium Header with Gradient Overlay */}
          <div
            className="relative px-8 py-3 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(59, 130, 246, 0.8) 50%, rgba(96, 165, 250, 0.8) 100%)",
              backdropFilter: "blur(8px)", // Reduce blur here
            }}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-xl transform -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-lg transform translate-x-12 translate-y-12"></div>
            </div>

            <div className="relative flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="group p-3 rounded-2xl transition-all duration-300 hover:bg-white/20 hover:scale-110 active:scale-95"
                style={{
                  backdropFilter: "blur(4px)", // Reduce blur here
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <Icon
                  icon="heroicons:x-mark"
                  className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-90"
                />
              </button>
            </div>
          </div>

          {/* Content Area with Subtle Glass Effect */}
          <div
            className="p-8 overflow-y-auto max-h-[calc(85vh-120px)]"
            style={{
              background:
                mode === "dark"
                  ? "linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(30, 41, 59, 0.05) 100%)"
                  : "linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            }}
          >
            {/* Content wrapper with subtle inner glow */}
            <div
              className={`${
                mode === "dark" ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {children}
            </div>
          </div>

          {/* Subtle Border Enhancement */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: `
                linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.2) 0%, 
                  transparent 20%, 
                  transparent 80%, 
                  rgba(255, 255, 255, 0.1) 100%
                )
              `,
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "xor",
              WebkitMaskComposite: "xor",
              padding: "1px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
