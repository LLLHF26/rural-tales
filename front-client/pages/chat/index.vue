<!-- c:\Users\黄泽民\Desktop\vue\front-client\pages\chat\index.vue -->
<template>
  <view class="chat-page">
    <nav-bar :title="npcName || '对话'" showBack />
    <scroll-view scroll-y class="chat-scroll" :scroll-top="scrollTop" :scroll-with-animation="true">
      <view class="messages">
        <view v-for="(msg, idx) in messages" :key="idx" :class="['msg-row', msg.role]">
          <image v-if="msg.role === 'npc'" class="msg-avatar" :src="npcAvatar" mode="aspectFill" />
          <view :class="['msg-bubble', msg.role]">
            <text class="msg-text">{{ msg.text }}</text>
          </view>
          <image v-if="msg.role === 'user'" class="msg-avatar" :src="userAvatar" mode="aspectFill" />
        </view>
      </view>

      <view class="choice-bar" v-if="choices.length > 0">
        <view class="choice-item" v-for="ch in choices" :key="ch.id" @tap="submitChoice(ch.id)">
          {{ ch.label }}
        </view>
      </view>
    </scroll-view>

    <view class="input-bar">
      <input class="chat-input" v-model="inputText" placeholder="输入你想说的话..." confirm-type="send" @confirm="sendMessage" />
      <button class="send-btn" @tap="sendMessage" :disabled="sending">
        <text v-if="!sending">发送</text>
        <text v-else>...</text>
      </button>
    </view>
  </view>
</template>

<script>
import NavBar from '@/components/nav-bar.vue'
import { playApi } from '@/utils/api.js'
import { BASE_URL } from '@/utils/config.js'

export default {
  components: { NavBar },
  data() {
    return {
      progressId: '',
      npcId: '',
      nodeId: '',
      npcName: '',
      npcAvatar: '',
      userAvatar: '/static/logo.png',
      inputText: '',
      messages: [],
      choices: [],
      sending: false,
      scrollTop: 0
    }
  },
  onLoad(options) {
    this.progressId = options.progressId
    this.npcId = options.npcId
    this.nodeId = options.nodeId
    this.npcName = options.npcName || 'NPC'
    this.npcAvatar = options.npcAvatar || '/static/logo.png'
  },
  methods: {
    async sendMessage() {
      const text = this.inputText.trim()
      if (!text || this.sending) return

      this.messages.push({ role: 'user', text })
      this.inputText = ''
      this.sending = true
      this.scrollToBottom()

      const token = uni.getStorageSync('token')
      const task = uni.request({
        url: `${BASE_URL}/play/${this.progressId}/chat`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream'
        },
        data: { npcId: Number(this.npcId), message: text, nodeId: Number(this.nodeId) },
        responseType: 'text',
        enableChunked: true
      })

      task.onChunkReceived((chunk) => {
        const lines = chunk.data.split('\n')
        for (const line of lines) {
          if (line.startsWith('event:')) {
            continue
          }
          if (line.startsWith('data:')) {
            try {
              const evtData = JSON.parse(line.slice(5).trim())
              this.handleSSEEvent(evtData)
            } catch (e) {}
          }
        }
      })

      task.then(() => {
        this.sending = false
      }).catch(() => {
        this.sending = false
        uni.showToast({ title: '对话失败', icon: 'none' })
      })
    },

    handleSSEEvent(data) {
      if (data.text) {
        const cleanText = data.text.replace(/\[TASK:\d+\]/g, '')
        if (cleanText) {
          const last = this.messages[this.messages.length - 1]
          if (last && last.role === 'npc') {
            last.text += cleanText
          } else {
            this.messages.push({ role: 'npc', text: cleanText })
          }
        }
      }
      if (data.options) {
        this.choices = data.options
      }
      if (data.type === 'task') {
        uni.showToast({ title: `新任务：${data.title}`, icon: 'none' })
      }
      this.scrollToBottom()
    },

    async submitChoice(choiceId) {
      this.choices = []
      try {
        await playApi.choose(this.progressId, this.nodeId, choiceId)
        uni.showToast({ title: '选择已提交', icon: 'success' })
      } catch (e) {}
    },

    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = this.scrollTop + 1
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-page {
  height: 100vh;
  background: #F1F8E9;
  display: flex;
  flex-direction: column;
}
.chat-scroll {
  flex: 1;
  padding: 20rpx 30rpx;
}
.messages {
  padding-bottom: 20rpx;
}
.msg-row {
  display: flex;
  margin-bottom: 30rpx;
  &.user {
    justify-content: flex-end;
  }
}
.msg-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 2rpx solid #A5D6A7;
  flex-shrink: 0;
}
.msg-bubble {
  max-width: 500rpx;
  padding: 20rpx 28rpx;
  border-radius: 24rpx;
  margin: 0 16rpx;
  &.npc {
    background: #fff;
    border-top-left-radius: 6rpx;
    box-shadow: 0 2rpx 10rpx rgba(76,175,80,0.08);
  }
  &.user {
    background: linear-gradient(135deg, #81C784 0%, #4CAF50 100%);
    border-top-right-radius: 6rpx;
    .msg-text { color: #fff; }
  }
}
.msg-text {
  font-size: 28rpx;
  line-height: 1.7;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
}
.choice-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 16rpx 0;
}
.choice-item {
  background: #fff;
  border: 2rpx solid #4CAF50;
  color: #4CAF50;
  padding: 16rpx 28rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  &:active { background: #4CAF50; color: #fff; }
}
.input-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 30rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(76,175,80,0.08);
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
  padding: 0 36rpx;
  height: 72rpx;
  line-height: 72rpx;
  border: none;
  &:disabled { opacity: 0.5; }
}
</style>