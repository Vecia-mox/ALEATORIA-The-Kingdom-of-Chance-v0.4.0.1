
/**
 * TITAN ENGINE: RESIZE HANDLER
 * Ensures the Canvas and WebGL Viewport match the physical screen size.
 */
export class ResizeHandler {
  private canvas: HTMLCanvasElement;
  private renderer: any; // Renderer3D type implicitly
  private camera: any;   // CameraRig type implicitly

  constructor(canvas: HTMLCanvasElement, renderer: any, camera: any) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.camera = camera;

    window.addEventListener('resize', () => this.forceResize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.forceResize(), 100)); // Delay for iOS rotation
  }

  public forceResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width === 0 || height === 0) {
        console.warn("[Resize] Window reports 0 dimensions. Skipping.");
        return;
    }

    console.log(`[Resize] Scaling to ${width}x${height}`);

    // 1. Resize Canvas DOM
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // 2. Resize Renderer Buffers (G-Buffer, etc)
    if (this.renderer && this.renderer.resize) {
        this.renderer.resize(width, height);
    }

    // 3. Update Camera Aspect Ratio
    if (this.camera && this.camera.resize) {
        this.camera.resize(width, height);
    }
  }
}
