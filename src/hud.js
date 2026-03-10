import { CANVAS_WIDTH, COLORS } from './constants.js';

export class HUD {
  constructor() {
    this._comboScale = 1;
    this._comboPulseTimer = 0;
  }

  draw(ctx, score, distance, coinCount, combo, gameSpeed) {
    // Score
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${score}`, CANVAS_WIDTH - 20, 32);

    // Distance
    ctx.fillStyle = '#aaa';
    ctx.font = '13px monospace';
    ctx.fillText(`${Math.floor(distance)}m`, CANVAS_WIDTH - 20, 50);

    // Speed
    ctx.fillStyle = '#666';
    ctx.font = '11px monospace';
    ctx.fillText(`Speed: ${gameSpeed.toFixed(1)}`, CANVAS_WIDTH - 20, 66);

    // Coins
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.COIN_GOLD;
    ctx.font = '16px monospace';
    ctx.fillText(`● ${coinCount}`, 20, 32);

    // Combo multiplier
    if (combo.isActive && combo.multiplier > 1) {
      if (combo.justIncreased) {
        this._comboScale = 1.5;
      }
      this._comboScale = Math.max(1, this._comboScale - 0.03);
      this._comboPulseTimer++;

      const pulse = 0.8 + Math.sin(this._comboPulseTimer * 0.15) * 0.2;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.floor(24 * this._comboScale)}px monospace`;
      ctx.fillStyle = COLORS.COIN_GOLD;
      ctx.shadowColor = COLORS.COIN_GOLD;
      ctx.shadowBlur = 10 * pulse;
      ctx.globalAlpha = pulse;
      ctx.fillText(`x${combo.multiplier.toFixed(1)}`, CANVAS_WIDTH / 2, 35);

      if (combo.comboCount > 1) {
        ctx.font = '12px monospace';
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.fillText(`${combo.comboCount} combo!`, CANVAS_WIDTH / 2, 52);
      }
      ctx.restore();
    } else {
      this._comboPulseTimer = 0;
      this._comboScale = 1;
    }

    ctx.textAlign = 'left';
  }
}
