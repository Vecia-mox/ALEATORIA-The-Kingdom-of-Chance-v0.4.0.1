
/**
 * TITAN ENGINE: WIREFRAME DEBUGGER
 * Forces the renderer to draw green lines instead of textured triangles.
 * Helps identify if objects are present but unlit/untextured.
 */

export class WireframeMode {
  public static ACTIVE: boolean = false;

  // Simple Unlit Green Shader
  public static readonly VERTEX_SHADER = `#version 300 es
    layout(location=0) in vec3 aPosition;
    uniform mat4 uModelMatrix;
    uniform mat4 uViewProjectionMatrix;
    
    void main() {
      gl_Position = uViewProjectionMatrix * uModelMatrix * vec4(aPosition, 1.0);
    }
  `;

  public static readonly FRAGMENT_SHADER = `#version 300 es
    precision highp float;
    out vec4 FragColor;
    void main() {
      FragColor = vec4(0.0, 1.0, 0.0, 1.0); // Neon Green
    }
  `;

  public static program: WebGLProgram | null = null;

  /**
   * Initializes the debug shader.
   */
  public static init(gl: WebGL2RenderingContext) {
    if (this.program) return;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, this.VERTEX_SHADER);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, this.FRAGMENT_SHADER);
    gl.compileShader(fs);

    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
  }

  /**
   * Toggles the mode.
   */
  public static toggle() {
    this.ACTIVE = !this.ACTIVE;
    console.log(`[Debug] Wireframe Mode: ${this.ACTIVE ? 'ON' : 'OFF'}`);
  }
}
