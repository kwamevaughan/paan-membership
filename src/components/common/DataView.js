import { memo, useEffect, useState } from "react";
import DataTable from "./DataTable";
import DataGrid from "./DataGrid";
import { Icon } from "@iconify/react";

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
  itemName = "opportunity",
  customActions,
  viewMode = "grid",
  onViewModeChange,
  itemsPerPage = 6,
  totalCount,
  onCountChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);

  useEffect(() => {
  }, [data, viewMode, itemName]);

  useEffect(() => {
    if (data) {
      const startIndex = 0;
      const endIndex = Math.min(currentPage * itemsPerPage, data.length);
      const newPaginatedData = data.slice(startIndex, endIndex);
      
      setPaginatedData(newPaginatedData);
      
      
      
      // Notify parent of count changes
      if (onCountChange) {
        onCountChange({
          displayedCount: newPaginatedData.length,
          totalCount: totalCount || data.length
        });
      }
    }
  }, [data, currentPage, itemsPerPage, onCountChange, hasMore, remainingCount, totalCount]);

  const hasMoreItems = hasMore || (data && data.length > currentPage * itemsPerPage);
  const totalItems = totalCount || data.length;
  const displayedCount = paginatedData.length;
  const remainingItems = Math.max(0, totalItems - (currentPage * itemsPerPage));

  

  const handleEdit = (item) => {
    if (handleEditClick) {
      handleEditClick(item);
    } else if (onEdit) {
      onEdit(item);
    }
  };

  const handleDelete = (item) => {
    if (onDelete) {
      onDelete(item);
    }
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
    if (onLoadMore) {
      onLoadMore();
    }
  };

  // Create a wrapper for the card renderer that includes the handlers
  const renderCardWithHandlers = (item) => {
    return renderCard(item, { onEdit: handleEdit, onDelete: handleDelete });
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {viewMode === "list" || viewMode === "table" ? (
        <DataTable
          data={paginatedData}
          columns={columns}
          selectedItems={selectedItems}
          onSelectAll={onSelectAll}
          onSelectItem={onSelect}
          onDelete={handleDelete}
          onEdit={handleEdit}
          mode={mode}
          hasMore={hasMoreItems}
          onLoadMore={handleLoadMore}
          remainingCount={remainingItems}
          itemName={itemName}
          customActions={customActions}
          displayedCount={displayedCount}
          totalCount={totalItems}
        />
      ) : (
        <DataGrid
          data={paginatedData}
          renderCard={renderCardWithHandlers}
          mode={mode}
          hasMore={hasMoreItems}
          onLoadMore={handleLoadMore}
          remainingCount={remainingItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          displayedCount={displayedCount}
          totalCount={totalItems}
        />
      )}
    </div>
  );
});

DataView.displayName = 'DataView';

export default DataView; 