
/**
 * TileMath handles the bitwise logic for auto-tiling.
 * It calculates a value (0-15) based on the presence of similar neighbors.
 * 
 * Bitmask Values:
 * North: 1
 * West:  2
 * East:  4
 * South: 8
 */
export class TileMath {
  static computeBitmask(x: number, y: number, checkFn: (nx: number, ny: number) => boolean): number {
    let mask = 0;
    if (checkFn(x, y - 1)) mask += 1; // North
    if (checkFn(x - 1, y)) mask += 2; // West
    if (checkFn(x + 1, y)) mask += 4; // East
    if (checkFn(x, y + 1)) mask += 8; // South
    return mask;
  }
}
