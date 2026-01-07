
export class IconGenerator {
    private static cache: Map<string, string> = new Map();

    public static get(type: string, color: string = '#ffffff'): string {
        const key = `${type}-${color}`;
        if (this.cache.has(key)) return this.cache.get(key)!;

        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;

        switch (type) {
            case 'sword': this.drawSword(ctx); break;
            case 'fireball': this.drawFireball(ctx); break;
            case 'spiral': this.drawSpiral(ctx); break;
            case 'boot': this.drawBoot(ctx); break;
            case 'cross': this.drawCross(ctx); break;
            case 'skull': this.drawSkull(ctx); break;
        }

        const dataURL = canvas.toDataURL();
        this.cache.set(key, dataURL);
        return dataURL;
    }

    private static drawSword(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        // Blade
        ctx.moveTo(14, 50); ctx.lineTo(50, 14);
        // Hilt guard
        ctx.moveTo(20, 38); ctx.lineTo(26, 44);
        ctx.moveTo(38, 20); ctx.lineTo(44, 26);
        // Crossguard
        ctx.moveTo(18, 46); ctx.lineTo(24, 40);
        // Handle
        ctx.moveTo(10, 54); ctx.lineTo(18, 46);
        ctx.stroke();
        
        // Shine
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(20, 44); ctx.lineTo(44, 20); ctx.stroke();
    }

    private static drawFireball(ctx: CanvasRenderingContext2D) {
        // Core
        ctx.beginPath();
        ctx.arc(32, 32, 10, 0, Math.PI * 2);
        ctx.fill();
        // Trails
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(32, 44); ctx.quadraticCurveTo(20, 50, 24, 38);
        ctx.moveTo(32, 44); ctx.quadraticCurveTo(44, 50, 40, 38);
        ctx.moveTo(32, 20); ctx.lineTo(32, 10);
        ctx.stroke();
    }

    private static drawSpiral(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        for (let i = 0; i < 100; i++) {
            const angle = 0.2 * i;
            const x = 32 + (1 + angle) * Math.cos(angle) * 2;
            const y = 32 + (1 + angle) * Math.sin(angle) * 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    private static drawBoot(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(20, 20);
        ctx.lineTo(20, 44); // Heel
        ctx.quadraticCurveTo(20, 50, 26, 50); // Sole back
        ctx.lineTo(40, 50); // Sole
        ctx.quadraticCurveTo(48, 50, 48, 40); // Toe
        ctx.lineTo(40, 35); // Top foot
        ctx.lineTo(32, 40); // Bridge
        ctx.lineTo(32, 20); // Shin
        ctx.closePath();
        ctx.stroke();
        // Wing
        ctx.beginPath(); ctx.moveTo(32, 25); ctx.lineTo(44, 15); ctx.stroke();
    }

    private static drawCross(ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(32, 12); ctx.lineTo(32, 52);
        ctx.moveTo(12, 32); ctx.lineTo(52, 32);
        ctx.stroke();
    }

    private static drawSkull(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(32, 28, 14, 0, Math.PI * 2); // Skull
        ctx.stroke();
        ctx.beginPath(); // Jaw
        ctx.moveTo(24, 38); ctx.lineTo(24, 48); ctx.lineTo(40, 48); ctx.lineTo(40, 38);
        ctx.stroke();
        // Eyes
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath(); ctx.arc(27, 28, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(37, 28, 3, 0, Math.PI*2); ctx.fill();
    }
}
