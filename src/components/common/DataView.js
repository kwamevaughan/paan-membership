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
    console.log('DataView - Received data:', data);
    console.log('DataView - View mode:', viewMode);
    console.log('DataView - Item name:', itemName);
  }, [data, viewMode, itemName]);

  useEffect(() => {
    if (data) {
      const startIndex = 0;
      const endIndex = Math.min(currentPage * itemsPerPage, data.length);
      const newPaginatedData = data.slice(startIndex, endIndex);
      console.log('DataView - Pagination:', {
        currentPage,
        itemsPerPage,
        startIndex,
        endIndex,
        dataLength: data.length,
        paginatedLength: newPaginatedData.length,
        hasMore: endIndex < data.length
      });
      setPaginatedData(newPaginatedData);
      
      // Notify parent of count changes
      if (onCountChange) {
        onCountChange({
          displayedCount: newPaginatedData.length,
          totalCount: data.length
        });
      }
    }
  }, [data, currentPage, itemsPerPage, onCountChange]);

  const hasMoreItems = paginatedData.length < (totalCount || data.length);
  const totalItems = totalCount || data.length;
  const displayedCount = paginatedData.length;

  console.log('DataView - Current state:', {
    hasMoreItems,
    totalItems,
    displayedCount,
    paginatedDataLength: paginatedData.length,
    dataLength: data?.length
  });

  const handleEdit = (item) => {
    console.log('DataView - Edit clicked:', item);
    if (handleEditClick) {
      handleEditClick(item);
    } else if (onEdit) {
      onEdit(item);
    }
  };

  const handleDelete = (item) => {
    console.log('DataView - Delete clicked:', item);
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
    console.log('DataView - Rendering card for item:', item);
    return renderCard(item, { onEdit: handleEdit, onDelete: handleDelete });
  };

  if (!data || data.length === 0) {
    console.log('DataView - No data to display');
    return null;
  }

  console.log('DataView - Rendering view with mode:', viewMode);
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
          remainingCount={totalItems - displayedCount}
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
          remainingCount={totalItems - displayedCount}
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