
/**
 * TITAN ENGINE: ESSENCE MANAGER
 * Manages the "Build Enabler" system: Destroying items to save their powers.
 */

import { Item, Equipment } from '../../types'; // Shared types assumed

export interface EssenceLibrary {
  // Map Slot Type -> List of Affix IDs
  extracted: Record<string, Set<string>>;
}

export class EssenceManager {
  
  /**
   * Destroys a legendary item and saves its power to the player's library.
   */
  public static extractEssence(playerLib: EssenceLibrary, item: Item): { success: boolean, msg: string } {
    if (item.rarity !== 'LEGENDARY' && item.rarity !== 'UNIQUE') {
      return { success: false, msg: "Only Legendary items contain Essence." };
    }

    // Find the legendary power affix (Usually type 'MISC' or special flag)
    // For this engine, we assume the item.id or a specific property tracks the 'Power ID'
    // Simplified: Use the first affix as the power for this example
    const legendaryAffix = item.affixes.find(a => a.type === 'MISC' && a.label.startsWith('★'));
    
    if (!legendaryAffix) {
      return { success: false, msg: "This item has no extractable power." };
    }

    const slotKey = item.slot || 'MAIN_HAND';
    if (!playerLib.extracted[slotKey]) {
      playerLib.extracted[slotKey] = new Set();
    }

    // Save the unique identifier of the power (could be label hash or specific ID)
    const powerId = legendaryAffix.label; 
    
    if (playerLib.extracted[slotKey].has(powerId)) {
      return { success: false, msg: "Power already extracted." };
    }

    playerLib.extracted[slotKey].add(powerId);
    
    // Caller is responsible for deleting the item from inventory
    return { success: true, msg: `Extracted: ${powerId}` };
  }

  /**
   * Imbues a target item with a stored essence.
   * This REPLACES the target's existing legendary power.
   */
  public static inheritEssence(playerLib: EssenceLibrary, targetItem: Item, powerId: string): boolean {
    if (targetItem.rarity !== 'LEGENDARY') return false;
    
    const slotKey = targetItem.slot || 'MAIN_HAND';
    const available = playerLib.extracted[slotKey];
    
    if (!available || !available.has(powerId)) return false;

    // Find and Replace the legendary affix
    const affixIdx = targetItem.affixes.findIndex(a => a.type === 'MISC' && a.label.startsWith('★'));
    
    const newAffix = {
      label: powerId, // In real engine, lookup full stat block from ID
      type: 'MISC' as const,
      value: 0
    };

    if (affixIdx !== -1) {
      targetItem.affixes[affixIdx] = newAffix;
    } else {
      targetItem.affixes.push(newAffix);
    }

    // Visual Cue: Mark item as "Inherited" (Orange icon -> Gold icon)
    targetItem.icon = targetItem.icon + "✨"; // Mock visual change
    
    return true;
  }

  /**
   * Validates if a specific essence can go into a specific slot.
   */
  public static validateTransfer(sourceSlot: string, targetSlot: string): boolean {
    // Simplistic: Exact match. 
    // Advanced: One-Handed Weapons compatible with other One-Handers?
    return sourceSlot === targetSlot;
  }
}
