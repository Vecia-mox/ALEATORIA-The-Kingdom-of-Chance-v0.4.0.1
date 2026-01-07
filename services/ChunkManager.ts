
import { Chunk, Mob, Prop } from '../types';
import { MOB_REGISTRY } from '../data/MobRegistry';
import { WorldConfig } from '../data/WorldConfig';

/**
 * ChunkManager: The Immersive World Builder.
 * Uses Fractal Noise to place PBR materials.
 */
export class ChunkManager {
  public static CHUNK_SIZE = WorldConfig.CHUNK_SIZE; 
  public static TILE_SIZE = WorldConfig.TILE_SIZE;  
  private static SEED = WorldConfig.SEED;

  // --- CORE NOISE MATH ---
  private static random(x: number, y: number): number {
    const dot = x * 12.9898 + y * 78.233;
    const sin = Math.sin(dot) * 43758.5453;
    return sin - Math.floor(sin);
  }

  private static noise(x: number, y: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    
    const a = this.random(ix, iy);
    const b = this.random(ix + 1, iy);
    const c = this.random(ix, iy + 1);
    const d = this.random(ix + 1, iy + 1);
    
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    
    return a * (1 - ux) + b * ux + (c - a) * uy * (1 - ux) + (d - b) * ux * uy;
  }

  private static fbm(x: number, y: number): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < WorldConfig.OCTAVES; i++) {
        value += this.noise(x * frequency, y * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= WorldConfig.PERSISTENCE;
        frequency *= WorldConfig.LACUNARITY;
    }

    return value / maxValue;
  }

  // --- GENERATION PIPELINE ---

  static generateChunk(cx: number, cy: number, playerLevel: number = 1): Chunk {
    const renderMap: number[][] = []; 
    const mobs: Mob[] = [];
    const props: Prop[] = [];
    
    let chunkBiome = 'PLAINS';
    const cElev = this.fbm(cx * 0.1, cy * 0.1); // Biome Noise

    // 1. TERRAIN LOOP
    for (let y = 0; y < this.CHUNK_SIZE; y++) {
      renderMap[y] = [];
      for (let x = 0; x < this.CHUNK_SIZE; x++) {
        const wx = cx * this.CHUNK_SIZE + x;
        const wy = cy * this.CHUNK_SIZE + y;
        
        // PBR Height Map Logic
        const elevation = this.fbm(wx * WorldConfig.NOISE_SCALE, wy * WorldConfig.NOISE_SCALE);
        const rng = this.random(wx, wy);
        let tileId = 0;

        if (elevation < 0.35) {
            // WATER (Flat, Glossy)
            tileId = 16 + Math.floor(rng * 2); 
        } else if (elevation < 0.40) {
            // SAND (Flat, Grainy)
            tileId = 24 + Math.floor(rng * 2);
        } else if (elevation > 0.75) {
            // MOUNTAIN (Extruded Wall)
            tileId = 8 + Math.floor(rng * 3); 
            // Add Rock Prop on top for extra 3D
            if (rng > 0.7) this.addProp(props, cx, cy, x, y, 'rock_grey', true);
        } else {
            // GRASS (Flat, Organic)
            tileId = 0 + Math.floor(rng * 3);
            if (rng > 0.95) this.addProp(props, cx, cy, x, y, 'tree_pine', true);
        }
        
        renderMap[y][x] = tileId;
      }
    }

    // 2. MOB PASS (Simple)
    const mobCount = Math.floor(this.random(cx, cy) * 3) + 1;
    for (let i = 0; i < mobCount; i++) {
        const mx = Math.floor(this.random(i, cx) * this.CHUNK_SIZE);
        const my = Math.floor(this.random(cy, i) * this.CHUNK_SIZE);
        if (renderMap[my][mx] < 16) { // Land only
             const defId = Math.random() > 0.5 ? 'goblin' : 'orc';
             const def = MOB_REGISTRY[defId];
             mobs.push({
                 id: `mob-${cx}-${cy}-${i}`,
                 definitionId: def.id,
                 type: def.name,
                 level: Math.max(1, playerLevel),
                 tier: 'NORMAL',
                 tags: def.tags,
                 hp: def.baseHp,
                 maxHp: def.baseHp,
                 pos: { x: (cx*this.CHUNK_SIZE+mx)*this.TILE_SIZE, y: (cy*this.CHUNK_SIZE+my)*this.TILE_SIZE },
                 stats: { strength: 10, intelligence: 10, fortitude: 10, vitality: 10, willpower: 10, combatRating: 10, damage: 10, armor: 10, hp: 10, ac: 10, attack: 10, critChance: 0.05 },
                 expValue: 10,
                 isElite: false,
                 modifiers: [],
                 isAttacking: false,
                 attackStartTime: 0,
                 damageDealt: false
             });
        }
    }

    return {
      id: `${cx},${cy}`,
      x: cx, y: cy,
      width: this.CHUNK_SIZE,
      height: this.CHUNK_SIZE,
      data: renderMap,
      biome: chunkBiome,
      mobs,
      props,
      shrines: []
    };
  }

  private static addProp(list: Prop[], cx: number, cy: number, tx: number, ty: number, type: string, isSolid: boolean) {
      list.push({
          id: `prop-${cx}-${cy}-${tx}-${ty}`,
          type,
          x: (cx * this.CHUNK_SIZE + tx) * this.TILE_SIZE + 32,
          y: (cy * this.CHUNK_SIZE + ty) * this.TILE_SIZE + 32,
          width: 64, 
          height: 64,
          isSolid,
          variation: 0
      });
  }
}
