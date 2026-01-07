
import { MobileBridge } from '../../services/MobileBridge';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { PlayerAvatar } from '../entities/PlayerAvatar';

/**
 * TITAN ENGINE: INPUT BRIDGE
 * Converts 2D screen-space input into 3D world-space forces.
 * Handles Isometric projection math.
 */
export class InputBridge {
  private physics: PhysicsWorld;
  private avatar: PlayerAvatar;
  private localPlayerId: string | null = null;
  
  // Isometric Projection Angle (45 degrees)
  private readonly COS_45 = 0.7071;
  private readonly SIN_45 = 0.7071;
  
  // Movement Config
  private readonly MOVE_SPEED = 20.0;
  private readonly ROTATION_SPEED = 10.0; // Lerp factor

  constructor(physics: PhysicsWorld, avatar: PlayerAvatar) {
    this.physics = physics;
    this.avatar = avatar;
  }

  public setLocalPlayer(id: string) {
    this.localPlayerId = id;
  }

  public update(dt: number) {
    if (!this.localPlayerId) return;

    // 1. Get Input Vector from Legacy UI
    const input = MobileBridge.moveDir;
    const hasInput = input.x !== 0 || input.y !== 0;

    if (hasInput) {
      // 2. Transform 2D -> 3D Isometric
      // Up on stick (y=-1) should correspond to Forward-Right in World (or Forward relative to camera)
      // Assuming Camera looks at (0,0,0) from (+X, +Y, +Z) looking down diagonal
      
      // Standard Isometric Rotation:
      // WorldX = x * cos - y * sin
      // WorldZ = x * sin + y * cos
      // Inverting Y because Screen Y is down, World Z is "depth"
      const vx = input.x; 
      const vy = input.y; 

      const worldX = (vx * this.COS_45) - (vy * this.SIN_45);
      const worldZ = (vx * this.SIN_45) + (vy * this.COS_45);

      // 3. Apply Velocity to Physics Body
      // We set velocity directly for responsive ARPG feel, rather than force accumulation
      const velocity = [
        worldX * this.MOVE_SPEED,
        0, // Gravity handled by physics engine
        worldZ * this.MOVE_SPEED
      ];
      
      // We use a specific physics command to set horizontal velocity while preserving vertical
      // For MVP scaffold: Apply Impulse approx
      this.physics.setLinearVelocity(this.localPlayerId, new Float32Array(velocity));

      // 4. Smooth Rotation
      const targetAngle = Math.atan2(worldX, worldZ); // Atan2(x, z) gives angle from North
      
      // We update the Avatar's visual transform directly or via physics angular velocity
      // Here we pass the rotation request to the Avatar controller
      this.avatar.setTargetRotation(targetAngle);
    } else {
      // Dampen velocity when no input
      this.physics.setLinearVelocity(this.localPlayerId, new Float32Array([0, 0, 0]));
    }
  }
}
