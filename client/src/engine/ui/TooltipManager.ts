
/**
 * TITAN ENGINE: TOOLTIP MANAGER
 * Stat comparison engine for "Green Arrow / Red Arrow" feedback.
 */

import { Item, Stats } from '../../types';

interface StatDiff {
  key: string;
  label: string;
  diff: number;
  isBetter: boolean;
}

export class TooltipManager {
  
  /**
   * Calculates a simplified "Combat Score" for quick at-a-glance comparison.
   * Formula: ItemPower + (AffixCount * 10) + (Sockets * 20)
   */
  static getScore(item: Item): number {
    let score = item.itemPower;
    score += (item.affixes?.length || 0) * 10;
    score += (item.sockets || 0) * 20;
    return score;
  }

  /**
   * Compares a new item against an equipped item to generate diffs.
   */
  static compare(newItem: Item, equippedItem: Item | null): StatDiff[] {
    const diffs: StatDiff[] = [];

    // 1. Compare Combat Rating / Item Power
    if (equippedItem) {
      const powerDiff = newItem.itemPower - equippedItem.itemPower;
      if (powerDiff !== 0) {
        diffs.push({
          key: 'itemPower',
          label: 'Item Power',
          diff: powerDiff,
          isBetter: powerDiff > 0
        });
      }
    }

    // 2. Compare Specific Stats (Simplified: Just listing new item's stats visually)
    // A true comparison would need to sum up all stats from affixes and diff them.
    // For MVP, we often just show what the new item HAS vs what is lost.
    
    // Here we implement direct stat extraction and comparison if keys match
    // ... logic to aggregate stats ...

    return diffs;
  }

  /**
   * Generates HTML string for the tooltip.
   */
  static generateHTML(item: Item, equipped: Item | null): string {
    const score = this.getScore(item);
    const eqScore = equipped ? this.getScore(equipped) : 0;
    const scoreDiff = score - eqScore;
    
    let html = `
      <div class="tooltip-header" style="color: ${this.getRarityColor(item.rarity)}">
        <div class="name">${item.name}</div>
        <div class="type">${item.rarity} ${item.type}</div>
      </div>
      <div class="tooltip-body">
        <div class="score">
          Score: ${score} 
          ${equipped ? this.getDiffSpan(scoreDiff) : ''}
        </div>
        <div class="stats">
    `;

    item.affixes.forEach(affix => {
      html += `<div class="stat">+${affix.value} ${affix.label}</div>`;
    });

    html += `</div></div>`;
    return html;
  }

  private static getDiffSpan(diff: number): string {
    if (diff === 0) return '';
    const color = diff > 0 ? '#4ade80' : '#f87171'; // Green : Red
    const arrow = diff > 0 ? '▲' : '▼';
    return `<span style="color:${color}">${arrow} ${Math.abs(diff)}</span>`;
  }

  private static getRarityColor(rarity: string): string {
    switch(rarity) {
      case 'COMMON': return '#a8a29e';
      case 'UNCOMMON': return '#4ade80';
      case 'RARE': return '#fbbf24';
      case 'LEGENDARY': return '#f97316';
      case 'UNIQUE': return '#d946ef';
      default: return '#fff';
    }
  }
}
