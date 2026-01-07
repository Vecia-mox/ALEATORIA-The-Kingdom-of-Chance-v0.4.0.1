
export class HapticManager {
    public static vibrate(pattern: number | number[]) {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(pattern);
        }
    }

    public static lightImpact() {
        this.vibrate(10); // Subtle click
    }

    public static mediumImpact() {
        this.vibrate(30); // Standard hit
    }

    public static heavyImpact() {
        this.vibrate([50, 20, 30]); // Kill / Crit
    }

    public static earthquake() {
        this.vibrate([50, 50, 50, 50, 50]); // Boss Slam
    }

    public static success() {
        this.vibrate([20, 50, 20]); // Level Up
    }
}
