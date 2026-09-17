declare const chrome: {
  storage: {
    local: {
      get(
        keys?: string | string[] | Record<string, unknown> | null,
      ): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
    };
    onChanged?: {
      addListener(
        callback: (
          changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
          areaName: string,
        ) => void,
      ): void;
      removeListener(
        callback: (
          changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
          areaName: string,
        ) => void,
      ): void;
    };
  };
  runtime: {
    id?: string;
    getURL(path: string): string;
    sendMessage(message: unknown): Promise<unknown>;
    onMessage: {
      addListener(
        callback: (
          message: unknown,
          sender: unknown,
          sendResponse: (response?: unknown) => void,
        ) => boolean | void,
      ): void;
      removeListener?(
        callback: (
          message: unknown,
          sender: unknown,
          sendResponse: (response?: unknown) => void,
        ) => boolean | void,
      ): void;
    };
    onInstalled?: {
      addListener(callback: (details: { reason: string }) => void): void;
    };
    onStartup?: {
      addListener(callback: () => void): void;
    };
  };
  notifications: {
    create(
      notificationId: string,
      options: {
        type: 'basic';
        iconUrl: string;
        title: string;
        message: string;
        priority?: number;
      },
    ): Promise<string>;
  };
  scripting?: {
    executeScript(injection: {
      target: { tabId: number; allFrames?: boolean };
      files?: string[];
      func?: (...args: unknown[]) => unknown;
      args?: unknown[];
    }): Promise<Array<{ frameId: number; result: unknown }>>;
  };
  tabs: {
    query(queryInfo: {
      active?: boolean;
      currentWindow?: boolean;
      url?: string | string[];
      status?: string;
    }): Promise<Array<{ id?: number; url?: string; status?: string }>>;
    get?(tabId: number): Promise<{ id?: number; url?: string; status?: string }>;
    sendMessage(tabId: number, message: unknown): Promise<unknown>;
    onActivated?: {
      addListener(callback: (activeInfo: { tabId: number; windowId: number }) => void): void;
    };
  };
};
