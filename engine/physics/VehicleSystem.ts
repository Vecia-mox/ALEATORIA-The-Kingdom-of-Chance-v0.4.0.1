
/**
 * TITAN ENGINE: VEHICLE SYSTEM
 * Raycast-based vehicle physics for Cars, Bikes, and Boats.
 */

import { PhysicsWorld } from './PhysicsWorld';

export type VehicleType = 'CAR' | 'BIKE' | 'BOAT';

export interface WheelConfig {
  localPosition: [number, number, number]; // Relative to chassis
  radius: number;
  suspensionRestLength: number;
  springStrength: number;
  springDamper: number;
  isSteering: boolean;
  isPowered: boolean;
}

export interface VehicleConfig {
  id: string;
  type: VehicleType;
  mass: number;
  engineForce: number;
  drag: number; // Air resistance
  wheels: WheelConfig[];
}

export class VehicleSystem {
  private physics: PhysicsWorld;
  private vehicles: Map<string, VehicleController> = new Map();

  constructor(physics: PhysicsWorld) {
    this.physics = physics;
  }

  public registerVehicle(config: VehicleConfig, chassisBodyId: string) {
    const controller = new VehicleController(config, chassisBodyId, this.physics);
    this.vehicles.set(config.id, controller);
  }

  public update(dt: number, inputs: Map<string, { throttle: number, steer: number, brake: boolean }>) {
    this.vehicles.forEach((vehicle, id) => {
      const input = inputs.get(id) || { throttle: 0, steer: 0, brake: false };
      vehicle.update(dt, input);
    });
  }
}

class VehicleController {
  private config: VehicleConfig;
  private chassisId: string;
  private physics: PhysicsWorld;
  
  // State
  private currentSpeed: number = 0;
  private engineRPM: number = 1000;
  private currentGear: number = 1;

  constructor(config: VehicleConfig, chassisId: string, physics: PhysicsWorld) {
    this.config = config;
    this.chassisId = chassisId;
    this.physics = physics;
  }

  public update(dt: number, input: { throttle: number, steer: number, brake: boolean }) {
    // 1. Get Chassis Transform (Mock: requires sync from physics engine)
    const chassisPos = [0, 0, 0]; // this.physics.getBodyPosition(this.chassisId);
    const chassisRot = [0, 0, 0, 1]; // Quaternion
    
    // 2. Process Wheels (Suspension & Grip)
    for (const wheel of this.config.wheels) {
      this.processWheel(wheel, chassisPos, chassisRot, dt, input);
    }

    // 3. Buoyancy (Boats only)
    if (this.config.type === 'BOAT') {
      this.processBuoyancy(chassisPos);
    }

    // 4. Engine & Transmission
    this.processDrivetrain(input.throttle);
  }

  private processWheel(wheel: WheelConfig, rootPos: number[], rootRot: number[], dt: number, input: any) {
    // Transform local wheel pos to world pos
    // const wheelWorldPos = ...; 
    const wheelWorldPos = [rootPos[0] + wheel.localPosition[0], rootPos[1] + wheel.localPosition[1], rootPos[2] + wheel.localPosition[2]];
    
    // Raycast Down
    const rayStart = wheelWorldPos;
    const rayDir = [0, -1, 0]; // Local Down transformed
    const maxLen = wheel.suspensionRestLength + wheel.radius;
    
    const hit = this.physics.raycast(rayStart, rayDir, maxLen, 1); // Mask 1 = Ground

    if (hit.hit) {
      // A. SUSPENSION FORCE (Hooke's Law)
      // F = -k * x - c * v
      // x = compression distance
      const distance = 0; // distance(rayStart, hit.point);
      const compression = 1.0 - (distance / maxLen); // 0 to 1
      
      const springForce = compression * wheel.springStrength;
      // Damping requires previous compression state, omitted for brevity
      
      const upForce = [0, springForce, 0]; // Apply along local Up
      this.physics.applyImpulse(this.chassisId, upForce);

      // B. FRICTION / GRIP
      // Lateral velocity needs to be cancelled to prevent sliding
      // this.applyTireFriction(wheel, ...);

      // C. PROPULSION
      if (wheel.isPowered) {
        const forceMag = input.throttle * this.config.engineForce;
        // Apply forward force based on wheel rotation (steering)
        const forwardForce = [0, 0, forceMag]; // Local Z
        this.physics.applyImpulse(this.chassisId, forwardForce);
      }
    }
  }

  private processBuoyancy(pos: number[]) {
    // Water level assumed at y=0 for demo
    const waterLevel = 0;
    if (pos[1] < waterLevel) {
      const depth = waterLevel - pos[1];
      const displacementForce = depth * this.config.mass * 20.0; // Archimedies
      this.physics.applyImpulse(this.chassisId, [0, displacementForce, 0]);
      
      // Add Drag (Water resistance)
      // this.physics.applyDrag(this.chassisId, 2.0);
    }
  }

  private processDrivetrain(throttle: number) {
    // Simple RPM simulation
    if (throttle > 0) {
      this.engineRPM += throttle * 200;
    } else {
      this.engineRPM -= 100;
    }
    
    this.engineRPM = Math.max(800, Math.min(this.engineRPM, 7000));

    // Automatic Shifting
    if (this.engineRPM > 6000 && this.currentGear < 5) {
      this.currentGear++;
      this.engineRPM = 4000; // Drop RPM on upshift
    } else if (this.engineRPM < 2000 && this.currentGear > 1) {
      this.currentGear--;
      this.engineRPM = 4500; // Spike RPM on downshift
    }
  }
}
