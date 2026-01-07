
import { Position, Player } from '../types';
import { MAX_SPEED, TICK_RATE_MS } from '../constants';

export class Warden {
  /**
   * Validates movement packets to prevent speed hacking.
   */
  static validateMovement(player: Player, requestedPos: Position, deltaTimeMs: number): boolean {
    const dx = requestedPos.x - player.pos.x;
    const dy = requestedPos.y - player.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Server allows a small buffer for latency
    const maxAllowed = MAX_SPEED * (deltaTimeMs / TICK_RATE_MS) * 1.1;
    
    return distance <= maxAllowed;
  }

  /**
   * Validates attack frequency.
   */
  static validateAttackRate(lastAttack: number, cooldown: number): boolean {
    return Date.now() - lastAttack >= cooldown;
  }
}
