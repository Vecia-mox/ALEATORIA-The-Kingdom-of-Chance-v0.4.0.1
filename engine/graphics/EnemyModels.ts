
import * as THREE from 'three';
import { HumanoidRig } from './HeroModel';

export class SkeletonModel implements HumanoidRig {
    public mesh: THREE.Group;
    public torso: THREE.Mesh;
    public head: THREE.Group;
    public leftArm: THREE.Group;
    public rightArm: THREE.Group;
    public leftLeg: THREE.Group;
    public rightLeg: THREE.Group;
    public rightHand: THREE.Group;

    constructor() {
        this.mesh = new THREE.Group();

        const matBone = new THREE.MeshStandardMaterial({ color: 0xe5e5e5, roughness: 0.4 });
        const matJoint = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.6 });

        // 1. Torso (Ribcage)
        this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.2), matBone);
        this.torso.position.y = 0.9;
        this.mesh.add(this.torso);

        // 2. Head (Skull)
        this.head = new THREE.Group();
        this.head.position.set(0, 0.35, 0);
        const skull = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), matBone);
        skull.position.y = 0.125;
        this.head.add(skull);
        this.torso.add(this.head);

        // 3. Arms (Sticks)
        this.leftArm = this.createBoneLimb(-0.25, 0.2, 0.08, 0.5, matBone);
        this.rightArm = this.createBoneLimb(0.25, 0.2, 0.08, 0.5, matBone);
        this.torso.add(this.leftArm);
        this.torso.add(this.rightArm);

        // Weapon Attachment Point
        this.rightHand = new THREE.Group();
        this.rightHand.position.set(0, -0.5, 0); // End of arm (length is 0.5)
        this.rightArm.add(this.rightHand);

        // 4. Legs
        this.leftLeg = this.createBoneLimb(-0.15, 0, 0.1, 0.6, matBone);
        this.leftLeg.position.y = 0.6; // Hip height
        this.mesh.add(this.leftLeg); // Attach to root

        this.rightLeg = this.createBoneLimb(0.15, 0, 0.1, 0.6, matBone);
        this.rightLeg.position.y = 0.6;
        this.mesh.add(this.rightLeg);
    }

    private createBoneLimb(x: number, y: number, w: number, h: number, mat: THREE.Material): THREE.Group {
        const g = new THREE.Group();
        g.position.set(x, y, 0);
        
        const bone = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat);
        bone.position.y = -h / 2;
        g.add(bone);
        
        return g;
    }
}

export class EnemyModels {
    public static createSkeleton(): SkeletonModel {
        return new SkeletonModel();
    }
}
