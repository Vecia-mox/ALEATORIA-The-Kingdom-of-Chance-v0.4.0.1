
/**
 * TITAN ENGINE: SHAKE EFFECT
 * "Trauma" based screen shake.
 * Trauma (0 to 1) decays over time. Shake = Trauma^2.
 */
export class ShakeEffect {
  private trauma: number = 0;
  private seed: number = 0;

  // Configuration
  private readonly TRAUMA_DECAY = 1.5; // Trauma lost per second
  private readonly MAX_OFFSET = 1.5;   // Max translational shake (meters)
  private readonly MAX_ROLL = 5.0;     // Max rotational shake (degrees)

  public addTrauma(amount: number) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  public update(dt: number): { x: number, y: number, roll: number } {
    if (this.trauma <= 0) return { x: 0, y: 0, roll: 0 };

    // 1. Decay
    this.trauma = Math.max(0, this.trauma - this.TRAUMA_DECAY * dt);

    // 2. Calculate Intensity (Non-linear for "Juice")
    const shake = this.trauma * this.trauma;

    // 3. Generate Noise (Simulated Perlin-ish via random walk seed)
    this.seed += dt * 15.0; 
    
    const nX = (Math.sin(this.seed) * 2 - 1); 
    const nY = (Math.cos(this.seed * 1.3) * 2 - 1);
    const nR = (Math.sin(this.seed * 0.8) * 2 - 1);

    // 4. Compute Offsets
    return {
      x: nX * this.MAX_OFFSET * shake,
      y: nY * this.MAX_OFFSET * shake,
      roll: nR * this.MAX_ROLL * shake
    };
  }
}
