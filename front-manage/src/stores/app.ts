// ============================================================
// 应用状态管理 — 卷轴导航展开/收起
// ============================================================
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  /* 卷轴导航展开 */
  const scrollExpanded = ref(false)
  function toggleScroll() { scrollExpanded.value = !scrollExpanded.value }
  function closeScroll() { scrollExpanded.value = false }

  return {
    scrollExpanded, toggleScroll, closeScroll,
  }
})
