
import { JWT } from '../utils/JWT';
import { Character, ClassType, Alignment, Stats } from '../types';
import { ItemFactory } from './ItemFactory';
import { StatsSystem } from './StatsSystem';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'Player' | 'Admin';
  authType?: 'local' | 'google';
  name?: string;
}

export class AuthService {
  private static STORAGE_KEY = 'aleatoria_users';
  private static SESSION_KEY = 'aleatoria_token';
  private static CHAR_KEY = 'aleatoria_characters';

  public static toBase64(str: string): string {
    try {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => 
        String.fromCharCode(parseInt(p1, 16))
      ));
    } catch (e) {
      console.error("Encoding error:", e);
      return btoa("error");
    }
  }

  public static fromBase64(str: string): string {
    try {
      return decodeURIComponent(Array.prototype.map.call(atob(str), (c: string) => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
    } catch (e) {
      console.error("Decoding error:", e);
      return "";
    }
  }

  private static generateId(): string {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private static getUsers(): User[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      let users: User[] = stored ? JSON.parse(stored) : [];

      // Seed Default Admin
      const adminEmail = 'sevenarmed@gmail.com';
      if (!users.some(u => u.email === adminEmail)) {
        const adminUser: User = {
          id: this.generateId(),
          email: adminEmail,
          passwordHash: this.toBase64('rahimologus'),
          role: 'Admin',
          authType: 'local'
        };
        users.push(adminUser);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
      }

      return users;
    } catch (e) {
      return [];
    }
  }

  private static saveUsers(users: User[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  private static getCharacters(): Character[] {
    try {
      const stored = localStorage.getItem(this.CHAR_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  private static saveCharacters(chars: Character[]) {
    localStorage.setItem(this.CHAR_KEY, JSON.stringify(chars));
  }

  static async register(email: string, password: string): Promise<{ success: boolean; message: string }> {
    // Simulate delay
    await new Promise(r => setTimeout(r, 800));

    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, message: "This soul is already bound to the Vellum." };
    }

    const role = users.length === 0 ? 'Admin' : 'Player';
    const newUser: User = {
      id: this.generateId(),
      email,
      passwordHash: this.toBase64(password), 
      role,
      authType: 'local'
    };

    users.push(newUser);
    this.saveUsers(users);
    return { success: true, message: `Your name has been inscribed as ${role}.` };
  }

  static async login(email: string, password: string): Promise<{ success: boolean; token?: string; message: string }> {
    // Simulate delay
    await new Promise(r => setTimeout(r, 800));

    const users = this.getUsers();
    const hash = this.toBase64(password);
    const user = users.find(u => u.email === email && u.passwordHash === hash);

    if (!user) {
      return { success: false, message: "Invalid credentials. The abyss rejects you." };
    }

    const token = JWT.sign({ id: user.id, email: user.email, role: user.role });
    localStorage.setItem(this.SESSION_KEY, token);

    return { success: true, token, message: "Welcome back, traveler." };
  }

  static async checkEmailAvailability(email: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 300)); 
    const users = this.getUsers();
    return !users.some(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static async checkNameAvailability(name: string): Promise<{ available: boolean }> {
    await new Promise(r => setTimeout(r, 600));
    const chars = this.getCharacters();
    const taken = chars.some(c => c.name.toLowerCase() === name.toLowerCase());
    return { available: !taken };
  }

  static getCurrentUser(): any | null {
    const token = localStorage.getItem(this.SESSION_KEY);
    if (!token) return null;
    return JWT.verify(token);
  }

  static logout() {
    localStorage.removeItem(this.SESSION_KEY);
  }

  static getAllUsers(): User[] {
    return this.getUsers();
  }

  static updateUserRole(userId: string, role: 'Player' | 'Admin'): boolean {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return false;
    users[index].role = role;
    this.saveUsers(users);
    return true;
  }

  static getMyCharacters(): Character[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    return this.getCharacters().filter(c => c.userId === user.id);
  }

  static createCharacter(name: string, classType: ClassType, fixedStats: Omit<Stats, 'ac'>): Character | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    const starterGear = ItemFactory.getStarterGear(classType);
    const baseStats = { ...fixedStats, ac: 0 }; 

    const tempChar: any = {
        baseStats,
        equipment: starterGear,
        level: 1,
        classType
    };

    const effectiveStats = StatsSystem.recalculate(tempChar);
    
    const finalHp = StatsSystem.calculateMaxHp(1, effectiveStats.vitality, classType);
    const finalMp = StatsSystem.calculateMaxMp(1, effectiveStats.intelligence, effectiveStats.willpower);

    const newChar: Character = {
      id: this.generateId(),
      userId: user.id,
      name: name.trim(),
      classType,
      level: 1,
      exp: 0,
      maxExp: 1000,
      unspentPoints: 0,
      skillPoints: 1, // Start with 1 skill point
      skillRanks: {},
      skillLoadout: { 1: '', 2: '', 3: '', 4: '' },
      baseStats: baseStats,
      stats: effectiveStats,
      alignment: Alignment.NEUTRAL,
      pos: { x: 1024, y: 1024 }, 
      hp: finalHp,
      maxHp: finalHp,
      mp: finalMp,
      maxMp: finalMp,
      potionCharges: 4, 
      maxPotionCharges: 4,
      activeBuffs: {},
      karma: 0,
      gold: 150,
      inventory: [],
      equipment: starterGear,
      isFrozen: false,
      frozenDuration: 0
    };

    const chars = this.getCharacters();
    chars.push(newChar);
    this.saveCharacters(chars);
    return newChar;
  }
}