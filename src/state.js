export const GameState = Object.freeze({
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
});

const VALID_TRANSITIONS = {
  [GameState.MENU]:      [GameState.PLAYING],
  [GameState.PLAYING]:   [GameState.PAUSED, GameState.GAME_OVER],
  [GameState.PAUSED]:    [GameState.PLAYING, GameState.MENU],
  [GameState.GAME_OVER]: [GameState.PLAYING, GameState.MENU],
};

export class GameStateMachine {
  constructor() {
    this._current = GameState.MENU;
    this._enterCallbacks = {};
    this._exitCallbacks = {};
  }

  get current() {
    return this._current;
  }

  transition(newState) {
    if (!VALID_TRANSITIONS[this._current]?.includes(newState)) {
      return false;
    }
    const oldState = this._current;
    (this._exitCallbacks[oldState] || []).forEach(fn => fn(newState));
    this._current = newState;
    (this._enterCallbacks[newState] || []).forEach(fn => fn(oldState));
    return true;
  }

  onEnter(state, callback) {
    (this._enterCallbacks[state] ??= []).push(callback);
  }

  onExit(state, callback) {
    (this._exitCallbacks[state] ??= []).push(callback);
  }
}
