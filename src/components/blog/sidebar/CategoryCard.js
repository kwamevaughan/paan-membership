import { useState } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import SidebarCard from "@/components/common/SidebarCard";

export default function CategoryCard({
  mode,
  isCollapsed,
  onToggle,
  categories,
  selectedCategoryId,
  onCategoryChange,
  onCategoryAdded,
}) {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { data, error } = await supabase
          .from("blog_categories")
          .insert([{ name: newCategoryName.trim(), slug, description: newCategoryName.trim() }])
          .select()
          .single();
        
        if (error) throw error;
        toast.success("Category added successfully");
        onCategoryAdded(data);
        setNewCategoryName("");
        setShowAddCategory(false);
      } catch (error) {
        console.error("Error adding category:", error);
        toast.error("Failed to add category");
      }
    }
  };

  return (
    <SidebarCard
      title="Categories"
      icon="heroicons:folder"
      isCollapsed={isCollapsed}
      onToggle={onToggle}
      mode={mode}
    >
      <div className="space-y-3">
        {/* Category Radio Buttons */}
        <div className={`max-h-48 overflow-y-auto space-y-2 p-2 rounded-lg ${
          mode === "dark" ? "bg-gray-800/50" : "bg-gray-50"
        }`}>
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded">
              <input
                type="radio"
                name="category_id"
                value={category.id}
                checked={selectedCategoryId === category.id}
                onChange={(e) => onCategoryChange(e)}
                className="w-4 h-4"
              />
              <span className={`text-sm capitalize ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                {category.name}
              </span>
            </label>
          ))}
        </div>

        {/* Add New Category - WordPress Style */}
        {!showAddCategory ? (
          <button
            type="button"
            onClick={() => setShowAddCategory(true)}
            className={`text-sm flex items-center gap-1 transition-colors ${
              mode === "dark" 
                ? "text-blue-400 hover:text-blue-300" 
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            <Icon icon="heroicons:plus" className="w-4 h-4" />
            Add New Category
          </button>
        ) : (
          <div className={`p-3 rounded-lg border ${
            mode === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
          }`}>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className={`w-full px-3 py-2 rounded-lg border text-sm mb-2 ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCategory}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  mode === "dark"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategoryName("");
                }}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  mode === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </SidebarCard>
  );
}
