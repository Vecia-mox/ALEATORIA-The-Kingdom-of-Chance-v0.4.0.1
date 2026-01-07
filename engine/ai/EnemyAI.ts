
import * as THREE from 'three';

export class EnemyAI {
    // Config
    private static readonly AGGRO_RANGE = 30.0; // Increased range
    private static readonly ATTACK_RANGE = 1.5;
    
    private static tempDir = new THREE.Vector3();

    public static update(enemies: THREE.Group[], player: THREE.Mesh, dt: number) {
        if (!player) return;

        enemies.forEach(enemy => {
            if (enemy.userData.isDead) return;

            const dist = enemy.position.distanceTo(player.position);

            // 1. ALWAYS LOOK AT PLAYER (Aiming)
            enemy.lookAt(player.position.x, enemy.position.y, player.position.z);

            // 2. FORCE MOVE CHASE
            if (dist < this.AGGRO_RANGE && dist > this.ATTACK_RANGE) {
                const speed = enemy.userData.speed || 4.0;
                
                // Calculate direction
                this.tempDir.subVectors(player.position, enemy.position).normalize();
                this.tempDir.y = 0; // Stick to ground plane

                // FORCE UPDATE (Bypass physics engine if it sleeps/glitches)
                enemy.position.add(this.tempDir.multiplyScalar(speed * dt));
            } 
            else if (dist <= this.ATTACK_RANGE) {
                // In biting range - Attack logic handled by combat system
            }
        });
    }
}
