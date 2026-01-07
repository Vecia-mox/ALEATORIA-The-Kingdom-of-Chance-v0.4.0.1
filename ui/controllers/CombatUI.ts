
import { IconGenerator } from '../graphics/IconGenerator';
import { SkillButton } from '../components/SkillButton';

export class CombatUI {
    private static buttons: Map<string, SkillButton> = new Map();

    public static initializeButtons() {
        // Map slot IDs to Icon Types
        const config: Record<string, { icon: string, color: string }> = {
            '0': { icon: 'sword', color: '#ef4444' }, // Attack
            '1': { icon: 'spiral', color: '#fbbf24' }, // Spin
            '2': { icon: 'boot', color: '#3b82f6' },   // Jump
            '3': { icon: 'fireball', color: '#f97316' }, // Blast
            '4': { icon: 'cross', color: '#22c55e' }    // Heal
        };

        this.buttons.clear();

        Object.entries(config).forEach(([slot, data]) => {
            const btnEl = document.querySelector(`div[data-slot="${slot}"]`) as HTMLElement;
            if (btnEl) {
                // Clear text (if any) and reset basic style
                btnEl.innerText = '';
                btnEl.style.border = `2px solid ${data.color}`;
                btnEl.style.boxShadow = `0 0 10px ${data.color}80`;
                btnEl.style.backgroundColor = '#1a1a1a';
                
                // Initialize Component
                const btnComponent = new SkillButton(btnEl);
                const img = IconGenerator.get(data.icon, data.color);
                btnComponent.setIcon(img);

                this.buttons.set(slot, btnComponent);

                // Hotkey Label (Optional visual)
                if (slot !== '0') {
                    const key = document.createElement('span');
                    key.innerText = slot;
                    key.style.cssText = `
                        position: absolute; bottom: 2px; right: 4px;
                        font-size: 10px; font-weight: 900; color: #fff;
                        text-shadow: 0 0 2px black; z-index: 20; pointer-events: none;
                    `;
                    btnEl.appendChild(key);
                }
            }
        });
    }

    public static triggerCooldown(slotId: string, durationMs: number) {
        const btn = this.buttons.get(slotId);
        if (btn) {
            btn.triggerCooldown(durationMs);
        }
    }
}
