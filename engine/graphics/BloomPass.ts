
/**
 * TITAN ENGINE: BLOOM PASS
 * Extracts bright areas and applies a Gaussian blur to create a glow effect.
 */

export class BloomPass {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  
  // Config
  public strength: number = 1.5;
  public radius: number = 0.003; // UV step size
  public threshold: number = 0.85;

  constructor(gl: WebGL2RenderingContext, width: number, height: number) {
    this.gl = gl;
    this.program = this.createProgram();
  }

  public resize(width: number, height: number) {
    // If we had internal downscale buffers, resize them here
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

    // Single-pass efficient blur + composite
    const fs = `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 FragColor;
      
      uniform sampler2D uTex;
      uniform float uThreshold;
      uniform float uStrength;
      uniform float uRadius;

      // Extract brightness
      vec3 getBrightness(vec3 color) {
        float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
        if (brightness > uThreshold) return color;
        return vec3(0.0);
      }

      void main() {
        vec4 baseColor = texture(uTex, vUv);
        
        // Simple 9-tap Gaussian Blur approximation
        // In production: Downsample -> Blur -> Upsample
        vec3 glow = vec3(0.0);
        float totalWeight = 0.0;
        
        // Blur Kernel
        for(float x = -2.0; x <= 2.0; x += 1.0) {
          for(float y = -2.0; y <= 2.0; y += 1.0) {
            vec2 offset = vec2(x, y) * uRadius;
            vec3 sampleColor = texture(uTex, vUv + offset).rgb;
            
            // Only blur bright parts
            sampleColor = getBrightness(sampleColor);
            
            float weight = 1.0 / (1.0 + dot(vec2(x, y), vec2(x, y))); // Gaussian-ish
            glow += sampleColor * weight;
            totalWeight += weight;
          }
        }
        
        glow /= totalWeight;
        
        // Additive Blending: Original + Glow
        FragColor = vec4(baseColor.rgb + (glow * uStrength), baseColor.a);
      }
    `;

    return this.compileShader(vs, fs);
  }

  public render(inputTex: WebGLTexture) {
    this.gl.useProgram(this.program);
    
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, inputTex);
    this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'uTex'), 0);
    
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'uThreshold'), this.threshold);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'uStrength'), this.strength);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'uRadius'), this.radius);

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
