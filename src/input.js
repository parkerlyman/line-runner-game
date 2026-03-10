export class InputManager {
  constructor(canvas) {
    this._callbacks = {};
    this._duckHeld = false;

    document.addEventListener('keydown', (e) => this._onKeyDown(e));
    document.addEventListener('keyup', (e) => this._onKeyUp(e));
    canvas.addEventListener('click', () => this._fire('jump'));
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._touchStartY = e.touches[0].clientY;
      this._fire('jump');
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const dy = e.touches[0].clientY - this._touchStartY;
      if (dy > 30 && !this._duckHeld) {
        this._duckHeld = true;
        this._fire('duckStart');
      }
    });
    canvas.addEventListener('touchend', () => {
      if (this._duckHeld) {
        this._duckHeld = false;
        this._fire('duckEnd');
      }
    });
  }

  on(event, callback) {
    (this._callbacks[event] ??= []).push(callback);
  }

  _fire(event) {
    (this._callbacks[event] || []).forEach(fn => fn());
  }

  _onKeyDown(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      this._fire('jump');
    }
    if (e.code === 'ArrowDown' && !this._duckHeld) {
      e.preventDefault();
      this._duckHeld = true;
      this._fire('duckStart');
    }
    if (e.code === 'Escape') {
      this._fire('pause');
    }
  }

  _onKeyUp(e) {
    if (e.code === 'ArrowDown' && this._duckHeld) {
      this._duckHeld = false;
      this._fire('duckEnd');
    }
  }
}
