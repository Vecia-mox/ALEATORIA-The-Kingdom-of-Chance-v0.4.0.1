
export class DifficultyManager {
    private static instance: DifficultyManager;
    public currentFloor: number = 1;

    private constructor() {}

    public static getInstance(): DifficultyManager {
        if (!DifficultyManager.instance) {
            DifficultyManager.instance = new DifficultyManager();
        }
        return DifficultyManager.instance;
    }

    public nextFloor() {
        this.currentFloor++;
    }

    public getEnemyHP(base: number): number {
        // +20% HP per floor
        return Math.floor(base * (1 + (this.currentFloor - 1) * 0.2));
    }

    public getEnemyDamage(base: number): number {
        // +10% Damage per floor
        return Math.floor(base * (1 + (this.currentFloor - 1) * 0.1));
    }

    public getXPReward(base: number): number {
        // +10% XP per floor
        return Math.floor(base * (1 + (this.currentFloor - 1) * 0.1));
    }

    public reset() {
        this.currentFloor = 1;
    }
}
