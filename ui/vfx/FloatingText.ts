
import * as THREE from 'three';

export class FloatingText {
    private static container: HTMLElement;
    private static camera: THREE.Camera;

    public static init(camera: THREE.Camera) {
        this.camera = camera;
        
        // Ensure container exists
        let existing = document.getElementById('floating-text-layer');
        if (!existing) {
            this.container = document.createElement('div');
            this.container.id = 'floating-text-layer';
            this.container.style.cssText = `
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                pointer-events: none; overflow: hidden; z-index: 2000;
            `;
            document.body.appendChild(this.container);

            // Inject Animation Styles
            const style = document.createElement('style');
            style.innerHTML = `
                @keyframes pop-damage {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    20% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translate(-50%, -200%) scale(1.0); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        } else {
            this.container = existing;
        }
    }

    public static spawn(pos: THREE.Vector3, text: string, color: string, sizeMultiplier: number = 1.0) {
        if (!this.container || !this.camera) return;

        // Project 3D position to 2D screen space
        const screenPos = pos.clone();
        screenPos.y += 2.0; // Offset above head
        screenPos.project(this.camera);

        const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;

        const el = document.createElement('div');
        el.innerText = text;
        
        // STYLE CONFIG (Requested by User)
        // Font: Cinzel/Serif
        // Color: Gold (Normal) or Red (Crit) defaults passed in, but we fallback
        const baseColor = color || '#FFD700'; 

        el.style.cssText = `
            position: absolute; 
            left: ${x}px; 
            top: ${y}px;
            color: ${baseColor}; 
            font-family: 'Cinzel', serif;
            font-size: ${Math.floor(24 * sizeMultiplier)}px; 
            font-weight: 900;
            text-shadow: 2px 2px 0px black;
            pointer-events: none;
            will-change: transform, opacity;
            animation: pop-damage 1.0s ease-out forwards;
        `;

        this.container.appendChild(el);

        // Auto Cleanup via Animation End or Timeout
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 1000);
    }
}
