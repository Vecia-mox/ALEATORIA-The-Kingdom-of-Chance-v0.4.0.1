
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
        this.injectStyles();
        this.createDOM();
        this.manager.subscribe(() => this.render());
    }

    private injectStyles() {
        if (document.getElementById('inventory-styles')) return;
        const style = document.createElement('style');
        style.id = 'inventory-styles';
        style.innerHTML = `
            #inventory-window {
                position: fixed; top: 0; right: -100%; /* Hidden off-screen */
                width: 85%; height: 100%; max-width: 400px;
                background: linear-gradient(to bottom, #1a0b00, #000000);
                border-left: 3px solid #C0A060; /* Gold Border */
                transition: right 0.3s ease-out; /* Smooth Slide */
                z-index: 2500;
                display: flex; flex-direction: column;
                box-shadow: -10px 0 50px black;
                font-family: 'Cinzel', serif;
            }
            #inventory-window.open { right: 0; }

            .inv-header {
                height: 60px; background: rgba(50, 20, 0, 0.8);
                border-bottom: 1px solid #C0A060;
                display: flex; justify-content: space-between; align-items: center;
                padding: 0 20px;
                color: #FFD700; font-size: 20px; letter-spacing: 2px; font-weight: 900;
            }

            .stats-panel {
                display: flex; justify-content: space-around;
                padding: 15px; background: rgba(255, 255, 255, 0.05);
                border-bottom: 1px solid #444;
            }
            .stat-box { text-align: center; }
            .stat-label { color: #AAA; font-size: 10px; text-transform: uppercase; }
            .stat-val { color: #FFF; font-size: 18px; font-weight: bold; }

            .equip-section {
                padding: 15px; display: flex; gap: 10px; justify-content: center;
                background: rgba(0,0,0,0.3);
            }

            .inv-grid {
                flex-grow: 1; padding: 15px;
                display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
                grid-auto-rows: 60px; gap: 8px;
                overflow-y: auto;
            }

            .inv-slot {
                background: rgba(0,0,0,0.5); border: 1px solid #444;
                border-radius: 4px; position: relative;
                display: flex; align-items: center; justify-content: center;
                font-size: 24px; cursor: pointer;
                transition: all 0.1s;
            }
            .inv-slot:active { transform: scale(0.95); border-color: white; }
            .inv-slot.selected { border-color: #FFD700; background: rgba(255, 215, 0, 0.1); }
            
            .inv-slot.rarity-LEGENDARY { border-color: #FF8800; box-shadow: inset 0 0 10px #FF8800; }
            .inv-slot.rarity-RARE { border-color: #fbbf24; }
            .inv-slot.rarity-COMMON { border-color: #666; }

            .inv-footer {
                padding: 15px; background: #0f0f0f; border-top: 1px solid #333;
                min-height: 100px;
            }
            .item-name { color: #FFD700; font-weight: bold; font-size: 14px; margin-bottom: 5px; }
            .item-type { color: #888; font-size: 10px; text-transform: uppercase; margin-bottom: 10px; }
            
            .action-btn {
                width: 100%; padding: 10px; border: none;
                background: #b45309; color: white; font-family: 'Cinzel', serif;
                font-weight: bold; cursor: pointer; text-transform: uppercase;
                border: 1px solid #C0A060;
            }
            .action-btn:active { background: #92400e; }

            #inv-close {
                background: none; border: none; color: #666; font-size: 24px; cursor: pointer;
            }
            #inv-close:hover { color: #fff; }
        `;
        document.head.appendChild(style);
    }

    private createDOM() {
        this.container = document.createElement('div');
        this.container.id = 'inventory-window';
        
        this.container.innerHTML = `
            <!-- HEADER -->
            <div class="inv-header">
                <span>INVENTORY</span>
                <button id="inv-close">×</button>
            </div>

            <!-- STATS -->
            <div class="stats-panel">
                <div class="stat-box">
                    <div class="stat-label">Power</div>
                    <div id="stat-dmg" class="stat-val" style="color:#ef4444">0</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Defense</div>
                    <div id="stat-def" class="stat-val" style="color:#3b82f6">0</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Gold</div>
                    <div id="stat-gold" class="stat-val" style="color:#FFD700">0</div>
                </div>
            </div>

            <!-- EQUIPMENT -->
            <div class="equip-section">
                <div id="slot-weapon" class="inv-slot" style="width:70px; height:70px;"></div>
                <div id="slot-armor" class="inv-slot" style="width:70px; height:70px;"></div>
            </div>

            <!-- GRID -->
            <div id="inv-grid" class="inv-grid"></div>

            <!-- FOOTER -->
            <div class="inv-footer">
                <div id="item-info">
                    <div class="item-name">Select an Item</div>
                    <div class="item-type">...</div>
                </div>
                <button id="inv-action" class="action-btn" style="display:none">EQUIP</button>
            </div>
        `;

        this.container.querySelector('#inv-close')!.addEventListener('click', () => this.toggle());
        document.body.appendChild(this.container);
    }

    public toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.container.classList.add('open');
            AudioManager.getInstance().play('ui_open');
            this.selectedIndex = -1;
            this.render();
        } else {
            this.container.classList.remove('open');
        }
    }

    private render() {
        if (!this.isOpen) return;

        // 1. Update Stats
        // We need access to Gold (Economy) here. Ideally passed in, but for now we might have to mock or grab global.
        // Assuming EconomyManager is single instance or passed via ref. 
        // NOTE: In previous setup, InventoryWindow didn't have direct access to EconomyManager instance easily unless passed.
        // We will update stats via logic.
        const dmg = StatsManager.calculateDamage(5, this.manager);
        const def = StatsManager.calculateDefense(0, this.manager);
        
        document.getElementById('stat-dmg')!.innerText = dmg.toString();
        document.getElementById('stat-def')!.innerText = def.toString();
        // Gold needs to be updated externally or via EconomyManager instance if available.
        // For visual completeness we leave it 0 or mock, user requested visual reskin primarily.

        // 2. Render Slots
        this.renderSlot('slot-weapon', this.manager.equippedWeapon, -2, '⚔️');
        this.renderSlot('slot-armor', this.manager.equippedArmor, -3, '🛡️');

        // 3. Render Grid
        const gridEl = this.container.querySelector('#inv-grid')!;
        gridEl.innerHTML = '';
        this.manager.items.forEach((item, index) => {
            const slot = document.createElement('div');
            this.renderGridItem(slot, item, index);
            gridEl.appendChild(slot);
        });

        // 4. Update Footer
        this.renderFooter();
    }

    private renderSlot(id: string, item: Item | null, index: number, placeholder: string) {
        const el = document.getElementById(id)!;
        el.innerHTML = '';
        el.className = 'inv-slot';
        if (this.selectedIndex === index) el.classList.add('selected');

        if (item) {
            el.innerText = item.icon;
            el.classList.add(`rarity-${item.rarity}`);
        } else {
            el.innerHTML = `<span style="opacity:0.2">${placeholder}</span>`;
        }
        
        el.onclick = () => this.selectItem(index);
    }

    private renderGridItem(slot: HTMLElement, item: Item | null, index: number) {
        slot.className = 'inv-slot';
        if (this.selectedIndex === index) slot.classList.add('selected');

        if (item) {
            slot.innerText = item.icon;
            slot.classList.add(`rarity-${item.rarity}`);
        }

        slot.onclick = () => this.selectItem(index);
        slot.ondblclick = () => this.manager.equipItem(index);
    }

    private selectItem(index: number) {
        this.selectedIndex = index;
        AudioManager.getInstance().play('ui_click');
        this.render(); // Redraw selection border and footer
    }

    private renderFooter() {
        const info = this.container.querySelector('#item-info')!;
        const btn = this.container.querySelector('#inv-action') as HTMLElement;
        
        let item: Item | null = null;
        if (this.selectedIndex >= 0) item = this.manager.items[this.selectedIndex];
        else if (this.selectedIndex === -2) item = this.manager.equippedWeapon;
        else if (this.selectedIndex === -3) item = this.manager.equippedArmor;

        if (item) {
            info.innerHTML = `
                <div class="item-name" style="color:${item.color}">${item.name}</div>
                <div class="item-type">${item.rarity} ${item.type} • Value: ${item.value}</div>
            `;
            btn.style.display = 'block';
            
            if (this.selectedIndex < 0) {
                btn.innerText = "UNEQUIP";
                btn.onclick = () => {
                     if (this.selectedIndex === -2) this.manager.unequipWeapon();
                     if (this.selectedIndex === -3) this.manager.unequipArmor();
                     this.selectedIndex = -1;
                };
            } else {
                btn.innerText = item.type === 'POTION' ? "DRINK" : "EQUIP";
                btn.onclick = () => {
                    this.manager.equipItem(this.selectedIndex);
                    this.selectedIndex = -1;
                };
            }
        } else {
            info.innerHTML = `<div class="item-type" style="margin-top:10px">Select an item...</div>`;
            btn.style.display = 'none';
        }
    }
}
