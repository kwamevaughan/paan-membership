import React from "react";
import { Icon } from "@iconify/react";

/**
 * AnalyticsDashboard Component
 * Displays summit analytics with key metrics and visualizations
 */
export function AnalyticsDashboard({
  analytics = {},
  loading = false,
  mode = "light",
  dateRange = {},
  onDateRangeChange,
}) {
  const { revenue, ticketSales, geographic, summary, promoCodes } = analytics;

  // Metric Card Component
  const MetricCard = ({ title, value, subtitle, icon, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
    };

    return (
      <div
        className={`p-6 rounded-lg border ${
          mode === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } shadow-sm`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                mode === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {title}
            </p>
            <p
              className={`text-2xl font-bold mt-2 ${
                mode === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {value}
            </p>
            {subtitle && (
              <p
                className={`text-xs mt-1 ${
                  mode === "dark" ? "text-gray-500" : "text-gray-500"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`p-3 rounded-lg ${colorClasses[color]} bg-opacity-10`}
          >
            <Icon
              icon={icon}
              className={`w-6 h-6 ${colorClasses[color].replace("bg-", "text-")}`}
            />
          </div>
        </div>
      </div>
    );
  };

  // Date Range Selector
  const DateRangeSelector = () => {
    const presets = [
      { label: "Today", value: "today" },
      { label: "Last 7 Days", value: "week" },
      { label: "Last 30 Days", value: "month" },
      { label: "Last 90 Days", value: "quarter" },
      { label: "Last Year", value: "year" },
      { label: "All Time", value: "all" },
    ];

    return (
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onDateRangeChange && onDateRangeChange(preset.value)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              mode === "dark"
                ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`p-6 rounded-lg animate-pulse ${
                mode === "dark" ? "bg-gray-800" : "bg-gray-200"
              }`}
            >
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      {onDateRangeChange && (
        <div
          className={`p-4 rounded-lg ${
            mode === "dark" ? "bg-gray-800" : "bg-gray-50"
          }`}
        >
          <h3 className="text-sm font-semibold mb-3">Date Range</h3>
          <DateRangeSelector />
        </div>
      )}

      {/* Key Metrics */}
      {(summary || revenue) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={`$${(revenue?.total || 0).toLocaleString()}`}
            subtitle={`${summary?.completedPurchases || 0} purchases`}
            icon="mdi:cash-multiple"
            color="green"
          />
          <MetricCard
            title="Tickets Sold"
            value={(summary?.totalTicketsSold || 0).toLocaleString()}
            subtitle={`Avg: $${(revenue?.averageTransaction || 0).toFixed(2)}`}
            icon="mdi:ticket"
            color="blue"
          />
          <MetricCard
            title="Total Discounts"
            value={`$${(revenue?.discounts || 0).toLocaleString()}`}
            subtitle="From promo codes"
            icon="mdi:tag-multiple"
            color="purple"
          />
          <MetricCard
            title="Average Order"
            value={`$${(revenue?.averageTransaction || 0).toFixed(2)}`}
            subtitle="Per transaction"
            icon="mdi:chart-line"
            color="orange"
          />
        </div>
      )}

      {/* Revenue Trend */}
      {revenue && revenue.revenueTrend && revenue.revenueTrend.length > 0 && (
        <div
          className={`p-6 rounded-lg border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon icon="mdi:chart-line" className="w-5 h-5" />
            Revenue Trend
          </h3>
          <div className="space-y-2">
            {revenue.revenueTrend.slice(0, 10).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
              >
                <span className="text-sm">
                  {item.date
                    ? new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
                <span className="font-semibold">
                  ${(item.amount || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Sales by Type */}
      {ticketSales && ticketSales.byType && ticketSales.byType.length > 0 && (
        <div
          className={`p-6 rounded-lg border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon icon="mdi:ticket-percent" className="w-5 h-5" />
            Ticket Sales by Type
          </h3>
          <div className="space-y-4">
            {ticketSales.byType.map((ticket, index) => {
              const revenues = ticketSales.byType.map((t) => t.revenue || 0).filter(r => r > 0);
              const maxRevenue = revenues.length > 0 ? Math.max(...revenues) : 1;
              const percentage = maxRevenue > 0 ? ((ticket.revenue || 0) / maxRevenue) * 100 : 0;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {ticket.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {ticket.quantity} sold
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold min-w-[80px] text-right">
                      ${(ticket.revenue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Geographic Distribution */}
      {geographic && geographic.byCountry && geographic.byCountry.length > 0 && (
        <div
          className={`p-6 rounded-lg border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon icon="mdi:earth" className="w-5 h-5" />
            Geographic Distribution
          </h3>
          <div className="space-y-3">
            {geographic.byCountry.slice(0, 10).map((location, index) => {
              const counts = geographic.byCountry.map((l) => l.purchases || 0).filter(c => c > 0);
              const maxCount = counts.length > 0 ? Math.max(...counts) : 1;
              const percentage = maxCount > 0 ? ((location.purchases || 0) / maxCount) * 100 : 0;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {location.country}
                    </span>
                    <span className="text-sm text-gray-500">
                      {location.purchases} purchases
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Promo Code Effectiveness */}
      {promoCodes && promoCodes.length > 0 && (
        <div
          className={`p-6 rounded-lg border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon icon="mdi:tag-multiple" className="w-5 h-5" />
            Promo Code Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={`border-b ${
                    mode === "dark" ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <th className="text-left py-2 px-3 text-sm font-medium">
                    Code
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium">
                    Type
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium">
                    Uses
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium">
                    Discount
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.slice(0, 10).map((promo, index) => (
                  <tr
                    key={index}
                    className={`border-b ${
                      mode === "dark" ? "border-gray-700" : "border-gray-200"
                    } last:border-0`}
                  >
                    <td className="py-3 px-3 text-sm font-medium">
                      {promo.code}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {promo.discount_type === "percentage"
                        ? `${promo.discount_value}%`
                        : `$${promo.discount_value}`}
                    </td>
                    <td className="py-3 px-3 text-sm text-right">
                      {promo.used_count || 0}
                    </td>
                    <td className="py-3 px-3 text-sm text-right text-red-600">
                      -${(promo.totalDiscount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-sm text-right font-semibold">
                      ${(promo.totalRevenue || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!summary && !revenue && !ticketSales && !geographic && !promoCodes && (
        <div
          className={`p-12 text-center rounded-lg border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <Icon
            icon="mdi:chart-box-outline"
            className={`w-16 h-16 mx-auto mb-4 ${
              mode === "dark" ? "text-gray-600" : "text-gray-400"
            }`}
          />
          <p
            className={`text-lg font-medium ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No analytics data available
          </p>
          <p
            className={`text-sm mt-2 ${
              mode === "dark" ? "text-gray-500" : "text-gray-500"
            }`}
          >
            Analytics will appear here once purchases are made
          </p>
        </div>
      )}
    </div>
  );
}
