import { describe, expect, it } from 'vitest';
import { classifyHost } from './siteClassifier';

describe('siteClassifier', () => {
  it('classifies social platforms correctly', () => {
    expect(classifyHost('x.com')).toBe('social');
    expect(classifyHost('www.instagram.com')).toBe('social');
    expect(classifyHost('old.reddit.com')).toBe('social');
    expect(classifyHost('tiktok.com')).toBe('social');
  });

  it('classifies entertainment platforms correctly', () => {
    expect(classifyHost('youtube.com')).toBe('entertainment');
    expect(classifyHost('www.netflix.com')).toBe('entertainment');
    expect(classifyHost('open.spotify.com')).toBe('entertainment');
    expect(classifyHost('twitch.tv')).toBe('entertainment');
  });

  it('classifies work platforms correctly', () => {
    expect(classifyHost('github.com')).toBe('work');
    expect(classifyHost('docs.google.com')).toBe('work');
    expect(classifyHost('app.slack.com')).toBe('work');
    expect(classifyHost('notion.so')).toBe('work');
  });

  it('defaults unknown hosts to work', () => {
    expect(classifyHost('example.com')).toBe('work');
    expect(classifyHost('localhost')).toBe('work');
  });
});

