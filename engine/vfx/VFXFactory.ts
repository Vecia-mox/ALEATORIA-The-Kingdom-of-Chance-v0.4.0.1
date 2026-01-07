
import * as THREE from 'three';

export class VFXFactory {
    private static scene: THREE.Scene;
    private static plusTexture: THREE.CanvasTexture;

    public static init(scene: THREE.Scene) {
        this.scene = scene;
        this.plusTexture = this.createPlusTexture();
    }

    private static createPlusTexture(): THREE.CanvasTexture {
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#00000000'; ctx.clearRect(0, 0, 64, 64);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(24, 8, 16, 48);
        ctx.fillRect(8, 24, 48, 16);
        ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 10;
        return new THREE.CanvasTexture(canvas);
    }

    public static spawnLevelUp(pos: THREE.Vector3) {
        if (!this.scene) return;

        // 1. THE HOLY PILLAR (Golden Cylinder)
        const beamGeo = new THREE.CylinderGeometry(0.5, 0.5, 50, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({ 
            color: 0xFFD700, 
            transparent: true, 
            opacity: 0.0, 
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.copy(pos);
        beam.position.y = 25; // Centered at 25 to stretch from 0 to 50
        this.scene.add(beam);

        // 2. STAR BURST (Particles)
        const count = 50;
        const partGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities: THREE.Vector3[] = [];

        for(let i=0; i<count; i++) {
            positions[i*3] = pos.x;
            positions[i*3+1] = pos.y + 1.0; // Chest height
            positions[i*3+2] = pos.z;
            
            // Explosion Velocity
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8 + 5, // Upward bias
                (Math.random() - 0.5) * 8
            ));
        }
        partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const partMat = new THREE.PointsMaterial({ color: 0xFFD700, size: 0.3, transparent: true });
        const particles = new THREE.Points(partGeo, partMat);
        this.scene.add(particles);

        // 3. ANIMATION LOOP
        let time = 0;
        const duration = 1.5; // Seconds

        const animate = () => {
            time += 0.02; // dt approx
            const progress = time / duration;

            if (progress >= 1.0) {
                this.scene.remove(beam);
                this.scene.remove(particles);
                beamGeo.dispose(); beamMat.dispose();
                partGeo.dispose(); partMat.dispose();
                return;
            }

            // Beam Animation (Swell and Fade)
            // Scale: 0 -> 4 -> 0
            const scale = Math.sin(progress * Math.PI) * 4.0; 
            beam.scale.set(scale, 1, scale);
            beam.rotation.y += 0.2; // Spin
            beamMat.opacity = Math.sin(progress * Math.PI) * 0.8;

            // Particle Animation
            const posAttr = particles.geometry.attributes.position;
            for(let i=0; i<count; i++) {
                // Move
                posAttr.setXYZ(i, 
                    posAttr.getX(i) + velocities[i].x * 0.02,
                    posAttr.getY(i) + velocities[i].y * 0.02,
                    posAttr.getZ(i) + velocities[i].z * 0.02
                );
                // Gravity
                velocities[i].y -= 9.8 * 0.02;
            }
            posAttr.needsUpdate = true;
            partMat.opacity = 1.0 - progress;

            requestAnimationFrame(animate);
        };
        animate();
    }

    public static spawnHeal(pos: THREE.Vector3) {
        if (!this.scene) return;
        const count = 8;
        for (let i = 0; i < count; i++) {
            const spriteMat = new THREE.SpriteMaterial({ map: this.plusTexture, color: 0xffffff, transparent: true, opacity: 1.0 });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.position.copy(pos).add(new THREE.Vector3((Math.random()-0.5), 0.5 + Math.random(), (Math.random()-0.5)));
            sprite.scale.set(0.5, 0.5, 0.5);
            this.scene.add(sprite);
            this.animateFade(sprite, 0.02, 0.01);
        }
    }

    public static spawnBlood(pos: THREE.Vector3) {
        if (!this.scene) return;
        const count = 5;
        const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const mat = new THREE.MeshBasicMaterial({ color: 0x990000 });

        for(let i=0; i<count; i++) {
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(pos).add(new THREE.Vector3((Math.random()-0.5), 1.0, (Math.random()-0.5)));
            this.scene.add(mesh);
            
            // Explode outward
            const vel = new THREE.Vector3((Math.random()-0.5)*3, Math.random()*3, (Math.random()-0.5)*3);
            
            const animate = () => {
                if(!mesh.parent) return;
                mesh.position.add(vel.clone().multiplyScalar(0.016));
                vel.y -= 9.8 * 0.016; // Gravity
                mesh.rotation.x += 0.1;
                if(mesh.position.y < 0) {
                    this.scene.remove(mesh);
                } else {
                    requestAnimationFrame(animate);
                }
            };
            animate();
        }
    }

    public static spawnScratch(pos: THREE.Vector3) {
        if (!this.scene) return;
        // 3 Lines crossing
        for(let i=0; i<3; i++) {
            const geo = new THREE.BoxGeometry(0.05, 0.8, 0.05);
            const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(pos).add(new THREE.Vector3((i-1)*0.2, 1.0, 0.5));
            mesh.rotation.z = (i-1) * 0.5; // Fan out
            this.scene.add(mesh);
            
            this.animateFade(mesh, 0, 0.05);
        }
    }

    public static spawnSpin(pos: THREE.Vector3) {
        if (!this.scene) return;
        
        // RED RING EXPLOSION (Skill VFX)
        const geometry = new THREE.TorusGeometry(2.0, 0.3, 8, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xFF0000, // Red
            transparent: true, 
            opacity: 0.8 
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2; // Flat on ground
        mesh.position.copy(pos); 
        mesh.position.y = 0.5;
        mesh.scale.set(0.1, 0.1, 0.1);
        
        this.scene.add(mesh);
        
        const animate = () => {
            if (!mesh.parent) return;
            mesh.scale.multiplyScalar(1.2); // Rapid expansion
            material.opacity -= 0.05;
            
            if (material.opacity <= 0) {
                this.scene.remove(mesh); 
                geometry.dispose(); 
                material.dispose();
            } else {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    public static spawnDust(pos: THREE.Vector3) {
        if (!this.scene) return;
        const count = 6;
        for (let i = 0; i < count; i++) {
            const geo = new THREE.SphereGeometry(0.3, 4, 4);
            const mat = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(pos); mesh.position.y = 0.2;
            const angle = (i / count) * Math.PI * 2;
            const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();
            this.scene.add(mesh);
            const animate = () => {
                if (!mesh.parent) return;
                mesh.position.add(dir.multiplyScalar(0.1));
                mesh.scale.multiplyScalar(0.95);
                mat.opacity -= 0.03;
                if (mat.opacity <= 0) {
                    this.scene.remove(mesh); geo.dispose(); mat.dispose();
                } else requestAnimationFrame(animate);
            };
            animate();
        }
    }

    private static animateFade(obj: THREE.Object3D, liftSpeed: number, fadeSpeed: number) {
        const mat = (obj as any).material;
        const animate = () => {
            if(!obj.parent) return;
            obj.position.y += liftSpeed;
            if (mat) mat.opacity -= fadeSpeed;
            if (mat && mat.opacity <= 0) {
                this.scene.remove(obj);
                if(mat.dispose) mat.dispose();
            } else {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
}
