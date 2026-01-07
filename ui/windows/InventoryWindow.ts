
import { InventoryManager } from '../../engine/items/InventoryManager';
import { Item } from '../../engine/items/ItemFactory';
import { StatsManager } from '../../engine/combat/StatsManager';
import { AudioManager } from '../../engine/audio/AudioManager';

export class InventoryWindow {
    private container: HTMLElement;
    private manager: InventoryManager;
    private isOpen: boolean = false;
    private selectedIndex: number = -1;

    constructor(manager: InventoryManager) {
        this.manager = manager;
        this.injectStyles(); // Add CSS classes for pseudo-states
        this.createDOM();
        this.manager.subscribe(() => this.render());
    }

    private injectStyles() {
        if (document.getElementById('inventory-styles')) return;
        const style = document.createElement('style');
        style.id = 'inventory-styles';
        style.innerHTML = `
            .inv-slot {
                height: 60px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid #444;
                border-radius: 4px;
                display: flex; align-items: center; justify-content: center;
                font-size: 24px; cursor: pointer;
                user-select: none;
                transition: background 0.1s, border-color 0.1s;
                position: relative;
            }
            .inv-slot:active {
                background: rgba(255, 200, 0, 0.2);
                border-color: #fbbf24;
            }
            .inv-slot.selected {
                border-color: #e5e5e5;
                box-shadow: 0 0 10px rgba(255,255,255,0.2);
                background: rgba(255,255,255,0.1);
            }
            .inv-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
                gap: 8px;
                padding: 10px;
                background: rgba(0,0,0,0.2);
                border-radius: 4px;
            }
            /* Scrollbar styling */
            #inv-content::-webkit-scrollbar { width: 6px; }
            #inv-content::-webkit-scrollbar-track { background: #111; }
            #inv-content::-webkit-scrollbar-thumb { background: #b45309; border-radius: 3px; }
        `;
        document.head.appendChild(style);
    }

    private createDOM() {
        this.container = document.createElement('div');
        this.container.id = 'inventory-window';
        
        // 1. THE RESPONSIVE CONTAINER
        this.container.style.cssText = `
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 90vw; max-width: 500px;
            height: 70vh; max-height: 800px;
            background: rgba(10, 5, 0, 0.95);
            border: 2px solid #FFAA00;
            border-radius: 10px;
            box-shadow: 0 0 50px rgba(0,0,0,0.9);
            display: none;
            flex-direction: column;
            color: #e5e5e5;
            font-family: 'Cinzel', serif;
            z-index: 2500;
            pointer-events: auto;
            overflow: hidden;
        `;

        // Layout: Header -> Scrollable Content -> Footer Details
        this.container.innerHTML = `
            <!-- HEADER -->
            <div style="
                padding: 15px; 
                background: linear-gradient(to right, #1a1a1a, #000); 
                border-bottom: 2px solid #b45309; 
                display: flex; justify-content: space-between; align-items: center;
                flex-shrink: 0;
            ">
                <h2 style="margin: 0; color: #fbbf24; font-size: 1.2rem; letter-spacing: 1px;">INVENTORY</h2>
                <!-- 4. THE CLOSE BUTTON -->
                <button id="inv-close" style="
                    width: 40px; height: 40px; 
                    background: #991b1b; color: white; border: 1px solid #ff0000;
                    font-weight: bold; font-size: 20px; cursor: pointer;
                    border-radius: 4px; display: flex; align-items: center; justify-content: center;
                ">✕</button>
            </div>

            <!-- SCROLLABLE CONTENT -->
            <div id="inv-content" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 20px;">
                
                <!-- Equipment Row -->
                <div style="display: flex; justify-content: space-around; gap: 10px; padding-bottom: 10px; border-bottom: 1px solid #333;">
                    <div style="text-align: center;">
                        <div style="font-size: 10px; color: #aaa; margin-bottom: 4px;">WEAPON</div>
                        <div id="slot-weapon" class="inv-slot" style="width: 70px; height: 70px;"></div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 10px; color: #aaa; margin-bottom: 4px;">ARMOR</div>
                        <div id="slot-armor" class="inv-slot" style="width: 70px; height: 70px;"></div>
                    </div>
                </div>

                <!-- Stats Summary -->
                <div id="inv-stats" style="
                    background: rgba(255,255,255,0.05); 
                    padding: 10px; border-radius: 4px; 
                    font-size: 12px; display: flex; justify-content: space-around;
                    font-family: monospace; font-weight: bold;
                "></div>

                <!-- Backpack Label -->
                <div style="font-size: 12px; color: #b45309; font-weight: bold; letter-spacing: 1px;">BACKPACK</div>
                
                <!-- 2. THE FLUID GRID -->
                <div id="inv-grid" class="inv-grid"></div>

                <!-- Spacer for scrolling to see bottom -->
                <div style="height: 10px;"></div>
            </div>

            <!-- FOOTER DETAILS (Fixed at bottom) -->
            <div id="inv-footer" style="
                background: #0f0f0f; border-top: 1px solid #333; 
                padding: 15px; flex-shrink: 0; min-height: 120px;
                display: flex; flex-direction: column;
            ">
                <div id="item-details" style="flex: 1; margin-bottom: 10px;"></div>
                <div id="item-actions" style="display: flex; gap: 10px;"></div>
            </div>
        `;

        this.container.querySelector('#inv-close')!.addEventListener('click', () => this.toggle());
        document.body.appendChild(this.container);
    }

    public toggle() {
        this.isOpen = !this.isOpen;
        this.container.style.display = this.isOpen ? 'flex' : 'none';
        if (this.isOpen) {
            AudioManager.getInstance().play('ui_open');
            this.selectedIndex = -1;
            this.render();
        }
    }

    private render() {
        if (!this.isOpen) return;

        // Stats
        const statsEl = this.container.querySelector('#inv-stats')!;
        const dmg = StatsManager.calculateDamage(5, this.manager);
        const def = StatsManager.calculateDefense(0, this.manager);
        statsEl.innerHTML = `
            <span>⚔️ PWR: <b style="color: #ef4444">${dmg}</b></span>
            <span>🛡️ DEF: <b style="color: #3b82f6">${def}</b></span>
        `;

        // Equipment Slots
        this.renderSlot('slot-weapon', this.manager.equippedWeapon, -2, '⚔️');
        this.renderSlot('slot-armor', this.manager.equippedArmor, -3, '🛡️');

        // Grid Items
        const gridEl = this.container.querySelector('#inv-grid')!;
        gridEl.innerHTML = '';
        this.manager.items.forEach((item, index) => {
            const slot = document.createElement('div');
            this.renderGridItem(slot, item, index);
            gridEl.appendChild(slot);
        });

        this.renderDetails();
    }

    private renderSlot(id: string, item: Item | null, index: number, placeholder: string) {
        const el = document.getElementById(id)!;
        el.innerHTML = '';
        
        // Reset classes but keep inv-slot
        el.className = 'inv-slot';
        if (this.selectedIndex === index) el.classList.add('selected');
        
        if (item) {
            el.innerText = item.icon;
            el.style.borderColor = item.color;
            el.style.boxShadow = `inset 0 0 10px ${item.color}40`;
        } else {
            el.innerHTML = `<span style="opacity: 0.2; font-size: 30px;">${placeholder}</span>`;
            el.style.borderColor = '#333';
            el.style.boxShadow = 'none';
        }

        el.onclick = () => this.selectItem(index);
        el.ondblclick = () => {
            if (index === -2) this.manager.unequipWeapon();
            if (index === -3) this.manager.unequipArmor();
        };
    }

    private renderGridItem(slot: HTMLElement, item: Item | null, index: number) {
        slot.className = 'inv-slot';
        if (this.selectedIndex === index) slot.classList.add('selected');

        if (item) {
            slot.innerText = item.icon;
            slot.style.borderColor = item.color;
            
            // Rarity glow
            if (item.rarity === 'LEGENDARY') {
                slot.style.boxShadow = `inset 0 0 5px ${item.color}`;
            }
        } else {
            // Empty slot style
            slot.style.borderColor = '#2a2a2a';
        }

        slot.onclick = () => this.selectItem(index);
        slot.ondblclick = () => this.manager.equipItem(index);
    }

    private selectItem(index: number) {
        this.selectedIndex = index;
        this.render(); // Re-render to update selection visual
        AudioManager.getInstance().play('ui_click');
    }

    private renderDetails() {
        const detailsEl = this.container.querySelector('#item-details')!;
        const actionsEl = this.container.querySelector('#item-actions')!;
        
        detailsEl.innerHTML = '';
        actionsEl.innerHTML = '';

        let item: Item | null = null;
        if (this.selectedIndex >= 0) item = this.manager.items[this.selectedIndex];
        else if (this.selectedIndex === -2) item = this.manager.equippedWeapon;
        else if (this.selectedIndex === -3) item = this.manager.equippedArmor;

        if (!item) {
            detailsEl.innerHTML = `<div style="color: #666; text-align: center; margin-top: 20px; font-style: italic;">Tap an item to inspect</div>`;
            return;
        }

        let statLabel = item.type === 'WEAPON' ? 'Damage' : item.type === 'ARMOR' ? 'Defense' : 'Heal';
        
        // Compact Details for Mobile
        detailsEl.innerHTML = `
            <div style="display: flex; gap: 15px; align-items: center;">
                <div style="font-size: 32px; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 4px; border: 1px solid ${item.color};">
                    ${item.icon}
                </div>
                <div>
                    <h3 style="color: ${item.color}; margin: 0; font-size: 16px;">${item.name}</h3>
                    <div style="color: #888; font-size: 11px;">${item.rarity} ${item.type}</div>
                </div>
                <div style="margin-left: auto; text-align: right;">
                    <div style="color: #aaa; font-size: 10px;">${statLabel}</div>
                    <div style="color: #fff; font-weight: bold; font-size: 18px;">+${item.value}</div>
                </div>
            </div>
        `;

        const btnStyle = `
            flex: 1; padding: 12px; border: none; border-radius: 4px;
            color: #fff; cursor: pointer; font-family: 'Cinzel', serif; font-weight: bold;
            font-size: 14px; text-transform: uppercase;
        `;

        if (this.selectedIndex >= 0) {
            // Inventory Action
            const equipBtn = document.createElement('button');
            equipBtn.innerText = item.type === 'POTION' ? 'DRINK' : 'EQUIP';
            equipBtn.style.cssText = btnStyle + `background: #15803d; box-shadow: 0 4px 0 #0f5132;`;
            equipBtn.onclick = () => {
                this.manager.equipItem(this.selectedIndex);
                this.selectedIndex = -1; 
            };
            
            // Pressed effect
            equipBtn.onmousedown = () => equipBtn.style.transform = 'translateY(2px)';
            equipBtn.onmouseup = () => equipBtn.style.transform = 'translateY(0)';

            actionsEl.appendChild(equipBtn);

            const dropBtn = document.createElement('button');
            dropBtn.innerText = 'DROP';
            dropBtn.style.cssText = btnStyle + `background: #7f1d1d; box-shadow: 0 4px 0 #450a0a;`;
            dropBtn.onclick = () => {
                this.manager.removeItem(this.selectedIndex);
                this.selectedIndex = -1;
            };
            actionsEl.appendChild(dropBtn);
        } else {
            // Equipment Action
            const unequipBtn = document.createElement('button');
            unequipBtn.innerText = 'UNEQUIP';
            unequipBtn.style.cssText = btnStyle + `background: #333; box-shadow: 0 4px 0 #111;`;
            unequipBtn.onclick = () => {
                if (this.selectedIndex === -2) this.manager.unequipWeapon();
                if (this.selectedIndex === -3) this.manager.unequipArmor();
                this.selectedIndex = -1;
            };
            actionsEl.appendChild(unequipBtn);
        }
    }
}
