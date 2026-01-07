
import { Scene, Types } from 'phaser';
import { InputState } from './InputManager';
import { PhysicsManager } from './PhysicsManager';

type PlayerState = 'IDLE' | 'MOVE' | 'ATTACK' | 'DASH';

export class PlayerController {
  private scene: Scene;
  private sprite: Types.Physics.Arcade.SpriteWithDynamicBody;
  
  // State Machine
  private state: PlayerState = 'IDLE';
  private stateTimer: number = 0;
  
  // Configuration
  private readonly ATTACK_DURATION = 300; // Fast snappy attack
  private readonly DASH_DURATION = 200;
  private readonly DASH_COOLDOWN = 800;
  private readonly ATTACK_COOLDOWN = 350;
  
  // Cooldowns & Buffers
  private lastDashTime = 0;
  private lastAttackTime = 0;
  private inputBuffer: { action: 'ATTACK' | 'DASH', time: number } | null = null;
  private BUFFER_WINDOW = 200; // ms to buffer input

  // Physics
  private velocity = { x: 0, y: 0 };
  private facing = { x: 1, y: 0 };

  // Callbacks
  private onAttackTrigger: (dir: {x: number, y: number}) => void;
  private onMoveTrigger: (pos: {x: number, y: number}) => void;

  constructor(
    scene: Scene, 
    sprite: Types.Physics.Arcade.SpriteWithDynamicBody,
    onAttack: (dir: {x: number, y: number}) => void,
    onMove: (pos: {x: number, y: number}) => void
  ) {
    this.scene = scene;
    this.sprite = sprite;
    this.onAttackTrigger = onAttack;
    this.onMoveTrigger = onMove;
  }

  public update(input: InputState, time: number, delta: number) {
    if (!this.sprite.active) return;

    // 1. Handle Input Buffering
    if (input.isAttacking) this.bufferInput('ATTACK', time);
    if (input.isDodging) this.bufferInput('DASH', time);

    // 2. State Machine Transition Check
    switch (this.state) {
        case 'IDLE':
        case 'MOVE':
            this.handleStandardMovement(input, time);
            break;
        case 'ATTACK':
            this.handleAttackState(input, time, delta);
            break;
        case 'DASH':
            this.handleDashState(time);
            break;
    }

    // 3. Update Facing
    if (input.moveDir.x !== 0 || input.moveDir.y !== 0) {
        this.facing = { ...input.moveDir };
    }
  }

  private bufferInput(action: 'ATTACK' | 'DASH', time: number) {
      // Only buffer if we aren't already buffering a later input
      if (!this.inputBuffer || time > this.inputBuffer.time) {
          this.inputBuffer = { action, time };
      }
  }

  private checkBufferedInput(time: number): boolean {
      if (!this.inputBuffer) return false;
      
      // Expire old buffer
      if (time - this.inputBuffer.time > this.BUFFER_WINDOW) {
          this.inputBuffer = null;
          return false;
      }
      
      const action = this.inputBuffer.action;
      // Don't consume yet if we can't execute, but for this simplified model we try and fail/succeed
      this.inputBuffer = null; 

      if (action === 'DASH') return this.tryDash(this.facing, time);
      if (action === 'ATTACK') return this.tryAttack(time);
      
      return false;
  }

  private handleStandardMovement(input: InputState, time: number) {
      // Check Interrupts (Buffered or Direct)
      if (this.checkBufferedInput(time)) return; 
      if (input.isDodging && this.tryDash(input.moveDir, time)) return;
      if (input.isAttacking && this.tryAttack(time)) return;

      // Standard Movement
      const speed = 200;
      if (input.moveDir.x !== 0 || input.moveDir.y !== 0) {
          this.state = 'MOVE';
          this.sprite.setVelocity(input.moveDir.x * speed, input.moveDir.y * speed);
          this.onMoveTrigger({ x: this.sprite.x, y: this.sprite.y });
      } else {
          this.state = 'IDLE';
          this.sprite.setVelocity(0, 0);
      }
  }

  private handleAttackState(input: InputState, time: number, delta: number) {
      // Animation Canceling: Dash cancels Attack immediately
      if (this.inputBuffer?.action === 'DASH' || input.isDodging) {
          if (this.tryDash(input.moveDir.x === 0 && input.moveDir.y === 0 ? this.facing : input.moveDir, time)) {
              return;
          }
      }

      // Friction / Slide (Game Juice: Don't stop instantly)
      const friction = 0.85; 
      const v = this.sprite.body.velocity;
      this.sprite.setVelocity(v.x * friction, v.y * friction);

      // Attack End
      if (time > this.stateTimer) {
          this.state = 'IDLE';
          // Reset animation to idle texture (assuming class key)
          if (this.sprite.anims.currentAnim && this.sprite.anims.currentAnim.key === 'barbarian-attack') {
              this.sprite.stop();
              // HACK: Revert to base texture. 
              //Ideally we would have an IDLE anim, but here we just reset to the class texture
              const textureKey = this.sprite.texture.key.replace('-attack-0', '').replace('-attack-1', '').replace('-attack-2', '');
              // If we created a new texture for the anim frames, the base key is 'char-barbarian'
              this.sprite.setTexture('char-barbarian'); 
          }
          // Immediately check buffer to chain attacks
          this.checkBufferedInput(time);
      }
  }

  private handleDashState(time: number) {
      if (time > this.stateTimer) {
          this.state = 'IDLE';
          this.sprite.setVelocity(0, 0);
      }
  }

  private tryAttack(time: number): boolean {
      if (time - this.lastAttackTime < this.ATTACK_COOLDOWN) return false;
      
      this.state = 'ATTACK';
      this.lastAttackTime = time;
      this.stateTimer = time + this.ATTACK_DURATION;
      
      // Play Animation
      if (this.scene.anims.exists('barbarian-attack')) {
          this.sprite.play('barbarian-attack', true);
      }

      // Visual Lunge
      const lungeForce = 120;
      this.sprite.setVelocity(this.facing.x * lungeForce, this.facing.y * lungeForce);
      
      // BUG FIX: Infinite Growth
      this.sprite.setScale(1); // Force reset start
      
      // Visual Squash/Stretch (still nice to keep on top of anim)
      this.scene.tweens.add({
          targets: this.sprite,
          scaleX: 1.2,
          scaleY: 0.8,
          duration: 100, // Short pop
          yoyo: true,
          onComplete: () => {
              if (this.sprite.active) this.sprite.setScale(1); // Force reset end
          }
      });

      // Trigger Game Action
      this.onAttackTrigger(this.facing);
      
      return true;
  }

  private tryDash(dir: {x: number, y: number}, time: number): boolean {
      if (time - this.lastDashTime < this.DASH_COOLDOWN) return false;
      
      this.state = 'DASH';
      this.lastDashTime = time;
      this.stateTimer = time + this.DASH_DURATION;
      
      let d = dir;
      if (d.x === 0 && d.y === 0) d = this.facing;

      const speed = 600;
      this.sprite.setVelocity(d.x * speed, d.y * speed);
      
      // Visuals
      PhysicsManager.applyDash(this.sprite, d, speed);
      
      return true;
  }
}
