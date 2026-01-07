
export class SkillButton {
    private element: HTMLElement;
    private overlay: HTMLElement;
    private isCooldown: boolean = false;

    constructor(element: HTMLElement) {
        this.element = element;
        this.element.classList.add('skill-btn');
        
        // 1. Create or Find Overlay
        let overlay = this.element.querySelector('.cooldown-overlay') as HTMLElement;
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'cooldown-overlay';
            this.element.appendChild(overlay);
        }
        this.overlay = overlay;
    }

    public triggerCooldown(durationMs: number) {
        if (this.isCooldown) return;
        this.isCooldown = true;

        // 1. Reset: Fill overlay instantly
        this.overlay.style.transition = 'none';
        this.overlay.style.height = '100%';
        this.element.classList.add('cooldown-active'); // For grayscale filters etc

        // Force Reflow
        void this.overlay.offsetWidth;

        // 2. Animate: Shrink to 0% over duration
        // Use linear for accurate timing representation
        this.overlay.style.transition = `height ${durationMs}ms linear`;
        this.overlay.style.height = '0%';

        // 3. Reset State after completion
        setTimeout(() => {
            this.isCooldown = false;
            this.element.classList.remove('cooldown-active');
        }, durationMs);
    }

    public setIcon(url: string) {
        // Find or create icon layer
        let icon = this.element.querySelector('.icon-layer') as HTMLElement;
        if (!icon) {
            icon = document.createElement('div');
            icon.className = 'icon-layer';
            Object.assign(icon.style, {
                position: 'absolute', inset: '4px',
                backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                zIndex: '1'
            });
            this.element.appendChild(icon);
            // Ensure overlay is on top
            this.element.appendChild(this.overlay);
        }
        icon.style.backgroundImage = `url(${url})`;
    }
}
