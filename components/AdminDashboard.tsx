
import React, { useState, useEffect, useRef } from 'react';
import { WorldState, Player } from '../types';
import { MOB_REGISTRY } from '../data/MobRegistry';
import { AdminService } from '../services/AdminService';

interface AdminDashboardProps {
  worldState: WorldState | null;
  onClose: () => void;
  onAction?: (type: string, payload: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ worldState, onClose, onAction }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'world' | 'items'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [spawnCount, setSpawnCount] = useState(1);
  const [selectedMob, setSelectedMob] = useState('goblin');
  const [isGodMode, setIsGodMode] = useState(false);
  
  // FPS Graph Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    // Block Game Inputs when interacting with Dashboard
    const inputElements = document.querySelectorAll('input, select, button');
    const stopProp = (e: any) => e.stopPropagation();
    inputElements.forEach(el => {
        el.addEventListener('keydown', stopProp);
        el.addEventListener('keyup', stopProp);
        el.addEventListener('touchstart', stopProp);
    });
    return () => {
        inputElements.forEach(el => {
            el.removeEventListener('keydown', stopProp);
            el.removeEventListener('keyup', stopProp);
            el.removeEventListener('touchstart', stopProp);
        });
    };
  }, [activeTab]);

  // Graph Loop
  useEffect(() => {
    if (activeTab !== 'overview') return;
    
    let frameId: number;
    const ctx = canvasRef.current?.getContext('2d');
    
    const draw = () => {
      if (!ctx || !canvasRef.current) return;
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      
      const newVal = 55 + Math.random() * 5;
      historyRef.current.push(newVal);
      if (historyRef.current.length > w / 2) historyRef.current.shift();

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.05)';
      ctx.fillRect(0, 0, w, h);
      
      ctx.beginPath();
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      
      historyRef.current.forEach((val, i) => {
        const x = i * 2;
        const y = h - ((val / 60) * h);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      
      frameId = requestAnimationFrame(draw);
    };
    
    draw();
    return () => cancelAnimationFrame(frameId);
  }, [activeTab]);

  const handleAction = (action: any) => {
      if (onAction) {
          onAction(action.type, action);
      }
  };

  const toggleGodMode = () => {
      const newState = !isGodMode;
      setIsGodMode(newState);
      handleAction(AdminService.toggleGodMode(newState));
  };

  if (!worldState) return null;

  const activeMobs = Object.values(worldState.activeChunks).reduce((acc, chunk: any) => acc + (chunk.mobs?.length || 0), 0);
  const players = Object.values(worldState.players) as Player[];

  // --- RESPONSIVE TAB BUTTON ---
  const TabBtn = ({ id, label, icon }: { id: any, label: string, icon: string }) => (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex-1 md:flex-none md:w-full py-4 md:px-6 md:py-4 flex flex-col md:flex-row items-center md:gap-3 transition-all border-t-2 md:border-t-0 md:border-r-2 ${
            activeTab === id 
            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
            : 'border-transparent text-white/30 hover:text-white hover:bg-white/5'
        }`}
      >
          <span className="text-xl md:text-lg mb-1 md:mb-0">{icon}</span>
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{label}</span>
      </button>
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-8 pointer-events-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full h-full md:max-w-6xl md:h-[85vh] bg-[#0a0a0a]/95 md:rounded-xl border-0 md:border border-cyan-500/30 shadow-[0_0_50px_rgba(0,255,255,0.1)] flex flex-col md:flex-row overflow-hidden">
        
        {/* MOBILE HEADER (Top) */}
        <div className="md:hidden flex justify-between items-center p-4 border-b border-white/10 bg-black/40">
            <h1 className="text-lg font-black text-cyan-400 tracking-tighter flex items-center gap-2">
                <span>⚡</span> GOD MODE
            </h1>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center">×</button>
        </div>

        {/* DESKTOP SIDEBAR (Left) */}
        <div className="hidden md:flex w-64 bg-black/40 border-r border-white/10 flex-col shrink-0">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-2xl font-black text-cyan-400 tracking-tighter">GOD MODE</h1>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">v2.1 // ADMIN</p>
            </div>
            
            <nav className="flex-1 flex flex-col">
                <TabBtn id="overview" label="Overview" icon="📊" />
                <TabBtn id="players" label="Players" icon="👤" />
                <TabBtn id="world" label="World" icon="🌍" />
                <TabBtn id="items" label="Items" icon="📦" />
            </nav>

            <div className="p-4 border-t border-white/10">
                <button onClick={onClose} className="w-full py-3 bg-red-900/20 text-red-500 border border-red-500/30 rounded font-black uppercase text-xs hover:bg-red-900/40">
                    Exit Tool
                </button>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] relative">
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { label: 'Tick Rate', val: '100ms', color: 'text-emerald-400' },
                            { label: 'Entities', val: activeMobs, color: 'text-cyan-400' },
                            { label: 'Uptime', val: worldState.gameTime + 't', color: 'text-amber-400' },
                            { label: 'Players', val: players.length, color: 'text-pink-400' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-black/40 border border-white/5 p-4 md:p-6 rounded-lg">
                                <div className="text-[9px] md:text-[10px] uppercase text-white/30 font-bold mb-1 md:mb-2">{stat.label}</div>
                                <div className={`text-2xl md:text-3xl font-black ${stat.color} font-mono`}>{stat.val}</div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-black/60 border border-white/10 rounded-lg p-4 md:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs uppercase font-bold text-white/50">Performance Graph</h3>
                            <div className="text-[10px] text-emerald-400 font-mono">60 FPS</div>
                        </div>
                        <canvas ref={canvasRef} width={800} height={200} className="w-full h-32 md:h-48 rounded bg-black/20" />
                    </div>

                    <button 
                        onClick={toggleGodMode}
                        className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-sm transition-all border ${
                            isGodMode ? 'bg-amber-500 text-black border-amber-500' : 'bg-transparent border-amber-500/30 text-amber-500'
                        }`}
                    >
                        {isGodMode ? 'GOD MODE ACTIVE' : 'ENABLE GOD MODE'}
                    </button>
                </div>
            )}

            {/* TAB: PLAYERS */}
            {activeTab === 'players' && (
                <div className="p-6 md:p-8">
                    <div className="mb-6">
                        <input 
                            type="text" 
                            placeholder="Search Players..." 
                            className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-white text-xs focus:border-cyan-500 outline-none font-mono"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        {players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                            <div key={p.id} className="bg-black/40 border border-white/5 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-lg">{p.name}</span>
                                        <span className="text-[10px] bg-white/10 px-2 rounded text-white/50">{p.classType}</span>
                                    </div>
                                    <div className="text-xs text-white/40 font-mono mt-1">
                                        Lvl {p.level} • HP {p.hp}/{p.maxHp} • {p.id.substring(0, 8)}
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2 md:flex">
                                    <button onClick={() => handleAction(AdminService.teleportTo(p.id))} className="p-2 md:px-3 bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 text-[9px] uppercase font-bold rounded hover:bg-cyan-500/20">TP To</button>
                                    <button onClick={() => handleAction(AdminService.summon(p.id))} className="p-2 md:px-3 bg-purple-900/30 text-purple-400 border border-purple-500/30 text-[9px] uppercase font-bold rounded hover:bg-purple-500/20">Summon</button>
                                    <button onClick={() => handleAction(AdminService.kill(p.id))} className="p-2 md:px-3 bg-red-900/30 text-red-400 border border-red-500/30 text-[9px] uppercase font-bold rounded hover:bg-red-500/20">Kill</button>
                                    <button onClick={() => handleAction(AdminService.ban(p.id))} className="p-2 md:px-3 bg-stone-800 text-stone-400 border border-stone-600 text-[9px] uppercase font-bold rounded hover:bg-stone-700">Ban</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: WORLD */}
            {activeTab === 'world' && (
                <div className="p-6 md:p-8 space-y-8">
                    <section>
                        <h3 className="text-xs uppercase font-bold text-cyan-500 mb-4 border-b border-cyan-500/20 pb-2">Atmosphere</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['CLEAR', 'RAIN', 'ASH', 'FOG'].map(w => (
                                <button 
                                    key={w} 
                                    onClick={() => handleAction(AdminService.setWeather(w))}
                                    className="py-4 bg-black/40 border border-white/10 rounded hover:border-cyan-500 hover:text-cyan-400 transition-all text-xs font-bold"
                                >
                                    {w}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs uppercase font-bold text-red-500 mb-4 border-b border-red-500/20 pb-2">Spawner</h3>
                        <div className="bg-black/40 p-4 md:p-6 rounded border border-white/10 flex flex-col md:flex-row gap-4 items-end">
                            <div className="w-full md:flex-1">
                                <label className="block text-[9px] uppercase text-white/30 font-bold mb-2">Mob Type</label>
                                <select 
                                    value={selectedMob}
                                    onChange={e => setSelectedMob(e.target.value)}
                                    className="w-full bg-black border border-white/20 rounded p-3 text-white text-sm outline-none"
                                >
                                    {Object.keys(MOB_REGISTRY).map(key => <option key={key} value={key}>{key.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="w-full md:w-32">
                                <label className="block text-[9px] uppercase text-white/30 font-bold mb-2">Count</label>
                                <input 
                                    type="number" 
                                    value={spawnCount}
                                    onChange={e => setSpawnCount(parseInt(e.target.value))}
                                    className="w-full bg-black border border-white/20 rounded p-3 text-white text-sm outline-none"
                                />
                            </div>
                            <button 
                                onClick={() => handleAction(AdminService.spawnMob(selectedMob, spawnCount))}
                                className="w-full md:w-auto px-8 py-3 bg-red-600 text-white font-black uppercase tracking-widest rounded shadow-lg hover:bg-red-500"
                            >
                                Spawn
                            </button>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs uppercase font-bold text-amber-500 mb-4 border-b border-amber-500/20 pb-2">Chronos</h3>
                        <input 
                            type="range" 
                            min={0} max={1200} 
                            value={worldState.gameTime}
                            onChange={(e) => handleAction(AdminService.setTime(parseInt(e.target.value)))}
                            className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="flex justify-between text-[10px] text-white/30 font-mono mt-2">
                            <span>Dawn</span>
                            <span>{Math.floor(worldState.gameTime / 1200 * 24)}:00</span>
                            <span>Dusk</span>
                        </div>
                    </section>
                </div>
            )}

            {/* TAB: ITEMS */}
            {activeTab === 'items' && (
                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6 border-b border-purple-500/20 pb-2">
                        <h3 className="text-xs uppercase font-bold text-purple-500">Artifact Fabricator</h3>
                        <button onClick={() => handleAction(AdminService.addGold(1000))} className="px-4 py-2 bg-amber-900/30 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase rounded hover:bg-amber-500/20">+1000 Gold</button>
                    </div>
                    
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
                        {['Rusty Sword', 'Iron Axe', 'Short Bow', 'Wand', 'Staff', 'Dagger', 'Tunic', 'Plate Mail', 'Robes', 'Ring', 'Amulet'].map(item => (
                            <button 
                                key={item}
                                onClick={() => handleAction(AdminService.addItem(item))}
                                className="aspect-square bg-black/40 border border-white/10 rounded flex flex-col items-center justify-center hover:bg-purple-900/20 hover:border-purple-500 transition-all group"
                            >
                                <span className="text-2xl md:text-3xl mb-2 grayscale group-hover:grayscale-0">📦</span>
                                <span className="text-[8px] md:text-[10px] uppercase font-bold text-white/50 group-hover:text-purple-300 text-center px-1">{item}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

        </div>

        {/* MOBILE BOTTOM NAV (Bottom) */}
        <div className="md:hidden flex h-16 bg-black border-t border-white/10 shrink-0">
            <TabBtn id="overview" label="Overview" icon="📊" />
            <TabBtn id="players" label="Players" icon="👤" />
            <TabBtn id="world" label="World" icon="🌍" />
            <TabBtn id="items" label="Items" icon="📦" />
        </div>

      </div>
    </div>
  );
};
