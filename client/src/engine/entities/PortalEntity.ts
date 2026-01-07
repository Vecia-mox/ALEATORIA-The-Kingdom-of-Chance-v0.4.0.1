
import * as THREE from 'three';

export class PortalEntity {
    public mesh: THREE.Group;
    private particles: THREE.Points;
    private particleData: { angle: number, radius: number, speed: number, y: number, colorIndex: number }[] = [];
    private light: THREE.PointLight;
    public active: boolean = true;

    constructor(scene: THREE.Scene, x: number, z: number) {
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 0, z);

        // 1. Frame (Obsidian Torus)
        const frameGeo = new THREE.TorusGeometry(1.5, 0.2, 16, 32);
        const frameMat = new THREE.MeshStandardMaterial({ 
            color: 0x111111, 
            roughness: 0.1, 
            metalness: 0.9 
        });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.y = 1.5; 
        this.mesh.add(frame);

        // 2. Core (Event Horizon - Black Void)
        const coreGeo = new THREE.CircleGeometry(1.4, 32);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 1.5;
        this.mesh.add(core);

        // 3. Cosmic Particles (The Vortex - Red/Black Theme)
        this.createParticles();
        this.mesh.add(this.particles);

        // 4. The Glow (Pulsing Red)
        this.light = new THREE.PointLight(0xFF0000, 3.0, 10.0);
        this.light.position.set(0, 1.5, 0.5);
        this.mesh.add(this.light);

        scene.add(this.mesh);
    }

    private createParticles() {
        const count = 300;
        const geo = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        
        // Palette: Blood Red, Deep Red, Orange, Void Purple
        const palette = [
            new THREE.Color(0x880000), 
            new THREE.Color(0xFF0000), 
            new THREE.Color(0xFF4400), 
            new THREE.Color(0x330000)
        ];

        for(let i=0; i<count; i++) {
            positions.push(0,0,0);
            
            const col = palette[Math.floor(Math.random() * palette.length)];
            colors.push(col.r, col.g, col.b);
            
            this.particleData.push({
                angle: Math.random() * Math.PI * 2,
                radius: 0.5 + Math.random() * 1.5,
                speed: 1.0 + Math.random() * 2.0,
                y: 1.5,
                colorIndex: Math.floor(Math.random() * palette.length)
            });
        }

        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geo, mat);
    }

    public update(dt: number, time: number) {
        if (!this.active) return;

        // Pulse Light (Aggressive)
        this.light.intensity = 3.0 + Math.sin(time * 8.0) * 1.5;
        // Subtle shift towards Orange
        this.light.color.setHSL(0.0 + (Math.sin(time) * 0.05), 1.0, 0.5); 

        const positions = (this.particles.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;

        for(let i=0; i<this.particleData.length; i++) {
            const p = this.particleData[i];

            // Motion: Spiral Inwards to Void
            p.radius -= p.speed * dt * 0.8;
            p.angle += p.speed * dt * 3.0; // Fast spin

            // Reset if sucked in
            if(p.radius <= 0.1) {
                p.radius = 1.6;
                p.angle = Math.random() * Math.PI * 2;
            }

            const x = Math.cos(p.angle) * p.radius;
            const y = Math.sin(p.angle) * p.radius;

            // Map to mesh local space
            positions[i*3] = x;
            positions[i*3+1] = 1.5 + y; 
            positions[i*3+2] = 0.1; 
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
    }

    public destroy(scene: THREE.Scene) {
        this.active = false;
        scene.remove(this.mesh);
    }
}
