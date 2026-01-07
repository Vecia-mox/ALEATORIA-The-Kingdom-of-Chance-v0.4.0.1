
import { WorldState, TimeState, WeatherType } from '../types';
import { DAY_LENGTH_TICKS } from '../constants';

/**
 * GameLoop handles the atomic updates for each server tick.
 */
export class GameLoop {
  private static REGEN_TICK_THRESHOLD = 30; // Every 3 seconds (30 * 100ms)
  private static WEATHER_CYCLE_TICKS = 600; // Change weather every minute roughly

  static update(state: WorldState): WorldState {
    const newState = { ...state };
    newState.tickCount++;

    // 1. Progress Day/Night Cycle
    this.updateWorldTime(newState);

    // 2. Process Periodic Regeneration
    if (newState.tickCount % this.REGEN_TICK_THRESHOLD === 0) {
      this.processRegeneration(newState);
    }

    // 3. Update Weather
    if (newState.tickCount % this.WEATHER_CYCLE_TICKS === 0) {
      this.cycleWeather(newState);
    }

    return newState;
  }

  private static updateWorldTime(state: WorldState) {
    state.gameTime = (state.gameTime + 1) % DAY_LENGTH_TICKS;
    
    const dayThreshold = DAY_LENGTH_TICKS * 0.5;
    const dawnThreshold = DAY_LENGTH_TICKS * 0.05;
    const duskThreshold = DAY_LENGTH_TICKS * 0.45;

    if (state.gameTime < dawnThreshold || state.gameTime > duskThreshold + (DAY_LENGTH_TICKS * 0.1)) {
        state.timeState = TimeState.NIGHT;
    } else {
        state.timeState = TimeState.DAY;
    }
  }

  private static cycleWeather(state: WorldState) {
    const types = [WeatherType.CLEAR, WeatherType.RAIN, WeatherType.ASH];
    const currentIndex = types.indexOf(state.weather);
    state.weather = types[(currentIndex + 1) % types.length];
  }

  private static processRegeneration(state: WorldState) {
    // Only Regenerate Players - Mob regen is intentionally excluded.
    Object.values(state.players).forEach(player => {
      // Check if alive before regen
      if (player.hp > 0 && player.hp < player.maxHp) {
        const regenAmount = Math.ceil(player.maxHp * 0.02);
        player.hp = Math.min(player.maxHp, player.hp + regenAmount);
      }
    });
  }
}
