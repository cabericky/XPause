chrome.runtime.onMessage.addListener((message) => {
  if (!message || typeof message !== 'object' || !('type' in message)) return;

  if (message.type === 'XP_PAUSE_NOTIFY') {
    const notification = {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icon.svg'),
      title: 'XPause',
      message:
        'body' in message && typeof message.body === 'string'
          ? message.body
          : 'A micro-break is ready.',
      priority: 1
    } as const;

    void chrome.notifications.create(`xpause-${Date.now()}`, notification).catch(() => undefined);
  }
});
