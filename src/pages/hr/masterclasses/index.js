// Member portal page for viewing enrolled masterclasses
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Header from '@/layouts/hrHeader';
import Sidebar from '@/layouts/hrSidebar';
import { useAuth } from '@/hooks/useAuth';

export default function MemberMasterclasses() {
  const { user } = useAuth();
  const [enrolledMasterclasses, setEnrolledMasterclasses] = useState([]);
  const [availableMasterclasses, setAvailableMasterclasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    status: ''
  });
  const [categories, setCategories] = useState([]);

  const fetchEnrolledMasterclasses = useCallback(async () => {
    if (!user) return;

    try {
      const params = new URLSearchParams({
        user_id: user.id
      });
      if (filters.status) params.append('payment_status', filters.status);

      const response = await fetch(`/api/masterclasses/registrations?${params}`);
      const result = await response.json();
      
      if (response.ok) {
        setEnrolledMasterclasses(result.data || []);
      } else {
        console.error('Error fetching enrolled masterclasses:', result.error);
      }
    } catch (error) {
      console.error('Error fetching enrolled masterclasses:', error);
    }
  }, [user, filters.status]);

  const fetchAvailableMasterclasses = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        status: 'published',
        upcoming_only: 'true'
      });
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/masterclasses?${params}`);
      const result = await response.json();
      
      if (response.ok) {
        setAvailableMasterclasses(result.data || []);
      } else {
        console.error('Error fetching available masterclasses:', result.error);
      }
    } catch (error) {
      console.error('Error fetching available masterclasses:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.search]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/masterclasses/categories');
      const result = await response.json();
      if (response.ok) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEnrolledMasterclasses();
      fetchAvailableMasterclasses();
      fetchCategories();
    }
  }, [user, fetchEnrolledMasterclasses, fetchAvailableMasterclasses]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Payment Pending' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Enrolled' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Payment Failed' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getAttendanceBadge = (status) => {
    const statusConfig = {
      registered: { color: 'bg-blue-100 text-blue-800', label: 'Registered' },
      attended: { color: 'bg-green-100 text-green-800', label: 'Attended' },
      no_show: { color: 'bg-red-100 text-red-800', label: 'No Show' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.registered;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Masterclasses</h1>
            <p className="text-gray-600">Manage your enrolled masterclasses and discover new training opportunities</p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'enrolled'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Enrollments ({enrolledMasterclasses.length})
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available Masterclasses ({availableMasterclasses.length})
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'certificates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Certificates
              </button>
            </nav>
          </div>

          {/* Filters for Available tab */}
          {activeTab === 'available' && (
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search masterclasses..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="space-y-6">
            {activeTab === 'enrolled' && (
              <div>
                {loading ? (
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <Icon icon="heroicons:arrow-path" className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">Loading your enrollments...</p>
                  </div>
                ) : enrolledMasterclasses.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <Icon icon="heroicons:academic-cap" className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">You haven&apos;t enrolled in any masterclasses yet</p>
                    <button
                      onClick={() => setActiveTab('available')}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Browse Available Masterclasses
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {enrolledMasterclasses.map((registration) => (
                      <div key={registration.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                {registration.masterclass?.image_url && (
                                  <Image
                                    className="h-16 w-16 rounded-lg object-cover"
                                    src={registration.masterclass.image_url}
                                    alt={registration.masterclass.title}
                                    width={64}
                                    height={64}
                                  />
                                )}
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {registration.masterclass?.title}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {formatDate(registration.masterclass?.start_date)}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    {getStatusBadge(registration.payment_status)}
                                    {getAttendanceBadge(registration.attendance_status)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                ${registration.total_amount}
                              </p>
                              <p className="text-sm text-gray-500">
                                {registration.seats_booked} seat{registration.seats_booked > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Registered: {formatDate(registration.created_at)}</span>
                              {registration.completion_status === 'completed' && (
                                <span className="text-green-600 font-medium">✓ Completed</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {isUpcoming(registration.masterclass?.start_date) && (
                                <Link
                                  href={`/hr/masterclasses/${registration.masterclass?.id}`}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  View Details
                                </Link>
                              )}
                              {registration.certificate_issued && (
                                <Link
                                  href={registration.certificate_url}
                                  target="_blank"
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                  Download Certificate
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'available' && (
              <div>
                {loading ? (
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <Icon icon="heroicons:arrow-path" className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">Loading available masterclasses...</p>
                  </div>
                ) : availableMasterclasses.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <Icon icon="heroicons:calendar-x" className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">No upcoming masterclasses available</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {availableMasterclasses.map((masterclass) => (
                      <div key={masterclass.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        {masterclass.image_url && (
                          <Image
                            className="h-48 w-full object-cover"
                            src={masterclass.image_url}
                            alt={masterclass.title}
                            width={400}
                            height={192}
                          />
                        )}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              {masterclass.category?.name}
                            </span>
                            {masterclass.is_featured && (
                              <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {masterclass.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {masterclass.short_description || masterclass.description}
                          </p>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Icon icon="heroicons:calendar" className="w-4 h-4 mr-2" />
                              {formatDate(masterclass.start_date)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Icon icon="heroicons:clock" className="w-4 h-4 mr-2" />
                              {masterclass.duration_minutes} minutes
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Icon icon="heroicons:users" className="w-4 h-4 mr-2" />
                              {masterclass.available_seats} seats available
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-gray-900">
                                ${masterclass.member_price}
                              </p>
                              {masterclass.member_original_price && (
                                <p className="text-sm text-gray-500 line-through">
                                  ${masterclass.member_original_price}
                                </p>
                              )}
                            </div>
                            <Link
                              href={`/hr/masterclasses/${masterclass.id}`}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <Icon icon="heroicons:academic-cap" className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Certificates feature coming soon</p>
                <p className="text-sm text-gray-400 mt-1">
                  Your certificates will be available here once you complete masterclasses
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}