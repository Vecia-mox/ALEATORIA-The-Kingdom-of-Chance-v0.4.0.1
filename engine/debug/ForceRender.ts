
/**
 * TITAN ENGINE: FORCE RENDER (DEBUG)
 * A raw WebGL fallback renderer. 
 * Renders a MAGENTA CUBE at (0,0,0) ignoring all lighting/shadows.
 * If you see this, the Engine & Context are working, but the Lighting/Camera might be broken.
 */

export class ForceRender {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private count: number = 0;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.initResources();
  }

  private initResources() {
    // 1. Unlit Shader (Magenta Output)
    const vs = `#version 300 es
      layout(location=0) in vec3 aPos;
      uniform mat4 uViewProj;
      uniform mat4 uModel;
      void main() {
        gl_Position = uViewProj * uModel * vec4(aPos, 1.0);
      }
    `;
    const fs = `#version 300 es
      precision highp float;
      out vec4 FragColor;
      void main() {
        FragColor = vec4(1.0, 0.0, 1.0, 1.0); // MAGENTA
      }
    `;

    this.program = this.createProgram(vs, fs);

    // 2. Cube Geometry (Simple Box)
    const vertices = new Float32Array([
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,
    ]);

    const indices = new Uint16Array([
      0, 1, 2, 0, 2, 3,    // Front
      4, 5, 6, 4, 6, 7,    // Back
      3, 2, 6, 3, 6, 5,    // Top
      0, 4, 7, 0, 7, 1,    // Bottom
      1, 7, 6, 1, 6, 2,    // Right
      4, 0, 3, 4, 3, 5     // Left
    ]);

    this.count = indices.length;

    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);

    const vbo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    const ebo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ebo);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);

    this.gl.bindVertexArray(null);
  }

  public render(viewProjMatrix: Float32Array) {
    if (!this.program || !this.vao) return;

    // Direct draw, bypassing deferred pipeline
    // Note: We don't clear screen here, we draw ON TOP of whatever TitanEngine rendered
    this.gl.useProgram(this.program);
    this.gl.bindVertexArray(this.vao);
    this.gl.disable(this.gl.DEPTH_TEST); // Always draw on top for debug

    // Identity Model Matrix (Center of World)
    const model = new Float32Array([
      1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      0,0,0,1
    ]);

    const locVP = this.gl.getUniformLocation(this.program, 'uViewProj');
    const locM = this.gl.getUniformLocation(this.program, 'uModel');

    this.gl.uniformMatrix4fv(locVP, false, viewProjMatrix);
    this.gl.uniformMatrix4fv(locM, false, model);

    this.gl.drawElements(this.gl.TRIANGLES, this.count, this.gl.UNSIGNED_SHORT, 0);
    
    this.gl.enable(this.gl.DEPTH_TEST); // Restore
  }

  private createProgram(vsSrc: string, fsSrc: string): WebGLProgram | null {
    const vs = this.gl.createShader(this.gl.VERTEX_SHADER)!;
    this.gl.shaderSource(vs, vsSrc);
    this.gl.compileShader(vs);
    if (!this.gl.getShaderParameter(vs, this.gl.COMPILE_STATUS)) {
      console.error('ForceRender VS Error:', this.gl.getShaderInfoLog(vs));
      return null;
    }

    const fs = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
    this.gl.shaderSource(fs, fsSrc);
    this.gl.compileShader(fs);
    if (!this.gl.getShaderParameter(fs, this.gl.COMPILE_STATUS)) {
      console.error('ForceRender FS Error:', this.gl.getShaderInfoLog(fs));
      return null;
    }

    const prog = this.gl.createProgram()!;
    this.gl.attachShader(prog, vs);
    this.gl.attachShader(prog, fs);
    this.gl.linkProgram(prog);
    
    return prog;
  }
}
