<template>
  <div class="game">
    <!-- ヘッダー -->
    <header class="header">
      <h1 class="title">{{ t.gameTitle }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </header>

    <!-- モードタブ -->
    <div class="mode-tabs">
      <button class="mode-tab" :class="{ active: mode === 'daily' }" @click="emit('change-mode', 'daily')">{{ t.modes.daily }}</button>
      <button class="mode-tab" :class="{ active: mode === 'challenge' }" @click="emit('change-mode', 'challenge')">{{ t.modes.challenge }}</button>
      <button class="mode-tab" :class="{ active: mode === 'custom' }" @click="emit('change-mode', 'custom')">{{ t.modes.custom }}</button>
    </div>

    <!-- チャレンジ連勝 -->
    <div v-if="mode === 'challenge'" class="streak-bar">
      <span>{{ t.streak.current }} <b>{{ streak }}</b></span>
      <span class="streak-sep">|</span>
      <span>{{ t.streak.best }} <b>{{ bestStreak }}</b></span>
    </div>

    <!-- 凡例 -->
    <div class="legend">
      <div class="legend-item">
        <span class="legend-tile correct">ア</span>
        <span>{{ t.legend.correct }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-tile present">イ</span>
        <span>{{ t.legend.present }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-tile absent">ウ</span>
        <span>{{ t.legend.absent }}</span>
      </div>
    </div>

    <!-- エラーメッセージ -->
    <Transition name="fade">
      <div v-if="errorMessage" class="error-toast">
        {{ errorMessage }}
      </div>
    </Transition>

    <!-- ゲームボード -->
    <WordleBoard
      :board="board"
      :current-row-index="guesses.length"
    />

    <!-- ゲーム終了メッセージ -->
    <Transition name="fade">
      <div v-if="gameStatus === 'won' || gameStatus === 'lost'" class="result-banner" :class="gameStatus">
        <template v-if="gameStatus === 'won'">
          <span class="result-icon">🎉</span>
          <strong>{{ t.result.won }}</strong>
          <span>{{ t.result.answerPrefix }} <b>{{ answerDisplay }}</b> {{ t.result.answerSuffixWon }}</span>
        </template>
        <template v-else>
          <span class="result-icon">😢</span>
          <strong>{{ t.result.lost }}</strong>
          <span>{{ t.result.answerPrefix }} <b>{{ answerDisplay }}</b> {{ t.result.answerSuffixLost }}</span>
        </template>
        <div class="result-buttons">
          <a class="tweet-btn" :href="tweetUrl" target="_blank" rel="noopener noreferrer">{{ t.buttons.tweet }}</a>
          <button v-if="mode === 'challenge'" class="retry-btn" @click="resetGame">{{ t.buttons.playAgain }}</button>
          <button v-if="mode === 'custom'" class="retry-btn" @click="emit('retry-custom')">{{ t.buttons.playAgain }}</button>
        </div>
      </div>
    </Transition>

    <!-- キーボード -->
    <WordleKeyboard
      :key-states="keyStates"
      :disabled="gameStatus !== 'playing'"
      @key-press="handleKeyPress"
    />

    <!-- あきらめる確認ポップアップ -->
    <Transition name="fade">
      <div v-if="showGiveupConfirm" class="confirm-overlay" @click.self="showGiveupConfirm = false">
        <div class="confirm-dialog">
          <p class="confirm-msg">{{ t.giveupConfirm }}</p>
          <div class="confirm-buttons">
            <button class="confirm-yes" @click="doForfeit">{{ t.buttons.giveup }}</button>
            <button class="confirm-no" @click="showGiveupConfirm = false">{{ t.buttons.continue }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 操作説明 -->
    <div class="instructions">
      <p>{{ t.instructions.prefix }} | <kbd>ENTER</kbd> {{ t.instructions.enterSuffix }} | <kbd>Backspace</kbd> {{ t.instructions.backspaceSuffix }}</p>
    </div>

    <!-- ？ボタン -->
    <button class="help-btn" @click="showHelp = true">?</button>

    <!-- ヘルプモーダル -->
    <Transition name="fade">
      <div v-if="showHelp" class="help-overlay" @click.self="showHelp = false">
        <div class="help-dialog">
          <h3 class="help-title">{{ t.help.title }}</h3>
          <p class="help-body" v-for="(line, i) in t.help.body.split('\n')" :key="i">{{ line }}​</p>
          <button class="help-close" @click="showHelp = false">{{ t.help.close }}</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import WordleBoard from './WordleBoard.vue'
import WordleKeyboard from './WordleKeyboard.vue'
import { useWordle } from '../composables/useWordle.js'
import { ja } from '../i18n/ja.js'

const t = ja

const subtitle = computed(() => {
  const len = wordLength.value
  if (props.mode === 'daily') return t.subtitle.daily(len, maxGuesses)
  if (props.mode === 'challenge') return t.subtitle.challenge(len, maxGuesses)
  const diffLabel = props.customSettings?.isHard ? t.difficulty.hard : t.difficulty.easy
  return t.subtitle.custom(diffLabel, len, maxGuesses)
})

const props = defineProps({
  mode: { type: String, required: true },
  customSettings: { type: Object, default: null },
})
const emit = defineEmits(['change-mode', 'retry-custom'])

const {
  answerDisplay,
  board,
  guesses,
  gameStatus,
  keyStates,
  errorMessage,
  maxGuesses,
  wordLength,
  streak,
  bestStreak,
  addLetter,
  deleteLetter,
  clearGuess,
  submitGuess,
  resetGame,
  forfeit,
} = useWordle(props.mode, props.customSettings)

const showGiveupConfirm = ref(false)
const showHelp = ref(false)

function doForfeit() {
  showGiveupConfirm.value = false
  forfeit()
}

const tweetUrl = computed(() => {
  const modeLabel = t.tweet.modeLabel(t.modes[props.mode] ?? props.mode)
  const result = gameStatus.value === 'won' ? t.tweet.resultWon : t.tweet.resultLost
  const triesStr = t.tweet.tries(guesses.value.length, maxGuesses)
  const streakPart = props.mode === 'challenge' && gameStatus.value === 'won' ? ` ${t.tweet.streak(streak.value)}` : ''
  const playedRows = guesses.value.map(row => {
    const tiles = row.map(tile => {
      if (tile.state === 'correct') return t.tweet.emoji.correct
      if (tile.state === 'present') return t.tweet.emoji.present
      return t.tweet.emoji.absent
    })
    // 答えの文字数に満たない場合、足りない分を⬜️で埋める
    while (tiles.length < wordLength.value) tiles.push(t.tweet.emoji.unused)
    return tiles.join('')
  })
  const grid = playedRows.join('\n')
  const text = `${t.tweet.hashtag}\n${modeLabel} ${result} (${triesStr}${streakPart})\n${grid}\n${t.tweet.url}`
  return `${t.tweet.urlBase}?text=${encodeURIComponent(text)}`
})

function handleKeyPress(key) {
  if (gameStatus.value !== 'playing') return
  if (key === 'GIVEUP') {
    showGiveupConfirm.value = true
    return
  }
  if (key === 'ENTER') {
    submitGuess()
  } else if (key === 'DEL') {
    deleteLetter()
  } else if (key === 'RESET') {
    clearGuess()
  } else {
    addLetter(key)
  }
}

function handlePhysicalKey(e) {
  if (e.ctrlKey || e.altKey || e.metaKey) return
  if (gameStatus.value !== 'playing') return
  if (e.key === 'Enter') submitGuess()
  else if (e.key === 'Backspace') deleteLetter()
}

onMounted(() => window.addEventListener('keydown', handlePhysicalKey))
onUnmounted(() => window.removeEventListener('keydown', handlePhysicalKey))
</script>

<style scoped>
.game {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: var(--max-width);
  padding: 16px 8px;
  /* モバイル対応: キーボードが隠れないように */
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 12px;
  position: relative;
  width: 100%;
}

.title {
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--c-text);
}

.subtitle {
  font-size: 0.85rem;
  color: var(--c-text-sub);
  margin-top: 4px;
}

.back-btn {
  position: absolute;
  top: 4px;
  left: 0;
  background: none;
  border: 1px solid var(--c-back-btn);
  color: var(--c-text-muted);
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.back-btn:hover {
  color: var(--c-text);
  border-color: var(--c-text-muted);
}

.legend {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  font-size: 0.8rem;
  color: var(--c-kbd-text);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-tile {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  border-radius: 2px;
  color: var(--c-text-light);
}

.legend-tile.correct  { background-color: var(--c-correct); }
.legend-tile.present  { background-color: var(--c-present); }
.legend-tile.absent   { background-color: var(--c-absent); }

.error-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--c-bg);
  color: var(--c-text);
  padding: 12px 24px;
  border-radius: var(--r-sm);
  font-weight: 700;
  font-size: 0.9rem;
  z-index: 100;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.result-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border-radius: 8px;
  margin: 10px 0;
  font-size: 1rem;
  text-align: center;
  color: var(--c-text-light);
}

.result-banner.won  { background-color: var(--c-bg-result-won);  border: 1px solid var(--c-border-result-won); }
.result-banner.lost { background-color: var(--c-bg-result-lost); border: 1px solid var(--c-border-result-lost); }

.result-icon { font-size: 2rem; }

.result-buttons {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.retry-btn, .back-select-btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--r-sm);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.tweet-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background-color: var(--c-btn-tweet);
  color: var(--c-text-light);
  border-radius: var(--r-sm);
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
  transition: opacity 0.2s;
}
.tweet-btn:hover { opacity: 0.85; }
.retry-btn       { background-color: var(--c-correct); color: var(--c-text-light); }
.retry-btn:hover { opacity: 0.85; }
.back-select-btn       { background-color: var(--c-kbd-bg); color: var(--c-kbd-text); }
.back-select-btn:hover { opacity: 0.85; }

.instructions {
  margin-top: 12px;
  font-size: 0.75rem;
  color: var(--c-text-muted);
  text-align: center;
}

kbd {
  background: var(--c-kbd-bg);
  color: var(--c-kbd-text);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to      { opacity: 0; }

.mode-tabs {
  display: flex;
  border-bottom: 2px solid var(--c-border-tab);
  margin-bottom: 12px;
  width: 100%;
}

.mode-tab {
  flex: 1;
  padding: 10px 0;
  background: none;
  border: none;
  color: var(--c-text-sub);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: color 0.15s, border-color 0.15s;
}
.mode-tab:hover { color: var(--c-kbd-text); }
.mode-tab.active {
  color: var(--c-text);
  border-bottom-color: var(--c-text);
}

.streak-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: var(--c-kbd-text);
  margin-bottom: 8px;
}
.streak-sep { color: var(--c-streak-sep); }

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.confirm-dialog {
  background: var(--c-bg-modal);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  min-width: 240px;
}

.confirm-msg {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--c-text-light);
}

.confirm-buttons {
  display: flex;
  gap: 12px;
}

.confirm-yes {
  padding: 10px 20px;
  background-color: var(--c-btn-danger);
  color: var(--c-text-light);
  border: none;
  border-radius: var(--r-sm);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}
.confirm-yes:hover { opacity: 0.85; }

.confirm-no {
  padding: 10px 20px;
  background-color: var(--c-btn-no);
  color: var(--c-btn-no-text);
  border: none;
  border-radius: var(--r-sm);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}
.confirm-no:hover { opacity: 0.85; }

.help-btn {
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--c-border);
  background: var(--c-bg-modal);
  color: var(--c-text-modal);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 150;
  transition: opacity 0.2s;
}
.help-btn:hover { opacity: 0.8; }

.help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 400;
}

.help-dialog {
  background: var(--c-bg-modal);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: 24px 28px;
  width: min(420px, 92vw);
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--c-text-light);
  max-height: 80vh;
  overflow-y: auto;
}

.help-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.help-body {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--c-text-modal);
  white-space: pre-wrap;
  margin: 0;
  min-height: 1em;
}

.help-close {
  margin-top: 8px;
  align-self: flex-end;
  padding: 8px 20px;
  background: var(--c-btn-cancel);
  color: var(--c-text-modal);
  border: none;
  border-radius: var(--r-md);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.help-close:hover { opacity: 0.8; }
</style>
