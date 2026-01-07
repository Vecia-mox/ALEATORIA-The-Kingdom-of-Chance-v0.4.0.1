
import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { TitanEngine } from '../engine/TitanCore'; // The new 3D Engine
import { WorldState } from '../types';
import { GameSettings } from '../services/SettingsManager';

interface GameCanvasProps {
  worldState: WorldState;
  onTargetMob: (id: string | null) => void;
  onMove: (pos: { x: number, y: number }) => void;
  onAttack: (mobId: string) => void;
  onAction: (type: string, payload?: any) => void; 
  isMobile: boolean;
  selectedTargetId: string | null;
  settings: GameSettings;
}

export interface GameCanvasHandle {
  triggerCombatEffect: (type: any, pos: any, value?: any, isWeakness?: boolean) => void;
}

export const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(({ worldState, settings }, ref) => {
  const engineRef = useRef<TitanEngine | null>(null);
  const canvasId = 'titan-viewport';

  useImperativeHandle(ref, () => ({
    triggerCombatEffect: (type, pos, value, isWeakness) => {
      // Forward VFX to Titan Engine
      // engineRef.current?.triggerVFX(type, pos, value);
    }
  }));

  // --- INITIALIZATION ---
  useEffect(() => {
    const initEngine = async () => {
      if (engineRef.current) return;

      try {
        const engine = new TitanEngine(canvasId);
        await engine.start();
        engineRef.current = engine;
      } catch (e) {
        console.error("Titan Engine Failed to Start:", e);
      }
    };

    initEngine();

    return () => {
      engineRef.current?.stop();
    };
  }, []);

  // --- STATE SYNC ---
  useEffect(() => {
    if (engineRef.current && worldState) {
      engineRef.current.syncState(worldState);
    }
  }, [worldState]);

  return (
    <div className="absolute inset-0 bg-black">
      <canvas 
        id={canvasId} 
        className="w-full h-full block"
        width={window.innerWidth} 
        height={window.innerHeight} 
      />
      
      {/* UI Overlay for Loading/Debug */}
      {!engineRef.current && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="gothic-title text-amber-500 animate-pulse text-2xl">
            INITIALIZING TITAN ENGINE...
          </div>
        </div>
      )}
    </div>
  );
});
