
import React, { useState, useEffect, useMemo } from 'react';
import { TradeSession, Item, Player } from '../types';

interface TradeModalProps {
  trade: TradeSession;
  player: Player;
  onUpdateOffer: (items: Item[], gold: number) => void;
  onLock: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ItemTooltip: React.FC<{ item: Item; x: number; y: number }> = ({ item, x, y }) => {
  const rarityColors = {
    COMMON: 'text-slate-400',
    UNCOMMON: 'text-emerald-400',
    RARE: 'text-mana-bright',
    EPIC: 'text-arcane-purple'
  };

  // Deterministic stat generation for visualization
  const getStats = () => {
    const baseVal = item.rarity === 'COMMON' ? 2 : item.rarity === 'UNCOMMON' ? 5 : item.rarity === 'RARE' ? 12 : 25;
    
    if (item.type === 'WEAPON') {
      return [
        { label: 'Attack Power', value: `+${baseVal}`, color: 'text-rose-400' },
        { label: 'Crit Chance', value: `${item.rarity === 'EPIC' ? '5%' : '1%'}`, color: 'text-amber-400' }
      ];
    }
    if (item.type === 'ARMOR') {
      return [
        { label: 'Armor Class', value: `+${baseVal}`, color: 'text-blue-400' },
        { label: 'Durability', value: '100/100', color: 'text-slate-400' }
      ];
    }
    if (item.type === 'CONSUMABLE') {
      return [{ label: 'Effect', value: 'Restores Vitality', color: 'text-emerald-400' }];
    }
    return [];
  };

  const stats = getStats();

  return (
    <div 
      className="fixed z-[3000] pointer-events-none p-4 arcane-panel border-mana-bright/30 w-64 shadow-2xl bg-slate-950/95 backdrop-blur-md"
      style={{ left: x + 20, top: y - 20 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-1">
         <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${rarityColors[item.rarity]}`}>
            {item.rarity} {item.type}
         </div>
         {item.slot && (
             <div className="text-[9px] text-white/30 uppercase font-bold tracking-wider border border-white/10 px-1 rounded">
                 {item.slot.replace('_', ' ')}
             </div>
         )}
      </div>

      <div className="gothic-title text-white text-lg font-black mb-3 leading-none tracking-tight shadow-black drop-shadow-md">
          {item.name}
      </div>
      
      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="mb-4 bg-black/40 p-2 rounded border border-white/5 space-y-1">
          {stats.map((stat, i) => (
            <div key={i} className="flex justify-between items-center text-xs">
              <span className="text-white/60 uppercase tracking-wider text-[9px] font-bold">{stat.label}</span>
              <span className={`${stat.color} font-mono font-bold shadow-black drop-shadow-sm`}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      <div className="text-[10px] text-white/50 italic leading-relaxed border-t border-white/10 pt-2 font-serif">
        "{item.description}"
      </div>
    </div>
  );
};

export const TradeModal: React.FC<TradeModalProps> = ({ trade, player, onUpdateOffer, onLock, onConfirm, onCancel }) => {
  const [offeredGold, setOfferedGold] = useState(trade.initiatorOffer.gold);
  const [selectedItems, setSelectedItems] = useState<Item[]>(trade.initiatorOffer.items);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'WEAPON' | 'CONSUMABLE'>('ALL');
  const [hoveredItem, setHoveredItem] = useState<{ item: Item; x: number; y: number } | null>(null);

  useEffect(() => {
    setOfferedGold(trade.initiatorOffer.gold);
    setSelectedItems(trade.initiatorOffer.items);
  }, [trade.initiatorOffer.gold, trade.initiatorOffer.items]);

  const filteredInventory = useMemo(() => {
    return player.inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'ALL' || item.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [player.inventory, searchTerm, filter]);

  const toggleItem = (item: Item) => {
    if (trade.initiatorOffer.isLocked) return;
    const isOffered = selectedItems.find(i => i.id === item.id);
    let newItems: Item[];
    if (isOffered) {
      newItems = selectedItems.filter(i => i.id !== item.id);
    } else {
      newItems = [...selectedItems, item];
    }
    setSelectedItems(newItems);
    onUpdateOffer(newItems, offeredGold);
  };

  const handleGoldChange = (val: number) => {
    if (trade.initiatorOffer.isLocked) return;
    const amount = Math.max(0, Math.min(player.gold, val));
    setOfferedGold(amount);
    onUpdateOffer(selectedItems, amount);
  };

  const isCompleted = trade.status === 'COMPLETED';

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onCancel} />
      
      {hoveredItem && <ItemTooltip item={hoveredItem.item} x={hoveredItem.x} y={hoveredItem.y} />}

      <div className="arcane-panel w-full max-w-5xl p-0 overflow-hidden relative border-mana-bright/20 shadow-[0_0_100px_rgba(0,0,0,0.9)] flex flex-col h-[85vh] max-h-[850px]">
        {/* Header */}
        <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center z-10">
          <div>
            <h2 className="gothic-title text-xl text-white font-black tracking-tight flex items-center gap-3">
              <span className="text-mana-bright">⚖️</span> Contract of Exchange
            </h2>
            <p className="text-[10px] text-mana-bright font-black uppercase tracking-widest mt-1">
              Negotiating with <span className="text-white">{trade.partnerName}</span>
            </p>
          </div>
          <button onClick={onCancel} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:text-white transition-all text-2xl">×</button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
          {/* Initiator Side */}
          <div className="flex flex-col border-r border-white/10 bg-sky-950/10 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
               <h3 className="gothic-title text-[11px] text-white/70 font-black uppercase">Your Offering</h3>
               {trade.initiatorOffer.isLocked && <span className="text-[9px] text-emerald-400 font-black bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">SEALED</span>}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="Search inventory..." 
                className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-mana-bright"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div className="flex gap-1">
                {(['ALL', 'WEAPON', 'CONSUMABLE'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${filter === f ? 'bg-mana-bright text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                    {f === 'ALL' ? '∞' : f === 'WEAPON' ? '⚔️' : '🧪'}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Selection Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-4 md:grid-cols-5 gap-3 p-3 bg-black/40 rounded-xl border border-white/5 scrollbar-hide mb-6">
              {filteredInventory.map(item => {
                const isSelected = selectedItems.find(i => i.id === item.id);
                return (
                  <div 
                    key={item.id}
                    onClick={() => toggleItem(item)}
                    onMouseEnter={(e) => setHoveredItem({ item, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`item-slot group relative cursor-pointer border-2 transition-all ${
                      isSelected 
                      ? 'bg-mana-blue/20 border-mana-bright shadow-[0_0_15px_rgba(56,189,248,0.3)] scale-95' 
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="arcane-icon text-3xl">{item.icon}</span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-3 h-3 bg-mana-bright rounded-full border border-black animate-pulse" />
                    )}
                  </div>
                );
              })}
              {filteredInventory.length === 0 && (
                <div className="col-span-full py-12 text-center text-white/20 text-[10px] uppercase font-black tracking-widest italic">
                  No artifacts found
                </div>
              )}
            </div>

            {/* Gold Input */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between text-[10px] font-black uppercase text-white/40 mb-2">
                <span>Gold Tribute</span>
                <span className="text-arcane-gold">Vault: {player.gold} 🪙</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-arcane-gold">🪙</span>
                <input 
                  type="number"
                  value={offeredGold || ''}
                  placeholder="0"
                  onChange={e => handleGoldChange(parseInt(e.target.value) || 0)}
                  disabled={trade.initiatorOffer.isLocked}
                  className="w-full bg-black/60 border border-white/10 rounded-lg py-3 pl-10 pr-16 text-arcane-gold gothic-title text-xl font-bold outline-none focus:border-arcane-gold/50"
                />
                <button 
                  onClick={() => handleGoldChange(player.gold)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-arcane-gold/10 text-arcane-gold text-[9px] font-black uppercase rounded border border-arcane-gold/30 hover:bg-arcane-gold/20"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* Partner Side */}
          <div className="flex flex-col bg-rose-950/10 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
               <h3 className="gothic-title text-[11px] text-white/70 font-black uppercase">{trade.partnerName}'s Bounty</h3>
               {trade.partnerOffer.isLocked ? (
                 <span className="text-[9px] text-emerald-400 font-black bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">SEALED</span>
               ) : (
                 <span className="text-[9px] text-amber-500 font-black bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">NEGOTIATING</span>
               )}
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-4 md:grid-cols-5 gap-3 p-3 bg-black/40 rounded-xl border border-white/5 scrollbar-hide mb-6">
              {trade.partnerOffer.items.map(item => (
                <div 
                  key={item.id}
                  onMouseEnter={(e) => setHoveredItem({ item, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="item-slot bg-white/5 border border-white/10"
                >
                  <span className="arcane-icon text-3xl">{item.icon}</span>
                </div>
              ))}
              {trade.partnerOffer.items.length === 0 && (
                <div className="col-span-full py-12 text-center text-white/20 text-[10px] uppercase font-black tracking-widest italic">
                  No bounty offered
                </div>
              )}
            </div>

            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="text-[10px] font-black uppercase text-white/40 mb-2">Partner Gold Bounty</div>
              <div className="bg-black/60 border border-white/10 rounded-lg py-4 px-6 flex items-center justify-between">
                <span className="text-2xl">🪙</span>
                <span className="text-arcane-gold gothic-title text-2xl font-bold">{trade.partnerOffer.gold.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-black/80 border-t border-white/10 backdrop-blur-xl z-10">
          {isCompleted ? (
             <div className="text-center py-2">
                <div className="text-emerald-400 gothic-title font-black text-2xl animate-bounce">TRADE COMPLETED</div>
                <div className="text-[10px] text-white/40 uppercase font-black tracking-[0.5em] mt-2">Reality State Updated</div>
             </div>
          ) : (
            <div className="flex gap-4">
              <button onClick={onCancel} className="px-8 py-4 border border-white/10 text-white/50 uppercase font-black text-[10px] tracking-widest hover:text-white rounded-xl transition-all">Abort</button>
              
              {!trade.initiatorOffer.isLocked ? (
                <button 
                  onClick={onLock}
                  className="flex-1 py-4 bg-mana-blue/20 border border-mana-bright text-mana-bright gothic-title font-black text-sm tracking-widest rounded-xl hover:bg-mana-blue/40 shadow-[0_0_20px_rgba(14,165,233,0.2)]"
                >
                  AFFIX SEAL 🔒
                </button>
              ) : (
                <button 
                  onClick={onConfirm}
                  disabled={trade.status !== 'READY'}
                  className={`flex-1 py-4 rounded-xl gothic-title font-black text-sm tracking-widest transition-all ${
                    trade.status === 'READY' 
                    ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:brightness-110 active:scale-95' 
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  {trade.status === 'READY' ? 'FINALIZE PACT ✨' : 'WAITING FOR PARTNER...'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
