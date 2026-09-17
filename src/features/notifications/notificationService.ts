export const createExtensionNotification = async (
  message: string,
  title = 'XPause',
): Promise<string | undefined> => {
  if (typeof chrome === 'undefined' || !chrome.notifications) return undefined;

  const notification = {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('logo.png'),
    title,
    message: message || 'A micro-break is ready.',
    priority: 1,
  } as const;

  try {
    return await chrome.notifications.create(`xpause-${Date.now()}`, notification);
  } catch {
    return undefined;
  }
};
