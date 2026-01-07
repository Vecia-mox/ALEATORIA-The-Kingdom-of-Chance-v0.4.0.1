
import * as THREE from 'three';

export class EnemyHealthBar {
    private static container: HTMLElement;
    private static bars: Map<string, HTMLElement> = new Map();

    public static init() {
        if (document.getElementById('enemy-hp-layer')) return;

        this.container = document.createElement('div');
        this.container.id = 'enemy-hp-layer';
        this.container.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; z-index: 500; overflow: hidden;
        `;
        document.body.appendChild(this.container);
    }

    public static update(enemies: THREE.Group[], camera: THREE.Camera) {
        if (!this.container) this.init();

        const activeIds = new Set<string>();

        enemies.forEach(enemy => {
            if (enemy.userData.isDead) return;

            // 1. Culling (Distance)
            const dist = camera.position.distanceTo(enemy.position);
            if (dist > 25) {
                this.removeBar(enemy.uuid);
                return;
            }

            activeIds.add(enemy.uuid);
            let bar = this.bars.get(enemy.uuid);

            if (!bar) {
                bar = this.createBar();
                this.bars.set(enemy.uuid, bar);
                this.container.appendChild(bar);
            }

            // 2. Projection
            const pos = enemy.position.clone();
            pos.y += 2.2; // Height offset above head
            pos.project(camera);

            const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-(pos.y * 0.5) + 0.5) * window.innerHeight;

            // 3. Occlusion Check (Behind Camera)
            if (pos.z > 1) {
                bar.style.display = 'none';
            } else {
                bar.style.display = 'block';
                bar.style.left = `${x}px`;
                bar.style.top = `${y}px`;

                // 4. Update Fill
                const pct = Math.max(0, (enemy.userData.hp / enemy.userData.maxHp) * 100);
                const fill = bar.firstElementChild as HTMLElement;
                fill.style.width = `${pct}%`;
            }
        });

        // 5. Cleanup Stale Bars
        this.bars.forEach((_, uuid) => {
            if (!activeIds.has(uuid)) this.removeBar(uuid);
        });
    }

    private static createBar(): HTMLElement {
        const div = document.createElement('div');
        div.style.cssText = `
            position: absolute; width: 40px; height: 5px; 
            background: #330000; border: 1px solid #000;
            transform: translate(-50%, -50%);
        `;
        
        const fill = document.createElement('div');
        fill.style.cssText = `
            width: 100%; height: 100%; background: #dc2626; 
            transition: width 0.1s linear;
        `;
        
        div.appendChild(fill);
        return div;
    }

    private static removeBar(uuid: string) {
        const bar = this.bars.get(uuid);
        if (bar) {
            bar.remove();
            this.bars.delete(uuid);
        }
    }
}
