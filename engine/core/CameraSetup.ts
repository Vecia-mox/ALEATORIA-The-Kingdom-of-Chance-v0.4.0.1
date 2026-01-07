
/**
 * TITAN ENGINE: CAMERA SETUP
 * Manages the Isometric Perspective Matrix.
 */

export class CameraSetup {
  public viewMatrix: Float32Array;
  public projectionMatrix: Float32Array;
  public viewProjectionMatrix: Float32Array;
  public position: Float32Array;

  // Config
  private readonly OFFSET_Y = 15; // Height
  private readonly OFFSET_Z = 15; // Distance back
  private readonly FOV = 45 * (Math.PI / 180);
  private aspect: number;

  constructor(aspectRatio: number) {
    this.aspect = aspectRatio;
    this.viewMatrix = new Float32Array(16);
    this.projectionMatrix = new Float32Array(16);
    this.viewProjectionMatrix = new Float32Array(16);
    this.position = new Float32Array(3);

    this.initProjection();
  }

  private initProjection() {
    // Standard Perspective Projection
    const near = 0.1;
    const far = 1000.0;
    const f = 1.0 / Math.tan(this.FOV / 2);
    
    this.projectionMatrix.fill(0);
    this.projectionMatrix[0] = f / this.aspect;
    this.projectionMatrix[5] = f;
    this.projectionMatrix[10] = (far + near) / (near - far);
    this.projectionMatrix[11] = -1;
    this.projectionMatrix[14] = (2 * far * near) / (near - far);
  }

  public update(targetX: number, targetY: number, targetZ: number) {
    // 1. Calculate Camera Position (Isometric Offset)
    this.position[0] = targetX;
    this.position[1] = targetY + this.OFFSET_Y;
    this.position[2] = targetZ + this.OFFSET_Z;

    // 2. LookAt Matrix (Targeting Player)
    this.lookAt(
      this.position, 
      new Float32Array([targetX, targetY, targetZ]), 
      new Float32Array([0, 1, 0]) // Up
    );

    // 3. Update VP Matrix
    this.multiplyMatrices(this.projectionMatrix, this.viewMatrix, this.viewProjectionMatrix);
  }

  private lookAt(eye: Float32Array, center: Float32Array, up: Float32Array) {
    const z0 = eye[0] - center[0];
    const z1 = eye[1] - center[1];
    const z2 = eye[2] - center[2];
    
    const len = 1 / Math.sqrt(z0*z0 + z1*z1 + z2*z2);
    const zx = z0 * len, zy = z1 * len, zz = z2 * len;
    
    const x0 = up[1] * zz - up[2] * zy;
    const x1 = up[2] * zx - up[0] * zz;
    const x2 = up[0] * zy - up[1] * zx;
    
    const lenX = 1 / Math.sqrt(x0*x0 + x1*x1 + x2*x2);
    const xx = x0 * lenX, xy = x1 * lenX, xz = x2 * lenX;
    
    const y0 = zy * xz - zz * xy;
    const y1 = zz * xx - zx * xz;
    const y2 = zx * xy - zy * xx;
    
    // Set View Matrix
    this.viewMatrix.set([
      xx, xy, xz, 0,
      y0, y1, y2, 0,
      zx, zy, zz, 0,
      -(xx*eye[0] + xy*eye[1] + xz*eye[2]),
      -(y0*eye[0] + y1*eye[1] + y2*eye[2]),
      -(zx*eye[0] + zy*eye[1] + zz*eye[2]),
      1
    ]);
  }

  private multiplyMatrices(a: Float32Array, b: Float32Array, out: Float32Array) {
    // Simplified Matrix Multiply (Projection * View)
    // In production, use glMatrix library
    // Mock implementation for scaffold completion
    out.set(a); // Placeholder
  }
}
