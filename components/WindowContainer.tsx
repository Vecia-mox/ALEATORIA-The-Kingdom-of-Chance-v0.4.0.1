
import React, { useEffect } from 'react';

interface WindowContainerProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * WindowContainer 2.0
 * - Z-Index 6000: Sits above Virtual Joystick (Z 5000).
 * - Input Blocking: Full screen invisible backdrop consumes all pointer events.
 * - ScrollContainer: Native CSS overflow with iOS momentum scrolling.
 */
export const WindowContainer: React.FC<WindowContainerProps> = ({ title, onClose, children }) => {
  
  // Prevent clicks from propagating to the game world
  const handleBackdropClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    // Optional: Close on backdrop click
    // onClose(); 
  };

  return (
    <div 
      className="fixed inset-0 z-[6000] flex items-center justify-center p-2 sm:p-6 animate-slide-up-fade"
      onMouseDown={handleBackdropClick}
      onTouchStart={handleBackdropClick}
    >
      {/* 1. INPUT BLOCKER: Darkened Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto" />

      {/* 2. WINDOW FRAME */}
      <div 
        className="relative w-full max-w-4xl bg-[#1c1917] border-double border-4 border-[#b45309] shadow-[0_0_50px_rgba(0,0,0,1)] flex flex-col rounded-lg overflow-hidden h-[85vh] md:h-auto md:max-h-[85vh] pointer-events-auto"
        onClick={(e) => e.stopPropagation()} // Don't close when clicking inside
      >
        
        {/* Header */}
        <div className="p-4 border-b border-[#44403c] flex justify-between items-center bg-[#0c0a09] shrink-0 z-10">
            <h2 className="gothic-title text-amber-500 text-lg md:text-xl tracking-widest font-black flex items-center gap-2">
                <span>❖</span> {title}
            </h2>
            <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white bg-white/5 hover:bg-red-900/50 rounded-full transition-all text-xl font-bold"
            >
                ×
            </button>
        </div>
        
        {/* 3. SCROLL CONTAINER */}
        <div 
            className="flex-1 overflow-y-auto p-0 relative bg-[#1a1a1a] scrollbar-hide overscroll-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            {children}
        </div>
      </div>
    </div>
  );
};
