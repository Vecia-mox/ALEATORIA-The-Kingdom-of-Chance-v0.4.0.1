
/**
 * TITAN ENGINE: INVENTORY GRID
 * Handles drag-and-drop mechanics, slot validation, and rarity styling.
 */

import { Item, Equipment } from '../../types'; // Shared types

export type SlotType = 'HEAD' | 'CHEST' | 'HANDS' | 'LEGS' | 'FEET' | 'MAIN_HAND' | 'OFF_HAND' | 'RING' | 'AMULET' | 'INVENTORY';

export const RARITY_STYLES = {
  COMMON: { borderColor: '#a8a29e', bgGradient: 'linear-gradient(135deg, #292524 0%, #0c0a09 100%)' },
  UNCOMMON: { borderColor: '#10b981', bgGradient: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' },
  RARE: { borderColor: '#fbbf24', bgGradient: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)' },
  LEGENDARY: { borderColor: '#f97316', bgGradient: 'linear-gradient(135deg, #7c2d12 0%, #431407 100%)', glow: '0 0 10px #f97316' },
  UNIQUE: { borderColor: '#d946ef', bgGradient: 'linear-gradient(135deg, #701a75 0%, #4a044e 100%)', glow: '0 0 15px #d946ef' }
};

export class InventoryGrid {
  
  /**
   * Checks if an item can be placed in a specific equipment slot.
   */
  static isValidSlot(item: Item, slot: SlotType): boolean {
    if (slot === 'INVENTORY') return true;

    // Direct mapping check
    if (item.slot === slot) return true;

    // Special cases
    if (slot === 'RING' && (item.slot === 'RING_1' || item.slot === 'RING_2')) return true;
    if (item.type === 'WEAPON') {
      if (slot === 'MAIN_HAND') return true;
      if (slot === 'OFF_HAND' && item.slot === 'OFF_HAND') return true; // Daggers/Shields
    }

    return false;
  }

  /**
   * Handles the logic of swapping two items in the inventory array.
   * Returns the new inventory array.
   */
  static swapItems(inventory: Item[], sourceIdx: number, targetIdx: number): Item[] {
    const newInv = [...inventory];
    
    // Bounds check
    if (sourceIdx < 0 || sourceIdx >= newInv.length || targetIdx < 0 || targetIdx >= newInv.length) {
      return inventory;
    }

    const temp = newInv[sourceIdx];
    newInv[sourceIdx] = newInv[targetIdx];
    newInv[targetIdx] = temp;

    return newInv;
  }

  static getStyle(rarity: string) {
    return RARITY_STYLES[rarity as keyof typeof RARITY_STYLES] || RARITY_STYLES.COMMON;
  }
}
