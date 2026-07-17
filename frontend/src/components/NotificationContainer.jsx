import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { NotificationToast } from './NotificationToast';

export default function NotificationContainer() {
  const { socket } = useSocket();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for real-time notifications
    const handleNotification = (notification) => {
      console.log('🔔 Toast notification received:', notification);
      
      const toastId = `${notification._id}-${Date.now()}`;
      const newToast = {
        ...notification,
        toastId
      };

      setToasts(prev => [...prev, newToast]);
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  const removeToast = (toastId) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  };

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.toastId} className="pointer-events-auto">
          <NotificationToast
            notification={toast}
            onClose={() => removeToast(toast.toastId)}
          />
        </div>
      ))}
    </div>
  );
}
