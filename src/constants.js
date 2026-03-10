// --- Canvas ---
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 400;
export const GROUND_Y = 340;

// --- Player ---
export const PLAYER_X = 120;
export const PLAYER_WIDTH = 30;
export const PLAYER_HEIGHT = 40;
export const DUCK_WIDTH = 40;
export const DUCK_HEIGHT = 20;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -13;
export const DOUBLE_JUMP_FORCE = -11;
export const FAST_FALL_ACCEL = 2;

// --- Speed ---
export const BASE_SPEED = 5;
export const SPEED_INCREMENT = 0.002;
export const TRAIL_SPEED_THRESHOLD = 8;

// --- Combo ---
export const COMBO_NEAR_DISTANCE = 30;
export const COMBO_WINDOW_MS = 600;
export const COMBO_MAX_MULTIPLIER = 8;
export const COMBO_DISPLAY_FRAMES = 90;

// --- Milestones ---
export const MILESTONE_INTERVAL = 500;
export const MILESTONE_SPEED_BUMP = 0.8;
export const MILESTONE_FLASH_FRAMES = 40;

// --- Coins ---
export const COIN_SCORE = 50;
export const COIN_RADIUS = 8;
export const COIN_SPAWN_INTERVAL = 180;
export const COIN_HEIGHTS = [
  GROUND_Y - 20,   // ground level
  GROUND_Y - 60,   // low jump
  GROUND_Y - 100,  // mid jump
  GROUND_Y - 130,  // double jump required
];

// --- Obstacles ---
export const OBSTACLE_TIERS = [
  { minDistance: 0,    color: '#ff4757', glowColor: '#ff6b81' },    // red
  { minDistance: 500,  color: '#ffa502', glowColor: '#ffbe44' },    // orange
  { minDistance: 1500, color: '#a855f7', glowColor: '#c084fc' },    // purple
  { minDistance: 3000, color: '#ffffff', glowColor: '#e0e0e0' },    // white
];

// --- Audio ---
export const BASE_BPM = 120;
export const MAX_BPM = 200;
export const MASTER_VOLUME = 0.3;

// --- Colors ---
export const COLORS = {
  NEON_BLUE: '#00d4ff',
  NEON_BLUE_DIM: '#00b8d4',
  BG_DARK: '#0a0a1e',
  WHITE: '#ffffff',
  COIN_GOLD: '#ffd700',
  COIN_HIGHLIGHT: '#fff8dc',
};
