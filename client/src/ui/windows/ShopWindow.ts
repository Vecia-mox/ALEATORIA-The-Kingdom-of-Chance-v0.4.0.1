
import { EconomyManager } from '../../engine/economy/EconomyManager';
import { InventoryManager } from '../../engine/items/InventoryManager';
import { ItemFactory, Item } from '../../engine/items/ItemFactory';
import { AudioManager } from '../../engine/audio/AudioManager';

export class ShopWindow {
    private container: HTMLElement;
    private economy: EconomyManager;
    private inventory: InventoryManager;
    private isOpen: boolean = false;

    private stock: { item: Item, cost: number }[] = [];

    constructor(economy: EconomyManager, inventory: InventoryManager) {
        this.economy = economy;
        this.inventory = inventory;
        this.initStock();
        this.createDOM();
    }

    private initStock() {
        // 1. Health Potion
        const potion = ItemFactory.createPotion();
        
        // 2. Iron Sword (Mock generation)
        const sword = ItemFactory.generateLoot(1);
        sword.name = "Iron Sword";
        sword.type = 'WEAPON';
        sword.rarity = 'COMMON';
        sword.value = 15;
        sword.icon = "⚔️";
        sword.color = "#cccccc";

        // 3. Golden Shield (Mock generation)
        const shield = ItemFactory.generateLoot(5);
        shield.name = "Golden Shield";
        shield.type = 'ARMOR';
        shield.rarity = 'RARE';
        shield.value = 40;
        shield.icon = "🛡️";
        shield.color = "#fbbf24";

        this.stock = [
            { item: potion, cost: 50 },
            { item: sword, cost: 150 },
            { item: shield, cost: 300 }
        ];
    }

    private createDOM() {
        this.container = document.createElement('div');
        this.container.id = 'shop-window';
        this.container.style.cssText = `
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            background: rgba(10, 5, 0, 0.95);
            border: 2px solid #b45309;
            box-shadow: 0 0 50px rgba(0,0,0,0.8);
            display: none;
            flex-direction: column;
            color: #e5e5e5;
            font-family: 'Cinzel', serif;
            z-index: 4000;
            padding: 20px;
            border-radius: 8px;
        `;

        // Title
        const title = document.createElement('h2');
        title.innerText = "MERCHANT'S WARES";
        title.style.cssText = "text-align: center; color: #fbbf24; margin-top: 0; text-shadow: 0 2px 0 black;";
        this.container.appendChild(title);

        // Gold Display
        const goldDisplay = document.createElement('div');
        goldDisplay.id = 'shop-gold';
        goldDisplay.style.cssText = "text-align: center; font-weight: bold; margin-bottom: 20px; color: #ffd700;";
        this.container.appendChild(goldDisplay);

        // Items Container
        const grid = document.createElement('div');
        grid.style.cssText = "display: flex; flex-direction: column; gap: 10px;";
        
        this.stock.forEach(entry => {
            const row = document.createElement('div');
            row.style.cssText = `
                display: flex; align-items: center; 
                background: rgba(255,255,255,0.05); 
                padding: 10px; border-radius: 4px;
                border: 1px solid #444;
            `;

            // Icon
            const icon = document.createElement('div');
            icon.innerText = entry.item.icon;
            icon.style.fontSize = "32px";
            icon.style.marginRight = "15px";

            // Details
            const info = document.createElement('div');
            info.style.flex = "1";
            info.innerHTML = `
                <div style="color: ${entry.item.color}; font-weight: bold;">${entry.item.name}</div>
                <div style="font-size: 12px; color: #888;">${entry.item.type} • +${entry.item.value} Power</div>
            `;

            // Buy Button
            const btn = document.createElement('button');
            btn.innerText = `${entry.cost}g`;
            btn.style.cssText = `
                background: #166534; color: white; border: none;
                padding: 8px 16px; border-radius: 4px; font-weight: bold;
                cursor: pointer; font-family: monospace;
            `;
            btn.onclick = () => this.buyItem(entry);

            row.appendChild(icon);
            row.appendChild(info);
            row.appendChild(btn);
            grid.appendChild(row);
        });

        this.container.appendChild(grid);

        // Close Button
        const close = document.createElement('button');
        close.innerText = "LEAVE";
        close.style.cssText = `
            margin-top: 20px; width: 100%; padding: 10px;
            background: #444; color: #ccc; border: none; font-weight: bold; cursor: pointer;
        `;
        close.onclick = () => this.toggle();
        this.container.appendChild(close);

        document.body.appendChild(this.container);
    }

    private buyItem(entry: { item: Item, cost: number }) {
        if (this.economy.spend(entry.cost)) {
            // Clone item to create a new instance
            const newItem = { ...entry.item, id: Math.random().toString(36) };
            if (this.inventory.addItem(newItem)) {
                AudioManager.getInstance().play('coin'); // Success sound
                this.updateGold();
            } else {
                this.economy.earn(entry.cost); // Refund
                alert("Inventory Full!");
            }
        } else {
            AudioManager.getInstance().play('ui_click'); // Error click
            alert("Not enough Gold!");
        }
    }

    private updateGold() {
        const el = this.container.querySelector('#shop-gold') as HTMLElement;
        if (el) el.innerText = `YOUR GOLD: ${this.economy.gold}`;
    }

    public toggle() {
        this.isOpen = !this.isOpen;
        this.container.style.display = this.isOpen ? 'flex' : 'none';
        if (this.isOpen) this.updateGold();
    }
}
