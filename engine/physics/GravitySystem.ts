
import * as THREE from 'three';

export class GravitySystem {
    // TEMPORARY: Hard floor lock to debug "Flying/Falling" issues
    // We strictly force Y to 0 until the camera/rendering is stable.
    
    public static update(player: THREE.Object3D, enemies: THREE.Group[], dt: number) {
        // 1. Force Player to Ground
        player.position.y = 0;
        if (player.userData.velocity) {
            player.userData.velocity.y = 0;
        }

        // 2. Force Enemies to Ground
        enemies.forEach(enemy => {
            if (!enemy.userData.isDead) {
                // Keep body visual height (0.6) logic separate if needed, 
                // but for physics origin, we lock to 0 plane.
                // Assuming enemy groups are origin-based:
                enemy.position.y = 0; 
                
                if (enemy.userData.velocity) {
                    enemy.userData.velocity.y = 0;
                }
            }
        });
    }
    
    public static jump(obj: THREE.Object3D, force: number) {
        // Jump disabled during debug phase to prevent void clipping
        console.warn("Jump disabled for physics debugging.");
    }
}
