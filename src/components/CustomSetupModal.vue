<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <h2 class="modal-title">{{ t.modal.title }}</h2>

      <!-- 文字数 -->
      <div class="section">
        <div class="section-label">{{ t.modal.wordLength }}</div>
        <div class="len-grid">
          <button
            v-for="n in [3,4,5,6,7,8]"
            :key="n"
            class="len-btn"
            :class="{ active: wordLength === n }"
            @click="wordLength = n"
          >{{ n }}</button>
        </div>
      </div>

      <!-- 難易度 -->
      <div class="section">
        <div class="section-label">{{ t.modal.difficulty }}</div>
        <div class="diff-row">
          <button class="diff-btn" :class="{ active: !isHard }" @click="isHard = false">{{ t.difficulty.easy }}</button>
          <button class="diff-btn" :class="{ active: isHard }" @click="isHard = true">{{ t.difficulty.hard }}</button>
        </div>
      </div>

      <!-- 単語セット選択 -->
      <div class="section">
        <div class="section-label">{{ t.modal.wordSets }}</div>
        <label class="check-row all-row">
          <input type="checkbox" :checked="allSelected" @change="onToggleAll" />
          <span class="check-label">{{ t.modal.selectAll }}</span>
        </label>
        <div class="set-grid">
          <label v-for="i in 6" :key="i" class="check-row">
            <input type="checkbox" :value="i" v-model="selectedSets" />
            <span class="check-label">{{ t.modal.setLabel(i) }}</span>
            <span class="count-badge">{{ wordCounts[i - 1] }}{{ t.modal.wordUnit }}</span>
          </label>
        </div>
        <p v-if="selectedSets.length === 0" class="warn">{{ t.modal.warnNoSet }}</p>
        <p v-else-if="totalCount === 0" class="warn">{{ t.modal.warnNoWords }}</p>
      </div>

      <!-- 最大回答回数 -->
      <div class="section">
        <div class="section-label">{{ t.modal.maxGuesses }}</div>
        <div class="tries-row">
          <input
            type="number"
            v-model.number="maxGuesses"
            min="1"
            max="99"
            class="tries-input"
            @input="clampGuesses"
          />
          <span class="tries-unit">{{ t.modal.triesUnit }}</span>
        </div>
      </div>

      <!-- ボタン -->
      <div class="modal-buttons">
        <button class="btn-cancel" @click="$emit('cancel')">{{ t.buttons.cancel }}</button>
        <button
          class="btn-start"
          :disabled="selectedSets.length === 0 || totalCount === 0"
          @click="onStart"
        >{{ t.buttons.start }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getSetWordCounts } from '../data/words.js'
import { ja } from '../i18n/ja.js'

const t = ja

const props = defineProps({
  initialSettings: { type: Object, default: null },
})
const emit = defineEmits(['start', 'cancel'])

// 初期値: 前回設定があれば引き継ぐ、なければデフォルト
const wordLength = ref(props.initialSettings?.wordLength ?? 7)
const isHard = ref(props.initialSettings?.isHard ?? false)
const selectedSets = ref(props.initialSettings?.selectedSets ? [...props.initialSettings.selectedSets] : [1, 2, 3, 4, 5, 6])
const maxGuesses = ref(props.initialSettings?.maxGuesses ?? 10)

const wordCounts = computed(() => getSetWordCounts(wordLength.value, isHard.value))

// 文字数か難易度が変わったら語数を再計算してセットを再確認
watch([wordLength, isHard], () => {
  // 語数が0になったセットを選択から外す（任意）
})

const allSelected = computed(() => selectedSets.value.length === 6)

function onToggleAll(e) {
  selectedSets.value = e.target.checked ? [1, 2, 3, 4, 5, 6] : []
}

function clampGuesses() {
  if (maxGuesses.value < 1) maxGuesses.value = 1
  if (maxGuesses.value > 99) maxGuesses.value = 99
}

const totalCount = computed(() =>
  selectedSets.value.reduce((sum, i) => sum + (wordCounts.value[i - 1] ?? 0), 0)
)

function onStart() {
  if (selectedSets.value.length === 0 || totalCount.value === 0) return
  const mg = Math.max(1, Math.min(99, Math.floor(maxGuesses.value) || 10))
  emit('start', {
    selectedSets: [...selectedSets.value].sort((a, b) => a - b),
    wordLength: wordLength.value,
    isHard: isHard.value,
    maxGuesses: mg,
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.modal-card {
  background: var(--c-bg-modal);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: 24px 28px;
  width: min(420px, 94vw);
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: var(--c-text-light);
  max-height: 92vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 1px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 0.8rem;
  color: var(--c-text-modal-dim);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 文字数ボタン */
.len-grid {
  display: flex;
  gap: 6px;
}

.len-btn {
  flex: 1;
  padding: 8px 0;
  background: var(--c-bg-dark);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  color: var(--c-text-modal);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.len-btn.active {
  background: var(--c-correct);
  border-color: var(--c-correct);
  color: var(--c-text-light);
}

/* 難易度ボタン */
.diff-row {
  display: flex;
  gap: 8px;
}

.diff-btn {
  flex: 1;
  padding: 9px 0;
  background: var(--c-bg-dark);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  color: var(--c-text-modal);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.diff-btn.active {
  background: var(--c-present);
  border-color: var(--c-present);
  color: var(--c-text-light);
}

/* セット選択 */
.all-row {
  border-bottom: 1px solid var(--c-border);
  padding-bottom: 8px;
}

.set-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 16px;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.95rem;
}

.check-row input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: var(--c-correct);
  cursor: pointer;
}

.check-label {
  flex: 1;
}

.count-badge {
  font-size: 0.75rem;
  color: var(--c-text-sub);
  background: var(--c-bg-dark);
  padding: 1px 6px;
  border-radius: 10px;
}

.warn {
  font-size: 0.8rem;
  color: var(--c-warn);
  margin-top: 2px;
}

/* 回数入力 */
.tries-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tries-input {
  width: 70px;
  padding: 8px 10px;
  background: var(--c-bg-dark);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  color: var(--c-text-light);
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
}

.tries-input:focus {
  outline: none;
  border-color: var(--c-correct);
}

.tries-unit {
  font-size: 0.95rem;
  color: var(--c-text-modal);
}

.modal-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel, .btn-start {
  padding: 10px 22px;
  border: none;
  border-radius: var(--r-md);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-cancel {
  background: var(--c-btn-cancel);
  color: var(--c-text-modal);
}

.btn-cancel:hover {
  opacity: 0.8;
}

.btn-start {
  background: var(--c-correct);
  color: var(--c-text-light);
}

.btn-start:hover:not(:disabled) {
  opacity: 0.85;
}

.btn-start:disabled {
  background: var(--c-btn-cancel);
  color: #666;
  cursor: not-allowed;
}
</style>