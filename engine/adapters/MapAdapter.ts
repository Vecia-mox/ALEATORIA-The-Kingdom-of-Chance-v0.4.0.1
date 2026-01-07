
import { Chunk } from '../../types';
import { VoxelWorld } from '../voxel/VoxelWorld';

/**
 * TITAN ENGINE: MAP ADAPTER
 * Bridges Legacy 2D Tilemaps to 3D Voxels.
 */
export class MapAdapter {
  private voxelWorld: VoxelWorld;
  private processedChunks: Set<string> = new Set();
  
  // Scaling Factor: 64px (2D) -> 4 Units (3D)
  private readonly SCALE = 4.0 / 64.0; 
  private readonly CHUNK_SIZE = 16;

  constructor(voxelWorld: VoxelWorld) {
    this.voxelWorld = voxelWorld;
  }

  public processChunk(chunk: Chunk) {
    if (this.processedChunks.has(chunk.id)) return;
    this.processedChunks.add(chunk.id);

    console.log(`[MapAdapter] Voxelizing Chunk ${chunk.id}...`);

    for (let y = 0; y < chunk.height; y++) {
      for (let x = 0; x < chunk.width; x++) {
        const tileId = chunk.data[y][x];
        
        // Calculate World Position (3D)
        // chunk.x/y are grid coordinates
        const wx = (chunk.x * this.CHUNK_SIZE + x) * 4.0; // 4.0 units per tile
        const wz = (chunk.y * this.CHUNK_SIZE + y) * 4.0;

        this.convertTileToVoxel(wx, wz, tileId);
      }
    }
  }

  private convertTileToVoxel(x: number, z: number, tileId: number) {
    // 2D Tile ID Mapping -> 3D Voxel Operation
    // 0-7: Grass (Flat)
    // 8-15: Wall (High Block)
    // 16-23: Water (Depression)
    // 24+: Lava (Emissive)

    const BRUSH_RADIUS = 3.0; // Smooth blending

    if (tileId >= 8 && tileId <= 15) {
      // WALL: Add height
      this.voxelWorld.modifyTerrain(x, 8.0, z, BRUSH_RADIUS, 1.0);
    } else if (tileId >= 16 && tileId <= 23) {
      // WATER: Dig down
      this.voxelWorld.modifyTerrain(x, -2.0, z, BRUSH_RADIUS, -1.0);
    } else if (tileId >= 24) {
      // LAVA: Dig + Material change (Material logic todo)
      this.voxelWorld.modifyTerrain(x, -3.0, z, BRUSH_RADIUS, -1.0);
    } else {
      // GRASS: Base Level 0
      this.voxelWorld.modifyTerrain(x, 0.0, z, BRUSH_RADIUS, 0.5); // Ensure flat
    }
  }
}
