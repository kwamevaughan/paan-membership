import React, { useState } from 'react';
import { Icon } from "@iconify/react";
import BasicSEO from './BasicSEO';
import MetaInformation from './MetaInformation';
import AdditionalSEO from './AdditionalSEO';
import Readability from './Readability';
import Preview from './Preview';
import { calculateSEOScore, getScoreColor, getScoreBgColor, getScoreIcon } from '@/utils/seo';

// Export calculateTotalScore as an alias for calculateSEOScore for backward compatibility
export const calculateTotalScore = calculateSEOScore;
export { getScoreColor, getScoreBgColor, getScoreIcon };

export default function SEOTabs({ formData, editorContent, mode, handleInputChange }) {
  const [activeTab, setActiveTab] = useState('basic');

  const handleTabClick = (e, tab) => {
    e.preventDefault();
    setActiveTab(tab);
  };

  const tabs = [
    { id: 'basic', label: 'Basic SEO', icon: 'heroicons:document-text' },
    { id: 'meta', label: 'Meta Tags', icon: 'heroicons:tag' },
    { id: 'additional', label: 'Additional', icon: 'heroicons:adjustments-horizontal' },
    { id: 'readability', label: 'Readability', icon: 'heroicons:academic-cap' },
    { id: 'preview', label: 'Preview', icon: 'heroicons:eye' }
  ];

  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      mode === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
    }`}>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={(e) => handleTabClick(e, tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === tab.id
                ? mode === 'dark'
                  ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-900/10'
                  : 'text-blue-600 border-b-2 border-blue-500 bg-blue-50'
                : mode === 'dark'
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon icon={tab.icon} className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'basic' && (
          <BasicSEO formData={formData} editorContent={editorContent} mode={mode} />
        )}
        {activeTab === 'meta' && (
          <MetaInformation formData={formData} handleInputChange={handleInputChange} mode={mode} focusKeyword={formData.focus_keyword} />
        )}
        {activeTab === 'additional' && (
          <AdditionalSEO formData={formData} editorContent={editorContent} mode={mode} />
        )}
        {activeTab === 'readability' && (
          <Readability formData={formData} editorContent={editorContent} mode={mode} />
        )}
        {activeTab === 'preview' && (
          <Preview formData={formData} mode={mode} />
        )}
      </div>
    </div>
  );
} 