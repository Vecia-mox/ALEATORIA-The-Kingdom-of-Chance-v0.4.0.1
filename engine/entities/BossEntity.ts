
import * as THREE from 'three';
import { GlowMaterial } from '../graphics/GlowMaterial';
import { HUDController } from '../../ui/controllers/HUDController';
import { AudioManager } from '../audio/AudioManager';

export class BossEntity {
    public static create(scene: THREE.Scene, x: number, z: number): THREE.Group {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // 1. Visuals - The Warden (Redesigned)
        // Main Body: Massive Black Cube
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x000000, // Pitch black
            roughness: 0.1, 
            metalness: 0.9 
        });
        const body = new THREE.Mesh(geo, mat);
        
        // Scale Up (Huge)
        body.scale.set(3.0, 3.0, 3.0);
        body.position.y = 1.5; // Half of height (3.0) to sit on floor
        body.castShadow = true;
        group.add(body);

        // Wireframe Overlay (Red Energy Cage)
        const edges = new THREE.EdgesGeometry(geo);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const wireframe = new THREE.LineSegments(edges, lineMat);
        wireframe.scale.copy(body.scale);
        wireframe.scale.multiplyScalar(1.01); // Slight offset to prevent z-fighting
        wireframe.position.copy(body.position);
        group.add(wireframe);

        // Eyes (Glowing Red Slits)
        const eyeGeo = new THREE.BoxGeometry(0.6, 0.1, 0.1);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const eyes = new THREE.Mesh(eyeGeo, eyeMat);
        eyes.position.set(0, 2.5, 1.55); // Front face
        GlowMaterial.apply(eyes, 0xff0000, 5.0);
        group.add(eyes);

        // Aura Light (Menacing Red Glow)
        const light = new THREE.PointLight(0xff0000, 4.0, 25);
        light.position.set(0, 4, 0);
        group.add(light);

        // Stats
        group.userData = {
            id: 'BOSS',
            hp: 800, 
            maxHp: 800,
            speed: 2.5,
            isDead: false,
            isBoss: true,
            isPhase2: false,
            phase2Triggered: false,
            velocity: new THREE.Vector3()
        };

        scene.add(group);
        return group;
    }

    public static enterPhase2(boss: THREE.Group) {
        if (boss.userData.phase2Triggered) return;
        boss.userData.phase2Triggered = true;
        boss.userData.isPhase2 = true;

        // 1. Stats Buff
        boss.userData.speed *= 1.5;
        // Healing (Optional)
        // boss.userData.hp = Math.min(boss.userData.maxHp, boss.userData.hp + 200);

        // 2. Visuals
        // Pulse Scale
        boss.scale.multiplyScalar(1.2);
        
        // Color Shift (Neon Red)
        boss.children.forEach((child: any) => {
            if (child.isMesh && child.material && child.material.color) {
               child.material.color.setHex(0xff0000);
               child.material.emissive?.setHex(0xff0000);
               child.material.emissiveIntensity = 2.0;
            }
        });

        // 3. Audio & UI
        HUDController.showBanner("THE WARDEN IS ENRAGED!", "#ff0000");
        AudioManager.getInstance().play('explosion'); // Roar substitute
    }
}
