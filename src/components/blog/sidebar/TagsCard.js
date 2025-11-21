import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import SidebarCard from "@/components/common/SidebarCard";

export default function TagsCard({
  mode,
  isCollapsed,
  onToggle,
  tags,
  selectedTags,
  onTagSelect,
  onTagRemove,
  onTagAdded,
}) {
  const [tagInput, setTagInput] = useState("");
  const [showTagList, setShowTagList] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTags = async () => {
    const newTags = tagInput.split(',').map(t => t.trim()).filter(t => t);
    
    if (newTags.length === 0) return;
    
    setIsAdding(true);
    
    for (const tagName of newTags) {
      if (selectedTags.includes(tagName)) {
        continue; // Skip already selected tags
      }
      
      // Check if tag exists in the database
      const existingTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
      
      if (existingTag) {
        // Tag exists, just select it
        onTagSelect(existingTag.name);
      } else {
        // Tag doesn't exist, create it in the database
        try {
          const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const { data, error } = await supabase
            .from("blog_tags")
            .insert([{ name: tagName, slug }])
            .select()
            .single();
          
          if (error) throw error;
          
          // Notify parent component about the new tag
          if (onTagAdded) {
            onTagAdded(data);
          }
          
          // Select the newly created tag
          onTagSelect(data.name);
          toast.success(`Tag "${tagName}" created and added`);
        } catch (error) {
          console.error("Error creating tag:", error);
          toast.error(`Failed to create tag "${tagName}"`);
        }
      }
    }
    
    setTagInput("");
    setIsAdding(false);
  };

  return (
    <SidebarCard
      title="Tags"
      icon="heroicons:tag"
      isCollapsed={isCollapsed}
      onToggle={onToggle}
      mode={mode}
    >
      <div className="space-y-3">
        {/* Tag Input with Add Button - WordPress Style */}
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTags();
              }
            }}
            placeholder="Add tags"
            className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
              mode === "dark"
                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            } focus:ring-2 focus:ring-blue-500`}
          />
          <button
            type="button"
            onClick={handleAddTags}
            disabled={isAdding}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "dark"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAdding ? (
              <Icon icon="eos-icons:loading" className="w-4 h-4" />
            ) : (
              "Add"
            )}
          </button>
        </div>

        <p className={`text-xs ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          Separate tags with commas
        </p>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${
                  mode === "dark"
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {tag}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onTagRemove(tag);
                  }}
                  className="ml-1 hover:text-red-500"
                >
                  <Icon icon="heroicons:x-mark" className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Choose from most used */}
        <div>
          <button
            type="button"
            onClick={() => setShowTagList(!showTagList)}
            className={`text-sm flex items-center gap-1 transition-colors ${
              mode === "dark" 
                ? "text-blue-400 hover:text-blue-300" 
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            <Icon 
              icon={showTagList ? "heroicons:chevron-up" : "heroicons:chevron-down"} 
              className="w-4 h-4" 
            />
            Choose from the most used tags
          </button>

          {showTagList && (
            <div className={`mt-2 max-h-48 overflow-y-auto space-y-1 p-2 rounded-lg border ${
              mode === "dark" 
                ? "bg-gray-800/50 border-gray-700" 
                : "bg-gray-50 border-gray-200"
            }`}>
              {tags
                .filter((tag) => !selectedTags.includes(tag.name))
                .map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      onTagSelect(tag.name);
                      setShowTagList(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                      mode === "dark"
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              {tags.filter((tag) => !selectedTags.includes(tag.name)).length === 0 && (
                <p className={`text-xs text-center py-2 ${
                  mode === "dark" ? "text-gray-500" : "text-gray-400"
                }`}>
                  All tags are already selected
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </SidebarCard>
  );
}
