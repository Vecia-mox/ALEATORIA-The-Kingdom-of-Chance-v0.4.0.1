
/**
 * TITAN ENGINE: COLOR GRADE
 * Applies "Diablo" style aesthetics: Cold Shadows, Warm Highlights, Grit.
 */

export class ColorGrade {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  
  // Settings
  public saturation: number = 0.8; // -0.2 relative to 1.0
  public contrast: number = 1.1;   // +0.1 relative to 1.0
  public tintShadows: Float32Array = new Float32Array([0.9, 0.9, 1.1]); // Cool Blue
  public tintHighlights: Float32Array = new Float32Array([1.05, 1.0, 0.95]); // Warm Orange

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.program = this.createProgram();
  }

  private createProgram(): WebGLProgram {
    const vs = `#version 300 es
      layout(location=0) in vec2 aPos;
      out vec2 vUv;
      void main() {
        vUv = aPos * 0.5 + 0.5;
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `;

    const fs = `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 FragColor;
      
      uniform sampler2D uTex;
      uniform float uSaturation;
      uniform float uContrast;
      uniform vec3 uTintShadows;
      uniform vec3 uTintHighlights;

      void main() {
        vec4 color = texture(uTex, vUv);
        vec3 c = color.rgb;

        // 1. Contrast
        c = (c - 0.5) * uContrast + 0.5;

        // 2. Saturation
        vec3 lumaWeights = vec3(0.299, 0.587, 0.114);
        float luma = dot(c, lumaWeights);
        c = mix(vec3(luma), c, uSaturation);

        // 3. Split Toning (Gothic Tint)
        // Shadows get blue, Highlights get orange
        float t = smoothstep(0.0, 1.0, luma);
        vec3 tint = mix(uTintShadows, uTintHighlights, t);
        c *= tint;

        // 4. Vignette (Subtle)
        vec2 uv = vUv - 0.5;
        float dist = length(uv);
        float vignette = smoothstep(0.8, 0.4, dist); // Darken corners
        c *= vignette;

        FragColor = vec4(c, color.a);
      }
    `;

    return this.compileShader(vs, fs);
  }

  public render(inputTex: WebGLTexture) {
    this.gl.useProgram(this.program);
    
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, inputTex);
    this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'uTex'), 0);
    
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'uSaturation'), this.saturation);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'uContrast'), this.contrast);
    this.gl.uniform3fv(this.gl.getUniformLocation(this.program, 'uTintShadows'), this.tintShadows);
    this.gl.uniform3fv(this.gl.getUniformLocation(this.program, 'uTintHighlights'), this.tintHighlights);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  private compileShader(vsSource: string, fsSource: string): WebGLProgram {
    const vs = this.gl.createShader(this.gl.VERTEX_SHADER)!;
    this.gl.shaderSource(vs, vsSource);
    this.gl.compileShader(vs);

    const fs = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
    this.gl.shaderSource(fs, fsSource);
    this.gl.compileShader(fs);

    const prog = this.gl.createProgram()!;
    this.gl.attachShader(prog, vs);
    this.gl.attachShader(prog, fs);
    this.gl.linkProgram(prog);
    
    return prog;
  }
}
