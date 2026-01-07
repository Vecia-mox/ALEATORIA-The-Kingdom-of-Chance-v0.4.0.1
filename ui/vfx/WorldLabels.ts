
import * as THREE from 'three';
import { WorldItem } from '../../engine/items/WorldItem';

export class WorldLabels {
    private static container: HTMLElement;
    private static camera: THREE.Camera;
    private static labels: Map<string, HTMLElement> = new Map();

    public static init(camera: THREE.Camera) {
        this.camera = camera;
        
        let existing = document.getElementById('world-labels');
        if (existing) existing.remove();

        this.container = document.createElement('div');
        this.container.id = 'world-labels';
        this.container.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; overflow: hidden; z-index: 1500;
        `;
        document.body.appendChild(this.container);
    }

    public static add(item: WorldItem) {
        if (!this.container) return;

        const el = document.createElement('div');
        const color = item.type === 'LEGENDARY' ? '#fbbf24' : item.type === 'RARE' ? '#4ade80' : '#ffffff';
        const bg = item.type === 'LEGENDARY' ? 'rgba(50, 20, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)';
        const border = item.type === 'LEGENDARY' ? '1px solid #fbbf24' : 'none';

        el.innerText = item.type === 'GOLD' ? 'Gold' : `${item.type} Item`;
        el.style.cssText = `
            position: absolute;
            background: ${bg};
            border: ${border};
            color: ${color};
            padding: 4px 8px;
            font-family: 'Cinzel', serif;
            font-size: 12px;
            font-weight: bold;
            border-radius: 4px;
            transform: translate(-50%, -100%);
            white-space: nowrap;
            text-shadow: 1px 1px 0 #000;
            opacity: 0;
            transition: opacity 0.2s;
        `;
        
        // Unique ID mapping
        el.id = `label-${item.mesh.uuid}`;
        this.container.appendChild(el);
        this.labels.set(item.mesh.uuid, el);
    }

    public static remove(item: WorldItem) {
        const el = this.labels.get(item.mesh.uuid);
        if (el) {
            el.remove();
            this.labels.delete(item.mesh.uuid);
        }
    }

    public static update(items: WorldItem[]) {
        if (!this.container || !this.camera) return;

        items.forEach(item => {
            const el = this.labels.get(item.mesh.uuid);
            if (!el) return;

            // Project position
            const pos = item.mesh.position.clone();
            pos.y += 0.5; // Offset above item
            
            // Optimization: Frustum check can be added here
            pos.project(this.camera);

            const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-(pos.y * 0.5) + 0.5) * window.innerHeight;

            // Hide if behind camera
            if (pos.z > 1) {
                el.style.opacity = '0';
            } else {
                el.style.opacity = '1';
                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
            }
        });
    }
}
