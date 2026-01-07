
import { WorldState, TimeState, WeatherType, Character, Chunk, Item, Stats, Mob, ClassType, Equipment } from '../types';
import { TICK_RATE_MS } from '../constants';
import { DamageCalculator } from './DamageCalculator';
import { GameLoop } from './GameLoop';
import { ChunkManager } from './ChunkManager';
import { StatsSystem } from './StatsSystem';
import { ItemFactory } from './ItemFactory';
import { CLASS_REGISTRY } from '../data/ClassRegistry';
import { MOB_REGISTRY, TIER_MULTIPLIERS } from '../data/MobRegistry';

export class ServerSimulator {
  private state: WorldState;
  private intervalId: number | null = null;
  private onStateUpdate: (state: WorldState, event?: any) => void;
  private playerBuffs: Record<string, string | null> = { 'player-1': null };
  private activeEffects: any[] = []; 

  constructor(onUpdate: (state: WorldState, event?: any) => void, initialChar: Character) {
    this.onStateUpdate = onUpdate;
    this.state = this.getInitialState(initialChar);
  }

  private getInitialState(char: Character): WorldState {
    if (typeof char.baseStats.willpower === 'undefined') char.baseStats.willpower = 10;
    
    const starterGear: Equipment = { ...char.equipment };
    const inventory: Item[] = [...char.inventory];

    if (Object.keys(starterGear).length === 0 && inventory.length === 0) {
       const generatedGear = ItemFactory.getStarterGear(char.classType);
       Object.assign(starterGear, generatedGear);
    }

    const effectiveStats = StatsSystem.recalculate({ ...char, equipment: starterGear });
    const maxHp = StatsSystem.calculateMaxHp(char.level, effectiveStats.vitality, char.classType);
    const maxMp = StatsSystem.calculateMaxMp(char.level, effectiveStats.intelligence, effectiveStats.willpower);
    const currentHp = char.hp > 0 ? char.hp : maxHp;

    const loadout = char.skillLoadout || { 1: '', 2: '', 3: '', 4: '' };

    return {
      players: {
        'player-1': {
          ...char,
          baseStats: char.baseStats,
          stats: effectiveStats,
          exp: char.exp || 0,
          maxExp: char.maxExp || 1000,
          unspentPoints: char.unspentPoints || 0,
          skillPoints: char.skillPoints ?? 0,
          skillRanks: char.skillRanks || {},
          skillLoadout: loadout,
          mp: maxMp,
          maxMp: maxMp,
          hp: currentHp,
          maxHp: maxHp,
          potionCharges: char.potionCharges ?? 3,
          maxPotionCharges: 3, 
          potionRefillTimestamp: 0,
          activeBuffs: {},
          isFrozen: false,
          frozenDuration: 0,
          gold: char.gold || 150,
          inventory: inventory,
          equipment: starterGear,
          lastAttackTimestamp: 0,
        }
      },
      activeChunks: {},
      gameTime: 0,
      timeState: TimeState.DAY,
      weather: WeatherType.CLEAR,
      tickCount: 0,
      activeProjectiles: []
    };
  }

  public start() {
    if (this.intervalId) return;
    this.intervalId = window.setInterval(() => this.tick(), TICK_RATE_MS);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick() {
    const player = this.state.players['player-1'];
    if (player) {
      this.updateActiveChunks(player.pos);
      if (player.isFrozen) {
          player.frozenDuration -= TICK_RATE_MS;
          if (player.frozenDuration <= 0) {
              player.isFrozen = false;
          }
      }

      if (player.potionCharges === 0 && player.potionRefillTimestamp) {
          if (Date.now() >= player.potionRefillTimestamp) {
              player.potionCharges = player.maxPotionCharges;
              player.potionRefillTimestamp = 0;
          }
      }
    }

    this.state = GameLoop.update(this.state);
    this.state.tickCount++;
    
    const events: any[] = [];
    Object.values(this.state.activeChunks).forEach((chunk: any) => {
      chunk.mobs = chunk.mobs.map((mob: Mob) => {
        if (!player) return mob;
        return this.processMobAI(mob, player, events);
      });
    });

    this.activeEffects = this.activeEffects.filter(effect => {
        effect.timer -= TICK_RATE_MS;
        if (effect.type === 'FROZEN_CIRCLE') {
            if (effect.timer <= 0) {
                if (player && !player.isFrozen) {
                    const dx = player.pos.x - effect.pos.x;
                    const dy = player.pos.y - effect.pos.y;
                    if (Math.sqrt(dx*dx + dy*dy) < 60) {
                        player.isFrozen = true;
                        player.frozenDuration = 2000;
                        player.hp -= 20;
                        events.push({ type: 'PLAYER_HIT', pos: player.pos, damage: 20 });
                    }
                }
                return false;
            }
        }
        return true;
    });

    this.onStateUpdate({ ...this.state }, events.length > 0 ? events : undefined);
  }

  private processMobAI(mob: Mob, player: any, events: any[]): Mob {
    if (player.hp <= 0) return mob;

    const def = MOB_REGISTRY[mob.definitionId || 'goblin'] || MOB_REGISTRY['goblin'];
    const now = Date.now();

    if (mob.isAttacking) {
        if (now > mob.attackStartTime + def.attackDuration) {
            return { ...mob, isAttacking: false, damageDealt: false };
        }
        if (!mob.damageDealt && now > mob.attackStartTime + def.attackDelay) {
            const dx = player.pos.x - mob.pos.x;
            const dy = player.pos.y - mob.pos.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist <= def.range * 1.5) { 
                this.resolveMobCombat(mob, player, events);
            }
            return { ...mob, damageDealt: true };
        }
        return mob; 
    }

    const dx = player.pos.x - mob.pos.x;
    const dy = player.pos.y - mob.pos.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (mob.isElite && mob.modifiers.includes('Frozen')) {
        mob.abilityCooldowns = mob.abilityCooldowns || {};
        const lastFrozen = mob.abilityCooldowns['frozen'] || 0;
        
        if (now - lastFrozen > 6000 && dist < 300) {
            mob.abilityCooldowns['frozen'] = now;
            this.activeEffects.push({
                type: 'FROZEN_CIRCLE',
                pos: { ...player.pos },
                timer: 2000
            });
            events.push({ type: 'ELITE_ABILITY', ability: 'FROZEN', pos: player.pos, mobId: mob.id });
        }
    }

    const speed = def.speed * (mob.tier === 'ELITE' ? 1.2 : 1.0);
    const attackRange = def.range;
    
    if (dist <= attackRange) { 
         if (!mob.lastAttackTime || now - mob.lastAttackTime >= def.attackDuration + 500) {
             events.push({ type: 'MOB_ATTACK_START', mobId: mob.id, targetPos: player.pos });
             return { 
                 ...mob, 
                 isAttacking: true, 
                 attackStartTime: now, 
                 damageDealt: false,
                 lastAttackTime: now 
             };
         }
    } 
    else if (dist < 400) { 
        return { ...mob, pos: { x: mob.pos.x + (dx/dist)*speed, y: mob.pos.y + (dy/dist)*speed } };
    }
    return mob;
  }

  private resolveMobCombat(mob: Mob, player: any, events: any[]) {
      const result = DamageCalculator.calculate(mob.stats, player.stats, player.level);
      if (result.finalDamage > 0) {
          player.hp = Math.max(0, player.hp - result.finalDamage);
          events.push({ type: 'PLAYER_HIT', pos: player.pos, damage: result.finalDamage });
      }
  }

  private updateActiveChunks(pos: { x: number, y: number }) {
    const player = this.state.players['player-1'];
    const playerLevel = player ? player.level : 1;

    const px = Math.floor(pos.x / (ChunkManager.CHUNK_SIZE * ChunkManager.TILE_SIZE));
    const py = Math.floor(pos.y / (ChunkManager.CHUNK_SIZE * ChunkManager.TILE_SIZE));
    const newActiveKeys = new Set<string>();
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cx = px + dx;
        const cy = py + dy;
        const key = `${cx},${cy}`;
        newActiveKeys.add(key);
        if (!this.state.activeChunks[key]) {
          const chunk = ChunkManager.generateChunk(cx, cy, playerLevel);
          chunk.mobs.forEach(m => {
              if (m.isElite && Math.random() > 0.5) m.modifiers.push('Frozen');
          });
          this.state.activeChunks[key] = chunk;
        }
      }
    }
    Object.keys(this.state.activeChunks).forEach(key => {
      if (!newActiveKeys.has(key)) delete this.state.activeChunks[key];
    });
  }

  public handleAdminCommand(action: any) {
    const player = this.state.players['player-1'];
    if (!player) return;

    switch (action.type) {
        case 'ADMIN_TP':
            player.pos = { x: 1024, y: 1024 }; // Reset to spawn
            this.onStateUpdate({ ...this.state }, { type: 'RESPAWN_EFFECT', pos: player.pos });
            break;
        case 'ADMIN_SUMMON':
            // Logic to move target to player (Mock)
            break;
        case 'ADMIN_KILL':
            // Kill target (Mock: Kill self for test)
            if (this.state.players[action.targetId]) {
                this.state.players[action.targetId].hp = 0;
            }
            break;
        case 'ADMIN_BAN':
            if (this.state.players[action.targetId]) {
                delete this.state.players[action.targetId];
                // In real app, persist ban to DB
            }
            break;
        case 'ADMIN_GOD_MODE':
            if (action.enabled) {
                player.stats.damage = 999999;
                player.maxHp = 999999;
                player.hp = 999999;
                player.stats.hp = 999999;
            } else {
                const recalculated = StatsSystem.recalculate(player);
                player.stats = recalculated;
                player.maxHp = StatsSystem.calculateMaxHp(player.level, recalculated.vitality, player.classType);
                if (player.hp > player.maxHp) player.hp = player.maxHp;
            }
            break;
        case 'ADMIN_SET_WEATHER':
            this.state.weather = action.weatherType as WeatherType;
            break;
        case 'ADMIN_SET_TIME':
            this.state.gameTime = action.timeVal;
            // Recalculate TimeState
            const dayThreshold = 1200 * 0.5;
            if (this.state.gameTime < 60 || this.state.gameTime > dayThreshold + 120) {
                this.state.timeState = TimeState.NIGHT;
            } else {
                this.state.timeState = TimeState.DAY;
            }
            break;
        case 'ADMIN_SPAWN':
            // Spawn mob near player
            const chunkKey = Object.keys(this.state.activeChunks)[0];
            if (chunkKey && this.state.activeChunks[chunkKey]) {
                const chunk = this.state.activeChunks[chunkKey];
                for(let i=0; i<action.count; i++) {
                    const mobDef = MOB_REGISTRY[action.mobDefId] || MOB_REGISTRY['goblin'];
                    chunk.mobs.push({
                        id: `spawned-${Date.now()}-${i}`,
                        definitionId: mobDef.id,
                        type: mobDef.name,
                        level: player.level,
                        tier: 'NORMAL',
                        tags: mobDef.tags,
                        hp: mobDef.baseHp,
                        maxHp: mobDef.baseHp,
                        pos: { x: player.pos.x + Math.random()*200 - 100, y: player.pos.y + Math.random()*200 - 100 },
                        stats: { ...player.stats, damage: mobDef.baseAttack, hp: mobDef.baseHp },
                        expValue: 10,
                        isElite: false,
                        modifiers: [],
                        isAttacking: false,
                        attackStartTime: 0,
                        damageDealt: false
                    });
                }
            }
            break;
        case 'ADMIN_ADD_ITEM':
            const newItem = ItemFactory.generateLoot(player.level, player.classType);
            player.inventory.push(newItem);
            this.onStateUpdate({ ...this.state }, { type: 'LOOT_COLLECTED', item: newItem, pos: player.pos });
            break;
        case 'ADMIN_ADD_GOLD':
            player.gold += action.amount;
            break;
    }
  }

  public handlePlayerInput(playerId: string, action: any) {
    if (action.type.startsWith('ADMIN_')) {
        this.handleAdminCommand(action);
        return;
    }

    const player = this.state.players[playerId];
    if (!player) return;

    if (player.hp <= 0 && action.type !== 'RESPAWN') return;
    if (player.isFrozen && (action.type === 'MOVE' || action.type === 'ATTACK' || action.type === 'DODGE')) {
        return; 
    }

    switch (action.type) {
      case 'MOVE':
        player.pos = action.payload;
        break;
      
      case 'HEAL':
        if (player.potionCharges > 0 && player.hp < player.maxHp) {
            player.potionCharges--;
            const healAmount = Math.floor(player.maxHp * 0.35); 
            player.hp = Math.min(player.maxHp, player.hp + healAmount);
            this.onStateUpdate({ ...this.state }, { type: 'HEAL_EFFECT', pos: player.pos, value: healAmount });
            if (player.potionCharges === 0) {
                player.potionRefillTimestamp = Date.now() + 60000;
            }
        }
        break;

      case 'ASSIGN_SKILL': {
          const { slotIndex, skillId } = action;
          if (slotIndex >= 1 && slotIndex <= 4) {
              player.skillLoadout[slotIndex] = skillId;
          }
          break;
      }

      case 'SOCKET_GEM': {
          const { gemId, targetItemId } = action;
          const gemIndex = player.inventory.findIndex(i => i.id === gemId);
          if (gemIndex === -1) return;
          const gem = player.inventory[gemIndex];
          if (gem.type !== 'GEM') return;

          let targetItem: Item | undefined;
          
          for (const key of Object.keys(player.equipment)) {
              if (player.equipment[key as keyof Equipment]?.id === targetItemId) {
                  targetItem = player.equipment[key as keyof Equipment];
                  break;
              }
          }

          if (targetItem && targetItem.sockets > (targetItem.gems?.length || 0)) {
              if (!targetItem.gems) targetItem.gems = [];
              targetItem.gems.push(gem);
              player.inventory.splice(gemIndex, 1);
              player.inventory = [...player.inventory];
              player.stats = StatsSystem.recalculate(player);
              player.maxHp = StatsSystem.calculateMaxHp(player.level, player.stats.vitality, player.classType);
              this.onStateUpdate({ ...this.state }, { type: 'SOCKET_SUCCESS', pos: player.pos });
          }
          break;
      }

      case 'EQUIP_ITEM': {
          const { itemId, slot } = action;
          const itemIndex = player.inventory.findIndex(i => i.id === itemId);
          if (itemIndex === -1) return;
          
          const itemToEquip = player.inventory[itemIndex];
          if (itemToEquip.requiredLevel > player.level) return; 
          if (itemToEquip.slot !== slot) return;

          const currentEquipped = player.equipment[slot as keyof Equipment];

          player.inventory = [...player.inventory];
          player.inventory.splice(itemIndex, 1);
          
          if (currentEquipped) {
            player.inventory.push(currentEquipped);
          }
          player.equipment[slot as keyof Equipment] = itemToEquip;
          
          player.stats = StatsSystem.recalculate(player);
          player.maxHp = StatsSystem.calculateMaxHp(player.level, player.stats.vitality, player.classType);
          player.maxMp = StatsSystem.calculateMaxMp(player.level, player.stats.intelligence, player.stats.willpower);
          break;
      }

      case 'UNEQUIP_ITEM': {
          const { slot } = action;
          const itemToUnequip = player.equipment[slot as keyof Equipment];
          if (!itemToUnequip) return;
          
          if (player.inventory.length < 25) {
              delete player.equipment[slot as keyof Equipment];
              player.inventory = [...player.inventory, itemToUnequip];
              
              player.stats = StatsSystem.recalculate(player);
              player.maxHp = StatsSystem.calculateMaxHp(player.level, player.stats.vitality, player.classType);
              player.maxMp = StatsSystem.calculateMaxMp(player.level, player.stats.intelligence, player.stats.willpower);
          }
          break;
      }

      case 'DISTRIBUTE_STAT':
        if (player.unspentPoints > 0) {
          const statKey = action.stat as keyof Stats;
          player.baseStats[statKey]++;
          player.unspentPoints--;
          
          player.stats = StatsSystem.recalculate(player);
          player.maxHp = StatsSystem.calculateMaxHp(player.level, player.stats.vitality, player.classType);
          player.maxMp = StatsSystem.calculateMaxMp(player.level, player.stats.intelligence, player.stats.willpower);
        }
        break;

      case 'UPGRADE_SKILL':
        const { skillId } = action;
        if (player.skillPoints > 0) {
            const currentRank = player.skillRanks[skillId] || 0;
            const classData = CLASS_REGISTRY[player.classType];
            const skillDef = classData.skills.find(s => s.id === skillId);
            
            if (skillDef && currentRank < skillDef.maxRank && player.level >= skillDef.unlockLevel) {
                player.skillRanks[skillId] = currentRank + 1;
                player.skillPoints--;
            }
        }
        break;

      case 'ATTACK':
        const targetId = action.targetId;
        const activeOil = this.playerBuffs[playerId];
        let combatResult: any = null;
        
        const attackRange = (player.classType === ClassType.SORCERER || player.classType === ClassType.NECROMANCER || player.classType === ClassType.ROGUE) ? 400 : 60;

        Object.values(this.state.activeChunks).forEach((chunk: any) => {
          const targetIndex = chunk.mobs.findIndex((m: any) => m.id === targetId);
          if (targetIndex !== -1) {
            const target = chunk.mobs[targetIndex];
            const dx = player.pos.x - target.pos.x;
            const dy = player.pos.y - target.pos.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist <= attackRange) {
              const result = DamageCalculator.calculate(player.stats, target.stats, target.level);
              combatResult = { hit: true, ...result, damage: result.finalDamage, isWeakness: false }; 
              
              player.lastAttackTimestamp = Date.now();

              target.hp = Math.max(0, target.hp - result.finalDamage);
              if (target.hp <= 0) {
                player.exp += (target.expValue || 100) * 3;
                this.checkLevelUp(player);
                
                const potionChance = target.isElite ? 1.0 : 0.15;
                if (Math.random() < potionChance && player.potionCharges < player.maxPotionCharges) {
                    player.potionCharges++;
                    this.onStateUpdate({ ...this.state }, { type: 'POTION_PICKUP', pos: target.pos });
                } else {
                    const dropChance = target.isElite ? 1.0 : 0.3;
                    if (Math.random() < dropChance) { 
                        const lootLevel = player.level + (target.isElite ? 5 : 0);
                        const drop = ItemFactory.generateLoot(lootLevel, player.classType);
                        if (player.inventory.length < 25) {
                            player.inventory = [...player.inventory, drop];
                            this.onStateUpdate({ ...this.state }, { type: 'LOOT_COLLECTED', item: drop, pos: target.pos });
                        }
                    }
                }
                chunk.mobs.splice(targetIndex, 1);
              }
            }
          }
        });
        return combatResult;
        
      case 'RESPAWN':
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        player.isFrozen = false;
        player.frozenDuration = 0;
        player.potionCharges = 3;
        player.potionRefillTimestamp = 0;
        player.pos = { x: 1024, y: 1024 };
        this.onStateUpdate({ ...this.state }, { type: 'RESPAWN_EFFECT', pos: player.pos });
        break;

      case 'USE_ITEM':
        break;
    }
  }

  private checkLevelUp(player: any) {
    if (player.exp >= player.maxExp) {
      player.level++;
      player.exp -= player.maxExp;
      player.maxExp = Math.floor(player.maxExp * 1.5);
      player.unspentPoints += 5;
      player.skillPoints = (player.skillPoints || 0) + 3;
      
      player.baseStats.strength += 1;
      player.baseStats.fortitude += 1;
      player.baseStats.intelligence += 1;
      player.baseStats.willpower += 1;
      player.baseStats.vitality += 1;

      player.stats = StatsSystem.recalculate(player);
      player.maxHp = StatsSystem.calculateMaxHp(player.level, player.stats.vitality, player.classType);
      player.maxMp = StatsSystem.calculateMaxMp(player.level, player.stats.intelligence, player.stats.willpower);
      player.hp = player.maxHp;
      player.mp = player.maxMp;
    }
  }
}
