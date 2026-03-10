import { COMBO_NEAR_DISTANCE, COMBO_WINDOW_MS, COMBO_MAX_MULTIPLIER, COMBO_DISPLAY_FRAMES } from './constants.js';

export class ComboSystem {
  constructor() {
    this._multiplier = 1;
    this._comboCount = 0;
    this._lastDodgeTime = 0;
    this._displayTimer = 0;
    this._justIncreased = false;
  }

  get multiplier() { return this._multiplier; }
  get comboCount() { return this._comboCount; }
  get isActive() { return this._displayTimer > 0; }
  get justIncreased() {
    const v = this._justIncreased;
    this._justIncreased = false;
    return v;
  }

  registerDodge(nearMissDistance, currentTime) {
    if (nearMissDistance > COMBO_NEAR_DISTANCE) {
      return;
    }

    // Close dodge
    if (currentTime - this._lastDodgeTime < COMBO_WINDOW_MS) {
      this._comboCount++;
    } else {
      this._comboCount = 1;
    }

    this._lastDodgeTime = currentTime;
    const newMult = Math.min(1 + this._comboCount * 0.5, COMBO_MAX_MULTIPLIER);
    if (newMult > this._multiplier) {
      this._justIncreased = true;
    }
    this._multiplier = newMult;
    this._displayTimer = COMBO_DISPLAY_FRAMES;
  }

  update() {
    if (this._displayTimer > 0) {
      this._displayTimer--;
      if (this._displayTimer <= 0) {
        this._comboCount = 0;
        this._multiplier = 1;
      }
    }
  }

  reset() {
    this._multiplier = 1;
    this._comboCount = 0;
    this._lastDodgeTime = 0;
    this._displayTimer = 0;
    this._justIncreased = false;
  }
}
