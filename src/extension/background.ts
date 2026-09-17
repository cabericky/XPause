import { createExtensionNotification } from '../features/notifications';
import type { ExtensionMessage } from '../shared/messaging/messages';

const isSupportedWebUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

const injectIntoTab = async (tabId: number, url?: string): Promise<void> => {
  if (url && !isSupportedWebUrl(url)) return;
  if (!chrome.scripting?.executeScript) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['assets/contentScript.js'],
    });
  } catch {
    // Ignore tabs that cannot be scripted (e.g. system tabs or restricted domains)
  }
};

const injectIntoAllOpenTabs = async (): Promise<void> => {
  try {
    const tabs = await chrome.tabs.query({
      url: ['http://*/*', 'https://*/*'],
    });

    for (const tab of tabs) {
      if (typeof tab.id === 'number') {
        await injectIntoTab(tab.id, tab.url);
      }
    }
  } catch {
    // Ignore permissions/query errors during startup
  }
};

chrome.runtime.onInstalled?.addListener(() => {
  void injectIntoAllOpenTabs();
});

chrome.runtime.onStartup?.addListener(() => {
  void injectIntoAllOpenTabs();
});

chrome.tabs.onActivated?.addListener((activeInfo) => {
  void (async () => {
    try {
      if (!chrome.tabs.get) return;
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (typeof tab?.id === 'number' && tab?.url) {
        await injectIntoTab(tab.id, tab.url);
      }
    } catch {
      // Tab may be closed or in transition
    }
  })();
});

chrome.runtime.onMessage.addListener((message) => {
  if (!message || typeof message !== 'object' || !('type' in message)) return;

  const typedMessage = message as ExtensionMessage;
  if (typedMessage.type === 'XP_PAUSE_NOTIFY') {
    void createExtensionNotification(typedMessage.body);
  }
});

