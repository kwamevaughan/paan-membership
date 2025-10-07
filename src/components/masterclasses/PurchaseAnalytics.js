// Analytics component for purchase management
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

export default function PurchaseAnalytics({ mode = "light", purchases = [] }) {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    refundRate: 0,
    topMasterclasses: [],
    revenueByMonth: [],
    paymentMethods: {}
  });

  useEffect(() => {
    if (purchases.length === 0) return;

    // Calculate total revenue
    const completedPurchases = purchases.filter(p => p.payment_status === 'completed');
    const totalRevenue = completedPurchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);

    // Calculate average order value
    const averageOrderValue = completedPurchases.length > 0 ? totalRevenue / completedPurchases.length : 0;

    // Calculate conversion rate (completed vs total)
    const conversionRate = purchases.length > 0 ? (completedPurchases.length / purchases.length) * 100 : 0;

    // Calculate refund rate
    const refundedPurchases = purchases.filter(p => p.payment_status === 'refunded');
    const refundRate = completedPurchases.length > 0 ? (refundedPurchases.length / completedPurchases.length) * 100 : 0;

    // Top masterclasses by revenue
    const masterclassRevenue = {};
    completedPurchases.forEach(purchase => {
      const title = purchase.masterclass?.title || 'Unknown';
      masterclassRevenue[title] = (masterclassRevenue[title] || 0) + (purchase.total_amount || 0);
    });
    const topMasterclasses = Object.entries(masterclassRevenue)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([title, revenue]) => ({ title, revenue }));

    // Revenue by month (last 6 months)
    const monthlyRevenue = {};
    completedPurchases.forEach(purchase => {
      const date = new Date(purchase.payment_date || purchase.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (purchase.total_amount || 0);
    });

    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      last6Months.push({
        month: monthName,
        revenue: monthlyRevenue[monthKey] || 0
      });
    }

    // Payment methods breakdown
    const paymentMethods = {};
    completedPurchases.forEach(purchase => {
      const method = purchase.payment_method || 'Unknown';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    setAnalytics({
      totalRevenue,
      averageOrderValue,
      conversionRate,
      refundRate,
      topMasterclasses,
      revenueByMonth: last6Months,
      paymentMethods
    });
  }, [purchases]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-lg ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        } shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              mode === "dark" ? "bg-green-900/30" : "bg-green-100"
            }`}>
              <Icon icon="heroicons:currency-dollar" className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Total Revenue
              </p>
              <p className={`text-2xl font-bold ${
                mode === "dark" ? "text-white" : "text-gray-900"
              }`}>
                {formatCurrency(analytics.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        } shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              mode === "dark" ? "bg-blue-900/30" : "bg-blue-100"
            }`}>
              <Icon icon="heroicons:chart-bar" className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Avg Order Value
              </p>
              <p className={`text-2xl font-bold ${
                mode === "dark" ? "text-white" : "text-gray-900"
              }`}>
                {formatCurrency(analytics.averageOrderValue)}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        } shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              mode === "dark" ? "bg-purple-900/30" : "bg-purple-100"
            }`}>
              <Icon icon="heroicons:arrow-trending-up" className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Conversion Rate
              </p>
              <p className={`text-2xl font-bold ${
                mode === "dark" ? "text-white" : "text-gray-900"
              }`}>
                {analytics.conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        } shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              mode === "dark" ? "bg-red-900/30" : "bg-red-100"
            }`}>
              <Icon icon="heroicons:arrow-uturn-left" className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Refund Rate
              </p>
              <p className={`text-2xl font-bold ${
                mode === "dark" ? "text-white" : "text-gray-900"
              }`}>
                {analytics.refundRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Masterclasses */}
        <div className={`p-6 rounded-lg ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        } shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            mode === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Top Masterclasses by Revenue
          </h3>
          <div className="space-y-3">
            {analytics.topMasterclasses.map((masterclass, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    mode === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    {masterclass.title}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  mode === "dark" ? "text-green-400" : "text-green-600"
                }`}>
                  {formatCurrency(masterclass.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className={`p-6 rounded-lg ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        } shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            mode === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Revenue Trend (Last 6 Months)
          </h3>
          <div className="space-y-3">
            {analytics.revenueByMonth.map((month, index) => {
              const maxRevenue = Math.max(...analytics.revenueByMonth.map(m => m.revenue));
              const percentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    mode === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}>
                    {month.month}
                  </span>
                  <div className="flex items-center flex-1 ml-4">
                    <div className={`flex-1 h-2 rounded-full ${
                      mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                    }`}>
                      <div
                        className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className={`ml-3 text-sm font-semibold ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {formatCurrency(month.revenue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      {Object.keys(analytics.paymentMethods).length > 0 && (
        <div className={`p-6 rounded-lg ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        } shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            mode === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Payment Methods
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.paymentMethods).map(([method, count]) => (
              <div key={method} className="text-center">
                <div className={`text-2xl font-bold ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  {count}
                </div>
                <div className={`text-sm ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  {method}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}