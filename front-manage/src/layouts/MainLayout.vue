<template>
  <el-container class="layout">
    <!-- 侧边栏 — 竹墨深处，竹节纹理 -->
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="aside">
      <div class="logo" @click="appStore.toggleSidebar">
        <span class="logo-icon">🎋</span>
        <span v-show="!appStore.sidebarCollapsed" class="logo-text">竹韵剧本台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        router
        class="side-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/village/list">
          <el-icon><HomeFilled /></el-icon>
          <span>乡村管理</span>
        </el-menu-item>
        <el-sub-menu index="script">
          <template #title>
            <el-icon><Notebook /></el-icon>
            <span>剧本管理</span>
          </template>
          <el-menu-item index="/script/list">剧本列表</el-menu-item>
          <el-menu-item index="/script/generate">AI 剧本生成</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/user/list">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/analytics">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>

      <!-- 底部竹叶印章 -->
      <div class="sidebar-footer">
        <div class="footer-seal">竹韵</div>
      </div>
    </el-aside>

    <el-container>
      <!-- 顶栏 — 晨露白 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="appStore.toggleSidebar" :size="20">
            <Fold v-if="!appStore.sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
          <div class="breadcrumb-wrapper">
            <el-breadcrumb separator="»">
              <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-avatar :size="32" :icon="UserFilled" class="user-avatar" />
              <span class="username">{{ authStore.admin?.nickname || '掌柜' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleChangePassword">
                  <el-icon><Lock /></el-icon> 修改密码
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon> 退出
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主体区 — 茶白底色 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialog.visible" title="修改密码" width="420px" :close-on-click-modal="false">
      <el-form :model="passwordDialog.form" label-width="80px" label-position="right">
        <el-form-item label="旧密码">
          <el-input v-model="passwordDialog.form.oldPassword" type="password" show-password placeholder="请输入旧密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordDialog.form.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitChangePassword" :loading="passwordDialog.loading">确认修改</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { changePassword } from '@/api/auth'
import { UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const activeMenu = computed(() => route.path)

const passwordDialog = reactive({
  visible: false,
  loading: false,
  form: { oldPassword: '', newPassword: '' }
})

function handleChangePassword() {
  passwordDialog.form = { oldPassword: '', newPassword: '' }
  passwordDialog.visible = true
}

async function submitChangePassword() {
  if (!passwordDialog.form.oldPassword || !passwordDialog.form.newPassword) {
    ElMessage.warning('请填写完整')
    return
  }
  passwordDialog.loading = true
  try {
    await changePassword(passwordDialog.form.oldPassword, passwordDialog.form.newPassword)
    ElMessage.success('密码修改成功，请重新登录')
    passwordDialog.visible = false
    authStore.logout()
    router.push('/login')
  } catch {
    // handled by interceptor
  } finally {
    passwordDialog.loading = false
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout {
  height: 100%;
}

/* ===== 侧边栏 — 竹墨渐变 + 竹节纹理 ===== */
.aside {
  background: var(--sidebar-bg);
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
}
/* 侧边栏竹节纹理层 */
.aside::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 8px,
      rgba(255,255,255,0.015) 8px,
      rgba(255,255,255,0.015) 9px
    ),
    repeating-linear-gradient(
      180deg,
      transparent 0px,
      transparent 60px,
      rgba(255,255,255,0.02) 60px,
      rgba(255,255,255,0.02) 61px
    );
  pointer-events: none;
}
.aside::-webkit-scrollbar { width: 3px; }

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #e0f0e3;
  cursor: pointer;
  border-bottom: 1px solid var(--sidebar-divider);
  user-select: none;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.logo-icon {
  font-size: 22px;
  line-height: 1;
}
.logo-text {
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 2px;
  color: var(--sprout-300);
}

.side-menu {
  background: transparent !important;
  border-right: none !important;
  flex: 1;
  position: relative;
  z-index: 1;
}

/* 侧边栏底部竹叶印章 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--sidebar-divider);
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1;
}
.footer-seal {
  width: 44px;
  height: 44px;
  border: 2px solid rgba(91, 140, 90, 0.5);
  color: rgba(126, 200, 123, 0.5);
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50% 20% 50% 20%;
  transform: rotate(-8deg);
  letter-spacing: 1px;
  font-weight: 700;
}

/* ===== 顶栏 — 晨露白 ===== */
.header {
  background: var(--header-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--header-border);
  padding: 0 24px;
  height: 60px;
  box-shadow: 0 1px 4px rgba(45, 74, 50, 0.04);
  z-index: 10;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.collapse-btn {
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
}
.collapse-btn:hover {
  color: var(--bamboo-500);
  background: var(--bamboo-50);
}
.breadcrumb-wrapper :deep(.el-breadcrumb__inner) {
  color: var(--text-secondary);
  font-size: 13px;
}
.breadcrumb-wrapper :deep(.el-breadcrumb__inner.is-link):hover {
  color: var(--bamboo-500);
}
.header-right {
  display: flex;
  align-items: center;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}
.user-info:hover {
  background: var(--bamboo-50);
}
.user-avatar {
  background: var(--bamboo-500) !important;
}
.username {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

/* ===== 主体区 ===== */
.main {
  background: var(--main-bg);
  min-height: calc(100vh - 60px);
  padding: 20px;
}
</style>
