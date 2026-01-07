
/**
 * TITAN ENGINE: CAMERA SHAKE
 * "Trauma" based system. Trauma (0-1) is added by events and decays over time.
 * Shake Intensity = Trauma^2 (Non-linear feel).
 */

export class CameraShake {
  private trauma: number = 0;
  private decay: number = 1.5; // Trauma removed per second
  private maxOffset: number = 1.0; // Max units to shake
  private maxRoll: number = 5.0;   // Max degrees to roll
  
  // Perlin noise or simple noise function
  private seed: number = 0;

  // Directional Bias (Optional)
  private directionBias: Float32Array = new Float32Array([0, 0, 0]);

  public addTrauma(amount: number) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  public setDirectionalBias(x: number, y: number, z: number) {
    // Normalize and set
    const len = Math.sqrt(x*x + y*y + z*z);
    if (len > 0) {
      this.directionBias[0] = x/len;
      this.directionBias[1] = y/len;
      this.directionBias[2] = z/len;
    }
  }

  public update(dt: number): { posOffset: Float32Array, rotOffset: Float32Array } {
    if (this.trauma <= 0) {
      return { 
        posOffset: new Float32Array([0,0,0]), 
        rotOffset: new Float32Array([0,0,0,1]) // Identity Quat
      };
    }

    // Decay
    this.trauma = Math.max(0, this.trauma - this.decay * dt);

    // Calculate Shake (Trauma^2 or Trauma^3 for "Juice")
    const shake = this.trauma * this.trauma;

    // Advance noise seed
    this.seed += dt * 15.0; // Speed of shake

    // Generate Noise (-1 to 1)
    const nX = (Math.sin(this.seed) * 2 - 1); 
    const nY = (Math.cos(this.seed * 1.1) * 2 - 1);
    const nZ = (Math.sin(this.seed * 1.5) * 2 - 1);

    // Position Offset
    const ox = nX * this.maxOffset * shake;
    const oy = nY * this.maxOffset * shake;
    const oz = nZ * this.maxOffset * shake;

    // Apply Directional Bias (Shake *away* from impact if set)
    // If bias is set, we dampen random noise in that axis and replace with bias pulse
    // Simplified: Just add bias * shake
    
    return {
      posOffset: new Float32Array([
        ox + this.directionBias[0] * shake * 0.5,
        oy + this.directionBias[1] * shake * 0.5,
        oz + this.directionBias[2] * shake * 0.5
      ]),
      // Simple roll shake (Z-axis rotation)
      rotOffset: this.eulerToQuat(0, 0, nX * this.maxRoll * shake)
    };
  }

  private eulerToQuat(x: number, y: number, z: number): Float32Array {
    // Degrees to Radians
    const r = Math.PI / 180;
    const c1 = Math.cos(x*r/2), c2 = Math.cos(y*r/2), c3 = Math.cos(z*r/2);
    const s1 = Math.sin(x*r/2), s2 = Math.sin(y*r/2), s3 = Math.sin(z*r/2);
    
    return new Float32Array([
      s1 * c2 * c3 + c1 * s2 * s3,
      c1 * s2 * c3 - s1 * c2 * s3,
      c1 * c2 * s3 + s1 * s2 * c3,
      c1 * c2 * c3 - s1 * s2 * s3
    ]);
  }
}
