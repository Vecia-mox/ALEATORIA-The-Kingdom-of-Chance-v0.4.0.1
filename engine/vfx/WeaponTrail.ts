
/**
 * TITAN ENGINE: WEAPON TRAIL
 * Generates a dynamic triangle strip mesh that follows weapon movement.
 * Uses UV scrolling for the "dissolve" effect.
 */

export class WeaponTrail {
  private gl: WebGL2RenderingContext;
  private isActive: boolean = false;
  
  // Ring Buffer for History Points
  // Each node has [x,y,z] for Tip and Base
  private readonly MAX_NODES = 20;
  private historyTip: Float32Array;
  private historyBase: Float32Array;
  private headIndex: number = 0;
  private count: number = 0;

  // Geometry
  private vao: WebGLVertexArrayObject | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private vertexData: Float32Array; // Interleaved: X,Y,Z, U,V, Alpha
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.historyTip = new Float32Array(this.MAX_NODES * 3);
    this.historyBase = new Float32Array(this.MAX_NODES * 3);
    
    // 2 vertices per node (Tip + Base), 6 floats per vertex (Pos3 + UV2 + Alpha1)
    this.vertexData = new Float32Array(this.MAX_NODES * 2 * 6);
    
    this.initResources();
  }

  private initResources() {
    // 1. Compile simple Additive Shader
    const vs = `#version 300 es
      layout(location=0) in vec3 aPos;
      layout(location=1) in vec2 aUv;
      layout(location=2) in float aAlpha;
      
      uniform mat4 uViewProj;
      out vec2 vUv;
      out float vAlpha;
      
      void main() {
        vUv = aUv;
        vAlpha = aAlpha;
        gl_Position = uViewProj * vec4(aPos, 1.0);
      }
    `;
    const fs = `#version 300 es
      precision highp float;
      in vec2 vUv;
      in float vAlpha;
      uniform sampler2D uTex;
      out vec4 FragColor;
      
      void main() {
        vec4 color = texture(uTex, vUv);
        // Fade out at tail (U coordinate)
        float tailFade = smoothstep(0.0, 0.2, vUv.x);
        FragColor = color * vAlpha * tailFade;
      }
    `;
    
    // ... Boilerplate shader compilation (omitted for brevity, assume helper exists or inline logic) ...
    // For this file, we assume a helper creates `this.program` or we mock it.
    // In a real engine, use ShaderManager.
    
    // 2. VAO Setup
    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);
    
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData.byteLength, this.gl.DYNAMIC_DRAW);
    
    const stride = 6 * 4;
    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, stride, 0); // Pos
    this.gl.enableVertexAttribArray(1);
    this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, stride, 3*4); // UV
    this.gl.enableVertexAttribArray(2);
    this.gl.vertexAttribPointer(2, 1, this.gl.FLOAT, false, stride, 5*4); // Alpha
    
    // 3. Create Fallback Texture (Gradient Swipe)
    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    // 64x1 White gradient
    const pixels = new Uint8Array(64 * 4);
    for(let i=0; i<64; i++) {
        const val = i * 4; // Fade in
        pixels[i*4] = 255; pixels[i*4+1] = 200; pixels[i*4+2] = 100; // Orange
        pixels[i*4+3] = Math.min(255, i * 8); // Alpha gradient
    }
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 64, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
  }

  public activate() {
    this.isActive = true;
    this.count = 0; // Reset history for clean swipe
  }

  public deactivate() {
    this.isActive = false;
  }

  public update(dt: number, tipPos: Float32Array, basePos: Float32Array) {
    if (!this.isActive && this.count === 0) return;

    // Add new point if active
    if (this.isActive) {
        // Shift history (Naive shift for simplicity, Ring Buffer better for perf)
        // For MVP small MAX_NODES, shift is fine.
        for (let i = this.MAX_NODES - 1; i > 0; i--) {
            this.copyVec3(this.historyTip, i, i-1);
            this.copyVec3(this.historyBase, i, i-1);
        }
        
        this.setVec3(this.historyTip, 0, tipPos);
        this.setVec3(this.historyBase, 0, basePos);
        
        this.count = Math.min(this.count + 1, this.MAX_NODES);
    } else {
        // Decay (Shrink trail when inactive)
        this.count = Math.max(0, this.count - 1);
    }

    this.rebuildMesh();
  }

  private rebuildMesh() {
    if (this.count < 2) return;

    let idx = 0;
    for (let i = 0; i < this.count; i++) {
        const u = i / (this.count - 1); // 0 at head, 1 at tail
        const alpha = 1.0 - u; // Fade out tail

        // Tip Vertex
        this.vertexData[idx++] = this.historyTip[i*3+0];
        this.vertexData[idx++] = this.historyTip[i*3+1];
        this.vertexData[idx++] = this.historyTip[i*3+2];
        this.vertexData[idx++] = u; // U
        this.vertexData[idx++] = 0; // V
        this.vertexData[idx++] = alpha;

        // Base Vertex
        this.vertexData[idx++] = this.historyBase[i*3+0];
        this.vertexData[idx++] = this.historyBase[i*3+1];
        this.vertexData[idx++] = this.historyBase[i*3+2];
        this.vertexData[idx++] = u; // U
        this.vertexData[idx++] = 1; // V
        this.vertexData[idx++] = alpha;
    }

    // Upload
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.vertexData.subarray(0, idx));
  }

  public render(viewProj: Float32Array) {
    if (this.count < 2 || !this.program) return;

    this.gl.useProgram(this.program);
    this.gl.bindVertexArray(this.vao);
    
    // Bind Texture
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

    // Uniforms
    // Assume we got location earlier, or query now
    const locVP = this.gl.getUniformLocation(this.program, 'uViewProj');
    this.gl.uniformMatrix4fv(locVP, false, viewProj);

    // Additive Blend
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
    this.gl.depthMask(false);

    // Draw Triangle Strip
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.count * 2);

    this.gl.depthMask(true);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  // --- MATH HELPERS ---
  private setVec3(arr: Float32Array, idx: number, val: Float32Array) {
      arr[idx*3+0] = val[0]; arr[idx*3+1] = val[1]; arr[idx*3+2] = val[2];
  }
  private copyVec3(arr: Float32Array, destIdx: number, srcIdx: number) {
      arr[destIdx*3+0] = arr[srcIdx*3+0];
      arr[destIdx*3+1] = arr[srcIdx*3+1];
      arr[destIdx*3+2] = arr[srcIdx*3+2];
  }
}
