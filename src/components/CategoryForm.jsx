import { useEffect, useState } from "react";

export default function CategoryForm({
  isOpen,
  onCancel,
  onSubmit,
  category,
  mode,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setDescription(category.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [category]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      id: category?.id,
      name: name.trim(),
      description: description.trim(),
    });
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`w-full max-w-md mx-auto p-6 rounded-xl shadow-lg ${
          mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {category ? "Edit Category" : "Add Category"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-red-500 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category Name"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#f05d23]"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#f05d23]"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-[#f05d23] text-white hover:bg-[#d94f1e]"
          >
            {category ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
