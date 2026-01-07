
import { LoginPage } from '../../ui/pages/LoginPage';
import { CharSelectPage } from '../../ui/pages/CharSelectPage';
import { SelectionController } from '../../ui/controllers/SelectionController';

export enum GameState {
  LOGIN,
  CHAR_SELECT,
  WORLD
}

export class GameRouter {
  private static root: HTMLElement;
  private static currentState: GameState;
  
  // Instance references
  private static loginPage: LoginPage;
  private static charSelectPage: CharSelectPage;

  public static init(rootElement: HTMLElement) {
    console.log("[GameRouter] Initializing...");
    this.root = rootElement;
    
    // Clear Root
    this.root.innerHTML = '';
    Object.assign(this.root.style, {
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: '0',
        left: '0',
        backgroundColor: '#000'
    });

    // Start at Login
    this.goToLogin();
  }

  public static goToLogin() {
    this.switchState(GameState.LOGIN);
    this.root.innerHTML = '';
    
    this.loginPage = new LoginPage(this.root, () => {
        this.goToCharSelect();
    });
    this.loginPage.render();
  }

  public static goToCharSelect() {
    this.switchState(GameState.CHAR_SELECT);
    this.root.innerHTML = '';

    this.charSelectPage = new CharSelectPage(this.root, () => {
        this.enterWorld();
    });
    this.charSelectPage.render();
  }

  public static enterWorld() {
    this.switchState(GameState.WORLD);
    // Delegate to SelectionController to handle the transition animation and engine boot
    SelectionController.beginJourney(this.root);
  }

  private static switchState(newState: GameState) {
    this.currentState = newState;
    console.log(`%c[GameRouter] State Change: ${GameState[newState]}`, "color: #fbbf24; font-weight: bold;");
  }
}
