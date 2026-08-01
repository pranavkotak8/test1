import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getExpiringItems, getNotificationSettings } from './database';
import { getDaysUntilExpiry } from '../utils/dateUtils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('expiry-alerts', {
        name: 'Expiry Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10b981',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
      }
    }
    return true;
  } catch (error) {
    console.log('Notification setup error (non-critical):', error.message);
    return false;
  }
}

export async function scheduleExpiryNotification(item) {
  try {
    const settings = await getNotificationSettings();
    if (!settings || !settings.enabled) return;

    const daysLeft = getDaysUntilExpiry(item.expiryDate);
    if (daysLeft === null || daysLeft < 0) return;

    const notifications = [];
    const [hours, minutes] = (settings.morningTime || '08:00').split(':');

    if (settings.threeDaysBefore && daysLeft >= 3) {
      const triggerDate = new Date(item.expiryDate);
      triggerDate.setDate(triggerDate.getDate() - 3);
      triggerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      if (triggerDate > new Date()) {
        notifications.push(Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Item Expiring Soon',
            body: `${item.itemName} expires in 3 days! Use it soon.`,
            data: { itemId: item.id, type: 'expiry_warning' },
          },
          trigger: { date: triggerDate },
        }));
      }
    }

    if (settings.oneDayBefore && daysLeft >= 1) {
      const triggerDate = new Date(item.expiryDate);
      triggerDate.setDate(triggerDate.getDate() - 1);
      triggerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      if (triggerDate > new Date()) {
        notifications.push(Notifications.scheduleNotificationAsync({
          content: {
            title: '⚠️ Expiring Tomorrow',
            body: `${item.itemName} expires tomorrow! Don't let it go to waste.`,
            data: { itemId: item.id, type: 'expiry_warning' },
          },
          trigger: { date: triggerDate },
        }));
      }
    }

    if (settings.dayOfExpiry && daysLeft >= 0) {
      const triggerDate = new Date(item.expiryDate);
      triggerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      if (triggerDate > new Date()) {
        notifications.push(Notifications.scheduleNotificationAsync({
          content: {
            title: '🔴 Expires Today',
            body: `${item.itemName} expires today! Use it or lose it.`,
            data: { itemId: item.id, type: 'expiry_warning' },
          },
          trigger: { date: triggerDate },
        }));
      }
    }

    await Promise.all(notifications);
  } catch (error) {
    console.log('Error scheduling notification:', error.message);
  }
}

export async function cancelItemNotifications(itemId) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.data?.itemId === itemId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.log('Error canceling notifications:', error.message);
  }
}

export async function scheduleAllPendingNotifications() {
  try {
    const items = await getExpiringItems(7);
    for (const item of items) await scheduleExpiryNotification(item);
  } catch (error) {
    console.log('Error scheduling all notifications:', error.message);
  }
}

export async function clearAllScheduledNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Error clearing notifications:', error.message);
  }
}
