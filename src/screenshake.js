export class ScreenShake {
  constructor() {
    this._intensity = 0;
    this._duration = 0;
    this._timer = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  trigger(intensity = 8, duration = 20) {
    this._intensity = intensity;
    this._duration = duration;
    this._timer = duration;
  }

  update() {
    if (this._timer > 0) {
      const decay = this._timer / this._duration;
      this.offsetX = (Math.random() - 0.5) * this._intensity * decay;
      this.offsetY = (Math.random() - 0.5) * this._intensity * decay;
      this._timer--;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }
}
