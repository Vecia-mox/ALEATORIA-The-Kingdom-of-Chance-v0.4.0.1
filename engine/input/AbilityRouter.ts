
import { MobileBridge } from '../../services/MobileBridge';
import { AbilityManager } from '../skills/AbilityManager';
import { Player } from '../../types';

/**
 * TITAN ENGINE: ABILITY ROUTER
 * Maps UI Slots to Gameplay Abilities.
 */
export class AbilityRouter {
  private abilityManager: AbilityManager;
  private player: Player; // Local player reference

  constructor(abilityManager: AbilityManager, player: Player) {
    this.abilityManager = abilityManager;
    this.player = player;
  }

  public update(dt: number) {
    // Check all slots
    if (MobileBridge.skill1) this.tryCast(1);
    if (MobileBridge.skill2) this.tryCast(2);
    if (MobileBridge.skill3) this.tryCast(3);
    if (MobileBridge.skill4) this.tryCast(4);

    // Consume triggers
    MobileBridge.skill1 = false;
    MobileBridge.skill2 = false;
    MobileBridge.skill3 = false;
    MobileBridge.skill4 = false;
  }

  private tryCast(slotIndex: number) {
    const abilityId = this.player.skillLoadout[slotIndex];
    if (!abilityId) return;

    // 1. Check Resources & Cooldown
    if (this.abilityManager.canCast(abilityId, this.player.mp)) {
      
      // 2. Execute
      this.abilityManager.cast(abilityId, {
        casterId: this.player.id,
        targetPos: new Float32Array([0, 0, 0]), // Raycast from camera center in real impl
        level: this.player.level
      });

      // 3. UI Feedback (Handled by React checking Cooldown state, 
      // but we can trigger Haptics here)
      if (navigator.vibrate) navigator.vibrate(20);

    } else {
      // Cooldown/OOM Feedback
      if (navigator.vibrate) navigator.vibrate([10, 10, 10]);
      console.log(`[Ability] ${abilityId} not ready.`);
    }
  }
}
