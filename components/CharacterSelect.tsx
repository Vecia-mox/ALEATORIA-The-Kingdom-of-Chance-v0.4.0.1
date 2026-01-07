
import React, { useState, useEffect, useMemo } from 'react';
import { AuthService } from '../services/AuthService';
import { Character, ClassType, ClassDetail } from '../types';
import { CLASS_REGISTRY } from '../data/ClassRegistry';

interface CharacterSelectProps {
  onSelect: (character: Character) => void;
  onLogout: () => void;
}

const BANNED_WORDS = ['admin', 'gm', 'staff', 'mod', 'fuck', 'shit', 'ass', 'bitch'];

const StatBar: React.FC<{ label: string; value: number; max?: number; colorClass: string }> = ({ label, value, max = 20, colorClass }) => {
  const percent = Math.min(100, (value / max) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[9px] uppercase font-bold text-white/50 mb-1">
        <span>{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
        <div 
          className={`h-full ${colorClass.replace('text-', 'bg-')} transition-all duration-500`} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS EXTRACTED TO PREVENT RE-RENDER FOCUS LOSS ---

const MobileCreationLayout: React.FC<{
  activeClass: ClassDetail;
  mobileTab: 'origin' | 'attributes' | 'skills';
  setMobileTab: (tab: 'origin' | 'attributes' | 'skills') => void;
  charName: string;
  setCharName: (name: string) => void;
  nameError: string | null;
  setNameError: (err: string | null) => void;
  isNameAvailable: boolean | null;
  setIsNameAvailable: (val: boolean | null) => void;
  isCheckingName: boolean;
  handleCheckName: () => void;
  handleCreate: () => void;
  setIsCreating: (val: boolean) => void;
  setSelectedClassType: (type: ClassType) => void;
  selectedClassType: ClassType;
}> = ({
  activeClass, mobileTab, setMobileTab, charName, setCharName, nameError, setNameError, 
  isNameAvailable, setIsNameAvailable, isCheckingName, handleCheckName, handleCreate, 
  setIsCreating, setSelectedClassType, selectedClassType
}) => (
    <div className="fixed inset-0 z-[1200] flex flex-col bg-black overflow-hidden selection:bg-amber-900/50">
       {/* Background */}
       <div className={`absolute inset-0 transition-colors duration-1000 bg-gradient-to-b ${activeClass.gradient}`} />
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p6.png')] opacity-20" />
       
       {/* --- 1. Top Banner (Small) --- */}
       <div className="relative z-10 flex items-center p-4 bg-black/60 border-b border-white/10 backdrop-blur-md shrink-0">
           <div className="text-4xl filter drop-shadow-md mr-4" style={{ textShadow: `0 0 20px ${activeClass.hex}` }}>
               {activeClass.icon}
           </div>
           <div className="flex-1">
               <h1 className={`gothic-title text-2xl font-black tracking-tight ${activeClass.color} drop-shadow-md leading-none`}>
                   {activeClass.name}
               </h1>
               <p className="text-[10px] text-white/60 font-serif italic tracking-widest uppercase mt-1">
                   "{activeClass.tagline}"
               </p>
           </div>
           <button onClick={() => setIsCreating(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50">×</button>
       </div>

       {/* --- 2. Scrollable Content Area --- */}
       <div className="flex-1 overflow-y-auto relative z-10 bg-black/40">
           
           {/* Navigation Tabs */}
           <div className="flex sticky top-0 bg-black/90 backdrop-blur-xl border-b border-white/10 z-20">
              {['origin', 'attributes', 'skills'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setMobileTab(tab as any)}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                        mobileTab === tab 
                        ? `${activeClass.color} border-b-2` 
                        : 'text-white/30 hover:text-white'
                    }`}
                    style={{ borderColor: mobileTab === tab ? activeClass.hex : 'transparent' }}
                  >
                      {tab}
                  </button>
              ))}
           </div>

           <div className="p-6 space-y-6">
               
               {/* TAB: ORIGIN */}
               {mobileTab === 'origin' && (
                  <div className="animate-slide-up-fade">
                      <p className="text-white/80 font-serif leading-relaxed text-sm italic border-l-2 pl-4" style={{ borderColor: activeClass.hex }}>
                          {activeClass.lore}
                      </p>
                      
                      <div className="mt-8 bg-black/40 p-4 rounded-xl border border-white/5">
                        <h4 className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2">Complexity</h4>
                        <div className="flex gap-1 mb-1">
                            {[1, 2, 3].map(i => {
                                 const complexityScore = activeClass.complexity === 'Low' ? 1 : activeClass.complexity === 'Medium' ? 2 : 3;
                                 return (
                                    <div key={i} className={`h-2 flex-1 rounded-full ${i <= complexityScore ? activeClass.color.replace('text-', 'bg-') : 'bg-white/10'}`} />
                                 );
                            })}
                        </div>
                        <span className={`text-[10px] uppercase font-black ${activeClass.color}`}>{activeClass.complexity}</span>
                      </div>
                  </div>
               )}

               {/* TAB: ATTRIBUTES */}
               {mobileTab === 'attributes' && (
                   <div className="animate-slide-up-fade">
                        <div className="space-y-2">
                            <StatBar label="Strength" value={activeClass.bonuses.str} colorClass={activeClass.color} />
                            <StatBar label="Dexterity" value={activeClass.bonuses.dex} colorClass={activeClass.color} />
                            <StatBar label="Intelligence" value={activeClass.bonuses.int} colorClass={activeClass.color} />
                            <StatBar label="Constitution" value={activeClass.bonuses.con} colorClass={activeClass.color} />
                        </div>
                        <div className="mt-6 p-4 bg-white/5 rounded-lg">
                            <h4 className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Primary Attribute</h4>
                            <div className={`text-lg font-black ${activeClass.color}`}>{activeClass.primaryAttribute}</div>
                        </div>
                   </div>
               )}

               {/* TAB: SKILLS */}
               {mobileTab === 'skills' && (
                   <div className="animate-slide-up-fade space-y-4">
                       {activeClass.skills.map((skill, idx) => (
                           <div key={idx} className="bg-black/60 border border-white/10 p-4 rounded-xl flex gap-4">
                               <div className="text-2xl pt-1">{skill.icon || '⚔️'}</div>
                               <div>
                                   <div className="flex items-center gap-2 mb-1">
                                       <span className={`text-sm font-bold ${activeClass.color}`}>{skill.name}</span>
                                       <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-white/60 uppercase font-black">{skill.type}</span>
                                   </div>
                                   <p className="text-[11px] text-white/60 leading-snug">{skill.desc}</p>
                               </div>
                           </div>
                       ))}
                   </div>
               )}
           </div>
       </div>

       {/* --- NEW: CORE / IDENTITY PANEL (Fixed) --- */}
       <div className="relative z-20 bg-black/90 border-t border-white/10 p-4 backdrop-blur-md shrink-0">
            <div className="flex flex-col gap-3">
                {/* Name Input Row */}
                <div className="relative">
                     <input 
                        type="text" 
                        value={charName}
                        onChange={(e) => {
                            setCharName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                            setIsNameAvailable(null);
                            setNameError(null);
                        }}
                        maxLength={12}
                        placeholder="Name your legend..."
                        className={`w-full bg-white/5 border ${nameError ? 'border-rose-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white outline-none focus:border-[${activeClass.hex}] transition-all gothic-title text-sm`}
                        style={{ caretColor: activeClass.hex }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold">
                        {nameError ? <span className="text-rose-500">{nameError}</span> : 
                         isNameAvailable ? <span className="text-emerald-500">AVAILABLE</span> :
                         <span className="text-white/30">{charName.length}/12</span>}
                    </div>
                </div>

                {/* Buttons Row */}
                <div className="flex gap-2">
                    <button 
                        onClick={handleCheckName}
                        disabled={isCheckingName || charName.length < 3}
                        className="w-1/3 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 transition-colors"
                    >
                        {isCheckingName ? '...' : 'Check'}
                    </button>
                    <button 
                        onClick={handleCreate}
                        disabled={!isNameAvailable || !charName}
                        className="flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg disabled:opacity-30 transition-all active:scale-95"
                        style={{ 
                            backgroundColor: isNameAvailable ? activeClass.hex : '#262626', 
                            color: isNameAvailable ? '#000' : '#525252'
                        }}
                    >
                        Begin Journey
                    </button>
                </div>
            </div>
       </div>

       {/* --- 3. Bottom Class Selector (Icons) --- */}
       <div className="h-20 bg-black border-t border-white/10 z-20 flex items-center overflow-x-auto px-4 gap-4 no-scrollbar shrink-0">
           {Object.values(CLASS_REGISTRY).map(cls => (
               <button
                 key={cls.type}
                 onClick={() => setSelectedClassType(cls.type)}
                 className={`flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-xl transition-all ${
                     selectedClassType === cls.type 
                     ? 'bg-white/10 border-2 scale-105' 
                     : 'opacity-50 grayscale'
                 }`}
                 style={{ borderColor: selectedClassType === cls.type ? cls.hex : 'transparent' }}
               >
                   <span className="text-2xl drop-shadow-md">{cls.icon}</span>
               </button>
           ))}
       </div>
    </div>
);

const DesktopCreationLayout: React.FC<{
  activeClass: ClassDetail;
  charName: string;
  setCharName: (name: string) => void;
  nameError: string | null;
  setNameError: (err: string | null) => void;
  isNameAvailable: boolean | null;
  setIsNameAvailable: (val: boolean | null) => void;
  isCheckingName: boolean;
  handleCheckName: () => void;
  handleCreate: () => void;
  setIsCreating: (val: boolean) => void;
  setSelectedClassType: (type: ClassType) => void;
  selectedClassType: ClassType;
}> = ({
  activeClass, charName, setCharName, nameError, setNameError, isNameAvailable, setIsNameAvailable,
  isCheckingName, handleCheckName, handleCreate, setIsCreating, setSelectedClassType, selectedClassType
}) => (
    <div className="fixed inset-0 z-[1200] flex bg-black overflow-hidden selection:bg-amber-900/50">
      
      {/* Background Ambience */}
      <div className={`absolute inset-0 transition-colors duration-1000 bg-gradient-to-br ${activeClass.gradient}`} />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p6.png')] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />

      {/* --- LEFT PANEL: CLASS ROSTER --- */}
      <div className="w-80 bg-black/40 border-r border-white/5 backdrop-blur-sm z-10 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h2 className="gothic-title text-white/40 text-xs tracking-[0.3em]">The Soul Roster</h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-1">
          {Object.values(CLASS_REGISTRY).map(cls => (
            <button
              key={cls.type}
              onClick={() => setSelectedClassType(cls.type)}
              className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all duration-200 relative overflow-hidden group ${
                selectedClassType === cls.type 
                ? 'bg-white/10' 
                : 'hover:bg-white/5 opacity-60 hover:opacity-100'
              }`}
            >
              <div className={`text-3xl filter drop-shadow-lg transition-transform duration-300 ${selectedClassType === cls.type ? 'scale-110' : 'group-hover:scale-110'}`}>
                {cls.icon}
              </div>
              <div>
                <div className={`gothic-title font-bold text-sm ${selectedClassType === cls.type ? cls.color : 'text-white'}`}>
                  {cls.name}
                </div>
                <div className="text-[9px] text-white/30 uppercase tracking-wider font-bold">
                  {cls.primaryAttribute}
                </div>
              </div>
              {selectedClassType === cls.type && (
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${cls.color.replace('text-', 'bg-')}`} />
              )}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-white/5">
           <button onClick={() => setIsCreating(false)} className="w-full py-3 text-[10px] text-white/30 hover:text-white uppercase font-black tracking-widest transition-colors">
             Cancel Ritual
           </button>
        </div>
      </div>

      {/* --- CENTER PANEL: PREVIEW STAGE --- */}
      <div className="flex-1 relative flex items-center justify-center p-12 z-0 overflow-hidden">
        
        {/* Dynamic Background Glow */}
        <div 
            key={activeClass.type + 'bg'}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 animate-slow-pulse transition-all duration-1000"
            style={{ backgroundColor: activeClass.hex }}
        />

        {/* Animated Class Preview Container */}
        <div key={activeClass.type} className="relative z-10 flex flex-col items-center animate-slide-up-fade">
            
            {/* Main Icon Representation */}
            <div className="relative mb-8 group">
                <div className="text-[180px] filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-700 hover:scale-105" style={{ textShadow: `0 0 100px ${activeClass.hex}` }}>
                    {activeClass.icon}
                </div>
            </div>

            {/* Title & Tagline */}
            <div className="text-center">
                <h1 className={`gothic-title text-6xl font-black mb-2 tracking-tight ${activeClass.color} drop-shadow-md`}>
                    {activeClass.name}
                </h1>
                <p className="text-sm text-white/60 font-serif italic tracking-widest uppercase mb-6">
                    "{activeClass.tagline}"
                </p>

                {/* Complexity Badge */}
                <div className="inline-flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Complexity</span>
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => {
                             const complexityScore = activeClass.complexity === 'Low' ? 1 : activeClass.complexity === 'Medium' ? 2 : 3;
                             return (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= complexityScore ? activeClass.color.replace('text-', 'bg-') : 'bg-white/10'}`} />
                             );
                        })}
                    </div>
                    <span className={`text-[9px] uppercase font-black ml-1 ${activeClass.color}`}>{activeClass.complexity}</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: DETAILS GRIMOIRE --- */}
      <div className="w-[420px] bg-black/80 border-l border-white/5 backdrop-blur-xl z-20 flex flex-col">
          
          <div className="flex-1 overflow-y-auto scrollbar-hide p-8 space-y-8">
              
              {/* Lore Section */}
              <section>
                  <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 ${activeClass.color} opacity-80`}>Origin</h3>
                  <p className="text-white/70 font-serif leading-relaxed text-[15px] italic border-l-2 border-white/10 pl-4">
                      {activeClass.lore}
                  </p>
              </section>

              {/* Attributes Visualizer */}
              <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-white/30">Base Attributes</h3>
                  <div className="space-y-1">
                      <StatBar label="Strength" value={activeClass.bonuses.str} colorClass={activeClass.color} />
                      <StatBar label="Dexterity" value={activeClass.bonuses.dex} colorClass={activeClass.color} />
                      <StatBar label="Intelligence" value={activeClass.bonuses.int} colorClass={activeClass.color} />
                      <StatBar label="Constitution" value={activeClass.bonuses.con} colorClass={activeClass.color} />
                  </div>
              </section>

              {/* Skills Preview (Desktop) */}
              <section>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-white/30">Core Mastery</h3>
                  <div className="space-y-3">
                      {activeClass.skills.map(skill => (
                          <div key={skill.name} className="bg-white/5 border border-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                              <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-2">
                                     <span className="text-lg">{skill.icon || '⚔️'}</span>
                                     <span className={`text-xs font-bold ${activeClass.color}`}>{skill.name}</span>
                                  </div>
                                  <span className="text-[8px] text-white/30 uppercase font-black">{skill.type}</span>
                              </div>
                              <p className="text-[10px] text-white/50 leading-snug pl-7">{skill.desc}</p>
                          </div>
                      ))}
                  </div>
              </section>

          </div>

          {/* Creation Form */}
          <div className="p-6 bg-black border-t border-white/10">
              <div className="space-y-4">
                  <div>
                      <label className="block text-[9px] text-white/40 uppercase font-black tracking-widest mb-2">Identify Thyself</label>
                      <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={charName}
                            onChange={(e) => {
                                setCharName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                                setIsNameAvailable(null);
                                setNameError(null);
                            }}
                            maxLength={12}
                            placeholder="Name..."
                            className={`flex-1 bg-white/5 border ${nameError ? 'border-rose-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white outline-none focus:border-[${activeClass.hex}] transition-all gothic-title text-sm`}
                            style={{ caretColor: activeClass.hex }}
                        />
                        <button 
                            onClick={handleCheckName}
                            disabled={isCheckingName || charName.length < 3}
                            className="bg-white/5 border border-white/10 px-4 rounded-lg text-white/50 hover:text-white disabled:opacity-30 uppercase text-[10px] font-black tracking-widest transition-colors"
                        >
                            {isCheckingName ? '...' : 'Check'}
                        </button>
                      </div>
                      
                      {/* Validation Msg */}
                      <div className="h-5 mt-1 flex items-center">
                          {nameError && <span className="text-[9px] text-rose-500 font-bold uppercase animate-pulse">{nameError}</span>}
                          {isNameAvailable && <span className="text-[9px] text-emerald-500 font-bold uppercase">Available</span>}
                      </div>
                  </div>

                  <button 
                    onClick={handleCreate}
                    disabled={!isNameAvailable || !charName}
                    className={`w-full py-4 rounded-lg gothic-title font-black text-sm uppercase tracking-[0.2em] shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                    style={{ 
                        backgroundColor: isNameAvailable ? activeClass.hex : '#262626', 
                        color: isNameAvailable ? '#000' : '#525252',
                        boxShadow: isNameAvailable ? `0 0 20px ${activeClass.hex}40` : 'none'
                    }}
                  >
                    {isNameAvailable ? 'Begin Journey' : 'Enter Name'}
                  </button>
              </div>
          </div>
      </div>
    </div>
);

// --- MAIN COMPONENT ---

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, onLogout }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedClassType, setSelectedClassType] = useState<ClassType>(ClassType.BARBARIAN);
  
  // Mobile specific state
  const [mobileTab, setMobileTab] = useState<'origin' | 'attributes' | 'skills'>('origin');

  // Name Validation State
  const [charName, setCharName] = useState('');
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const chars = AuthService.getMyCharacters();
    setCharacters(chars);
    // Auto-enter creation mode if no characters exist for new users
    if (chars.length === 0) {
      setIsCreating(true);
    }
  }, []);

  const activeClass = useMemo(() => CLASS_REGISTRY[selectedClassType], [selectedClassType]);

  const validateName = (name: string): string | null => {
    const regex = /^[a-zA-Z0-9]{3,12}$/;
    if (!regex.test(name)) return "Invalid Name (3-12 Alphanumeric)";
    if (BANNED_WORDS.some(word => name.toLowerCase().includes(word))) return "Name contains restricted words";
    return null;
  };

  const handleCheckName = async () => {
    setNameError(null);
    setIsNameAvailable(null);
    
    const localError = validateName(charName);
    if (localError) {
      setNameError(localError);
      return;
    }

    setIsCheckingName(true);
    const { available } = await AuthService.checkNameAvailability(charName);
    setIsCheckingName(false);
    
    if (available) {
      setIsNameAvailable(true);
    } else {
      setNameError("Name already claimed by another soul");
      setIsNameAvailable(false);
    }
  };

  const handleCreate = () => {
    if (!isNameAvailable || !charName) return;
    const char = AuthService.createCharacter(charName, selectedClassType, activeClass.bonuses);
    if (char) {
      setCharacters(prev => [...prev, char]);
      setIsCreating(false);
      onSelect(char);
    }
  };

  // --- VIEW: EXISTING CHARACTERS LIST (Shared) ---
  if (!isCreating) {
    return (
      <div className="fixed inset-0 z-[1200] bg-slate-950 flex flex-col items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/p6.png')]">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-80 pointer-events-none" />
        
        <h1 className="gothic-title text-amber-500 text-3xl sm:text-5xl font-black mb-12 tracking-widest text-center drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] z-10">
          Your Manifestations
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl z-10 overflow-y-auto max-h-[70vh] p-2">
          {characters.map(char => {
            const registry = CLASS_REGISTRY[char.classType];
            return (
              <div 
                key={char.id}
                onClick={() => onSelect(char)}
                className={`group relative p-8 bg-black/60 border border-white/10 rounded-xl cursor-pointer hover:border-[${registry.hex}] transition-all duration-300 overflow-hidden shrink-0`}
                style={{ borderColor: registry.hex }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ backgroundColor: registry.hex }} />
                
                <div className="flex flex-col items-center">
                  <span className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300 filter drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">{registry.icon}</span>
                  <h3 className="gothic-title text-white text-xl font-bold tracking-wider">{char.name}</h3>
                  <div className={`mt-2 text-[10px] uppercase font-black tracking-[0.2em] ${registry.color}`}>
                    {char.classType} • Lvl {char.level}
                  </div>
                </div>
              </div>
            );
          })}
          
          <div 
            onClick={() => setIsCreating(true)}
            className="group relative p-8 bg-white/5 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all flex flex-col items-center justify-center min-h-[240px]"
          >
             <span className="text-4xl text-white/20 mb-4 group-hover:text-amber-500 transition-colors">+</span>
             <span className="gothic-title text-white/20 text-xs font-black uppercase tracking-widest group-hover:text-white transition-colors">Summon New Soul</span>
          </div>
        </div>
        
        <button onClick={onLogout} className="mt-8 text-white/20 hover:text-rose-500 uppercase text-[10px] font-black tracking-[0.4em] transition-all z-10">
          Sever Connection
        </button>
      </div>
    );
  }

  // --- RENDER ROUTER ---
  return (
      <>
        {isCreating && (
            <>
                <div className="hidden lg:block h-full">
                    <DesktopCreationLayout 
                        activeClass={activeClass}
                        charName={charName}
                        setCharName={setCharName}
                        nameError={nameError}
                        setNameError={setNameError}
                        isNameAvailable={isNameAvailable}
                        setIsNameAvailable={setIsNameAvailable}
                        isCheckingName={isCheckingName}
                        handleCheckName={handleCheckName}
                        handleCreate={handleCreate}
                        setIsCreating={setIsCreating}
                        setSelectedClassType={setSelectedClassType}
                        selectedClassType={selectedClassType}
                    />
                </div>
                <div className="block lg:hidden h-full">
                    <MobileCreationLayout 
                        activeClass={activeClass}
                        mobileTab={mobileTab}
                        setMobileTab={setMobileTab}
                        charName={charName}
                        setCharName={setCharName}
                        nameError={nameError}
                        setNameError={setNameError}
                        isNameAvailable={isNameAvailable}
                        setIsNameAvailable={setIsNameAvailable}
                        isCheckingName={isCheckingName}
                        handleCheckName={handleCheckName}
                        handleCreate={handleCreate}
                        setIsCreating={setIsCreating}
                        setSelectedClassType={setSelectedClassType}
                        selectedClassType={selectedClassType}
                    />
                </div>
            </>
        )}
      </>
  );
};
