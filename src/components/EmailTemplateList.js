// src/components/EmailTemplateList.js
import { useState } from "react";
import { Icon } from "@iconify/react";
import { templateNameMap } from "../../utils/templateUtils"; // Import the mapping

const EmailTemplateList = ({ templates, selectedTemplate, onSelectTemplate, mode }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTemplates = templates.filter((template) => {
    const friendlyName = templateNameMap[template.name] || template.name;
    return friendlyName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div
      className={`p-6 rounded-xl shadow-lg ${
        mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <h3 className="text-xl font-semibold mb-4">Templates</h3>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
              mode === "dark"
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-gray-50 text-gray-900 border-gray-300"
            }`}
          />
          <Icon
            icon="mdi:magnify"
            width={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>
      <ul className="space-y-2 max-h-[600px] overflow-y-auto">
        {filteredTemplates.length === 0 ? (
          <li className="p-2 text-center text-gray-500 dark:text-gray-400">No templates found</li>
        ) : (
          filteredTemplates.map((template) => (
            <li
              key={template.id}
              className={`p-3 rounded-md cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedTemplate?.id === template.id
                  ? "bg-[#f05d23] text-white"
                  : mode === "dark"
                  ? "hover:bg-gray-700"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => onSelectTemplate(template)}
            >
              {templateNameMap[template.name] || template.name}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default EmailTemplateList;