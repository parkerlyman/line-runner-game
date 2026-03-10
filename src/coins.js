import { ObjectPool } from './pool.js';
import { CANVAS_WIDTH, GROUND_Y, COIN_RADIUS, COIN_SPAWN_INTERVAL, COIN_HEIGHTS, COLORS } from './constants.js';
import { circleRectCollision } from './utils.js';

export class CoinManager {
  constructor() {
    this._pool = new ObjectPool(
      () => ({ x: 0, y: 0, radius: COIN_RADIUS, collected: false, bobPhase: 0 }),
      (c) => { c.x = 0; c.y = 0; c.collected = false; c.bobPhase = 0; },
      10
    );
    this._spawnTimer = 0;
  }

  update(gameSpeed, playerHitbox) {
    this._spawnTimer++;
    if (this._spawnTimer >= COIN_SPAWN_INTERVAL) {
      this._spawnTimer = 0;
      this._spawn();
    }

    let collected = 0;
    const collectedPositions = [];

    this._pool.updateAndSweep((coin) => {
      coin.x -= gameSpeed;
      coin.bobPhase += 0.05;

      if (!coin.collected) {
        const bobY = coin.y + Math.sin(coin.bobPhase) * 4;
        if (circleRectCollision({ x: coin.x, y: bobY, radius: coin.radius }, playerHitbox)) {
          coin.collected = true;
          collected++;
          collectedPositions.push({ x: coin.x, y: bobY });
        }
      }

      return coin.x < -20 || coin.collected;
    });

    return { collected, positions: collectedPositions };
  }

  _spawn() {
    const y = COIN_HEIGHTS[Math.floor(Math.random() * COIN_HEIGHTS.length)];
    const coin = this._pool.acquire();
    coin.x = CANVAS_WIDTH + 20;
    coin.y = y;
    coin.bobPhase = Math.random() * Math.PI * 2;
    coin.collected = false;
  }

  draw(ctx) {
    for (const coin of this._pool.active) {
      if (coin.collected) continue;
      const bobY = coin.y + Math.sin(coin.bobPhase) * 4;

      // Gold circle with glow
      ctx.shadowColor = COLORS.COIN_GOLD;
      ctx.shadowBlur = 8;
      ctx.fillStyle = COLORS.COIN_GOLD;
      ctx.beginPath();
      ctx.arc(coin.x, bobY, coin.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight
      ctx.fillStyle = COLORS.COIN_HIGHLIGHT;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(coin.x - 2, bobY - 2, coin.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    }
  }

  releaseAll() {
    this._pool.releaseAll();
    this._spawnTimer = 0;
  }
}
