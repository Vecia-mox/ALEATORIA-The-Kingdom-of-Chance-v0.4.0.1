
import { Group, Vector3, Mesh, MeshStandardMaterial, Object3D } from 'three';

export class EnemyEntity extends Group {
    public isDead: boolean = false;
    
    // Stats
    public hp: number;
    public maxHp: number;
    public speed: number;
    public damage: number;
    public entityId: string;

    // Explicitly declare userData to satisfy TypeScript
    public userData: { [key: string]: any };

    constructor(x: number, z: number, config: any) {
        super();
        // Force position set via cast if TS complains about inherited properties
        (this as Group).position.set(x, 0, z);
        
        this.hp = config.hp || 100;
        this.maxHp = config.maxHp || 100;
        this.speed = config.speed || 3.0;
        this.damage = config.damage || 10;
        this.entityId = `enemy_${Math.random().toString(36).substr(2, 9)}`;
        
        // Sync userData for compatibility with legacy systems
        this.userData = {
            id: this.entityId,
            hp: this.hp,
            maxHp: this.maxHp,
            speed: this.speed,
            isDead: false,
            velocity: new Vector3(),
            type: config.type || 'ZOMBIE'
        };
    }

    public takeDamage(amount: number) {
        if (this.isDead) return;

        this.hp -= amount;
        this.userData.hp = this.hp; // Sync
        
        // Visual Flash
        (this as Group).traverse((child: Object3D) => {
            if ((child as Mesh).isMesh && (child as Mesh).material) {
                const mat = (child as Mesh).material as MeshStandardMaterial;
                if (!mat.emissive) return;

                const oldColor = mat.emissive.getHex();
                const oldIntensity = mat.emissiveIntensity;

                mat.emissive.setHex(0xFFFFFF);
                mat.emissiveIntensity = 1.0;

                setTimeout(() => {
                    if (mat) {
                        mat.emissive.setHex(oldColor);
                        mat.emissiveIntensity = oldIntensity;
                    }
                }, 100);
            }
        });

        if (this.hp <= 0) {
            this.isDead = true;
            this.userData.isDead = true;
        }
    }
}
