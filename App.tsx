
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ServerSimulator } from './services/ServerSimulator';
import { WorldState, Character, Position, Chunk } from './types';
import { Warden } from './services/Warden';
import { AuthService } from './services/AuthService';
import { AdminDashboard } from './components/AdminDashboard'; // Uses the new version
import { CharacterSelect } from './components/CharacterSelect';
import { GameCanvas, GameCanvasHandle } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { SettingsManager, GameSettings } from './services/SettingsManager';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(AuthService.getCurrentUser());
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const serverRef = useRef<ServerSimulator | null>(null);
  const canvasRef = useRef<GameCanvasHandle>(null);
  
  const [activeWindow, setActiveWindow] = useState<'char' | 'inv' | 'skills' | 'settings' | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobile] = useState(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0);
  
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [settings, setSettings] = useState<GameSettings>(SettingsManager.getSettings());

  useEffect(() => {
    if (!currentUser || !selectedCharacter) return;
    
    const server = new ServerSimulator((newState, events) => {
        setWorldState(newState);
        
        if (events && canvasRef.current) {
            const eventArray = Array.isArray(events) ? events : [events];
            eventArray.forEach(e => {
                if (e.type === 'MOB_ATTACK') {
                    canvasRef.current?.triggerCombatEffect('mob_attack', e.pos, e.mobId);
                }
                if (e.type === 'HEAL_EFFECT') {
                    canvasRef.current?.triggerCombatEffect('heal', e.pos, e.value);
                }
                if (e.type === 'POTION_PICKUP') {
                    canvasRef.current?.triggerCombatEffect('potion', e.pos);
                }
                if (e.type === 'LOOT_COLLECTED') {
                    canvasRef.current?.triggerCombatEffect('loot', e.pos, e.item.name);
                }
                if (e.type === 'ELITE_ABILITY') {
                    canvasRef.current?.triggerCombatEffect('elite_skill', e.pos, e.ability);
                }
                if (e.type === 'SOCKET_SUCCESS') {
                    canvasRef.current?.triggerCombatEffect('socket', e.pos);
                }
                if (e.type === 'PLAYER_HIT') {
                    canvasRef.current?.triggerCombatEffect('player_hit', e.pos, e.damage);
                }
                if (e.type === 'RESPAWN_EFFECT') {
                    canvasRef.current?.triggerCombatEffect('heal', e.pos, "REVIVED");
                }
            });
        }
    }, selectedCharacter);

    server.start();
    serverRef.current = server;
    return () => server.stop();
  }, [currentUser, selectedCharacter]);

  const handleAttack = useCallback((mobId: string | null) => {
    const target = mobId || activeTargetId;
    if (!serverRef.current || !worldState || !target) return;
    
    const player = worldState.players['player-1'];
    // Check if dead logic handled by server, but client optimization:
    if (player.hp <= 0) return;

    if (!Warden.validateAttackRate(player.lastAttackTimestamp, 800)) return;
    
    const result = serverRef.current.handlePlayerInput('player-1', { type: 'ATTACK', targetId: target });

    if (result && result.hit) {
      const allMobs = (Object.values(worldState.activeChunks) as Chunk[]).flatMap(c => c.mobs);
      const targetMob = allMobs.find(m => m.id === target);
      if (targetMob && canvasRef.current) {
        canvasRef.current.triggerCombatEffect(result.isCritical ? 'crit' : 'hit', targetMob.pos, result.damage, result.isWeakness);
      }
    }
  }, [worldState, activeTargetId]);

  const handleMove = useCallback((newPos: Position) => {
    if (!serverRef.current) return;
    serverRef.current.handlePlayerInput('player-1', { type: 'MOVE', payload: newPos });
  }, []);

  const handleTarget = (id: string | null) => {
      setActiveTargetId(id);
  };

  const handleStatPoint = (stat: string) => {
    serverRef.current?.handlePlayerInput('player-1', { type: 'DISTRIBUTE_STAT', stat });
  };

  const handleServerAction = (type: string, payload: any) => {
    serverRef.current?.handlePlayerInput('player-1', { type, ...payload });
  };

  const handleRespawn = () => {
    serverRef.current?.handlePlayerInput('player-1', { type: 'RESPAWN' });
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setSelectedCharacter(null);
    setWorldState(null);
    setActiveWindow(null);
  };

  const handleUpdateSettings = (newSettings: GameSettings) => {
    SettingsManager.setQuality(newSettings.quality);
    setSettings(newSettings);
  };

  if (!currentUser) return <AuthScreen onAuth={() => setCurrentUser(AuthService.getCurrentUser())} />;
  if (!selectedCharacter) return <CharacterSelect onSelect={setSelectedCharacter} onLogout={handleLogout} />;
  if (!worldState) return <div className="h-screen bg-black flex items-center justify-center gothic-title text-amber-500">Entering Realm...</div>;

  const player = worldState.players['player-1'];

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden touch-none select-none">
      
      {/* LAYER 1: GAME WORLD */}
      <GameCanvas 
        ref={canvasRef} 
        worldState={worldState} 
        onTargetMob={handleTarget} 
        onMove={handleMove} 
        onAttack={handleAttack} 
        onAction={handleServerAction} // Wired Up
        isMobile={isMobile} 
        selectedTargetId={activeTargetId}
        settings={settings}
      />

      {/* LAYER 2: HUD & UI */}
      <HUD 
        player={player}
        activeWindow={activeWindow}
        onOpenWindow={setActiveWindow}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdmin={currentUser.role === 'Admin'}
        onStatPoint={handleStatPoint}
        onLogout={handleLogout}
        isMobile={isMobile}
        onAction={handleServerAction}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        lastUpdate={Math.floor(worldState.tickCount / 4)} // Throttle HUD updates to ~400ms visual check
        onRespawn={handleRespawn}
      />

      {/* LAYER 3: FULL SCREEN ADMIN OVERLAY */}
      {isAdminOpen && (
        <AdminDashboard 
            worldState={worldState} 
            onClose={() => setIsAdminOpen(false)} 
            onAction={handleServerAction}
        />
      )}
    </div>
  );
};

// ... AuthScreen remains same ...
const AuthScreen: React.FC<{ onAuth: () => void }> = ({ onAuth }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'RECOVERY'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      if (mode === 'LOGIN') {
        const res = await AuthService.login(email, password);
        if (res.success) {
          onAuth();
        } else {
          setError(res.message);
        }
      } 
      else if (mode === 'REGISTER') {
        if (password !== confirmPassword) throw new Error("Sigils (Passwords) do not match.");
        if (password.length < 6) throw new Error("Sigil is too weak (min 6 chars).");
        if (!termsAccepted) throw new Error("You must bind your soul to the Terms of the Realm.");
        
        const isAvailable = await AuthService.checkEmailAvailability(email);
        if (!isAvailable) throw new Error("This Soul (Email) is already bound.");

        const res = await AuthService.register(email, password);
        if (res.success) {
          setSuccessMsg(res.message);
          setTimeout(() => setMode('LOGIN'), 1500);
        } else {
          setError(res.message);
        }
      }
      else if (mode === 'RECOVERY') {
        await new Promise(r => setTimeout(r, 1000));
        if (!email.includes('@')) throw new Error("Invalid Scribe Address.");
        setSuccessMsg(`A dark messenger has been dispatched to ${email}.`);
      }
    } catch (err: any) {
      setError(err.message || "An unknown darkness occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-40 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-black to-slate-950 z-0" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,black_120%)] z-0" />

      <div className="absolute inset-0 pointer-events-none opacity-30">
         {[...Array(20)].map((_,i) => (
            <div key={i} className="absolute w-1 h-1 bg-amber-500 rounded-full animate-slow-pulse" 
                 style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDuration: `${3+Math.random()*5}s`, animationDelay: `${Math.random()*2}s` }} 
            />
         ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 animate-slide-up-fade">
          <div className="inline-block relative">
             <div className="absolute -inset-4 bg-red-600/20 blur-xl rounded-full" />
             <h1 className="relative gothic-title text-amber-500 text-5xl font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">ALEATORIA</h1>
          </div>
          <p className="text-[10px] text-stone-500 font-black uppercase tracking-[0.6em] mt-3 border-t border-stone-800 pt-3 mx-12">The Kingdom of Chance</p>
        </div>

        <div className="d2-panel bg-slate-950/95 border-amber-900/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-sm animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
          <div className="flex border-b border-amber-900/30">
            <button onClick={() => setMode('LOGIN')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'LOGIN' ? 'bg-amber-900/20 text-amber-500 shadow-[inset_0_-2px_0_#f59e0b]' : 'text-stone-600 hover:text-stone-400 hover:bg-white/5'}`}>Enter Realm</button>
            <button onClick={() => setMode('REGISTER')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'REGISTER' ? 'bg-amber-900/20 text-amber-500 shadow-[inset_0_-2px_0_#f59e0b]' : 'text-stone-600 hover:text-stone-400 hover:bg-white/5'}`}>New Soul</button>
          </div>

          <div className="p-8">
            {mode === 'RECOVERY' && (
               <div className="mb-6 text-center">
                  <h3 className="text-amber-500 gothic-title text-lg mb-2">Soul Recovery</h3>
                  <p className="text-xs text-stone-500">Enter your scribe address to summon a recovery spirit.</p>
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                <label className="block text-[9px] text-stone-500 uppercase font-black tracking-widest mb-1 group-focus-within:text-amber-500 transition-colors">Scribe Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-stone-600 group-focus-within:text-amber-500 transition-colors">✉️</span>
                  <input type="email" className="w-full bg-black border border-stone-800 rounded-md py-2.5 pl-10 pr-3 text-stone-300 text-sm focus:border-amber-700 focus:ring-1 focus:ring-amber-900/50 outline-none transition-all placeholder:text-stone-700 font-serif" placeholder="name@domain.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              {mode !== 'RECOVERY' && (
                <div className="group">
                  <label className="block text-[9px] text-stone-500 uppercase font-black tracking-widest mb-1 group-focus-within:text-amber-500 transition-colors">Secret Sigil</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-stone-600 group-focus-within:text-amber-500 transition-colors">🔒</span>
                    <input type={showPassword ? "text" : "password"} className="w-full bg-black border border-stone-800 rounded-md py-2.5 pl-10 pr-10 text-stone-300 text-sm focus:border-amber-700 focus:ring-1 focus:ring-amber-900/50 outline-none transition-all placeholder:text-stone-700 font-serif" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-stone-600 hover:text-stone-300 transition-colors text-xs uppercase font-bold">{showPassword ? "Hide" : "Show"}</button>
                  </div>
                </div>
              )}

              {mode === 'REGISTER' && (
                <>
                <div className="group animate-slide-up-fade">
                  <label className="block text-[9px] text-stone-500 uppercase font-black tracking-widest mb-1 group-focus-within:text-amber-500 transition-colors">Confirm Sigil</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-stone-600 group-focus-within:text-amber-500 transition-colors">🔐</span>
                    <input type={showPassword ? "text" : "password"} className="w-full bg-black border border-stone-800 rounded-md py-2.5 pl-10 pr-3 text-stone-300 text-sm focus:border-amber-700 focus:ring-1 focus:ring-amber-900/50 outline-none transition-all placeholder:text-stone-700 font-serif" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>
                <div className="flex items-start gap-3 animate-slide-up-fade bg-black/40 p-3 rounded border border-stone-800/50">
                  <input type="checkbox" id="terms" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1 accent-amber-600 bg-stone-900 border-stone-700" />
                  <label htmlFor="terms" className="text-[10px] text-stone-400 leading-relaxed cursor-pointer select-none">I accept the <span className="text-amber-500 hover:underline">Laws of the High Heavens</span> and agree to bind my soul to the Aleatorian server protocols.</label>
                </div>
                </>
              )}

              {error && <div className="p-3 bg-red-950/30 border border-red-900/50 rounded text-red-400 text-xs font-serif text-center animate-pulse">⚠ {error}</div>}
              {successMsg && <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded text-emerald-400 text-xs font-serif text-center">✨ {successMsg}</div>}

              <button type="submit" disabled={isProcessing} className="w-full relative group overflow-hidden bg-stone-900 border border-amber-900/50 rounded-md py-3 transition-all hover:bg-stone-800 hover:border-amber-600 disabled:opacity-50 disabled:cursor-not-allowed">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative text-amber-500 gothic-title font-black text-sm tracking-[0.2em]">{isProcessing ? 'Communng...' : (mode === 'LOGIN' ? 'Enter World' : mode === 'REGISTER' ? 'Bind Soul' : 'Send Spirit')}</span>
              </button>
            </form>

            <div className="mt-6 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-stone-600">
              {mode === 'LOGIN' && <button onClick={() => setMode('RECOVERY')} className="hover:text-amber-500 transition-colors">Lost your Sigil?</button>}
              {mode === 'RECOVERY' && <button onClick={() => setMode('LOGIN')} className="hover:text-amber-500 transition-colors w-full text-center">Return to Gate</button>}
              <span className="opacity-30">v0.1.7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
