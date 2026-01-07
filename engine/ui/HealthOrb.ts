
/**
 * TITAN ENGINE: HEALTH ORB
 * Renders a churning liquid effect in a WebGL canvas.
 */
export class HealthOrb {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  
  // Uniform Locations
  private uTime: WebGLUniformLocation;
  private uFill: WebGLUniformLocation;
  private uColor: WebGLUniformLocation;
  
  // State
  private targetFill: number = 1.0;
  private currentFill: number = 1.0;
  private time: number = 0;

  constructor(width: number = 120, height: number = 120) {
    this.createCanvas(width, height);
    this.initGL();
    this.startLoop();
  }

  private createCanvas(w: number, h: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = w;
    this.canvas.height = h;
    Object.assign(this.canvas.style, {
      position: 'absolute',
      top: '20px', left: '20px',
      width: `${w}px`, height: `${h}px`,
      borderRadius: '50%',
      border: '4px solid #44403c',
      boxShadow: '0 0 20px #000',
      zIndex: '5000',
      pointerEvents: 'none'
    });
    document.body.appendChild(this.canvas);
  }

  private initGL() {
    const gl = this.canvas.getContext('webgl');
    if (!gl) throw new Error("WebGL not supported for Orb");
    this.gl = gl;

    // --- SHADERS ---
    const vsSource = `
      attribute vec2 aPos;
      varying vec2 vUv;
      void main() {
        vUv = aPos * 0.5 + 0.5;
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uFill; // 0.0 to 1.0
      uniform vec3 uColor;

      void main() {
        // Circular Mask
        vec2 centered = vUv * 2.0 - 1.0;
        float dist = length(centered);
        if (dist > 1.0) discard;

        // Wave Math
        float wave = sin(vUv.x * 10.0 + uTime) * 0.05 + 
                     cos(vUv.x * 15.0 + uTime * 1.5) * 0.02;
        
        float level = uFill + wave;
        
        // Liquid
        if (vUv.y < level) {
          float depth = (level - vUv.y);
          vec3 col = uColor * (0.5 + depth * 0.8); // Gradient
          
          // Specular highlight on surface
          if (depth < 0.05) col += 0.2;
          
          gl_FragColor = vec4(col, 1.0);
        } else {
          // Empty glass
          gl_FragColor = vec4(0.1, 0.1, 0.1, 0.5);
        }

        // Rim Light (Glass effect)
        float rim = smoothstep(0.8, 1.0, dist);
        gl_FragColor.rgb += rim * 0.3;
      }
    `;

    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
    this.program = this.createProgram(vs, fs);

    // Geometry (Quad)
    const verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(this.program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    this.uTime = gl.getUniformLocation(this.program, 'uTime')!;
    this.uFill = gl.getUniformLocation(this.program, 'uFill')!;
    this.uColor = gl.getUniformLocation(this.program, 'uColor')!;
  }

  public setFill(pct: number) {
    this.targetFill = Math.max(0, Math.min(1, pct));
  }

  private startLoop() {
    const loop = () => {
      this.time += 0.05;
      
      // Lerp Fill
      this.currentFill += (this.targetFill - this.currentFill) * 0.1;

      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      this.gl.useProgram(this.program);
      this.gl.uniform1f(this.uTime, this.time);
      this.gl.uniform1f(this.uFill, this.currentFill);
      this.gl.uniform3f(this.uColor, 0.8, 0.1, 0.1); // Red

      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(loop);
    };
    loop();
  }

  private compileShader(type: number, src: string): WebGLShader {
    const s = this.gl.createShader(type)!;
    this.gl.shaderSource(s, src);
    this.gl.compileShader(s);
    return s;
  }

  private createProgram(vs: WebGLShader, fs: WebGLShader): WebGLProgram {
    const p = this.gl.createProgram()!;
    this.gl.attachShader(p, vs);
    this.gl.attachShader(p, fs);
    this.gl.linkProgram(p);
    return p;
  }
}
