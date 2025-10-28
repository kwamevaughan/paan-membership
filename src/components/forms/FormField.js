import React from 'react';

const FormField = ({ 
  label, 
  error, 
  required = false, 
  children, 
  className = "",
  helpText = "",
  mode = "light"
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className={`block mb-1 font-medium ${
        mode === "dark" ? "text-gray-200" : "text-gray-700"
      }`}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {helpText && (
        <p className={`text-xs mt-1 ${
          mode === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          {helpText}
        </p>
      )}
      {error && (
        <div className="text-red-600 text-sm mt-1">{error}</div>
      )}
    </div>
  );
};

export default FormField;
