
import { MobileBridge } from '../../services/MobileBridge';

/**
 * TITAN ENGINE: SKILL WHEEL
 * Arranges action buttons in a thumb-accessible arc.
 */
export class SkillWheel {
  private container: HTMLElement;
  
  // Layout Config
  private readonly BUTTON_SIZE = 64;
  private readonly ATTACK_SIZE = 96;
  private readonly RADIUS = 130; // Distance from Attack Button center
  private readonly ANCHOR = { right: 60, bottom: 60 }; // Attack button center offset from screen corner

  constructor(skillIcons: string[] = ['1', '2', '3', '4']) {
    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      position: 'absolute',
      bottom: '0', right: '0', width: '300px', height: '300px',
      pointerEvents: 'none', // Allow clicks to pass through gaps
      zIndex: '5000'
    });
    document.body.appendChild(this.container);

    this.buildLayout(skillIcons);
  }

  private buildLayout(icons: string[]) {
    // 1. Attack Button (Anchor)
    const attackBtn = this.createButton(this.ATTACK_SIZE, '⚔️', 'linear-gradient(to top, #7f1d1d, #ef4444)', 0);
    Object.assign(attackBtn.style, {
      right: `${this.ANCHOR.right - (this.ATTACK_SIZE/2)}px`,
      bottom: `${this.ANCHOR.bottom - (this.ATTACK_SIZE/2)}px`,
      border: '4px solid #fbbf24',
      boxShadow: '0 0 20px #b45309'
    });
    this.bindTouch(attackBtn, 0); // 0 = Attack
    this.container.appendChild(attackBtn);

    // 2. Skill Arc
    // Angles: 180 (Left), 150, 120, 90 (Top)
    const angles = [180, 150, 120, 90]; 

    icons.forEach((icon, i) => {
      if (i >= angles.length) return;
      
      const angleRad = angles[i] * (Math.PI / 180);
      
      // Calculate position relative to Attack Button Center
      // Offset: x is left (-), y is up (+)
      // Since 'right' and 'bottom' are positive coordinates from corner:
      const offsetX = Math.cos(angleRad) * this.RADIUS; // Will be negative (left) or 0
      const offsetY = Math.sin(angleRad) * this.RADIUS; // Positive (up)

      // Convert to CSS 'right' and 'bottom'
      // Center of Attack Button is (ANCHOR.right, ANCHOR.bottom)
      // New Right = ANCHOR.right - offsetX
      // New Bottom = ANCHOR.bottom + offsetY
      // Subtract half button size to center it
      
      // Note: Math.cos(180) = -1. So Right = 60 - (-130) = 190. Correct.
      
      const right = (this.ANCHOR.right - offsetX) - (this.BUTTON_SIZE / 2);
      const bottom = (this.ANCHOR.bottom + offsetY) - (this.BUTTON_SIZE / 2);

      const btn = this.createButton(this.BUTTON_SIZE, icon, '#1c1917', i + 1);
      Object.assign(btn.style, {
        right: `${right}px`,
        bottom: `${bottom}px`,
        border: '2px solid #78716c'
      });
      
      this.bindTouch(btn, i + 1);
      this.container.appendChild(btn);
    });
  }

  private createButton(size: number, label: string, bg: string, slotId: number): HTMLElement {
    const div = document.createElement('div');
    Object.assign(div.style, {
      position: 'absolute',
      width: `${size}px`, height: `${size}px`,
      borderRadius: '50%',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: `${size * 0.4}px`,
      color: 'white',
      userSelect: 'none',
      pointerEvents: 'auto',
      touchAction: 'none',
      transition: 'transform 0.1s'
    });
    div.innerText = label;
    div.setAttribute('data-slot', slotId.toString());
    return div;
  }

  private bindTouch(el: HTMLElement, slotIndex: number) {
    const updateBridge = (active: boolean) => {
      if (slotIndex === 0) MobileBridge.isAttacking = active;
      if (slotIndex === 1) MobileBridge.skill1 = active;
      if (slotIndex === 2) MobileBridge.skill2 = active;
      if (slotIndex === 3) MobileBridge.skill3 = active;
      if (slotIndex === 4) MobileBridge.skill4 = active;
      
      el.style.transform = active ? 'scale(0.9)' : 'scale(1.0)';
      el.style.filter = active ? 'brightness(1.5)' : 'brightness(1.0)';
    };

    el.addEventListener('touchstart', (e) => { e.preventDefault(); updateBridge(true); });
    el.addEventListener('touchend', (e) => { e.preventDefault(); updateBridge(false); });
    el.addEventListener('touchcancel', (e) => { e.preventDefault(); updateBridge(false); });
  }

  public destroy() {
    this.container.remove();
  }
}
