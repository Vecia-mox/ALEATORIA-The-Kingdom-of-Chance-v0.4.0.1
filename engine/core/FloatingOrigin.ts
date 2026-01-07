
/**
 * TITAN ENGINE: FLOATING ORIGIN
 * Shifts the world origin to keep the player near (0,0,0) for precision.
 */

export class FloatingOrigin {
  private static instance: FloatingOrigin;
  private threshold: number = 5000; // Units
  
  // Total offset from the "Real" origin (0,0,0 in Save Data)
  public accumulatedOffset: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 };
  
  // Listeners for when a shift occurs (Physics, Rendering, Audio need to know)
  private listeners: ((offset: {x:number, y:number, z:number}) => void)[] = [];

  private constructor() {}

  public static getInstance(): FloatingOrigin {
    if (!FloatingOrigin.instance) FloatingOrigin.instance = new FloatingOrigin();
    return FloatingOrigin.instance;
  }

  public registerListener(cb: (offset: {x:number, y:number, z:number}) => void) {
    this.listeners.push(cb);
  }

  public update(playerPos: { x: number, y: number, z: number }) {
    const distSq = playerPos.x*playerPos.x + playerPos.y*playerPos.y + playerPos.z*playerPos.z;
    const threshSq = this.threshold * this.threshold;

    if (distSq > threshSq) {
      this.shiftWorld(playerPos);
    }
  }

  /**
   * Converts a Rendering Position (Local) to a Saved Position (Global).
   */
  public toGlobal(localPos: { x: number, y: number, z: number }): { x: number, y: number, z: number } {
    return {
      x: localPos.x + this.accumulatedOffset.x,
      y: localPos.y + this.accumulatedOffset.y,
      z: localPos.z + this.accumulatedOffset.z
    };
  }

  /**
   * Converts a Saved Position (Global) to a Rendering Position (Local).
   */
  public toLocal(globalPos: { x: number, y: number, z: number }): { x: number, y: number, z: number } {
    return {
      x: globalPos.x - this.accumulatedOffset.x,
      y: globalPos.y - this.accumulatedOffset.y,
      z: globalPos.z - this.accumulatedOffset.z
    };
  }

  private shiftWorld(center: { x: number, y: number, z: number }) {
    // The offset we need to subtract from everyone to bring 'center' to (0,0,0)
    const offset = { x: center.x, y: center.y, z: center.z };

    // Update Accumulator
    this.accumulatedOffset.x += offset.x;
    this.accumulatedOffset.y += offset.y;
    this.accumulatedOffset.z += offset.z;

    console.log(`[FloatingOrigin] Shifting World by ${offset.x.toFixed(0)}, ${offset.y.toFixed(0)}, ${offset.z.toFixed(0)}`);

    // Notify all systems to subtract 'offset' from their positions
    this.listeners.forEach(cb => cb(offset));
  }
}
