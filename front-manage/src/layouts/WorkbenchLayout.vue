<template>
  <div class="workbench-layout">
    <!-- ===== 极简顶栏 ===== -->
    <header class="wb-topbar">
      <div class="wb-logo" @click="$router.push('/dashboard')">
        <span class="logo-icon">🎋</span>
        <span class="logo-text">竹韵剧本台</span>
      </div>
      <div class="wb-center">
        <span class="wb-greeting">{{ greeting }}</span>
      </div>
      <div class="wb-actions">
        <span class="wb-todo-badge" v-if="pendingCount > 0">
          <el-icon><Bell /></el-icon>
          待办 {{ pendingCount }}
        </span>
        <el-dropdown trigger="click">
          <span class="wb-user">
            <el-avatar :size="28" :icon="UserFilled" />
            <span class="wb-username">{{ authStore.admin?.nickname || '掌柜' }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$router.push('/settings')">
                <el-icon><Setting /></el-icon> 系统设置
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon> 退出
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="wb-scroll-line" />
    </header>

    <!-- ===== 工作台式左右分栏 ===== -->
    <div class="wb-body">
      <!-- 左侧 70%：核心数据区 -->
      <section class="wb-left">
        <slot />
      </section>

      <!-- 右侧 30%：工作台面板 -->
      <aside class="wb-right">
        <!-- 快捷操作 -->
        <div class="wb-panel">
          <div class="wb-panel-title">⚡ 快捷操作</div>
          <div class="wb-quick-actions">
            <button class="wb-action-btn" @click="$router.push('/script/list')">
              <span class="action-icon">📜</span>
              <span>新建剧本</span>
            </button>
            <button class="wb-action-btn" @click="$router.push('/village/list')">
              <span class="action-icon">🏘️</span>
              <span>新增乡村</span>
            </button>
            <button class="wb-action-btn" @click="$router.push('/script/generate')">
              <span class="action-icon">🤖</span>
              <span>AI 生成</span>
            </button>
          </div>
        </div>

        <!-- 热门剧本 Top3 -->
        <div class="wb-panel">
          <div class="wb-panel-title">🏆 热门剧本</div>
          <div v-if="hotScripts.length > 0" class="wb-hot-list">
            <div v-for="(item, idx) in hotScripts.slice(0,5)" :key="item.scriptId" class="wb-hot-item">
              <span :class="['wb-rank', rankClass(idx)]">{{ idx + 1 }}</span>
              <div class="wb-hot-info">
                <div class="wb-hot-title">{{ item.title }}</div>
                <div class="wb-hot-meta">{{ item.villageName }} · {{ item.experienceCount }} 人次</div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无数据" :image-size="48" />
        </div>

        <!-- 待办提示 -->
        <div class="wb-panel">
          <div class="wb-panel-title">📋 待办事项</div>
          <div class="wb-todo-list">
            <div class="wb-todo-item">
              <el-icon><CircleCheck /></el-icon>
              <span>审核新提交的剧本内容</span>
            </div>
            <div class="wb-todo-item">
              <el-icon><CircleCheck /></el-icon>
              <span>更新乡村打卡点信息</span>
            </div>
            <div class="wb-todo-item done">
              <el-icon><CircleCheckFilled /></el-icon>
              <span>完成本周数据复盘</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getHotScripts } from '@/api/dashboard'
import type { HotScript } from '@/types'
import { UserFilled, Setting, SwitchButton, Bell, CircleCheck, CircleCheckFilled } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const hotScripts = ref<HotScript[]>([])
const pendingCount = ref(2) // 可从API获取

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 9) return '🌅 早安，新的一天从茶香开始'
  if (h < 12) return '☀️ 上午好，运营数据已就绪'
  if (h < 14) return '🍵 午后好，喝杯茶看看数据'
  if (h < 18) return '🌿 下午好，今天进展如何'
  return '🌙 晚上好，复盘一下今日'
})

function rankClass(idx: number) {
  if (idx === 0) return 'gold'
  if (idx === 1) return 'silver'
  if (idx === 2) return 'bronze'
  return ''
}

function handleLogout() { authStore.logout(); router.push('/login') }

onMounted(async () => {
  try {
    const res = await getHotScripts(5)
    hotScripts.value = res.data.data.list
  } catch { /* 无数据时不报错 */ }
})
</script>

<style scoped>
.workbench-layout { height: 100%; display: flex; flex-direction: column; }

/* ===== 极简顶栏 ===== */
.wb-topbar {
  height: 48px;
  flex-shrink: 0;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 24px;
  position: relative;
  box-shadow: 0 1px 2px rgba(45,74,50,0.04);
  z-index: 10;
}
.wb-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}
.wb-logo .logo-icon { font-size: 16px; }
.wb-logo .logo-text { font-size: 14px; font-weight: 700; color: var(--bamboo-700); letter-spacing: 1px; }
.wb-center { flex: 1; }
.wb-greeting { font-size: 13px; color: var(--ink-500); }
.wb-actions { display: flex; align-items: center; gap: 16px; }
.wb-todo-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: var(--bamboo-50);
  color: var(--bamboo-600);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.wb-todo-badge:hover { background: var(--bamboo-100); }
.wb-user {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}
.wb-user:hover { background: var(--bamboo-50); }
.wb-username { font-size: 13px; color: var(--ink-600); }

.wb-scroll-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--bamboo-200) 25%, var(--bamboo-400) 50%, var(--bamboo-200) 75%, transparent);
}

/* ===== 主体分栏 ===== */
.wb-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左 70% */
.wb-left {
  flex: 7;
  overflow-y: auto;
  padding: 20px;
}
.wb-left::-webkit-scrollbar { width: 5px; }
.wb-left::-webkit-scrollbar-track { background: transparent; }
.wb-left::-webkit-scrollbar-thumb { background: var(--tea-400); border-radius: 3px; }

/* 右 30% 工作台面板 */
.wb-right {
  flex: 3;
  min-width: 280px;
  max-width: 360px;
  overflow-y: auto;
  background: #fff;
  border-left: 1px solid var(--tea-200);
  padding: 16px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.wb-right::-webkit-scrollbar { width: 4px; }
.wb-right::-webkit-scrollbar-track { background: transparent; }
.wb-right::-webkit-scrollbar-thumb { background: var(--tea-300); border-radius: 2px; }

.wb-panel {
  background: var(--tea-50);
  border-radius: 10px;
  padding: 16px;
}
.wb-panel-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-700);
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

/* 快捷操作按钮 */
.wb-quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wb-action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--tea-200);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  color: var(--ink-700);
  transition: all 0.2s;
}
.wb-action-btn:hover {
  border-color: var(--bamboo-300);
  background: var(--bamboo-50);
  transform: translateX(3px);
}
.wb-action-btn .action-icon { font-size: 18px; }

/* 热门列表 */
.wb-hot-list {}
.wb-hot-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--tea-200);
}
.wb-hot-item:last-child { border-bottom: none; }
.wb-rank {
  width: 24px; height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  background: var(--tea-100);
  color: var(--ink-500);
}
.wb-rank.gold { background: #faf0d7; color: #b8860b; }
.wb-rank.silver { background: #f3f4f6; color: #6b7280; }
.wb-rank.bronze { background: #fef3e2; color: #b87333; }
.wb-hot-info { flex: 1; min-width: 0; }
.wb-hot-title {
  font-size: 13px; font-weight: 600;
  color: var(--ink-700);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.wb-hot-meta { font-size: 11px; color: var(--ink-500); margin-top: 2px; }

/* 待办 */
.wb-todo-list { display: flex; flex-direction: column; gap: 8px; }
.wb-todo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--ink-600);
  padding: 6px 0;
}
.wb-todo-item .el-icon { color: var(--bamboo-400); flex-shrink: 0; }
.wb-todo-item.done { color: var(--ink-400); text-decoration: line-through; }
.wb-todo-item.done .el-icon { color: var(--sprout-400); }
</style>
