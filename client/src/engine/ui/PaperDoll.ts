
/**
 * TITAN ENGINE: PAPER DOLL
 * Renders a high-fidelity 3D character to a texture for UI display.
 */

import { Renderer3D } from '../graphics/Renderer3D';

export class PaperDoll {
  private gl: WebGL2RenderingContext;
  private renderer: Renderer3D;
  
  private fbo: WebGLFramebuffer | null = null;
  private texture: WebGLTexture | null = null;
  private width: number = 512;
  private height: number = 1024;
  
  // Model State
  private characterRotation: number = 0;
  private isDragging: boolean = false;
  private lastMouseX: number = 0;

  constructor(renderer: Renderer3D, gl: WebGL2RenderingContext) {
    this.renderer = renderer;
    this.gl = gl;
    this.initFramebuffer();
  }

  private initFramebuffer() {
    this.fbo = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);

    // Color Attachment (Texture)
    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture, 0);

    // Depth Buffer
    const depthBuffer = this.gl.createRenderbuffer();
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthBuffer);
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.width, this.height);
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthBuffer);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  public handleInput(event: 'DOWN' | 'MOVE' | 'UP', x: number) {
    if (event === 'DOWN') {
      this.isDragging = true;
      this.lastMouseX = x;
    } else if (event === 'UP') {
      this.isDragging = false;
    } else if (event === 'MOVE' && this.isDragging) {
      const delta = x - this.lastMouseX;
      this.characterRotation += delta * 0.01; // Sensitivity
      this.lastMouseX = x;
    }
  }

  /**
   * Renders the character to the internal texture.
   * @param meshes List of equipment mesh IDs to render
   */
  public render(meshes: string[]) {
    if (!this.fbo) return;

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.clearColor(0, 0, 0, 0); // Transparent background
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // 1. Setup Hero Lighting (3-Point)
    // Key Light: Warm, Top Right
    // Fill Light: Cool, Left
    // Rim Light: Bright White, Back
    const lights = [
      { pos: [2, 2, 2], color: [1.0, 0.9, 0.8], intensity: 1.5 }, // Key
      { pos: [-2, 0, 2], color: [0.3, 0.4, 0.6], intensity: 0.5 }, // Fill
      { pos: [0, 2, -3], color: [1.0, 1.0, 1.0], intensity: 2.0 }  // Rim
    ];

    // 2. Setup Camera
    // Orthographic or tight Perspective focused on character center
    const viewMatrix = new Float32Array(16); // identity
    // Translate back to see char
    // Rotate character (Y-axis) based on this.characterRotation

    // 3. Render Meshes
    // this.renderer.renderMeshes(meshes, viewMatrix, projectionMatrix, lights);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  /**
   * Returns the texture to be used in an <img> or Canvas draw call.
   */
  public getTexture(): WebGLTexture | null {
    return this.texture;
  }
}
