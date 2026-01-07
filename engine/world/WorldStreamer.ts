
/**
 * TITAN ENGINE: WORLD STREAMER
 * Manages grid-based streaming of world chunks and HLODs.
 */

export type CellId = string; // "x_y"

export class WorldStreamer {
  // Configuration
  private static CELL_SIZE = 500; // Meters
  private static LOAD_DISTANCE = 500; // High Detail Radius
  private static HLOD_DISTANCE = 2000; // Low Detail Radius

  // State
  private activeCells: Set<CellId> = new Set();
  private hlodCells: Set<CellId> = new Set();
  private playerGridPos: { x: number, y: number } = { x: 0, y: 0 };

  // Callbacks
  public onLoadCell: ((x: number, y: number, isLOD: boolean) => void) | null = null;
  public onUnloadCell: ((x: number, y: number) => void) | null = null;

  public update(playerPos: Float32Array) {
    const px = playerPos[0];
    const pz = playerPos[2];

    const gx = Math.floor(px / WorldStreamer.CELL_SIZE);
    const gy = Math.floor(pz / WorldStreamer.CELL_SIZE);

    // Only update if grid position changed
    if (gx !== this.playerGridPos.x || gy !== this.playerGridPos.y) {
      this.playerGridPos = { x: gx, y: gy };
      this.refreshGrid();
    }
  }

  private refreshGrid() {
    const loadRadius = Math.ceil(WorldStreamer.LOAD_DISTANCE / WorldStreamer.CELL_SIZE);
    const hlodRadius = Math.ceil(WorldStreamer.HLOD_DISTANCE / WorldStreamer.CELL_SIZE);

    const neededCells = new Set<CellId>();
    const neededHLODs = new Set<CellId>();

    // 1. Identify Needed Cells
    for (let y = -hlodRadius; y <= hlodRadius; y++) {
      for (let x = -hlodRadius; x <= hlodRadius; x++) {
        const dist = Math.sqrt(x*x + y*y);
        const cellX = this.playerGridPos.x + x;
        const cellY = this.playerGridPos.y + y;
        const id = `${cellX}_${cellY}`;

        if (dist <= loadRadius) {
          neededCells.add(id);
        } else if (dist <= hlodRadius) {
          neededHLODs.add(id);
        }
      }
    }

    // 2. Process Unloads
    // Unload Active Cells that are no longer needed
    for (const id of this.activeCells) {
      if (!neededCells.has(id)) {
        this.unload(id);
        this.activeCells.delete(id);
      }
    }
    // Unload HLODs that are no longer needed (or promoted to Active)
    for (const id of this.hlodCells) {
      if (!neededHLODs.has(id) || neededCells.has(id)) {
        this.unload(id); // If promoted to active, we unload HLOD first to swap
        this.hlodCells.delete(id);
      }
    }

    // 3. Process Loads
    for (const id of neededCells) {
      if (!this.activeCells.has(id)) {
        this.load(id, false);
        this.activeCells.add(id);
      }
    }
    for (const id of neededHLODs) {
      if (!this.hlodCells.has(id)) {
        this.load(id, true);
        this.hlodCells.add(id);
      }
    }
  }

  private load(id: CellId, isLOD: boolean) {
    const [x, y] = id.split('_').map(Number);
    if (this.onLoadCell) {
      // In a real engine, this would be a priority queue request to the AssetLoader
      this.onLoadCell(x, y, isLOD);
    }
  }

  private unload(id: CellId) {
    const [x, y] = id.split('_').map(Number);
    if (this.onUnloadCell) {
      this.onUnloadCell(x, y);
    }
  }
}
