<template>
  <div class="scroll-layout">
    <!-- ===== 折叠式侧边栏 ===== -->
    <aside
      :class="['scroll-sidebar', { expanded: appStore.scrollExpanded }]"
      @mouseenter="appStore.toggleScroll"
      @mouseleave="appStore.closeScroll"
    >
      <!-- 侧边栏顶部：用户信息 + 全局操作 -->
      <div class="scroll-top">
        <div class="scroll-logo" @click="$router.push('/dashboard')">
          <span class="logo-icon">🎋</span>
        </div>
        <div v-show="appStore.scrollExpanded" class="scroll-user-card">
          <el-avatar :size="36" class="avatar">
            <AppIcon name="userAvatar" :size="18" />
          </el-avatar>
          <div class="user-text">
            <div class="user-name">{{ authStore.admin?.nickname || '掌柜' }}</div>
            <div class="user-role">管理员</div>
          </div>
        </div>
      </div>

      <!-- 卷轴式导航菜单 -->
      <nav class="scroll-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="scroll-nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <AppIcon :name="item.icon" :size="20" />
          <span v-show="appStore.scrollExpanded" class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- 侧边栏底部 — 仪表盘、退出登录 & 印章 -->
      <div class="scroll-bottom">
        <router-link to="/dashboard" class="back-btn" :class="{ active: isActive('/dashboard') }">
          <AppIcon name="dashboard" :size="18" />
          <span v-show="appStore.scrollExpanded" class="nav-label">仪表盘</span>
        </router-link>
        <a class="back-btn logout-btn" @click="handleLogout">
          <AppIcon name="logout" :size="18" />
          <span v-show="appStore.scrollExpanded" class="nav-label">退出登录</span>
        </a>
        <div v-show="appStore.scrollExpanded" class="scroll-seal">竹韵</div>
      </div>

      <!-- 卷轴展开的装饰光效 -->
      <div v-show="appStore.scrollExpanded" class="scroll-glow" />
    </aside>

    <!-- ===== 沉浸式内容区（几乎全屏） ===== -->
    <main class="immersive-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

const menuItems = [
  { path: '/analytics',       icon: 'analytics',  label: '数据统计' },
  { path: '/village/list',    icon: 'village',    label: '乡村管理' },
  { path: '/script/list',     icon: 'script',     label: '剧本列表' },
  { path: '/script/editor',   icon: 'editPen',    label: '剧本编辑器' },
  { path: '/script/generate', icon: 'magic',      label: 'AI 剧本生成' },
  { path: '/user/list',       icon: 'user',       label: '用户管理' },
  { path: '/settings',        icon: 'settings',   label: '系统设置' },
]

function isActive(path: string) {
  return route.path.startsWith(path)
}
</script>

<style scoped>
.scroll-layout { height: 100%; display: flex; }

/* ===== 侧边栏 ===== */
.scroll-sidebar {
  width: 64px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #1a3a24 0%, #15301e 40%, #0f2617 100%);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  z-index: 20;
}
.scroll-sidebar.expanded { width: 220px; }

/* 竹节纹理 */
.scroll-sidebar::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(90deg, transparent 0px, transparent 8px, rgba(255,255,255,0.012) 8px, rgba(255,255,255,0.012) 9px),
    repeating-linear-gradient(180deg, transparent 0px, transparent 60px, rgba(255,255,255,0.015) 60px, rgba(255,255,255,0.015) 61px);
  pointer-events: none;
}

/* 侧边栏顶部 */
.scroll-top {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(184,212,188,0.1);
  position: relative;
  z-index: 1;
}
.scroll-logo {
  cursor: pointer;
  padding: 4px;
}
.scroll-logo .logo-icon { font-size: 22px; }
.scroll-user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  width: 100%;
}
.scroll-user-card .avatar { background: var(--bamboo-500) !important; flex-shrink: 0; }
.user-text { overflow: hidden; }
.user-name { font-size: 13px; color: #e0f0e3; font-weight: 600; white-space: nowrap; }
.user-role { font-size: 11px; color: rgba(184,212,188,0.6); }

/* 卷轴导航 */
.scroll-nav {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
  z-index: 1;
}
.scroll-nav-item,
.back-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--sidebar-text);
  transition: all 0.2s;
  white-space: nowrap;
}
.scroll-nav-item:hover,
.back-btn:hover {
  background: rgba(91,140,90,0.15);
  color: #d4ecd6;
}
.scroll-nav-item.active,
.back-btn.active {
  background: rgba(91,140,90,0.28);
  color: var(--sprout-300);
  box-shadow: inset -3px 0 0 var(--sprout-400);
}
/* 收缩时：nav-label 由 v-show 隐藏（display:none），无需额外 CSS */
/* 收缩时：精确适配侧边栏宽度，让背景框与展开时视觉效果一致 */
.scroll-sidebar:not(.expanded) .scroll-nav-item {
  padding: 12px 14px;       /* 14+20+14=48px，恰好填满 scroll-nav 内容区 */
}
.scroll-sidebar:not(.expanded) .back-btn {
  width: 100%;
  padding: 12px 14px;
}
.logout-btn:hover {
  color: #e8a0a0 !important;
}
.nav-label { font-size: 14px; }

/* 侧边栏底部 */
.scroll-bottom {
  padding: 12px 8px;
  border-top: 1px solid rgba(184,212,188,0.1);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  position: relative;
  z-index: 1;
}
.back-btn {
  width: 100%;
  justify-content: flex-start;
}
.scroll-seal {
  width: 40px; height: 40px;
  align-self: center;
  border: 2px solid rgba(91,140,90,0.5);
  color: rgba(126,200,123,0.5);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50% 20% 50% 20%;
  transform: rotate(-8deg);
  letter-spacing: 1px;
}

/* 展开卷轴光效 */
.scroll-glow {
  position: absolute;
  top: 60px;
  right: 0;
  width: 1px;
  height: 200px;
  background: linear-gradient(180deg, transparent, rgba(126,200,123,0.3), transparent);
  pointer-events: none;
  animation: scrollGlow 3s ease-in-out infinite;
}
@keyframes scrollGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

/* ===== 沉浸式主内容区 ===== */
.immersive-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--main-bg);
  padding: 16px;
}
.immersive-main::-webkit-scrollbar { width: 5px; }
.immersive-main::-webkit-scrollbar-track { background: transparent; }
.immersive-main::-webkit-scrollbar-thumb { background: var(--tea-400); border-radius: 3px; }
</style>
