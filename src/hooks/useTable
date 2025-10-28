import { useState, useMemo, useEffect } from "react";

// Enhanced useTable hook
export function useTable(
  data,
  initialPageSize = 10,
  statusOptions = null,
  options = {}
) {
  const { onSelectionChange, customFilter } = options || {};
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Check device type
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      // Standard tablet breakpoint
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDeviceType();
    window.addEventListener("resize", checkDeviceType);
    return () => window.removeEventListener("resize", checkDeviceType);
  }, []);

  // Optimized filtering with memoized search terms
  const searchTermLower = useMemo(
    () => searchTerm?.toLowerCase() || "",
    [searchTerm]
  );

  const filteredData = useMemo(() => {
    if (!data.length) return [];

    let result = data;

    // Apply custom filter if provided (most specific filter first)
    if (typeof customFilter === "function") {
      result = result.filter(customFilter);
    }

    // Status filter
    if (statusFilter && statusFilter !== "all" && statusOptions) {
      result = result.filter((row) => row.status === statusFilter);
    }

    // Date filters
    if (sortBy === "last_month") {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      result = result.filter(
        (row) => row.created_at && new Date(row.created_at) >= lastMonth
      );
    } else if (sortBy === "last_7_days") {
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(
        (row) => row.created_at && new Date(row.created_at) >= last7Days
      );
    }

    // Enhanced search filter (most expensive, do last)
    if (searchTermLower) {
      // Common fields to check first for better performance
      const commonFields = [
        "name",
        "title",
        "product_name",
        "description",
        "sku",
        "barcode",
        "id",
        "email",
        "phone",
        "address",
      ];

      // Deep search function to handle nested objects
      const deepSearch = (obj, term) => {
        if (typeof obj === "string") {
          return obj.toLowerCase().includes(term);
        }

        if (Array.isArray(obj)) {
          return obj.some((item) => deepSearch(item, term));
        }

        if (obj && typeof obj === "object") {
          return Object.values(obj).some((value) => deepSearch(value, term));
        }

        return String(obj || "")
          .toLowerCase()
          .includes(term);
      };

      result = result.filter((row) => {
        // 1. Check common fields first for early return
        for (const field of commonFields) {
          const value = row[field];
          if (value && String(value).toLowerCase().includes(searchTermLower)) {
            return true;
          }
        }

        // 2. Check all string values in the row
        for (const [key, value] of Object.entries(row)) {
          // Skip non-string values and common fields we already checked
          if (typeof value !== "string" || commonFields.includes(key)) continue;

          if (value.toLowerCase().includes(searchTermLower)) {
            return true;
          }
        }

        // 3. Deep search for nested objects and arrays
        return deepSearch(row, searchTermLower);
      });
    }

    return result; // Make sure to return the result
  }, [
    data,
    searchTermLower,
    statusFilter,
    sortBy,
    statusOptions,
    customFilter,
  ]);

  // Sorting
  const sortedData = useMemo(() => {
    if (sortBy === "recent") {
      return [...filteredData].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } else if (sortBy === "asc") {
      return [...filteredData].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    } else if (sortBy === "desc") {
      return [...filteredData].sort((a, b) =>
        (b.name || "").localeCompare(a.name || "")
      );
    }
    // Default to filteredData
    return filteredData;
  }, [filteredData, sortBy]);

  // Column sorting
  const columnSortedData = useMemo(() => {
    if (!sortKey) return sortedData;

    return [...sortedData].sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = "";
      if (bValue === null || bValue === undefined) bValue = "";

      // Handle numeric values
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDir === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Handle date values
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDir === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Handle string values (including dates as strings)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortDir === "asc") {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [sortedData, sortKey, sortDir]);

  const totalPages =
    pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
  const paged =
    pageSize === -1
      ? columnSortedData
      : columnSortedData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handlePage = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(
      selected.length === paged.length ? [] : paged.map((row) => row.id)
    );
  };

  useEffect(() => {
    if (typeof onSelectionChange === "function") {
      onSelectionChange(selected);
    }
  }, [selected, onSelectionChange]);

  const clearSelection = () => {
    setSelected([]);
  };

  return {
    paged,
    page,
    pageSize,
    totalPages,
    sortKey,
    sortDir,
    selected,
    searchTerm,
    setPage,
    setPageSize,
    handleSort,
    handlePage,
    toggleSelect,
    selectAll,
    setSearchTerm,
    totalItems: columnSortedData.length,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    isMobile,
    isTablet,
    clearSelection,
  };
}