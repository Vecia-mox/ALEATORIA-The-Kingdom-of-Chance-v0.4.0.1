
import { Position } from '../types';

export class AdminService {
  static teleportTo(targetId: string) {
    return { type: 'ADMIN_TP', targetId };
  }

  static summon(targetId: string) {
    return { type: 'ADMIN_SUMMON', targetId };
  }

  static kill(targetId: string) {
    return { type: 'ADMIN_KILL', targetId };
  }

  static ban(targetId: string) {
    return { type: 'ADMIN_BAN', targetId };
  }

  static toggleGodMode(enabled: boolean) {
    return { type: 'ADMIN_GOD_MODE', enabled };
  }

  static setWeather(weatherType: string) {
    return { type: 'ADMIN_SET_WEATHER', weatherType };
  }

  static setTime(timeVal: number) {
    return { type: 'ADMIN_SET_TIME', timeVal };
  }

  static spawnMob(mobDefId: string, count: number) {
    return { type: 'ADMIN_SPAWN', mobDefId, count };
  }

  static addItem(baseName: string) {
    return { type: 'ADMIN_ADD_ITEM', baseName };
  }

  static addGold(amount: number) {
    return { type: 'ADMIN_ADD_GOLD', amount };
  }
}
