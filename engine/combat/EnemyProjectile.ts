
import * as THREE from 'three';
import { PlayerStats } from '../core/PlayerStats';
import { ParticleSystem } from '../vfx/ParticleSystem';

export class EnemyProjectile {
    public mesh: THREE.Mesh;
    public velocity: THREE.Vector3;
    public isDead: boolean = false;
    private life: number = 5.0; // Seconds

    constructor(pos: THREE.Vector3, velocity: THREE.Vector3) {
        this.velocity = velocity;
        
        // Visuals: Purple Orb
        const geo = new THREE.SphereGeometry(0.3, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: 0x9333ea }); // Purple
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.copy(pos);

        // Light
        const light = new THREE.PointLight(0x9333ea, 2, 5);
        this.mesh.add(light);
    }

    update(dt: number, player: THREE.Mesh) {
        this.life -= dt;
        if (this.life <= 0) {
            this.isDead = true;
            return;
        }

        // Movement
        this.mesh.position.add(this.velocity.clone().multiplyScalar(dt));

        // Collision with Player
        const dist = this.mesh.position.distanceTo(player.position);
        if (dist < 1.0) {
            this.onHit(player);
            this.isDead = true;
        }
    }

    private onHit(player: THREE.Mesh) {
        // Deal Damage
        PlayerStats.takeDamage(10);
        
        // Visuals
        ParticleSystem.spawn('BLOOD', player.position); // Reusing blood effect for hit confirm
    }
}
