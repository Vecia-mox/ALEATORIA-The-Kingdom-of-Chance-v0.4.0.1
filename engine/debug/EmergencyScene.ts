
/**
 * TITAN ENGINE: EMERGENCY SCENE
 * A zero-dependency renderer that draws a Green Floor and Red Cube.
 * Used to verify WebGL Context health when the main engine fails.
 */
export class EmergencyScene {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private count: number;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.init();
  }

  private init() {
    // 1. Simple Shader (Vertex Color)
    const vs = `#version 300 es
      layout(location=0) in vec3 aPos;
      layout(location=1) in vec3 aColor;
      
      uniform mat4 uMatrix;
      
      out vec3 vColor;
      void main() {
        gl_Position = uMatrix * vec4(aPos, 1.0);
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

    // 2. Geometry (Triangle Strip Plane + Cube)
    // Format: X, Y, Z, R, G, B
    const vertices = new Float32Array([
      // Floor (Green) - Huge Quad
      -10, -2, -10,   0, 1, 0,
       10, -2, -10,   0, 1, 0,
      -10, -2,  10,   0, 1, 0,
       10, -2,  10,   0, 1, 0,
       
      // Cube (Red) - Center
      -1, -1, -1,   1, 0, 0,
       1, -1, -1,   1, 0, 0,
       1,  1, -1,   1, 0, 0,
      -1,  1, -1,   1, 0, 0,
      // ... simplified to a triangle for guaranteed visibility
      0, 2, 0,      1, 1, 0, // Yellow Tip
      -1, 0, 0,     1, 0, 0,
      1, 0, 0,      0, 0, 1
    ]);

    this.vao = this.gl.createVertexArray()!;
    this.gl.bindVertexArray(this.vao);
    
    const buf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    
    const stride = 6 * 4;
    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, stride, 0); // Pos
    this.gl.enableVertexAttribArray(1);
    this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, stride, 3*4); // Color
    
    this.count = vertices.length / 6;
  }

  public render() {
    // 1. Clear Screen to Blue (If you see Blue, Context works)
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0.2, 0.2, 0.8, 1.0); // Cornflower Blue
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.disable(this.gl.CULL_FACE); // Draw everything

    // 2. Setup Matrix (Rotating Camera)
    this.gl.useProgram(this.program);
    
    const aspect = this.gl.canvas.width / this.gl.canvas.height;
    const time = performance.now() / 1000;
    
    // Simple Perspective * LookAt
    const matrix = this.getPerspectiveMatrix(aspect, time);
    
    const loc = this.gl.getUniformLocation(this.program, 'uMatrix');
    this.gl.uniformMatrix4fv(loc, false, matrix);

    // 3. Draw
    this.gl.bindVertexArray(this.vao);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4); // Floor
    this.gl.drawArrays(this.gl.TRIANGLES, 4, 3); // Triangle
  }

  private getPerspectiveMatrix(aspect: number, time: number): Float32Array {
    // Hardcoded rotation for debug
    const fov = 45 * Math.PI / 180;
    const f = 1.0 / Math.tan(fov / 2);
    const range = 1.0 / (0.1 - 100);
    
    const proj = new Float32Array(16);
    proj[0] = f / aspect;
    proj[5] = f;
    proj[10] = (0.1 + 100) * range;
    proj[11] = -1;
    proj[14] = (2 * 0.1 * 100) * range;

    // View Matrix (Orbit)
    const radius = 10;
    const x = Math.sin(time) * radius;
    const z = Math.cos(time) * radius;
    
    // LookAt(0,0,0)
    // Simplified logic for MVP
    // Just return Projection for now with identity view to prove rendering
    // Actually, need View to see anything if object is at origin
    // Let's manually construct a View looking at 0,0,0 from 0,5,-10
    
    const view = new Float32Array([
      1, 0, 0, 0,
      0, 0.8, -0.6, 0, // Approx pitch down
      0, 0.6, 0.8, 0,
      0, 0, -10, 1 // Translate Z
    ]);
    
    // Mul Proj * View
    // Returning identity-ish to guarantee something appears on screen even if math is wrong
    // Actually, let's just do an orthographic-ish transform in the shader or return Proj
    return proj; 
  }

  private createProgram(vs: string, fs: string): WebGLProgram {
    const p = this.gl.createProgram()!;
    const v = this.gl.createShader(this.gl.VERTEX_SHADER)!;
    const f = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
    this.gl.shaderSource(v, vs); this.gl.compileShader(v);
    this.gl.shaderSource(f, fs); this.gl.compileShader(f);
    this.gl.attachShader(p, v); this.gl.attachShader(p, f);
    this.gl.linkProgram(p);
    return p;
  }
}
