export const hasExtensionContext = (): boolean => {
  try {
    return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id && chrome.storage?.local);
  } catch {
    return false;
  }
};

export const hasExtensionStorage = (): boolean => {
  try {
    return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id && chrome.storage?.local);
  } catch {
    return false;
  }
};

export const readStorage = async <T>(key: string, fallback: T): Promise<T> => {
  if (!hasExtensionContext()) return fallback;
  try {
    const result = await chrome.storage.local.get(key);
    const value = result[key];
    if (value === undefined) return fallback;
    if (
      typeof fallback === 'object' &&
      fallback !== null &&
      !Array.isArray(fallback) &&
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      return { ...fallback, ...value } as T;
    }
    return value as T;
  } catch {
    return fallback;
  }
};

export const subscribeStorage = (
  callback: (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => void,
): (() => void) => {
  if (typeof chrome === 'undefined' || !chrome.storage?.onChanged?.addListener) {
    return () => undefined;
  }

  const listener = (
    changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
    areaName: string,
  ) => {
    if (areaName === 'local') {
      callback(changes);
    }
  };

  chrome.storage.onChanged.addListener(listener);
  return () => {
    try {
      chrome.storage.onChanged?.removeListener(listener);
    } catch {
      // Extension context may be invalidated
    }
  };
};

export const getStorage = async (keys?: string | string[]): Promise<Record<string, unknown>> => {
  if (!hasExtensionContext()) return {};
  try {
    return await chrome.storage.local.get(keys);
  } catch {
    return {};
  }
};

export const setStorage = async (items: Record<string, unknown>): Promise<void> => {
  if (!hasExtensionContext()) return;
  try {
    await chrome.storage.local.set(items);
  } catch {
    // Context may be invalidated if the extension reloaded while script/popup is still active
  }
};

export const sendRuntimeMessage = (message: unknown): void => {
  if (!hasExtensionContext()) return;
  try {
    void chrome.runtime.sendMessage(message).catch(() => undefined);
  } catch {
    // Ignore invalidated extension contexts from stale scripts
  }
};
