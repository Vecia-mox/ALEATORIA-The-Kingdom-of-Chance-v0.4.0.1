
/**
 * TITAN ENGINE: VOICE INPUT
 * Speech Recognition wrapper for spellcasting and commands.
 */

// Define global types for Web Speech API (often missing in standard TS lib)
interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

export class VoiceInput {
  private recognition: any;
  private isListening: boolean = false;
  private keywords: Map<string, () => void> = new Map();
  
  public onResult: ((text: string) => void) | null = null;

  constructor() {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true; // Keep listening
      this.recognition.interimResults = false; // Only final results
      this.recognition.lang = 'en-US';
      
      this.recognition.onresult = (event: any) => this.handleResult(event);
      this.recognition.onend = () => this.handleEnd();
      this.recognition.onerror = (e: any) => console.error('[Voice] Error:', e.error);
    } else {
      console.warn('[Voice] Web Speech API not supported in this browser.');
    }
  }

  public registerKeyword(keyword: string, callback: () => void) {
    this.keywords.set(keyword.toLowerCase(), callback);
  }

  public startListening() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        console.log('[Voice] Listening started...');
      } catch (e) {
        console.error('[Voice] Start failed:', e);
      }
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      console.log('[Voice] Listening stopped.');
    }
  }

  private handleResult(event: any) {
    const results = event.results;
    // Get the latest result
    const latest = results[results.length - 1];
    if (latest.isFinal) {
      const transcript = latest[0].transcript.trim().toLowerCase();
      console.log(`[Voice] Heard: "${transcript}"`);
      
      if (this.onResult) this.onResult(transcript);
      this.processKeywords(transcript);
    }
  }

  private processKeywords(text: string) {
    // Check if the spoken text contains any keywords
    // Simple inclusion check. "I cast Fireball" triggers "fireball"
    this.keywords.forEach((callback, keyword) => {
      if (text.includes(keyword)) {
        console.log(`[Voice] Keyword matched: ${keyword}`);
        callback();
      }
    });
  }

  private handleEnd() {
    // Auto-restart if we want continuous listening (unless manually stopped)
    if (this.isListening) {
      try {
        this.recognition.start();
      } catch (e) {
        // Ignore "already started" errors
      }
    }
  }
}
