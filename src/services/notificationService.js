// Stub notification service for Snack compatibility
// Replace with real expo-notifications when running locally

export async function registerForPushNotificationsAsync() {
  console.log('[Notifications] Stub: registerForPushNotificationsAsync');
  return null;
}

export async function scheduleExpiryNotification(item) {
  console.log('[Notifications] Stub: scheduleExpiryNotification for', item.itemName);
  return null;
}

export async function scheduleAllPendingNotifications() {
  console.log('[Notifications] Stub: scheduleAllPendingNotifications');
  return null;
}

export async function cancelNotification(itemId) {
  console.log('[Notifications] Stub: cancelNotification for', itemId);
  return null;
}
