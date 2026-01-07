
import * as THREE from 'three';

export class MerchantEntity {
    public mesh: THREE.Group;
    public interactionRadius: number = 2.5;

    constructor(scene: THREE.Scene, x: number, z: number) {
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 0, z);

        // 1. Body (Blue Pillar)
        const geo = new THREE.CylinderGeometry(0.4, 0.4, 1.8, 12);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x3366CC, // Royal Blue
            roughness: 0.3,
            metalness: 0.2
        });
        const body = new THREE.Mesh(geo, mat);
        body.position.y = 0.9; // Sit on floor
        body.castShadow = true;
        this.mesh.add(body);

        // 2. Head (Hood/Sphere)
        const headGeo = new THREE.SphereGeometry(0.35);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x224488 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.9;
        this.mesh.add(head);

        // 3. Floating Label
        const label = this.createLabel();
        label.position.set(0, 2.8, 0);
        this.mesh.add(label);

        // 4. Light (Blue Beacon)
        const light = new THREE.PointLight(0x3366CC, 3.0, 8);
        light.position.set(0, 2, 0.5);
        this.mesh.add(light);

        // Physics/Interaction Data
        this.mesh.userData = {
            isInteractable: true,
            type: 'MERCHANT',
            interactRange: this.interactionRadius
        };

        scene.add(this.mesh);
    }

    private createLabel(): THREE.Sprite {
        const canvas = document.createElement('canvas');
        canvas.width = 256; 
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        
        ctx.font = 'bold 36px monospace'; // Game font style
        ctx.fillStyle = '#FFD700'; // Gold text
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.fillText("MERCHANT", 128, 48);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(2, 0.5, 1);
        
        // Bobbing animation handled in update loop via parent group if needed, 
        // or simple shader. For now static.
        return sprite;
    }
}
