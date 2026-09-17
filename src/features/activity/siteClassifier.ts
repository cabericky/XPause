import type { UsageCategory } from '../../types';

export const socialHosts: readonly string[] = [
  'facebook.com',
  'instagram.com',
  'x.com',
  'twitter.com',
  'tiktok.com',
  'reddit.com',
  'linkedin.com',
  'threads.net',
  'snapchat.com',
  'pinterest.com',
  'discord.com',
  'whatsapp.com',
];

export const entertainmentHosts: readonly string[] = [
  'youtube.com',
  'netflix.com',
  'twitch.tv',
  'spotify.com',
  'hulu.com',
  'disneyplus.com',
  'primevideo.com',
  'soundcloud.com',
];

export const workHosts: readonly string[] = [
  'github.com',
  'gitlab.com',
  'notion.so',
  'slack.com',
  'docs.google.com',
  'drive.google.com',
  'office.com',
  'figma.com',
  'linear.app',
  'jira.com',
  'atlassian.net',
];

export const classifyHost = (host: string): UsageCategory => {
  const normalized = host.replace(/^www\./i, '').toLowerCase();
  if (socialHosts.some((item) => normalized === item || normalized.endsWith(`.${item}`))) {
    return 'social';
  }
  if (entertainmentHosts.some((item) => normalized === item || normalized.endsWith(`.${item}`))) {
    return 'entertainment';
  }
  if (workHosts.some((item) => normalized === item || normalized.endsWith(`.${item}`))) {
    return 'work';
  }
  return 'work';
};
