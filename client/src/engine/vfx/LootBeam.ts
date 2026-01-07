
/**
 * TITAN ENGINE: LOOT BEAM SYSTEM
 * Renders vertical light shafts and particle swirls for dropped items.
 */

import { ParticleSystem } from './ParticleSystem'; // Assuming existing
import { Renderer3D } from '../graphics/Renderer3D';

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY' | 'UNIQUE';

interface BeamInstance {
  id: string;
  position: Float32Array; // x, y, z
  color: Float32Array;    // r, g, b, a
  height: number;
  width: number;
  particles?: ParticleSystem;
}

export class LootBeamSystem {
  private gl: WebGL2RenderingContext;
  private renderer: Renderer3D;
  private beams: Map<string, BeamInstance> = new Map();
  private program: WebGLProgram | null = null;
  
  // Geometry (Cylinder)
  private vao: WebGLVertexArrayObject | null = null;
  private indexCount: number = 0;

  private readonly RARITY_COLORS: Record<Rarity, number[]> = {
    'COMMON': [1.0, 1.0, 1.0],       // White
    'UNCOMMON': [0.1, 1.0, 0.1],     // Green
    'RARE': [0.2, 0.2, 1.0],         // Blue
    'LEGENDARY': [1.0, 0.5, 0.0],    // Orange
    'UNIQUE': [0.8, 0.4, 0.8]        // Purple
  };

  constructor(renderer: Renderer3D, gl: WebGL2RenderingContext) {
    this.renderer = renderer;
    this.gl = gl;
    this.initShader();
    this.initGeometry();
  }

  private initShader() {
    const vs = `#version 300 es
      layout(location=0) in vec3 aPos;
      layout(location=1) in vec2 aUv;
      
      uniform mat4 uViewProj;
      uniform vec3 uWorldPos;
      uniform float uHeight;
      uniform float uWidth;
      
      out vec2 vUv;
      out float vHeightGradient;

      void main() {
        vUv = aUv;
        vHeightGradient = aPos.y; // 0 at bottom, 1 at top
        
        vec3 localPos = aPos;
        localPos.x *= uWidth;
        localPos.z *= uWidth;
        localPos.y *= uHeight;
        
        gl_Position = uViewProj * vec4(localPos + uWorldPos, 1.0);
      }
    `;

    const fs = `#version 300 es
      precision highp float;
      
      in vec2 vUv;
      in float vHeightGradient;
      
      uniform vec4 uColor;
      uniform float uTime;
      
      out vec4 FragColor;

      // Simple noise function
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

      void main() {
        // Scrolling vertical texture effect
        float noise = hash(vUv * 10.0 + vec2(0.0, uTime * 2.0));
        
        // Alpha fade at top and bottom
        float alpha = smoothstep(0.0, 0.2, vHeightGradient) * (1.0 - smoothstep(0.7, 1.0, vHeightGradient));
        
        // Core beam intensity
        float core = 1.0 - abs(vUv.x - 0.5) * 2.0;
        core = pow(core, 3.0);

        vec3 finalColor = uColor.rgb + (noise * 0.2);
        FragColor = vec4(finalColor, alpha * core * uColor.a);
      }
    `;
    
    // Shader compilation assumed helper or inline logic
    // this.program = createProgram(gl, vs, fs);
  }

  private initGeometry() {
    // Generate Cylinder Mesh (Open ended)
    const segments = 16;
    const verts = [];
    const indices = [];
    
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta);
      const z = Math.sin(theta);
      
      // Bottom Ring (y=0)
      verts.push(x, 0, z, i/segments, 0);
      // Top Ring (y=1)
      verts.push(x, 1, z, i/segments, 1);
    }

    for (let i = 0; i < segments; i++) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }

    this.indexCount = indices.length;
    // VAO Setup logic...
  }

  public spawnBeam(id: string, x: number, y: number, z: number, rarity: Rarity) {
    if (rarity === 'COMMON') return; // No beam for trash

    const color = this.RARITY_COLORS[rarity];
    const isLegendary = rarity === 'LEGENDARY' || rarity === 'UNIQUE';

    const beam: BeamInstance = {
      id,
      position: new Float32Array([x, y, z]),
      color: new Float32Array([...color, isLegendary ? 1.0 : 0.6]), // Higher alpha for legendary
      height: isLegendary ? 20.0 : 5.0,
      width: isLegendary ? 0.8 : 0.4
    };

    if (isLegendary) {
      // Add Particle System for swirls
      // beam.particles = new ParticleSystem({...});
      // Play Sound
      // AudioSystem.play3D('legendary_drop', x, y, z);
    }

    this.beams.set(id, beam);
  }

  public removeBeam(id: string) {
    this.beams.delete(id);
  }

  public render(viewProj: Float32Array, dt: number) {
    if (!this.program) return;

    this.gl.useProgram(this.program);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE); // Additive Blending
    this.gl.depthMask(false); // Don't write to depth buffer (transparency)

    // Bind VAO
    // ...

    const time = performance.now() / 1000;

    this.beams.forEach(beam => {
      // Uniforms
      // uViewProj, uWorldPos, uHeight, uWidth, uColor, uTime
      
      // Draw Call
      // gl.drawElements(...)
      
      // Update Particles if any
      if (beam.particles) {
        beam.particles.update(dt);
        // beam.particles.render(...)
      }
    });

    this.gl.depthMask(true);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }
}
