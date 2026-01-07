
import * as THREE from 'three';
import { WeaponModels } from './WeaponModels';
import { ParticleSystem } from '../vfx/ParticleSystem';

// Interface for AnimationSystem compatibility
export interface HumanoidRig {
    mesh: THREE.Group;
    torso: THREE.Object3D;
    head: THREE.Object3D;
    leftArm: THREE.Object3D;
    rightArm: THREE.Object3D;
    leftLeg: THREE.Object3D;
    rightLeg: THREE.Object3D;
    rightHand: THREE.Object3D;
}

export class HeroModel implements HumanoidRig {
    public mesh: THREE.Group;
    
    // Rig Parts
    public torso: THREE.Mesh;
    public head: THREE.Group;
    public leftArm: THREE.Group;
    public rightArm: THREE.Group;
    public leftLeg: THREE.Group;
    public rightLeg: THREE.Group;
    public rightHand: THREE.Group;

    // Visuals
    private runeMesh: THREE.Mesh;
    private glowLight: THREE.PointLight; 
    private shadowLight: THREE.PointLight; 
    private embers: ParticleSystem;
    
    // Animation State
    private swingTime: number = 0;

    // Materials
    private matSkin: THREE.MeshStandardMaterial;
    private matShirt: THREE.MeshStandardMaterial;
    private matPants: THREE.MeshStandardMaterial;

    constructor() {
        // 1. ROOT
        this.mesh = new THREE.Group();

        // 2. MATERIALS
        this.matSkin = new THREE.MeshStandardMaterial({ color: 0xFFCCAA, roughness: 1.0, metalness: 0.0 });
        this.matShirt = new THREE.MeshStandardMaterial({ color: 0x3366FF, roughness: 1.0, metalness: 0.0 });
        this.matPants = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 1.0, metalness: 0.0 });

        // 3. TORSO
        this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), this.matShirt);
        this.torso.position.y = 0.7; 
        this.torso.castShadow = true;
        this.mesh.add(this.torso);

        // 4. HEAD
        this.head = new THREE.Group();
        this.head.position.set(0, 0.45, 0); 
        const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), this.matSkin);
        this.head.add(headMesh);
        
        // Helmet
        const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.32), new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 }));
        helmet.position.y = 0.15;
        this.head.add(helmet);
        
        this.torso.add(this.head);

        // 5. ARMS
        this.leftArm = this.createLimb(-0.35, 0.2, 0.15, 0.5, this.matShirt, this.matSkin);
        this.rightArm = this.createLimb(0.35, 0.2, 0.15, 0.5, this.matShirt, this.matSkin);
        this.torso.add(this.leftArm);
        this.torso.add(this.rightArm);

        // Weapon Socket
        this.rightHand = new THREE.Group();
        this.rightHand.position.set(0, -0.5, 0.1);
        this.rightHand.rotation.x = Math.PI / 2;
        this.rightArm.add(this.rightHand);

        // 6. LEGS
        this.leftLeg = this.createLimb(-0.15, 0.7, 0.18, 0.6, this.matPants, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1.0 }));
        this.rightLeg = this.createLimb(0.15, 0.7, 0.18, 0.6, this.matPants, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1.0 }));
        
        this.mesh.add(this.leftLeg);
        this.mesh.add(this.rightLeg);

        // 7. THE SACRED RUNE (Procedural Floor Projection)
        const runeTexture = this.createRuneTexture();
        const runeGeo = new THREE.PlaneGeometry(2.0, 2.0);
        const runeMat = new THREE.MeshBasicMaterial({
            map: runeTexture,
            transparent: true,
            opacity: 0.6,
            color: 0xFFAA00, // Golden Orange
            side: THREE.DoubleSide,
            depthWrite: false, // Prevent z-fighting with floor
            blending: THREE.AdditiveBlending
        });

        this.runeMesh = new THREE.Mesh(runeGeo, runeMat);
        this.runeMesh.rotation.x = -Math.PI / 2;
        this.runeMesh.position.y = 0.05; // Just above ground
        this.mesh.add(this.runeMesh);

        // 8. GLOW LIGHT (Aura Glow - Increased Range)
        this.glowLight = new THREE.PointLight(0xFF8800, 3.0, 20); // Warmer, 20m range
        this.glowLight.position.set(0, 1.0, 0);
        this.mesh.add(this.glowLight);

        // 9. SHADOW CASTER (Torch - Huge Range)
        this.shadowLight = new THREE.PointLight(0xFFAA00, 5.0, 80); // 80m Range
        this.shadowLight.position.set(0, 4.0, 0.5); // Higher up
        this.shadowLight.castShadow = true;
        this.shadowLight.shadow.mapSize.width = 2048; 
        this.shadowLight.shadow.mapSize.height = 2048;
        this.shadowLight.shadow.bias = -0.0005;
        this.shadowLight.shadow.radius = 2; 
        this.mesh.add(this.shadowLight);

        // 10. PARTICLES (Embers only)
        this.embers = new ParticleSystem(this.mesh);
    }

    /**
     * Generates a mystical rune texture on a canvas.
     */
    private createRuneTexture(): THREE.CanvasTexture {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        
        ctx.clearRect(0, 0, 512, 512);

        const cx = 256;
        const cy = 256;

        // Outer Ring
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.arc(cx, cy, 200, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Ring
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, 180, 0, Math.PI * 2);
        ctx.stroke();

        // Magic Star
        ctx.lineWidth = 8;
        ctx.beginPath();
        for(let i = 0; i < 5; i++) {
            // Draw a pentagram-ish star
            const angle = (i * 4 * Math.PI) / 5 - (Math.PI / 2);
            const x = cx + Math.cos(angle) * 180;
            const y = cy + Math.sin(angle) * 180;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Runes
        ctx.font = 'bold 40px serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const glyphs = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ']; // Futhark runes
        
        for(let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = cx + Math.cos(angle) * 230;
            const y = cy + Math.sin(angle) * 230;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI/2);
            ctx.fillText(glyphs[i % glyphs.length], 0, 0);
            ctx.restore();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = 4;
        return tex;
    }

    private createLimb(x: number, y: number, w: number, h: number, matMain: THREE.Material, matTip: THREE.Material): THREE.Group {
        const group = new THREE.Group();
        group.position.set(x, y, 0);

        const main = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), matMain);
        main.position.y = -h / 2;
        main.castShadow = true;
        group.add(main);

        const tip = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, w * 0.9, w * 0.9), matTip);
        tip.position.y = -h - (w * 0.2);
        group.add(tip);

        return group;
    }

    public update(dt: number, time: number) {
        // Rotate Rune
        if (this.runeMesh) {
            this.runeMesh.rotation.z -= 0.5 * dt; // Slow majestic spin
            
            // Pulse Opacity
            const pulse = 0.4 + Math.sin(time * 2.0) * 0.2;
            (this.runeMesh.material as THREE.MeshBasicMaterial).opacity = pulse;
        }

        // Light Flicker
        const flicker = Math.random() * 0.1;
        this.glowLight.intensity = 3.0 + flicker;
        this.shadowLight.intensity = 5.0 + flicker;

        // Update Particles
        this.embers.update(dt);

        // --- PROCEDURAL SWORD SWING ---
        if (this.swingTime > 0) {
            this.swingTime -= dt * 15; 
            
            const t = Math.max(0, this.swingTime);
            const angle = Math.cos(t * Math.PI) * 2.5; 
            
            this.rightArm.rotation.x = angle - 1.0; 
            this.rightArm.rotation.z = Math.sin(t * Math.PI) * 0.5; 
            
            this.torso.rotation.y = Math.sin(t * Math.PI) * -0.5;
        }
    }

    public triggerAttack() {
        this.swingTime = 1.0; 
    }

    public equip(weaponType: string) {
        this.rightHand.clear();
        if (weaponType) {
            const weapon = WeaponModels.create(weaponType);
            // Heroic Scaling: Make weapons look bigger and cooler
            weapon.scale.set(1.5, 1.5, 1.5);
            this.rightHand.add(weapon);
        }
    }

    public setArmorColor(hex: number) {
        this.matShirt.color.setHex(hex);
    }
}
