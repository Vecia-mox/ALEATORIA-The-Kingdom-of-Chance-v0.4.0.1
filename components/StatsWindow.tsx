
import React, { useState } from 'react';
import { Character, Stats } from '../types';
import { WindowContainer } from './WindowContainer';
import { CLASS_PRIMARY_ATTRIBUTE, ATTRIBUTE_DESCRIPTIONS, AttributeKey } from '../data/ClassAttributes';

interface StatsWindowProps {
  player: Character;
  onStatPoint: (stat: string) => void;
  onClose: () => void;
}

export const StatsWindow: React.FC<StatsWindowProps> = ({ player, onStatPoint, onClose }) => {
  const primaryStat = CLASS_PRIMARY_ATTRIBUTE[player.classType];
  const [hoveredStat, setHoveredStat] = useState<AttributeKey | null>(null);

  const StatRow = ({ statKey, value }: { statKey: AttributeKey, value: number }) => {
    const isPrimary = statKey === primaryStat;
    const config = ATTRIBUTE_DESCRIPTIONS[statKey];
    
    return (
      <div 
        className="relative flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors group"
        onMouseEnter={() => setHoveredStat(statKey)}
        onMouseLeave={() => setHoveredStat(null)}
      >
        <div className="flex flex-col">
          <span className={`text-xs uppercase font-black tracking-widest ${isPrimary ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'text-stone-400'}`}>
            {config.title} {isPrimary && '★'}
          </span>
          <span className="text-[9px] text-white/30">{isPrimary ? 'Primary Damage Attribute' : 'Secondary Attribute'}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className={`text-xl font-black ${isPrimary ? 'text-amber-100' : 'text-white'}`}>{value}</span>
          {player.unspentPoints > 0 && (
            <button 
              onClick={() => onStatPoint(statKey)}
              className="w-8 h-8 bg-amber-600 hover:bg-amber-500 border border-amber-400 rounded flex items-center justify-center text-black font-black text-lg active:scale-95 transition-all shadow-[0_0_10px_rgba(245,158,11,0.4)]"
            >
              +
            </button>
          )}
        </div>

        {/* Dynamic Tooltip */}
        {hoveredStat === statKey && (
            <div className="absolute left-0 bottom-full mb-2 w-full bg-black/95 border border-amber-900/50 p-3 rounded z-50 pointer-events-none shadow-xl">
                <div className="text-[10px] text-amber-500 font-bold uppercase mb-1">{config.title} Effect</div>
                <div className="text-[10px] text-white/70 leading-relaxed">{config.desc}</div>
                {isPrimary && (
                    <div className="mt-2 text-[9px] text-emerald-400 font-bold border-t border-white/10 pt-1">
                        +{(value * 0.3).toFixed(1)} Damage
                    </div>
                )}
                {statKey === 'vitality' && (
                    <div className="mt-1 text-[9px] text-emerald-400 font-bold border-t border-white/10 pt-1">
                        +{(value * 3)} Life
                    </div>
                )}
            </div>
        )}
      </div>
    );
  };

  return (
    <WindowContainer title="Attributes & Power" onClose={onClose}>
      <div className="p-6 space-y-6">
        {/* Header Summary */}
        <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/10">
            <div>
                <h3 className="text-white text-lg font-black gothic-title">{player.name}</h3>
                <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Level {player.level} {player.classType}</p>
            </div>
            <div className="text-right">
                <div className="text-amber-500 text-2xl font-black">{player.unspentPoints}</div>
                <div className="text-[9px] text-amber-500/50 uppercase font-bold tracking-widest">Points Available</div>
            </div>
        </div>

        {/* Combat Rating Badge */}
        <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-lg flex items-center justify-center gap-3 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]">
            <span className="text-xl">⚔️</span>
            <div className="flex flex-col items-center">
                <span className="text-amber-200 text-2xl font-black">{player.stats.combatRating}</span>
                <span className="text-[9px] text-amber-500 uppercase font-black tracking-[0.3em]">Combat Rating</span>
            </div>
            <span className="text-xl">⚔️</span>
        </div>

        {/* Derived Stats */}
        <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-red-950/20 border border-red-900/30 rounded flex flex-col items-center">
                <span className="text-red-500 text-lg font-black">{player.stats.damage}</span>
                <span className="text-[9px] text-red-400/60 uppercase font-bold">Damage</span>
            </div>
            <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded flex flex-col items-center">
                <span className="text-blue-500 text-lg font-black">{player.stats.armor}</span>
                <span className="text-[9px] text-blue-400/60 uppercase font-bold">Armor</span>
            </div>
            <div className="p-3 bg-green-950/20 border border-green-900/30 rounded flex flex-col items-center">
                <span className="text-green-500 text-lg font-black">{player.stats.hp}</span>
                <span className="text-[9px] text-green-400/60 uppercase font-bold">Life</span>
            </div>
            <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded flex flex-col items-center">
                <span className="text-purple-500 text-lg font-black">{player.stats.willpower}</span>
                <span className="text-[9px] text-purple-400/60 uppercase font-bold">Potency</span>
            </div>
        </div>

        {/* Attributes List */}
        <div className="space-y-2">
            <StatRow statKey="strength" value={player.baseStats.strength} />
            <StatRow statKey="intelligence" value={player.baseStats.intelligence} />
            <StatRow statKey="fortitude" value={player.baseStats.fortitude} />
            <StatRow statKey="vitality" value={player.baseStats.vitality} />
            <StatRow statKey="willpower" value={player.baseStats.willpower} />
        </div>
      </div>
    </WindowContainer>
  );
};
