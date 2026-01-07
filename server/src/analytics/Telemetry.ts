
/**
 * TITAN ENGINE: TELEMETRY & ANALYTICS
 * Ingests game events and generates spatial heatmaps.
 */

export interface GameEvent {
  type: string; // 'PLAYER_DEATH', 'ITEM_DROP', 'LEVEL_UP'
  playerId: string;
  timestamp: number;
  data: any;
  position?: { x: number, y: number, z: number };
  zoneId?: string;
}

export class Telemetry {
  private static instance: Telemetry;
  
  private eventBuffer: GameEvent[] = [];
  private readonly FLUSH_THRESHOLD = 100;
  private readonly FLUSH_INTERVAL = 30000; // 30s

  // Heatmap Aggregation (ZoneID -> GridIndex -> Count)
  // Grid is 100x100 resolution per zone
  private heatmaps: Map<string, Uint32Array> = new Map();
  private readonly GRID_RES = 100;
  private readonly WORLD_SIZE = 4096; // Max coordinate

  private constructor() {
    setInterval(() => this.flush(), this.FLUSH_INTERVAL);
  }

  public static getInstance(): Telemetry {
    if (!Telemetry.instance) Telemetry.instance = new Telemetry();
    return Telemetry.instance;
  }

  public log(type: string, playerId: string, data: any, pos?: {x:number, y:number, z:number}, zoneId: string = 'global') {
    const event: GameEvent = {
      type,
      playerId,
      timestamp: Date.now(),
      data,
      position: pos,
      zoneId
    };

    this.eventBuffer.push(event);

    // Update Heatmap immediately for real-time dashboard
    if (pos && (type === 'PLAYER_DEATH' || type === 'COMBAT_ENGAGE')) {
      this.addToHeatmap(zoneId, pos.x, pos.z); // Use X/Z for top-down map
    }

    if (this.eventBuffer.length >= this.FLUSH_THRESHOLD) {
      this.flush();
    }
  }

  private addToHeatmap(zoneId: string, x: number, y: number) {
    if (!this.heatmaps.has(zoneId)) {
      this.heatmaps.set(zoneId, new Uint32Array(this.GRID_RES * this.GRID_RES));
    }

    const grid = this.heatmaps.get(zoneId)!;
    
    // Normalize coordinates to grid space
    // Assume world is 0 to WORLD_SIZE
    const gx = Math.floor((x / this.WORLD_SIZE) * this.GRID_RES);
    const gy = Math.floor((y / this.WORLD_SIZE) * this.GRID_RES);

    if (gx >= 0 && gx < this.GRID_RES && gy >= 0 && gy < this.GRID_RES) {
      const idx = gy * this.GRID_RES + gx;
      grid[idx]++;
    }
  }

  public async flush() {
    if (this.eventBuffer.length === 0) return;

    const batch = [...this.eventBuffer];
    this.eventBuffer = [];

    console.log(`[Telemetry] Flushing ${batch.length} events to Analytics DB...`);
    
    // Mock DB Insert
    // await DBManager.insertEvents(batch);
  }

  public getHeatmap(zoneId: string): number[] {
    const grid = this.heatmaps.get(zoneId);
    return grid ? Array.from(grid) : [];
  }
}
