<template>
  <div class="topnav-layout">
    <!-- ===== 顶部通栏主导航 ===== -->
    <header class="topbar">
      <div class="topbar-inner">
        <!-- Logo -->
        <div class="topbar-logo" @click="$router.push('/dashboard')">
          <span class="logo-icon">🎋</span>
          <span class="logo-text">竹韵剧本台</span>
        </div>

        <!-- 一级导航 — 按业务流程分 -->
        <nav class="primary-nav">
          <button
            v-for="tab in primaryTabs"
            :key="tab.key"
            :class="['nav-tab', { active: appStore.activePrimaryTab === tab.key }]"
            @click="switchTab(tab.key)"
          >
            <span class="tab-text">{{ tab.label }}</span>
            <span v-if="appStore.activePrimaryTab === tab.key" class="tab-indicator" />
          </button>
        </nav>

        <!-- 右侧功能区 -->
        <div class="topbar-right">
          <!-- 布局切换（开发阶段可见） -->
          <el-tooltip content="切换布局方案" placement="bottom">
            <el-dropdown trigger="click" @command="handleLayoutSwitch">
              <span class="layout-switch-btn">
                <el-icon :size="18"><Grid /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="topnav">
                    <el-icon><Select /></el-icon>
                    <span v-if="appStore.layoutOverride === 'topnav' || !appStore.layoutOverride">✓ </span>
                    通栏导航模式
                  </el-dropdown-item>
                  <el-dropdown-item command="scroll">
                    <el-icon><Select /></el-icon>
                    <span v-if="appStore.layoutOverride === 'scroll'">✓ </span>
                    卷轴沉浸模式
                  </el-dropdown-item>
                  <el-dropdown-item command="workbench">
                    <el-icon><Select /></el-icon>
                    <span v-if="appStore.layoutOverride === 'workbench'">✓ </span>
                    工作台模式
                  </el-dropdown-item>
                  <el-dropdown-item v-if="appStore.layoutOverride" command="auto" divided>
                    恢复默认
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-tooltip>

          <!-- 用户 -->
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-avatar :size="30" :icon="UserFilled" class="user-avatar" />
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
      </div>
      <!-- 卷轴装饰线 — 底部渐变竹节 -->
      <div class="topbar-scroll-line" />
    </header>

    <!-- ===== 主体：左侧场景化侧边栏 + 右侧内容区 ===== -->
    <div class="body-wrapper">
      <!-- 左侧二级导航 -->
      <aside class="sub-sidebar">
        <div class="sub-nav-title">{{ currentTabLabel }}</div>
        <nav class="sub-nav">
          <router-link
            v-for="item in currentSubMenus"
            :key="item.path"
            :to="item.path"
            class="sub-nav-item"
            :class="{ active: isActive(item.path) }"
          >
            <el-icon :size="18"><component :is="item.icon" /></el-icon>
            <span class="sub-nav-label">{{ item.label }}</span>
          </router-link>
        </nav>
        <!-- 底部竹叶印章 -->
        <div class="sub-sidebar-footer">
          <div class="footer-seal">竹韵</div>
        </div>
      </aside>

      <!-- 主内容区 — 占满剩余宽度，无多余侧边距 -->
      <main class="main-content">
        <slot />
      </main>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="pwdDialog.visible" title="修改密码" width="400px" :close-on-click-modal="false">
      <el-form :model="pwdDialog.form" label-width="80px">
        <el-form-item label="旧密码">
          <el-input v-model="pwdDialog.form.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="pwdDialog.form.newPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitChangePassword" :loading="pwdDialog.loading">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore, type LayoutMode } from '@/stores/app'
import { changePassword } from '@/api/auth'
import {
  UserFilled, Lock, SwitchButton, ArrowDown, Grid, Select,
  Notebook, MagicStick, HomeFilled, User, Odometer, DataAnalysis, Setting
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

/* ===== 一级导航定义 ===== */
type PrimaryTabKey = 'content' | 'operation' | 'analytics' | 'system'
const primaryTabs: { key: PrimaryTabKey; label: string; matchPaths: string[] }[] = [
  { key: 'content',   label: '内容创作', matchPaths: ['/script/list', '/script/generate', '/script/editor'] },
  { key: 'operation', label: '运营管理', matchPaths: ['/village/list', '/village/detail', '/user/list', '/user/detail'] },
  { key: 'analytics', label: '数据复盘', matchPaths: ['/dashboard', '/analytics'] },
  { key: 'system',    label: '系统设置', matchPaths: ['/settings'] },
]

/* ===== 二级菜单（对应每个一级 tab） ===== */
const subMenuMap: Record<string, { path: string; icon: any; label: string }[]> = {
  content: [
    { path: '/script/list', icon: Notebook, label: '剧本列表' },
    { path: '/script/generate', icon: MagicStick, label: 'AI 剧本生成' },
  ],
  operation: [
    { path: '/village/list', icon: HomeFilled, label: '乡村管理' },
    { path: '/user/list', icon: User, label: '用户管理' },
  ],
  analytics: [
    { path: '/dashboard', icon: Odometer, label: '仪表盘' },
    { path: '/analytics', icon: DataAnalysis, label: '数据统计' },
  ],
  system: [
    { path: '/settings', icon: Setting, label: '系统设置' },
  ],
}

/* ===== 根据当前路由自动匹配一级 tab ===== */
function autoMatchTab() {
  const matched = primaryTabs.find(tab =>
    tab.matchPaths.some(p => route.path.startsWith(p))
  )
  if (matched) appStore.setPrimaryTab(matched.key)
}
autoMatchTab()

const currentTabLabel = computed(() =>
  primaryTabs.find(t => t.key === appStore.activePrimaryTab)?.label || ''
)
const currentSubMenus = computed(() => subMenuMap[appStore.activePrimaryTab] || [])

function switchTab(key: PrimaryTabKey) {
  appStore.setPrimaryTab(key)
  // 自动跳转到该 tab 下的第一个菜单
  const first = subMenuMap[key]?.[0]
  if (first) router.push(first.path)
}

function isActive(path: string) {
  return route.path.startsWith(path)
}

/* ===== 布局切换 ===== */
function handleLayoutSwitch(cmd: string) {
  if (cmd === 'auto') {
    appStore.setLayoutOverride(null)
    ElMessage.success('已恢复默认布局')
  } else {
    appStore.setLayoutOverride(cmd as LayoutMode)
    const names: Record<string, string> = { topnav: '通栏导航', scroll: '卷轴沉浸', workbench: '工作台' }
    ElMessage.success(`已切换为「${names[cmd]}」模式`)
  }
}

/* ===== 密码修改 ===== */
const pwdDialog = reactive({ visible: false, loading: false, form: { oldPassword: '', newPassword: '' } })
function handleChangePassword() {
  pwdDialog.form = { oldPassword: '', newPassword: '' }; pwdDialog.visible = true
}
async function submitChangePassword() {
  if (!pwdDialog.form.oldPassword || !pwdDialog.form.newPassword) { ElMessage.warning('请填写完整'); return }
  pwdDialog.loading = true
  try {
    await changePassword(pwdDialog.form.oldPassword, pwdDialog.form.newPassword)
    ElMessage.success('密码修改成功')
    pwdDialog.visible = false
    authStore.logout(); router.push('/login')
  } finally { pwdDialog.loading = false }
}
function handleLogout() { authStore.logout(); router.push('/login') }
</script>

<style scoped>
.topnav-layout { height: 100%; display: flex; flex-direction: column; }

/* ===== 顶部通栏 ===== */
.topbar {
  height: 60px;
  background: #fff;
  flex-shrink: 0;
  position: relative;
  z-index: 20;
  box-shadow: 0 1px 3px rgba(45,74,50,0.06);
}
.topbar-inner {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 0;
}
.topbar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  margin-right: 32px;
}
.topbar-logo .logo-icon { font-size: 20px; }
.topbar-logo .logo-text { font-size: 15px; font-weight: 700; color: var(--bamboo-700); letter-spacing: 1.5px; }

/* 一级导航 tab */
.primary-nav {
  display: flex;
  gap: 4px;
  flex: 1;
}
.nav-tab {
  position: relative;
  padding: 8px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  color: var(--ink-600);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}
.nav-tab:hover { color: var(--bamboo-600); background: var(--bamboo-50); }
.nav-tab.active { color: var(--bamboo-700); font-weight: 600; }
.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: var(--bamboo-500);
  border-radius: 2px;
}

/* 右侧区 */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}
.layout-switch-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--ink-400);
  transition: all 0.2s;
}
.layout-switch-btn:hover { background: var(--bamboo-50); color: var(--bamboo-500); }
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 8px;
  transition: background 0.2s;
}
.user-info:hover { background: var(--bamboo-50); }
.user-avatar { background: var(--bamboo-500) !important; }
.username { font-size: 13px; color: var(--ink-700); }

/* 卷轴装饰线 */
.topbar-scroll-line {
  height: 4px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--tea-300) 15%,
    var(--bamboo-300) 30%,
    var(--bamboo-500) 50%,
    var(--bamboo-300) 70%,
    var(--tea-300) 85%,
    transparent 100%
  );
  position: relative;
}
.topbar-scroll-line::after {
  content: '🎋';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  background: #fff;
  padding: 0 8px;
  color: var(--bamboo-400);
}

/* ===== 主体 ===== */
.body-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧场景化侧边导航 */
.sub-sidebar {
  width: 180px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #fff 0%, var(--tea-50) 50%, var(--tea-100) 100%);
  border-right: 1px solid var(--tea-200);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
/* 侧边竹叶纹理 */
.sub-sidebar::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(180deg, transparent 0, transparent 80px, rgba(91,140,90,0.02) 80px, rgba(91,140,90,0.02) 81px);
  pointer-events: none;
}
.sub-nav-title {
  padding: 16px 16px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-500);
  letter-spacing: 2px;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}
.sub-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px;
  position: relative;
  z-index: 1;
}
.sub-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--ink-600);
  font-size: 14px;
  transition: all 0.2s;
  position: relative;
}
.sub-nav-item:hover { background: var(--bamboo-50); color: var(--bamboo-600); }
.sub-nav-item.active {
  background: linear-gradient(135deg, var(--bamboo-50), var(--sprout-50));
  color: var(--bamboo-700);
  font-weight: 600;
}
.sub-nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--bamboo-500);
  border-radius: 2px;
}
.sub-nav-label { white-space: nowrap; }

/* 侧边栏底部印章 */
.sub-sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--tea-200);
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1;
}
.footer-seal {
  width: 40px; height: 40px;
  border: 2px solid rgba(91,140,90,0.4);
  color: rgba(91,140,90,0.45);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50% 20% 50% 20%;
  transform: rotate(-8deg);
}

/* ===== 主内容区 ===== */
.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--main-bg);
  padding: 20px;
}
.main-content::-webkit-scrollbar { width: 5px; }
.main-content::-webkit-scrollbar-track { background: transparent; }
.main-content::-webkit-scrollbar-thumb { background: var(--tea-400); border-radius: 3px; }
</style>
