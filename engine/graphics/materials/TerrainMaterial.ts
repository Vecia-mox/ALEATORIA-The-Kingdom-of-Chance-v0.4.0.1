
/**
 * TITAN ENGINE: TERRAIN MATERIAL
 * Tri-Planar Shader to texture vertical cliffs and ground without UV stretching.
 */

export class TerrainMaterial {
  
  public static getVertexShader(): string {
    return `#version 300 es
      layout(location=0) in vec3 aPosition;
      layout(location=1) in vec3 aNormal;
      
      uniform mat4 uModelMatrix;
      uniform mat4 uViewProjectionMatrix;
      
      out vec3 vWorldPos;
      out vec3 vNormal;
      
      void main() {
        vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
        vWorldPos = worldPos.xyz;
        vNormal = normalize(mat3(uModelMatrix) * aNormal);
        gl_Position = uViewProjectionMatrix * worldPos;
      }
    `;
  }

  public static getFragmentShader(): string {
    return `#version 300 es
      precision highp float;
      
      in vec3 vWorldPos;
      in vec3 vNormal;
      
      // Textures
      uniform sampler2D uSplatMap; // R=Mud, G=Path, B=Puddle
      uniform sampler2D uTexMud;
      uniform sampler2D uTexPath;
      uniform sampler2D uTexRock;
      
      // Config
      uniform float uScale; // Texture Tiling
      
      // G-Buffer Outputs
      layout(location = 0) out vec4 gPosition;
      layout(location = 1) out vec4 gNormal;
      layout(location = 2) out vec4 gAlbedo;

      vec3 triplanarSample(sampler2D tex, vec3 worldPos, vec3 normal) {
        vec3 blend = abs(normal);
        blend /= (blend.x + blend.y + blend.z);
        
        vec3 xColor = texture(tex, worldPos.yz * uScale).rgb;
        vec3 yColor = texture(tex, worldPos.xz * uScale).rgb;
        vec3 zColor = texture(tex, worldPos.xy * uScale).rgb;
        
        return xColor * blend.x + yColor * blend.y + zColor * blend.z;
      }

      void main() {
        // 1. Calculate Splat Weights (Based on World Pos for demo, usually texture)
        // Simple noise logic for blending if no actual splat texture is bound
        float pathWeight = 0.0; // Placeholder
        
        // 2. Sample Textures
        vec3 mud = triplanarSample(uTexMud, vWorldPos, vNormal);
        vec3 rock = triplanarSample(uTexRock, vWorldPos, vNormal);
        
        // 3. Slope Blending (Cliffs become Rock)
        float slope = 1.0 - abs(dot(vNormal, vec3(0, 1, 0))); // 0=Flat, 1=Vertical
        float rockFactor = smoothstep(0.3, 0.7, slope);
        
        vec3 finalColor = mix(mud, rock, rockFactor);
        
        // 4. Output to G-Buffer
        gPosition = vec4(vWorldPos, 1.0); // Alpha = Roughness (1.0 = Matte)
        gNormal = vec4(normalize(vNormal), 0.0); // Alpha = Metalness
        gAlbedo = vec4(finalColor, 1.0); // Alpha = AO
      }
    `;
  }
}
