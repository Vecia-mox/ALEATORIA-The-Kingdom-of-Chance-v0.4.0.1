
import { EconomyManager } from '../../engine/economy/EconomyManager';
import { InventoryManager } from '../../engine/items/InventoryManager';
import { ItemFactory, Item } from '../../engine/items/ItemFactory';

export class ShopWindow {
    private container: HTMLElement;
    private economy: EconomyManager;
    private inventory: InventoryManager;
    private isOpen: boolean = false;

    // Shop Stock
    private stock: { item: Item, price: number }[] = [];

    constructor(economy: EconomyManager, inventory: InventoryManager) {
        this.economy = economy;
        this.inventory = inventory;
        this.generateStock();
        this.createDOM();
    }

    private generateStock() {
        this.stock = [
            { item: ItemFactory.createPotion(), price: 50 },
            { item: ItemFactory.generateLoot(2), price: 100 },
            { item: ItemFactory.generateLoot(5), price: 250 },
            { item: ItemFactory.generateLoot(10), price: 500 },
        ];
    }

    private createDOM() {
        this.container = document.createElement('div');
        this.container.id = 'shop-window';
        this.container.style.cssText = `
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 700px; height: 500px;
            background: rgba(10, 10, 10, 0.98);
            border: 4px double #b45309;
            box-shadow: 0 0 30px rgba(0,0,0,0.9);
            display: none;
            flex-direction: column;
            color: #e5e5e5;
            font-family: 'Cinzel', serif;
            z-index: 2500;
            pointer-events: auto;
        `;
        document.body.appendChild(this.container);
    }

    public toggle() {
        this.isOpen = !this.isOpen;
        this.container.style.display = this.isOpen ? 'flex' : 'none';
        if (this.isOpen) this.render();
    }

    private render() {
        this.container.innerHTML = '';

        // Header
        const header = document.createElement('div');
        header.style.cssText = "padding: 15px; border-bottom: 2px solid #333; display: flex; justify-content: space-between; align-items: center; background: #1a1a1a;";
        header.innerHTML = `<h2 style="margin:0; color:#fbbf24;">MERCHANT</h2>`;
        
        const closeBtn = document.createElement('button');
        closeBtn.innerText = "✖";
        closeBtn.style.cssText = "background:none; border:none; color:#666; font-size: 20px; cursor: pointer;";
        closeBtn.onclick = () => this.toggle();
        header.appendChild(closeBtn);
        this.container.appendChild(header);

        // Body (Dual Pane)
        const body = document.createElement('div');
        body.style.cssText = "display: flex; flex: 1; overflow: hidden;";

        // --- LEFT: SHOP ---
        const shopPane = document.createElement('div');
        shopPane.style.cssText = "flex: 1; border-right: 2px solid #333; padding: 20px; overflow-y: auto;";
        shopPane.innerHTML = `<h3 style="color:#9ca3af; text-align:center; margin-top:0;">WARES</h3>`;
        
        const shopGrid = document.createElement('div');
        shopGrid.style.cssText = "display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;";
        
        this.stock.forEach(entry => {
            const el = this.createItemCard(entry.item, entry.price, 'BUY', () => this.buy(entry));
            shopGrid.appendChild(el);
        });
        shopPane.appendChild(shopGrid);

        // --- RIGHT: PLAYER ---
        const playerPane = document.createElement('div');
        playerPane.style.cssText = "flex: 1; padding: 20px; overflow-y: auto; background: rgba(0,0,0,0.3);";
        playerPane.innerHTML = `<h3 style="color:#9ca3af; text-align:center; margin-top:0;">BACKPACK</h3>`;

        const playerGrid = document.createElement('div');
        playerGrid.style.cssText = "display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;";

        this.inventory.items.forEach((item, index) => {
            if (item) {
                // Sell price = 20% of value? Or simplified.
                const sellPrice = Math.floor(item.value * 0.2) || 1;
                const el = this.createItemCard(item, sellPrice, 'SELL', () => this.sell(index, sellPrice));
                playerGrid.appendChild(el);
            }
        });
        playerPane.appendChild(playerGrid);

        body.appendChild(shopPane);
        body.appendChild(playerPane);
        this.container.appendChild(body);

        // Footer (Gold Status)
        const footer = document.createElement('div');
        footer.style.cssText = "padding: 10px; background: #111; border-top: 2px solid #333; text-align: center; font-size: 18px; color: #fbbf24; font-weight: bold;";
        footer.innerText = `Gold: ${this.economy.gold}`;
        this.container.appendChild(footer);
    }

    private createItemCard(item: Item, price: number, action: 'BUY'|'SELL', onClick: () => void): HTMLElement {
        const card = document.createElement('div');
        card.style.cssText = `
            background: #262626; border: 1px solid #444; padding: 10px;
            display: flex; flex-direction: column; align-items: center;
            cursor: pointer; transition: all 0.1s;
        `;
        card.onmouseover = () => card.style.borderColor = '#fbbf24';
        card.onmouseout = () => card.style.borderColor = '#444';
        card.onclick = onClick;

        card.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 5px;">${item.icon}</div>
            <div style="font-size: 10px; color: ${item.color}; font-weight: bold; text-align: center; height: 24px; overflow: hidden;">${item.name}</div>
            <div style="margin-top: 5px; color: ${action === 'BUY' ? '#ef4444' : '#10b981'}; font-weight: bold;">
                ${action === 'BUY' ? '-' : '+'}${price} G
            </div>
        `;
        return card;
    }

    private buy(entry: { item: Item, price: number }) {
        if (this.economy.spend(entry.price)) {
            // Clone item so we can buy multiple
            const newItem = { ...entry.item, id: Math.random().toString(36) };
            if (this.inventory.addItem(newItem)) {
                this.render(); // Refresh
            } else {
                // Refund if full
                this.economy.earn(entry.price);
                alert("Inventory Full!");
            }
        } else {
            alert("Not enough Gold!");
        }
    }

    private sell(index: number, price: number) {
        this.inventory.removeItem(index);
        this.economy.earn(price);
        this.render();
    }
}
