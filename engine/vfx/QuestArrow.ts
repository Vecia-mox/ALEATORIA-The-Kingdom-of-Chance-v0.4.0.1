
import * as THREE from 'three';
import { QuestManager } from '../systems/QuestManager';

export class QuestArrow {
    public mesh: THREE.Group;
    private arrowMesh: THREE.Mesh;
    private player: THREE.Mesh;

    constructor(player: THREE.Mesh) {
        this.player = player;
        this.mesh = new THREE.Group();

        // Arrow Head
        const coneGeo = new THREE.ConeGeometry(0.2, 0.5, 8);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffd700, depthTest: false, transparent: true, opacity: 0.8 });
        this.arrowMesh = new THREE.Mesh(coneGeo, mat);
        this.arrowMesh.rotation.x = Math.PI / 2; // Point forward
        this.arrowMesh.renderOrder = 999; // Always visible
        
        this.mesh.add(this.arrowMesh);
        
        // Attach to scene, but we'll follow player in update to avoid rotation inheritance issues
        // (If we added to player, it would rotate with player body which might be jittery)
    }

    public update(dt: number) {
        // Follow Player
        this.mesh.position.copy(this.player.position);
        this.mesh.position.y += 2.5; // Float above head

        if (QuestManager.targetPos) {
            this.mesh.visible = true;
            
            // Look at target
            this.mesh.lookAt(QuestManager.targetPos.x, this.mesh.position.y, QuestManager.targetPos.z);
            
            // Bobbing
            this.arrowMesh.position.z = 0.5 + Math.sin(Date.now() * 0.005) * 0.1; // Move forward/back relative to pivot?
            // Actually let's just point
            
            // Hide if close
            const dist = this.player.position.distanceTo(QuestManager.targetPos);
            if (dist < 5.0) {
                this.mesh.visible = false;
            }
        } else {
            this.mesh.visible = false;
        }
    }
}
