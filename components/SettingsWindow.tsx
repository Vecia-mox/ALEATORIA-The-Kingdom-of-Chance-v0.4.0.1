
import React, { useState } from 'react';
import { GameSettings, SettingsManager, GraphicsQuality, HUDLayout } from '../services/SettingsManager';
import { WindowContainer } from './WindowContainer';

interface SettingsWindowProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onClose: () => void;
  onLogout: () => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

type TabKey = 'GENERAL' | 'GRAPHICS' | 'AUDIO' | 'CONTROLS';

export const SettingsWindow: React.FC<SettingsWindowProps> = ({ settings, onUpdateSettings, onClose, onLogout, isAdmin, onOpenAdmin }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('GENERAL');

  const update = (key: keyof GameSettings, value: any) => {
    // Update local state in App
    const newSettings = { ...settings, [key]: value };
    onUpdateSettings(newSettings);
    // Persist and notify systems
    SettingsManager.set(key, value);
  };

  // --- UI COMPONENTS ---

  const Toggle = ({ label, value, onChange }: { label: string, value: boolean, onChange: (val: boolean) => void }) => (
    <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-lg hover:bg-black/60 transition-colors">
      <span className="text-xs font-bold text-stone-300 uppercase tracking-wide">{label}</span>
      <button 
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full relative transition-all ${value ? 'bg-amber-600' : 'bg-stone-800'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${value ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );

  const Slider = ({ label, value, min, max, step, format, onChange }: { label: string, value: number, min: number, max: number, step: number, format?: (v: number) => string, onChange: (v: number) => void }) => (
    <div className="p-3 bg-black/40 border border-white/5 rounded-lg">
      <div className="flex justify-between mb-2">
        <span className="text-xs font-bold text-stone-300 uppercase tracking-wide">{label}</span>
        <span className="text-xs font-mono text-amber-500">{format ? format(value) : value}</span>
      </div>
      <input 
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
      />
    </div>
  );

  const Dropdown = ({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (val: any) => void }) => (
    <div className="p-3 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between">
      <span className="text-xs font-bold text-stone-300 uppercase tracking-wide">{label}</span>
      <div className="flex gap-1">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1 rounded text-[10px] font-black uppercase transition-all ${value === opt ? 'bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'bg-stone-800 text-stone-500 hover:text-stone-300'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon }: { id: TabKey, label: string, icon: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full text-left px-4 py-4 flex items-center gap-3 transition-all border-l-2 ${activeTab === id ? 'bg-white/5 border-amber-500 text-amber-100' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
    >
      <span className="text-lg opacity-70">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <WindowContainer title="SYSTEM CONFIGURATION" onClose={onClose}>
      <div className="flex flex-col md:flex-row h-full min-h-[500px]">
        
        {/* Sidebar */}
        <div className="w-full md:w-48 bg-stone-950/50 border-b md:border-b-0 md:border-r border-white/5 flex flex-row md:flex-col overflow-x-auto md:overflow-visible shrink-0">
          <TabButton id="GENERAL" label="General" icon="⚙️" />
          <TabButton id="GRAPHICS" label="Graphics" icon="👁️" />
          <TabButton id="AUDIO" label="Audio" icon="🔊" />
          <TabButton id="CONTROLS" label="Controls" icon="🎮" />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          
          {activeTab === 'GENERAL' && (
            <div className="space-y-4 animate-slide-up-fade">
              <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2 mb-4">Gameplay</h3>
              <Toggle label="Show Damage Numbers" value={settings.showDamageNumbers} onChange={(v) => update('showDamageNumbers', v)} />
              <Toggle label="Auto-Loot Items" value={settings.autoLoot} onChange={(v) => update('autoLoot', v)} />
              <Toggle label="Haptic Vibration" value={settings.vibration} onChange={(v) => update('vibration', v)} />
              
              <h3 className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2 mb-4 mt-8">Account</h3>
              {isAdmin && (
                <button 
                  onClick={() => { onClose(); onOpenAdmin(); }}
                  className="w-full py-3 bg-red-950/20 border border-red-900/50 text-red-400 font-black uppercase rounded hover:bg-red-900/40 transition-all flex items-center justify-center gap-2 mb-2"
                >
                  <span>👁️</span> Open Admin Panel
                </button>
              )}
              <button 
                onClick={onLogout}
                className="w-full py-3 bg-stone-800/50 border border-white/10 text-stone-400 font-black uppercase rounded hover:bg-white/10 hover:text-white transition-all"
              >
                Log Out
              </button>
            </div>
          )}

          {activeTab === 'GRAPHICS' && (
            <div className="space-y-4 animate-slide-up-fade">
              <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2 mb-4">Display Quality</h3>
              <Dropdown label="Texture Quality" value={settings.quality} options={['LOW', 'MEDIUM', 'HIGH']} onChange={(v) => update('quality', v)} />
              <p className="text-[9px] text-amber-500/50 italic mb-2">* Changing texture quality requires a refresh to take effect.</p>
              
              <Slider label="Resolution Scale" value={settings.resolution} min={0.5} max={1.0} step={0.1} format={v => `${Math.round(v * 100)}%`} onChange={(v) => update('resolution', v)} />
              
              <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2 mb-4 mt-8">Effects</h3>
              <Toggle label="Bloom / Post-Processing" value={settings.bloom} onChange={(v) => update('bloom', v)} />
              <Toggle label="Dynamic Shadows" value={settings.shadows} onChange={(v) => update('shadows', v)} />
              <Toggle label="Weather Particles" value={settings.particles} onChange={(v) => update('particles', v)} />
              <Dropdown label="Frame Rate Cap" value={settings.fpsCap.toString()} options={['30', '60']} onChange={(v) => update('fpsCap', parseInt(v))} />
            </div>
          )}

          {activeTab === 'AUDIO' && (
            <div className="space-y-4 animate-slide-up-fade">
              <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2 mb-4">Volume</h3>
              <Slider label="Master Volume" value={settings.masterVolume} min={0} max={1} step={0.05} format={v => `${Math.round(v * 100)}%`} onChange={(v) => update('masterVolume', v)} />
              <Slider label="Music" value={settings.musicVolume} min={0} max={1} step={0.05} format={v => `${Math.round(v * 100)}%`} onChange={(v) => update('musicVolume', v)} />
              <Slider label="Sound Effects" value={settings.sfxVolume} min={0} max={1} step={0.05} format={v => `${Math.round(v * 100)}%`} onChange={(v) => update('sfxVolume', v)} />
            </div>
          )}

          {activeTab === 'CONTROLS' && (
            <div className="space-y-4 animate-slide-up-fade">
              <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2 mb-4">Interface</h3>
              <Dropdown label="HUD Layout" value={settings.hudLayout} options={['ARC', 'CLASSIC']} onChange={(v) => update('hudLayout', v)} />
              
              <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2 mb-4 mt-8">Touch Input</h3>
              <Slider label="Joystick Size" value={settings.joystickSize} min={50} max={150} step={10} format={v => `${v}%`} onChange={(v) => update('joystickSize', v)} />
              <Slider label="Joystick Opacity" value={settings.joystickOpacity} min={0.1} max={1} step={0.1} format={v => `${Math.round(v * 100)}%`} onChange={(v) => update('joystickOpacity', v)} />
            </div>
          )}

        </div>
      </div>
    </WindowContainer>
  );
};
