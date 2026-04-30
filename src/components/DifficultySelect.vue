<template>
  <div class="difficulty-screen">
    <h1 class="title">Wordle</h1>
    <p class="desc">難易度を選んでください</p>
    <div class="buttons">
      <button
        v-for="d in difficulties"
        :key="d.key"
        class="diff-btn"
        :class="d.key"
        @click="$emit('select', d.key)"
      >
        {{ d.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { DIFFICULTIES } from '../data/words.js'

const difficulties = DIFFICULTIES

defineEmits(['select'])
</script>

<style scoped>
.difficulty-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 24px;
  padding: 24px;
}

.title {
  font-size: 2.8rem;
  font-weight: 900;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: #121213;
}

.desc {
  font-size: 1rem;
  color: #555;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 320px;
}

.diff-btn {
  padding: 18px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  color: white;
}

.diff-btn:hover { opacity: 0.85; }
.diff-btn:active { transform: scale(0.97); }

.easy7 { background-color: #538d4e; }
.hard7 { background-color: #b59f3b; }
.easy8 { background-color: #3a7abd; }
.hard8 { background-color: #9c3d3d; }
</style>
