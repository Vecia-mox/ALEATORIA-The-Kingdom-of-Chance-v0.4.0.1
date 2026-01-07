
import * as THREE from 'three';
import { HUDController } from '../../ui/controllers/HUDController';

export class MerchantNPC {
    public mesh: THREE.Group;
    private isPlayerNear: boolean = false;
    private interactionRange: number = 3.0;
    private onInteract: () => void;

    constructor(scene: THREE.Scene, x: number, z: number, onInteract: () => void) {
        this.onInteract = onInteract;
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 0, z);

        // 1. Visual Body (Blue Robes)
        const geo = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 12);
        const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // Blue
        const body = new THREE.Mesh(geo, mat);
        body.position.y = 0.75;
        body.castShadow = true;
        this.mesh.add(body);

        // 2. Head
        const headGeo = new THREE.SphereGeometry(0.3);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xfca5a5 }); // Skin
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.6;
        this.mesh.add(head);

        // 3. Label (Canvas Sprite)
        const label = this.createLabel("MERCHANT");
        label.position.set(0, 2.5, 0);
        this.mesh.add(label);

        scene.add(this.mesh);
    }

    private createLabel(text: string): THREE.Sprite {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.font = 'bold 32px Cinzel';
        ctx.fillStyle = '#fbbf24'; // Gold
        ctx.textAlign = 'center';
        ctx.fillText(text, 128, 48);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(2, 0.5, 1);
        return sprite;
    }

    public update(playerPos: THREE.Vector3) {
        const dist = this.mesh.position.distanceTo(playerPos);

        if (dist < this.interactionRange) {
            if (!this.isPlayerNear) {
                this.isPlayerNear = true;
                // Show "Trade" button via HUD
                HUDController.showInteractButton("🤝 TRADE", () => this.onInteract());
            }
        } else {
            if (this.isPlayerNear) {
                this.isPlayerNear = false;
                HUDController.hideInteractButton();
            }
        }

        // Look at player
        if (this.isPlayerNear) {
            this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);
        }
    }
}
