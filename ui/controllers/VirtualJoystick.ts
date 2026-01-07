
import { MobileBridge } from '../../services/MobileBridge';

export class VirtualJoystick {
    private static container: HTMLElement;
    private static base: HTMLElement;
    private static knob: HTMLElement;
    private static active: boolean = false;
    private static maxRadius = 50;

    public static init() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'joystick-zone';
        this.container.style.cssText = `
            position: absolute; bottom: 50px; left: 50px;
            width: 150px; height: 150px;
            z-index: 1000; touch-action: none;
            display: block; /* Visible by default */
        `;

        this.base = document.createElement('div');
        this.base.id = 'joystick-base';
        this.base.style.cssText = `
            width: 100%; height: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            box-sizing: border-box;
            transition: border-color 0.2s;
        `;

        this.knob = document.createElement('div');
        this.knob.id = 'joystick-knob';
        this.knob.style.cssText = `
            position: absolute; top: 50%; left: 50%;
            width: 50px; height: 50px;
            background: radial-gradient(circle at 30% 30%, #fbbf24, #b45309);
            border: 2px solid #000;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 15px rgba(0,0,0,0.5);
            pointer-events: none;
            transition: transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;

        this.container.appendChild(this.base);
        this.container.appendChild(this.knob);
        document.body.appendChild(this.container);

        this.container.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
        this.container.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
        this.container.addEventListener('touchend', this.handleEnd.bind(this));
        this.container.addEventListener('touchcancel', this.handleEnd.bind(this));
    }

    private static handleStart(e: TouchEvent) {
        e.preventDefault();
        this.active = true;
        this.base.style.borderColor = 'rgba(251, 191, 36, 0.5)';
        this.handleMove(e);
    }

    private static handleMove(e: TouchEvent) {
        if (!this.active) return;
        e.preventDefault();

        const touch = e.touches[0];
        const rect = this.container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const angle = Math.atan2(dy, dx);
        const clamp = Math.min(dist, this.maxRadius);

        const x = Math.cos(angle) * clamp;
        const y = Math.sin(angle) * clamp;

        // Visual Update
        this.knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        this.knob.style.transition = 'none'; // Remove bounce during drag

        // Logic Update (Normalized)
        MobileBridge.moveDir.x = x / this.maxRadius;
        MobileBridge.moveDir.y = y / this.maxRadius;
    }

    private static handleEnd(e: TouchEvent) {
        e.preventDefault();
        this.active = false;
        
        // Reset Visuals
        this.knob.style.transform = `translate(-50%, -50%)`;
        this.knob.style.transition = 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // Bounce back
        this.base.style.borderColor = 'rgba(255, 255, 255, 0.2)';

        // Reset Logic
        MobileBridge.moveDir.x = 0;
        MobileBridge.moveDir.y = 0;
    }
}
