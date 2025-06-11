import { useState, memo } from "react";
import { Icon } from "@iconify/react";
import ItemActionModal from "../ItemActionModal";

const TableRow = memo(({ item, columns, selectedItems, onSelectItem, onEdit, onDelete, customActions, mode }) => {
  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(item);
    }
  };

  return (
    <tr 
      key={item.id} 
      onClick={() => onSelectItem(item.id)}
      className={`hover:bg-opacity-50 ${
        mode === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50"
      }`}
    >
      <td 
        className="px-6 py-4 cursor-pointer" 
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={selectedItems.includes(item.id)}
          onChange={() => onSelectItem(item.id)}
          className={`rounded border-gray-300 ${
            mode === "dark" ? "bg-gray-700" : "bg-white"
          }`}
        />
      </td>
      {columns.map((column) => {
        const cellContent = column.render ? column.render(item) : item[column.key];
        return (
          <td
            key={column.key}
            className={`px-6 py-4 ${column.align === "right" ? "text-right" : ""}`}
            onClick={(e) => column.onClick ? column.onClick(e, item) : null}
          >
            {cellContent}
          </td>
        );
      })}
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-2">
          {customActions ? (
            customActions(item)
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
                title="Edit"
              >
                <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
                title="Delete"
              >
                <Icon icon="heroicons:trash" className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
});

TableRow.displayName = 'TableRow';

const DataTable = memo(({
  data,
  columns,
  selectedItems,
  onSelectAll,
  onSelectItem,
  onDelete,
  onEdit,
  mode = "light",
  hasMore,
  onLoadMore,
  remainingCount,
  itemName = "item",
  customActions,
}) => {
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  const handleDeleteAll = () => {
    selectedItems.forEach(id => onDelete && onDelete({ id }));
    setIsDeleteAllModalOpen(false);
  };

  return (
    <div className="">
      {selectedItems.length > 0 && (
        <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
          mode === "dark" ? "bg-gray-800" : "bg-gray-100"
        }`}>
          <div className="flex items-center gap-2">
            <Icon icon="heroicons:check-circle" className={`w-5 h-5 ${
              mode === "dark" ? "text-blue-400" : "text-blue-600"
            }`} />
            <span className={`text-sm font-medium ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}>
              {selectedItems.length} {itemName}{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectAll(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                mode === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              } transition-colors duration-200`}
            >
              <Icon icon="heroicons:x-mark" className="w-4 h-4" />
              Clear Selection
            </button>
            <button
              onClick={() => setIsDeleteAllModalOpen(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                mode === "dark"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              } transition-colors duration-200`}
            >
              <Icon icon="heroicons:trash" className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={`w-full ${mode === "dark" ? "text-gray-200" : "text-gray-700"}`}>
          <thead>
            <tr className={`border-b ${mode === "dark" ? "border-gray-700" : "border-gray-200"}`}>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={selectedItems.length === data.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className={`rounded border-gray-300 ${
                    mode === "dark" ? "bg-gray-700" : "bg-white"
                  }`}
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-sm font-semibold ${
                    column.align === "right" ? "text-right" : ""
                  }`}
                >
                  {column.label}
                </th>
              ))}
              <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item) => (
              <TableRow
                key={item.id}
                item={item}
                columns={columns}
                selectedItems={selectedItems}
                onSelectItem={onSelectItem}
                onEdit={onEdit}
                onDelete={onDelete}
                customActions={customActions}
                mode={mode}
              />
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              mode === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:arrow-down" className="w-4 h-4" />
              <span>Load More ({remainingCount} remaining)</span>
            </div>
          </button>
        </div>
      )}

      <ItemActionModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        title="Confirm Bulk Deletion"
        mode={mode}
      >
        <div className="space-y-6">
          <p className={`text-sm ${
            mode === "dark" ? "text-gray-300" : "text-gray-600"
          }`}>
            Are you sure you want to delete {selectedItems.length} selected {itemName}{selectedItems.length !== 1 ? 's' : ''}? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setIsDeleteAllModalOpen(false)}
              className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center shadow-sm ${
                mode === "dark"
                  ? "border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleDeleteAll}
              className={`px-6 py-3 text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all duration-200 flex items-center shadow-sm ${
                mode === "dark" ? "shadow-white/10" : "shadow-gray-200"
              }`}
            >
              <Icon icon="heroicons:trash" className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </ItemActionModal>
    </div>
  );
});

DataTable.displayName = 'DataTable';

export default DataTable; 