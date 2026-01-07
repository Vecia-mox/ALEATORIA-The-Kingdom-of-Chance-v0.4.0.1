
/**
 * TITAN ENGINE: MVP RENDERER
 * Zero-dependency WebGL2 renderer to verify GPU functionality.
 * Renders: Blue Background, Red Floor, Green Spinning Cube.
 */
export class TitanMVP {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private indexCount: number;
  private startTime: number;

  constructor(canvasId: string) {
    this.createCanvas(canvasId);
    this.initGL();
    this.initResources();
    this.startTime = performance.now();
  }

  private createCanvas(id: string) {
    // Try to find existing or create new
    let c = document.getElementById(id) as HTMLCanvasElement;
    if (!c) {
      c = document.createElement('canvas');
      c.id = id;
      document.body.appendChild(c);
    }
    // Force Fullscreen
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    this.canvas = c;
  }

  private initGL() {
    const gl = this.canvas.getContext('webgl2');
    if (!gl) {
      document.body.innerHTML = "<h1 style='color:red'>WebGL2 Not Supported</h1>";
      throw new Error("WebGL2 Not Supported");
    }
    this.gl = gl;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.enable(this.gl.DEPTH_TEST);
  }

  private initResources() {
    // 1. Shaders
    const vs = `#version 300 es
      layout(location=0) in vec3 aPos;
      layout(location=1) in vec3 aColor;
      uniform mat4 uMVP;
      out vec3 vColor;
      void main() {
        gl_Position = uMVP * vec4(aPos, 1.0);
        vColor = aColor;
      }
    `;
    const fs = `#version 300 es
      precision mediump float;
      in vec3 vColor;
      out vec4 FragColor;
      void main() {
        FragColor = vec4(vColor, 1.0);
      }
    `;
    this.program = this.createProgram(vs, fs);

    // 2. Geometry (Cube + Floor)
    // X, Y, Z, R, G, B
    const vertices = new Float32Array([
      // Green Cube (Center)
      -1, -1, -1,  0, 1, 0,
       1, -1, -1,  0, 1, 0,
       1,  1, -1,  0, 1, 0,
      -1,  1, -1,  0, 1, 0,
      -1, -1,  1,  0, 1, 0,
       1, -1,  1,  0, 1, 0,
       1,  1,  1,  0, 1, 0,
      -1,  1,  1,  0, 1, 0,

      // Red Floor (Large Quad)
      -10, -2, -10,  1, 0, 0,
       10, -2, -10,  1, 0, 0,
       10, -2,  10,  1, 0, 0,
      -10, -2,  10,  1, 0, 0,
    ]);

    // Indices for Triangles
    const indices = new Uint16Array([
      // Cube Front
      0, 1, 2, 2, 3, 0,
      // Cube Back
      4, 5, 6, 6, 7, 4,
      // Cube Top
      3, 2, 6, 6, 7, 3,
      // Cube Bottom
      4, 5, 1, 1, 0, 4,
      // Cube Right
      1, 5, 6, 6, 2, 1,
      // Cube Left
      4, 0, 3, 3, 7, 4,

      // Floor
      8, 9, 10, 10, 11, 8
    ]);

    this.indexCount = indices.length;

    // Buffers
    this.vao = this.gl.createVertexArray()!;
    this.gl.bindVertexArray(this.vao);

    const vbo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    const ebo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ebo);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

    // Attributes
    const FSIZE = vertices.BYTES_PER_ELEMENT;
    // Pos
    this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 6 * FSIZE, 0);
    this.gl.enableVertexAttribArray(0);
    // Color
    this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 6 * FSIZE, 3 * FSIZE);
    this.gl.enableVertexAttribArray(1);
  }

  public start() {
    const loop = () => {
      this.render();
      requestAnimationFrame(loop);
    };
    loop();
  }

  private render() {
    const gl = this.gl;
    const now = (performance.now() - this.startTime) * 0.001;

    // 1. Clear to Bright Blue
    gl.clearColor(0.0, 0.0, 1.0, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    // 2. Matrix Math (Perspective * View * Model)
    // Simple rotation logic manually to avoid math lib dependency
    const aspect = this.canvas.width / this.canvas.height;
    const fov = 45 * Math.PI / 180;
    const f = 1.0 / Math.tan(fov / 2);
    const near = 0.1, far = 100.0;
    
    // Projection Matrix
    const proj = [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) / (near - far), -1,
      0, 0, (2 * far * near) / (near - far), 0
    ];

    // View (Camera at z=10, y=5 looking at 0,0,0)
    const view = [
      1, 0, 0, 0,
      0, 0.89, -0.44, 0,
      0, 0.44, 0.89, 0,
      0, -2, -10, 1
    ];

    // Model (Rotate Y)
    const c = Math.cos(now);
    const s = Math.sin(now);
    const model = [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1
    ];

    // MVP = Proj * View * Model (Simplified: assume Identity view/model for floor, Rotate for cube)
    // We'll just do a dirty multiplication in shader or here. 
    // For MVP, let's just pass one matrix that works for the cube.
    
    // Multiply Proj * View * Model manually
    const mvp = this.multiplyMatrices(this.multiplyMatrices(proj, view), model);

    const uMVP = gl.getUniformLocation(this.program, 'uMVP');
    gl.uniformMatrix4fv(uMVP, false, new Float32Array(mvp));

    // Draw
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
  }

  private multiplyMatrices(a: number[], b: number[]): number[] {
    const out = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[i * 4 + k] * b[k * 4 + j]; // Note: Column-major logic might differ
        }
        out.push(sum);
      }
    }
    // Transpose for WebGL (Column Major)
    const res = new Array(16);
    for(let i=0; i<4; i++) for(let j=0; j<4; j++) res[i + j*4] = out[i*4 + j];
    return res;
  }

  private createProgram(vsSrc: string, fsSrc: string): WebGLProgram {
    const vs = this.gl.createShader(this.gl.VERTEX_SHADER)!;
    this.gl.shaderSource(vs, vsSrc);
    this.gl.compileShader(vs);
    if (!this.gl.getShaderParameter(vs, this.gl.COMPILE_STATUS)) console.error(this.gl.getShaderInfoLog(vs));

    const fs = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
    this.gl.shaderSource(fs, fsSrc);
    this.gl.compileShader(fs);
    if (!this.gl.getShaderParameter(fs, this.gl.COMPILE_STATUS)) console.error(this.gl.getShaderInfoLog(fs));

    const p = this.gl.createProgram()!;
    this.gl.attachShader(p, vs);
    this.gl.attachShader(p, fs);
    this.gl.linkProgram(p);
    return p;
  }
}
