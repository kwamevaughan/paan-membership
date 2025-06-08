import React from 'react';
import { Icon } from "@iconify/react";

const SEOOptimizer = ({ 
  title, 
  description, 
  content, 
  keywords,
  mode = "light" 
}) => {
  // SEO Analysis Functions
  const analyzeTitle = () => {
    const length = title?.length || 0;
    const hasKeyword = keywords?.some(keyword => 
      title?.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return {
      length: {
        status: length >= 30 && length <= 60 ? 'good' : length < 30 ? 'too-short' : 'too-long',
        message: length < 30 ? 'Title is too short' : length > 60 ? 'Title is too long' : 'Title length is good'
      },
      keyword: {
        status: hasKeyword ? 'good' : 'missing',
        message: hasKeyword ? 'Title contains focus keyword' : 'Title should contain focus keyword'
      }
    };
  };

  const analyzeDescription = () => {
    const length = description?.length || 0;
    const hasKeyword = keywords?.some(keyword => 
      description?.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return {
      length: {
        status: length >= 120 && length <= 160 ? 'good' : length < 120 ? 'too-short' : 'too-long',
        message: length < 120 ? 'Description is too short' : length > 160 ? 'Description is too long' : 'Description length is good'
      },
      keyword: {
        status: hasKeyword ? 'good' : 'missing',
        message: hasKeyword ? 'Description contains focus keyword' : 'Description should contain focus keyword'
      }
    };
  };

  const analyzeContent = () => {
    const wordCount = content?.split(/\s+/).filter(Boolean).length || 0;
    const hasKeyword = keywords?.some(keyword => 
      content?.toLowerCase().includes(keyword.toLowerCase())
    );
    const keywordDensity = keywords?.map(keyword => {
      const count = (content?.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      const density = (count / wordCount) * 100;
      return {
        keyword,
        density,
        status: density >= 0.5 && density <= 2.5 ? 'good' : density < 0.5 ? 'too-low' : 'too-high'
      };
    }) || [];

    return {
      length: {
        status: wordCount >= 300 ? 'good' : 'too-short',
        message: wordCount < 300 ? 'Content is too short' : 'Content length is good'
      },
      keyword: {
        status: hasKeyword ? 'good' : 'missing',
        message: hasKeyword ? 'Content contains focus keyword' : 'Content should contain focus keyword'
      },
      density: keywordDensity
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return mode === 'dark' ? 'text-green-400' : 'text-green-600';
      case 'too-short':
      case 'too-long':
      case 'too-low':
      case 'too-high':
      case 'missing':
        return mode === 'dark' ? 'text-red-400' : 'text-red-600';
      default:
        return mode === 'dark' ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return 'heroicons:check-circle';
      case 'too-short':
      case 'too-long':
      case 'too-low':
      case 'too-high':
      case 'missing':
        return 'heroicons:x-circle';
      default:
        return 'heroicons:information-circle';
    }
  };

  const titleAnalysis = analyzeTitle();
  const descriptionAnalysis = analyzeDescription();
  const contentAnalysis = analyzeContent();

  return (
    <div className={`space-y-6 p-4 rounded-xl border ${
      mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-medium ${
        mode === 'dark' ? 'text-gray-200' : 'text-gray-900'
      }`}>
        SEO Analysis
      </h3>

      {/* Title Analysis */}
      <div className="space-y-2">
        <h4 className={`text-sm font-medium ${
          mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Title
        </h4>
        <div className="space-y-1">
          {Object.entries(titleAnalysis).map(([key, analysis]) => (
            <div key={key} className="flex items-center gap-2">
              <Icon 
                icon={getStatusIcon(analysis.status)} 
                className={`w-4 h-4 ${getStatusColor(analysis.status)}`}
              />
              <span className={`text-sm ${getStatusColor(analysis.status)}`}>
                {analysis.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Description Analysis */}
      <div className="space-y-2">
        <h4 className={`text-sm font-medium ${
          mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Description
        </h4>
        <div className="space-y-1">
          {Object.entries(descriptionAnalysis).map(([key, analysis]) => (
            <div key={key} className="flex items-center gap-2">
              <Icon 
                icon={getStatusIcon(analysis.status)} 
                className={`w-4 h-4 ${getStatusColor(analysis.status)}`}
              />
              <span className={`text-sm ${getStatusColor(analysis.status)}`}>
                {analysis.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content Analysis */}
      <div className="space-y-2">
        <h4 className={`text-sm font-medium ${
          mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Content
        </h4>
        <div className="space-y-1">
          {Object.entries(contentAnalysis).map(([key, analysis]) => {
            if (key === 'density') {
              return (
                <div key={key} className="space-y-1">
                  {analysis.map(({ keyword, density, status }) => (
                    <div key={keyword} className="flex items-center gap-2">
                      <Icon 
                        icon={getStatusIcon(status)} 
                        className={`w-4 h-4 ${getStatusColor(status)}`}
                      />
                      <span className={`text-sm ${getStatusColor(status)}`}>
                        Keyword "{keyword}" density: {density.toFixed(2)}%
                        {status === 'too-low' && ' (too low)'}
                        {status === 'too-high' && ' (too high)'}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }
            return (
              <div key={key} className="flex items-center gap-2">
                <Icon 
                  icon={getStatusIcon(analysis.status)} 
                  className={`w-4 h-4 ${getStatusColor(analysis.status)}`}
                />
                <span className={`text-sm ${getStatusColor(analysis.status)}`}>
                  {analysis.message}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SEOOptimizer; 