import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, Check } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, deleteNotification, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState({});
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      const panelWidth = Math.min(384, window.innerWidth - 24);
      const left = Math.min(
        Math.max(12, rect.right - panelWidth),
        window.innerWidth - panelWidth - 12
      );

      setPanelStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left,
        width: panelWidth,
        zIndex: 9999,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedButton = buttonRef.current?.contains(event.target);
      const clickedPanel = panelRef.current?.contains(event.target);
      if (!clickedButton && !clickedPanel) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
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

  const panel = isOpen ? (
    <div
      ref={panelRef}
      style={panelStyle}
      className="notification-panel bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col max-h-[80vh] overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <h3 className="font-semibold text-white">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell size={32} className="mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-4 transition-colors group ${
                  notif.read
                    ? 'bg-white/[0.02] hover:bg-white/[0.05]'
                    : 'bg-indigo-500/10 hover:bg-indigo-500/15 border-l-2 border-indigo-400'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-lg mt-1 flex-shrink-0">
                      {getNotificationIcon(notif.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm break-words">
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-300 mt-1 break-words">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="p-1 text-indigo-300 hover:bg-white/10 rounded transition-colors"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif._id)}
                      className="p-1 text-red-400 hover:bg-white/10 rounded transition-colors"
                      title="Delete"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-white/10 bg-white/5 text-center">
          <p className="text-xs text-slate-400">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-fit">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {panel && createPortal(panel, document.body)}
    </>
  );
}
