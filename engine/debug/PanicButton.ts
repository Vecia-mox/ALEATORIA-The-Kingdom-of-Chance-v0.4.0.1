
import * as THREE from 'three';
import { LevelingManager } from '../core/LevelingManager';

export class PanicButton {
    public static init(scene: THREE.Scene, camera: THREE.Camera, player: THREE.Mesh) {
        console.log("🚨 Panic Button Active: Press 'Z' to reset view, 'L' for XP.");
        
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'z') {
                console.log("🚨 PANIC BUTTON ACTIVATED: Resetting World State");
                
                // 1. Reset Player to Center
                player.position.set(0, 0, 0);
                if (player.userData.velocity) player.userData.velocity.set(0,0,0);

                // 2. Reset Camera to Safe Isometric View
                camera.position.set(0, 20, 20);
                camera.lookAt(0, 0, 0);

                // 3. Disable Fog (In case it's blinding)
                if (scene.fog) {
                    (scene.fog as THREE.FogExp2).density = 0;
                    console.log("🌫️ Fog Disabled");
                }
            }
            else if (e.key.toLowerCase() === 'l') {
                console.log("⚡ CHEAT: GRANTING 100 XP");
                LevelingManager.gainXP(player, 100, camera);
            }
        });
    }
}
