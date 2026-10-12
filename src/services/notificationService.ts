export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

export function dispatchSystemAlertNotification(title: string, body: string, severity: string = 'high') {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(`[PRALAY AI] ${title}`, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: `pralay-${Date.now()}`,
        requireInteraction: severity === 'critical',
      });
    } catch {
      // Background notifications may be constrained
    }
  }
}
