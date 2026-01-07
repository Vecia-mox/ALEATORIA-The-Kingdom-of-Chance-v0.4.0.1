
import { Scene } from 'phaser';

export class AsyncTextureManager {
  private queue: Array<() => void> = [];
  private isProcessing = false;
  private scene: Scene;
  private onProgress?: (p: number) => void;
  private totalTasks = 0;
  private completedTasks = 0;

  constructor(scene: Scene, onProgress?: (p: number) => void) {
    this.scene = scene;
    this.onProgress = onProgress;
    this.scene.events.on('update', this.update, this);
  }

  public addTask(task: () => void) {
    this.queue.push(task);
    this.totalTasks++;
  }

  private update(time: number, delta: number) {
    if (this.queue.length === 0) return;

    const start = performance.now();
    // Process queue for max 5ms per frame to keep 60 FPS
    while (this.queue.length > 0 && performance.now() - start < 5) {
      const task = this.queue.shift();
      if (task) {
          task();
          this.completedTasks++;
      }
    }

    if (this.onProgress) {
      const progress = this.totalTasks === 0 ? 1 : this.completedTasks / this.totalTasks;
      this.onProgress(progress);
    }
  }

  public destroy() {
      this.scene.events.off('update', this.update, this);
  }
}
