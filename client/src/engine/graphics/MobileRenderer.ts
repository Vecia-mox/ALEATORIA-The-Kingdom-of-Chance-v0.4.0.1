
/**
 * TITAN ENGINE: MOBILE RENDERER (Forward+)
 * Uses Tile-based Light Culling to support many dynamic lights on mobile GPUs.
 */

export class MobileRenderer {
  private gl: WebGL2RenderingContext;
  private width: number;
  private height: number;
  
  // Forward+ Grid
  private TILE_SIZE = 16; // Pixels
  private MAX_LIGHTS_PER_TILE = 4; // Hard limit for mobile shader
  private tilesX: number = 0;
  private tilesY: number = 0;
  
  // Data Buffers
  private lightGridTexture: WebGLTexture | null = null; // Stores light indices per tile
  private lightBuffer: Float32Array; // Stores Light Data (Pos, Color, Radius)
  private dynamicLights: any[] = [];

  // Resolution Scaling
  private scaleFactor: number = 0.7; // Render 3D at 70% res

  constructor(canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl2', { powerPreference: 'high-performance', alpha: false })!;
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.lightBuffer = new Float32Array(100 * 8); // 100 Lights max
    this.resize(this.width, this.height);
  }

  public resize(w: number, h: number) {
    this.width = w * this.scaleFactor;
    this.height = h * this.scaleFactor;
    
    this.tilesX = Math.ceil(this.width / this.TILE_SIZE);
    this.tilesY = Math.ceil(this.height / this.TILE_SIZE);
    
    // Recreate Grid Texture
    if (this.lightGridTexture) this.gl.deleteTexture(this.lightGridTexture);
    this.lightGridTexture = this.gl.createTexture();
    
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.lightGridTexture);
    // RGBA8UI: Each channel holds a Light Index (up to 4 lights per tile)
    this.gl.texStorage2D(this.gl.TEXTURE_2D, 1, this.gl.RGBA8UI, this.tilesX, this.tilesY);
    
    // Update Canvas size to scaled resolution (CSS scales it back up)
    this.gl.canvas.width = this.width;
    this.gl.canvas.height = this.height;
  }

  public setResolutionScale(scale: number) {
    this.scaleFactor = Math.max(0.5, Math.min(1.0, scale));
    const canvas = this.gl.canvas;
    if (canvas instanceof HTMLCanvasElement) {
      this.resize(canvas.clientWidth, canvas.clientHeight);
    } else {
      this.resize(canvas.width, canvas.height);
    }
  }

  /**
   * CPU-Side Light Culling.
   * Calculates which lights touch which 16x16 screen tile.
   * Uploads the result to `lightGridTexture`.
   */
  public cullLights(camera: any) {
    const gridData = new Uint8Array(this.tilesX * this.tilesY * 4).fill(0); // 0 = No Light
    
    this.dynamicLights.forEach((light, lightIndex) => {
      if (lightIndex >= 255) return; // Max ID

      // 1. Project Light Sphere to Screen Space AABB
      const bounds = this.getLightScreenBounds(light, camera);
      if (!bounds) return; // Off screen

      // 2. Convert Screen Pixels to Tile Coords
      const minTx = Math.floor(bounds.minX / this.TILE_SIZE);
      const maxTx = Math.floor(bounds.maxX / this.TILE_SIZE);
      const minTy = Math.floor(bounds.minY / this.TILE_SIZE);
      const maxTy = Math.floor(bounds.maxY / this.TILE_SIZE);

      // 3. Fill Grid
      for (let y = minTy; y <= maxTy; y++) {
        for (let x = minTx; x <= maxTx; x++) {
          if (x < 0 || x >= this.tilesX || y < 0 || y >= this.tilesY) continue;
          
          const tileIdx = (y * this.tilesX + x) * 4;
          
          // Find empty slot (R, G, B, or A)
          for (let k = 0; k < 4; k++) {
            if (gridData[tileIdx + k] === 0) {
              gridData[tileIdx + k] = lightIndex + 1; // 1-based index (0 is empty)
              break;
            }
          }
        }
      }
    });

    // Upload to GPU
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.lightGridTexture);
    this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, this.tilesX, this.tilesY, this.gl.RGBA_INTEGER, this.gl.UNSIGNED_BYTE, gridData);
  }

  private getLightScreenBounds(light: any, camera: any): {minX:number, maxX:number, minY:number, maxY:number} | null {
    // Simplified projection logic
    // In real engine: Transform light pos by ViewProj, divide by W, map to 0..Width/Height
    // Also factor in light radius to expand the box
    return { minX: 0, maxX: 100, minY: 0, maxY: 100 }; // Placeholder
  }

  public render(scene: any, camera: any) {
    this.cullLights(camera);
    
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    // Bind Grid Texture to Slot 5 (example)
    this.gl.activeTexture(this.gl.TEXTURE5);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.lightGridTexture);
    
    // Draw Scene...
    // Shader reads gl_FragCoord.xy / TILE_SIZE to fetch light indices
  }
}
