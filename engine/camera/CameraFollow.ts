
/**
 * TITAN ENGINE: CAMERA FOLLOW
 * Adds "Weight" to the camera movement so it doesn't snap instantly.
 */

export class CameraFollow {
  private currentPos: Float32Array = new Float32Array([0, 0, 0]);
  
  // Config
  private smoothSpeed = 3.0; // Lower = Heavier
  private deadzone = 0.1; // Units

  constructor(initialX: number, initialY: number, initialZ: number) {
    this.currentPos[0] = initialX;
    this.currentPos[1] = initialY;
    this.currentPos[2] = initialZ;
  }

  public update(dt: number, targetPos: Float32Array): Float32Array {
    // 1. Calculate Distance
    const dx = targetPos[0] - this.currentPos[0];
    const dy = targetPos[1] - this.currentPos[1];
    const dz = targetPos[2] - this.currentPos[2];
    
    // 2. Deadzone Check (Prevent jitter on micro-movements)
    const distSq = dx*dx + dy*dy + dz*dz;
    if (distSq < this.deadzone * this.deadzone) {
      return this.currentPos;
    }

    // 3. Frame-rate Independent Lerp (Dampening)
    // Formula: a + (b - a) * (1 - exp(-speed * dt))
    const t = 1.0 - Math.exp(-this.smoothSpeed * dt);

    this.currentPos[0] += dx * t;
    this.currentPos[1] += dy * t;
    this.currentPos[2] += dz * t;

    return this.currentPos;
  }

  public teleport(x: number, y: number, z: number) {
    this.currentPos[0] = x;
    this.currentPos[1] = y;
    this.currentPos[2] = z;
  }
  
  public getPosition(): Float32Array {
      return this.currentPos;
  }
}
