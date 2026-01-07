
import { AudioManager } from './AudioManager';

/**
 * TITAN ENGINE: AUDIO UNLOCK
 * Handles the "First Interaction" requirement for modern browsers.
 */
export class AudioUnlock {
  
  public static async awaitInteraction(): Promise<void> {
    const manager = AudioManager.getInstance();
    
    if (manager.ctx.state === 'running') {
      console.log("[AudioUnlock] Context already running.");
      return;
    }

    return new Promise((resolve) => {
      const unlock = async () => {
        console.log("[AudioUnlock] User gesture detected. Resuming AudioContext...");
        
        // 1. Resume Context
        await manager.ctx.resume();
        
        // 2. Play Feedback Tone (Oscillator)
        // Synthesize a "Schwing" sound to confirm audio is working
        this.playFeedbackTone(manager.ctx);

        // 3. Cleanup
        document.removeEventListener('click', unlock);
        document.removeEventListener('touchstart', unlock);
        document.removeEventListener('keydown', unlock);

        resolve();
      };

      document.addEventListener('click', unlock, { once: true });
      document.addEventListener('touchstart', unlock, { once: true });
      document.addEventListener('keydown', unlock, { once: true });
    });
  }

  private static playFeedbackTone(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // Slide up
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); // Fade out
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }
}
