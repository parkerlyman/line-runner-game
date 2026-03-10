export class ObjectPool {
  constructor(factory, reset, initialSize = 20) {
    this._factory = factory;
    this._reset = reset;
    this._available = [];
    this._active = [];
    for (let i = 0; i < initialSize; i++) {
      this._available.push(factory());
    }
  }

  acquire() {
    const obj = this._available.length > 0
      ? this._available.pop()
      : this._factory();
    this._active.push(obj);
    return obj;
  }

  release(obj) {
    const idx = this._active.indexOf(obj);
    if (idx !== -1) {
      this._active.splice(idx, 1);
      this._reset(obj);
      this._available.push(obj);
    }
  }

  updateAndSweep(updateFn) {
    for (let i = this._active.length - 1; i >= 0; i--) {
      const shouldRelease = updateFn(this._active[i]);
      if (shouldRelease) {
        this._reset(this._active[i]);
        this._available.push(this._active[i]);
        this._active.splice(i, 1);
      }
    }
  }

  get active() {
    return this._active;
  }

  releaseAll() {
    while (this._active.length > 0) {
      const obj = this._active.pop();
      this._reset(obj);
      this._available.push(obj);
    }
  }
}
