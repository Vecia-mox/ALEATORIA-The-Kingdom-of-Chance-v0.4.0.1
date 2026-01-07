
import { Position } from '../types';
import { MobileBridge } from './MobileBridge';
import { CombatSystem } from '../engine/combat/CombatSystem';
import { HUDController } from '../ui/controllers/HUDController';

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

export class InputManager {
  private scene: any;
  private keys: any;
  private isMobile: boolean;

  constructor(scene: any, isMobile: boolean) {
    this.scene = scene;
    this.isMobile = isMobile;
    
    // Initialize Keys (Q, W, E, R, F, SPACE, SHIFT, WASD)
    if (scene.input && scene.input.keyboard) {
        this.keys = scene.input.keyboard.addKeys('W,A,S,D,Q,E,R,F,SPACE,SHIFT');
    }
  }

  /**
   * Binds Touch Events from the DOM elements to the MobileBridge state.
   */
  public static setupUIListeners() {
      // Helper to bind events
      const bind = (id: string, onStart: () => void, onEnd?: () => void) => {
          const el = document.getElementById(id);
          if (!el) return;

          const start = (e: Event) => {
              e.preventDefault(); 
              onStart();
              el.classList.add('active-press');
          };
          const end = (e: Event) => {
              e.preventDefault(); 
              if (onEnd) onEnd();
              el.classList.remove('active-press');
          };

          el.addEventListener('mousedown', start);
          el.addEventListener('touchstart', start, { passive: false });
          
          el.addEventListener('mouseup', end);
          el.addEventListener('touchend', end);
          el.addEventListener('touchcancel', end);
          el.addEventListener('mouseleave', end);
      };

      // 1. ATTACK (Sword Icon)
      bind('btn-attack', 
          () => MobileBridge.isAttacking = true,
          () => MobileBridge.isAttacking = false
      );

      // 2. SKILL 1 (Spin/Tornado)
      bind('btn-skill-1', () => MobileBridge.skill1 = true, () => MobileBridge.skill1 = false);

      // 3. SKILL 2 -> DASH (Wind Icon)
      bind('btn-skill-2', 
          () => MobileBridge.isDodging = true, 
          () => MobileBridge.isDodging = false
      );

      // 4. SKILL 3 (Fireball)
      bind('btn-skill-3', () => MobileBridge.skill3 = true, () => MobileBridge.skill3 = false);

      // 5. POTION (Wine Icon)
      bind('btn-potion', () => {
          CombatSystem.usePotion(); // Instant trigger
          MobileBridge.isHealing = true;
      }, () => MobileBridge.isHealing = false);
  }

  public static vibrate(pattern: number | number[]) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
  }

  public getInputState(): InputState {
    let moveDir = { x: 0, y: 0 };
    
    // 1. KEYBOARD POLLING
    if (this.keys) {
      // Movement
      if (this.keys.W.isDown) moveDir.y = -1;
      else if (this.keys.S.isDown) moveDir.y = 1;
      if (this.keys.A.isDown) moveDir.x = -1;
      else if (this.keys.D.isDown) moveDir.x = 1;

      // Combat (Update Bridge State directly from Keys for consistency)
      if (this.keys.SPACE.isDown) {
          MobileBridge.isAttacking = true;
          HUDController.toggleButtonPress('btn-attack', true);
      } else {
          HUDController.toggleButtonPress('btn-attack', false);
      }

      if (this.keys.Q.isDown) {
          MobileBridge.skill1 = true;
          HUDController.toggleButtonPress('btn-skill-1', true);
      } else {
          HUDController.toggleButtonPress('btn-skill-1', false);
      }

      // W key is movement, but let's map Shift to Dash (Skill 2 slot)
      if (this.keys.SHIFT.isDown) {
          MobileBridge.isDodging = true;
          HUDController.toggleButtonPress('btn-skill-2', true);
      } else {
          HUDController.toggleButtonPress('btn-skill-2', false);
      }

      if (this.keys.E.isDown) {
          MobileBridge.skill3 = true;
          HUDController.toggleButtonPress('btn-skill-3', true);
      } else {
          HUDController.toggleButtonPress('btn-skill-3', false);
      }

      // Potion (Trigger on press, not hold)
      if (this.scene.input.keyboard.checkDown(this.keys.F, 500)) {
          CombatSystem.usePotion();
          HUDController.toggleButtonPress('btn-potion', true);
          setTimeout(() => HUDController.toggleButtonPress('btn-potion', false), 200);
      }
    } 
    
    // 2. JOYSTICK OVERRIDE
    if (MobileBridge.moveDir.x !== 0 || MobileBridge.moveDir.y !== 0) {
        moveDir = { ...MobileBridge.moveDir };
    }

    // Normalize
    const mag = Math.sqrt(moveDir.x * moveDir.x + moveDir.y * moveDir.y);
    if (mag > 1) {
      moveDir.x /= mag;
      moveDir.y /= mag;
    }

    // Return combined state
    return { 
        moveDir, 
        isAttacking: MobileBridge.isAttacking,
        isInteracting: MobileBridge.isInteracting,
        isDodging: MobileBridge.isDodging,
        isHealing: MobileBridge.isHealing,
        skill1: MobileBridge.skill1,
        skill2: MobileBridge.skill2,
        skill3: MobileBridge.skill3,
        skill4: MobileBridge.skill4
    };
  }
}
