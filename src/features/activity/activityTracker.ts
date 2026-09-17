import type { ActivitySignals, UsageCategory } from '../../types';
import { emptySignals } from './fatigueScorer';

export interface ActivitySnapshot {
  signals: ActivitySignals;
  idleMs: number;
  continuousUseMinutes: number;
  isActive: boolean;
  minutesSinceSocialActive: number;
}

export class ActivityTracker {
  private category: UsageCategory;
  private signals: ActivitySignals = emptySignals();
  private lastPointer = { x: 0, y: 0, time: Date.now() };
  private pointerInitialized = false;
  private lastScroll = {
    y: typeof window !== 'undefined' ? window.scrollY : 0,
    time: Date.now(),
  };
  private cachedDocHeight = 0;
  private lastDocHeightCheck = 0;
  private lastActivity = Date.now();
  private sessionStart = Date.now();
  private lastInteractionAt = Date.now();
  private lastSocialInteraction: number;
  private burstStarted = false;
  private keyTimestamps: number[] = [];
  private attached = false;

  constructor(category: UsageCategory) {
    this.category = category;
    this.lastSocialInteraction = category === 'social' ? Date.now() : 0;
  }

  public init(): void {
    if (this.attached || typeof window === 'undefined') return;

    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('click', this.onClick, { passive: true });
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    document.addEventListener('scroll', this.onScroll, { capture: true, passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);

    this.attached = true;
  }

  public destroy(): void {
    if (!this.attached || typeof window === 'undefined') return;

    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('scroll', this.onScroll);
    document.removeEventListener('scroll', this.onScroll, { capture: true });
    document.removeEventListener('visibilitychange', this.onVisibility);

    this.attached = false;
  }

  public markActive(): void {
    const now = Date.now();
    if (now - this.lastActivity > 5 * 60_000) {
      this.sessionStart = now;
    }
    this.lastActivity = now;
    this.lastInteractionAt = now;
  }

  public resetSession(): void {
    this.sessionStart = Date.now();
  }

  public getLastActivity(): number {
    return this.lastActivity;
  }

  public getSnapshot(now = Date.now()): ActivitySnapshot {
    const idleMs = now - this.lastActivity;
    if (idleMs > 5 * 60_000) {
      this.sessionStart = now;
    }
    const continuousUseMinutes = (now - this.sessionStart) / 60_000;
    const keypressesPerMinute = this.keyTimestamps.filter(
      (timestamp) => now - timestamp < 60_000,
    ).length;

    const signals: ActivitySignals = {
      ...this.signals,
      idleMs,
      keypressesPerMinute,
      continuousUseMinutes,
    };

    const isActive =
      now - this.lastInteractionAt < 15_000 &&
      (this.keyTimestamps.length > 0 || this.signals.mouseVelocity > 80);

    const minutesSinceSocialActive =
      this.category === 'social'
        ? 0
        : this.lastSocialInteraction === 0
          ? 60
          : Math.round((now - this.lastSocialInteraction) / 60_000);

    return {
      signals,
      idleMs,
      continuousUseMinutes,
      isActive,
      minutesSinceSocialActive,
    };
  }

  public decay(): void {
    this.signals.mouseVelocity = Math.max(0, this.signals.mouseVelocity * 0.35);
    if (this.signals.mouseVelocity < 5) this.signals.mouseVelocity = 0;

    this.signals.scrollVelocity = Math.max(0, this.signals.scrollVelocity * 0.35);
    if (this.signals.scrollVelocity < 5) this.signals.scrollVelocity = 0;

    this.signals.typingBurstCount = Math.max(0, this.signals.typingBurstCount - 1);
    this.signals.visibilityChanges = Math.max(0, this.signals.visibilityChanges - 1);
  }

  private onPointerMove = (event: PointerEvent): void => {
    const now = Date.now();
    if (this.category === 'social') this.lastSocialInteraction = now;

    if (!this.pointerInitialized) {
      this.lastPointer.x = event.clientX;
      this.lastPointer.y = event.clientY;
      this.lastPointer.time = now;
      this.pointerInitialized = true;
      this.markActive();
      return;
    }

    const elapsedMs = now - this.lastPointer.time;
    if (elapsedMs < 30) {
      return;
    }

    const distance = Math.hypot(
      event.clientX - this.lastPointer.x,
      event.clientY - this.lastPointer.y,
    );
    const seconds = Math.max(elapsedMs / 1000, 0.016);
    this.signals.mouseVelocity = this.signals.mouseVelocity * 0.78 + (distance / seconds) * 0.22;
    this.lastPointer.x = event.clientX;
    this.lastPointer.y = event.clientY;
    this.lastPointer.time = now;
    this.markActive();
  };

  private onClick = (): void => {
    if (this.category === 'social') this.lastSocialInteraction = Date.now();
    this.markActive();
  };

  private onKeyDown = (): void => {
    const now = Date.now();
    if (this.category === 'social') this.lastSocialInteraction = now;

    this.keyTimestamps = [...this.keyTimestamps, now].filter(
      (timestamp) => now - timestamp < 60_000,
    );
    const recentFiveSeconds = this.keyTimestamps.filter((timestamp) => now - timestamp < 5_000);
    if (recentFiveSeconds.length >= 12 && !this.burstStarted) {
      this.signals.typingBurstCount += 1;
      this.burstStarted = true;
    }
    if (recentFiveSeconds.length < 4) {
      this.burstStarted = false;
    }
    this.markActive();
  };

  private onScroll = (): void => {
    const now = Date.now();
    if (this.category === 'social') this.lastSocialInteraction = now;

    const distance = Math.abs(window.scrollY - this.lastScroll.y);
    const seconds = Math.max((now - this.lastScroll.time) / 1000, 0.016);

    if (now - this.lastDocHeightCheck > 2000 || this.cachedDocHeight === 0) {
      this.cachedDocHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        window.innerHeight,
      );
      this.lastDocHeightCheck = now;
    }

    this.signals.scrollVelocity = this.signals.scrollVelocity * 0.76 + (distance / seconds) * 0.24;
    this.signals.scrollDepth = Math.max(
      this.signals.scrollDepth,
      Math.round((window.scrollY / this.cachedDocHeight) * 100),
    );
    this.lastScroll.y = window.scrollY;
    this.lastScroll.time = now;
    this.lastActivity = now;
    this.lastInteractionAt = now;
  };

  private onVisibility = (): void => {
    this.signals.visibilityChanges += 1;
    if (!document.hidden) {
      this.markActive();
    }
  };
}
