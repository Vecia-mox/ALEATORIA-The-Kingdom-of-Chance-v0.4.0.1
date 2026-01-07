
import React, { useState } from 'react';
import { Character, Item } from '../types';
import { CLASS_REGISTRY } from '../data/ClassRegistry';
import { WindowContainer } from './WindowContainer';
import { InventoryScreen } from './InventoryScreen'; // Reuse Inventory Screen Logic? No, we need CharacterMenu to be the container.

// Re-using Slot logic but simplified for embedding if needed, or import from InventoryScreen if extracted.
// For now, simpler slot for menu:
const SimpleSlot: React.FC<{ item?: Item; icon?: string; onClick?: () => void }> = ({ item, icon, onClick }) => (
    <div onClick={onClick} className="w-12 h-12 bg-white/5 border border-white/10 rounded flex items-center justify-center cursor-pointer">
        {item ? <span className="text-2xl">{item.icon}</span> : <span className="text-white/10 text-xl">{icon}</span>}
    </div>
);

interface CharacterMenuProps {
  player: Character;
  initialTab?: 'inventory' | 'skills';
  onEquip: (item: Item) => void;
  onUnequip: (slot: string) => void;
  onUpgradeSkill: (skillId: string) => void;
  onAssignSkill: (slotIndex: number, skillId: string) => void; // New Prop
  onClose: () => void;
}

export const CharacterMenu: React.FC<CharacterMenuProps> = ({ player, initialTab = 'inventory', onEquip, onUnequip, onUpgradeSkill, onAssignSkill, onClose }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'skills'>(initialTab);
  const [selectedSkillForAssignment, setSelectedSkillForAssignment] = useState<string | null>(null);
  
  const classData = CLASS_REGISTRY[player.classType];

  return (
    <WindowContainer title={activeTab === 'inventory' ? 'Equipment & Goods' : 'Talents & Mastery'} onClose={onClose}>
        
        {/* TABS */}
        <div className="sticky top-0 z-20 flex bg-[#0c0a09] border-b border-[#44403c]">
            <button 
                onClick={() => setActiveTab('inventory')}
                className={`flex-1 py-4 text-[10px] uppercase font-black tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-[#1c1917] text-amber-500 border-b-2 border-amber-500' : 'text-white/30 hover:text-white'}`}
            >
                Inventory
            </button>
            <button 
                onClick={() => setActiveTab('skills')}
                className={`flex-1 py-4 text-[10px] uppercase font-black tracking-widest transition-all ${activeTab === 'skills' ? 'bg-[#1c1917] text-amber-500 border-b-2 border-amber-500' : 'text-white/30 hover:text-white'}`}
            >
                Skills {player.skillPoints > 0 && <span className="ml-2 bg-amber-500 text-black px-1.5 rounded-full">{player.skillPoints}</span>}
            </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-6 pb-20">
            
            {/* --- INVENTORY TAB --- */}
            {activeTab === 'inventory' && (
                // Embedding the logic directly or calling InventoryScreen contents?
                // To avoid duplicate code, we can re-implement the structure here or refactor InventoryScreen to export its inner content.
                // For this change, I'll assume we are REPLACING the content with what was in InventoryScreen component
                // BUT wait, CharacterMenu is a wrapper. Let's just use the InventoryScreen *logic* here or render it.
                // Since I cannot import InventoryScreen parts easily without refactoring it into sub-components,
                // I will render a simplified inventory view here or just the existing InventoryScreen component if tabs are handled externally.
                // However, the prompt implies CharacterMenu unifies them.
                // Let's implement the Inventory View here properly.
                
                <div className="flex flex-col md:flex-row gap-6 animate-slide-up-fade">
                    <div className="w-full md:w-1/2 flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="grid grid-cols-2 gap-x-16 gap-y-4 relative z-10">
                            <SimpleSlot item={player.equipment.HEAD} icon="🪖" onClick={() => player.equipment.HEAD && onUnequip('HEAD')} />
                            <SimpleSlot item={player.equipment.AMULET} icon="📿" onClick={() => player.equipment.AMULET && onUnequip('AMULET')} />
                            <SimpleSlot item={player.equipment.CHEST} icon="👕" onClick={() => player.equipment.CHEST && onUnequip('CHEST')} />
                            <SimpleSlot item={player.equipment.RING_1} icon="💍" onClick={() => player.equipment.RING_1 && onUnequip('RING_1')} />
                            <SimpleSlot item={player.equipment.HANDS} icon="🧤" onClick={() => player.equipment.HANDS && onUnequip('HANDS')} />
                            <SimpleSlot item={player.equipment.RING_2} icon="💍" onClick={() => player.equipment.RING_2 && onUnequip('RING_2')} />
                            <SimpleSlot item={player.equipment.LEGS} icon="👖" onClick={() => player.equipment.LEGS && onUnequip('LEGS')} />
                            <SimpleSlot item={player.equipment.FEET} icon="👢" onClick={() => player.equipment.FEET && onUnequip('FEET')} />
                        </div>
                        <div className="flex gap-8 mt-6">
                            <SimpleSlot item={player.equipment.MAIN_HAND} icon="⚔️" onClick={() => player.equipment.MAIN_HAND && onUnequip('MAIN_HAND')} />
                            <SimpleSlot item={player.equipment.OFF_HAND} icon="🛡️" onClick={() => player.equipment.OFF_HAND && onUnequip('OFF_HAND')} />
                        </div>
                    </div>

                    <div className="w-full md:w-1/2">
                        <h4 className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-3">Backpack</h4>
                        <div className="grid grid-cols-5 gap-2 justify-items-center">
                            {Array.from({ length: 25 }).map((_, i) => (
                                <SimpleSlot 
                                    key={i} 
                                    item={player.inventory[i]} 
                                    onClick={() => player.inventory[i] && onEquip(player.inventory[i])} 
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- SKILLS TAB --- */}
            {activeTab === 'skills' && (
                <div className="space-y-3 animate-slide-up-fade">
                    <div className="bg-amber-950/20 p-3 rounded-lg border border-amber-900/30 text-center mb-4">
                        <span className="text-amber-500 text-sm font-black uppercase tracking-widest">Available Points: {player.skillPoints}</span>
                    </div>

                    {classData.skills.map(skill => {
                        const rank = player.skillRanks?.[skill.id] || 0;
                        const isLocked = player.level < skill.unlockLevel;
                        const canUpgrade = player.skillPoints > 0 && rank < skill.maxRank && !isLocked;
                        const isSelected = selectedSkillForAssignment === skill.id;
                        const isLearned = rank > 0;

                        return (
                            <div key={skill.id} className={`relative p-4 rounded-xl border flex flex-col gap-2 transition-all ${
                                isLocked ? 'bg-black/40 border-white/5 opacity-50' : 
                                isSelected ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                                'bg-white/5 border-white/10'
                            }`}>
                                <div className="flex items-center gap-4">
                                    <div 
                                        className={`text-3xl filter drop-shadow-md cursor-pointer ${isLearned ? 'hover:scale-110 transition-transform' : ''}`}
                                        onClick={() => isLearned && setSelectedSkillForAssignment(skill.id === selectedSkillForAssignment ? null : skill.id)}
                                    >
                                        {skill.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`text-sm font-bold ${classData.color}`}>{skill.name}</h4>
                                            <span className="text-[9px] bg-black/40 px-2 py-0.5 rounded text-white/50 uppercase font-bold">{skill.type}</span>
                                        </div>
                                        <p className="text-[10px] text-white/50 leading-tight mt-1">{skill.desc}</p>
                                        <div className="mt-2 text-[9px] font-bold text-white/30 uppercase tracking-wider">
                                            Rank {rank} / {skill.maxRank}
                                        </div>
                                    </div>
                                    
                                    {isLocked ? (
                                        <div className="text-[9px] text-rose-500 font-bold uppercase text-center w-16">
                                            Lvl {skill.unlockLevel}
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => onUpgradeSkill(skill.id)}
                                            disabled={!canUpgrade}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg transition-all active:scale-95 ${
                                                canUpgrade 
                                                ? 'bg-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-500' 
                                                : 'bg-white/5 text-white/20'
                                            }`}
                                        >
                                            +
                                        </button>
                                    )}
                                </div>

                                {/* Assignment Panel */}
                                {isSelected && (
                                    <div className="flex gap-2 mt-2 pt-2 border-t border-white/10 animate-slide-up-fade">
                                        <span className="text-[10px] uppercase font-bold text-white/40 self-center mr-2">Assign to:</span>
                                        {[1, 2, 3, 4].map(slot => (
                                            <button 
                                                key={slot}
                                                onClick={() => {
                                                    onAssignSkill(slot, skill.id);
                                                    setSelectedSkillForAssignment(null);
                                                }}
                                                className="flex-1 py-2 bg-white/10 hover:bg-emerald-600 hover:text-white border border-white/10 text-[10px] font-black uppercase rounded transition-colors"
                                            >
                                                Slot {slot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </WindowContainer>
  );
};
