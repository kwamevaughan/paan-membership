import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export default function DocumentsProgress({
  formData,
  fileTypes,
  declarationChecks,
  mode,
}) {
  const progress = useMemo(() => {
    const totalItems = fileTypes.length + 3; // Documents + 3 declarations
    let completedItems = 0;

    // Count completed documents
    fileTypes.forEach((type) => {
      if (type.id === "portfolioWork") {
        if ((formData[type.id] !== undefined && formData[type.id] !== null) || 
            (formData.portfolioLinks && formData.portfolioLinks.length > 0 && 
             formData.portfolioLinks.some(link => link.url.trim() !== ""))) {
          completedItems++;
        }
      } else if (formData[type.id] !== undefined && formData[type.id] !== null) {
        completedItems++;
      }
    });

    // Count completed declarations
    Object.values(declarationChecks).forEach((checked) => {
      if (checked) completedItems++;
    });

    const progressPercentage = (completedItems / totalItems) * 100;

    return {
      totalItems,
      completedItems,
      progressPercentage,
      remainingItems: totalItems - completedItems,
    };
  }, [formData, fileTypes, declarationChecks]);

  return (
    <div
      className={`h-full p-6 rounded-2xl ${
        mode === 'dark'
          ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700'
          : 'bg-white/80 backdrop-blur-sm border border-gray-200'
      }`}
    >
      <div className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3
              className={`text-lg font-medium ${
                mode === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}
            >
              Documents Progress
            </h3>
            <span
              className={`text-sm ${
                mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {progress.completedItems} of {progress.totalItems} items
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-paan-blue"
              initial={{ width: 0 }}
              animate={{ width: `${progress.progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Documents Status */}
        <div className="space-y-4">
          <h4
            className={`text-sm font-medium ${
              mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Required Documents
          </h4>
          <div className="space-y-3">
            {fileTypes.map((file) => {
              const isCompleted = file.id === "portfolioWork" 
                ? ((formData[file.id] !== undefined && formData[file.id] !== null) || 
                   (formData.portfolioLinks && formData.portfolioLinks.length > 0 && 
                    formData.portfolioLinks.some(link => link.url.trim() !== "")))
                : (formData[file.id] !== undefined && formData[file.id] !== null);

              return (
                <div
                  key={file.id}
                  className={`p-3 rounded-lg ${
                    isCompleted
                      ? mode === 'dark'
                        ? 'bg-paan-blue/20 border border-paan-blue/30'
                        : 'bg-paan-blue/10 border border-paan-yellow/20'
                      : mode === 'dark'
                        ? 'bg-gray-700/50 border border-gray-600'
                        : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      icon={isCompleted ? "mdi:check-circle" : "mdi:file-document-outline"}
                      className={`w-4 h-4 ${
                        isCompleted
                          ? mode === 'dark'
                            ? 'text-paan-blue'
                            : 'text-paan-yellow'
                          : mode === 'dark'
                            ? 'text-gray-400'
                            : 'text-gray-500'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        isCompleted
                          ? mode === 'dark'
                            ? 'text-paan-blue'
                            : 'text-paan-yellow'
                          : mode === 'dark'
                            ? 'text-gray-300'
                            : 'text-gray-600'
                      }`}
                    >
                      {file.title}
                      {file.isOptional && (
                        <span className="text-xs ml-1 opacity-70">(Optional)</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Declarations Status */}
        <div className="space-y-4">
          <h4
            className={`text-sm font-medium ${
              mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Declarations
          </h4>
          <div className="space-y-3">
            {Object.entries(declarationChecks).map(([id, checked]) => (
              <div
                key={id}
                className={`p-3 rounded-lg ${
                  checked
                    ? mode === 'dark'
                      ? 'bg-paan-blue/20 border border-paan-blue/30'
                      : 'bg-paan-blue/10 border border-paan-yellow/20'
                    : mode === 'dark'
                      ? 'bg-gray-700/50 border border-gray-600'
                      : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    icon={checked ? "mdi:check-circle" : "mdi:checkbox-blank-circle-outline"}
                    className={`w-4 h-4 ${
                      checked
                        ? mode === 'dark'
                          ? 'text-paan-blue'
                          : 'text-paan-yellow'
                        : mode === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-500'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      checked
                        ? mode === 'dark'
                          ? 'text-paan-blue'
                          : 'text-paan-yellow'
                        : mode === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-600'
                    }`}
                  >
                    Declaration {Object.keys(declarationChecks).indexOf(id) + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 