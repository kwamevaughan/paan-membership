// Reusable masterclass card component
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function MasterclassCard({ masterclass, showActions = false, onEdit, onDelete }) {
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
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      published: { color: 'bg-green-100 text-green-800', label: 'Published' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const isUpcoming = () => {
    return new Date(masterclass.start_date) > new Date();
  };

  const isPast = () => {
    return new Date(masterclass.start_date) < new Date();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      {masterclass.image_url && (
        <div className="relative">
          <img
            className="h-48 w-full object-cover"
            src={masterclass.image_url}
            alt={masterclass.title}
          />
          {masterclass.is_featured && (
            <div className="absolute top-2 right-2">
              <span className="bg-yellow-500 text-white px-2 py-1 text-xs font-medium rounded">
                Featured
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {masterclass.category && (
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded mb-2 inline-block">
                {masterclass.category.name}
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {masterclass.title}
            </h3>
            {masterclass.instructor && (
              <p className="text-sm text-gray-600">
                by {masterclass.instructor.name}
              </p>
            )}
          </div>
          {showActions && (
            <div className="flex items-center space-x-2 ml-4">
              {getStatusBadge(masterclass.status)}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {masterclass.short_description || masterclass.description}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Icon icon="heroicons:calendar" className="w-4 h-4 mr-2" />
            <span>{formatDate(masterclass.start_date)}</span>
            {isPast() && (
              <span className="ml-2 text-xs text-red-500">(Past)</span>
            )}
            {isUpcoming() && (
              <span className="ml-2 text-xs text-green-500">(Upcoming)</span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Icon icon="heroicons:clock" className="w-4 h-4 mr-2" />
            <span>{masterclass.duration_minutes} minutes</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Icon icon="heroicons:users" className="w-4 h-4 mr-2" />
            <span>
              {masterclass.max_seats - masterclass.available_seats} / {masterclass.max_seats} enrolled
            </span>
          </div>
          {masterclass.level && (
            <div className="flex items-center text-sm text-gray-500">
              <Icon icon="heroicons:academic-cap" className="w-4 h-4 mr-2" />
              <span className="capitalize">{masterclass.level} level</span>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ${masterclass.member_price}
              </span>
              <span className="text-sm text-gray-500">member</span>
            </div>
            {masterclass.member_original_price && masterclass.member_original_price > masterclass.member_price && (
              <span className="text-sm text-gray-500 line-through">
                ${masterclass.member_original_price}
              </span>
            )}
            <div className="text-sm text-gray-500">
              ${masterclass.non_member_price} non-member
            </div>
          </div>
          {masterclass.is_free && (
            <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded">
              FREE
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href={showActions ? `/admin/masterclasses/${masterclass.id}` : `/hr/masterclasses/${masterclass.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details
          </Link>
          
          {showActions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit && onEdit(masterclass)}
                className="text-indigo-600 hover:text-indigo-800 p-1"
                title="Edit"
              >
                <Icon icon="heroicons:pencil" className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete && onDelete(masterclass.id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Delete"
              >
                <Icon icon="heroicons:trash" className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Additional info for admin */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Created: {new Date(masterclass.created_at).toLocaleDateString()}</span>
              <span>Available: {masterclass.available_seats} seats</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}