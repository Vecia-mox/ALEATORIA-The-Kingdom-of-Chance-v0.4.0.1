
import * as THREE from 'three';
import { HUDController } from '../../ui/controllers/HUDController';
import { GameDirector } from '../core/GameDirector';

export class QuestManager {
    public static currentObjective: string = "Explore the Dungeon"; 
    public static targetPos: THREE.Vector3 | null = null;
    
    public static killCount: number = 0;
    public static killReq: number = 0;
    public static isKillQuest: boolean = false;
    public static isCompleted: boolean = false;

    public static setObjective(text: string, target: THREE.Vector3 | null = null) {
        this.currentObjective = text;
        this.targetPos = target;
        this.isKillQuest = false;
        this.isCompleted = false;
        HUDController.updateQuest(text);
    }

    public static startKillQuest(text: string, count: number) {
        this.currentObjective = text;
        this.killCount = 0;
        this.killReq = count;
        this.isKillQuest = true;
        this.isCompleted = false;
        this.targetPos = null; 
        this.updateHUD();
    }

    public static registerKill() {
        if (!this.isKillQuest || this.isCompleted) return;
        this.killCount++;
        this.updateHUD();

        if (this.killCount >= this.killReq) {
            this.completeQuest();
        }
    }

    private static completeQuest() {
        this.isCompleted = true;
        if (this.isKillQuest) {
            HUDController.updateQuest("Return to Portal");
            GameDirector.onQuestComplete();
        }
    }

    private static updateHUD() {
        if (this.isKillQuest) {
            HUDController.updateQuest(`${this.currentObjective} (${this.killCount}/${this.killReq})`);
        } else {
            HUDController.updateQuest(this.currentObjective);
        }
    }
}
