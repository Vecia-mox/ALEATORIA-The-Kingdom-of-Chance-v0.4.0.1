
export class EconomyManager {
    public gold: number;
    private onUpdate: (gold: number) => void;

    constructor(initialGold: number = 0) {
        this.gold = initialGold;
    }

    public setCallback(callback: (gold: number) => void) {
        this.onUpdate = callback;
        // Trigger immediate update
        this.onUpdate(this.gold);
    }

    public canAfford(cost: number): boolean {
        return this.gold >= cost;
    }

    public spend(amount: number): boolean {
        if (this.canAfford(amount)) {
            this.gold -= amount;
            if (this.onUpdate) this.onUpdate(this.gold);
            return true;
        }
        return false;
    }

    public earn(amount: number) {
        this.gold += amount;
        if (this.onUpdate) this.onUpdate(this.gold);
    }
}
