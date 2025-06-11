import { memo } from "react";
import DataTable from "./DataTable";
import DataGrid from "./DataGrid";

const DataView = memo(({
  data,
  columns,
  renderCard,
  mode = "light",
  loading = false,
  selectedItems = [],
  onSelect,
  onSelectAll,
  onDelete,
  onEdit,
  handleEditClick,
  hasMore,
  onLoadMore,
  remainingCount,
  itemName = "item",
  customActions,
  viewMode = "grid",
  onViewModeChange,
}) => {
  // Create a wrapper for the card renderer that includes the handlers
  const renderCardWithHandlers = (item) => {
    return renderCard(item, { onEdit: handleEditClick, onDelete });
  };

  return (
    <div className="space-y-6">
      {viewMode === "list" || viewMode === "table" ? (
        <DataTable
          data={data}
          columns={columns}
          selectedItems={selectedItems}
          onSelectAll={onSelectAll}
          onSelectItem={onSelect}
          onDelete={onDelete}
          onEdit={handleEditClick}
          mode={mode}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          remainingCount={remainingCount}
          itemName={itemName}
          customActions={customActions}
        />
      ) : (
        <DataGrid
          data={data}
          renderCard={renderCardWithHandlers}
          mode={mode}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          remainingCount={remainingCount}
          onEdit={handleEditClick}
          onDelete={onDelete}
        />
      )}
    </div>
  );
});

DataView.displayName = 'DataView';

export default DataView; 