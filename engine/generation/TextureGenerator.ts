
import * as THREE from 'three';

/**
 * TITAN ENGINE: TEXTURE GENERATOR
 * Creates high-fidelity textures at runtime without external assets.
 */
export class TextureGenerator {
    
    private static createCanvas(width: number, height: number): { canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D } {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        return { canvas, ctx };
    }

    private static createMaterialFromCanvas(canvas: HTMLCanvasElement): THREE.CanvasTexture {
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    /**
     * Generates a noisy surface suitable for dirt, stone, or rough metal.
     */
    public static generateNoise(width: number, height: number, baseColorHex: string, noiseIntensity: number = 30): THREE.CanvasTexture {
        const { canvas, ctx } = this.createCanvas(width, height);
        
        ctx.fillStyle = baseColorHex;
        ctx.fillRect(0, 0, width, height);
        
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * noiseIntensity;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
            data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise)); // G
            data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise)); // B
        }
        
        ctx.putImageData(imgData, 0, 0);
        return this.createMaterialFromCanvas(canvas);
    }

    /**
     * Generates a brick/stone tile pattern.
     */
    public static generateBricks(width: number, height: number, brickColor: string, mortarColor: string): THREE.CanvasTexture {
        const { canvas, ctx } = this.createCanvas(width, height);
        
        // Background (Mortar)
        ctx.fillStyle = mortarColor;
        ctx.fillRect(0, 0, width, height);
        
        // Bricks
        ctx.fillStyle = brickColor;
        const rows = 4;
        const cols = 4;
        const brickH = height / rows;
        const brickW = width / cols;
        const gap = 4;

        for(let y = 0; y < rows; y++) {
            const offset = (y % 2) * (brickW / 2);
            
            for(let x = -1; x < cols + 1; x++) {
                ctx.fillRect(
                    (x * brickW) + offset + gap, 
                    (y * brickH) + gap, 
                    brickW - (gap * 2), 
                    brickH - (gap * 2)
                );
            }
        }
        
        // Add subtle noise overlay for texture
        const tex = this.createMaterialFromCanvas(canvas);
        return tex;
    }

    /**
     * Generates a bright Magenta/Black checkerboard for missing assets.
     */
    public static generateCheckerboard(): THREE.CanvasTexture {
        const { canvas, ctx } = this.createCanvas(64, 64);
        
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillRect(32, 32, 32, 32);
        
        const tex = new THREE.CanvasTexture(canvas);
        tex.magFilter = THREE.NearestFilter; // Pixelated look
        return tex;
    }
}
