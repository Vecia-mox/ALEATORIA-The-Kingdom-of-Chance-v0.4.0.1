
/**
 * TITAN ENGINE: THERMODYNAMICS
 * Simulates heat diffusion and material state changes (Fire/Ice).
 */

export class Thermodynamics {
  private width: number;
  private height: number;
  
  // Heatmap: 0.0 = Freezing, 0.5 = Ambient, 1.0 = Fire
  private heatMap: Float32Array;
  private nextHeatMap: Float32Array;
  
  // Global Wind Vector (Normalized)
  private wind: { x: number, y: number } = { x: 1, y: 0 };
  private windSpeed: number = 0.5;

  // Constants
  private DIFFUSION_RATE = 0.1;
  private COOLING_RATE = 0.005;
  private IGNITION_THRESH = 0.8;
  private FREEZE_THRESH = 0.1;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.heatMap = new Float32Array(width * height).fill(0.5); // Start at ambient
    this.nextHeatMap = new Float32Array(width * height);
  }

  public setHeatSource(x: number, y: number, temp: number) {
    if (this.isValid(x, y)) {
      this.heatMap[y * this.width + x] = temp;
    }
  }

  public setWind(x: number, y: number, speed: number) {
    const len = Math.sqrt(x*x + y*y);
    if (len > 0) {
      this.wind.x = x / len;
      this.wind.y = y / len;
      this.windSpeed = speed;
    }
  }

  public update(materials: Uint8Array) { // Reads material grid from FluidSim or World
    // Reset buffer
    this.nextHeatMap.set(this.heatMap);

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        const idx = y * this.width + x;
        let temp = this.heatMap[idx];

        // 1. Diffusion (Average of neighbors)
        const avgNeighbors = (
          this.heatMap[idx - 1] + 
          this.heatMap[idx + 1] + 
          this.heatMap[idx - this.width] + 
          this.heatMap[idx + this.width]
        ) / 4;

        temp = this.lerp(temp, avgNeighbors, this.DIFFUSION_RATE);

        // 2. Wind Advection
        // Look "upwind" to see what heat is blowing onto us
        const upwindX = Math.round(x - this.wind.x);
        const upwindY = Math.round(y - this.wind.y);
        if (this.isValid(upwindX, upwindY)) {
          const upwindTemp = this.heatMap[upwindY * this.width + upwindX];
          // If upwind is hotter, we heat up faster
          if (upwindTemp > temp) {
            temp = this.lerp(temp, upwindTemp, this.windSpeed * 0.2);
          }
        }

        // 3. Material Properties (Source/Sink)
        const mat = materials[idx];
        if (mat === 3) { // LAVA
          temp = Math.max(temp, 1.0); // Constant heat source
        } else if (mat === 4) { // STONE
          // Stone retains heat well? Or cools? Let's say neutral.
        } else {
          // Ambient cooling
          temp = Math.max(0, temp - this.COOLING_RATE);
        }

        // 4. State Changes (Logic only, actual mutation usually happens in World/Fluid sim)
        if (temp > this.IGNITION_THRESH && mat === 1) { // 1 = Wood/Wall?
           // Would trigger "Catch Fire" event
        }
        if (temp < this.FREEZE_THRESH && mat === 2) { // 2 = Water
           // Would trigger "Freeze" event
        }

        this.nextHeatMap[idx] = temp;
      }
    }

    // Swap
    this.heatMap.set(this.nextHeatMap);
  }

  public getTemperature(x: number, y: number): number {
    if (!this.isValid(x, y)) return 0.5;
    return this.heatMap[y * this.width + x];
  }

  private isValid(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
}
