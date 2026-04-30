<template>
  <div class="board">
    <div
      v-for="(row, rowIndex) in board"
      :key="rowIndex"
      class="row"
    >
      <div
        v-for="(tile, colIndex) in row"
        :key="colIndex"
        class="tile"
        :class="[tile.state, { 'pop': tile.letter && isCurrentRow(rowIndex), 'tile-special': tile.letter.length > 1 }]"
        :data-letter="tile.letter"
      >
        <template v-if="tile.letter.length > 1">
          <span class="tile-token-top">{{ tile.letter.slice(0, 1) }}</span>
          <span class="tile-token-bot">{{ tile.letter.slice(1) }}</span>
        </template>
        <template v-else>{{ tile.letter }}</template>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  board: {
    type: Array,
    required: true,
  },
  currentRowIndex: {
    type: Number,
    required: true,
  },
})

function isCurrentRow(rowIndex) {
  return rowIndex === props.currentRowIndex
}
</script>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  padding: calc(10px * var(--scale));
}

.row {
  display: flex;
  gap: var(--gap);
}

.tile {
  width: var(--tile-size);
  height: var(--tile-size);
  border: 2px solid var(--c-border-tile);
  background-color: var(--c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(1.2rem * var(--scale));
  font-weight: 700;
  color: #1a1a1b;
  transition: transform 0.1s;
  user-select: none;
}

.tile-special {
  flex-direction: column;
  gap: 1px;
}

.tile-token-top {
  font-size: calc(0.85rem * var(--scale));
  line-height: 1;
  font-weight: 700;
}

.tile-token-bot {
  font-size: calc(0.75rem * var(--scale));
  line-height: 1;
  font-weight: 700;
}

.tile.tbd {
  border-color: #878a8c;
  animation: none;
}

.tile.correct {
  background-color: var(--c-correct);
  border-color: var(--c-correct);
  color: var(--c-text-light);
  animation: flipIn 0.5s ease forwards;
}

.tile.present {
  background-color: var(--c-present);
  border-color: var(--c-present);
  color: var(--c-text-light);
  animation: flipIn 0.5s ease forwards;
}

.tile.absent {
  background-color: var(--c-absent);
  border-color: var(--c-absent);
  color: var(--c-text-light);
  animation: flipIn 0.5s ease forwards;
}

.tile.empty {
  border-color: var(--c-border-tile);
}

.tile.pop {
  animation: pop 0.1s ease;
}

@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.12); }
  100% { transform: scale(1); }
}

@keyframes flipIn {
  0% { transform: rotateX(0deg); }
  50% { transform: rotateX(-90deg); }
  100% { transform: rotateX(0deg); }
}
</style>
