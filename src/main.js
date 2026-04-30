import { createApp } from 'vue'
import App from './App.vue'
import { ja } from './i18n/ja.js'
import './styles/variables.css'

document.title = ja.pageTitle

createApp(App).mount('#app')
