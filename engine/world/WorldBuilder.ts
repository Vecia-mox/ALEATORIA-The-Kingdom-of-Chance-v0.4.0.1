
import { Chunk } from '../../types';
import { Renderer3D } from '../graphics/Renderer3D';

/**
 * TITAN ENGINE: WORLD BUILDER
 * Procedurally generates the 3D scene graph from 2D tile data.
 * Uses InstancedMesh logic for performance (10k tiles -> 1 draw call).
 */
export class WorldBuilder {
  private renderer: Renderer3D;
  private builtChunks: Set<string> = new Set();
  
  // Instance Containers (MeshID -> Array of Matrices)
  private instances: Map<string, Float32Array[]> = new Map();

  constructor(renderer: Renderer3D) {
    this.renderer = renderer;
  }

  public buildChunk(chunk: Chunk) {
    if (this.builtChunks.has(chunk.id)) return;
    this.builtChunks.add(chunk.id);

    console.log(`[WorldBuilder] Constructing 3D Geometry for Chunk ${chunk.id}`);

    const CHUNK_SIZE = 16;
    const TILE_SIZE = 4.0; // 4 meters per tile to match character scale

    for (let y = 0; y < chunk.height; y++) {
      for (let x = 0; x < chunk.width; x++) {
        const tileId = chunk.data[y][x];
        const worldX = (chunk.x * CHUNK_SIZE + x) * TILE_SIZE;
        const worldZ = (chunk.y * CHUNK_SIZE + y) * TILE_SIZE;

        this.processTile(tileId, worldX, worldZ);
      }
    }
    
    // In a real engine, we would flush 'this.instances' to the GPU here
    // e.g. renderer.updateInstancedMesh('Floor_Stone', matrixBuffer);
  }

  private processTile(tileId: number, x: number, z: number) {
    // Legacy Map Data Mapping:
    // 1 = Walkable (Floor)
    // 0 = Wall (Crypt Wall)
    
    // Check against standard walkable IDs (usually > 0 in most tilemaps, 
    // but sticking to prompt logic of ID 1 for floor)
    const isFloor = tileId >= 1; 
    const isWall = tileId === 0 || (tileId >= 8 && tileId <= 15); // Handling legacy + new types

    if (isFloor) {
      // Spawn Floor with random rotation to break tiling
      const rotY = this.getRandomRotationY();
      this.addMeshInstance('Floor_Stone', x, 0, z, rotY);
    } 
    
    if (isWall) {
      // Stack walls 2 units high for claustrophobia
      this.addMeshInstance('Wall_Crypt', x, 0, z, 0);
      this.addMeshInstance('Wall_Crypt', x, 4, z, 0); // +4m Up (assuming 4m tall wall segments)
    }
  }

  private addMeshInstance(meshId: string, x: number, y: number, z: number, rotY: number) {
    // Create transform matrix (4x4)
    const mat = new Float32Array(16);
    this.composeMatrix(mat, x, y, z, rotY, 1.0);
    
    if (!this.instances.has(meshId)) {
      this.instances.set(meshId, []);
    }
    this.instances.get(meshId)!.push(mat);
  }

  private getRandomRotationY(): number {
    const rots = [0, Math.PI/2, Math.PI, Math.PI * 1.5];
    return rots[Math.floor(Math.random() * rots.length)];
  }

  private composeMatrix(out: Float32Array, x: number, y: number, z: number, rotY: number, scale: number) {
    const c = Math.cos(rotY);
    const s = Math.sin(rotY);
    
    out.fill(0);
    out[0] = c * scale;
    out[2] = -s * scale;
    out[5] = scale;
    out[8] = s * scale;
    out[10] = c * scale;
    out[15] = 1;
    out[12] = x;
    out[13] = y;
    out[14] = z;
  }
}
