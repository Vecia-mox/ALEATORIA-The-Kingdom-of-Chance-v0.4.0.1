
export class TimeManager {
    public static timeScale: number = 1.0;
    private static timeoutId: any;

    /**
     * Applies a slow-motion effect for a specific duration.
     * @param duration Duration in milliseconds (real time).
     * @param scale Time scale factor (default 0.1).
     */
    public static slowMo(duration: number, scale: number = 0.1) {
        this.timeScale = scale;
        
        if (this.timeoutId) clearTimeout(this.timeoutId);
        
        this.timeoutId = setTimeout(() => {
            // Smooth restoration could be done here, but instant snap is fine for MVP
            this.timeScale = 1.0;
        }, duration);
    }

    public static pause() {
        this.timeScale = 0;
    }

    public static resume() {
        this.timeScale = 1.0;
    }
}
