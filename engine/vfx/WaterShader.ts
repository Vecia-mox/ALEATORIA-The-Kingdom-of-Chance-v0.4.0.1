
/**
 * TITAN ENGINE: WATER SHADER
 * High-fidelity water with Depth Fade (Soft edges) and scrolling normals.
 * Must be rendered in the Forward Pass (Transparent).
 */

export class WaterShader {

  public static getVertexShader(): string {
    return `#version 300 es
      layout(location=0) in vec3 aPosition;
      layout(location=1) in vec2 aUv;
      
      uniform mat4 uModelMatrix;
      uniform mat4 uViewProjectionMatrix;
      uniform float uTime;
      
      out vec2 vUv;
      out vec4 vScreenPos;
      out vec3 vWorldPos;
      
      void main() {
        // Simple Wave Displacement
        vec3 pos = aPosition;
        pos.y += sin(pos.x * 0.5 + uTime) * 0.1;
        
        vec4 worldPos = uModelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;
        vUv = aUv;
        vScreenPos = uViewProjectionMatrix * worldPos;
        gl_Position = vScreenPos;
      }
    `;
  }

  public static getFragmentShader(): string {
    return `#version 300 es
      precision highp float;
      
      in vec2 vUv;
      in vec4 vScreenPos;
      in vec3 vWorldPos;
      
      uniform sampler2D uDepthTexture; // From G-Buffer
      uniform sampler2D uNormalMap;
      uniform float uTime;
      uniform vec3 uCameraPos;
      
      out vec4 FragColor;
      
      // Config
      const vec3 DEEP_COLOR = vec3(0.0, 0.05, 0.1); // Abyss Blue
      const vec3 SHALLOW_COLOR = vec3(0.0, 0.2, 0.3); // Teal
      const float FOAM_THRESHOLD = 0.5; // Depth units for foam
      
      // Helper to linearize depth
      float linearizeDepth(float d, float zNear, float zFar) {
          return zNear * zFar / (zFar + d * (zNear - zFar));
      }

      void main() {
        // 1. Calculate Screen Coordinates for Depth Sampling
        vec2 screenUV = (vScreenPos.xy / vScreenPos.w) * 0.5 + 0.5;
        
        // 2. Read Scene Depth
        float sceneDepthRaw = texture(uDepthTexture, screenUV).r;
        // Convert to linear world units (Approximation for MVP)
        // Ideally pass in near/far uniforms. Assuming 0.1 / 1000.0
        float sceneDepth = linearizeDepth(sceneDepthRaw, 0.1, 1000.0);
        
        // 3. Calculate Water Depth
        float waterDepth = distance(uCameraPos, vWorldPos); // Not technically depth, but dist
        // Better: gl_FragCoord.w is linear depth in view space
        float fragmentDepth = gl_FragCoord.w; // Linear View Depth
        
        // Difference between water surface and floor
        // Note: linearizeDepth needs to be calibrated to engine projection
        // For MVP, we use a simple visual diff based on sceneDepthRaw vs gl_FragCoord.z
        float depthDiff = (sceneDepthRaw - gl_FragCoord.z) * 200.0; // Scale up for visibility
        
        // 4. Color Mixing (Absorption)
        float alpha = clamp(depthDiff, 0.0, 1.0); // Transparent at shore
        vec3 waterColor = mix(SHALLOW_COLOR, DEEP_COLOR, alpha);
        
        // 5. Foam (Where depth difference is small)
        if (depthDiff < FOAM_THRESHOLD) {
           waterColor = mix(vec3(1.0), waterColor, depthDiff / FOAM_THRESHOLD);
        }
        
        // 6. Normal Mapping (Scrolling)
        vec2 scroll1 = vUv + vec2(uTime * 0.02, uTime * 0.01);
        vec2 scroll2 = vUv + vec2(-uTime * 0.01, uTime * 0.02);
        vec3 n1 = texture(uNormalMap, scroll1).rgb;
        vec3 n2 = texture(uNormalMap, scroll2).rgb;
        vec3 normal = normalize(n1 + n2);
        
        // Specular Highlight (Simple Phong)
        vec3 viewDir = normalize(uCameraPos - vWorldPos);
        vec3 lightDir = normalize(vec3(0.5, 1.0, 0.2)); // Sun
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        
        FragColor = vec4(waterColor + spec, 0.8 * alpha);
      }
    `;
  }
}
