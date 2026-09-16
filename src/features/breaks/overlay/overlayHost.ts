import { overlayStyles } from './overlayStyles';

export interface OverlayHostElements {
  host: HTMLElement;
  shadow: ShadowRoot;
  mount: HTMLElement;
}

export const initOverlayHost = (): OverlayHostElements | null => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  if (window.top !== window) return null;

  const existingHost = document.getElementById('xpause-extension-root');
  if (existingHost && existingHost.shadowRoot) {
    const mount = existingHost.shadowRoot.querySelector('div');
    if (mount) {
      return { host: existingHost, shadow: existingHost.shadowRoot, mount };
    }
  }

  if (existingHost) return null;

  const host = document.createElement('div');
  host.id = 'xpause-extension-root';
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = overlayStyles;

  const mount = document.createElement('div');
  shadow.append(style, mount);

  (document.body || document.documentElement).append(host);

  return { host, shadow, mount };
};

