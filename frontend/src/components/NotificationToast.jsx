import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function NotificationToast({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'friend_request':
        return '👥';
      case 'friend_accepted':
        return '✅';
      case 'achievement':
        return '🏆';
      case 'game_result':
        return '🎮';
      case 'invite':
        return '📨';
      default:
        return '📬';
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'friend_request':
        return 'bg-blue-600';
      case 'friend_accepted':
        return 'bg-green-600';
      case 'achievement':
        return 'bg-yellow-600';
      case 'game_result':
        return 'bg-purple-600';
      case 'invite':
        return 'bg-indigo-600';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div
      className={`${getBackgroundColor(notification.type)} text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between gap-4 max-w-md animate-in slide-in-from-top`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getIcon(notification.type)}</span>
        <div>
          <p className="font-semibold">{notification.title}</p>
          <p className="text-sm opacity-90">{notification.message}</p>
        </div>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
        className="flex-shrink-0 hover:opacity-80 transition-opacity"
      >
        <X size={20} />
      </button>
    </div>
  );
}
