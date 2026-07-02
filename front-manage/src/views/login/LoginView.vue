<template>
  <div class="login-container">
    <!-- 背景装饰：竹林晨雾意境 -->
    <div class="login-bg">
      <!-- 竹竿 — 纵向线条模拟竹节 -->
      <div class="bamboo-stalk bs1"></div>
      <div class="bamboo-stalk bs2"></div>
      <div class="bamboo-stalk bs3"></div>
      <div class="bamboo-stalk bs4"></div>
      <div class="bamboo-stalk bs5"></div>
      <!-- 竹叶剪影 -->
      <div class="bamboo-leaf bl1"></div>
      <div class="bamboo-leaf bl2"></div>
      <div class="bamboo-leaf bl3"></div>
      <div class="bamboo-leaf bl4"></div>
      <!-- 晨雾光晕 -->
      <div class="mist m1"></div>
      <div class="mist m2"></div>
      <div class="mist m3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 竹节角落装饰 -->
      <div class="card-ornament top-left"></div>
      <div class="card-ornament top-right"></div>
      <div class="card-ornament bottom-left"></div>
      <div class="card-ornament bottom-right"></div>

      <div class="login-header">
        <div class="login-seal">
          <span>竹韵</span>
        </div>
        <h1>沉浸式乡村文旅</h1>
        <p>剧本创作与智能导览管理平台</p>
        <div class="header-divider">
          <span class="divider-leaf">🍃</span>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <AppIcon name="user" :size="18" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
          >
            <template #prefix>
              <AppIcon name="lock" :size="18" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            native-type="submit"
            class="login-btn"
          >
            {{ loading ? '正在进入竹林...' : '进 入 管 理 台' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="login-footer">
      <span>沉浸式乡村文旅 · 剧本创作与智能导览系统</span>
      <span class="footer-divider">|</span>
      <span>管理端 v1.0</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await authStore.login(form.username, form.password)
    ElMessage.success('欢迎回来，竹韵相伴')
    router.push('/dashboard')
  } catch {
    ElMessage.error('用户名或密码错误')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(175deg, #e8f4e6 0%, #d4e8d0 25%, #c0dbb8 50%, #a8cfa0 80%, #8fbf85 100%);
  position: relative;
  overflow: hidden;
}

/* ===== 竹林背景 ===== */
.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 竹竿 — 节节高 */
.bamboo-stalk {
  position: absolute;
  bottom: -10%;
  width: 14px;
  background: linear-gradient(180deg,
    rgba(91, 140, 90, 0.18) 0%,
    rgba(73, 118, 72, 0.22) 20%,
    rgba(91, 140, 90, 0.18) 20.5%,
    rgba(73, 118, 72, 0.22) 40%,
    rgba(91, 140, 90, 0.18) 40.5%,
    rgba(73, 118, 72, 0.22) 60%,
    rgba(91, 140, 90, 0.18) 60.5%,
    rgba(73, 118, 72, 0.22) 80%,
    rgba(91, 140, 90, 0.18) 80.5%,
    rgba(73, 118, 72, 0.22) 100%
  );
  border-radius: 7px;
}
.bs1 { left: 8%;  height: 110%; animation: swayBamboo 8s ease-in-out infinite; }
.bs2 { left: 22%; height: 95%;  animation: swayBamboo 7s ease-in-out 1s infinite; }
.bs3 { left: 38%; height: 105%; animation: swayBamboo 9s ease-in-out 2s infinite; }
.bs4 { left: 72%; height: 100%; animation: swayBamboo 7.5s ease-in-out 0.5s infinite; }
.bs5 { left: 88%; height: 90%;  animation: swayBamboo 8.5s ease-in-out 1.5s infinite; }

@keyframes swayBamboo {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(0.4deg); }
  75% { transform: rotate(-0.3deg); }
}

/* 竹叶 — 椭圆形剪影 */
.bamboo-leaf {
  position: absolute;
  background: rgba(91, 140, 90, 0.13);
  border-radius: 2px 80% 2px 80%;
  transform-origin: center left;
}
.bl1 { width: 60px; height: 12px; top: 15%; left: 12%; transform: rotate(-25deg); animation: leafDrift 12s ease-in-out infinite; }
.bl2 { width: 80px; height: 14px; top: 22%; right: 15%; transform: rotate(30deg); animation: leafDrift 14s ease-in-out 2s infinite; }
.bl3 { width: 50px; height: 10px; top: 40%; left: 40%; transform: rotate(-15deg); animation: leafDrift 10s ease-in-out 4s infinite; }
.bl4 { width: 70px; height: 12px; top: 55%; right: 30%; transform: rotate(20deg); animation: leafDrift 13s ease-in-out 1s infinite; }

@keyframes leafDrift {
  0%, 100% { transform: translateX(0) rotate(0deg); opacity: 0.7; }
  50% { transform: translateX(15px) rotate(5deg); opacity: 0.4; }
}

/* 晨雾光晕 */
.mist {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.25;
}
.m1 { width: 400px; height: 120px; background: rgba(255,255,255,0.6); top: 5%; left: -10%; animation: mistFloat 16s ease-in-out infinite; }
.m2 { width: 300px; height: 90px; background: rgba(255,255,255,0.5); top: 35%; right: -5%; animation: mistFloat 20s ease-in-out 3s infinite reverse; }
.m3 { width: 250px; height: 80px; background: rgba(255,255,255,0.4); top: 65%; left: 25%; animation: mistFloat 18s ease-in-out 6s infinite; }

@keyframes mistFloat {
  0%, 100% { transform: translateX(0) scale(1); }
  33% { transform: translateX(30px) scale(1.05); }
  66% { transform: translateX(-20px) scale(0.97); }
}

/* ===== 卡片 ===== */
.login-card {
  position: relative;
  z-index: 1;
  width: 420px;
  padding: 44px 40px 36px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  box-shadow: 0 8px 40px rgba(45, 74, 50, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 竹节角落装饰 */
.card-ornament {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: var(--bamboo-300);
  border-style: solid;
  opacity: 0.45;
}
.top-left { top: 14px; left: 14px; border-width: 2px 0 0 2px; border-radius: 6px 0 0 0; }
.top-right { top: 14px; right: 14px; border-width: 2px 2px 0 0; border-radius: 0 6px 0 0; }
.bottom-left { bottom: 14px; left: 14px; border-width: 0 0 2px 2px; border-radius: 0 0 0 6px; }
.bottom-right { bottom: 14px; right: 14px; border-width: 0 2px 2px 0; border-radius: 0 0 6px 0; }

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

/* 竹韵印章 */
.login-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: 2.5px solid var(--bamboo-600);
  color: var(--bamboo-600);
  border-radius: 50% 22% 48% 20%;
  font-size: 14px;
  font-weight: 700;
  transform: rotate(-5deg);
  letter-spacing: 2px;
  margin-bottom: 18px;
  opacity: 0.85;
  background: radial-gradient(circle at 30% 30%, rgba(126, 200, 123, 0.15), transparent 60%);
}

.login-header h1 {
  margin: 0 0 8px;
  font-size: 24px;
  color: var(--ink-800);
  font-weight: 700;
  letter-spacing: 2px;
}
.login-header p {
  margin: 0;
  font-size: 13px;
  color: var(--ink-500);
  letter-spacing: 1px;
}
.header-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px auto 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--bamboo-200), transparent);
  position: relative;
}
.divider-leaf {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--card-bg);
  padding: 0 8px;
  font-size: 16px;
  line-height: 1;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 6px;
  border-radius: 8px;
  margin-top: 4px;
  background: linear-gradient(135deg, var(--bamboo-500), var(--bamboo-700));
  border-color: transparent;
}
.login-btn:hover {
  background: linear-gradient(135deg, var(--bamboo-400), var(--bamboo-600));
}

.login-footer {
  position: relative;
  z-index: 1;
  margin-top: 24px;
  font-size: 12px;
  color: var(--ink-600);
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.6;
}
.footer-divider {
  opacity: 0.3;
}
</style>
