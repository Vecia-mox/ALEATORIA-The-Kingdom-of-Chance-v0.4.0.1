
/**
 * TITAN ENGINE: ECS MANAGER (Data-Oriented Design)
 * High-performance entity management using TypedArrays (Struct of Arrays).
 */

// Configuration
const MAX_ENTITIES = 20000;

// Bitmasks for Component Signatures
export const COMPONENT = {
  POSITION: 1 << 0,
  VELOCITY: 1 << 1,
  RENDERABLE: 1 << 2,
  COLLIDER: 1 << 3,
  HEALTH: 1 << 4,
  INPUT: 1 << 5
};

export class ECSManager {
  private static instance: ECSManager;
  
  // Entity Management
  private nextEntityId: number = 0;
  private availableIds: number[] = [];
  private signatures: Uint32Array = new Uint32Array(MAX_ENTITIES); // Bitmask per entity
  
  // --- COMPONENT ARRAYS (SoA Layout) ---
  // Position (x, y, z)
  public pos: Float32Array = new Float32Array(MAX_ENTITIES * 3);
  // Velocity (vx, vy, vz)
  public vel: Float32Array = new Float32Array(MAX_ENTITIES * 3);
  // Renderable (meshId, scale) - We store meshId as float hash or index
  public renderMesh: Int16Array = new Int16Array(MAX_ENTITIES); 
  public scale: Float32Array = new Float32Array(MAX_ENTITIES);
  // Health (current, max)
  public hp: Int16Array = new Int16Array(MAX_ENTITIES);
  public maxHp: Int16Array = new Int16Array(MAX_ENTITIES);

  // System Registry
  private systems: ((dt: number) => void)[] = [];

  private constructor() {
    this.registerSystems();
  }

  public static getInstance(): ECSManager {
    if (!ECSManager.instance) ECSManager.instance = new ECSManager();
    return ECSManager.instance;
  }

  public createEntity(): number {
    let id: number;
    if (this.availableIds.length > 0) {
      id = this.availableIds.pop()!;
    } else {
      id = this.nextEntityId++;
    }
    
    if (id >= MAX_ENTITIES) {
      throw new Error("ECS: Max entities reached!");
    }

    this.signatures[id] = 0; // Reset components
    return id;
  }

  public deleteEntity(id: number) {
    this.signatures[id] = 0;
    this.availableIds.push(id);
    // Data remains in arrays but is ignored due to signature check
  }

  public addComponent(id: number, mask: number) {
    this.signatures[id] |= mask;
  }

  public removeComponent(id: number, mask: number) {
    this.signatures[id] &= ~mask;
  }

  // --- DATA ACCESS HELPERS ---
  
  public setPosition(id: number, x: number, y: number, z: number) {
    const i = id * 3;
    this.pos[i] = x;
    this.pos[i+1] = y;
    this.pos[i+2] = z;
    this.addComponent(id, COMPONENT.POSITION);
  }

  public setVelocity(id: number, x: number, y: number, z: number) {
    const i = id * 3;
    this.vel[i] = x;
    this.vel[i+1] = y;
    this.vel[i+2] = z;
    this.addComponent(id, COMPONENT.VELOCITY);
  }

  // --- SYSTEMS DEFINITION ---

  private registerSystems() {
    // 1. Movement System
    this.systems.push((dt: number) => {
      const mask = COMPONENT.POSITION | COMPONENT.VELOCITY;
      for (let i = 0; i < this.nextEntityId; i++) {
        if ((this.signatures[i] & mask) === mask) {
          const idx = i * 3;
          this.pos[idx]     += this.vel[idx] * dt;
          this.pos[idx + 1] += this.vel[idx + 1] * dt;
          this.pos[idx + 2] += this.vel[idx + 2] * dt;
        }
      }
    });

    // 2. Bounds Check (Simple world wrap for demo)
    this.systems.push((dt: number) => {
      const mask = COMPONENT.POSITION;
      const BOUNDS = 1000;
      for (let i = 0; i < this.nextEntityId; i++) {
        if ((this.signatures[i] & mask) === mask) {
          const idx = i * 3;
          if (this.pos[idx] > BOUNDS) this.pos[idx] = -BOUNDS;
          if (this.pos[idx] < -BOUNDS) this.pos[idx] = BOUNDS;
        }
      }
    });
  }

  // --- MAIN LOOP ---

  public update(dt: number) {
    for (const system of this.systems) {
      system(dt);
    }
  }
}
