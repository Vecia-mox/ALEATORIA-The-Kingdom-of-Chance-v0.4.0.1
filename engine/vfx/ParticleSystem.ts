
import * as THREE from 'three';
import { VFXFactory } from './VFXFactory';

export interface ParticleEmitterConfig {
  maxParticles: number;
  spawnRate: number;
  lifeTime: [number, number];
  speed: [number, number];
  colorStart: number[];
  colorEnd: number[];
  sizeStart: number;
  sizeEnd: number;
  textureId: string;
}

/**
 * Handles the "Aura Embers" floating around the player.
 * Also acts as a static bridge for legacy VFX calls.
 */
export class ParticleSystem {
    private particles: THREE.Points;
    private geometry: THREE.BufferGeometry;
    private count = 40;
    
    // Static Scene Reference for spawning isolated particles
    private static scene: THREE.Scene;

    constructor(parentOrConfig: THREE.Object3D | ParticleEmitterConfig) {
        if (parentOrConfig instanceof THREE.Object3D) {
            // Aura Mode (Attached to Hero Mesh)
            this.geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(this.count * 3);
            
            // Initialize random positions in a cylinder around player
            for (let i = 0; i < this.count; i++) {
                this.respawnParticle(positions, i);
                // Pre-warm height to fill volume
                positions[i * 3 + 1] = Math.random() * 2.0;
            }
            
            this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const material = new THREE.PointsMaterial({
                color: 0xFFAA00, // Fire Orange
                size: 0.15,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            
            this.particles = new THREE.Points(this.geometry, material);
            this.particles.position.set(0, 0, 0); // Local to parent
            parentOrConfig.add(this.particles);
        }
    }
    
    private respawnParticle(positions: Float32Array, i: number) {
        const r = Math.random() * 0.6; // Radius 0.6
        const angle = Math.random() * Math.PI * 2;
        
        positions[i * 3] = Math.cos(angle) * r;     // X
        positions[i * 3 + 1] = 0.2 + Math.random() * 0.5; // Y (Start near feet/waist)
        positions[i * 3 + 2] = Math.sin(angle) * r; // Z
    }
    
    public static init(scene: THREE.Scene) {
        this.scene = scene;
    }

    public update(dt: number) {
        if (this.particles && this.geometry && this.geometry.attributes.position) {
            const positions = this.geometry.attributes.position.array as Float32Array;
            
            for (let i = 0; i < this.count; i++) {
                // Float Up
                positions[i * 3 + 1] += 1.5 * dt;
                
                // Spiral / Turbulence
                const angle = Date.now() * 0.001 + i;
                positions[i * 3] += Math.cos(angle) * 0.01;
                positions[i * 3 + 2] += Math.sin(angle) * 0.01;

                // Respawn if too high
                if (positions[i * 3 + 1] > 2.2) {
                    this.respawnParticle(positions, i);
                }
            }
            
            this.geometry.attributes.position.needsUpdate = true;
        }
    }

    public static spawnFootstep(pos: THREE.Vector3) {
        if (!this.scene) return;

        const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x888888, 
            transparent: true, 
            opacity: 0.4 
        });
        
        const dust = new THREE.Mesh(geometry, material);
        // Position at feet, slightly randomized
        dust.position.set(
            pos.x + (Math.random() - 0.5) * 0.3,
            0.1,
            pos.z + (Math.random() - 0.5) * 0.3
        );
        // Random rotation
        dust.rotation.set(Math.random(), Math.random(), Math.random());
        
        this.scene.add(dust);

        // Animate
        const animate = () => {
            if (!dust.parent) return;
            
            dust.position.y += 0.01;
            dust.scale.multiplyScalar(0.95);
            material.opacity -= 0.02;
            
            if (material.opacity <= 0) {
                this.scene.remove(dust);
                geometry.dispose();
                material.dispose();
            } else {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    public static spawn(type: string, pos: THREE.Vector3) {
        switch (type) {
            case 'BLOOD':
                VFXFactory.spawnBlood(pos);
                break;
            case 'EXPLOSION':
                VFXFactory.spawnDust(pos); 
                break;
            case 'LEVEL_UP':
                VFXFactory.spawnSpin(pos);
                break;
            case 'HEAL':
                VFXFactory.spawnHeal(pos);
                break;
            default:
                VFXFactory.spawnDust(pos);
                break;
        }
    }
}
