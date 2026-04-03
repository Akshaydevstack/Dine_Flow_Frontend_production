import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  ChevronLeft,
  Clock,
  BellOff,
  Sparkles,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../store/slices/notificationSlice";
import { notificationAcknowledged } from "../../store/slices/notificationSlice";
import {
  selectNotifications,
  selectNotificationsLoading,
  selectNeedsNotificationRefresh,
} from "../../store/selectors/notificationSelectors";

export default function Notifications() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const notifications = useAppSelector(selectNotifications);
  const loading = useAppSelector(selectNotificationsLoading);

  useEffect(() => {
    dispatch(notificationAcknowledged());
  }, [dispatch]);

  const needsRefresh = useAppSelector(selectNeedsNotificationRefresh);

  useEffect(() => {
    dispatch(notificationAcknowledged());

    if (needsRefresh) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, needsRefresh]);

  const markRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const markAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen gradient-bg font-body text-gray-900 dark:text-white pb-20 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] animate-float-slow" />
        <div className="absolute bottom-[20%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-float-slow-reverse" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl glass hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>

          <h1 className="text-xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Notifications
          </h1>
          <button
            onClick={markAllRead}
            className="p-2 rounded-xl glass hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title="Mark all as read"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {loading &&
            [...Array(9)].map((_, i) => (
              <div
                key={i}
                className="glass p-4 rounded-2xl animate-pulse flex gap-4 border border-white/20 dark:border-white/5"
              >
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}

          {!loading &&
            notifications.length > 0 &&
            notifications.map((n, index) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`
                  relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group
                  animate-slide-up
                  ${
                    n.is_read
                      ? "bg-white/40 dark:bg-gray-800/40 border-transparent hover:bg-white/60 dark:hover:bg-gray-800/60"
                      : "glass border-purple-500/30 shadow-lg shadow-purple-500/5"
                  }
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {!n.is_read && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500" />
                )}

                <div className="flex gap-4">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
                      ${
                        n.is_read
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                          : "gradient-primary text-white"
                      }
                    `}
                  >
                    {n.is_read ? (
                      <Bell className="w-5 h-5" />
                    ) : (
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h2
                        className={`text-sm font-bold ${n.is_read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}
                      >
                        {n.title}
                      </h2>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(n.created_at)}
                      </span>
                    </div>

                    <p
                      className={`text-xs leading-relaxed ${n.is_read ? "text-gray-500" : "text-gray-600 dark:text-gray-300"}`}
                    >
                      {n.body}
                    </p>
                  </div>
                </div>

                {!n.is_read && (
                  <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </div>
            ))}

          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <BellOff className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">No Notifications</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                You're all caught up! We’ll notify you when something happens.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
