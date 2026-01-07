
/**
 * TITAN ENGINE: COORDINATE ADAPTER
 * Bridges the scale gap between 2D Pixels (Phaser) and 3D Meters (WebGL).
 */

export class CoordinateAdapter {
  
  // 2D World is massive (e.g. 24000 pixels wide)
  // 3D World is compact (e.g. 480 meters wide)
  // Ratio: 1 meter = 50 pixels
  private static readonly PIXELS_TO_METERS = 0.02; 
  private static readonly METERS_TO_PIXELS = 50.0;

  // Offset to center the map (0,0) in 3D
  // If 2D map is 0-based, we shift it so the center is (0,0,0)
  private static readonly OFFSET_X = -1024 * 0.02 * 8; // Assuming 16 chunks width approx
  private static readonly OFFSET_Z = -1024 * 0.02 * 8;

  /**
   * Converts a 2D Pixel Coordinate to a 3D World Position.
   */
  public static to3D(x: number, y: number): { x: number, y: number, z: number } {
    return {
      x: x * this.PIXELS_TO_METERS,
      y: 0, // Default ground level
      z: y * this.PIXELS_TO_METERS
    };
  }

  /**
   * Converts a 3D World Position back to 2D Pixels (for UI overlay positioning).
   */
  public static to2D(x: number, z: number): { x: number, y: number } {
    return {
      x: x * this.METERS_TO_PIXELS,
      y: z * this.METERS_TO_PIXELS
    };
  }

  /**
   * Converts a generic scale (radius/speed) from Pixels to Meters.
   */
  public static scaleToMeters(value: number): number {
    return value * this.PIXELS_TO_METERS;
  }
}
