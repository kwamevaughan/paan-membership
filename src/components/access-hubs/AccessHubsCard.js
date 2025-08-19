import { Icon } from "@iconify/react";
import { useState } from "react";
import ItemActionModal from "@/components/ItemActionModal";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function AccessHubsCard({
  accessHub,
  mode,
  onEdit,
  onDelete,
  onViewRegistrations,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getAccessHubStatus = (isAvailable) => {
    if (isAvailable) {
      return {
        label: "Available",
        color: "text-green-800 dark:text-green-300",
        bgColor: "bg-green-100 dark:bg-green-900/30",
      };
    } else {
      return {
        label: "Unavailable",
        color: "text-red-800 dark:text-red-300",
        bgColor: "bg-red-100 dark:bg-red-900/30",
      };
    }
  };

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price) || 0;
    if (numericPrice === 0) return "Free";
    return `$${numericPrice.toFixed(2)}`;
  };

  const accessHubStatus = getAccessHubStatus(accessHub.is_available);

  const handleViewRegistrations = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onViewRegistrations) {
      onViewRegistrations(accessHub);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col rounded-xl border backdrop-blur-md transition-all duration-300 overflow-hidden transform hover:scale-[1.02] ${
        mode === "dark"
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
          : "bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with Image */}
      <div className="relative h-48">
        {accessHub.images && accessHub.images.length > 0 ? (
          <Image
            src={accessHub.images[0]}
            alt={accessHub.title}
            fill
            className="object-cover"
            unoptimized={true}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              mode === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <Icon
              icon="heroicons:building-office"
              className="w-12 h-12 opacity-50"
              />
          </div>
        )}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            mode === "dark"
              ? "from-gray-900/80 to-transparent"
              : "from-gray-900/60 to-transparent"
          }`}
        />
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${accessHubStatus.color} ${accessHubStatus.bgColor}`}
          >
            {accessHubStatus.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pb-4">
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-1 truncate pr-6 max-w-full">
            {accessHub.title}
          </h3>
        </div>

        {/* Space Type and Location */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Icon icon="heroicons:building-office" className="w-4 h-4" />
            <span>{accessHub.space_type}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Icon icon="heroicons:map-pin" className="w-4 h-4" />
            <span>
              {accessHub.city && accessHub.country 
                ? `${accessHub.city}, ${accessHub.country}`
                : accessHub.city || accessHub.country || "Location TBD"
              }
            </span>
          </div>
        </div>

        {/* Capacity and Pricing */}
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2 text-sm text-gray-600 dark:text-gray-300">
            <Icon icon="heroicons:users" className="w-4 h-4 flex-shrink-0" />
            <span>Capacity: {accessHub.capacity}</span>
          </div>
          
          {/* Pricing Grid */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {/* Boardroom */}
            <div className="flex items-center gap-1">
              <Icon icon="heroicons:building-office" className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="font-medium">${accessHub.pricing_boardroom || 15}</span>
              <span className="text-xs text-gray-500">/hr</span>
            </div>
            
            {/* Co-working */}
            <div className="flex items-center gap-1">
              <Icon icon="heroicons:briefcase" className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="font-medium">${accessHub.pricing_coworking || 20}</span>
              <span className="text-xs text-gray-500">/day</span>
            </div>
            
            {/* Meeting Room */}
            <div className="flex items-center gap-1">
              <Icon icon="heroicons:rectangle-group" className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span className="font-medium">${accessHub.pricing_meeting || 10}</span>
              <span className="text-xs text-gray-500">/hr</span>
            </div>
            
            {/* Virtual Address */}
            <div className="flex items-center gap-1">
              <Icon icon="heroicons:globe-alt" className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="font-medium">${accessHub.pricing_virtual || 200}</span>
              <span className="text-xs text-gray-500">/year</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 pb-6 flex-grow">
        <div
          className={`text-sm leading-relaxed mb-6 line-clamp-3 text-gray-600 dark:text-gray-300`}
        >
          {stripHtml(accessHub.description)}
        </div>

        {/* Amenities */}
        {accessHub.amenities && accessHub.amenities.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Amenities:
            </div>
            <div className="flex flex-wrap gap-1">
              {accessHub.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    mode === "dark"
                      ? "bg-blue-900/50 text-blue-300"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {amenity}
                </span>
              ))}
              {accessHub.amenities.length > 3 && (
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    mode === "dark"
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  +{accessHub.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tier Restriction */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              mode === "dark"
                ? "bg-purple-900/50 text-purple-300"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {accessHub.tier_restriction}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`px-6 py-4 border-t flex items-center justify-between ${
          mode === "dark"
            ? "bg-gray-800/40 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="flex items-center text-gray-500">
            <Icon icon="heroicons:building-office" className="w-4 h-4 mr-1" />
            {accessHub.space_type}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleViewRegistrations}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="View registrations"
          >
            <Icon icon="heroicons:user-group" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(accessHub)}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="Edit access hub"
          >
            <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(accessHub)}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
            title="Delete access hub"
          >
            <Icon icon="heroicons:trash" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
