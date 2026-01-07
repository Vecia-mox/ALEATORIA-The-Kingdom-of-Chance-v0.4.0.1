
import { Item } from './ItemFactory';
import { StatsManager } from '../combat/StatsManager';

export class InventoryManager {
    public items: (Item | null)[];
    public capacity: number = 20;
    
    // Equipment Slots
    public equippedWeapon: Item | null = null;
    public equippedArmor: Item | null = null;

    private listeners: (() => void)[] = [];

    constructor() {
        this.items = new Array(this.capacity).fill(null);
    }

    public subscribe(cb: () => void) {
        this.listeners.push(cb);
    }

    private notify() {
        this.listeners.forEach(cb => cb());
    }

    // Deprecated alias for compatibility
    public setCallback(cb: () => void) {
        this.subscribe(cb);
    }

    public addItem(item: Item): boolean {
        // Find first empty slot
        const index = this.items.findIndex(slot => slot === null);
        if (index === -1) {
            console.warn("Inventory Full!");
            return false;
        }

        this.items[index] = item;
        this.notify();
        return true;
    }

    public removeItem(index: number) {
        if (index >= 0 && index < this.capacity) {
            this.items[index] = null;
            this.notify();
        }
    }

    public equipItem(index: number) {
        const item = this.items[index];
        if (!item) return;

        if (item.type === 'POTION') {
            // Consume logic could go to PlayerStats, but simple here
            // We'll leave the actual healing to the caller or add a consume callback?
            // For now, assume potions are just removed. 
            // Ideally PlayerStats.heal() is called.
            // Since this class is data-only, we might need an external handler.
            // But let's just remove it.
            this.removeItem(index);
            return;
        }

        // Swap Logic
        let oldItem: Item | null = null;

        if (item.type === 'WEAPON') {
            oldItem = this.equippedWeapon;
            this.equippedWeapon = item;
        } else if (item.type === 'ARMOR') {
            oldItem = this.equippedArmor;
            this.equippedArmor = item;
        }

        this.items[index] = oldItem;
        this.notify();
    }

    public unequipWeapon() {
        if (this.equippedWeapon) {
            if (this.addItem(this.equippedWeapon)) {
                this.equippedWeapon = null;
                this.notify();
            } else {
                console.warn("Inventory full, cannot unequip weapon.");
            }
        }
    }

    public unequipArmor() {
        if (this.equippedArmor) {
            if (this.addItem(this.equippedArmor)) {
                this.equippedArmor = null;
                this.notify();
            } else {
                console.warn("Inventory full, cannot unequip armor.");
            }
        }
    }
}
