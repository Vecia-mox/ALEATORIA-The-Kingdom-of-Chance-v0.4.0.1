
/**
 * TITAN ENGINE: SCENE STATUS HUD
 * Displays vital engine stats directly on the DOM to verify the loop is running.
 */

export class SceneStatus {
  private element: HTMLElement;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 0;

  constructor() {
    this.element = document.createElement('div');
    Object.assign(this.element.style, {
      position: 'absolute',
      top: '100px',
      left: '10px',
      padding: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid #fbbf24', // Gold border
      color: '#fbbf24',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: '10000',
      pointerEvents: 'none',
      whiteSpace: 'pre'
    });
    document.body.appendChild(this.element);
  }

  public update(objectCount: number, cameraPos: Float32Array) {
    // 1. Calculate FPS
    const now = performance.now();
    this.frameCount++;
    if (now - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
    }

    // 2. Format Camera Pos
    const cx = cameraPos[0].toFixed(1);
    const cy = cameraPos[1].toFixed(1);
    const cz = cameraPos[2].toFixed(1);

    // 3. Render Text
    // Note: If Objects is 0, the AssetLoader failed or WorldBuilder didn't run.
    this.element.innerText = `
--- ENGINE AUDIT ---
FPS:     ${this.fps}
Objects: ${objectCount}
Cam Pos: [${cx}, ${cy}, ${cz}]
WebGl2:  Active
--------------------
    `.trim();
  }
}
