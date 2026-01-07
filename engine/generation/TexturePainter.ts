
import * as THREE from 'three';

export class TexturePainter {
    private static createCanvas(width: number, height: number) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        return { canvas, ctx };
    }

    private static toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.magFilter = THREE.NearestFilter; // Retro look
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    public static getStone(): THREE.CanvasTexture {
        const { canvas, ctx } = this.createCanvas(256, 256);
        
        // Base Grey
        ctx.fillStyle = '#44403c';
        ctx.fillRect(0, 0, 256, 256);
        
        // Noise
        for(let i=0; i<5000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#57534e' : '#292524';
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const s = Math.random() * 4 + 1;
            ctx.fillRect(x, y, s, s);
        }
        
        return this.toTexture(canvas);
    }

    public static getBricks(): THREE.CanvasTexture {
        const { canvas, ctx } = this.createCanvas(256, 256);
        
        // Mortar
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, 0, 256, 256);
        
        // Bricks
        const rows = 4;
        const cols = 4;
        const w = 256 / cols;
        const h = 256 / rows;
        const gap = 4;

        ctx.fillStyle = '#7f1d1d'; // Dark Red brick

        for(let y=0; y<rows; y++) {
            const offset = (y % 2) * (w/2);
            for(let x=-1; x<cols+1; x++) {
                // Main Brick
                ctx.fillStyle = '#7f1d1d';
                ctx.fillRect(x*w + offset + gap, y*h + gap, w - gap*2, h - gap*2);
                
                // Highlight
                ctx.fillStyle = '#991b1b';
                ctx.fillRect(x*w + offset + gap, y*h + gap, w - gap*2, 4);
                
                // Shadow
                ctx.fillStyle = '#450a0a';
                ctx.fillRect(x*w + offset + gap, y*h + h - gap*2 - 4, w - gap*2, 4);
            }
        }
        
        return this.toTexture(canvas);
    }

    public static getHeroSkin(): THREE.CanvasTexture {
        const { canvas, ctx } = this.createCanvas(64, 64);
        
        // Body (Gold)
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(0, 0, 64, 64);
        
        // Armor (Red)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, 32, 64, 32); // Pants/Skirt
        ctx.fillRect(16, 0, 32, 64); // Chest plate stripe
        
        // Visor
        ctx.fillStyle = '#000000';
        ctx.fillRect(10, 10, 44, 8);
        
        return this.toTexture(canvas);
    }
}
