
/**
 * TITAN ENGINE: FOLIAGE RENDERER
 * Uses Hardware Instancing to render thousands of grass/trees.
 */

export class FoliageRenderer {
  private gl: WebGL2RenderingContext;
  private instanceCount: number = 0;
  private vao: WebGLVertexArrayObject | null = null;
  private instanceBuffer: WebGLBuffer | null = null;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  /**
   * Initializes the instanced buffers.
   * @param transforms Float32Array of matrices (16 floats per instance)
   */
  public setInstances(transforms: Float32Array) {
    this.instanceCount = transforms.length / 16;
    
    if (!this.instanceBuffer) {
      this.instanceBuffer = this.gl.createBuffer();
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, transforms, this.gl.STATIC_DRAW);
    
    // We assume VAO is bound in the render loop or setup phase
    // Here we would set up the attribute pointers for the matrix columns
    // Attributes 4, 5, 6, 7 usually reserved for instance matrix
  }

  /**
   * Returns the GLSL Vertex Shader code for Wind Animation.
   * vertex.y is used as a mask (0 = bottom/root, 1 = top/tip).
   * Roots don't move, tips move maximum amount.
   */
  public getWindShaderVertex(): string {
    return `
      uniform float uTime;
      uniform vec2 uWindDirection;
      uniform float uWindStrength;
      uniform vec3 uPlayerPosition;
      
      vec3 applyWind(vec3 position, vec3 worldPos) {
        // 1. Global Wind Sway
        // Simple sine wave based on time and world position for variety
        float sway = sin(uTime * 2.0 + worldPos.x * 0.5 + worldPos.z * 0.5);
        
        // Height mask: Assume UV.y or Position.y indicates height (0 to 1)
        // Ideally we pass a specific attribute or use UVs. 
        // Here assuming y=0 is ground.
        float heightMask = clamp(position.y, 0.0, 1.0); 
        
        vec3 windOffset = vec3(uWindDirection.x, 0.0, uWindDirection.y) * sway * uWindStrength * heightMask;
        
        // 2. Player Interaction (Bending)
        float dist = distance(worldPos, uPlayerPosition);
        float interactionRadius = 2.0;
        if (dist < interactionRadius) {
          vec3 pushDir = normalize(worldPos - uPlayerPosition);
          float pushFactor = (1.0 - dist / interactionRadius) * heightMask;
          windOffset += pushDir * pushFactor * 1.5; // Push away
          windOffset.y -= pushFactor * 0.5; // Push down
        }

        return position + windOffset;
      }
    `;
  }

  public render() {
    if (this.instanceCount === 0) return;
    
    // Setup Shader & Textures...
    // this.gl.useProgram(...)
    
    // Draw Instanced
    // this.gl.bindVertexArray(this.vao);
    // this.gl.drawElementsInstanced(this.gl.TRIANGLES, indexCount, this.gl.UNSIGNED_SHORT, 0, this.instanceCount);
  }
}
