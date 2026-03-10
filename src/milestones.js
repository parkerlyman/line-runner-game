import { MILESTONE_INTERVAL, MILESTONE_SPEED_BUMP, MILESTONE_FLASH_FRAMES } from './constants.js';

export class MilestoneSystem {
  constructor() {
    this._lastMilestone = 0;
    this._flashTimer = 0;
    this._currentMilestone = 0;
  }

  get isFlashing() { return this._flashTimer > 0; }
  get currentMilestone() { return this._currentMilestone; }

  update(distance) {
    const milestone = Math.floor(distance / MILESTONE_INTERVAL);
    let speedBump = 0;

    if (milestone > this._lastMilestone) {
      this._lastMilestone = milestone;
      this._currentMilestone = milestone * MILESTONE_INTERVAL;
      this._flashTimer = MILESTONE_FLASH_FRAMES;
      speedBump = MILESTONE_SPEED_BUMP;
    }

    if (this._flashTimer > 0) {
      this._flashTimer--;
    }

    return speedBump;
  }

  drawFlash(ctx, canvasWidth, canvasHeight) {
    if (this._flashTimer <= 0) return;
    const alpha = this._flashTimer / MILESTONE_FLASH_FRAMES;

    // White flash overlay
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.25})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Milestone text
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 20 * alpha;
    ctx.fillText(`${this._currentMilestone}m`, canvasWidth / 2, canvasHeight / 2 - 10);
    ctx.font = '16px monospace';
    ctx.fillText('SPEED UP!', canvasWidth / 2, canvasHeight / 2 + 20);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
  }

  reset() {
    this._lastMilestone = 0;
    this._flashTimer = 0;
    this._currentMilestone = 0;
  }
}
