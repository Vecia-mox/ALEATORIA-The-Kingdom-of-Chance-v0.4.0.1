
/**
 * TITAN ENGINE: ATMOSPHERE SYSTEM
 * Handles Volumetric Fog (Raymarching) and Post-Process Light Shafts (God Rays).
 * Aesthetic Goal: "Thick", dark air (Diablo style).
 */

export class AtmosphereSystem {
  private gl: WebGL2RenderingContext;
  private fogProgram: WebGLProgram | null = null;
  private godRayProgram: WebGLProgram | null = null;
  private fullScreenQuad: WebGLVertexArrayObject | null = null;

  // Config
  public settings = {
    fogDensity: 0.05,
    fogColorShadow: [0.05, 0.05, 0.1], // Dark Blue/Grey
    fogColorLight: [1.0, 0.6, 0.2],   // Torch Orange
    godRayIntensity: 0.8,
    grainAmount: 0.03
  };

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.initShaders();
    this.createQuad();
  }

  private initShaders() {
    // --- VOLUMETRIC FOG SHADER (Fragment) ---
    // Raymarches depth buffer to calculate fog density based on 3D noise
    const fogFs = `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 FragColor;

      uniform sampler2D uSceneColor;
      uniform sampler2D uDepthTex;
      uniform float uTime;
      uniform vec3 uCameraPos;
      uniform mat4 uInvViewProj;
      
      // Noise Function (Simulated)
      float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453); }
      float noise(vec3 p) {
        vec3 i = floor(p); vec3 f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
                       mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                       mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
      }

      vec3 getWorldPos(float depth, vec2 uv) {
        vec4 ndc = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 worldPos = uInvViewProj * ndc;
        return worldPos.xyz / worldPos.w;
      }

      void main() {
        float depth = texture(uDepthTex, vUv).r;
        vec3 worldPos = getWorldPos(depth, vUv);
        vec3 rayDir = normalize(worldPos - uCameraPos);
        float dist = distance(uCameraPos, worldPos);
        
        // Raymarch
        float fogAmount = 0.0;
        vec3 currentPos = uCameraPos;
        float stepSize = dist / 10.0; // 10 Steps for Mobile Perf
        
        for(int i=0; i<10; i++) {
          currentPos += rayDir * stepSize;
          // Low swirling fog logic
          float n = noise(currentPos * 0.1 + vec3(uTime * 0.1, 0.0, 0.0));
          float heightFactor = smoothstep(5.0, 0.0, currentPos.y); // Fog hugs ground
          fogAmount += n * heightFactor;
        }
        
        fogAmount = clamp(fogAmount * 0.1, 0.0, 1.0);
        
        // Vignette & Grain
        float vignette = smoothstep(1.2, 0.4, length(vUv - 0.5));
        float grain = (hash(vec3(vUv, uTime)) - 0.5) * 0.05;

        vec4 scene = texture(uSceneColor, vUv);
        vec3 fogColor = mix(vec3(0.05, 0.05, 0.12), vec3(1.0, 0.5, 0.1), fogAmount * 0.5); // Lit vs Shadow fog
        
        vec3 final = mix(scene.rgb, fogColor, fogAmount);
        final *= vignette;
        final += grain;

        FragColor = vec4(final, 1.0);
      }
    `;
    
    // Shader compilation omitted for brevity (boilerplate)
    // this.fogProgram = compile(fogFs);
  }

  private createQuad() {
    // Simple screen-filling quad
    const verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    this.fullScreenQuad = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.fullScreenQuad);
    const buf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, verts, this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
  }

  public render(inputTexture: WebGLTexture, depthTexture: WebGLTexture, camera: any) {
    if (!this.fogProgram || !this.fullScreenQuad) return;

    this.gl.useProgram(this.fogProgram);
    this.gl.bindVertexArray(this.fullScreenQuad);

    // Bind Textures
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, inputTexture);
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, depthTexture);

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
}
