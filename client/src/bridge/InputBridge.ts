
import { MobileBridge } from '../services/MobileBridge';
import { PhysicsWorld } from '../../engine/physics/PhysicsWorld';
import { InputSystem } from '../../engine/input/InputSystem';

/**
 * TITAN ENGINE: INPUT BRIDGE
 * Connects the "MobileBridge" (UI Joystick) to the Physics Simulation.
 */
export class InputBridge {
  private physics: PhysicsWorld;
  private localPlayerId: string | null = null;
  private inputSystem: InputSystem;

  constructor(physics: PhysicsWorld) {
    this.physics = physics;
    this.inputSystem = InputSystem.getInstance();
  }

  public setLocalPlayer(id: string) {
    this.localPlayerId = id;
  }

  public update(dt: number) {
    if (!this.localPlayerId) return;

    // 1. Read Joystick (Normalized Vector)
    // The MobileBridge is updated by the React UI components
    const moveDir = MobileBridge.moveDir;
    const isAttacking = MobileBridge.isAttacking;
    const isDodging = MobileBridge.isDodging;

    // 2. Convert to Physics Force
    if (moveDir.x !== 0 || moveDir.y !== 0) {
      // Calculate Impulse
      // X = Left/Right, Z = Forward/Back (mapped from Y)
      const speed = 50.0;
      const force = [
        moveDir.x * speed,
        0,
        moveDir.y * speed
      ];

      // Apply to Active Ragdoll's Center of Mass (Hips)
      // The RagdollController will handle balancing logic (Phase 15)
      this.physics.applyImpulse(`${this.localPlayerId}_ragdoll_Hips`, new Float32Array(force));
      
      // Rotate character to face movement direction
      // const angle = Math.atan2(moveDir.y, moveDir.x);
      // this.physics.setTargetRotation(...);
    }

    // 3. Handle Actions
    if (isAttacking) {
      // Trigger Physics-Based Animation (Euphoria-lite)
      // This applies torque to the arm bones to swing the weapon
      // RagdollController.triggerAction(this.localPlayerId, 'SWING_RIGHT');
    }

    if (isDodging) {
      // Apply sudden impulse for dash
      // this.physics.applyImpulse(..., dashForce);
    }
  }
}
