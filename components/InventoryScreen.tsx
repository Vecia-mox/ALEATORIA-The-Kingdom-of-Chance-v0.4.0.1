
import React, { useState, useRef, useEffect } from 'react';
import { Character, Item } from '../types';
import { CLASS_REGISTRY } from '../data/ClassRegistry';

interface InventoryScreenProps {
  player: Character;
  onEquip: (item: Item) => void;
  onUnequip: (slot: string) => void;
  onClose: () => void;
}

// --- TOOLTIP COMPONENT ---
// Renders fixed on screen to avoid overflow clipping
const FixedTooltip: React.FC<{ data: { item: Item; rect: DOMRect }; equipped?: Item }> = ({ data, equipped }) => {
  const { item, rect } = data;
  
  const rarityColors = {
    COMMON: 'text-slate-400',
    UNCOMMON: 'text-emerald-400',
    RARE: 'text-amber-400',
    LEGENDARY: 'text-orange-500',
    UNIQUE: 'text-purple-500'
  };

  const getStatDiff = (statKey: string, value: number) => {
      if (!equipped) return <span className="text-emerald-500 ml-1">▲</span>;
      
      const equippedAffix = equipped.affixes.find(a => a.statKey === statKey);
      const eqVal = equippedAffix ? equippedAffix.value : 0;
      const diff = value - eqVal;

      if (diff > 0) return <span className="text-emerald-500 ml-1">▲ +{diff}</span>;
      if (diff < 0) return <span className="text-red-500 ml-1">▼ {diff}</span>;
      return null;
  };

  const powerDiff = equipped ? item.itemPower - equipped.itemPower : item.itemPower;

  // Calculate position: Prefer Top-Center of the slot, fallback to Bottom if too close to top
  const tooltipWidth = 256; // w-64
  let top = rect.top - 10;
  let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
  
  const transform = "translateY(-100%)"; // Default grow upwards

  // Bounds check (Simple)
  if (top < 200) {
      // Too close to top, render below
      top = rect.bottom + 10;
      // remove transform Y flip
  }

  // Horizontal clamp
  if (left < 10) left = 10;
  if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;

  return (
    <div 
        className="fixed z-[8000] w-64 bg-[#0c0a09] border-2 border-[#b45309] p-3 rounded shadow-[0_0_20px_rgba(0,0,0,0.8)] pointer-events-none animate-slide-up-fade"
        style={{ top, left, transform: top < rect.top ? 'translateY(-100%)' : 'none' }}
    >
        <div className={`text-xs font-black uppercase tracking-widest mb-1 ${rarityColors[item.rarity]}`}>
            {item.name}
        </div>
        <div className="text-[10px] text-white/50 mb-2 font-bold uppercase">{item.type} • Lvl {item.requiredLevel}</div>
        
        <div className="bg-white/5 p-2 rounded mb-3 border border-white/5">
            <div className="flex justify-between text-[10px] text-white items-center">
                <span>Combat Rating</span>
                <div className="font-bold flex items-center">
                    {item.itemPower}
                    {powerDiff > 0 && <span className="text-emerald-500 ml-1 text-[8px]">▲ {powerDiff}</span>}
                    {powerDiff < 0 && <span className="text-red-500 ml-1 text-[8px]">▼ {Math.abs(powerDiff)}</span>}
                </div>
            </div>
        </div>
        
        <div className="space-y-1 mb-3">
            {item.affixes.map((affix, i) => (
                <div key={i} className="text-[10px] text-emerald-400 flex items-center justify-between">
                    <span>{affix.label}</span>
                    {affix.statKey && getStatDiff(affix.statKey, affix.value)}
                </div>
            ))}
            {item.sockets > 0 && (
                <div className="text-[10px] text-stone-500 mt-2 flex gap-1">
                    {Array.from({length: item.sockets}).map((_, i) => (
                        <span key={i} className="w-3 h-3 rounded-full bg-black border border-stone-700 block" />
                    ))}
                    <span className="ml-1">Sockets</span>
                </div>
            )}
        </div>
        
        <div className="text-[9px] text-white/40 italic leading-tight border-t border-white/10 pt-2 font-serif">
            "{item.description}"
        </div>
    </div>
  );
};

// --- SLOT COMPONENT ---
const Slot: React.FC<{ 
  item?: Item; 
  equippedItem?: Item;
  icon?: string; 
  onClick?: () => void;
  onHoverStart?: (rect: DOMRect) => void;
  onHoverEnd?: () => void;
  size?: 'sm' | 'md' | 'lg';
}> = ({ item, equippedItem, icon, onClick, onHoverStart, onHoverEnd, size = 'md' }) => {
  const sizeClasses = { sm: 'w-10 h-10', md: 'w-12 h-12', lg: 'w-16 h-16' };
  const longPressTimer = useRef<any>(null);
  const isLongPress = useRef(false);

  let borderClass = 'border-[#292524]';
  let bgClass = 'bg-[#0c0a09]';
  let glowClass = '';

  if (item) {
      if (item.rarity === 'UNCOMMON') { borderClass = 'border-emerald-800'; bgClass = 'bg-emerald-950/20'; }
      if (item.rarity === 'RARE') { borderClass = 'border-amber-600'; bgClass = 'bg-amber-950/20'; }
      if (item.rarity === 'LEGENDARY') { borderClass = 'border-orange-600'; bgClass = 'bg-orange-950/20'; glowClass = 'shadow-[inset_0_0_15px_rgba(234,88,12,0.2)]'; }
  }

  // --- HANDLERS ---

  const handleMouseEnter = (e: React.MouseEvent) => {
      if (item && onHoverStart) onHoverStart(e.currentTarget.getBoundingClientRect());
  };

  const handleMouseLeave = () => {
      if (onHoverEnd) onHoverEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      if (!item) return;
      isLongPress.current = false;
      const rect = e.currentTarget.getBoundingClientRect();
      
      longPressTimer.current = setTimeout(() => {
          isLongPress.current = true;
          if (onHoverStart) onHoverStart(rect);
          // Haptic feedback if available
          if (navigator.vibrate) navigator.vibrate(50);
      }, 500); // 500ms for long press
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (isLongPress.current) {
          e.preventDefault(); // Prevent click if it was a long press
          if (onHoverEnd) onHoverEnd();
      }
      // If not long press, let onClick fire naturally via React
  };

  return (
    <div className="relative group">
        <div 
          onClick={onClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className={`${sizeClasses[size]} relative border-2 ${borderClass} ${bgClass} ${glowClass} rounded-sm flex items-center justify-center cursor-pointer hover:brightness-125 transition-all active:scale-95 touch-manipulation select-none`}
        >
          {item ? (
            <>
                <span className="text-2xl filter drop-shadow-md">{item.icon}</span>
                <div className="absolute bottom-0 right-0.5 text-[8px] font-black text-white/50 bg-black/60 px-1 rounded-tl">
                    Lvl {item.requiredLevel}
                </div>
                {equippedItem && item.itemPower > equippedItem.itemPower && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg" />
                )}
            </>
          ) : (
            <span className="text-white/5 text-xl font-black select-none">{icon}</span>
          )}
        </div>
    </div>
  );
};

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ player, onEquip, onUnequip, onClose }) => {
  const classData = CLASS_REGISTRY[player.classType];
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [tooltipData, setTooltipData] = useState<{ item: Item; rect: DOMRect } | null>(null);

  const getEquippedInSlot = (slot?: string) => {
      if (!slot) return undefined;
      return (player.equipment as any)[slot];
  };

  const handleSlotClick = (item?: Item, isEquipped?: boolean) => {
      if (!item) return;
      if (window.innerWidth < 768) {
          // Mobile: Tap opens Action Modal
          setSelectedItem(item);
      } else {
          // Desktop: Click equips/unequips immediately
          isEquipped ? onUnequip(item.slot || 'MAIN_HAND') : onEquip(item);
      }
  };

  const handleTooltipStart = (item: Item, rect: DOMRect) => {
      setTooltipData({ item, rect });
  };

  const handleTooltipEnd = () => {
      setTooltipData(null);
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-slide-up-fade">
      
      {/* GLOBAL TOOLTIP LAYER */}
      {tooltipData && (
          <FixedTooltip 
            data={tooltipData} 
            equipped={getEquippedInSlot(tooltipData.item.slot)} 
          />
      )}

      {/* MOBILE ACTION MODAL (Tap) */}
      {selectedItem && (
          <div className="absolute z-[7000] inset-0 bg-black/90 flex items-center justify-center p-6 md:hidden" onClick={() => setSelectedItem(null)}>
              <div className="bg-[#1c1917] border-2 border-[#b45309] p-6 rounded-lg w-full max-w-sm space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.2)]" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-4">
                      <div className="w-16 h-16 border-2 border-white/20 bg-black/50 flex items-center justify-center text-4xl">
                          {selectedItem.icon}
                      </div>
                      <div>
                          <h3 className="text-lg font-black text-white">{selectedItem.name}</h3>
                          <p className="text-xs text-amber-500 font-bold uppercase">{selectedItem.rarity} {selectedItem.type}</p>
                      </div>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded border border-white/10 space-y-2">
                      <div className="flex justify-between text-xs text-white">
                          <span>Combat Rating</span>
                          <span className="font-bold text-amber-500">{selectedItem.itemPower}</span>
                      </div>
                      {selectedItem.affixes.map((affix, i) => (
                          <div key={i} className="text-xs text-emerald-400">+ {affix.label}</div>
                      ))}
                  </div>

                  <div className="flex gap-2">
                      <button 
                        onClick={() => {
                            const isEquipped = Object.values(player.equipment).some((e: any) => e?.id === selectedItem.id);
                            isEquipped ? onUnequip(selectedItem.slot || '') : onEquip(selectedItem);
                            setSelectedItem(null);
                        }}
                        className="flex-1 py-3 bg-amber-700 text-white font-black uppercase rounded shadow hover:bg-amber-600"
                      >
                          {Object.values(player.equipment).some((e: any) => e?.id === selectedItem.id) ? 'Unequip' : 'Equip'}
                      </button>
                      <button onClick={() => setSelectedItem(null)} className="flex-1 py-3 bg-white/10 text-white font-black uppercase rounded">Close</button>
                  </div>
                  <p className="text-[10px] text-center text-white/30 uppercase font-bold tracking-widest">Long Press item for stats</p>
              </div>
          </div>
      )}

      {/* GOTHIC PANEL CONTAINER */}
      <div className="relative w-full max-w-4xl bg-[#1c1917] border-double border-4 border-[#b45309] shadow-[0_0_50px_rgba(0,0,0,1)] flex flex-col md:flex-row overflow-hidden rounded-lg">
        
        {/* Header (Mobile Only) */}
        <div className="md:hidden p-4 border-b border-[#44403c] flex justify-between items-center bg-[#0c0a09]">
            <h2 className="gothic-title text-amber-500">Inventory</h2>
            <button onClick={onClose} className="text-white/50 text-xl">×</button>
        </div>

        {/* LEFT: PAPER DOLL */}
        <div className="w-full md:w-1/2 p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] relative flex flex-col items-center border-b md:border-b-0 md:border-r border-[#44403c]">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
            
            <div className="relative z-10 text-center mb-6">
                <h2 className="gothic-title text-2xl text-[#e7e5e4] font-black tracking-widest">{player.name}</h2>
                <p className={`text-xs uppercase font-bold tracking-[0.2em] ${classData.color}`}>{classData.name} • Level {player.level}</p>
                <div className="mt-1 text-[10px] text-amber-500 font-bold uppercase tracking-wider">Combat Rating: {player.stats.combatRating}</div>
            </div>

            <div className="relative z-10 flex gap-8">
                <div className="flex flex-col gap-4">
                    <Slot item={player.equipment.HEAD} icon="🪖" 
                        onClick={() => handleSlotClick(player.equipment.HEAD, true)} 
                        onHoverStart={(rect) => player.equipment.HEAD && handleTooltipStart(player.equipment.HEAD, rect)}
                        onHoverEnd={handleTooltipEnd}
                    />
                    <Slot item={player.equipment.CHEST} icon="👕" 
                        onClick={() => handleSlotClick(player.equipment.CHEST, true)} 
                        onHoverStart={(rect) => player.equipment.CHEST && handleTooltipStart(player.equipment.CHEST, rect)}
                        onHoverEnd={handleTooltipEnd}
                    />
                    <Slot item={player.equipment.HANDS} icon="🧤" 
                        onClick={() => handleSlotClick(player.equipment.HANDS, true)} 
                        onHoverStart={(rect) => player.equipment.HANDS && handleTooltipStart(player.equipment.HANDS, rect)}
                        onHoverEnd={handleTooltipEnd}
                    />
                    <Slot item={player.equipment.LEGS} icon="👖" 
                        onClick={() => handleSlotClick(player.equipment.LEGS, true)} 
                        onHoverStart={(rect) => player.equipment.LEGS && handleTooltipStart(player.equipment.LEGS, rect)}
                        onHoverEnd={handleTooltipEnd}
                    />
                    <Slot item={player.equipment.FEET} icon="👢" 
                        onClick={() => handleSlotClick(player.equipment.FEET, true)} 
                        onHoverStart={(rect) => player.equipment.FEET && handleTooltipStart(player.equipment.FEET, rect)}
                        onHoverEnd={handleTooltipEnd}
                    />
                </div>

                <div className="w-32 h-64 flex items-center justify-center opacity-30 pointer-events-none">
                    <div className="text-[120px] filter drop-shadow-lg">{classData.icon}</div>
                </div>

                <div className="flex flex-col gap-4">
                    <Slot item={player.equipment.AMULET} icon="📿" 
                        onClick={() => handleSlotClick(player.equipment.AMULET, true)} 
                        onHoverStart={(rect) => player.equipment.AMULET && handleTooltipStart(player.equipment.AMULET, rect)}
                        onHoverEnd={handleTooltipEnd}
                    />
                    <Slot item={player.equipment.RING_1} icon="💍" 
                        onClick={() => handleSlotClick(player.equipment.RING_1, true)} 
                        onHoverStart={(rect) => player.equipment.RING_1 && handleTooltipStart(player.equipment.RING_1, rect)}
                        onHoverEnd={handleTooltipEnd}
                    />
                    <Slot item={player.equipment.RING_2} icon="💍" 
                        onClick={() => handleSlotClick(player.equipment.RING_2, true)} 
                        onHoverStart={(rect) => player.equipment.RING_2 && handleTooltipStart(player.equipment.RING_2, rect)}
                        onHoverEnd={handleTooltipEnd}
                    />
                </div>
            </div>

            <div className="relative z-10 flex gap-12 mt-6">
                <Slot item={player.equipment.MAIN_HAND} icon="⚔️" size="lg" 
                    onClick={() => handleSlotClick(player.equipment.MAIN_HAND, true)} 
                    onHoverStart={(rect) => player.equipment.MAIN_HAND && handleTooltipStart(player.equipment.MAIN_HAND, rect)}
                    onHoverEnd={handleTooltipEnd}
                />
                <Slot item={player.equipment.OFF_HAND} icon="🛡️" size="lg" 
                    onClick={() => handleSlotClick(player.equipment.OFF_HAND, true)} 
                    onHoverStart={(rect) => player.equipment.OFF_HAND && handleTooltipStart(player.equipment.OFF_HAND, rect)}
                    onHoverEnd={handleTooltipEnd}
                />
            </div>
        </div>

        {/* RIGHT: INVENTORY GRID */}
        <div className="w-full md:w-1/2 p-6 bg-[#1a1a1a] flex flex-col">
            <div className="flex-1">
                <div className="grid grid-cols-5 gap-2 justify-items-center">
                    {Array.from({ length: 25 }).map((_, i) => (
                        <Slot 
                            key={i} 
                            item={player.inventory[i]} 
                            equippedItem={getEquippedInSlot(player.inventory[i]?.slot)}
                            onClick={() => handleSlotClick(player.inventory[i], false)} 
                            onHoverStart={(rect) => player.inventory[i] && handleTooltipStart(player.inventory[i], rect)}
                            onHoverEnd={handleTooltipEnd}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#44403c]">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-amber-500 font-black text-xl flex items-center gap-2">
                        <span>🪙</span> {player.gold.toLocaleString()}
                    </div>
                    <div className="text-[#a8a29e] text-xs font-bold uppercase tracking-widest">
                        Attack Power: <span className="text-white text-lg">{player.stats.damage}</span>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-[#292524] border border-[#b45309] text-[#fbbf24] font-black uppercase tracking-[0.2em] hover:bg-[#b45309] hover:text-black transition-colors"
                >
                    Close
                </button>
            </div>
        </div>

        <button 
            onClick={onClose}
            className="hidden md:block absolute top-4 right-4 text-white/30 hover:text-white text-2xl font-bold"
        >
            ×
        </button>
      </div>
    </div>
  );
};
