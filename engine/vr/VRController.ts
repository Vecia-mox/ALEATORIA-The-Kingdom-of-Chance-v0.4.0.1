
/**
 * TITAN ENGINE: VR CONTROLLER
 * Tracks 6-DOF Hands and Handles Teleportation Logic.
 */

import { XRManager } from './XRManager';

export interface VRHand {
  inputSource: XRInputSource;
  gripTransform: Float32Array; // Matrix4
  targetRayTransform: Float32Array; // Matrix4
  handedness: 'left' | 'right' | 'none';
  buttons: {
    trigger: boolean;
    squeeze: boolean;
    thumbstick: boolean;
    buttonA: boolean; // or X
    buttonB: boolean; // or Y
  };
  axes: {
    thumbstick: [number, number]; // x, y (-1 to 1)
  };
}

export class VRController {
  private xr: XRManager;
  public leftHand: VRHand | null = null;
  public rightHand: VRHand | null = null;

  // Teleport State
  private isAimingTeleport: boolean = false;
  private teleportPoints: Float32Array = new Float32Array(30 * 3); // 30 points curve
  private validTeleportTarget: Float32Array | null = null;

  constructor(xrManager: XRManager) {
    this.xr = xrManager;
  }

  public update() {
    const session = (this.xr as any).session;
    const refSpace = this.xr.getReferenceSpace();
    if (!session || !refSpace) return;

    // Iterate Sources
    for (const source of session.inputSources) {
      if (source.hand) {
        // Handle Hand Tracking (joints) - skipped for Controller focus in this MVP
        continue; 
      }
      
      if (source.gamepad) {
        const handData = this.parseInputSource(source, refSpace, (window as any).frame); // Frame assumed global or passed
        if (source.handedness === 'left') this.leftHand = handData;
        if (source.handedness === 'right') this.rightHand = handData;
      }
    }

    this.processTeleportation();
  }

  private parseInputSource(source: XRInputSource, refSpace: XRReferenceSpace, frame: XRFrame): VRHand {
    let gripMat = new Float32Array(16);
    let rayMat = new Float32Array(16);

    if (source.gripSpace && frame) {
      const pose = frame.getPose(source.gripSpace, refSpace);
      if (pose) gripMat = pose.transform.matrix;
    }
    
    if (source.targetRaySpace && frame) {
      const pose = frame.getPose(source.targetRaySpace, refSpace);
      if (pose) rayMat = pose.transform.matrix;
    }

    const gp = source.gamepad!;
    return {
      inputSource: source,
      handedness: source.handedness,
      gripTransform: gripMat,
      targetRayTransform: rayMat,
      buttons: {
        trigger: gp.buttons[0]?.pressed || false,
        squeeze: gp.buttons[1]?.pressed || false,
        thumbstick: gp.buttons[3]?.pressed || false,
        buttonA: gp.buttons[4]?.pressed || false,
        buttonB: gp.buttons[5]?.pressed || false,
      },
      axes: {
        thumbstick: [gp.axes[2] || 0, gp.axes[3] || 0]
      }
    };
  }

  private processTeleportation() {
    // Logic: Use Right Stick Up to aim, Release to teleport
    const hand = this.rightHand;
    if (!hand) return;

    // Check Thumbstick Y (> 0.5 means pushed forward)
    const isPushingStick = hand.axes.thumbstick[1] < -0.5; // WebXR Y is often inverted relative to screen

    if (isPushingStick) {
      this.isAimingTeleport = true;
      this.calculateBezierCurve(hand.targetRayTransform);
    } else if (this.isAimingTeleport) {
      // Released
      this.isAimingTeleport = false;
      if (this.validTeleportTarget) {
        this.performTeleport(this.validTeleportTarget);
      }
    }
  }

  private calculateBezierCurve(originMat: Float32Array) {
    // Extract Position and Forward Vector from Matrix
    const ox = originMat[12];
    const oy = originMat[13];
    const oz = originMat[14];
    
    // Forward is -Z column in WebXR usually
    const fx = -originMat[8];
    const fy = -originMat[9];
    const fz = -originMat[10];

    // Simple Arc: P0 (Hand) -> P1 (Forward/Up) -> P2 (Ground)
    // Simplified for MVP: Raycast to ground plane (y=0)
    
    // If aiming down or slightly up
    if (fy < 0.1) { 
        // Mock ground intersection
        // t = -oy / fy;
        // target = origin + forward * t
        // This is where Physics.raycast would be used
        this.validTeleportTarget = new Float32Array([ox + fx * 5, 0, oz + fz * 5]);
    } else {
        this.validTeleportTarget = null;
    }
  }

  private performTeleport(target: Float32Array) {
    console.log(`[VR] Teleporting to ${target[0]}, ${target[1]}, ${target[2]}`);
    
    const session = (this.xr as any).session;
    const refSpace = this.xr.getReferenceSpace();
    
    if (session && refSpace) {
      // Create new reference space offset by target
      // This "moves the world" relative to the player
      const offset = new XRRigidTransform(
        { x: -target[0], y: 0, z: -target[2] } // Negative because we move the space
      );
      const newRefSpace = refSpace.getOffsetReferenceSpace(offset);
      // We'd need to update the main manager's ref space
      // this.xr.setReferenceSpace(newRefSpace); // Requires XRManager update
    }
  }
}
