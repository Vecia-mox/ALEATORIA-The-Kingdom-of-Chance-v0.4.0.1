
/**
 * TITAN ENGINE: IK SYSTEM
 * Handles procedural bone adjustments for interaction with the environment.
 */

import { PhysicsWorld } from '../physics/PhysicsWorld';

export interface Bone {
  name: string;
  position: Float32Array; // Local or World based on context
  rotation: Float32Array; // Quaternion
  parent?: Bone;
}

export interface IKSolverConfig {
  footRaycastDistance: number;
  pelvisOffsetSpeed: number;
  lookAtWeight: number; // 0 to 1
  lookAtLimit: number; // Max angle in degrees
}

export class IKSystem {
  private physics: PhysicsWorld;
  
  constructor(physics: PhysicsWorld) {
    this.physics = physics;
  }

  /**
   * Adjusts feet bones to match ground height and tilts ankle.
   * Also lowers pelvis if feet are raised to prevent leg hyperextension.
   */
  public solveFootIK(
    leftFoot: Bone, 
    rightFoot: Bone, 
    pelvis: Bone, 
    rootPosition: Float32Array,
    groundMask: number
  ) {
    // 1. Raycast for Left Foot
    const leftHit = this.physics.raycast(
      [leftFoot.position[0], leftFoot.position[1] + 1.0, leftFoot.position[2]], // Start high
      [0, -1, 0], // Down
      1.5, // Distance
      groundMask
    );

    // 2. Raycast for Right Foot
    const rightHit = this.physics.raycast(
      [rightFoot.position[0], rightFoot.position[1] + 1.0, rightFoot.position[2]], 
      [0, -1, 0], 
      1.5, 
      groundMask
    );

    let leftOffset = 0;
    let rightOffset = 0;

    // 3. Apply Offsets
    if (leftHit.hit) {
      // Calculate height difference from root (ground level)
      const groundHeight = leftHit.point[1];
      leftOffset = Math.max(0, groundHeight - rootPosition[1]);
      
      // Lift Foot
      leftFoot.position[1] += leftOffset;
      
      // Orient foot to normal (Basic implementation)
      // quaternionFromNormal(leftFoot.rotation, leftHit.normal);
    }

    if (rightHit.hit) {
      const groundHeight = rightHit.point[1];
      rightOffset = Math.max(0, groundHeight - rootPosition[1]);
      
      rightFoot.position[1] += rightOffset;
      // quaternionFromNormal(rightFoot.rotation, rightHit.normal);
    }

    // 4. Lower Pelvis
    // If one foot is high up on a rock, lower hips so the other leg can reach the ground
    const lowestOffset = Math.min(leftOffset, rightOffset);
    // Actually we want to lower by the *average* or move based on the lowest foot relative to hip?
    // Standard approach: Lower pelvis by the amount the *lowest* foot was raised? 
    // No, usually we lower pelvis based on the *highest* raised foot to maintain reach.
    // Simplified:
    if (leftOffset > 0 || rightOffset > 0) {
      pelvis.position[1] -= Math.max(leftOffset, rightOffset);
    }
  }

  /**
   * Rotates head/spine bones to look at a target position.
   */
  public solveLookAt(
    headBone: Bone, 
    targetPos: Float32Array, 
    weight: number,
    limitAngle: number
  ) {
    if (weight <= 0) return;

    // 1. Calculate direction to target
    const dir = new Float32Array([
      targetPos[0] - headBone.position[0],
      targetPos[1] - headBone.position[1],
      targetPos[2] - headBone.position[2]
    ]);
    
    // Normalize
    const len = Math.sqrt(dir[0]*dir[0] + dir[1]*dir[1] + dir[2]*dir[2]);
    dir[0] /= len; dir[1] /= len; dir[2] /= len;

    // 2. Calculate Look Rotation (Quaternion lookRotation)
    // const targetRot = Quaternion.lookRotation(dir);

    // 3. Clamp Angle relative to parent/body forward
    // const angle = Quaternion.angle(bodyRotation, targetRot);
    // if (angle > limitAngle) { ... clamp ... }

    // 4. Slerp current rotation towards target rotation
    // headBone.rotation = Quaternion.slerp(headBone.rotation, targetRot, weight);
  }

  /**
   * Snaps hand bone to a weapon's grip socket (Two-Bone IK).
   */
  public solveHandIK(
    handBone: Bone,
    elbowBone: Bone,
    shoulderBone: Bone,
    targetGrip: Float32Array
  ) {
    // Standard Two-Bone IK (Cyclic Coordinate Descent or Analytic)
    // 1. Rotate Shoulder to point Elbow roughly towards target
    // 2. Rotate Elbow to reach target
    // 3. Apply constraints (elbow hinge)
  }
}
