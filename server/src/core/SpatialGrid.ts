
/**
 * TITAN ENGINE: SPATIAL GRID
 * Optimizes network traffic via Area of Interest (AOI) management.
 */

export class SpatialGrid {
  private cellSize: number;
  // Cell ID "x:y" -> Set of Entity IDs
  private cells: Map<string, Set<string>> = new Map();
  // Entity ID -> Current Cell ID
  private entityCellMap: Map<string, string> = new Map();

  constructor(cellSize: number = 50) {
    this.cellSize = cellSize;
  }

  private getCellId(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx}:${cy}`;
  }

  public addEntity(id: string, x: number, y: number) {
    const cellId = this.getCellId(x, y);
    if (!this.cells.has(cellId)) {
      this.cells.set(cellId, new Set());
    }
    this.cells.get(cellId)!.add(id);
    this.entityCellMap.set(id, cellId);
  }

  public removeEntity(id: string) {
    const cellId = this.entityCellMap.get(id);
    if (cellId) {
      const cell = this.cells.get(cellId);
      if (cell) {
        cell.delete(id);
        if (cell.size === 0) this.cells.delete(cellId);
      }
      this.entityCellMap.delete(id);
    }
  }

  public updateEntity(id: string, x: number, y: number) {
    const newCellId = this.getCellId(x, y);
    const oldCellId = this.entityCellMap.get(id);

    if (oldCellId !== newCellId) {
      // Remove from old
      if (oldCellId) {
        const oldCell = this.cells.get(oldCellId);
        if (oldCell) {
          oldCell.delete(id);
          if (oldCell.size === 0) this.cells.delete(oldCellId);
        }
      }

      // Add to new
      if (!this.cells.has(newCellId)) {
        this.cells.set(newCellId, new Set());
      }
      this.cells.get(newCellId)!.add(id);
      this.entityCellMap.set(id, newCellId);
    }
  }

  /**
   * Returns all entity IDs in the 9-cell neighborhood of the position.
   * This is the "Area of Interest" (AOI).
   */
  public getNearbyEntities(x: number, y: number): string[] {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const entities: string[] = [];

    // Check center and 8 neighbors
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cx + dx}:${cy + dy}`;
        const cell = this.cells.get(key);
        if (cell) {
          // Spread iterator into array
          for (const id of cell) {
            entities.push(id);
          }
        }
      }
    }
    return entities;
  }
}
