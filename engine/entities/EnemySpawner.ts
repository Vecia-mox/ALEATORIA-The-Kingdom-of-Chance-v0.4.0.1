
import * as THREE from 'three';
import { GlowMaterial } from '../graphics/GlowMaterial';
import { DifficultyManager } from '../core/DifficultyManager';

export class EnemySpawner {
    public static spawn(scene: THREE.Scene, count: number, playerPos: THREE.Vector3): THREE.Group[] {
        const enemies: THREE.Group[] = [];
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x4ade80 }); // Goblin Green
        
        // Eyes logic for orientation
        const eyeGeo = new THREE.SphereGeometry(0.08);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Base Red

        // Difficulty Scaling
        const dm = DifficultyManager.getInstance();
        const scaledHP = dm.getEnemyHP(30);
        // We could also scale speed or damage here if passed to AI/Combat systems

        for(let i=0; i<count; i++) {
            const group = new THREE.Group();
            
            // Body
            const body = new THREE.Mesh(geometry, material);
            body.position.y = 0.6; // Half height
            body.castShadow = true;
            group.add(body);

            // Eyes (Visual indication of "Forward")
            const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
            leftEye.position.set(-0.15, 1.0, 0.25); 
            GlowMaterial.apply(leftEye, 0xff0000, 3.0); // GLOWING RED EYES
            group.add(leftEye);

            const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
            rightEye.position.set(0.15, 1.0, 0.25);
            GlowMaterial.apply(rightEye, 0xff0000, 3.0);
            group.add(rightEye);

            // Find valid position
            let valid = false;
            let attempts = 0;
            while(!valid && attempts < 50) {
                attempts++;
                const x = (Math.random() - 0.5) * 24; // Bounds of 30x30 map approx
                const z = (Math.random() - 0.5) * 24;
                
                const dist = Math.sqrt(Math.pow(x - playerPos.x, 2) + Math.pow(z - playerPos.z, 2));
                
                // Don't spawn on top of player or outside basic bounds
                if (dist > 5) { 
                    group.position.set(x, 0, z);
                    valid = true;
                }
            }

            // Stats
            group.userData = {
                hp: scaledHP,
                maxHp: scaledHP,
                speed: 2.0 + Math.random(),
                isDead: false,
                id: `goblin_${i}`,
                velocity: new THREE.Vector3(0, 0, 0) // Initialize Physics Velocity
            };

            scene.add(group);
            enemies.push(group);
        }

        return enemies;
    }
}
