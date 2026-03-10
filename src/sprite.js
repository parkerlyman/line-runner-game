const C = '#00d4ff';     // body cyan
const D = '#0a0a1e';     // dark (eye, details)
const L = '#0099b8';     // darker cyan (shadow)
const W = '#ffffff';     // white highlight

export class SpriteSheet {
  constructor() {
    this._animations = {};
    this._defineAnimations();
  }

  _defineAnimations() {
    this._animations.run = {
      frameDuration: 6,
      frames: [
        // Frame 0: right leg forward
        [
          { x: 0, y: 0, w: 30, h: 26, color: C },
          { x: 0, y: 2, w: 30, h: 22, color: C },
          { x: 18, y: 6, w: 8, h: 8, color: D },
          { x: 20, y: 7, w: 3, h: 3, color: W },
          { x: 4, y: 26, w: 8, h: 14, color: L },
          { x: 18, y: 26, w: 8, h: 10, color: C },
        ],
        // Frame 1: neutral
        [
          { x: 0, y: 0, w: 30, h: 26, color: C },
          { x: 18, y: 6, w: 8, h: 8, color: D },
          { x: 20, y: 7, w: 3, h: 3, color: W },
          { x: 6, y: 26, w: 8, h: 14, color: C },
          { x: 16, y: 26, w: 8, h: 14, color: L },
        ],
        // Frame 2: left leg forward
        [
          { x: 0, y: 0, w: 30, h: 26, color: C },
          { x: 18, y: 6, w: 8, h: 8, color: D },
          { x: 20, y: 7, w: 3, h: 3, color: W },
          { x: 4, y: 26, w: 8, h: 10, color: C },
          { x: 18, y: 26, w: 8, h: 14, color: L },
        ],
        // Frame 3: neutral (copy of 1)
        [
          { x: 0, y: 0, w: 30, h: 26, color: C },
          { x: 18, y: 6, w: 8, h: 8, color: D },
          { x: 20, y: 7, w: 3, h: 3, color: W },
          { x: 6, y: 26, w: 8, h: 14, color: L },
          { x: 16, y: 26, w: 8, h: 14, color: C },
        ],
      ],
    };

    this._animations.jump = {
      frameDuration: 999,
      frames: [
        [
          { x: 0, y: 4, w: 30, h: 22, color: C },
          { x: 18, y: 8, w: 8, h: 8, color: D },
          { x: 20, y: 9, w: 3, h: 3, color: W },
          { x: 2, y: 26, w: 12, h: 8, color: C },
          { x: 16, y: 26, w: 12, h: 8, color: L },
        ],
      ],
    };

    this._animations.duck = {
      frameDuration: 999,
      frames: [
        [
          { x: 0, y: 0, w: 40, h: 16, color: C },
          { x: 28, y: 3, w: 8, h: 8, color: D },
          { x: 30, y: 4, w: 3, h: 3, color: W },
          { x: 0, y: 14, w: 10, h: 6, color: L },
          { x: 30, y: 14, w: 10, h: 6, color: L },
        ],
      ],
    };

    this._animations.death = {
      frameDuration: 999,
      frames: [
        [
          { x: 2, y: 2, w: 12, h: 12, color: C },
          { x: 16, y: 0, w: 14, h: 10, color: C },
          { x: 0, y: 18, w: 10, h: 14, color: L },
          { x: 14, y: 16, w: 16, h: 12, color: C },
          { x: 17, y: 3, w: 8, h: 6, color: '#ff4757' },
        ],
      ],
    };
  }

  drawFrame(ctx, animName, frameIndex, x, y) {
    const anim = this._animations[animName];
    if (!anim) return;
    const frame = anim.frames[frameIndex % anim.frames.length];
    for (const rect of frame) {
      ctx.fillStyle = rect.color;
      ctx.fillRect(x + rect.x, y + rect.y, rect.w, rect.h);
    }
  }

  getFrameCount(animName) {
    return this._animations[animName]?.frames.length || 1;
  }

  getFrameDuration(animName) {
    return this._animations[animName]?.frameDuration || 8;
  }
}
