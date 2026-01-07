
/**
 * TITAN ENGINE: TERRAIN SYSTEM
 * Handles Heightmap generation, CDLOD, and Splatmap texturing.
 */

export class TerrainSystem {
  private gl: WebGL2RenderingContext;
  private heightMapTexture: WebGLTexture | null = null;
  private splatMapTexture: WebGLTexture | null = null;
  
  // Configuration
  private size: number = 1024; // World Units
  private heightScale: number = 200; // Max height
  private resolution: number = 256; // Vertices per side

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  /**
   * Loads a grayscale image to use as displacement map.
   */
  public async loadHeightmap(url: string) {
    const img = await this.loadImage(url);
    this.heightMapTexture = this.createTextureFromImage(img);
  }

  /**
   * Loads an RGBA image to control texture blending.
   * R = Texture 1 (Dirt), G = Texture 2 (Grass), B = Texture 3 (Rock), A = Texture 4 (Snow)
   */
  public async loadSplatmap(url: string) {
    const img = await this.loadImage(url);
    this.splatMapTexture = this.createTextureFromImage(img);
  }

  /**
   * Generates the terrain geometry grid.
   * In a real implementation, this would use CDLOD (Quadtree) for optimization.
   */
  public generateMesh(): { vertices: Float32Array, indices: Uint16Array } {
    const vertices = [];
    const indices = [];
    const res = this.resolution;
    const step = this.size / res;

    for (let z = 0; z <= res; z++) {
      for (let x = 0; x <= res; x++) {
        // x, y (up), z
        // y is 0, displaced by shader using heightmap
        vertices.push(x * step, 0, z * step);
        
        // UVs
        vertices.push(x / res, z / res);
      }
    }

    for (let z = 0; z < res; z++) {
      for (let x = 0; x < res; x++) {
        const i = z * (res + 1) + x;
        const topLeft = i;
        const topRight = i + 1;
        const bottomLeft = i + (res + 1);
        const bottomRight = i + (res + 1) + 1;

        indices.push(topLeft, bottomLeft, topRight);
        indices.push(topRight, bottomLeft, bottomRight);
      }
    }

    return {
      vertices: new Float32Array(vertices),
      indices: new Uint16Array(indices)
    };
  }

  /**
   * GLSL Vertex Shader snippet for Heightmap Displacement.
   */
  public getVertexShaderSnippet(): string {
    return `
      uniform sampler2D uHeightMap;
      uniform float uHeightScale;
      
      void applyDisplacement(inout vec3 position, vec2 uv) {
        float h = texture(uHeightMap, uv).r;
        position.y += h * uHeightScale;
      }
    `;
  }

  /**
   * GLSL Fragment Shader snippet for Splatmap Blending.
   */
  public getFragmentShaderSnippet(): string {
    return `
      uniform sampler2D uSplatMap;
      uniform sampler2D uTexDirt;
      uniform sampler2D uTexGrass;
      uniform sampler2D uTexRock;
      uniform sampler2D uTexSnow;
      
      vec4 getTerrainColor(vec2 uv) {
        vec4 splat = texture(uSplatMap, uv);
        
        // Tri-planar or simple UV mapping for detail textures
        vec2 detailUV = uv * 20.0; // Tiling
        
        vec4 colDirt = texture(uTexDirt, detailUV);
        vec4 colGrass = texture(uTexGrass, detailUV);
        vec4 colRock = texture(uTexRock, detailUV);
        vec4 colSnow = texture(uTexSnow, detailUV);
        
        // Blend based on channels
        vec4 color = colDirt; // Base
        color = mix(color, colGrass, splat.g);
        color = mix(color, colRock, splat.b);
        color = mix(color, colSnow, splat.a);
        
        return color;
      }
    `;
  }

  // --- HELPERS ---

  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private createTextureFromImage(img: HTMLImageElement): WebGLTexture {
    const tex = this.gl.createTexture()!;
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    return tex;
  }
}
