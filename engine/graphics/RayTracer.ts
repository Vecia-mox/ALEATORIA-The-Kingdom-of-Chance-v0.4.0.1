
/**
 * TITAN ENGINE: RAY TRACER (SSRT)
 * Implements Screen Space Reflections and Global Illumination via Ray Marching.
 */

export class RayTracer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private quadVao: WebGLVertexArrayObject | null = null;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.initShader();
    this.initQuad();
  }

  private initShader() {
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

      uniform sampler2D uGPosition;
      uniform sampler2D uGNormal;
      uniform sampler2D uGAlbedo; // Alpha contains Roughness
      uniform sampler2D uGDepth;
      
      uniform mat4 uProjection;
      uniform mat4 uView;
      uniform mat4 uInvProjection; // Inverse Projection to unproject UV to View Space

      const int MAX_STEPS = 64;
      const float MAX_DISTANCE = 50.0;
      const float THICKNESS = 0.5;

      vec3 getViewPosition(vec2 uv) {
        float depth = texture(uGDepth, uv).r;
        // Convert screen space (0..1, 0..1, 0..1) to NDC (-1..1)
        vec4 ndc = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 viewPos = uInvProjection * ndc;
        return viewPos.xyz / viewPos.w;
      }

      void main() {
        vec4 albedoSample = texture(uGAlbedo, vUv);
        vec3 albedo = albedoSample.rgb;
        float roughness = albedoSample.a;
        
        // Optimization: Don't trace for very rough surfaces (matte)
        if (roughness > 0.8) {
          FragColor = vec4(0.0);
          return;
        }

        vec3 viewPos = getViewPosition(vUv);
        vec3 normal = texture(uGNormal, vUv).xyz; // View Space Normal
        vec3 viewDir = normalize(viewPos); // Since camera is 0,0,0 in View Space
        
        // Calculate Reflection Vector
        vec3 reflectionDir = reflect(viewDir, normal);

        // --- RAY MARCHING ---
        vec3 rayPos = viewPos;
        vec3 stepDir = reflectionDir;
        float stepSize = 0.5; // Initial step size
        
        vec3 hitColor = vec3(0.0);
        float hitAlpha = 0.0;

        for(int i = 0; i < MAX_STEPS; i++) {
          rayPos += stepDir * stepSize;
          
          // Project rayPos to Screen UV
          vec4 projPos = uProjection * vec4(rayPos, 1.0);
          vec2 rayUv = (projPos.xy / projPos.w) * 0.5 + 0.5;
          
          if (rayUv.x < 0.0 || rayUv.x > 1.0 || rayUv.y < 0.0 || rayUv.y > 1.0) break; // Off screen

          // Sample Depth Buffer at this UV
          vec3 bufferPos = getViewPosition(rayUv);
          float depthDelta = rayPos.z - bufferPos.z; // View space Z is negative

          // Check Intersection: Ray is behind buffer surface but within thickness
          if (depthDelta < 0.0 && depthDelta > -THICKNESS) {
             // HIT!
             // Fade edges
             float edgeFade = 1.0 - pow(length(rayUv * 2.0 - 1.0), 4.0);
             hitColor = texture(uGAlbedo, rayUv).rgb;
             hitAlpha = 1.0 * edgeFade * (1.0 - roughness);
             break;
          }
        }

        FragColor = vec4(hitColor, hitAlpha);
      }
    `;
    
    // Shader compilation logic assumed (this.program = createProgram(vs, fs))
  }

  private initQuad() {
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    this.quadVao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.quadVao);
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
  }

  public render(gBuffer: any, camera: any) {
    if (!this.program || !this.quadVao) return;

    this.gl.useProgram(this.program);
    this.gl.bindVertexArray(this.quadVao);

    // Bind Textures
    this.bindTexture(gBuffer.depth, 0, 'uGDepth');
    this.bindTexture(gBuffer.normal, 1, 'uGNormal');
    this.bindTexture(gBuffer.albedo, 2, 'uGAlbedo');

    // Uniforms
    // setUniformMatrix4fv('uProjection', camera.projectionMatrix);
    // setUniformMatrix4fv('uInvProjection', camera.inverseProjectionMatrix);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  private bindTexture(tex: WebGLTexture, unit: number, name: string) {
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
    const loc = this.gl.getUniformLocation(this.program!, name);
    this.gl.uniform1i(loc, unit);
  }
}
