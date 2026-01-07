
/**
 * TITAN ENGINE: VOXEL WORLD
 * Smooth, destructible terrain using Marching Cubes density fields.
 */

// Simple Tri-Table for Marching Cubes (First 2 cases for brevity, full table needed in prod)
const TRI_TABLE = [
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  // ... maps 256 configurations to triangles ...
];

export class VoxelWorld {
  private gl: WebGL2RenderingContext;
  
  // 3D Density Grid: -1.0 (Air) to 1.0 (Solid)
  // Flattened array: x + y*WIDTH + z*WIDTH*HEIGHT
  private density: Float32Array;
  private size: number = 32; // Chunk Size
  
  private mesh: {
    vertices: Float32Array;
    normals: Float32Array;
    indices: Uint16Array;
  } | null = null;

  constructor(gl: WebGL2RenderingContext, size: number = 32) {
    this.gl = gl;
    this.size = size;
    this.density = new Float32Array(size * size * size);
    this.initializeTerrain();
  }

  private initializeTerrain() {
    // Generate a sphere shape for the planet chunk
    const center = this.size / 2;
    const radius = this.size / 2 - 2;

    for (let z = 0; z < this.size; z++) {
      for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
          const idx = this.getIndex(x, y, z);
          const dist = Math.sqrt((x-center)**2 + (y-center)**2 + (z-center)**2);
          // Density: Positive inside sphere, Negative outside
          this.density[idx] = radius - dist;
        }
      }
    }
    this.regenerateMesh();
  }

  /**
   * Modifies terrain density at a specific point.
   * @param x Local X
   * @param y Local Y
   * @param z Local Z
   * @param radius Brush radius
   * @param amount Positive to Build, Negative to Dig
   */
  public modifyTerrain(x: number, y: number, z: number, radius: number, amount: number) {
    const rSq = radius * radius;
    const iRad = Math.ceil(radius);

    let minX = Math.max(0, x - iRad), maxX = Math.min(this.size, x + iRad);
    let minY = Math.max(0, y - iRad), maxY = Math.min(this.size, y + iRad);
    let minZ = Math.max(0, z - iRad), maxZ = Math.min(this.size, z + iRad);

    let changed = false;

    for (let iz = minZ; iz < maxZ; iz++) {
      for (let iy = minY; iy < maxY; iy++) {
        for (let ix = minX; ix < maxX; ix++) {
          const dx = ix - x;
          const dy = iy - y;
          const dz = iz - z;
          const distSq = dx*dx + dy*dy + dz*dz;

          if (distSq <= rSq) {
            const idx = this.getIndex(ix, iy, iz);
            // Falloff function for smooth blending
            const falloff = 1.0 - (distSq / rSq); 
            this.density[idx] += amount * falloff;
            // Clamp
            this.density[idx] = Math.max(-1, Math.min(1, this.density[idx]));
            changed = true;
          }
        }
      }
    }

    if (changed) {
      this.regenerateMesh();
    }
  }

  private regenerateMesh() {
    // Marching Cubes Algorithm
    const verts: number[] = [];
    const norms: number[] = [];
    const inds: number[] = [];
    
    // Simplification: In a real implementation, we iterate cells, calculate cube index,
    // lookup TRI_TABLE, interpolate edges based on density values, and push vertices.
    // Assuming generated for brevity.
    
    this.mesh = {
      vertices: new Float32Array(verts),
      normals: new Float32Array(norms),
      indices: new Uint16Array(inds)
    };

    // Upload to GPU (buffers would be managed here)
  }

  private getIndex(x: number, y: number, z: number): number {
    return x + y * this.size + z * this.size * this.size;
  }

  /**
   * GLSL Snippet for Triplanar Mapping.
   * Textures mesh without UV coords by projecting textures along world axes.
   */
  public getTriplanarShader(): string {
    return `
      uniform sampler2D uTexTop;   // Grass
      uniform sampler2D uTexSide;  // Rock
      uniform float uScale;

      vec3 getTriplanarColor(vec3 worldPos, vec3 normal) {
        vec3 blending = abs(normal);
        blending = normalize(max(blending, 0.00001)); // Prevent div by zero
        float b = (blending.x + blending.y + blending.z);
        blending /= b;

        vec4 xaxis = texture(uTexSide, worldPos.yz * uScale);
        vec4 yaxis = texture(uTexTop,  worldPos.xz * uScale);
        vec4 zaxis = texture(uTexSide, worldPos.xy * uScale);

        return xaxis.rgb * blending.x + yaxis.rgb * blending.y + zaxis.rgb * blending.z;
      }
    `;
  }
}
