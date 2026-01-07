
/**
 * TITAN ENGINE: PROFILER
 * Monitors FPS and adjusts quality settings dynamically.
 */

export interface PerfMetrics {
  fps: number;
  drawCalls: number;
  memory: number;
  resolutionScale: number;
}

export class Profiler {
  private static instance: Profiler;
  
  // Metrics
  private frames: number = 0;
  private lastTime: number = 0;
  private fps: number = 60;
  private fpsHistory: number[] = [];
  
  // Dynamic Resolution Scaling (DRS)
  private currentScale: number = 1.0;
  private resizeCallback: ((scale: number) => void) | null = null;
  private drsCooldown: number = 0;

  private constructor() {
    this.lastTime = performance.now();
  }

  public static getInstance(): Profiler {
    if (!Profiler.instance) Profiler.instance = new Profiler();
    return Profiler.instance;
  }

  public setResizeCallback(cb: (scale: number) => void) {
    this.resizeCallback = cb;
  }

  /**
   * Call this every frame in the main loop.
   */
  public update(deltaTime: number) {
    this.frames++;
    const now = performance.now();
    
    if (now - this.lastTime >= 1000) {
      this.fps = this.frames;
      this.frames = 0;
      this.lastTime = now;
      this.checkScalability();
    }
  }

  /**
   * Logic to downgrade/upgrade resolution based on FPS history.
   */
  private checkScalability() {
    this.fpsHistory.push(this.fps);
    if (this.fpsHistory.length > 5) this.fpsHistory.shift();

    const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    const now = Date.now();

    if (now < this.drsCooldown) return;

    // DOWNGRADE
    if (avgFps < 30 && this.currentScale > 0.5) {
      console.warn(`[Profiler] Low FPS (${avgFps.toFixed(1)}). Reducing resolution.`);
      this.currentScale -= 0.25;
      this.applyScale();
      this.drsCooldown = now + 5000; // Wait 5s before changing again
    } 
    // UPGRADE
    else if (avgFps > 58 && this.currentScale < 1.0) {
      console.log(`[Profiler] Stable FPS. Increasing resolution.`);
      this.currentScale += 0.25;
      this.applyScale();
      this.drsCooldown = now + 10000; // Wait 10s to ensure stability
    }
  }

  private applyScale() {
    if (this.resizeCallback) {
      this.resizeCallback(this.currentScale);
    }
  }

  public getMetrics(): PerfMetrics {
    return {
      fps: this.fps,
      drawCalls: 0, // Hook into Renderer3D to populate
      memory: (performance as any).memory?.usedJSHeapSize || 0,
      resolutionScale: this.currentScale
    };
  }
}
