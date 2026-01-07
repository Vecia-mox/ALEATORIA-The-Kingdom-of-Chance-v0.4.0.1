
/**
 * TITAN ENGINE: HIT STOP MANAGER
 * Controls the flow of time to create visceral impact ("The Zelda Effect").
 * Usage: Call HitStop.trigger() on Crits or Killing Blows.
 */

export class HitStop {
  private static instance: HitStop;
  
  private active: boolean = false;
  private timer: number = 0;
  private duration: number = 0;
  private targetScale: number = 0.0;
  
  // The actual multiplier applied to DeltaTime
  public timeScale: number = 1.0;

  private constructor() {}

  public static getInstance(): HitStop {
    if (!HitStop.instance) HitStop.instance = new HitStop();
    return HitStop.instance;
  }

  /**
   * Freezes or slows time for a brief moment.
   * @param durationMs How long the freeze lasts (Real time)
   * @param timeScale speed of game during freeze (0.0 = full stop, 0.1 = slow mo)
   */
  public trigger(durationMs: number, timeScale: number = 0.0) {
    // Don't override a longer hitstop with a shorter one (unless priority logic is added)
    if (this.active && durationMs < (this.duration - this.timer)) return;

    this.active = true;
    this.timer = 0;
    this.duration = durationMs / 1000; // Convert to seconds
    this.targetScale = timeScale;
    this.timeScale = timeScale;
  }

  /**
   * Must be called at the start of the Game Loop.
   * @param realDt Unscaled delta time from requestAnimationFrame
   * @returns Modified DT to pass to Physics/Logic
   */
  public update(realDt: number): number {
    if (!this.active) {
      this.timeScale = 1.0;
      return realDt;
    }

    this.timer += realDt;

    if (this.timer >= this.duration) {
      this.active = false;
      this.timeScale = 1.0;
      return realDt; // Snap back immediately or lerp if smoother recovery needed
    }

    // While active, return scaled DT
    return realDt * this.targetScale;
  }
}
