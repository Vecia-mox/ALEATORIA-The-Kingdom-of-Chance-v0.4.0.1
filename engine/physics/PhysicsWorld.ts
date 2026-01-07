
/**
 * TITAN ENGINE: PHYSICS WORLD
 * Runs physics simulation in a separate WebWorker to prevent main-thread jank.
 * Adapts to libraries like Cannon.js or Ammo.js.
 */

// Define the Worker Code inline to avoid file loading issues in this scaffold
const WORKER_CODE = `
  // Mock Physics Engine State
  let bodies = [];
  
  self.onmessage = function(e) {
    const { type, payload } = e.data;
    
    if (type === 'ADD_BODY') {
      bodies.push({
        id: payload.id,
        pos: payload.pos, // [x,y,z]
        vel: [0,0,0],
        mass: payload.mass,
        type: 'DYNAMIC'
      });
    }

    if (type === 'REMOVE_BODY') {
      bodies = bodies.filter(b => b.id !== payload.id);
    }

    if (type === 'APPLY_IMPULSE') {
      const b = bodies.find(b => b.id === payload.id);
      if (b) {
        b.vel[0] += payload.force[0] / b.mass;
        b.vel[1] += payload.force[1] / b.mass;
        b.vel[2] += payload.force[2] / b.mass;
      }
    }

    if (type === 'SET_BODY_TYPE') {
      const b = bodies.find(b => b.id === payload.id);
      if (b) b.type = payload.bodyType;
    }

    if (type === 'SET_TRANSFORM') {
      const b = bodies.find(b => b.id === payload.id);
      if (b) {
        b.pos = payload.pos;
        // b.rot = payload.rot;
      }
    }

    if (type === 'SET_VELOCITY') {
      const b = bodies.find(b => b.id === payload.id);
      if (b) b.vel = payload.velocity;
    }
    
    if (type === 'STEP') {
      const dt = payload.dt;
      // Simulation Loop
      for (let b of bodies) {
        if (b.mass > 0 && b.type === 'DYNAMIC') {
          b.pos[1] -= 9.8 * dt * dt; // Gravity
          b.pos[0] += b.vel[0] * dt;
          b.pos[2] += b.vel[2] * dt;
        }
      }
      
      // Return Snapshot
      const snapshot = bodies.map(b => ({ id: b.id, pos: b.pos, quat: [0,0,0,1] }));
      self.postMessage({ type: 'UPDATE', snapshot });
    }
  };
`;

export interface PhysicsBodyDef {
  id: string;
  type: 'BOX' | 'SPHERE' | 'CAPSULE';
  size: number[]; // [w, h, d] or [radius]
  mass: number;
  position: [number, number, number];
}

export class PhysicsWorld {
  private worker: Worker;
  private callbacks: Map<string, (pos: number[], quat: number[]) => void> = new Map();

  constructor() {
    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));
    
    this.worker.onmessage = (e) => {
      if (e.data.type === 'UPDATE') {
        this.syncTransforms(e.data.snapshot);
      }
    };
  }

  /**
   * Adds a RigidBody to the simulation.
   */
  public addBody(def: PhysicsBodyDef, onSync: (pos: number[], quat: number[]) => void) {
    this.callbacks.set(def.id, onSync);
    this.worker.postMessage({
      type: 'ADD_BODY',
      payload: {
        id: def.id,
        pos: def.position,
        mass: def.mass
      }
    });
  }

  /**
   * Removes a RigidBody from the simulation.
   */
  public removeBody(id: string) {
    this.worker.postMessage({
      type: 'REMOVE_BODY',
      payload: { id }
    });
    this.callbacks.delete(id);
  }

  /**
   * Applies an impulse force to a body.
   */
  public applyImpulse(id: string, force: number[] | Float32Array) {
    this.worker.postMessage({
      type: 'APPLY_IMPULSE',
      payload: { id, force: Array.from(force) }
    });
  }

  /**
   * Sets the body type (Dynamic, Kinematic, Static).
   */
  public setBodyType(id: string, bodyType: 'DYNAMIC' | 'KINEMATIC' | 'STATIC') {
    this.worker.postMessage({
      type: 'SET_BODY_TYPE',
      payload: { id, bodyType }
    });
  }

  /**
   * Manually sets the position/rotation of a body (Teleport/Kinematic).
   */
  public setBodyTransform(id: string, pos: number[] | Float32Array, rot: number[] | Float32Array) {
    this.worker.postMessage({
      type: 'SET_TRANSFORM',
      payload: { id, pos: Array.from(pos), rot: Array.from(rot) }
    });
  }

  /**
   * Sets the linear velocity of a body.
   */
  public setLinearVelocity(id: string, velocity: number[] | Float32Array) {
    this.worker.postMessage({
      type: 'SET_VELOCITY',
      payload: { id, velocity: Array.from(velocity) }
    });
  }

  /**
   * Synchronous raycast (Mock implementation for scaffold).
   * In a real engine, this might need to be async or run on the main thread using a shared physics representation.
   */
  public raycast(origin: number[], direction: number[], distance: number, mask: number): { hit: boolean, point: number[], normal: number[] } {
    return {
      hit: false,
      point: [0, 0, 0],
      normal: [0, 1, 0]
    };
  }

  /**
   * Advances the simulation. Call this in the main RequestAnimationFrame.
   */
  public step(deltaTime: number) {
    this.worker.postMessage({
      type: 'STEP',
      payload: { dt: deltaTime }
    });
  }

  /**
   * Applies updates from Worker to Main Thread objects.
   */
  private syncTransforms(snapshot: any[]) {
    for (const update of snapshot) {
      const cb = this.callbacks.get(update.id);
      if (cb) {
        cb(update.pos, update.quat);
      }
    }
  }

  public terminate() {
    this.worker.terminate();
  }
}
