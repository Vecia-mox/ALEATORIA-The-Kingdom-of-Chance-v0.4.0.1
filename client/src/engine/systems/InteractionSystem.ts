
import * as THREE from 'three';
import { HUDController } from '../../ui/controllers/HUDController';
import { ShopWindow } from '../../ui/windows/ShopWindow';
import { AudioManager } from '../audio/AudioManager';
import { DungeonDirector } from '../generation/DungeonDirector';
import { PlayerEntity } from '../entities/PlayerEntity'; // Need for type if passed, or we assume caller passes pos

export class InteractionSystem {
    private static interactables: THREE.Group[] = [];
    private static activeTarget: THREE.Group | null = null;
    private static shopWindow: ShopWindow | null = null;
    
    // Portal specific state
    private static portalCooldown: number = 0;

    public static init(shop: ShopWindow) {
        this.shopWindow = shop;
        this.interactables = [];
        this.activeTarget = null;
    }

    public static register(object: THREE.Group) {
        this.interactables.push(object);
    }

    public static clear() {
        this.interactables = [];
        this.activeTarget = null;
        HUDController.hideInteractButton();
        // Close windows
        this.shopWindow?.toggle(); // If open, close? Logic might be complex, assume close
        if (this.shopWindow && (this.shopWindow as any).isOpen) (this.shopWindow as any).toggle();
    }

    public static update(playerPos: THREE.Vector3, player?: PlayerEntity, scene?: THREE.Scene) {
        // 1. PORTAL CHECK (Automatic)
        if (DungeonDirector.portal && DungeonDirector.portal.active && player && scene) {
            // Portal pos is at base of mesh
            const portalPos = DungeonDirector.portal.mesh.position;
            const dist = playerPos.distanceTo(portalPos);
            
            if (dist < 1.0 && Date.now() > this.portalCooldown) {
                this.portalCooldown = Date.now() + 5000; // Prevent double trigger
                AudioManager.getInstance().play('swoosh'); // Portal sound
                DungeonDirector.nextFloor(scene, player);
                return;
            }
        }

        // 2. INTERACTABLES CHECK (Manual)
        let nearest: THREE.Group | null = null;
        let minDst = 999;

        for (const obj of this.interactables) {
            const dist = obj.position.distanceTo(playerPos);
            const range = obj.userData.interactRange || 2.0;

            if (dist < range && dist < minDst) {
                minDst = dist;
                nearest = obj;
            }
        }

        if (nearest !== this.activeTarget) {
            this.activeTarget = nearest;
            
            if (nearest) {
                const type = nearest.userData.type;
                let label = "INTERACT";
                let action = () => console.log("Interacted");

                if (type === 'MERCHANT') {
                    label = "TRADE";
                    action = () => {
                        this.shopWindow?.toggle();
                        AudioManager.getInstance().play('ui_open');
                    };
                }

                HUDController.showInteractButton(label, action);
            } else {
                HUDController.hideInteractButton();
            }
        }
    }
}
