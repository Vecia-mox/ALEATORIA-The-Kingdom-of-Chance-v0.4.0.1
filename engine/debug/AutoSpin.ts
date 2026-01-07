
/**
 * TITAN ENGINE: AUTO SPIN
 * Automatically orbits the camera around (0,0,0).
 * Useful to prove the 3D scene is rendering even if lighting/materials are broken.
 */

export class AutoSpin {
  private static speed: number = 0.0005; // Radians per ms
  private static radius: number = 20.0;
  private static active: boolean = true;

  public static update(camera: any, time: number) {
    if (!this.active) return;

    // Calculate orbital position
    const x = Math.sin(time * this.speed) * this.radius;
    const z = Math.cos(time * this.speed) * this.radius;
    const y = 20.0; // High angle

    // Force override camera position
    // Assumes camera has standard setPosition/setTarget interface (CameraRig)
    if (camera.setPosition && camera.setTarget) {
        camera.setPosition(x, y, z);
        camera.setTarget(0, 0, 0); // Look at center
        if (camera.update) camera.update(); // Recalculate matrices
    }
  }

  public static toggle() {
    this.active = !this.active;
    console.log(`[Debug] AutoSpin: ${this.active}`);
  }
}
