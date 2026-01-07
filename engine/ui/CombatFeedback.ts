
/**
 * TITAN ENGINE: COMBAT FEEDBACK
 * Handles visual juice: Floating Text, Screen Shake, and Hit Stop.
 */

export type DamageType = 'NORMAL' | 'CRIT' | 'HEAL' | 'BLOCK';

interface DamageNumber {
  id: number;
  text: string;
  x: number;
  y: number;
  z: number;
  life: number;
  type: DamageType;
  active: boolean;
}

export class CombatFeedbackSystem {
  private static instance: CombatFeedbackSystem;
  
  // Object Pool
  private pool: DamageNumber[] = [];
  private activeNumbers: DamageNumber[] = [];
  private poolSize = 50;

  // Shake
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;

  // Hit Stop
  private hitStopDuration: number = 0;
  public timeScale: number = 1.0;

  private constructor() {
    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push({ id: i, text: '', x:0, y:0, z:0, life:0, type: 'NORMAL', active: false });
    }
  }

  public static getInstance(): CombatFeedbackSystem {
    if (!CombatFeedbackSystem.instance) CombatFeedbackSystem.instance = new CombatFeedbackSystem();
    return CombatFeedbackSystem.instance;
  }

  public spawnDamageNumber(pos: Float32Array, amount: number, type: DamageType) {
    const num = this.pool.find(n => !n.active);
    if (!num) return; // Pool exhausted

    num.active = true;
    num.text = Math.floor(amount).toString();
    num.x = pos[0];
    num.y = pos[1] + 1.5; // Offset above head
    num.z = pos[2];
    num.type = type;
    num.life = 1.0; // Seconds

    this.activeNumbers.push(num);
  }

  public triggerScreenShake(intensity: number, duration: number) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  public triggerHitStop(durationMs: number) {
    this.hitStopDuration = durationMs / 1000;
    this.timeScale = 0.0; // Pause game logic
  }

  public update(dt: number) {
    // 1. Process Hit Stop
    if (this.hitStopDuration > 0) {
      this.hitStopDuration -= dt; // Use real dt, not scaled
      if (this.hitStopDuration <= 0) {
        this.timeScale = 1.0;
      } else {
        return; // Skip other updates
      }
    }

    const scaledDt = dt * this.timeScale;

    // 2. Update Damage Numbers
    for (let i = this.activeNumbers.length - 1; i >= 0; i--) {
      const num = this.activeNumbers[i];
      num.life -= scaledDt;
      num.y += 1.0 * scaledDt; // Float up

      if (num.life <= 0) {
        num.active = false;
        this.activeNumbers.splice(i, 1);
      }
    }

    // 3. Update Shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= scaledDt;
      if (this.shakeDuration <= 0) this.shakeIntensity = 0;
    }
  }

  public getShakeOffset(): [number, number] {
    if (this.shakeIntensity <= 0) return [0, 0];
    const x = (Math.random() - 0.5) * 2 * this.shakeIntensity;
    const y = (Math.random() - 0.5) * 2 * this.shakeIntensity;
    return [x, y];
  }

  // Called by Renderer to draw the numbers (UI Overlay)
  public getRenderData(): DamageNumber[] {
    return this.activeNumbers;
  }
}
