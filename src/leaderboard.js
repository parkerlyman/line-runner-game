export class Leaderboard {
  constructor() {
    this._key = 'lineRunnerLeaderboard';
    this._entries = [];
    this._load();
  }

  _load() {
    try {
      this._entries = JSON.parse(localStorage.getItem(this._key)) || [];
    } catch {
      this._entries = [];
    }
    // Migrate old single best score if present
    const oldBest = parseInt(localStorage.getItem('lineRunnerBest'));
    if (oldBest && (this._entries.length === 0 || oldBest > this._entries[0].score)) {
      this._entries.push({ score: oldBest, distance: 0, coins: 0, date: 'Legacy' });
      this._entries.sort((a, b) => b.score - a.score);
      this._entries = this._entries.slice(0, 10);
      this._save();
      localStorage.removeItem('lineRunnerBest');
    }
  }

  _save() {
    localStorage.setItem(this._key, JSON.stringify(this._entries));
  }

  addScore(score, distance, coins) {
    const isNewBest = this._entries.length === 0 || score > this._entries[0].score;
    this._entries.push({
      score,
      distance: Math.floor(distance),
      coins,
      date: new Date().toLocaleDateString(),
    });
    this._entries.sort((a, b) => b.score - a.score);
    this._entries = this._entries.slice(0, 10);
    this._save();
    return isNewBest;
  }

  getTop10() {
    return [...this._entries];
  }

  getBest() {
    return this._entries[0]?.score || 0;
  }

  reset() {
    this._entries = [];
    localStorage.removeItem(this._key);
    localStorage.removeItem('lineRunnerBest');
    this._save();
  }
}
