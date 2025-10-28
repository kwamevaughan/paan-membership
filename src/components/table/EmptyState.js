import React from "react";
import { Icon } from "@iconify/react";

const EmptyState = ({ mode, emptyMessage, colSpan }) => {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-12 text-center"
      >
        <div
          className={`${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <div className="flex justify-center text-4xl mb-3">
            <Icon icon="mdi:table-search" className="w-10 h-10" />
          </div>
          <div className="text-sm font-medium">{emptyMessage}</div>
        </div>
      </td>
    </tr>
  );
};

export default EmptyState;