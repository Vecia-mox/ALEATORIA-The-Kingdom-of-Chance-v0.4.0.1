
/**
 * TITAN ENGINE: CAMERA RIG
 * Manages the "God View" geometry: Position, Rotation, and Matrices.
 * Establishes the classic ARPG Isometric angle (Telephoto).
 */

export class CameraRig {
  // Matrices
  public viewMatrix: Float32Array;
  public projectionMatrix: Float32Array;
  public viewProjectionMatrix: Float32Array;
  
  // Transform
  public position: Float32Array;
  public target: Float32Array;
  public up: Float32Array;

  // Configuration (The "Diablo" Angle)
  private readonly OFFSET = { x: -10, y: 15, z: -10 };
  private readonly FOV_DEGREES = 35; // Telephoto to flatten perspective
  private aspectRatio: number;
  private nearClip = 0.1;
  private farClip = 1000.0;

  constructor(aspectRatio: number) {
    this.aspectRatio = aspectRatio;
    
    this.viewMatrix = new Float32Array(16);
    this.projectionMatrix = new Float32Array(16);
    this.viewProjectionMatrix = new Float32Array(16);
    
    this.position = new Float32Array(3);
    this.target = new Float32Array(3);
    this.up = new Float32Array([0, 1, 0]);

    this.updateProjection();
  }

  public resize(width: number, height: number) {
    this.aspectRatio = width / height;
    this.updateProjection();
  }

  public setTarget(x: number, y: number, z: number) {
    // Target the "Head" bone area (approx 1.5m up) for better framing
    this.target[0] = x;
    this.target[1] = y + 1.5; 
    this.target[2] = z;
  }

  public update() {
    // 1. Calculate Desired Camera Position based on Offset
    // In a real rig, this might be modified by CameraFollow before setting
    this.position[0] = this.target[0] + this.OFFSET.x;
    this.position[1] = this.target[1] + this.OFFSET.y;
    this.position[2] = this.target[2] + this.OFFSET.z;

    // 2. Compute View Matrix (LookAt)
    this.computeLookAt();

    // 3. Compute ViewProjection
    this.multiplyMatrices(this.projectionMatrix, this.viewMatrix, this.viewProjectionMatrix);
  }

  /**
   * Sets the camera position directly (overriding offset calculation).
   * Used by CameraFollow to apply smoothed positions.
   */
  public setPosition(x: number, y: number, z: number) {
    this.position[0] = x;
    this.position[1] = y;
    this.position[2] = z;
    
    this.computeLookAt();
    this.multiplyMatrices(this.projectionMatrix, this.viewMatrix, this.viewProjectionMatrix);
  }

  private updateProjection() {
    const fovRad = (this.FOV_DEGREES * Math.PI) / 180;
    const f = 1.0 / Math.tan(fovRad / 2);
    const rangeInv = 1.0 / (this.nearClip - this.farClip);

    // Standard Perspective Matrix
    this.projectionMatrix.fill(0);
    this.projectionMatrix[0] = f / this.aspectRatio;
    this.projectionMatrix[5] = f;
    this.projectionMatrix[10] = (this.nearClip + this.farClip) * rangeInv;
    this.projectionMatrix[11] = -1;
    this.projectionMatrix[14] = (2 * this.nearClip * this.farClip) * rangeInv;
  }

  private computeLookAt() {
    const eye = this.position;
    const center = this.target;
    const up = this.up;

    let z0 = eye[0] - center[0];
    let z1 = eye[1] - center[1];
    let z2 = eye[2] - center[2];

    let len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len; z1 *= len; z2 *= len;

    let x0 = up[1] * z2 - up[2] * z1;
    let x1 = up[2] * z0 - up[0] * z2;
    let x2 = up[0] * z1 - up[1] * z0;
    
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
      x0 = 0; x1 = 0; x2 = 0;
    } else {
      len = 1 / len;
      x0 *= len; x1 *= len; x2 *= len;
    }

    let y0 = z1 * x2 - z2 * x1;
    let y1 = z2 * x0 - z0 * x2;
    let y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
      y0 = 0; y1 = 0; y2 = 0;
    } else {
      len = 1 / len;
      y0 *= len; y1 *= len; y2 *= len;
    }

    this.viewMatrix[0] = x0;
    this.viewMatrix[1] = y0;
    this.viewMatrix[2] = z0;
    this.viewMatrix[3] = 0;
    this.viewMatrix[4] = x1;
    this.viewMatrix[5] = y1;
    this.viewMatrix[6] = z1;
    this.viewMatrix[7] = 0;
    this.viewMatrix[8] = x2;
    this.viewMatrix[9] = y2;
    this.viewMatrix[10] = z2;
    this.viewMatrix[11] = 0;
    this.viewMatrix[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
    this.viewMatrix[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
    this.viewMatrix[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
    this.viewMatrix[15] = 1;
  }

  private multiplyMatrices(a: Float32Array, b: Float32Array, out: Float32Array) {
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  }
}
