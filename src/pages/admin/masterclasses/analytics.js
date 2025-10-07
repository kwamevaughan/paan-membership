import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import dynamic from 'next/dynamic';
import HRHeader from '@/layouts/hrHeader';
import HRSidebar from '@/layouts/hrSidebar';
import PageHeader from '@/components/common/PageHeader';
import SimpleFooter from '@/layouts/simpleFooter';
import useSidebar from '@/hooks/useSidebar';
import useLogout from '@/hooks/useLogout';
import useAuthSession from '@/hooks/useAuthSession';
import PurchaseAnalytics from '@/components/masterclasses/PurchaseAnalytics';

// Dynamically import Chart component with SSR disabled
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function MasterclassAnalytics({ mode = "light", toggleMode }) {
  useAuthSession();
  const router = useRouter();
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [masterclasses, setMasterclasses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    isSidebarOpen,
    toggleSidebar,
    sidebarState,
    updateDragOffset,
    isMobile,
    isHovering,
    handleMouseEnter,
    handleMouseLeave,
    handleOutsideClick,
  } = useSidebar();

  const handleLogout = useLogout();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch purchases data
      const [purchasesRes, registrationsRes, masterclassesRes] = await Promise.all([
        fetch(`/api/masterclasses/payments?start_date=${dateRange.start}&end_date=${dateRange.end}`),
        fetch(`/api/masterclasses/registrations?start_date=${dateRange.start}&end_date=${dateRange.end}`),
        fetch('/api/masterclasses?status=all')
      ]);

      const [purchasesData, registrationsData, masterclassesData] = await Promise.all([
        purchasesRes.json(),
        registrationsRes.json(),
        masterclassesRes.json()
      ]);

      if (purchasesRes.ok) setPurchases(purchasesData.data || []);
      if (registrationsRes.ok) setRegistrations(registrationsData.data || []);
      if (masterclassesRes.ok) setMasterclasses(masterclassesData.data || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Chart options and series
  const revenueChartOptions = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      type: 'category'
    },
    yaxis: {
      title: {
        text: 'Revenue ($)'
      },
      labels: {
        formatter: (value) => `$${value.toLocaleString()}`
      }
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toLocaleString()}`
      }
    }
  };

  const attendanceChartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: {
        show: true
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      type: 'category'
    },
    yaxis: {
      title: {
        text: 'Number of Participants'
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} participants`
      }
    }
  };

  const memberChartOptions = {
    chart: {
      type: 'donut',
      height: 350
    },
    labels: ['Members', 'Non-Members'],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    tooltip: {
      y: {
        formatter: (val) => `${val} purchases`
      }
    }
  };

  // Process data for charts
  const getRevenueData = () => {
    const monthlyRevenue = {};
    const completedPurchases = purchases.filter(p => p.payment_status === 'completed');
    
    completedPurchases.forEach(purchase => {
      const date = new Date(purchase.payment_date || purchase.created_at);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (purchase.total_amount || 0);
    });
    
    const sortedMonths = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => new Date('01 ' + a) - new Date('01 ' + b));
    
    return {
      categories: sortedMonths.map(([month]) => month),
      series: [{
        name: 'Revenue',
        data: sortedMonths.map(([_, amount]) => amount)
      }]
    };
  };

  const getAttendanceData = () => {
    const attendanceByMasterclass = {};
    
    registrations.forEach(reg => {
      const masterclass = masterclasses.find(m => m.id === reg.masterclass_id);
      if (!masterclass) return;
      
      if (!attendanceByMasterclass[masterclass.title]) {
        attendanceByMasterclass[masterclass.title] = {
          registered: 0,
          attended: 0
        };
      }
      
      attendanceByMasterclass[masterclass.title].registered++;
      if (reg.attendance_status === 'attended') {
        attendanceByMasterclass[masterclass.title].attended++;
      }
    });
    
    const sortedMasterclasses = Object.entries(attendanceByMasterclass)
      .sort(([a], [b]) => a.localeCompare(b));
    
    return {
      categories: sortedMasterclasses.map(([title]) => title),
      series: [
        {
          name: 'Registered',
          data: sortedMasterclasses.map(([_, data]) => data.registered)
        },
        {
          name: 'Attended',
          data: sortedMasterclasses.map(([_, data]) => data.attended)
        }
      ]
    };
  };

  const getMemberData = () => {
    const memberPurchases = purchases.filter(p => p.is_member_pricing);
    const nonMemberPurchases = purchases.filter(p => !p.is_member_pricing);
    
    return [memberPurchases.length, nonMemberPurchases.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon icon="heroicons:arrow-path" className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col antialiased ${
        mode === "dark" ? "bg-gray-950 text-gray-100" : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      <HRHeader
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        sidebarState={sidebarState}
        mode={mode}
        toggleMode={toggleMode}
        onLogout={handleLogout}
        pageName="Masterclass Analytics"
        pageDescription="Comprehensive analytics and reports for masterclasses"
      />
      
      <div className="flex flex-1">
        <HRSidebar
          isSidebarOpen={isSidebarOpen}
          mode={mode}
          toggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          setDragOffset={updateDragOffset}
          user={{ name: "PAAN Admin" }}
          isMobile={isMobile}
          isHovering={isHovering}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
          handleOutsideClick={handleOutsideClick}
        />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "md:ml-64" : "md:ml-20"
          } ${sidebarState.hidden ? "ml-0" : ""}`}
          style={{
            marginLeft: sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Page Header */}
            <PageHeader
              title="Masterclass Analytics & Reports"
              description="Comprehensive analytics and insights for masterclasses"
              mode={mode}
            />
            
            {/* Date Range Picker */}
            <div className="mb-8">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {['overview', 'revenue', 'attendance', 'masterclasses'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab
                          ? 'border-paan-blue text-paan-blue'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 gap-8">
                  {/* Quick Stats */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Masterclasses</p>
                        <p className="text-2xl font-semibold">{masterclasses.length}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Registrations</p>
                        <p className="text-2xl font-semibold">{registrations.length}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="text-2xl font-semibold">
                          ${purchases
                            .filter(p => p.payment_status === 'completed')
                            .reduce((sum, p) => sum + (p.total_amount || 0), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Avg. Attendance</p>
                        <p className="text-2xl font-semibold">
                          {registrations.length > 0 
                            ? `${Math.round(
                                (registrations.filter(r => r.attendance_status === 'attended').length / 
                                 registrations.length) * 100
                              )}%` 
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Revenue Chart */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4">Revenue Overview</h3>
                    <div className="h-96">
                      {typeof window !== 'undefined' && (
                        <Chart
                          options={{
                            ...revenueChartOptions,
                            xaxis: {
                              categories: getRevenueData().categories
                            }
                          }}
                          series={getRevenueData().series}
                          type="line"
                          height="100%"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Attendance Chart */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4">Attendance Overview</h3>
                    <div className="h-96">
                      {typeof window !== 'undefined' && (
                        <Chart
                          options={{
                            ...attendanceChartOptions,
                            xaxis: {
                              categories: getAttendanceData().categories
                            }
                          }}
                          series={getAttendanceData().series}
                          type="bar"
                          height="100%"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Member vs Non-Member */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium mb-4">Member vs Non-Member</h3>
                      <div className="h-80">
                        {typeof window !== 'undefined' && (
                          <Chart
                            options={memberChartOptions}
                            series={getMemberData()}
                            type="donut"
                            height="100%"
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Top Masterclasses */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium mb-4">Top Masterclasses</h3>
                      <div className="space-y-4">
                        {masterclasses
                          .map(masterclass => ({
                            ...masterclass,
                            registrations: registrations.filter(r => r.masterclass_id === masterclass.id).length,
                            revenue: purchases
                              .filter(p => p.masterclass_id === masterclass.id && p.payment_status === 'completed')
                              .reduce((sum, p) => sum + (p.total_amount || 0), 0)
                          }))
                          .sort((a, b) => b.registrations - a.registrations)
                          .slice(0, 5)
                          .map((masterclass, index) => (
                            <div key={masterclass.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <span className="text-gray-500 w-5">{index + 1}.</span>
                                <div>
                                  <p className="font-medium">{masterclass.title}</p>
                                  <p className="text-sm text-gray-500">{masterclass.registrations} registrations</p>
                                </div>
                              </div>
                              <span className="font-semibold">${masterclass.revenue.toLocaleString()}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'revenue' && (
                <div className="space-y-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4">Revenue Analytics</h3>
                    <div className="h-96">
                      <PurchaseAnalytics 
                        mode={mode} 
                        purchases={purchases}
                        showFullReport={true}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'attendance' && (
                <div className="space-y-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4">Attendance by Masterclass</h3>
                    <div className="h-96">
                      {typeof window !== 'undefined' && (
                        <Chart
                          options={{
                            ...attendanceChartOptions,
                            xaxis: {
                              categories: getAttendanceData().categories
                            }
                          }}
                          series={getAttendanceData().series}
                          type="bar"
                          height="100%"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'masterclasses' && (
                <div className="space-y-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4">Masterclass Performance</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Masterclass</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attended</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {masterclasses.map((masterclass) => {
                            const masterRegistrations = registrations.filter(
                              r => r.masterclass_id === masterclass.id
                            );
                            const attended = masterRegistrations.filter(
                              r => r.attendance_status === 'attended'
                            ).length;
                            const revenue = purchases
                              .filter(p => 
                                p.masterclass_id === masterclass.id && 
                                p.payment_status === 'completed'
                              )
                              .reduce((sum, p) => sum + (p.total_amount || 0), 0);
                              
                            return (
                              <tr key={masterclass.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{masterclass.title}</div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(masterclass.start_date).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{masterRegistrations.length}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{attended}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {masterRegistrations.length > 0 
                                      ? `${Math.round((attended / masterRegistrations.length) * 100)}%` 
                                      : 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${revenue.toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>
      </div>
    </div>
  );
}
