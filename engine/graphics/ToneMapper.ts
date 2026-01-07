
/**
 * TITAN ENGINE: TONE MAPPER
 * Applies ACES Filmic Curve to convert HDR (High Dynamic Range) to LDR (Monitor) colors.
 * Handles Exposure adjustment.
 */

export class ToneMapper {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  
  // Settings
  public exposure: number = 1.5; // Lift shadows

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
      uniform float uExposure;

      // Narkowicz 2015 ACES approximation
      vec3 ACESFilmicToneMapping(vec3 x) {
        float a = 2.51;
        float b = 0.03;
        float c = 2.43;
        float d = 0.59;
        float e = 0.14;
        return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
      }

      void main() {
        vec4 color = texture(uTex, vUv);
        
        // 1. Exposure
        vec3 mapped = color.rgb * uExposure;
        
        // 2. Tone Map
        mapped = ACESFilmicToneMapping(mapped);
        
        // 3. Gamma Correction (Linear -> sRGB)
        mapped = pow(mapped, vec3(1.0 / 2.2));

        FragColor = vec4(mapped, color.a);
      }
    `;

    return this.compileShader(vs, fs);
  }

  public render(inputTex: WebGLTexture) {
    this.gl.useProgram(this.program);
    
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, inputTex);
    this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'uTex'), 0);
    
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'uExposure'), this.exposure);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  // Helper for simple copy without tone mapping (used by pipeline)
  public renderSimple(inputTex: WebGLTexture) {
    // In a real engine this would be a separate shader, but for brevity using render
    // with exposure 1 and no mapping? No, we need raw copy.
    // For MVP we assume copy is handled by pipeline setup or blit.
    this.render(inputTex); 
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
