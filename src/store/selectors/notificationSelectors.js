
export const selectNotifications = (state) =>
  state.notifications.list;

export const selectNotificationsLoading = (state) =>
  state.notifications.loading;

export const selectHasNewNotification = (state) =>
  state.notifications.hasNewNotification;

export const selectNeedsNotificationRefresh = (state) =>
  state.notifications.needsRefresh;