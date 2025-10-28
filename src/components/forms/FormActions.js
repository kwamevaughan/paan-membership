import React from 'react';
import { Icon } from '@iconify/react';

const FormActions = ({ 
  onCancel, 
  onSave, 
  loading = false, 
  mode = "light",
  saveText = "Save",
  cancelText = "Cancel",
  showSave = true,
  variant = "default", // 'default', 'danger', or 'warning' for different actions
  saveIcon = null // Icon name for the save button (e.g., 'mdi:check')
}) => {
  const isDark = mode === "dark";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className={`group relative overflow-hidden px-6 py-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg w-full ${
          isDark
            ? "bg-slate-800/80 backdrop-blur-sm border-slate-600/50 text-slate-200 hover:bg-slate-700/80 hover:border-slate-500"
            : "bg-white/80 backdrop-blur-sm border-slate-300/50 text-slate-700 hover:bg-slate-50/80 hover:border-slate-400/50"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="relative flex items-center justify-center gap-2">
          {cancelText}
        </div>
      </button>
      
      {showSave ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (!loading && typeof onSave === 'function') onSave(e);
          }}
          disabled={loading}
          className={`group relative overflow-hidden px-6 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full ${
            variant === 'danger' 
              ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-500/10' 
              : variant === 'warning'
              ? 'bg-amber-600 hover:bg-amber-700 text-white hover:shadow-amber-500/10'
              : 'bg-gradient-to-r from-richBlue to-richBlueLight hover:from-richBlueLight hover:to-richBlue text-white hover:shadow-richBlue/10'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="relative flex items-center justify-center gap-2">
            {loading ? (
              <Icon icon="mdi:loading" className="animate-spin w-5 h-5" />
            ) : saveIcon ? (
              <Icon icon={saveIcon} className="w-5 h-5" />
            ) : null}
            <span className="font-medium">{saveText}</span>
          </div>
        </button>
      ) : (
        <div></div> // Empty div to maintain grid layout when save button is hidden
      )}
    </div>
  );
};

export default FormActions;
