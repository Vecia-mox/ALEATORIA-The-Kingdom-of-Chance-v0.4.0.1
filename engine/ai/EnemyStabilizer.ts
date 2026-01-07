
import * as THREE from 'three';

export class EnemyStabilizer {
    
    public static update(enemies: THREE.Group[], player: THREE.Mesh) {
        enemies.forEach(enemy => {
            if (enemy.userData.isDead) return;

            // 1. Force Ground Lock (Redundant with GravitySystem but strictly for AI/Nav)
            // If they are "walking", they shouldn't be flying.
            // We allow small vertical movement for gravity, but clamp "drifting".
            if (enemy.position.y > 0.1 && enemy.position.y < 2.0) {
               // Let gravity handle falling, but prevent upward drift from bad collision math
               if (enemy.userData.velocity && enemy.userData.velocity.y > 0) {
                   // Cap upward velocity if not jumping
                   // enemy.userData.velocity.y = 0; 
               }
            }

            // 2. Look Logic Stabilization
            // Create a "Ground Truth" target for looking
            // We want the enemy to look at the player's X/Z, but NOT pitch up/down to their Y.
            const flatPlayerPos = new THREE.Vector3(player.position.x, enemy.position.y, player.position.z);
            
            enemy.lookAt(flatPlayerPos);
        });
    }
}
