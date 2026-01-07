
import { Position } from '../types';
import { MobileBridge } from './MobileBridge';

export interface InputState {
  moveDir: { x: number; y: number };
  isAttacking: boolean;
  isInteracting: boolean;
  isDodging: boolean;
  isHealing: boolean;
  skill1?: boolean;
  skill2?: boolean;
  skill3?: boolean;
  skill4?: boolean;
}

/**
 * InputManager unifies input logic for PC (Keyboard/Mouse) and Mobile (Touch/Joystick).
 */
export class InputManager {
  private scene: any;
  private cursors: any;
  private keys: any;
  private isMobile: boolean;

  constructor(scene: any, isMobile: boolean) {
    this.scene = scene;
    this.isMobile = isMobile;
    
    if (!isMobile) {
      // Phaser keyboard init (Legacy path)
      if (scene.input && scene.input.keyboard) {
          this.cursors = scene.input.keyboard.createCursorKeys();
          this.keys = scene.input.keyboard.addKeys('W,A,S,D,E,Q,SPACE,SHIFT,ONE,TWO,THREE,FOUR');
      }
    }
  }

  /**
   * Triggers device vibration if supported.
   * @param pattern Milliseconds or pattern array
   */
  public static vibrate(pattern: number | number[]) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
  }

  public getInputState(): InputState {
    let moveDir = { x: 0, y: 0 };
    let isAttacking = false;
    let isInteracting = false;
    let isDodging = false;
    let isHealing = false;
    let skill1 = false;
    let skill2 = false;
    let skill3 = false;
    let skill4 = false;

    // KEYBOARD (PC)
    if (!this.isMobile && this.keys) {
      if (this.keys.W.isDown || this.cursors.up.isDown) moveDir.y = -1;
      else if (this.keys.S.isDown || this.cursors.down.isDown) moveDir.y = 1;
      if (this.keys.A.isDown || this.cursors.left.isDown) moveDir.x = -1;
      else if (this.keys.D.isDown || this.cursors.right.isDown) moveDir.x = 1;

      isAttacking = this.scene.input.keyboard.checkDown(this.keys.SPACE, 500);
      isInteracting = this.scene.input.keyboard.checkDown(this.keys.E, 500);
      isHealing = this.scene.input.keyboard.checkDown(this.keys.Q, 500);
      isDodging = this.scene.input.keyboard.checkDown(this.keys.SHIFT, 250);
      
      skill1 = this.scene.input.keyboard.checkDown(this.keys.ONE, 250);
      skill2 = this.scene.input.keyboard.checkDown(this.keys.TWO, 250);
      skill3 = this.scene.input.keyboard.checkDown(this.keys.THREE, 250);
      skill4 = this.scene.input.keyboard.checkDown(this.keys.FOUR, 250);
    } 
    
    // MOBILE / VIRTUAL JOYSTICK OVERRIDE
    // If joystick is moved, it overrides keyboard
    if (MobileBridge.moveDir.x !== 0 || MobileBridge.moveDir.y !== 0) {
        moveDir = { ...MobileBridge.moveDir };
    }
    
    // Combine triggers
    if (MobileBridge.isAttacking) isAttacking = true;
    if (MobileBridge.isDodging) isDodging = true;
    if (MobileBridge.isInteracting) isInteracting = true;
    if (MobileBridge.isHealing) isHealing = true;
    if (MobileBridge.skill1) skill1 = true;
    if (MobileBridge.skill2) skill2 = true;
    if (MobileBridge.skill3) skill3 = true;
    if (MobileBridge.skill4) skill4 = true;

    // Reset instant triggers in bridge
    if (MobileBridge.isDodging) MobileBridge.isDodging = false;
    if (MobileBridge.isInteracting) MobileBridge.isInteracting = false;
    if (MobileBridge.isHealing) MobileBridge.isHealing = false;

    // Normalize Vector
    const mag = Math.sqrt(moveDir.x * moveDir.x + moveDir.y * moveDir.y);
    if (mag > 1) {
      moveDir.x /= mag;
      moveDir.y /= mag;
    }

    return { moveDir, isAttacking, isInteracting, isDodging, isHealing, skill1, skill2, skill3, skill4 };
  }
}
