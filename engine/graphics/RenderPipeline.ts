
/**
 * TITAN ENGINE: RENDER PIPELINE (POST-PROCESSING)
 * Manages the "Ping-Pong" texture swapping mechanism to apply sequential effects.
 */

import { ToneMapper } from './ToneMapper';
import { BloomPass } from './BloomPass';
import { ColorGrade } from './ColorGrade';

export class RenderPipeline {
  private gl: WebGL2RenderingContext;
  private width: number;
  private height: number;

  // Framebuffers for "Ping-Pong" rendering (Reading from one, writing to other)
  private readFBO: WebGLFramebuffer;
  private writeFBO: WebGLFramebuffer;
  private readTex: WebGLTexture;
  private writeTex: WebGLTexture;

  // Full Screen Quad
  private quadVao: WebGLVertexArrayObject;

  // Passes
  private bloomPass: BloomPass;
  private colorGradePass: ColorGrade;
  private toneMapPass: ToneMapper;

  constructor(gl: WebGL2RenderingContext, width: number, height: number) {
    this.gl = gl;
    this.width = width;
    this.height = height;

    this.initFramebuffers();
    this.initQuad();

    // Initialize Effects
    this.bloomPass = new BloomPass(gl, width, height);
    this.colorGradePass = new ColorGrade(gl);
    this.toneMapPass = new ToneMapper(gl);
  }

  private initFramebuffers() {
    this.readFBO = this.gl.createFramebuffer()!;
    this.writeFBO = this.gl.createFramebuffer()!;
    this.readTex = this.createTexture();
    this.writeTex = this.createTexture();

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.readFBO);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.readTex, 0);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.writeFBO);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.writeTex, 0);
    
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  private createTexture(): WebGLTexture {
    const tex = this.gl.createTexture()!;
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
    // RGBA16F for High Dynamic Range support before Tone Mapping
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA16F, this.width, this.height, 0, this.gl.RGBA, this.gl.HALF_FLOAT, null);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    return tex;
  }

  private initQuad() {
    const verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    this.quadVao = this.gl.createVertexArray()!;
    this.gl.bindVertexArray(this.quadVao);
    const buf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, verts, this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.bindVertexArray(null);
  }

  /**
   * Resizes internal buffers. Call when window resizes.
   */
  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.readTex);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA16F, width, height, 0, this.gl.RGBA, this.gl.HALF_FLOAT, null);
    
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.writeTex);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA16F, width, height, 0, this.gl.RGBA, this.gl.HALF_FLOAT, null);

    this.bloomPass.resize(width, height);
  }

  private swap() {
    const tempFBO = this.readFBO;
    this.readFBO = this.writeFBO;
    this.writeFBO = tempFBO;

    const tempTex = this.readTex;
    this.readTex = this.writeTex;
    this.writeTex = tempTex;
  }

  /**
   * Main entry point. Takes the raw scene render and runs it through the stack.
   * @param inputTexture The texture containing the raw 3D scene render.
   */
  public render(inputTexture: WebGLTexture) {
    this.gl.bindVertexArray(this.quadVao);
    this.gl.disable(this.gl.DEPTH_TEST); // Post-processing is 2D only

    // 1. Copy Input -> Read Buffer (Start of Chain)
    // We could render directly to readFBO in the main renderer, but copying allows flexibility
    // Optimization: If main renderer writes to readFBO, we skip this. 
    // For now, assuming inputTexture is external.
    this.copyTexture(inputTexture, this.readFBO);

    // 2. BLOOM PASS (Glow)
    // Reads current ReadTex, processes internally, composites back
    // Since Bloom is additive, we can render it into WriteFBO composited with ReadTex
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.writeFBO);
    this.bloomPass.render(this.readTex); // Renders scene + glow
    this.swap();

    // 3. COLOR GRADE (Gothic Tint)
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.writeFBO);
    this.colorGradePass.render(this.readTex);
    this.swap();

    // 4. TONE MAPPING (Output to Screen)
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null); // Back to Screen
    this.toneMapPass.render(this.readTex);
  }

  private copyTexture(source: WebGLTexture, destFBO: WebGLFramebuffer) {
    // Simple blit
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, destFBO);
    // Use a simple shader or framebuffer blit if dimensions match
    // Using BloomPass's simple copy logic for now or a basic shader
    this.toneMapPass.renderSimple(source); 
  }
}
