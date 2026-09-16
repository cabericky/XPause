import type { Settings } from '../../types';
import { hasExtensionContext, sendRuntimeMessage } from '../storage/storage';

export type ExtensionMessage =
  | { type: 'XP_PAUSE_NOTIFY'; body: string }
  | { type: 'XP_PAUSE_START_BREAK'; settings?: Settings }
  | { type: 'XP_PAUSE_SETTINGS_UPDATED'; settings?: Settings };

export const sendNotificationMessage = (body: string): void => {
  sendRuntimeMessage({
    type: 'XP_PAUSE_NOTIFY',
    body
  });
};

export const sendTabStartBreak = async (
  tabId: number,
  settings: Settings
): Promise<void> => {
  if (!hasExtensionContext()) return;
  await chrome.tabs.sendMessage(tabId, {
    type: 'XP_PAUSE_START_BREAK',
    settings
  });
};

export const sendTabSettingsUpdated = async (
  tabId: number,
  settings: Settings
): Promise<void> => {
  if (!hasExtensionContext()) return;
  await chrome.tabs.sendMessage(tabId, {
    type: 'XP_PAUSE_SETTINGS_UPDATED',
    settings
  });
};

