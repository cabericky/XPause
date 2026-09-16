import { createExtensionNotification } from '../features/notifications';
import type { ExtensionMessage } from '../shared/messaging/messages';

chrome.runtime.onMessage.addListener((message) => {
  if (!message || typeof message !== 'object' || !('type' in message)) return;

  const typedMessage = message as ExtensionMessage;
  if (typedMessage.type === 'XP_PAUSE_NOTIFY') {
    void createExtensionNotification(typedMessage.body);
  }
});
