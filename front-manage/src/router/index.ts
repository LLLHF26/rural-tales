// ============================================================
// 路由配置 — 折叠式卷轴导航（全局统一）
// ============================================================
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  /* 登录 — 无布局 */
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { title: '登录', noAuth: true }
  },

  /* 主路由 — 全部使用卷轴沉浸布局 */
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'script/editor/:id?',
        name: 'ScriptEditor',
        component: () => import('@/views/script/ScriptEditorView.vue'),
        meta: { title: '剧本编辑器' }
      },
      {
        path: 'script/generate',
        name: 'ScriptGenerate',
        component: () => import('@/views/script/ScriptGenerateView.vue'),
        meta: { title: 'AI剧本生成' }
      },
      {
        path: 'script/list',
        name: 'ScriptList',
        component: () => import('@/views/script/ScriptListView.vue'),
        meta: { title: '剧本管理' }
      },
      {
        path: 'village/list',
        name: 'VillageList',
        component: () => import('@/views/village/VillageListView.vue'),
        meta: { title: '乡村管理' }
      },
      {
        path: 'village/detail/:id',
        name: 'VillageDetail',
        component: () => import('@/views/village/VillageDetailView.vue'),
        meta: { title: '乡村详情' }
      },
      {
        path: 'user/list',
        name: 'UserList',
        component: () => import('@/views/user/UserListView.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'user/detail/:id',
        name: 'UserDetail',
        component: () => import('@/views/user/UserDetailView.vue'),
        meta: { title: '用户详情' }
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/analytics/AnalyticsView.vue'),
        meta: { title: '数据统计' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/SettingsView.vue'),
        meta: { title: '系统设置' }
      },
    ]
  },

  /* 404 → 仪表盘 */
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.meta.noAuth) {
    if (token) return next('/dashboard')
    return next()
  }
  if (!token) return next('/login')
  next()
})

export default router
