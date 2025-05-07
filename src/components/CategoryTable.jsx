import { Icon } from "@iconify/react";

export default function CategoryTable({
  categories,
  onEdit,
  onDelete,
  onAdd,
  mode,
}) {
  // Ensure categories is an array
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="overflow-x-auto mt-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="text-left bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-white">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeCategories.map((cat) => (
            <tr
              key={cat.id}
              className="border-t border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100"
            >
              <td className="px-4 py-2">{cat.name}</td>
              <td className="px-4 py-2 text-right flex justify-end gap-2">
                {/* Add Button (comes first) */}
                <button
                  onClick={() => onAdd(cat)}
                  className="bg-[#f2b707] text-white px-4 py-1 rounded-full hover:bg-[#e1a303] flex items-center gap-1"
                >
                  <Icon icon="mdi:plus-circle" width={18} />
                  <span>Add</span>
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => onEdit(cat)}
                  className="bg-[#84c1d9] text-white px-4 py-1 rounded-full hover:bg-[#75abc7] flex items-center gap-1"
                >
                  <Icon icon="mdi:pencil" width={18} />
                  <span>Edit</span>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => onDelete(cat.id)}
                  className="bg-[#f25849] text-white px-4 py-1 rounded-full hover:bg-[#e14c42] flex items-center gap-1"
                >
                  <Icon icon="mdi:trash-can-outline" width={18} />
                  <span>Delete</span>
                </button>
              </td>
            </tr>
          ))}
          {safeCategories.length === 0 && (
            <tr>
              <td colSpan={2} className="px-4 py-4 text-center text-gray-500">
                No categories found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
