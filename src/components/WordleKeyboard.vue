<template>
  <div class="keyboard" :class="{ 'keyboard-disabled': disabled }">
    <!-- 清音セクション (10列) -->
    <div class="keyboard-section">
      <div v-for="(row, i) in seionRows" :key="'s'+i" class="keyboard-row">
        <template v-for="key in row" :key="key ?? ('null'+i)">
          <div v-if="key === null" class="key-spacer" />
          <button v-else class="key" :class="keyStates[key] || ''" @click="handleKey(key)">{{ key }}</button>
        </template>
      </div>
    </div>

    <!-- 濁音セクション (8列) + コントロール列 (2列) -->
    <div class="dakuon-wrapper">
      <div class="dakuon-rows">
        <div v-for="(row, i) in dakuonRows" :key="'d'+i" class="keyboard-row">
          <template v-for="(key, j) in row" :key="key ?? ('null2'+i+j)">
            <div v-if="key === null" class="key-spacer" />
            <button v-else class="key" :class="[keyStates[key] || '', symbolKeys.has(key) ? 'key-symbol' : '']" @click="handleKey(key)">{{ key }}</button>
          </template>
        </div>
      </div>
      <div class="ctrl-col">
        <button class="key ctrl-reset" @click="handleKey('RESET')">{{ t.keyboard.reset }}</button>
        <button class="key ctrl-del" @click="handleKey('DEL')">{{ t.keyboard.del }}</button>
        <button class="key ctrl-enter" @click="handleKey('ENTER')">{{ t.keyboard.enter }}</button>
        <button class="key ctrl-giveup" @click="handleKey('GIVEUP')">{{ t.keyboard.giveup }}</button>
      </div>
    </div>

    <!-- 特殊トークンセクション -->
    <div class="keyboard-section">
      <!-- 数字・記号行: 1 2 3 + 0 4 5 8 9 Z -->
      <div class="keyboard-row">
        <button
          v-for="token in specialRow1"
          :key="token"
          class="key key-special key-symbol"
          :class="keyStates[token] || ''"
          @click="handleKey(token)"
        >{{ token }}</button>
      </div>
      <!-- スペシャルトークン行: V2 V3 V4 V5 EX SP DS Σ Ω GS -->
      <div class="keyboard-row">
        <button
          v-for="token in specialRow2"
          :key="token"
          class="key key-special"
          :class="keyStates[token] || ''"
          @click="handleKey(token)"
        >
          <template v-if="token.length > 1">
            <span class="token-top">{{ token.slice(0, 1) }}</span>
            <span class="token-bot">{{ token.slice(1) }}</span>
          </template>
          <template v-else>{{ token }}</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ja } from '../i18n/ja.js'
const t = ja

// 清音: ア行〜ワ行を段(ア〜オ)ごとに 10列
const seionRows = [
  ['ア', 'カ', 'サ', 'タ', 'ナ', 'ハ', 'マ', 'ヤ', 'ラ', 'ワ'],
  ['イ', 'キ', 'シ', 'チ', 'ニ', 'ヒ', 'ミ', null,  'リ', null],
  ['ウ', 'ク', 'ス', 'ツ', 'ヌ', 'フ', 'ム', 'ユ', 'ル', 'ン'],
  ['エ', 'ケ', 'セ', 'テ', 'ネ', 'ヘ', 'メ', null,  'レ', null],
  ['オ', 'コ', 'ソ', 'ト', 'ノ', 'ホ', 'モ', 'ヨ', 'ロ', 'ー'],
]

// 濁音・半濁音・小文字: 8列
// ャュョ は清音のヤユヨと同じ段 (ア段・ウ段・オ段) に揃える
// ヴ削除, DEL/ENTERは右のctrl-colへ
const dakuonRows = [
  ['ァ', 'ガ', 'ザ', 'ダ', null, 'バ', 'パ', 'ャ'], // ア段
  ['ィ', 'ギ', 'ジ', 'ヂ', null, 'ビ', 'ピ', null], // イ段
  ['ゥ', 'グ', 'ズ', 'ヅ', 'ッ', 'ブ', 'プ', 'ュ'], // ウ段
  ['ェ', 'ゲ', 'ゼ', 'デ', 'N',  'ベ', 'ペ', null], // エ段
  ['ォ', 'ゴ', 'ゾ', 'ド', 'O',  'ボ', 'ポ', 'ョ'], // オ段
]

// 特殊トークン行1: 数字・記号・アルファ
const specialRow1 = ['+', '0', '1', '2', '3', '4', '5', '8', '9', 'Z']
// 特殊トークン行2: スペシャルトークン（複数文字のもの・ギリシャ2文字）
const specialRow2 = ['V2', 'V3', 'V4', 'V5', 'EX', 'SP', 'DS', 'GS', 'Σ', 'Ω']

// 記号色（青）を適用するキーのセット（dakuon内に混在するものも含む）
const symbolKeys = new Set(['+', '0', '1', '2', '3', '4', '5', '8', '9', 'Z', 'N', 'O'])

const props = defineProps({
  keyStates: {
    type: Object,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['key-press'])

function handleKey(key) {
  if (props.disabled) return
  emit('key-press', key)
}
</script>

<style scoped>
.keyboard {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 4px;
}

.keyboard-disabled {
  opacity: 0.45;
  pointer-events: none;
}

.keyboard-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 4px;
}

/* 濁音8列 + コントロール2列 を横並び */
.dakuon-wrapper {
  display: flex;
  justify-content: center;
  gap: 4px;
  align-items: flex-start;
}

.dakuon-rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ctrl-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

/* 基底スタイル（先に定義してctrl-*が上書きできるように） */
.key {
  width: var(--key-size);
  height: var(--key-size);
  padding: 0;
  border: none;
  border-radius: var(--r-sm);
  background-color: var(--c-key);
  color: var(--c-text-light);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.key:hover { opacity: 0.85; }
.key:active { transform: scale(0.93); }

.key-spacer {
  width: var(--key-size);
  height: var(--key-size);
  flex-shrink: 0;
}

/* コントロールキー: リセット(2×1) → DEL(2×1) → ENTER(2×3) */
/* 合計: 44+4+44+4+140 = 236px = 濁音5行の高さ(5×44+4×4) */
.ctrl-reset {
  width: 92px;
  height: var(--key-size);
  font-size: 0.65rem;
  font-weight: 700;
  background-color: var(--c-key-ctrl);
}

.ctrl-del {
  width: 92px;
  height: var(--key-size);
  font-size: 1.2rem;
  font-weight: 700;
  background-color: var(--c-key-ctrl);
}

.ctrl-enter {
  width: 92px;
  height: 92px; /* 44×2 + 4×1 = 92 */
  font-size: 0.9rem;
  font-weight: 700;
  background-color: var(--c-key-ctrl);
}

.ctrl-giveup {
  width: 92px;
  height: var(--key-size);
  font-size: 0.6rem;
  font-weight: 700;
  background-color: var(--c-btn-danger);
}

.key-special {
  flex-direction: column;
  gap: 1px;
  background-color: var(--c-key-special);
}

.key-symbol {
  background-color: var(--c-key-special);
}

.token-top {
  font-size: 0.85rem;
  line-height: 1;
  font-weight: 700;
}

.token-bot {
  font-size: 0.75rem;
  line-height: 1;
  font-weight: 700;
}

.key.correct { background-color: var(--c-correct); }
.key.present { background-color: var(--c-present); }
.key.absent  { background-color: var(--c-absent); }
</style>


