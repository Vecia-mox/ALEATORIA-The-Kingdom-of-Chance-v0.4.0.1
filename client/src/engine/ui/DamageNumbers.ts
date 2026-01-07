
/**
 * TITAN ENGINE: DAMAGE NUMBERS (FCT)
 * Physics-based floating text system using Object Pooling.
 */

export type DamageStyle = 'PHYSICAL' | 'FIRE' | 'ICE' | 'LIGHTNING' | 'POISON' | 'CRIT';

interface FCT {
  id: number;
  active: boolean;
  x: number;
  y: number;
  z: number;
  text: string;
  style: DamageStyle;
  
  // Physics
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  scale: number;
}

export class DamageNumberSystem {
  private static instance: DamageNumberSystem;
  private pool: FCT[] = [];
  private activeCount: number = 0;
  private readonly POOL_SIZE = 100;

  // Render Hook (to be assigned by Renderer)
  // Params: (text, screenX, screenY, scale, alpha, style)
  public onRenderItem: ((item: FCT) => void) | null = null;

  private constructor() {
    for (let i = 0; i < this.POOL_SIZE; i++) {
      this.pool.push({
        id: i, active: false, x: 0, y: 0, z: 0, text: '', style: 'PHYSICAL',
        vx: 0, vy: 0, life: 0, maxLife: 0, scale: 1
      });
    }
  }

  public static getInstance(): DamageNumberSystem {
    if (!DamageNumberSystem.instance) DamageNumberSystem.instance = new DamageNumberSystem();
    return DamageNumberSystem.instance;
  }

  public spawn(x: number, y: number, z: number, amount: number, style: DamageStyle) {
    const fct = this.pool.find(p => !p.active);
    if (!fct) return; // Pool exhausted, skip low prio

    fct.active = true;
    fct.x = x;
    fct.y = y + 1.5; // Spawn above head
    fct.z = z;
    fct.text = Math.floor(amount).toString();
    fct.style = style;
    
    // "Juicy" Pop Logic
    const isCrit = style === 'CRIT';
    
    // 1. Initial Velocity (Explosive pop up)
    fct.vy = isCrit ? 8.0 : 4.0; 
    
    // 2. Horizontal Spread (Random arc)
    fct.vx = (Math.random() - 0.5) * (isCrit ? 4.0 : 2.0);
    
    fct.maxLife = isCrit ? 1.5 : 0.8; // Crits linger longer
    fct.life = fct.maxLife;
    fct.scale = isCrit ? 2.0 : 1.0; // Start huge for crits
  }

  public update(dt: number) {
    const GRAVITY = -15.0;
    const DRAG = 3.0;

    for (const fct of this.pool) {
      if (!fct.active) continue;

      fct.life -= dt;
      if (fct.life <= 0) {
        fct.active = false;
        continue;
      }

      // Physics Integration
      fct.x += fct.vx * dt;
      fct.y += fct.vy * dt;
      
      fct.vy += GRAVITY * dt; // Gravity pulls it down
      
      // Horizontal Drag
      if (fct.vx > 0) fct.vx = Math.max(0, fct.vx - DRAG * dt);
      else fct.vx = Math.min(0, fct.vx + DRAG * dt);

      // Crit Scale Animation (Pop big -> shrink -> hang -> fade)
      if (fct.style === 'CRIT') {
        const t = 1.0 - (fct.life / fct.maxLife);
        if (t < 0.2) {
          // Pop In
          fct.scale = this.lerp(0.5, 1.5, t / 0.2); 
        } else {
          // Slow settle
          fct.scale = this.lerp(1.5, 1.0, (t - 0.2) / 0.8);
        }
      } else {
        // Normal damage just floats
        fct.scale = 1.0; 
      }

      // Render Callback (Project 3D pos to Screen in Renderer)
      if (this.onRenderItem) this.onRenderItem(fct);
    }
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
}
