export function aabbCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function circleRectCollision(circle, rect) {
  const cx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const cy = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  const dx = circle.x - cx;
  const dy = circle.y - cy;
  return (dx * dx + dy * dy) < (circle.radius * circle.radius);
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}
