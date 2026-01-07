
import * as THREE from 'three';
import { ProjectileSystem } from './ProjectileSystem';
import { AudioManager } from '../audio/AudioManager';

export class SpellLibrary {
    
    public static castFireball(player: THREE.Mesh, projSystem: ProjectileSystem) {
        // 0. Audio
        AudioManager.getInstance().play('fire');

        // 1. Calculate Forward Vector
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
        
        // 2. Spawn Position (In front of player, slightly up)
        const spawnPos = player.position.clone().add(forward.multiplyScalar(1.0));
        spawnPos.y = 1.5; // Chest height

        // 3. Velocity (Fast)
        const velocity = forward.clone().normalize().multiplyScalar(20.0);

        projSystem.spawn(spawnPos, velocity);
    }
}
