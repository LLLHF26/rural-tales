// ============================================================
// 认证状态管理
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, getProfile } from '@/api/auth'
import type { AdminInfo } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const admin = ref<AdminInfo | null>(
    JSON.parse(localStorage.getItem('admin_info') || 'null')
  )

  const isLoggedIn = computed(() => !!token.value)
  const isSuperAdmin = computed(() => admin.value?.role === 'super_admin')

  async function login(username: string, password: string) {
    const res = await loginApi(username, password)
    const data = res.data.data
    token.value = data.token
    admin.value = data.admin
    localStorage.setItem('admin_token', data.token)
    localStorage.setItem('admin_info', JSON.stringify(data.admin))
    return data
  }

  async function fetchProfile() {
    try {
      const res = await getProfile()
      admin.value = res.data.data
      localStorage.setItem('admin_info', JSON.stringify(res.data.data))
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = ''
    admin.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
  }

  return { token, admin, isLoggedIn, isSuperAdmin, login, fetchProfile, logout }
})
