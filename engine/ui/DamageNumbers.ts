
import * as THREE from 'three';

export class DamageNumbers {
    private static container: HTMLElement;

    public static init(parent: HTMLElement) {
        // Create a dedicated layer for floating text
        this.container = document.createElement('div');
        this.container.id = 'damage-layer';
        this.container.style.cssText = `
            position: absolute; top: 0; left: 0; 
            width: 100%; height: 100%; 
            pointer-events: none; overflow: hidden;
            z-index: 1000;
        `;
        parent.appendChild(this.container);
    }

    public static spawn(worldPos: THREE.Vector3, amount: number, camera: THREE.Camera, isCrit: boolean = false) {
        if (!this.container) return;

        // Project 3D position to 2D Screen Space
        const pos = worldPos.clone();
        pos.y += 2.0; // Float above head
        pos.project(camera);

        const x = (pos.x * 0.5 + 0.5) * this.container.clientWidth;
        const y = (-(pos.y * 0.5) + 0.5) * this.container.clientHeight;

        const el = document.createElement('div');
        el.innerText = Math.round(amount).toString();
        
        const color = isCrit ? '#fbbf24' : '#ffffff';
        const scale = isCrit ? 1.5 : 1.0;
        const shadow = isCrit ? '#dc2626' : '#000000';

        el.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-family: 'Cinzel', serif;
            font-weight: 900;
            font-size: 24px;
            text-shadow: 2px 2px 0px ${shadow};
            transition: transform 0.8s ease-out, opacity 0.8s ease-in;
            opacity: 1;
            transform: translate(-50%, -50%) scale(${scale});
            will-change: transform, opacity;
        `;

        this.container.appendChild(el);

        // Trigger Animation Frame
        requestAnimationFrame(() => {
            el.style.transform = `translate(-50%, -150%) scale(${scale * 1.2})`;
            el.style.opacity = '0';
        });

        // Cleanup DOM
        setTimeout(() => {
            if(el.parentElement) el.remove();
        }, 800);
    }
}
