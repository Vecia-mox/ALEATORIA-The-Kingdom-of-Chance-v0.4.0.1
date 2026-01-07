
import React, { useRef, useEffect, useState } from 'react';
import { MobileBridge } from '../services/MobileBridge';
import { HUDLayout } from '../services/SettingsManager';
import { CLASS_REGISTRY } from '../data/ClassRegistry';
import { ClassType } from '../types';

interface MobileControlsProps {
    isEditing: boolean;
    onSave: () => void;
    layout: HUDLayout;
    skillLoadout: Record<number, string>;
    classType: ClassType;
    potionCharges: number;
    potionRefillTime?: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ skillLoadout, classType, potionCharges, potionRefillTime }) => {
  const activeSkillRef = useRef<number | null>(null);
  const skillTouchIdRef = useRef<number | null>(null);
  const [refillCountdown, setRefillCountdown] = useState<number | null>(null);

  // Timer for Potion Refill
  useEffect(() => {
      let interval: any;
      if (potionRefillTime && potionRefillTime > Date.now()) {
          interval = setInterval(() => {
              const diff = Math.ceil((potionRefillTime - Date.now()) / 1000);
              if (diff <= 0) {
                  setRefillCountdown(null);
                  clearInterval(interval);
              } else {
                  setRefillCountdown(diff);
              }
          }, 1000);
          setRefillCountdown(Math.ceil((potionRefillTime - Date.now()) / 1000));
      } else {
          setRefillCountdown(null);
      }
      return () => clearInterval(interval);
  }, [potionRefillTime, potionCharges]);

  // --- SKILL LOGIC (Snappy Hold-to-Attack) ---
  const handleSkillStart = (e: React.TouchEvent, slot: number) => {
      e.stopPropagation(); // Don't trigger joystick under overlay
      const t = e.changedTouches[0];
      skillTouchIdRef.current = t.identifier;
      activeSkillRef.current = slot;

      // Set bridge state
      updateBridge(slot, true);
  };

  const handleSkillEnd = (e: React.TouchEvent) => {
      if (activeSkillRef.current !== null) {
          updateBridge(activeSkillRef.current, false);
          activeSkillRef.current = null;
      }
  };

  const updateBridge = (slot: number, isActive: boolean) => {
      if (slot === 0) MobileBridge.isAttacking = isActive;
      else if (slot === 1) MobileBridge.skill1 = isActive;
      else if (slot === 2) MobileBridge.skill2 = isActive;
      else if (slot === 3) MobileBridge.skill3 = isActive;
      else if (slot === 4) MobileBridge.skill4 = isActive;
      else if (slot === 99) MobileBridge.isHealing = isActive;
      else if (slot === 98) MobileBridge.isDodging = isActive;
  };

  const getSkillIcon = (slot: number) => {
      const skillId = skillLoadout[slot];
      if (!skillId) return slot;
      const skill = CLASS_REGISTRY[classType].skills.find(s => s.id === skillId);
      return skill ? skill.icon : slot;
  };

  return (
    <div 
        className="fixed inset-0 z-[5000] touch-none select-none overflow-hidden pointer-events-none"
        onTouchEnd={handleSkillEnd}
        onTouchCancel={handleSkillEnd}
    >
        {/* SKILL ARC (Pure CSS Layout) - Right Side Interactive */}
        <div className="absolute bottom-6 right-6 w-64 h-64 pointer-events-auto">
             
             {/* Main Attack - Instant Response */}
             <div 
                className="absolute bottom-0 right-0 w-24 h-24 rounded-full border-4 border-[#fbbf24] flex items-center justify-center bg-gradient-to-t from-red-900 to-red-600 shadow-xl active:scale-90 transition-transform z-10"
                onTouchStart={(e) => handleSkillStart(e, 0)}
             >
                 <span className="text-4xl drop-shadow-md brightness-150">⚔️</span>
             </div>

             {/* Skills */}
             <div 
                className="absolute bottom-28 right-2 w-16 h-16 rounded-full border-2 border-stone-500 bg-stone-900 flex items-center justify-center shadow-lg active:scale-90 active:border-cyan-400 transition-transform"
                onTouchStart={(e) => handleSkillStart(e, 1)}
             >
                 <span className="text-2xl">{getSkillIcon(1)}</span>
             </div>

             <div 
                className="absolute bottom-24 right-20 w-16 h-16 rounded-full border-2 border-stone-500 bg-stone-900 flex items-center justify-center shadow-lg active:scale-90 active:border-cyan-400 transition-transform"
                onTouchStart={(e) => handleSkillStart(e, 2)}
             >
                 <span className="text-2xl">{getSkillIcon(2)}</span>
             </div>

             <div 
                className="absolute bottom-12 right-28 w-16 h-16 rounded-full border-2 border-stone-500 bg-stone-900 flex items-center justify-center shadow-lg active:scale-90 active:border-cyan-400 transition-transform"
                onTouchStart={(e) => handleSkillStart(e, 3)}
             >
                 <span className="text-2xl">{getSkillIcon(3)}</span>
             </div>

             <div 
                className="absolute bottom-40 right-14 w-14 h-14 rounded-full border-2 border-amber-500/50 bg-stone-950 flex items-center justify-center shadow-lg active:scale-90 active:border-amber-400 transition-transform"
                onTouchStart={(e) => handleSkillStart(e, 4)}
             >
                 <span className="text-xl">{getSkillIcon(4)}</span>
             </div>

             {/* Utility - Potion */}
             <div 
                className={`absolute bottom-44 right-32 w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-md active:scale-90 transition-all ${
                    potionCharges > 0 ? 'border-red-500 bg-red-950/80' : 'border-stone-600 bg-stone-900/80 grayscale'
                }`}
                onTouchStart={(e) => handleSkillStart(e, 99)}
             >
                 <span className="text-2xl">🍷</span>
                 {potionCharges > 0 && (
                     <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-black border border-black text-white">
                         {potionCharges}
                     </div>
                 )}
                 {refillCountdown !== null && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                         <span className="text-xs font-black text-white">{refillCountdown}s</span>
                     </div>
                 )}
             </div>

             {/* Utility - Dodge */}
             <div 
                className="absolute bottom-2 right-40 w-12 h-12 rounded-full border border-emerald-500 bg-emerald-950/80 flex items-center justify-center shadow-md active:scale-90"
                onTouchStart={(e) => handleSkillStart(e, 98)} 
             >
                 💨
             </div>
        </div>
    </div>
  );
};
