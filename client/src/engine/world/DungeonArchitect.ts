
/**
 * TITAN ENGINE: DUNGEON ARCHITECT
 * Assembles high-fidelity modular assets and bakes them for mobile performance.
 */

export interface DungeonTile {
  id: string;
  type: 'FLOOR' | 'WALL' | 'CORNER' | 'DOOR' | 'PILLAR';
  meshId: string; // Ref to AssetLoader
  sockets: { N: string, S: string, E: string, W: string }; // "A", "B", "None"
  variation: number;
}

export interface PlacedTile {
  tileId: string;
  x: number; // Grid X
  y: number; // Grid Y
  rot: number; // 0, 90, 180, 270
}

export class DungeonArchitect {
  private tileset: Map<string, DungeonTile> = new Map();
  private grid: Map<string, PlacedTile> = new Map();
  private TILE_SIZE = 4; // Meters

  // Geometry Cache for Baking
  private geometryCache: Map<string, { verts: Float32Array, uvs: Float32Array }> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    this.tileset.set('crypt_floor_1', { 
      id: 'crypt_floor_1', type: 'FLOOR', meshId: 'mesh_crypt_floor_a', 
      sockets: { N:'A', S:'A', E:'A', W:'A' }, variation: 0 
    });
    this.tileset.set('crypt_wall_1', { 
      id: 'crypt_wall_1', type: 'WALL', meshId: 'mesh_crypt_wall_a', 
      sockets: { N:'None', S:'A', E:'None', W:'None' }, variation: 0 
    });
  }

  /**
   * Generates a room and returns a Single Baked Mesh.
   * This reduces 100 draw calls (10x10 room) to 1 draw call.
   */
  public bakeRoom(width: number, height: number): { vertices: Float32Array, uvs: Float32Array } {
    const bakedVerts: number[] = [];
    const bakedUVs: number[] = [];

    // 1. Logic: Wave Function Collapse (Simplified for MVP)
    // Place floors
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        this.addTileToBake('crypt_floor_1', x, y, 0, bakedVerts, bakedUVs);
      }
    }
    
    // Place walls
    for (let x = 0; x < width; x++) {
        this.addTileToBake('crypt_wall_1', x, -1, 0, bakedVerts, bakedUVs); // Top
        this.addTileToBake('crypt_wall_1', x, height, 180, bakedVerts, bakedUVs); // Bottom
    }

    return {
      vertices: new Float32Array(bakedVerts),
      uvs: new Float32Array(bakedUVs)
    };
  }

  private addTileToBake(tileId: string, gx: number, gy: number, rot: number, vOut: number[], uvOut: number[]) {
    // In a real engine, we fetch this from AssetLoader
    // Mocking a 1x1 plane for demonstration
    const mockGeom = [
      -2, 0, -2,  2, 0, -2,  -2, 0, 2, // Tri 1
      -2, 0, 2,   2, 0, -2,   2, 0, 2  // Tri 2
    ];
    const mockUV = [0,0, 1,0, 0,1, 0,1, 1,0, 1,1];

    // Transform Matrix
    const rad = rot * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const worldX = gx * this.TILE_SIZE;
    const worldZ = gy * this.TILE_SIZE;

    for (let i = 0; i < mockGeom.length; i += 3) {
      const lx = mockGeom[i];
      const ly = mockGeom[i+1];
      const lz = mockGeom[i+2];

      // Rotate around Y
      const rx = lx * cos - lz * sin;
      const rz = lx * sin + lz * cos;

      // Translate
      vOut.push(rx + worldX);
      vOut.push(ly); // Height
      vOut.push(rz + worldZ);
    }

    // Pass through UVs
    mockUV.forEach(u => uvOut.push(u));
  }
}
