import { GameState } from './state.js';

export class UIManager {
  constructor(stateMachine, leaderboard, audio) {
    this._sm = stateMachine;
    this._leaderboard = leaderboard;
    this._audio = audio;

    // Screens
    this._startScreen = document.getElementById('start-screen');
    this._gameOverScreen = document.getElementById('game-over-screen');
    this._pauseScreen = document.getElementById('pause-screen');
    this._settingsScreen = document.getElementById('settings-screen');
    this._tutorialScreen = document.getElementById('tutorial-screen');

    // Game over elements
    this._finalScore = document.getElementById('final-score');
    this._finalDistance = document.getElementById('final-distance');
    this._finalCoins = document.getElementById('final-coins');
    this._newBest = document.getElementById('new-best');
    this._leaderboardList = document.getElementById('leaderboard-list');

    // Settings
    this._soundToggle = document.getElementById('sound-toggle');

    // Callbacks set from main.js
    this._onStart = null;

    this._bindButtons();
    this._bindSettings();
    this._setupStateCallbacks();
  }

  set onStart(fn) { this._onStart = fn; }

  _bindButtons() {
    document.getElementById('start-btn').addEventListener('click', () => {
      this._checkTutorial();
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
      this._sm.transition(GameState.PLAYING);
    });

    document.getElementById('menu-btn').addEventListener('click', () => {
      this._sm.transition(GameState.MENU);
    });

    document.getElementById('resume-btn').addEventListener('click', () => {
      this._sm.transition(GameState.PLAYING);
    });

    document.getElementById('quit-btn').addEventListener('click', () => {
      this._sm.transition(GameState.MENU);
    });

    document.getElementById('settings-btn').addEventListener('click', () => {
      this._hideAll();
      this._settingsScreen.classList.remove('hidden');
    });

    document.getElementById('settings-back-btn').addEventListener('click', () => {
      this._settingsScreen.classList.add('hidden');
      this._startScreen.classList.remove('hidden');
    });

    document.getElementById('tutorial-ok-btn').addEventListener('click', () => {
      localStorage.setItem('lineRunnerTutorialSeen', 'true');
      this._tutorialScreen.classList.add('hidden');
      this._sm.transition(GameState.PLAYING);
    });
  }

  _bindSettings() {
    this._soundToggle.checked = this._audio.enabled;
    this._soundToggle.addEventListener('change', () => {
      this._audio.setEnabled(this._soundToggle.checked);
    });

    document.getElementById('reset-scores-btn').addEventListener('click', () => {
      if (confirm('Reset all high scores? This cannot be undone.')) {
        this._leaderboard.reset();
      }
    });
  }

  _setupStateCallbacks() {
    this._sm.onEnter(GameState.MENU, () => {
      this._hideAll();
      this._startScreen.classList.remove('hidden');
    });

    this._sm.onEnter(GameState.PLAYING, () => {
      this._hideAll();
      if (this._onStart) this._onStart();
    });

    this._sm.onEnter(GameState.PAUSED, () => {
      this._hideAll();
      this._pauseScreen.classList.remove('hidden');
    });

    this._sm.onEnter(GameState.GAME_OVER, () => {
      // Game over screen is shown after a delay (from main.js)
    });
  }

  _checkTutorial() {
    if (!localStorage.getItem('lineRunnerTutorialSeen')) {
      this._hideAll();
      this._tutorialScreen.classList.remove('hidden');
    } else {
      this._sm.transition(GameState.PLAYING);
    }
  }

  showGameOver(score, distance, coins, isNewBest) {
    this._finalScore.textContent = score;
    this._finalDistance.textContent = Math.floor(distance);
    this._finalCoins.textContent = coins;

    // New best
    if (isNewBest && score > 0) {
      this._newBest.classList.remove('hidden');
    } else {
      this._newBest.classList.add('hidden');
    }

    // Leaderboard
    this._renderLeaderboard();

    setTimeout(() => {
      this._hideAll();
      this._gameOverScreen.classList.remove('hidden');
    }, 600);
  }

  _renderLeaderboard() {
    const entries = this._leaderboard.getTop10();
    this._leaderboardList.innerHTML = '';
    entries.forEach((entry, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="lb-rank">#${i + 1}</span> <span class="lb-score">${entry.score}</span> <span class="lb-detail">${entry.distance}m</span>`;
      this._leaderboardList.appendChild(li);
    });
  }

  _hideAll() {
    this._startScreen.classList.add('hidden');
    this._gameOverScreen.classList.add('hidden');
    this._pauseScreen.classList.add('hidden');
    this._settingsScreen.classList.add('hidden');
    this._tutorialScreen.classList.add('hidden');
  }
}
