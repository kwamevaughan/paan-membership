import React, { useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import ReactDOM from "react-dom";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const DateFilter = ({ 
  mode, 
  showDatePicker, 
  setShowDatePicker, 
  dateRange, 
  setDateRange, 
  popoverPosition 
}) => {
  const datePickerRef = useRef();

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    }
    if (showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker, setShowDatePicker]);

  if (!showDatePicker) return null;

  return ReactDOM.createPortal(
    <div
      ref={datePickerRef}
      className={`z-[9999] absolute border rounded-lg shadow-lg p-4 ${
        mode === "dark"
          ? "bg-gray-900 border-gray-700"
          : "bg-white border-gray-200"
      }`}
      style={{
        top: popoverPosition.top,
        left: popoverPosition.left,
      }}
    >
      <DateRange
        ranges={dateRange}
        onChange={(ranges) =>
          setDateRange([ranges.selection])
        }
        moveRangeOnFirstSelection={false}
        showDateDisplay={true}
        editableDateInputs={true}
        maxDate={new Date()}
      />
      <div className="flex justify-end mt-2 gap-2">
        <button
          className={`px-3 py-1 rounded ${
            mode === "dark"
              ? "bg-gray-700 text-gray-100"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => {
            setDateRange([
              {
                startDate: null,
                endDate: null,
                key: "selection",
              },
            ]);
            setShowDatePicker(false);
          }}
        >
          Clear
        </button>
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setShowDatePicker(false)}
        >
          Apply
        </button>
      </div>
      {dateRange[0].startDate && dateRange[0].endDate && (
        <div
          className={`mt-2 text-xs ${
            mode === "dark"
              ? "text-gray-300"
              : "text-gray-600"
          }`}
        >
          Showing from{" "}
          {format(dateRange[0].startDate, "yyyy-MM-dd")} to{" "}
          {format(dateRange[0].endDate, "yyyy-MM-dd")}
        </div>
      )}
    </div>,
    document.body
  );
};

export default DateFilter;