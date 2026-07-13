<!-- 剧本体验 - 对话驱动 -->
<template>
  <view class="play-page" :class="{ 'has-scene': nodeData?.sceneImage }" :style="{ backgroundImage: nodeData?.sceneImage ? 'url(' + nodeData.sceneImage + ')' : 'none' }">
    <view class="page-overlay" v-if="nodeData?.sceneImage"></view>
    <nav-bar :title="navTitle" showBack bgColor="#43A047">
      <template #right>
        <view class="nav-detail-btn" @tap="showProgress = !showProgress">
          <text class="nav-detail-icon">📋</text>
          <text class="nav-detail-text">进度</text>
        </view>
      </template>
    </nav-bar>

    <!-- NPC 信息头（透明，融于场景） -->
    <view class="npc-header" v-if="nodeData?.npc">
      <image class="npc-header-avatar" :src="nodeData.npc.avatar" mode="aspectFill" @tap="showNpcInfo = true" />
      <view class="npc-header-info" @tap="showNpcInfo = true">
        <text class="npc-header-name">{{ nodeData.npc.name }}</text>
      </view>
    </view>

    <!-- NPC 详情弹窗 -->
    <view class="npc-modal-mask" v-if="showNpcInfo" @tap="showNpcInfo = false">
      <view class="npc-modal" @tap.stop>
        <image class="npc-modal-avatar" :src="nodeData?.npc?.avatar" mode="aspectFill" />
        <text class="npc-modal-name">{{ nodeData?.npc?.name }}</text>
        <text class="npc-modal-role" v-if="nodeData?.npc?.role">{{ nodeData?.npc?.role }}</text>
        <text class="npc-modal-desc" v-if="nodeData?.npc?.description">{{ nodeData?.npc?.description }}</text>

        <view class="npc-modal-close" @tap="showNpcInfo = false">关闭</view>
      </view>
    </view>

    <!-- 道具详情弹窗 -->
    <view class="npc-modal-mask" v-if="selectedItem" @tap="selectedItem = null">
      <view class="item-detail-modal" @tap.stop>
        <image class="item-detail-icon" :src="selectedItem.icon || '/static/logo.png'" mode="aspectFill" v-if="selectedItem.icon" />
        <view class="item-detail-icon-placeholder" v-else>📦</view>
        <text class="item-detail-name">{{ selectedItem.name }}</text>
        <text class="item-detail-type" v-if="selectedItem.type">{{ selectedItem.type }}</text>
        <text class="item-detail-desc" v-if="selectedItem.description">{{ selectedItem.description }}</text>
        <view class="item-detail-meta" v-if="selectedItem.acquiredAt">
          <text class="item-detail-meta-label">获得时间</text>
          <text class="item-detail-meta-value">{{ formatTime(selectedItem.acquiredAt) }}</text>
        </view>
        <view class="item-detail-meta" v-if="selectedItem.effect">
          <text class="item-detail-meta-label">效果</text>
          <text class="item-detail-meta-value">{{ selectedItem.effect }}</text>
        </view>
        <view class="npc-modal-close" @tap="selectedItem = null">关闭</view>
      </view>
    </view>

    <!-- 进度面板（折叠） -->
    <view class="progress-panel" v-if="showProgress && progressData">
      <view class="progress-row">
        <text class="progress-label">剧情进度</text>
        <view class="progress-bar"><view class="progress-fill" :style="{ width: progressPercent + '%' }"></view></view>
        <text class="progress-num">{{ progressData.completedNodeIds?.length || 0 }}/{{ progressData.totalNodeCount || 0 }} 节点</text>
      </view>
      <view class="progress-row" style="margin-top: 10rpx;">
        <text class="progress-label">任务进度</text>
        <view class="progress-bar"><view class="progress-fill task" :style="{ width: taskPercent + '%' }"></view></view>
        <text class="progress-num">{{ progressData.completedTaskIds?.length || 0 }}/{{ progressData.totalTaskCount || 0 }} 任务</text>
      </view>

      <!-- 当前场景可用任务 -->
      <view class="panel-items" v-if="availableTasks.length">
        <text class="panel-sub">📋 当前任务</text>
        <view class="available-task" v-for="task in availableTasks" :key="task.taskId">
          <view class="available-task-info">
            <text class="available-task-name">{{ task.title }}</text>
            <text class="available-task-type">{{ taskTypeLabel(task.type) }}</text>
          </view>
          <text class="available-task-desc" v-if="task.description">{{ task.description }}</text>
          <button class="available-task-btn" @tap="handleTask(task)">去完成</button>
        </view>
      </view>

      <view class="panel-items" v-if="progressData.items?.length">
        <text class="panel-sub">🎒 线索</text>
        <view class="item-row">
          <view class="item-tag" v-for="item in progressData.items" :key="item.itemId || item.name" @tap="showItemDetail(item)">
            <image class="item-tag-icon" :src="item.icon" mode="aspectFill" v-if="item.icon" />
            <text>{{ item.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 聊天消息区 -->
    <scroll-view scroll-y class="chat-scroll" :scroll-top="scrollTop" :scroll-with-animation="true">
      <view class="messages">
        <view v-for="(msg, idx) in messages" :key="idx">
          <!-- NPC/系统消息 -->
          <view :class="['msg-row', msg.role === 'user' ? 'user' : msg.role === 'narrator' ? 'narrator' : 'npc']" v-if="msg.role !== 'system' && msg.role !== 'narrator'">
            <image v-if="msg.role === 'npc'" class="msg-avatar" :src="nodeData?.npc?.avatar || ''" mode="aspectFill" />
            <view class="msg-bubble-wrap">
              <view :class="['msg-bubble', msg.role]">
                <text class="msg-text">{{ msg.text }}</text>
              </view>
              <!-- 行动提示 -->
              <view class="msg-hint" v-if="(msg.role === 'npc' || msg.role === 'narrator') && msg.hint">
                <text class="msg-hint-icon">💡</text>
                <text class="msg-hint-text">{{ msg.hint }}</text>
              </view>
            </view>
            <image v-if="msg.role === 'user'" class="msg-avatar" :src="userAvatar" mode="aspectFill" />
          </view>

          <!-- 旁白叙事 -->
          <view class="msg-row narrator" v-if="msg.role === 'narrator'">
            <image class="msg-avatar narrator-avatar" :src="narratorAvatar" mode="aspectFill" @error="onNarratorAvatarError" />
            <view class="msg-bubble-wrap narrator-wrap">
              <view class="msg-bubble narrator">
                <text class="msg-narrator-text">{{ msg.text }}</text>
              </view>
              <view class="msg-hint narrator-hint" v-if="msg.hint">
                <text class="msg-hint-icon">💡</text>
                <text class="msg-hint-text">{{ msg.hint }}</text>
              </view>
            </view>
          </view>

          <!-- 任务卡片 -->
          <view :class="['task-card', { completed: isTaskCompleted(msg.task.taskId) }]" v-if="msg.task">
            <view class="task-card-header">
              <text class="task-card-icon">{{ isTaskCompleted(msg.task.taskId) ? '✅' : '📋' }}</text>
              <view class="task-card-info">
                <text class="task-card-title">{{ msg.task.title }}</text>
                <text class="task-card-type">{{ taskTypeLabel(msg.task.type) }}</text>
              </view>
            </view>
            <text class="task-card-desc" v-if="msg.task.description">{{ msg.task.description }}</text>
            <!-- 未完成 -->
            <button class="task-card-btn" @tap="handleTask(msg.task)" v-if="!isTaskCompleted(msg.task.taskId)">去完成</button>
            <!-- 已完成 -->
            <view class="task-card-done" v-else>
              <text class="task-card-done-text">已完成</text>
              <view class="task-card-reward" v-if="getTaskReward(msg.task.taskId)">
                <text class="reward-label">🎁 获得：</text>
                <text class="reward-name">{{ getTaskReward(msg.task.taskId).name }}</text>
              </view>
            </view>
          </view>

          <!-- 选择按钮（分支面板已显示时隐藏，避免重复） -->
          <view class="choice-row" v-if="msg.choices && !showBranchPanel">
            <view class="choice-btn" v-for="ch in msg.choices" :key="ch.id" @tap="handleChoice(ch)">
              {{ ch.label }}
            </view>
          </view>
        </view>

        <!-- 加载指示器 -->
        <view class="typing-indicator" v-if="streaming">
          <view class="typing-dot"></view>
          <view class="typing-dot"></view>
          <view class="typing-dot"></view>
        </view>
      </view>
    </scroll-view>

    <!-- 分支选择面板 -->
    <view class="branch-panel" v-if="showBranchPanel">
      <text class="branch-panel-title">🔀 {{ nodeData.branchPrompt || '请做出选择' }}</text>
      <view class="branch-option" v-for="opt in nodeData.branchOptions" :key="opt.id" @tap="handleChoice(opt)">
        <text class="branch-option-label">{{ opt.label }}</text>
        <text class="branch-option-arrow">▶</text>
      </view>
    </view>

    <!-- 前往下一节（有分支且未选择时隐藏，让用户先选分支） -->
    <view class="next-node-bar" @tap="goToNextNode" v-if="!showBranchPanel">
      <text class="next-node-icon">▶</text>
      <text class="next-node-text">前往下一节</text>
    </view>

    <!-- 结局达成弹窗 -->
    <view class="ending-mask" v-if="showEnding && endingData">
      <view class="ending-modal">
        <text class="ending-title">{{ endingData.title }}</text>
        <image class="ending-image" :src="endingData.endingImage" mode="aspectFill" v-if="endingData.endingImage" />
        <scroll-view scroll-y class="ending-desc-wrap">
          <text class="ending-desc">{{ endingData.description }}</text>
        </scroll-view>

        <!-- 评分区 -->
        <view class="ending-rate" v-if="!ratingSubmitted">
          <text class="ending-rate-title">为这个剧本评分</text>
          <view class="ending-stars">
            <text
              v-for="i in 5" :key="i"
              class="ending-star"
              :class="{ active: i <= userRating }"
              @tap="setRating(i)"
            >{{ i <= userRating ? '★' : '☆' }}</text>
          </view>
          <button class="ending-rate-btn" :disabled="userRating === 0" @tap="submitRating">
            提交评分
          </button>
        </view>
        <view class="ending-rate-done" v-else>
          <text class="ending-rate-done-text">感谢你的评分！</text>
        </view>

        <button class="ending-home-btn" @tap="goHome">返回主页</button>
      </view>
    </view>

    <!-- 输入栏 -->
    <view class="input-bar">
      <input class="chat-input" v-model="inputText" placeholder="输入你想说的话或行动..." confirm-type="send" @confirm="sendMessage" :disabled="streaming" />
      <button class="send-btn" @tap="sendMessage" :disabled="streaming || !inputText.trim()">
        <text>发送</text>
      </button>
    </view>
  </view>
</template>

<script>
import NavBar from '@/components/nav-bar.vue'
import { playApi, scriptApi } from '@/utils/api.js'
import { BASE_URL } from '@/utils/config.js'

export default {
  components: { NavBar },
  data() {
    return {
      progressId: '',
      nodeId: '',
      nodeData: null,
      progressData: null,
      npcName: '',
      userAvatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='35' r='25' fill='%23A5D6A7'/%3E%3Cellipse cx='50' cy='95' rx='38' ry='28' fill='%23A5D6A7'/%3E%3C/svg%3E",
      narratorAvatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='22' fill='%23D7CCC8'/%3E%3Cpath d='M20 85 Q20 55 50 50 Q80 45 80 85' fill='%23D7CCC8'/%3E%3C/svg%3E",
      messages: [],
      inputText: '',
      streaming: false,
      scrollTop: 0,
      showProgress: false,
      showNpcInfo: false,
      selectedItem: null,
      showNextButton: false,
      _nextNodeId: null,
      _branchReady: false,
      showEnding: false,
      endingData: null,
      userRating: 0,
      ratingSubmitted: false,
      _bgAudioCtx: null,
      _arUsed: false
    }
  },
  computed: {
    navTitle() {
      return this.nodeData?.chapterTitle || '剧情体验'
    },
    progressPercent() {
      if (!this.progressData || !this.progressData.totalNodeCount) return 0
      const done = (this.progressData.completedNodeIds?.length || 0)
      return Math.round((done / this.progressData.totalNodeCount) * 100)
    },
    taskPercent() {
      if (!this.progressData || !this.progressData.totalTaskCount) return 0
      const done = (this.progressData.completedTaskIds?.length || 0)
      return Math.round((done / this.progressData.totalTaskCount) * 100)
    },
    availableTasks() {
      if (!this.nodeData?.tasks) return []
      const completed = this.progressData?.completedTaskIds || []
      return this.nodeData.tasks.filter(t => !completed.includes(String(t.taskId)))
    },
    allCurrentTasksDone() {
      if (!this.nodeData?.tasks || this.nodeData.tasks.length === 0) return true
      const completed = this.progressData?.completedTaskIds || []
      return this.nodeData.tasks.every(t => completed.includes(String(t.taskId)))
    },
    hasNextNode() {
      return this.nodeData?.nextNodes?.length > 0
    },
    showBranchPanel() {
      return this.nodeData?.hasBranch
        && this.nodeData?.branchOptions?.length
        && this.allCurrentTasksDone
        && !this._nextNodeId
        && this._branchReady
    }
  },
  onLoad(options) {
    this.progressId = options.progressId
    this.loadNodeAndStart()
  },
  onShow() {
    // 从 AR 等页面返回时，恢复布局并刷新数据
    this._resetLayout()
    if (this.progressId) {
      this.loadNodeAndUpdate()
    }
  },
  onHide() {
    // 离开页面时清理 body 样式，防止 A-Frame 残留影响其他页面
    this._resetLayout()
  },
  onUnload() {
    this.stopSceneAudio()
  },
  methods: {
    _resetLayout() {
      if (!this._arUsed) {
        if (this.streaming) this.streaming = false
        return
      }
      // 从 AR 页面返回后，兜底恢复布局
      // destroyAR 已在 AR 页面 onHide 中执行，这里做最终清理
      const fix = () => {
        try {
          // 1. 移除所有残留的 AR/A-Frame 元素
          document.querySelectorAll('#__ar_scene_root__, .a-canvas, canvas[data-aframe], .a-enter-vr, .a-enter-ar, .a-loading-screen').forEach(el => {
            try { el.remove() } catch (e) {}
          })
          // 2. 停止残留的相机流
          Array.from(document.querySelectorAll('video')).forEach(v => {
            try {
              if (v.srcObject) {
                v.srcObject.getTracks().forEach(t => { try { t.stop() } catch (e) {} })
                v.srcObject = null
              }
              v.pause()
            } catch (e) {}
          })
          // 3. 移除 A-Frame 注入的 <style> 标签
          document.querySelectorAll('style').forEach(s => {
            const txt = s.textContent || ''
            if (txt.includes('a-scene') || txt.includes('a-canvas') || txt.includes('.a-body') ||
                txt.includes('.a-enter-vr') || txt.includes('a-fullscreen') || txt.includes('a-hidden')) {
              try { s.remove() } catch (e) {}
            }
          })
          // 4. 删除 stylesheet 中的 A-Frame 规则
          try {
            for (const sheet of Array.from(document.styleSheets)) {
              if (!sheet.cssRules) continue
              try {
                const toDelete = []
                for (let i = 0; i < sheet.cssRules.length; i++) {
                  const sel = sheet.cssRules[i].selectorText || ''
                  if (sel.includes('a-scene') || sel.includes('a-canvas') || sel.includes('a-entity') ||
                      sel.includes('.a-body') || sel.includes('a-assets') || sel.includes('.a-enter-vr') ||
                      sel.includes('a-fullscreen') || sel.includes('a-hidden') || sel.includes('a-loader')) {
                    toDelete.push(i)
                  }
                }
                for (let i = toDelete.length - 1; i >= 0; i--) {
                  try { sheet.deleteRule(toDelete[i]) } catch (e) {}
                }
              } catch (e) {}
            }
          } catch (e) {}
          // 5. 完全重置 body/html 内联样式和类名
          document.body.style.cssText = ''
          document.body.className = ''
          const html = document.documentElement
          html.style.cssText = ''
          html.className = ''
          html.style.setProperty('overflow', 'auto', 'important')
          // 6. 强制 reflow
          void document.body.offsetHeight
          void html.offsetHeight
          const w = html.clientWidth
          if (w > 0) html.style.fontSize = w / 375 * 20 + 'px'
          window.dispatchEvent(new Event('resize'))
        } catch (e) {}
      }
      fix()
      setTimeout(fix, 100)
      setTimeout(fix, 300)
      if (this.streaming) this.streaming = false
    },
    async loadNodeAndStart() {
      try {
        this.nodeData = await playApi.getCurrentNode(this.progressId)
        this.progressData = await playApi.getProgress(this.progressId)
        this.nodeId = this.nodeData.nodeId
        this.playSceneAudio(this.nodeData.sceneAudio)
        if (this.nodeData.npc) {
          this.npcName = this.nodeData.npc.name
        }
        // 加载历史消息
        await this.loadHistory()
        // 自动触发 AI 开场白
        if (this.messages.length === 0) {
          this.triggerOpening()
        }
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },

    async loadHistory() {
      // 优先从本地缓存恢复（保留完整的 task/hint/choices 结构）
      const key = `chat_${this.progressId}`
      const cached = uni.getStorageSync(key)
      if (cached && Array.isArray(cached) && cached.length > 0) {
        this.messages = cached
      }
      // 再从后端补充可能缺失的消息
      try {
        const npcId = Number(this.nodeData?.npc?.npcId)
        if (npcId) {
          const token = uni.getStorageSync('token')
          const url = `${BASE_URL}/play/${this.progressId}/chat-history/${npcId}`
          const res = await new Promise((resolve, reject) => {
            uni.request({
              url,
              method: 'GET',
              header: { Authorization: `Bearer ${token}` },
              success: (r) => resolve(r.data),
              fail: reject
            })
          })
          if (res.code === 0 && res.data?.messages?.length) {
            // 映射后端字段 content→text，过滤系统通知，去重后补充
            for (const m of res.data.messages) {
              if (m.role === 'system') continue
              const text = m.content || m.text || ''
              if (!text) continue
              const exists = this.messages.some(
                existing => existing.role === m.role && existing.text === text
              )
              if (!exists) {
                this.messages.push({ role: m.role, text })
              }
            }
          }
        }
      } catch (e) {}
      this.saveHistory()
    },

    saveHistory() {
      const key = `chat_${this.progressId}`
      uni.setStorageSync(key, this.messages.slice(-50))
    },

    triggerOpening() {
      if (this.streaming) return
      this.streaming = true
      const token = uni.getStorageSync('token')
      const url = `${BASE_URL}/play/${this.progressId}/opening`

      this._sseRequest(url, {}, (text) => {
        this.parseSSE(text)
        this.streaming = false
        this.ensureHint()
        this.saveHistory()
        this.checkEnding()
        this._branchReady = true
      }, () => {
        if (this.nodeData?.npc?.greeting && this.messages.length === 0) {
          this.messages.push({ role: 'npc', text: this.nodeData.npc.greeting })
        }
        this.streaming = false
        this.ensureHint()
        this.saveHistory()
        this.checkEnding()
        this._branchReady = true
      })
    },

    _sseRequest(url, data, onSuccess, onFail) {
      const token = uni.getStorageSync('token')
      // 使用原生 XMLHttpRequest 确保 SSE 文本不被自动解析
      try {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', url, true)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        xhr.setRequestHeader('Accept', 'text/event-stream')
        xhr.responseType = 'text'
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            onSuccess(xhr.responseText || '')
          } else {
            onFail()
          }
        }
        xhr.onerror = () => onFail()
        xhr.send(JSON.stringify(data))
      } catch (e) {
        onFail()
      }
    },

    async checkEnding() {
      if (this.nodeData?.type === 'ending' && this.nodeData?.ending) {
        try {
          // 调用后端记录结局达成
          const endingId = Number(this.nodeData.ending.endingId)
          const result = await playApi.getEnding(this.progressId, endingId)
          if (result) {
            this.endingData = result
          } else {
            this.endingData = this.nodeData.ending
          }
        } catch (e) {
          this.endingData = this.nodeData.ending
        }
        this.$nextTick(() => { this.showEnding = true })
      }
    },

    sendMessage() {
      const text = this.inputText.trim()
      if (!text || this.streaming) return

      const npcId = Number(this.nodeData?.npc?.npcId)
      const nodeId = Number(this.nodeId)
      if (!npcId || !nodeId) {
        uni.showToast({ title: '请等待场景加载完成', icon: 'none' })
        return
      }

      this.messages.push({ role: 'user', text })
      this.inputText = ''
      this.streaming = true
      this.scrollToBottom()
      this.saveHistory()

      const url = `${BASE_URL}/play/${this.progressId}/chat`

      this._sseRequest(url, { npcId, message: text, nodeId }, (data) => {
        this.parseSSE(data)
        this.streaming = false
        this.ensureHint()
        this.saveHistory()
      }, () => {
        this.streaming = false
        this.ensureHint()
        this.saveHistory()
      })
    },

    parseSSE(text) {
      if (!text) return
      if (typeof text !== 'string') {
        // uni-app 可能自动解析了 JSON 响应（非 SSE 格式）
        if (typeof text === 'object' && text.text) {
          const last = this.messages[this.messages.length - 1]
          if (last && last.role === 'npc') {
            last.text += text.text
          } else {
            this.messages.push({ role: 'npc', text: text.text })
          }
        }
        return
      }
      const lines = text.split('\n')
      let currentEvent = ''
      for (const line of lines) {
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim()
          continue
        }
        if (!line.startsWith('data:')) continue
        try {
          const data = JSON.parse(line.slice(5).trim())
          this.handleSSEEvent(currentEvent, data)
        } catch (e) {}
      }
    },

    handleSSEEvent(eventType, data) {
      if (eventType === 'choice') {
        // AI 触发了分支选项
        const choiceData = { id: data.id, label: data.label }
        const lastMsg = this.messages[this.messages.length - 1]
        if (lastMsg && (!lastMsg.choices || !lastMsg.choices.some(c => c.id === data.id))) {
          if (!lastMsg.choices) lastMsg.choices = []
          lastMsg.choices.push(choiceData)
        } else if (!lastMsg) {
          this.messages.push({ role: 'system', text: '', choices: [choiceData] })
        }
      } else if (eventType === 'task') {
        const taskData = {
          taskId: data.taskId,
          type: data.type,
          title: data.title,
          description: data.description
        }
        const target = this.findLastNpcMessage()
        if (target && (!target.task || target.task.taskId !== data.taskId)) {
          target.task = taskData
        } else if (!target) {
          this.messages.push({ role: 'system', text: '', task: taskData })
        }
        this.loadNodeAndUpdate()
      } else if (eventType === 'done' && data.hint) {
        const lastNpc = this.findLastNpcMessage()
        if (lastNpc) {
          lastNpc.hint = data.hint
        }
      } else if (data.text) {
        let cleanText = data.text.replace(/\[TASK[：:][^\]]*\]?/g, '')
        if (!cleanText) return
        // 检测旁白标记
        let role = 'npc'
        if (cleanText.startsWith('[旁白]')) {
          role = 'narrator'
          cleanText = cleanText.slice(4).trim()
        }
        if (!cleanText) return
        const last = this.messages[this.messages.length - 1]
        if (last && last.role === role) {
          last.text += cleanText
        } else {
          this.messages.push({ role, text: cleanText })
        }
      }
      if (data.options) {
        const last = this.messages[this.messages.length - 1]
        if (last) {
          if (!last.choices) last.choices = []
          last.choices.push(...data.options)
        } else {
          this.messages.push({ role: 'system', text: '', choices: data.options })
        }
      }
      this.scrollToBottom()
    },

    ensureHint() {
      const lastNpc = this.findLastNpcMessage()
      if (!lastNpc) return
      if (lastNpc.hint) return  // 后端已经发了 hint

      // 本地构造提示
      const hints = []
      if (lastNpc.task) {
        hints.push('你可以尝试完成上方出现的任务')
      }
      if (this.nodeData?.hasBranch) {
        hints.push('你需要做出选择来推动剧情发展')
      }
      if (!hints.length) {
        hints.push('继续探索周围环境，与NPC交流获取线索')
      }
      hints.push('输入你想说的话或行动来推进剧情')
      lastNpc.hint = hints.join('；')
    },

    findLastNpcMessage() {
      for (let i = this.messages.length - 1; i >= 0; i--) {
        if (this.messages[i].role === 'npc' || this.messages[i].role === 'narrator') return this.messages[i]
      }
      return null
    },

    async loadNodeAndUpdate() {
      try {
        const oldNodeId = this.nodeId
        this.nodeData = await playApi.getCurrentNode(this.progressId)
        this.progressData = await playApi.getProgress(this.progressId)
        if (this.nodeData?.nodeId) {
          this.nodeId = this.nodeData.nodeId
        }
        if (oldNodeId && this.nodeId && oldNodeId !== this.nodeId) {
          this.playSceneAudio(this.nodeData.sceneAudio)
          // 节点切换时重置状态
          this.showNextButton = false
          this._nextNodeId = null
          this._branchReady = false
        }
        // 节点切换后自动触发新场景的开场叙事
        if (oldNodeId && this.nodeId && oldNodeId !== this.nodeId) {
          this.$nextTick(() => this.triggerOpening())
        }
      } catch (e) {}
    },

    taskTypeLabel(type) {
      const labels = { gps_checkin: 'GPS签到', puzzle: '解谜', photo: '拍照', ar_scan: 'AR扫描' }
      return labels[type] || '任务'
    },
    isTaskCompleted(taskId) {
      // 先检查消息中是否已标记完成
      const msg = this.messages.find(m => m.task && String(m.task.taskId) === String(taskId))
      if (msg?.task?.completed) return true
      // 再检查后端进度数据
      const completed = this.progressData?.completedTaskIds || []
      return completed.includes(String(taskId))
    },
    getTaskReward(taskId) {
      const msg = this.messages.find(m => m.task && m.task.taskId === String(taskId))
      return msg?.task?.reward || null
    },

    handleTask(task) {
      if (task.type === 'gps_checkin') {
        this.gpsCheckin(task)
      } else if (task.type === 'choice') {
        this.submitTask(task)
      } else if (task.type === 'ar_scan') {
        this._arUsed = true
        uni.navigateTo({
          url: `/pages/ar-scan/index?progressId=${this.progressId}&taskId=${task.taskId}&nodeId=${this.nodeId}`
        })
      } else {
        uni.showModal({
          title: task.title,
          editable: task.type === 'puzzle',
          placeholderText: '请输入答案',
          success: (res) => {
            if (res.confirm) {
              this.submitTask(task, res.content)
            }
          }
        })
      }
    },

    async gpsCheckin(task) {
      try {
        const result = await playApi.submitTask(this.progressId, {
          taskId: Number(task.taskId),
          nodeId: Number(this.nodeId)
        })
        if (result.success) {
          this.messages.push({ role: 'system', text: `✅ 任务完成：${task.title}` })
          this.markTaskDone(task, result.reward?.item)
          if (result.nextNodeId) {
            this.showNextButton = true
            this._nextNodeId = result.nextNodeId
          }
          this.progressData = await playApi.getProgress(this.progressId)
          this.notifyTaskComplete(task.title)
        } else {
          uni.showToast({ title: result.message, icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '提交失败，请重试', icon: 'none' })
      }
    },

    async submitTask(task, answer) {
      try {
        const result = await playApi.submitTask(this.progressId, {
          taskId: Number(task.taskId),
          nodeId: Number(this.nodeId),
          answer: answer || undefined
        })
        if (result.success) {
          this.messages.push({ role: 'system', text: `✅ 任务完成：${task.title}` })
          this.markTaskDone(task, result.reward?.item)
          if (result.nextNodeId) {
            this.showNextButton = true
            this._nextNodeId = result.nextNodeId
          }
          this.progressData = await playApi.getProgress(this.progressId)
          this.notifyTaskComplete(task.title)
        } else {
          uni.showToast({ title: result.message || '任务未完成', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '提交失败，请重试', icon: 'none' })
      }
      this.saveHistory()
    },

    markTaskDone(task, reward) {
      const msg = this.messages.find(m => m.task && String(m.task.taskId) === String(task.taskId))
      if (msg) {
        msg.task.completed = true
        if (reward) msg.task.reward = reward
      }
    },

    markTaskDoneFromAR(taskId, reward, nextNodeId) {
      const msg = this.messages.find(m => m.task && String(m.task.taskId) === String(taskId))
      if (msg) {
        msg.task.completed = true
        if (reward) msg.task.reward = reward
      } else {
        this.messages.push({ role: 'system', text: `✅ 任务完成`, task: { taskId: String(taskId), completed: true, reward } })
      }
      this.messages.push({ role: 'system', text: `✅ 任务完成：${reward?.name || 'AR扫描'}` })
      if (nextNodeId) {
        this.showNextButton = true
        this._nextNodeId = nextNodeId
      }
    },

    async goToNextNode() {
      // 检查任务是否全部完成
      if (!this.allCurrentTasksDone) {
        uni.showToast({ title: '当前存在任务未完成', icon: 'none' })
        return
      }
      // 检查分支是否已选择
      if (this.nodeData?.hasBranch && this.nodeData?.branchOptions?.length && !this._nextNodeId) {
        uni.showToast({ title: '请先选择剧情分支', icon: 'none' })
        return
      }
      const nextNodeId = Number(this._nextNodeId || this.nodeData?.nextNodes?.[0])
      if (!nextNodeId) {
        uni.showToast({ title: '没有下一节点', icon: 'none' })
        return
      }
      this.showNextButton = false
      this._nextNodeId = null
      this._branchReady = false
      try {
        await playApi.advanceNode(this.progressId, nextNodeId)
        this.messages = []
        this.saveHistory()
        await this.loadNodeAndUpdate()
      } catch (e) {
        uni.showToast({ title: '推进失败，请重试', icon: 'none' })
      }
    },

    notifyTaskComplete(taskTitle) {
      const npcId = Number(this.nodeData?.npc?.npcId)
      const nodeId = Number(this.nodeId)
      if (!npcId || !nodeId || this.streaming) return
      this.streaming = true
      const token = uni.getStorageSync('token')
      const url = `${BASE_URL}/play/${this.progressId}/chat`
      // 如果所有任务完成且有分支选项，明确告诉AI要触发选择
      let extraHint = ''
      if (this.allCurrentTasksDone && this.nodeData?.hasBranch && this.nodeData?.branchOptions?.length) {
        const optionLabels = this.nodeData.branchOptions.map(o => o.label).join('、')
        extraHint = `当前节点所有任务已全部完成，请引导游客在以下选项中做出选择：${optionLabels}。你必须在回复末尾使用 [CHOICE:选项ID] 标记触发分支选择。`
      }
      this._sseRequest(url, {
        npcId,
        nodeId,
        message: `[系统通知] 游客刚刚完成了任务「${taskTitle}」。请你对此做出反应，夸赞或鼓励游客，并根据当前剧情自然地引导下一步行动。${extraHint}`
      }, (data) => {
        this.parseSSE(data)
        this.streaming = false
        this.ensureHint()
        this.saveHistory()
        this._branchReady = true
      }, () => {
        this.streaming = false
        this.saveHistory()
        this._branchReady = true
      })
    },
    async handleChoice(choice) {
      try {
        const result = await playApi.choose(this.progressId, this.nodeId, choice.id)
        this.messages.push({ role: 'user', text: choice.label })
        if (result.nextNodeId) {
          // 不立即推进节点，记录分支目标，显示"前往下一节"按钮
          this._nextNodeId = result.nextNodeId
          this.showNextButton = true
        }
        uni.showToast({ title: result.message || '选择已提交', icon: 'success' })
      } catch (e) {}
      this.saveHistory()
    },

    setRating(star) {
      this.userRating = star
    },
    async submitRating() {
      if (this.userRating === 0) return
      try {
        const scriptId = this.progressData?.scriptId
        await scriptApi.rate(Number(scriptId), this.userRating)
        this.ratingSubmitted = true
      } catch (e) {
        uni.showToast({ title: e.message || '评分失败', icon: 'none' })
      }
    },
    goHome() {
      uni.switchTab({ url: '/pages/index/index' })
    },

    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = this.scrollTop + 9999
      })
    },
    onNarratorAvatarError() {
      this.narratorAvatar = '/static/logo.png'
    },
    showItemDetail(item) {
      this.selectedItem = item
    },
    formatTime(isoStr) {
      if (!isoStr) return ''
      const d = new Date(isoStr)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },

    // 背景音播放
    playSceneAudio(url) {
      this.stopSceneAudio()
      if (!url) return
      const ctx = uni.createInnerAudioContext()
      ctx.src = url
      ctx.loop = true
      ctx.autoplay = true
      ctx.obeyMuteSwitch = false
      ctx.onError((err) => {
        console.warn('背景音播放失败:', url, err)
      })
      this._bgAudioCtx = ctx
    },
    stopSceneAudio() {
      if (this._bgAudioCtx) {
        try {
          this._bgAudioCtx.stop()
          this._bgAudioCtx.destroy()
        } catch (e) {}
        this._bgAudioCtx = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.play-page {
  height: 100%;
  overflow: hidden;
  background: #F1F8E9;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  position: relative;
}
.page-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  pointer-events: none;
  z-index: 0;
}

/* NPC 信息头 */
.npc-header {
  display: flex;
  align-items: center;
  padding: 16rpx 30rpx;
  background: transparent;
  border-bottom: 1rpx solid rgba(76,175,80,0.12);
  position: relative;
  z-index: 1;
}
.npc-header-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 2rpx solid #A5D6A7;
  margin-right: 16rpx;
  &:active { transform: scale(0.92); opacity: 0.8; }
}
.npc-header-info {
  flex: 1;
}
.npc-header-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2E7D32;
  display: block;
}
.npc-header-scene {
  font-size: 22rpx;
  color: #999;
}

.has-scene {
  .npc-header-name {
    color: #fff;
    text-shadow: 0 1rpx 4rpx rgba(0,0,0,0.4);
  }
  .npc-header-scene {
    color: rgba(255,255,255,0.75);
    text-shadow: 0 1rpx 4rpx rgba(0,0,0,0.4);
  }
  .npc-header-avatar {
    border-color: rgba(255,255,255,0.5);
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.2);
  }
  .npc-header {
    border-bottom-color: rgba(255,255,255,0.1);
  }
}
.header-badge {
  font-size: 36rpx;
  padding: 8rpx;
}

/* 导航栏右侧详情按钮 */
.nav-detail-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rpx 12rpx;
}
.nav-detail-icon {
  font-size: 32rpx;
  line-height: 1;
}
.nav-detail-text {
  font-size: 20rpx;
  color: #fff;
  margin-top: 2rpx;
}

/* 进度面板 */
.progress-panel {
  background: #fff;
  padding: 16rpx 30rpx 20rpx;
  border-bottom: 1rpx solid #E8F5E9;
  position: relative;
  z-index: 1;
}
.progress-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}
.progress-label {
  font-size: 24rpx;
  color: #999;
  flex-shrink: 0;
}
.progress-bar {
  flex: 1;
  height: 10rpx;
  background: #E8F5E9;
  border-radius: 5rpx;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #81C784, #4CAF50);
  border-radius: 5rpx;
  &.task {
    background: linear-gradient(to right, #64B5F6, #2196F3);
  }
}
.progress-num {
  font-size: 22rpx;
  color: #A5D6A7;
  flex-shrink: 0;
}
.panel-sub {
  font-size: 22rpx;
  color: #2E7D32;
  display: block;
  margin: 14rpx 0 10rpx;
}
.item-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}
.item-tag {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 20rpx;
  color: #2E7D32;
  background: #E8F5E9;
  padding: 6rpx 14rpx;
  border-radius: 16rpx;
}
.item-tag-icon {
  width: 28rpx;
  height: 28rpx;
  border-radius: 6rpx;
}

/* 可触发任务 */
.available-task {
  background: #F1F8E9;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 12rpx;
}
.available-task-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6rpx;
}
.available-task-name {
  font-size: 26rpx;
  font-weight: 500;
  color: #2E7D32;
}
.available-task-type {
  font-size: 20rpx;
  background: #4CAF50;
  color: #fff;
  padding: 2rpx 12rpx;
  border-radius: 10rpx;
}
.available-task-desc {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-bottom: 10rpx;
}
.available-task-btn {
  font-size: 24rpx;
  padding: 8rpx 0;
  background: #4CAF50;
  color: #fff;
  border-radius: 24rpx;
  border: none;
  text-align: center;
}

/* 聊天区 */
.chat-scroll {
  flex: 1;
  height: 0;
  padding: 20rpx 30rpx;
  position: relative;
  z-index: 1;
}
.messages {
  padding-bottom: 20rpx;
}
.msg-row {
  display: flex;
  margin-bottom: 28rpx;
  &.user { justify-content: flex-end; }
  &.narrator { justify-content: center; }
}
.msg-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 2rpx solid #A5D6A7;
  flex-shrink: 0;
}
.narrator-avatar {
  border-color: #BCAAA4;
  opacity: 0.85;
}
.msg-bubble-wrap {
  display: flex;
  flex-direction: column;
  max-width: 800rpx;
}
.msg-bubble {
  max-width: 100%;
  padding: 18rpx 24rpx;
  border-radius: 20rpx;
  margin: 0 14rpx;
  &.npc {
    background: #fff;
    border-top-left-radius: 6rpx;
    box-shadow: 0 2rpx 10rpx rgba(76,175,80,0.06);
  }
  &.user {
    background: linear-gradient(135deg, #81C784 0%, #4CAF50 100%);
    border-top-right-radius: 6rpx;
    .msg-text { color: #fff; }
  }
  &.system {
    background: #FFF8E1;
    border-radius: 16rpx;
    max-width: 560rpx;
    margin: 0 auto;
  }
  &.narrator {
    background: rgba(139, 119, 90, 0.12);
    border-radius: 16rpx;
    max-width: 560rpx;
    margin: 0 auto;
  }
}

.has-scene {
  .msg-bubble.npc {
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(4rpx);
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
  }
  .msg-bubble.system {
    background: rgba(255,248,225,0.9);
    backdrop-filter: blur(4rpx);
  }
  .msg-bubble.narrator {
    background: rgba(139, 119, 90, 0.18);
    backdrop-filter: blur(4rpx);
  }
  .narrator-avatar {
    border-color: rgba(255,255,255,0.5);
    opacity: 0.9;
  }
  .progress-panel, .branch-panel {
    background: rgba(255,255,255,0.9);
    border-bottom-color: rgba(255,255,255,0.1);
    backdrop-filter: blur(4rpx);
  }
  .input-bar {
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(4rpx);
    box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.2);
  }
}

/* 行动提示 */
.msg-hint {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
  margin: 10rpx 14rpx 0;
  padding: 14rpx 18rpx;
  background: rgba(243, 248, 255, 0.92);
  border-radius: 12rpx;
  border-left: 4rpx solid #90CAF9;
  backdrop-filter: blur(4rpx);
}
.msg-hint-icon {
  font-size: 22rpx;
  flex-shrink: 0;
  margin-top: 2rpx;
}
.msg-hint-text {
  font-size: 22rpx;
  color: #5C7D9E;
  line-height: 1.5;
}
.narrator-wrap {
  max-width: 560rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.narrator-hint {
  margin: 10rpx 0 0;
  border-left-color: #BCAAA4;
  background: rgba(245, 240, 235, 0.9);
}
.msg-text {
  font-size: 28rpx;
  line-height: 1.7;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'SimSun', '宋体', serif;
}
.msg-narrator-text {
  font-size: 26rpx;
  line-height: 1.8;
  color: #8B775A;
  white-space: pre-wrap;
  word-break: break-all;
  font-style: italic;
  text-align: center;
  display: block;
  font-family: 'SimSun', '宋体', serif;
}

/* 任务卡片 */
.task-card {
  background: #fff;
  border: 2rpx solid #4CAF50;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin: 0 0 24rpx 78rpx;
  box-shadow: 0 2rpx 12rpx rgba(76,175,80,0.08);
}
.task-card-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}
.task-card-icon {
  font-size: 32rpx;
}
.task-card-info {
  flex: 1;
}
.task-card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2E7D32;
  display: block;
}
.task-card-type {
  font-size: 20rpx;
  color: #4CAF50;
  background: #E8F5E9;
  padding: 2rpx 12rpx;
  border-radius: 10rpx;
}
.task-card-desc {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 14rpx;
  display: block;
}
.task-card-btn {
  background: linear-gradient(135deg, #81C784 0%, #4CAF50 100%);
  color: #fff;
  border-radius: 30rpx;
  font-size: 26rpx;
  padding: 12rpx 0;
  border: none;
  text-align: center;
}
.task-card.completed {
  border-color: #C8E6C9;
  background: #F9FEF9;
}
.task-card-done {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}
.task-card-done-text {
  font-size: 26rpx;
  color: #4CAF50;
  font-weight: 500;
}
.task-card-reward {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: #FFF8E1;
  padding: 10rpx 18rpx;
  border-radius: 20rpx;
}
.reward-label {
  font-size: 22rpx;
  color: #F9A825;
}
.reward-name {
  font-size: 24rpx;
  color: #E65100;
  font-weight: 500;
}

/* 选择按钮 */
.choice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin: 0 0 24rpx 78rpx;
}
.choice-btn {
  background: #fff;
  border: 2rpx solid #4CAF50;
  color: #4CAF50;
  padding: 14rpx 24rpx;
  border-radius: 28rpx;
  font-size: 26rpx;
  &:active { background: #4CAF50; color: #fff; }
}

/* 分支选择面板（独立于进度面板） */
.branch-panel {
  background: #fff;
  padding: 20rpx 30rpx 16rpx;
  border-bottom: 2rpx solid #E8F5E9;
  position: relative;
  z-index: 1;
}
.branch-panel-title {
  font-size: 26rpx;
  color: #2E7D32;
  font-weight: 600;
  display: block;
  margin-bottom: 16rpx;
}
/* 分支选择按钮 */
.branch-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  border: 2rpx solid #A5D6A7;
  border-radius: 16rpx;
  margin-bottom: 14rpx;
  cursor: pointer;
  &:active { background: #A5D6A7; }
}
.branch-option-label { font-size: 28rpx; color: #2E7D32; font-weight: 500; }
.branch-option-arrow { font-size: 24rpx; color: #4CAF50; }

/* 输入中动画 */
.typing-indicator {
  display: flex;
  gap: 8rpx;
  padding: 14rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;
  max-width: 120rpx;
  margin-bottom: 20rpx;
}
.typing-dot {
  width: 14rpx;
  height: 14rpx;
  background: #A5D6A7;
  border-radius: 50%;
  animation: typingBounce 1.4s infinite;
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
}
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10rpx); }
}

/* 前往下一节 */
.next-node-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 30rpx;
  background: #FFF8E1;
  background: linear-gradient(135deg, #FFF8E1, #FFF3CD);
  border-top: 2rpx solid #FFE082;
  gap: 12rpx;
  cursor: pointer;
  position: relative;
  z-index: 2;
}
.next-node-icon { font-size: 28rpx; color: #FF9800; line-height: 1; }
.next-node-text { font-size: 30rpx; color: #E65100; font-weight: 600; line-height: 1; }

/* 输入栏 */
.input-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 30rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(76,175,80,0.08);
  position: relative;
  z-index: 1;
}
.chat-input {
  flex: 1;
  height: 72rpx;
  background: #F1F8E9;
  border-radius: 36rpx;
  padding: 0 28rpx;
  font-size: 28rpx;
}
.send-btn {
  margin-left: 16rpx;
  background: linear-gradient(135deg, #81C784 0%, #4CAF50 100%);
  color: #fff;
  border-radius: 36rpx;
  font-size: 26rpx;
  padding: 0 32rpx;
  height: 72rpx;
  line-height: 72rpx;
  border: none;
  &:disabled { opacity: 0.5; }
}

/* 结局弹窗 */
.ending-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.ending-modal {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx 36rpx;
  width: 620rpx;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 12rpx 48rpx rgba(0,0,0,0.25);
  overflow-y: auto;
}
.ending-badge-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
}
.ending-badge-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid #FFD54F;
  margin-bottom: 10rpx;
}
.ending-badge-emoji {
  font-size: 80rpx;
  margin-bottom: 8rpx;
}
.ending-badge-name {
  font-size: 26rpx;
  color: #E65100;
  font-weight: 600;
  background: #FFF8E1;
  padding: 6rpx 24rpx;
  border-radius: 20rpx;
}
.ending-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #2E7D32;
  margin-bottom: 18rpx;
}
.ending-image {
  width: 100%;
  height: 260rpx;
  border-radius: 16rpx;
  margin-bottom: 18rpx;
}
.ending-desc-wrap {
  max-height: 200rpx;
  width: 100%;
  margin-bottom: 24rpx;
}
.ending-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.8;
  text-align: center;
}
.ending-rate {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 24rpx 0;
  border-top: 1rpx solid #F0F0F0;
  border-bottom: 1rpx solid #F0F0F0;
}
.ending-rate-title {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 16rpx;
}
.ending-stars {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
}
.ending-star {
  font-size: 52rpx;
  color: #E0E0E0;
  &:active { transform: scale(1.2); }
  &.active { color: #FFB300; }
}
.ending-rate-btn {
  background: linear-gradient(135deg, #FFB300, #FF9800);
  color: #fff;
  border-radius: 30rpx;
  font-size: 26rpx;
  padding: 14rpx 48rpx;
  border: none;
  &:disabled { opacity: 0.4; }
}
.ending-rate-done {
  padding: 20rpx 0;
  margin-bottom: 16rpx;
}
.ending-rate-done-text {
  font-size: 28rpx;
  color: #4CAF50;
  font-weight: 500;
}
.ending-home-btn {
  width: 100%;
  background: linear-gradient(135deg, #81C784, #4CAF50);
  color: #fff;
  border-radius: 36rpx;
  font-size: 30rpx;
  padding: 18rpx 0;
  border: none;
  text-align: center;
}

/* NPC 详情弹窗 */
.npc-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.npc-modal {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx 36rpx;
  width: 580rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 12rpx 48rpx rgba(0,0,0,0.2);
}
.npc-modal-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 4rpx solid #A5D6A7;
  margin-bottom: 20rpx;
}
.npc-modal-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #2E7D32;
  margin-bottom: 6rpx;
}
.npc-modal-role {
  font-size: 24rpx;
  color: #fff;
  background: #4CAF50;
  padding: 4rpx 20rpx;
  border-radius: 14rpx;
  margin-bottom: 16rpx;
}
.npc-modal-desc {
  font-size: 26rpx;
  color: #666;
  text-align: center;
  line-height: 1.7;
  margin-bottom: 24rpx;
}
.npc-modal-relation {
  width: 100%;
  background: #F1F8E9;
  border-radius: 14rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 28rpx;
}
.npc-modal-relation-header {
  font-size: 24rpx;
  color: #2E7D32;
  margin-bottom: 12rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
}
.relation-icon { font-size: 28rpx; }
.relation-bar-wrap {
  display: flex;
  align-items: center;
  gap: 14rpx;
}
.relation-bar {
  flex: 1;
  height: 14rpx;
  background: #E0E0E0;
  border-radius: 7rpx;
  overflow: hidden;
}
.relation-fill {
  height: 100%;
  background: linear-gradient(to right, #AED581, #4CAF50);
  border-radius: 7rpx;
}
.relation-level {
  font-size: 22rpx;
  color: #4CAF50;
  font-weight: 500;
}
.npc-modal-close {
  font-size: 28rpx;
  color: #4CAF50;
  padding: 16rpx 60rpx;
  border: 2rpx solid #4CAF50;
  border-radius: 36rpx;
  &:active { background: #4CAF50; color: #fff; }
}

/* 道具详情弹窗 */
.item-detail-modal {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx 36rpx;
  width: 580rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 12rpx 48rpx rgba(0,0,0,0.2);
}
.item-detail-icon {
  width: 140rpx;
  height: 140rpx;
  border-radius: 20rpx;
  border: 3rpx solid #FFCC80;
  margin-bottom: 20rpx;
}
.item-detail-icon-placeholder {
  width: 140rpx;
  height: 140rpx;
  border-radius: 20rpx;
  background: #FFF8E1;
  border: 3rpx solid #FFCC80;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  margin-bottom: 20rpx;
}
.item-detail-name {
  font-size: 34rpx;
  font-weight: 700;
  color: #E65100;
  margin-bottom: 6rpx;
}
.item-detail-type {
  font-size: 22rpx;
  color: #fff;
  background: #FF9800;
  padding: 4rpx 20rpx;
  border-radius: 14rpx;
  margin-bottom: 20rpx;
}
.item-detail-desc {
  font-size: 26rpx;
  color: #666;
  text-align: center;
  line-height: 1.7;
  margin-bottom: 20rpx;
  background: #FFF8E1;
  padding: 20rpx 24rpx;
  border-radius: 14rpx;
  width: 100%;
}
.item-detail-meta {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14rpx 0;
  border-top: 1rpx solid #F5F5F5;
}
.item-detail-meta-label {
  font-size: 24rpx;
  color: #999;
}
.item-detail-meta-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}
</style>

<style lang="scss">
/* 聊天区滚动条 - 覆盖 uni-app H5 scroll-view 内部结构 */
uni-scroll-view ::-webkit-scrollbar,
uni-scroll-view::-webkit-scrollbar,
.play-page ::-webkit-scrollbar {
  width: 8rpx !important;
}
uni-scroll-view ::-webkit-scrollbar-thumb,
uni-scroll-view::-webkit-scrollbar-thumb,
.play-page ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.55) !important;
  border-radius: 4rpx !important;
}
uni-scroll-view ::-webkit-scrollbar-track,
uni-scroll-view::-webkit-scrollbar-track,
.play-page ::-webkit-scrollbar-track {
  background: transparent !important;
}
</style>
