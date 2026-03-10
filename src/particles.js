import { ObjectPool } from './pool.js';
import { GROUND_Y, COLORS } from './constants.js';
import { randomRange } from './utils.js';

export class ParticlePool {
  constructor() {
    this._pool = new ObjectPool(
      () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, size: 0, color: COLORS.NEON_BLUE }),
      (p) => { p.x = 0; p.y = 0; p.vx = 0; p.vy = 0; p.life = 0; p.maxLife = 0; p.size = 0; },
      100
    );
  }

  spawnRunDust(playerX, grounded) {
    if (!grounded) return;
    const p = this._pool.acquire();
    p.x = playerX;
    p.y = GROUND_Y;
    p.vx = -randomRange(1, 3);
    p.vy = -randomRange(0, 2);
    p.life = 20;
    p.maxLife = 20;
    p.size = randomRange(1, 4);
    p.color = COLORS.NEON_BLUE;
  }

  spawnJumpBurst(x, y, width) {
    for (let i = 0; i < 10; i++) {
      const p = this._pool.acquire();
      p.x = x + width / 2;
      p.y = GROUND_Y;
      p.vx = randomRange(-4, 4);
      p.vy = randomRange(-5, -1);
      p.life = 25;
      p.maxLife = 25;
      p.size = randomRange(2, 6);
      p.color = COLORS.NEON_BLUE;
    }
  }

  spawnLandBurst(x, y, width) {
    for (let i = 0; i < 6; i++) {
      const p = this._pool.acquire();
      p.x = x + width / 2;
      p.y = GROUND_Y;
      p.vx = randomRange(-3, 3);
      p.vy = randomRange(-3, -0.5);
      p.life = 15;
      p.maxLife = 15;
      p.size = randomRange(1, 4);
      p.color = COLORS.NEON_BLUE;
    }
  }

  spawnDeath(x, y, width, height) {
    for (let i = 0; i < 25; i++) {
      const p = this._pool.acquire();
      p.x = x + width / 2;
      p.y = y + height / 2;
      p.vx = randomRange(-8, 8);
      p.vy = randomRange(-8, 8);
      p.life = 45;
      p.maxLife = 45;
      p.size = randomRange(2, 7);
      p.color = i % 3 === 0 ? '#ff4757' : COLORS.NEON_BLUE;
    }
  }

  spawnCoinCollect(x, y) {
    for (let i = 0; i < 8; i++) {
      const p = this._pool.acquire();
      p.x = x;
      p.y = y;
      p.vx = randomRange(-4, 4);
      p.vy = randomRange(-4, 4);
      p.life = 20;
      p.maxLife = 20;
      p.size = randomRange(1, 4);
      p.color = COLORS.COIN_GOLD;
    }
  }

  update() {
    this._pool.updateAndSweep((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // light gravity on particles
      p.life--;
      return p.life <= 0;
    });
  }

  draw(ctx) {
    for (const p of this._pool.active) {
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  releaseAll() {
    this._pool.releaseAll();
  }
}
