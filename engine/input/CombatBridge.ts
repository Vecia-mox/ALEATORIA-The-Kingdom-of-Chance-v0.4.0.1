
import { MobileBridge } from '../../services/MobileBridge';
import { CombatController } from '../combat/CombatSystem';
import { PlayerAvatar } from '../entities/PlayerAvatar';
import { VFXDirector } from '../vfx/VFXDirector';

/**
 * TITAN ENGINE: COMBAT BRIDGE
 * Orchestrates the "Big Red Button".
 */
export class CombatBridge {
  private combat: CombatController;
  private avatar: PlayerAvatar;
  private playerId: string;

  constructor(combat: CombatController, avatar: PlayerAvatar, playerId: string) {
    this.combat = combat;
    this.avatar = avatar;
    this.playerId = playerId;
  }

  public update(dt: number) {
    // 1. Check Trigger
    if (MobileBridge.isAttacking) {
      // Consume trigger immediately to prevent machine-gunning
      // (Unless auto-fire logic is desired)
      MobileBridge.isAttacking = false; 
      
      this.triggerPrimaryAttack();
    }
  }

  private triggerPrimaryAttack() {
    // 1. Queue Action in Combat System
    // This handles combo windows, hitboxes, and state transitions
    this.combat.requestAttack([
      {
        animName: 'Attack_Melee_01',
        damageMult: 1.0,
        duration: 500,
        activeWindow: [100, 300],
        comboWindow: [300, 500],
        hitbox: { id: 'sword', bone: 'RightHand', size: [1,1,1], offset: [0,0,1] },
        impulse: 5.0
      },
      {
        animName: 'Attack_Melee_02',
        damageMult: 1.2,
        duration: 600,
        activeWindow: [150, 350],
        comboWindow: [400, 600],
        hitbox: { id: 'sword', bone: 'RightHand', size: [1,1,1], offset: [0,0,1] },
        impulse: 8.0
      }
    ]);

    // 2. Trigger Visual Animation
    // The CombatSystem tracks state, but Avatar handles the mesh playback
    // Ideally CombatSystem emits an event, but direct coupling is fine for Bridge
    if (this.combat.state === 'IDLE' || this.combat.state === 'ATTACKING') {
       // Avatar selects animation based on Combat Controller's combo index
       const comboIdx = this.combat.comboIndex;
       const anim = comboIdx % 2 === 0 ? 'Attack_A' : 'Attack_B';
       this.avatar.playAnimation(anim);
       
       // 3. VFX
       const handPos = this.avatar.getBonePosition('RightHand'); // Mock
       VFXDirector.getInstance().triggerEffect('SwordTrail', handPos, new Float32Array([0,0,1]));
    }
  }
}
