<template>
  <!-- GameScreen は常に表示（モーダルがある場合はその下に薄く見える） -->
  <GameScreen
    :key="`${selectedMode}_${customGameKey}`"
    :mode="selectedMode"
    :custom-settings="selectedMode === 'custom' ? customSettings : null"
    @change-mode="onChangeMode"
    @retry-custom="onRetryCustom"
  />
  <!-- カスタムモーダル: 設定がまだない場合のみオーバーレイ表示 -->
  <CustomSetupModal
    v-if="selectedMode === 'custom' && !customSettings"
    :initial-settings="lastCustomSettings"
    @start="onCustomStart"
    @cancel="onCustomCancel"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import GameScreen from './components/GameScreen.vue'
import CustomSetupModal from './components/CustomSetupModal.vue'

const MODE_KEY = 'wordle_mode'

const selectedMode = ref(localStorage.getItem(MODE_KEY) || 'daily')

// カスタムモード設定 (null = モーダル表示)
function _loadCustomSettings() {
  try { return JSON.parse(sessionStorage.getItem('_wordle_cs')) } catch { return null }
}
function _saveCustomSettings(val) {
  if (val) sessionStorage.setItem('_wordle_cs', JSON.stringify(val))
  else sessionStorage.removeItem('_wordle_cs')
}

const customSettings = ref(_loadCustomSettings())
const lastCustomSettings = ref(customSettings.value ? { ...customSettings.value } : null)
// sessionStorage に永続化してページリロード後もゲームIDが衝突しないようにする
const customGameKey = ref(parseInt(sessionStorage.getItem('_wordle_cgk') || '0'))

function _bumpKey() {
  customGameKey.value++
  sessionStorage.setItem('_wordle_cgk', String(customGameKey.value))
}

function onChangeMode(newMode) {
  selectedMode.value = newMode
  // カスタムに切り替える際、設定済みならモーダルは出さない（customSettings維持）
}

function onCustomStart(settings) {
  lastCustomSettings.value = { ...settings }
  _bumpKey()
  customSettings.value = { ...settings, gameId: customGameKey.value }
  _saveCustomSettings(customSettings.value)
}

function onCustomCancel() {
  // キャンセルしたら今日のお題に戻る
  selectedMode.value = 'daily'
  customSettings.value = null
  _saveCustomSettings(null)
}

function onRetryCustom() {
  // もう一度: GameScreenをリマウントしてからモーダルを再表示
  _bumpKey()
  customSettings.value = null
  _saveCustomSettings(null)
}

watch(selectedMode, (val) => {
  localStorage.setItem(MODE_KEY, val)
})
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--c-bg);
  color: var(--c-text);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
