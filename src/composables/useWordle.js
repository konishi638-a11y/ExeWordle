import { ref, computed, watch } from 'vue'
import { getDailyWord, getRandomChallengeWord, getChallengePool, getWordFromSets, isValidWord, tokenize } from '../data/words.js'
import { ja } from '../i18n/ja.js'

export const MAX_GUESSES = 10

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}
function saveJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}
function removeKey(key) {
  try { localStorage.removeItem(key) } catch {}
}
function loadSession(key) {
  try { return JSON.parse(sessionStorage.getItem(key)) } catch { return null }
}
function saveSession(key, val) {
  try { sessionStorage.setItem(key, JSON.stringify(val)) } catch {}
}
function removeSession(key) {
  try { sessionStorage.removeItem(key) } catch {}
}

// mode: 'daily' | 'challenge' | 'custom'
// customSettings: { selectedSets, wordLength, isHard, maxGuesses } | null
export function useWordle(mode, customSettings = null) {
  const effectiveMaxGuesses = (mode === 'custom' && customSettings?.maxGuesses)
    ? customSettings.maxGuesses
    : MAX_GUESSES

  const gameKey = mode === 'daily'
    ? `wordle_daily_${getTodayStr()}`
    : mode === 'challenge'
    ? `wordle_challenge`
    : customSettings?.gameId != null
    ? `wordle_custom_${customSettings.gameId}` // sessionStorage
    : null
  const isCustomSession = mode === 'custom' && gameKey !== null
  const streakKey = `wordle_streak_challenge`

  const dailyWord = mode === 'daily' ? getDailyWord() : null
  const saved = gameKey
    ? (isCustomSession ? loadSession(gameKey) : loadJSON(gameKey))
    : null
  const shouldRestore = saved && (
    mode === 'challenge' ||
    (mode === 'daily' && dailyWord && saved.answer === tokenize(dailyWord).join('')) ||
    (isCustomSession) // custom: gameId が一致すれば復元
  )

  const initialWord = shouldRestore
    ? saved.answer
    : mode === 'custom'
      ? getWordFromSets(
          customSettings?.selectedSets ?? [],
          customSettings?.wordLength ?? 7,
          customSettings?.isHard ?? false,
        )
      : (mode === 'daily' ? dailyWord : getRandomChallengeWord())

  const answer = ref(initialWord ? tokenize(initialWord) : [])

  // wordLength はリアクティブ（resetGame で答えが変わる場合も追従）
  const wordLength = computed(() => {
    if (answer.value.length > 0) return answer.value.length
    if (mode === 'custom' && customSettings?.wordLength) return customSettings.wordLength
    return 7
  })

  const guesses = ref(shouldRestore ? saved.guesses : [])
  const currentGuess = ref([])
  const gameStatus = ref(initialWord ? (shouldRestore ? saved.gameStatus : 'playing') : 'no_words')
  const errorMessage = ref(initialWord ? '' : ja.errors.emptyPool)

  const savedStreak = loadJSON(streakKey) ?? { streak: 0, best: 0 }
  const streak = ref(savedStreak.streak)
  const bestStreak = ref(savedStreak.best)

  const answerDisplay = computed(() => answer.value.join(''))

  const keyStates = computed(() => {
    const states = {}
    for (const guess of guesses.value) {
      for (const tile of guess) {
        const current = states[tile.letter]
        if (tile.state === 'correct') {
          states[tile.letter] = 'correct'
        } else if (tile.state === 'present' && current !== 'correct') {
          states[tile.letter] = 'present'
        } else if (tile.state === 'absent' && !current) {
          states[tile.letter] = 'absent'
        }
      }
    }
    return states
  })

  const board = computed(() => {
    const wl = wordLength.value
    const rows = []
    for (const guess of guesses.value) {
      const row = [...guess]
      while (row.length < wl) row.push({ letter: '', state: 'empty' })
      rows.push(row)
    }
    if (gameStatus.value === 'playing') {
      const currentRow = []
      for (let i = 0; i < wl; i++) {
        currentRow.push({ letter: currentGuess.value[i] || '', state: 'tbd' })
      }
      rows.push(currentRow)
    }
    while (rows.length < effectiveMaxGuesses) {
      rows.push(Array(wl).fill({ letter: '', state: 'empty' }))
    }
    return rows
  })

  function addLetter(token) {
    if (gameStatus.value !== 'playing') return
    if (currentGuess.value.length >= wordLength.value) return
    currentGuess.value = [...currentGuess.value, token]
    errorMessage.value = ''
  }

  function deleteLetter() {
    if (gameStatus.value !== 'playing') return
    currentGuess.value = currentGuess.value.slice(0, -1)
    errorMessage.value = ''
  }

  function clearGuess() {
    if (gameStatus.value !== 'playing') return
    currentGuess.value = []
    errorMessage.value = ''
  }

  function submitGuess() {
    if (gameStatus.value !== 'playing') return
    if (currentGuess.value.length === 0) {
      showError(ja.errors.noInput)
      return
    }
    if (!isValidWord(currentGuess.value, wordLength.value)) {
      showError(ja.errors.invalidWord)
      return
    }
    const result = evaluateGuess(currentGuess.value, answer.value)
    guesses.value.push(result)
    currentGuess.value = []
    if (result.every(tile => tile.state === 'correct') && result.length === answer.value.length) {
      gameStatus.value = 'won'
      if (mode === 'challenge') {
        streak.value++
        if (streak.value > bestStreak.value) bestStreak.value = streak.value
        saveJSON(streakKey, { streak: streak.value, best: bestStreak.value })
      }
    } else if (guesses.value.length >= effectiveMaxGuesses) {
      gameStatus.value = 'lost'
      if (mode === 'challenge') {
        streak.value = 0
        saveJSON(streakKey, { streak: 0, best: bestStreak.value })
      }
    }
  }

  function evaluateGuess(guessTokens, answerTokens) {
    const guessLen = guessTokens.length
    const result = Array(guessLen).fill(null).map((_, i) => ({
      letter: guessTokens[i],
      state: 'absent',
    }))
    const answerCopy = [...answerTokens]
    const guessCopy = [...guessTokens]
    for (let i = 0; i < guessLen; i++) {
      if (guessCopy[i] === answerCopy[i]) {
        result[i].state = 'correct'
        answerCopy[i] = null
        guessCopy[i] = null
      }
    }
    for (let i = 0; i < guessLen; i++) {
      if (guessCopy[i] === null) continue
      const idx = answerCopy.indexOf(guessCopy[i])
      if (idx !== -1) {
        result[i].state = 'present'
        answerCopy[idx] = null
      }
    }
    return result
  }

  function showError(msg) {
    errorMessage.value = msg
    setTimeout(() => { errorMessage.value = '' }, 2000)
  }

  watch([guesses, gameStatus], () => {
    if (!gameKey) return
    const data = {
      answer: answer.value.join(''),
      guesses: guesses.value,
      gameStatus: gameStatus.value,
    }
    if (isCustomSession) saveSession(gameKey, data)
    else saveJSON(gameKey, data)
  }, { deep: true })

  function resetGame() {
    if (mode === 'daily') return
    if (gameKey) {
      if (isCustomSession) removeSession(gameKey)
      else removeKey(gameKey)
    }
    const newWord = mode === 'custom'
      ? getWordFromSets(
          customSettings?.selectedSets ?? [],
          customSettings?.wordLength ?? 7,
          customSettings?.isHard ?? false,
        )
      : getRandomChallengeWord()
    if (!newWord) return
    answer.value = tokenize(newWord)
    guesses.value = []
    currentGuess.value = []
    gameStatus.value = 'playing'
    errorMessage.value = ''
  }

  function forfeit() {
    if (gameStatus.value !== 'playing') return
    currentGuess.value = []
    gameStatus.value = 'lost'
    if (mode === 'challenge') {
      streak.value = 0
      saveJSON(streakKey, { streak: 0, best: bestStreak.value })
    }
  }

  return {
    answer,
    answerDisplay,
    wordLength,
    maxGuesses: effectiveMaxGuesses,
    board,
    guesses,
    currentGuess,
    gameStatus,
    keyStates,
    errorMessage,
    streak,
    bestStreak,
    addLetter,
    deleteLetter,
    clearGuess,
    submitGuess,
    resetGame,
    forfeit,
  }
}