
import * as THREE from 'three';

export class FloatingTextManager {
    private static container: HTMLElement;
    private static camera: THREE.Camera;

    public static init(camera: THREE.Camera) {
        this.camera = camera;
        
        let existing = document.getElementById('floating-text-manager');
        if (!existing) {
            this.container = document.createElement('div');
            this.container.id = 'floating-text-manager';
            this.container.style.cssText = `
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                pointer-events: none; overflow: hidden; z-index: 2000;
            `;
            document.body.appendChild(this.container);

            // Inject CSS Animation
            const style = document.createElement('style');
            style.innerHTML = `
                @keyframes float-up {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    100% { transform: translate(-50%, -150%) scale(1.0); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        } else {
            this.container = existing;
        }
    }

    public static spawn(pos: THREE.Vector3, amount: number, isCrit: boolean) {
        if (!this.container || !this.camera) return;

        // Project 3D to 2D
        const screenPos = pos.clone();
        screenPos.y += 2.0;
        screenPos.project(this.camera);

        const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;

        // Check if behind camera
        if (screenPos.z > 1) return;

        const el = document.createElement('div');
        el.innerText = Math.floor(amount).toString();
        
        const color = isCrit ? '#FF0000' : '#FFD700';
        const fontSize = isCrit ? '32px' : '24px';
        const textShadow = isCrit ? '0 0 10px #FF0000' : '2px 2px 0 #000';

        el.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-family: 'Cinzel', serif;
            font-size: ${fontSize};
            font-weight: 900;
            text-shadow: ${textShadow};
            pointer-events: none;
            animation: float-up 0.8s ease-out forwards;
        `;

        this.container.appendChild(el);

        setTimeout(() => {
            el.remove();
        }, 800);
    }
}
