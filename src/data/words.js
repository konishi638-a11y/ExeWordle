import { validWords, wordSet1, wordSet2, wordSet3, wordSet4, wordSet5, wordSet6 } from './validwords.js'

// 各セット配列（インデックス1始まり）
export const WORD_SETS = [wordSet1, wordSet2, wordSet3, wordSet4, wordSet5, wordSet6]

// 1マスとして扱う特殊トークン
export const SPECIAL_TOKENS = ['V2', 'V3', 'V4', 'V5', 'EX', 'SP', 'DS', 'GS']
const SPECIAL_TOKEN_SET = new Set(SPECIAL_TOKENS)

// 文字列をトークン配列に分解する（特殊トークンは1トークン）
export function tokenize(word) {
  const tokens = []
  let i = 0
  while (i < word.length) {
    let found = false
    for (const token of SPECIAL_TOKENS) {
      if (word.startsWith(token, i)) {
        tokens.push(token)
        i += token.length
        found = true
        break
      }
    }
    if (!found) {
      tokens.push(word[i])
      i++
    }
  }
  return tokens
}

// 特殊トークン or 数字を含む → むずかしい分類
export function hasSpecialOrNumber(tokens) {
  return tokens.some(t => SPECIAL_TOKEN_SET.has(t) || /^\d$/.test(t))
}

// 全単語から長さ別プールを生成（3〜8文字対応）
// _easyByLen[len] = 特殊/数字なしの単語のみ
// _hardByLen[len] = 全単語（easy含む）
const _easyByLen = {}
const _hardByLen = {}
for (const word of validWords) {
  if (!word) continue
  const tokens = tokenize(word)
  const len = tokens.length
  if (len < 3 || len > 8) continue
  ;(_hardByLen[len] = _hardByLen[len] || []).push(word)
  if (!hasSpecialOrNumber(tokens)) {
    ;(_easyByLen[len] = _easyByLen[len] || []).push(word)
  }
}

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 今日のお題: 6/7/8文字かんたん（全セット）から日付ハッシュで1つ
export function getDailyWord() {
  const pool = [
    ...(_easyByLen[6] || []),
    ...(_easyByLen[7] || []),
    ...(_easyByLen[8] || []),
  ]
  if (pool.length === 0) return null
  const seed = getTodayStr()
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return pool[hash % pool.length]
}

// チャレンジ候補プールを返す（デバッグ用）
export function getChallengePool() {
  return [
    ...(_hardByLen[6] || []),
    ...(_hardByLen[7] || []),
    ...(_hardByLen[8] || []),
  ]
}

// チャレンジ: 6/7/8文字むずかしい（全セット）からランダム
export function getRandomChallengeWord() {
  const pool = getChallengePool()
  if (pool.length === 0) return null
  const chosen = pool[Math.floor(Math.random() * pool.length)]
  return chosen
}

// カスタム: 指定セット × 指定長 × 難易度でランダム取得
// isHard=false → かんたん（特殊/数字なし）、isHard=true → むずかしい（全単語）
export function getWordFromSets(selectedSets, wordLength, isHard) {
  const seen = new Set()
  const pool = []
  for (const setIdx of selectedSets) {
    for (const word of WORD_SETS[setIdx - 1] ?? []) {
      if (!word || seen.has(word)) continue
      const tokens = tokenize(word)
      if (tokens.length !== wordLength) continue
      if (!isHard && hasSpecialOrNumber(tokens)) continue
      pool.push(word)
      seen.add(word)
    }
  }
  if (pool.length === 0) return null
  const chosen = pool[Math.floor(Math.random() * pool.length)]
  return chosen
}

// カスタムモーダル用: 各セットの対象単語数を返す
// isHard=true → 全単語、isHard=false → かんたん単語のみ
export function getSetWordCounts(wordLength, isHard) {
  return WORD_SETS.map(set =>
    set.filter(w => {
      if (!w) return false
      const tokens = tokenize(w)
      if (tokens.length !== wordLength) return false
      if (!isHard && hasSpecialOrNumber(tokens)) return false
      return true
    }).length
  )
}

export function isValidWord(tokenArray, wordLength) {
  if (tokenArray.length === 0 || tokenArray.length > wordLength) return false
  const word = tokenArray.join('')
  return validWords.includes(word)
}
