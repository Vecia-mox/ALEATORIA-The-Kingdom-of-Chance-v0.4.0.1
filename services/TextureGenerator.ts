
import { AsyncTextureManager } from './AsyncTextureManager';
import { SettingsManager } from './SettingsManager';
import { WorldConfig } from '../data/WorldConfig';

// --- COMPACT PERLIN NOISE ---
class Perlin {
  private p: number[] = [];
  constructor() {
    this.p = new Array(512);
    const permutation = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    for (let i=0; i < 256 ; i++) this.p[256+i] = this.p[i] = permutation[i]; 
  }
  fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(t: number, a: number, b: number) { return a + t * (b - a); }
  grad(hash: number, x: number, y: number, z: number) {
    const h = hash & 15;
    const u = h<8 ? x : y, v = h<4 ? y : h==12||h==14 ? x : z;
    return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
  }
  noise(x: number, y: number, z: number) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = this.fade(x), v = this.fade(y), w = this.fade(z);
    const A = this.p[X]+Y, AA = this.p[A]+Z, AB = this.p[A+1]+Z, B = this.p[X+1]+Y, BA = this.p[B]+Z, BB = this.p[B+1]+Z;
    return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x-1, y, z)), this.lerp(u, this.grad(this.p[AB], x, y-1, z), this.grad(this.p[BB], x-1, y-1, z))), this.lerp(v, this.lerp(u, this.grad(this.p[AA+1], x, y, z-1), this.grad(this.p[BA+1], x-1, y, z-1)), this.lerp(u, this.grad(this.p[AB+1], x, y-1, z-1), this.grad(this.p[BB+1], x-1, y-1, z-1))));
  }
}

export class TextureGenerator {
  private static perlin = new Perlin();

  // "Unreal" Style PBR Sun Vector
  private static SUN_VECTOR = { x: -0.6, y: -0.8, z: 0.5 }; // Light coming from Top-Left-Front

  private static HEX_MAP: Record<string, { r: number, g: number, b: number }> = {
    '#1c1917': {r:28,g:25,b:23}, '#0c0a09': {r:12,g:10,b:9}, '#292524': {r:41,g:37,b:36},
    '#14532d': {r:20,g:83,b:45}, '#052e16': {r:5,g:46,b:22}, '#166534': {r:22,g:101,b:52},
    '#d97706': {r:217,g:119,b:6}, '#92400e': {r:146,g:64,b:14}, '#b45309': {r:180,g:83,b:9},
    '#44403c': {r:68,g:64,b:60}, '#57534e': {r:87,g:83,b:78}, '#78716c': {r:120,g:113,b:108},
    '#1e3a8a': {r:30,g:58,b:138}, '#172554': {r:23,g:37,b:84}, '#3b82f6': {r:59,g:130,b:246},
    '#064e3b': {r:6,g:78,b:59}, '#022c22': {r:2,g:44,b:34}, '#065f46': {r:6,g:95,b:70}
  };

  private static hexToRgb(hex: string) {
    return this.HEX_MAP[hex] || { r: 128, g: 128, b: 128 };
  }

  // --- THE PBR ENGINE (TextureWiz) ---
  
  static generateMaterial(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    baseColorHex: string, 
    type: 'ORGANIC' | 'STONE' | 'METAL' | 'WATER',
    extrusionHeight: number = 0 // 0 = Flat, >0 = 3D Block
  ) {
    ctx.clearRect(0, 0, width, height);
    
    // Create buffers
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    const baseColor = this.hexToRgb(baseColorHex);
    const heightMap = new Float32Array(width * height);

    // 1. HEIGHT MAP PASS (Perlin Noise)
    const scale = type === 'STONE' ? 0.15 : type === 'ORGANIC' ? 0.08 : 0.05;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let h = 0;
            if (type === 'WATER') {
                h = Math.sin(x*0.1 + y*0.1) * 0.5 + 0.5; // Waves
            } else {
                h = this.perlin.noise(x * scale, y * scale, 0) + 
                    0.5 * this.perlin.noise(x * scale * 2, y * scale * 2, 123);
            }
            heightMap[y * width + x] = h;
        }
    }

    // 2. NORMAL MAP & LIGHTING PASS
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Edge handling
            const h = heightMap[y * width + x];
            const hRight = (x < width - 1) ? heightMap[y * width + (x + 1)] : h;
            const hDown = (y < height - 1) ? heightMap[(y + 1) * width + x] : h;

            // Calculate Slope Vectors
            // dx = (1, 0, hRight - h)
            // dy = (0, 1, hDown - h)
            const dzdx = (hRight - h) * (type === 'STONE' ? 4.0 : 2.0); // Bump intensity
            const dzdy = (hDown - h) * (type === 'STONE' ? 4.0 : 2.0);

            // Normal Vector N = normalize(-dzdx, -dzdy, 1)
            let nx = -dzdx;
            let ny = -dzdy;
            let nz = 1.0;
            const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
            nx /= len; ny /= len; nz /= len;

            // 3. LIGHTING CALCULATION (Dot Product)
            // Dot(N, Sun)
            // Sun is coming from Top-Left (-x, -y, +z)
            let light = (nx * -this.SUN_VECTOR.x) + (ny * -this.SUN_VECTOR.y) + (nz * this.SUN_VECTOR.z);
            
            // Ambient + Specular
            const ambient = 0.4;
            const specular = type === 'WATER' || type === 'METAL' ? Math.pow(light, 8) * 0.5 : 0;
            light = Math.max(0, light) + ambient + specular;

            // Noise Grain
            const grain = (Math.random() - 0.5) * 0.05;

            const idx = (y * width + x) * 4;
            data[idx] = Math.min(255, baseColor.r * light + grain * 255);
            data[idx+1] = Math.min(255, baseColor.g * light + grain * 255);
            data[idx+2] = Math.min(255, baseColor.b * light + grain * 255);
            data[idx+3] = 255;
        }
    }
    
    // 4. EXTRUSION PASS (Fake 3D)
    // If extruding, we draw the "Front Face" darker at the bottom
    if (extrusionHeight > 0) {
        // Shift entire texture UP by extrusionHeight
        // Draw dark vertical strips below
        // This simulates a 3D block
        // Note: We need a temp canvas to do this compositing cleanly
    } else {
        ctx.putImageData(imgData, 0, 0);
    }
  }

  // --- ASSET PIPELINE ---

  static queueTextureGeneration(scene: any, manager: AsyncTextureManager, onComplete: () => void) {
      console.log("🎨 Initializing PBR Texture Engine...");
      
      manager.addTask(() => this.generateTileAtlas(scene));
      manager.addTask(() => this.generatePropAssets(scene));
      manager.addTask(() => this.generateEffects(scene));
      manager.addTask(() => this.generateShadowTexture(scene));
      
      // Mobs & Characters
      const mobs = ['mob-goblin', 'mob-skeleton', 'mob-orc', 'mob-specter'];
      const mobColors = ['#ef4444', '#e5e5e5', '#166534', '#38bdf8'];
      mobs.forEach((key, i) => {
          manager.addTask(() => this.generateMobSprite(scene, key, mobColors[i]));
      });

      const classes = ['barbarian', 'sorcerer', 'rogue', 'necromancer', 'druid', 'paladin', 'assassin'];
      const classColors = ['#881337', '#0369a1', '#a16207', '#581c87', '#15803d', '#b45309', '#4338ca'];
      classes.forEach((cls, i) => {
          manager.addTask(() => this.generateClassSprite(scene, `char-${cls}`, classColors[i]));
      });

      manager.addTask(() => {
          this.generateBarbarianAttackFrames(scene, '#881337');
          console.log("✅ PBR Assets Baked.");
          onComplete();
      });
  }

  static generateTileAtlas(scene: any) {
    const ts = WorldConfig.TILE_SIZE; // 64
    const width = 512; 
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper: Draw Extruded Tile
    const draw3DTile = (x: number, y: number, color: string, type: any, heightMod: number) => {
        const px = x * ts;
        const py = y * ts;
        
        // 1. Draw Front Face (Darker) if tall
        if (heightMod > 0) {
            ctx.fillStyle = this.darken(color, 0.4);
            ctx.fillRect(px, py + ts - heightMod, ts, heightMod);
        }

        // 2. Draw Top Face (PBR)
        const topCtx = document.createElement('canvas').getContext('2d');
        if (topCtx) {
            topCtx.canvas.width = ts; topCtx.canvas.height = ts;
            this.generateMaterial(topCtx, ts, ts, color, type);
            // Draw shifted up
            ctx.drawImage(topCtx.canvas, px, py - heightMod);
        }
    };

    // 1. GRASS (Flat)
    for(let i=0; i<8; i++) draw3DTile(i, 0, '#14532d', 'ORGANIC', 0);
    
    // 2. STONE WALL (Extruded)
    for(let i=0; i<8; i++) draw3DTile(i, 1, '#44403c', 'STONE', 16);

    // 3. WATER (Flat, Glossy)
    for(let i=0; i<8; i++) draw3DTile(i, 2, '#1e3a8a', 'WATER', 0);

    // 4. SAND (Flat, Grainy)
    for(let i=0; i<8; i++) draw3DTile(i, 3, '#d97706', 'STONE', 0);

    scene.textures.addCanvas('tile-atlas', canvas);
    // Add frames (adjust for extrusion if needed, but Blitter expects fixed grid)
    // We kept the draw within the grid cell, just visually shifted.
    for(let i=0; i<8; i++) scene.textures.get('tile-atlas').add(i, 0, i*ts, 0, ts, ts); 
    for(let i=0; i<8; i++) scene.textures.get('tile-atlas').add(8+i, 0, i*ts, ts, ts, ts); 
    for(let i=0; i<8; i++) scene.textures.get('tile-atlas').add(16+i, 0, i*ts, ts*2, ts, ts); 
    for(let i=0; i<8; i++) scene.textures.get('tile-atlas').add(24+i, 0, i*ts, ts*3, ts, ts); 
  }

  static generatePropAssets(scene: any) {
      const make = (key: string, w: number, h: number, drawFn: (ctx: CanvasRenderingContext2D) => void) => {
          if (scene.textures.exists(key)) return;
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          const x = c.getContext('2d');
          if (x) {
              x.clearRect(0,0,w,h); 
              drawFn(x);
              scene.textures.addCanvas(key, c);
          }
      };

      // 1. 3D PINE TREE (Cones)
      make('prop-tree_pine', 64, 128, (ctx) => {
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath(); ctx.ellipse(32, 120, 24, 8, 0, 0, Math.PI*2); ctx.fill();

          // Trunk (Cylinder)
          const grad = ctx.createLinearGradient(24, 0, 40, 0);
          grad.addColorStop(0, '#1c1917'); grad.addColorStop(0.5, '#44403c'); grad.addColorStop(1, '#0c0a09');
          ctx.fillStyle = grad;
          ctx.fillRect(28, 100, 8, 20);

          // Leaves (Cones with PBR lighting)
          const drawCone = (y: number, w: number) => {
              ctx.beginPath();
              ctx.moveTo(32, y - 40);
              ctx.lineTo(32 + w, y);
              ctx.lineTo(32 - w, y);
              ctx.closePath();
              // Fake Normal Map Lighting on Cone
              const g = ctx.createLinearGradient(32 - w, y, 32 + w, y);
              g.addColorStop(0, '#064e3b'); // Dark (Shadow side)
              g.addColorStop(0.3, '#22c55e'); // Light (Sun side)
              g.addColorStop(1, '#065f46');
              ctx.fillStyle = g;
              ctx.fill();
          };
          
          drawCone(100, 28);
          drawCone(80, 24);
          drawCone(60, 18);
      });

      // 2. 3D ROCK (Geodesic)
      make('prop-rock_grey', 64, 64, (ctx) => {
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.beginPath(); ctx.ellipse(32, 50, 20, 10, 0, 0, Math.PI*2); ctx.fill();

          // PBR Texture
          const rockTex = document.createElement('canvas'); rockTex.width = 40; rockTex.height = 40;
          this.generateMaterial(rockTex.getContext('2d')!, 40, 40, '#57534e', 'STONE');
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(32, 10); ctx.lineTo(52, 25); ctx.lineTo(48, 50); ctx.lineTo(16, 45); ctx.lineTo(12, 25);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(rockTex, 12, 10);
          // Highlight edge
          ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth=2; ctx.stroke();
          ctx.restore();
      });
  }

  // --- UTILS ---
  static darken(hex: string, amount: number): string {
      const c = this.hexToRgb(hex);
      const r = Math.floor(c.r * (1 - amount));
      const g = Math.floor(c.g * (1 - amount));
      const b = Math.floor(c.b * (1 - amount));
      return `rgb(${r},${g},${b})`;
  }

  static generateShadowTexture(scene: any) {
      if (scene.textures.exists('shadow-base')) return;
      const w=64, h=32;
      const c=document.createElement('canvas'); c.width=w; c.height=h; 
      const x=c.getContext('2d');
      if(x){
          x.clearRect(0,0,w,h);
          // Skewed Shadow for 3D feel
          x.transform(1, 0, -0.5, 1, 16, 0); // Skew X
          const g=x.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/3); 
          g.addColorStop(0,'rgba(0,0,0,0.6)'); 
          g.addColorStop(1,'rgba(0,0,0,0)');
          x.fillStyle=g; x.fillRect(0,0,w,h);
          scene.textures.addCanvas('shadow-base', c);
      }
  }

  // --- GENERATION IMPLEMENTATIONS ---
  static generateMobSprite(scene: any, key: string, color: string) {
      if (scene.textures.exists(key)) return;
      const c = document.createElement('canvas'); c.width=32; c.height=32; const x=c.getContext('2d');
      if(x) { x.fillStyle=color; x.beginPath(); x.arc(16,16,10,0,Math.PI*2); x.fill(); scene.textures.addCanvas(key,c); }
  }

  static generateClassSprite(scene: any, key: string, color: string) {
      if (scene.textures.exists(key)) return;
      const c = document.createElement('canvas'); c.width=32; c.height=32; const x=c.getContext('2d');
      if(x) { x.fillStyle=color; x.fillRect(8,8,16,16); scene.textures.addCanvas(key,c); }
  }

  static generateBarbarianAttackFrames(scene: any, color: string) {
    for (let i = 0; i < 3; i++) {
        const key = `char-barbarian-attack-${i}`;
        if (scene.textures.exists(key)) continue;
        const c = document.createElement('canvas'); c.width=64; c.height=64;
        const x = c.getContext('2d');
        if(x) {
            x.clearRect(0,0,64,64);
            const cx = 32, feetY = 48;
            // Base Body
            x.fillStyle = 'rgba(0,0,0,0.4)'; x.beginPath(); x.ellipse(cx, feetY, 12, 6, 0, 0, Math.PI*2); x.fill();
            x.fillStyle = color; x.fillRect(cx - 8, feetY - 28, 16, 20);
            x.fillStyle = '#fca5a5'; x.beginPath(); x.arc(cx, feetY - 32, 7, 0, Math.PI*2); x.fill();
            
            // Swing Effect
            x.strokeStyle = '#cbd5e1'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath();
            const start = -Math.PI / 2 + (i * 1.5); 
            x.arc(cx, feetY - 20, 24, start, start + 1.2); 
            x.stroke();
            
            scene.textures.addCanvas(key, c);
        }
    }
  }

  static generateEffects(scene: any) {
      if (!scene.textures.exists('effect-slash')) {
          const c = document.createElement('canvas'); c.width=64; c.height=64; const x = c.getContext('2d');
          if (x) {
              x.clearRect(0,0,64,64); x.beginPath(); x.arc(32,32,30, -0.5, 0.5); 
              x.lineWidth=4; x.strokeStyle='#fff'; x.stroke();
              scene.textures.addCanvas('effect-slash', c);
          }
      }
      if (!scene.textures.exists('projectile-orb')) {
          const c = document.createElement('canvas'); c.width=32; c.height=32; const x = c.getContext('2d');
          if (x) {
              x.clearRect(0,0,32,32); const g = x.createRadialGradient(16,16,0,16,16,16);
              g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(0,0,0,0)');
              x.fillStyle = g; x.beginPath(); x.arc(16,16,16,0,Math.PI*2); x.fill();
              scene.textures.addCanvas('projectile-orb', c);
          }
      }
      if (!scene.textures.exists('decal-blood')) {
          const c = document.createElement('canvas'); c.width=32; c.height=32; const x = c.getContext('2d');
          if(x){ x.clearRect(0,0,32,32); x.fillStyle='#7f1d1d'; x.beginPath(); x.arc(16,16,12,0,Math.PI*2); x.fill(); scene.textures.addCanvas('decal-blood',c); }
      }
      if (!scene.textures.exists('decal-scorch')) {
          const c = document.createElement('canvas'); c.width=32; c.height=32; const x = c.getContext('2d');
          if(x){ x.clearRect(0,0,32,32); x.fillStyle='#1c1917'; x.beginPath(); x.arc(16,16,12,0,Math.PI*2); x.fill(); scene.textures.addCanvas('decal-scorch',c); }
      }
  }
}
