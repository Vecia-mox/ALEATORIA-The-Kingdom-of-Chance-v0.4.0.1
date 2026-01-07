
import React, { memo, useCallback } from 'react';
import { Character, Item } from '../types';
import { GameSettings } from '../services/SettingsManager';
import { MobileControls } from './MobileControls';
import { CharacterMenu } from './CharacterMenu';
import { StatsWindow } from './StatsWindow';
import { SettingsWindow } from './SettingsWindow';
import { CLASS_REGISTRY } from '../data/ClassRegistry';

interface HUDProps {
  player: Character;
  activeWindow: 'char' | 'inv' | 'skills' | 'settings' | null;
  onOpenWindow: (win: 'char' | 'inv' | 'skills' | 'settings' | null) => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  onStatPoint: (stat: string) => void;
  onLogout: () => void;
  isMobile: boolean;
  onAction: (type: string, payload: any) => void;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  lastUpdate: number;
  onRespawn: () => void;
}

const DeathOverlay: React.FC<{ onRespawn: () => void }> = ({ onRespawn }) => (
    <div className="fixed inset-0 z-[9000] bg-black/95 flex flex-col items-center justify-center animate-slide-up-fade pointer-events-auto">
       <h2 className="gothic-title text-4xl text-red-600 font-black mb-4">YOU DIED</h2>
       <button onClick={onRespawn} className="px-8 py-3 border border-red-600 text-red-600 uppercase font-black tracking-widest hover:bg-red-600 hover:text-white transition-all">
           Resurrect
       </button>
    </div>
);

export const HUD: React.FC<HUDProps> = memo(({ player, activeWindow, onOpenWindow, onOpenAdmin, isAdmin, onStatPoint, onLogout, isMobile, onAction, onRespawn, settings, onUpdateSettings }) => {
  const classData = CLASS_REGISTRY[player.classType];

  const handleEquip = useCallback((item: Item) => onAction('EQUIP_ITEM', { itemId: item.id, slot: item.slot }), [onAction]);
  const handleUnequip = useCallback((slot: string) => onAction('UNEQUIP_ITEM', { slot }), [onAction]);
  const handleUpgradeSkill = useCallback((skillId: string) => onAction('UPGRADE_SKILL', { skillId }), [onAction]);
  const handleAssignSkill = useCallback((slotIndex: number, skillId: string) => onAction('ASSIGN_SKILL', { slotIndex, skillId }), [onAction]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      
      {player.hp <= 0 && <DeathOverlay onRespawn={onRespawn} />}
      
      {/* 1. MOBILE CONTROLS (Always Active Logic) */}
      <MobileControls 
        isEditing={false} 
        onSave={() => {}} 
        layout={settings.hudLayout}
        skillLoadout={player.skillLoadout}
        classType={player.classType}
        potionCharges={player.potionCharges}
        potionRefillTime={player.potionRefillTimestamp}
      />

      {/* 2. IMMORTAL UNIT FRAME (Top Left) */}
      <div className="absolute top-4 left-4 flex items-center pointer-events-auto filter drop-shadow-xl">
          
          {/* Portrait Container */}
          <div className="relative z-20" onClick={() => onOpenWindow('char')}>
             {/* Gothic Gold Frame (Simulated via borders/shadows if no image) */}
             <div className="w-16 h-16 rounded-full border-2 border-amber-600 bg-stone-900 overflow-hidden shadow-[0_0_10px_#000]">
                 <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-stone-800 to-black">
                     {classData.icon}
                 </div>
             </div>
             {/* Level Diamond */}
             <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black border-2 border-amber-500 rotate-45 flex items-center justify-center z-30 shadow-md">
                 <div className="-rotate-45 text-[10px] font-black text-amber-500 leading-none">{player.level}</div>
             </div>
          </div>

          {/* Bars (Extending Right) */}
          <div className="flex flex-col gap-1 -ml-4 pl-6 pr-4 py-1 bg-gradient-to-r from-black/80 to-transparent rounded-r-lg z-10 w-48">
              <div className="text-[10px] text-amber-100 font-bold tracking-wide uppercase drop-shadow-md truncate">{player.name}</div>
              
              {/* HP */}
              <div className="w-full h-3 bg-stone-900 border border-stone-600 rounded-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-900" />
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300" 
                    style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                  />
              </div>

              {/* MP */}
              <div className="w-3/4 h-2 bg-stone-900 border border-stone-600 rounded-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-900" />
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300" 
                    style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
                  />
              </div>
          </div>
      </div>

      {/* 3. SYSTEM MENU (Top Right) */}
      <div className="absolute top-4 right-4 flex gap-3 pointer-events-auto">
          <button onClick={() => onOpenWindow('inv')} className="w-8 h-8 rounded bg-black/60 border border-amber-900/50 flex items-center justify-center hover:border-amber-500">🎒</button>
          <button onClick={() => onOpenWindow('skills')} className="w-8 h-8 rounded bg-black/60 border border-amber-900/50 flex items-center justify-center hover:border-amber-500">📖</button>
          <button onClick={() => onOpenWindow('settings')} className="w-8 h-8 rounded bg-black/60 border border-white/20 flex items-center justify-center hover:border-white">⚙️</button>
      </div>

      {/* --- WINDOWS --- */}
      {activeWindow === 'char' && <StatsWindow player={player} onStatPoint={onStatPoint} onClose={() => onOpenWindow(null)} />}
      {(activeWindow === 'inv' || activeWindow === 'skills') && (
          <CharacterMenu 
            player={player} 
            initialTab={activeWindow === 'skills' ? 'skills' : 'inventory'}
            onEquip={handleEquip}
            onUnequip={handleUnequip}
            onUpgradeSkill={handleUpgradeSkill}
            onAssignSkill={handleAssignSkill}
            onClose={() => onOpenWindow(null)}
          />
      )}
      {activeWindow === 'settings' && <SettingsWindow settings={settings} onUpdateSettings={onUpdateSettings} onClose={() => onOpenWindow(null)} onLogout={onLogout} isAdmin={isAdmin} onOpenAdmin={onOpenAdmin} />}

    </div>
  );
}, (prev, next) => {
  return prev.lastUpdate === next.lastUpdate && prev.activeWindow === next.activeWindow;
});
