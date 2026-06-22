import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const extensionLogoPath = 'logo.png';

const extensionManifest = {
  manifest_version: 3,
  name: 'XPause - Micro-Break Recommender',
  short_name: 'XPause',
  version: '0.1.0',
  description: 'Local fatigue-aware micro-break reminders across browser tabs.',
  default_locale: 'en',
  icons: {
    16: extensionLogoPath,
    32: extensionLogoPath,
    48: extensionLogoPath,
    128: extensionLogoPath
  },
  action: {
    default_title: 'XPause',
    default_popup: 'extension/popup.html',
    default_icon: {
      16: extensionLogoPath,
      32: extensionLogoPath,
      48: extensionLogoPath,
      128: extensionLogoPath
    }
  },
  background: {
    service_worker: 'assets/background.js',
    type: 'module'
  },
  permissions: ['storage', 'notifications', 'tabs'],
  host_permissions: ['http://*/*', 'https://*/*'],
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['assets/contentScript.js'],
      run_at: 'document_idle'
    }
  ]
};

const writeManifest = () => ({
  name: 'write-extension-manifest',
  closeBundle() {
    mkdirSync('dist-extension', { recursive: true });
    mkdirSync(resolve('dist-extension', '_locales', 'en'), { recursive: true });
    copyFileSync(resolve('src', 'assets', 'logo.png'), resolve('dist-extension', extensionLogoPath));
    writeFileSync(
      resolve('dist-extension', 'manifest.json'),
      `${JSON.stringify(extensionManifest, null, 2)}\n`
    );
    writeFileSync(
      resolve('dist-extension', '_locales', 'en', 'messages.json'),
      `${JSON.stringify(
        {
          appName: {
            message: extensionManifest.name
          },
          appDescription: {
            message: extensionManifest.description
          }
        },
        null,
        2
      )}\n`
    );
    writeFileSync(
      resolve('dist-extension', 'icon.svg'),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#0D1B2A"/><circle cx="64" cy="64" r="38" fill="#14263A" stroke="#7EC8A4" stroke-width="6"/><path d="M45 42h12v44H45zM71 42h12v44H71z" fill="#F0EDE6"/><path d="M42 94c15 11 29 11 44 0" fill="none" stroke="#7EC8A4" stroke-width="7" stroke-linecap="round"/></svg>\n`
    );
  }
});

export default defineConfig({
  plugins: [react(), tailwindcss(), writeManifest()],
  publicDir: false,
  build: {
    outDir: 'dist-extension',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'extension/popup.html'),
        contentScript: resolve(__dirname, 'src/extension/contentScript.ts'),
        background: resolve(__dirname, 'src/extension/background.ts')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
