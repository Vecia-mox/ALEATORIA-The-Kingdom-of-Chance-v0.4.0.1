import React from 'react';

interface SettingsState {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  showDamageNumbers: boolean;
  highFidelityLight: boolean;
  particleDensity: 'Low' | 'Mid' | 'High';
  shakeIntensity: number;
}

interface AdvancedSettingsProps {
  settings: SettingsState;
  onUpdate: (newSettings: SettingsState) => void;
  onClose: () => void;
  onLogout: () => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ settings, onUpdate, onClose, onLogout }) => {
  const Slider = ({ label, value, min = 0, max = 1, step = 0.05, onChange }: any) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-black uppercase text-white/50 tracking-widest">
        <span>{label}</span>
        <span className="text-mana-bright">{Math.round(value * 100)}%</span>
      </div>
      <input 
        type="range" min={min} max={max} step={step} value={value} 
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-black/60 rounded-full appearance-none accent-mana-bright cursor-pointer"
      />
    </div>
  );

  const Toggle = ({ label, active, onToggle }: any) => (
    <button 
      onClick={() => onToggle(!active)}
      className="w-full flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/20 transition-all group"
    >
      <span className="text-xs text-white/70 group-hover:text-white transition-colors">{label}</span>
      <div className={`w-10 h-5 rounded-full relative transition-all ${active ? 'bg-mana-bright' : 'bg-white/10'}`}>
        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${active ? 'left-6' : 'left-1'}`} />
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="arcane-panel w-full max-w-2xl p-0 overflow-hidden relative border-mana-bright/30 shadow-[0_0_80px_rgba(0,0,0,1)] flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-8 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <div>
            <h2 className="gothic-title text-2xl text-white font-black tracking-widest">Reality Engine</h2>
            <p className="text-[10px] text-mana-bright font-black uppercase tracking-[0.4em] mt-1">Primordial Configuration</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 text-white/30 hover:text-white transition-all text-3xl">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
          {/* Audio Section */}
          <section className="space-y-6">
            <h3 className="text-mana-bright text-[10px] font-black uppercase tracking-[0.5em] border-l-2 border-mana-bright pl-4">Auditory Resonance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-black/30 p-6 rounded-2xl border border-white/5">
              <Slider label="Master Volume" value={settings.masterVolume} onChange={(v: any) => onUpdate({...settings, masterVolume: v})} />
              <div className="space-y-6">
                <Slider label="Ambient & Music" value={settings.musicVolume} onChange={(v: any) => onUpdate({...settings, musicVolume: v})} />
                <Slider label="Spell & Combat SFX" value={settings.sfxVolume} onChange={(v: any) => onUpdate({...settings, sfxVolume: v})} />
              </div>
            </div>
          </section>

          {/* Performance Section */}
          <section className="space-y-6">
            <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.5em] border-l-2 border-amber-500 pl-4">Causal Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Toggle label="High-Fidelity 2D Lighting" active={settings.highFidelityLight} onToggle={(v: any) => onUpdate({...settings, highFidelityLight: v})} />
              <Toggle label="Manifest Damage Numbers" active={settings.showDamageNumbers} onToggle={(v: any) => onUpdate({...settings, showDamageNumbers: v})} />
              
              <div className="col-span-full p-4 bg-black/40 border border-white/5 rounded-xl space-y-3">
                <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Atmospheric Density</div>
                <div className="flex gap-2">
                  {(['Low', 'Mid', 'High'] as const).map(d => (
                    <button 
                      key={d}
                      onClick={() => onUpdate({...settings, particleDensity: d})}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${settings.particleDensity === d ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Controls Visualizer */}
          <section className="space-y-6">
            <h3 className="text-sky-400 text-[10px] font-black uppercase tracking-[0.5em] border-l-2 border-sky-400 pl-4">Sigil Bindings</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'WASD', desc: 'Movement' },
                { key: 'SPACE', desc: 'Attack' },
                { key: 'E', desc: 'Interact' },
                { key: 'I', desc: 'Inventory' },
                { key: 'ESC', desc: 'Menu' },
                { key: 'ENTER', desc: 'Chat' }
              ].map(bind => (
                <div key={bind.key} className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                  <div className="text-mana-bright font-black text-sm mb-1">{bind.key}</div>
                  <div className="text-[9px] text-white/30 uppercase font-bold">{bind.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 bg-black/60 border-t border-white/10 flex justify-between items-center">
          <button 
            onClick={onLogout}
            className="px-6 py-3 border border-rose-500/30 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500/10 transition-all"
          >
            Sever Soul-Link
          </button>
          <button 
            onClick={onClose}
            className="px-10 py-3 bg-mana-bright text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all"
          >
            Apply & Return
          </button>
        </div>
      </div>
    </div>
  );
};