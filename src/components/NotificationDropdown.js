import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";

const NotificationDropdown = ({ notifications, loading, unreadCount, onMarkAsRead, onMarkAllAsRead, mode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'applicant':
        return 'mdi:account-check';
      case 'market_intel':
        return 'mdi:chart-line';
      case 'offer':
        return 'mdi:handshake';
      default:
        return 'mdi:bell';
    }
  };

  const getRatingStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <Icon
        key={index}
        icon={index < rating ? "mdi:star" : "mdi:star-outline"}
        className="w-4 h-4 text-yellow-400"
      />
    ));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Icon
          icon="mdi-light:bell"
          width={26}
          height={26}
          className={`${unreadCount > 0 ? 'animate-swing-infinite' : ''}`}
        />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-96 rounded-2xl shadow-2xl z-50 backdrop-blur-xl border border-white/20 ${
            mode === "dark"
              ? "bg-gray-900/95 text-white"
              : "bg-white/95 text-gray-900"
          }`}
        >
          <div className="p-4 border-b border-white/20 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-white/20 hover:bg-white/10 transition-colors duration-200 cursor-pointer ${
                    !notification.read ? "bg-blue-500/10" : ""
                  }`}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
                        <Icon
                          icon={getNotificationIcon(notification.type)}
                          className="w-6 h-6 text-blue-400"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      {notification.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          {getRatingStars(notification.rating)}
                        </div>
                      )}
                      {notification.metadata && (
                        <div className="mt-2 text-xs text-gray-500">
                          {notification.metadata.name && (
                            <p>From: {notification.metadata.name}</p>
                          )}
                          {notification.metadata.referenceNumber && (
                            <p>Ref: {notification.metadata.referenceNumber}</p>
                          )}
                          {notification.metadata.emoji && (
                            <p>Reaction: {notification.metadata.emoji}</p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown; 