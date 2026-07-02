"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const utils_config = require("../../utils/config.js");
const NavBar = () => "../../components/nav-bar.js";
const _sfc_main = {
  components: { NavBar },
  data() {
    return {
      progressId: "",
      nodeId: "",
      nodeData: null,
      progressData: null,
      npcName: "",
      userAvatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='35' r='25' fill='%23A5D6A7'/%3E%3Cellipse cx='50' cy='95' rx='38' ry='28' fill='%23A5D6A7'/%3E%3C/svg%3E",
      narratorAvatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='22' fill='%23D7CCC8'/%3E%3Cpath d='M20 85 Q20 55 50 50 Q80 45 80 85' fill='%23D7CCC8'/%3E%3C/svg%3E",
      messages: [],
      inputText: "",
      streaming: false,
      scrollTop: 0,
      showProgress: false,
      showNpcInfo: false,
      selectedItem: null,
      showNextButton: false,
      _nextNodeId: null,
      _showBranchPanel: false,
      showEnding: false,
      endingData: null,
      userRating: 0,
      ratingSubmitted: false,
      _bgAudioCtx: null
    };
  },
  computed: {
    navTitle() {
      var _a;
      return ((_a = this.nodeData) == null ? void 0 : _a.chapterTitle) || "剧情体验";
    },
    progressPercent() {
      var _a;
      if (!this.progressData || !this.progressData.totalNodeCount)
        return 0;
      const done = ((_a = this.progressData.completedNodeIds) == null ? void 0 : _a.length) || 0;
      return Math.round(done / this.progressData.totalNodeCount * 100);
    },
    taskPercent() {
      var _a;
      if (!this.progressData || !this.progressData.totalTaskCount)
        return 0;
      const done = ((_a = this.progressData.completedTaskIds) == null ? void 0 : _a.length) || 0;
      return Math.round(done / this.progressData.totalTaskCount * 100);
    },
    availableTasks() {
      var _a, _b;
      if (!((_a = this.nodeData) == null ? void 0 : _a.tasks))
        return [];
      const completed = ((_b = this.progressData) == null ? void 0 : _b.completedTaskIds) || [];
      return this.nodeData.tasks.filter((t) => !completed.includes(String(t.taskId)));
    },
    allCurrentTasksDone() {
      var _a, _b;
      if (!((_a = this.nodeData) == null ? void 0 : _a.tasks) || this.nodeData.tasks.length === 0)
        return true;
      const completed = ((_b = this.progressData) == null ? void 0 : _b.completedTaskIds) || [];
      return this.nodeData.tasks.every((t) => completed.includes(String(t.taskId)));
    },
    hasNextNode() {
      var _a, _b;
      return ((_b = (_a = this.nodeData) == null ? void 0 : _a.nextNodes) == null ? void 0 : _b.length) > 0;
    }
  },
  onLoad(options) {
    this.progressId = options.progressId;
    this.loadNodeAndStart();
  },
  onUnload() {
    this.stopSceneAudio();
  },
  methods: {
    async loadNodeAndStart() {
      try {
        this.nodeData = await utils_api.playApi.getCurrentNode(this.progressId);
        this.progressData = await utils_api.playApi.getProgress(this.progressId);
        this.nodeId = this.nodeData.nodeId;
        this.playSceneAudio(this.nodeData.sceneAudio);
        if (this.nodeData.npc) {
          this.npcName = this.nodeData.npc.name;
        }
        await this.loadHistory();
        if (this.messages.length === 0) {
          this.triggerOpening();
        }
      } catch (e) {
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    },
    async loadHistory() {
      var _a, _b, _c, _d;
      const key = `chat_${this.progressId}`;
      const cached = common_vendor.index.getStorageSync(key);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        this.messages = cached;
      }
      try {
        const npcId = Number((_b = (_a = this.nodeData) == null ? void 0 : _a.npc) == null ? void 0 : _b.npcId);
        if (npcId) {
          const token = common_vendor.index.getStorageSync("token");
          const url = `${utils_config.BASE_URL}/play/${this.progressId}/chat-history/${npcId}`;
          const res = await new Promise((resolve, reject) => {
            common_vendor.index.request({
              url,
              method: "GET",
              header: { Authorization: `Bearer ${token}` },
              success: (r) => resolve(r.data),
              fail: reject
            });
          });
          if (res.code === 0 && ((_d = (_c = res.data) == null ? void 0 : _c.messages) == null ? void 0 : _d.length)) {
            for (const m of res.data.messages) {
              if (m.role === "system")
                continue;
              const text = m.content || m.text || "";
              if (!text)
                continue;
              const exists = this.messages.some(
                (existing) => existing.role === m.role && existing.text === text
              );
              if (!exists) {
                this.messages.push({ role: m.role, text });
              }
            }
          }
        }
      } catch (e) {
      }
      this.saveHistory();
    },
    saveHistory() {
      const key = `chat_${this.progressId}`;
      common_vendor.index.setStorageSync(key, this.messages.slice(-50));
    },
    triggerOpening() {
      if (this.streaming)
        return;
      this.streaming = true;
      const token = common_vendor.index.getStorageSync("token");
      const url = `${utils_config.BASE_URL}/play/${this.progressId}/opening`;
      common_vendor.index.request({
        url,
        method: "POST",
        header: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream"
        },
        responseType: "text",
        success: (res) => {
          this.parseSSE(res.data || "");
          this.streaming = false;
          this.ensureHint();
          this.saveHistory();
          this.checkEnding();
        },
        fail: () => {
          var _a, _b;
          if (((_b = (_a = this.nodeData) == null ? void 0 : _a.npc) == null ? void 0 : _b.greeting) && this.messages.length === 0) {
            this.messages.push({ role: "npc", text: this.nodeData.npc.greeting });
          }
          this.streaming = false;
          this.ensureHint();
          this.saveHistory();
          this.checkEnding();
        }
      });
    },
    async checkEnding() {
      var _a, _b;
      if (((_a = this.nodeData) == null ? void 0 : _a.type) === "ending" && ((_b = this.nodeData) == null ? void 0 : _b.ending)) {
        try {
          const endingId = Number(this.nodeData.ending.endingId);
          const result = await utils_api.playApi.getEnding(this.progressId, endingId);
          if (result) {
            this.endingData = result;
          } else {
            this.endingData = this.nodeData.ending;
          }
        } catch (e) {
          this.endingData = this.nodeData.ending;
        }
        this.$nextTick(() => {
          this.showEnding = true;
        });
      }
    },
    sendMessage() {
      var _a, _b;
      const text = this.inputText.trim();
      if (!text || this.streaming)
        return;
      const npcId = Number((_b = (_a = this.nodeData) == null ? void 0 : _a.npc) == null ? void 0 : _b.npcId);
      const nodeId = Number(this.nodeId);
      if (!npcId || !nodeId) {
        common_vendor.index.showToast({ title: "请等待场景加载完成", icon: "none" });
        return;
      }
      this.messages.push({ role: "user", text });
      this.inputText = "";
      this.streaming = true;
      this.scrollToBottom();
      this.saveHistory();
      const token = common_vendor.index.getStorageSync("token");
      const url = `${utils_config.BASE_URL}/play/${this.progressId}/chat`;
      common_vendor.index.request({
        url,
        method: "POST",
        header: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream"
        },
        data: { npcId, message: text, nodeId },
        responseType: "text",
        success: (res) => {
          this.parseSSE(res.data || "");
          this.streaming = false;
          this.ensureHint();
          this.saveHistory();
        },
        fail: () => {
          this.streaming = false;
          this.ensureHint();
          this.saveHistory();
        }
      });
    },
    parseSSE(text) {
      if (!text)
        return;
      const lines = text.split("\n");
      let currentEvent = "";
      for (const line of lines) {
        if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
          continue;
        }
        if (!line.startsWith("data:"))
          continue;
        try {
          const data = JSON.parse(line.slice(5).trim());
          this.handleSSEEvent(currentEvent, data);
        } catch (e) {
        }
      }
    },
    handleSSEEvent(eventType, data) {
      if (eventType === "choice") {
        const choiceData = { id: data.id, label: data.label };
        const lastMsg = this.messages[this.messages.length - 1];
        if (lastMsg && (!lastMsg.choices || !lastMsg.choices.some((c) => c.id === data.id))) {
          if (!lastMsg.choices)
            lastMsg.choices = [];
          lastMsg.choices.push(choiceData);
        } else if (!lastMsg) {
          this.messages.push({ role: "system", text: "", choices: [choiceData] });
        }
      } else if (eventType === "task") {
        const taskData = {
          taskId: data.taskId,
          type: data.type,
          title: data.title,
          description: data.description
        };
        const target = this.findLastNpcMessage();
        if (target && (!target.task || target.task.taskId !== data.taskId)) {
          target.task = taskData;
        } else if (!target) {
          this.messages.push({ role: "system", text: "", task: taskData });
        }
        this.loadNodeAndUpdate();
      } else if (eventType === "done" && data.hint) {
        const lastNpc = this.findLastNpcMessage();
        if (lastNpc) {
          lastNpc.hint = data.hint;
        }
      } else if (data.text) {
        let cleanText = data.text.replace(/\[TASK[：:][^\]]*\]?/g, "");
        if (!cleanText)
          return;
        let role = "npc";
        if (cleanText.startsWith("[旁白]")) {
          role = "narrator";
          cleanText = cleanText.slice(4).trim();
        }
        if (!cleanText)
          return;
        const last = this.messages[this.messages.length - 1];
        if (last && last.role === role) {
          last.text += cleanText;
        } else {
          this.messages.push({ role, text: cleanText });
        }
      }
      if (data.options) {
        const last = this.messages[this.messages.length - 1];
        if (last) {
          if (!last.choices)
            last.choices = [];
          last.choices.push(...data.options);
        } else {
          this.messages.push({ role: "system", text: "", choices: data.options });
        }
      }
      this.scrollToBottom();
    },
    ensureHint() {
      var _a;
      const lastNpc = this.findLastNpcMessage();
      if (!lastNpc)
        return;
      if (lastNpc.hint)
        return;
      const hints = [];
      if (lastNpc.task) {
        hints.push("你可以尝试完成上方出现的任务");
      }
      if ((_a = this.nodeData) == null ? void 0 : _a.hasBranch) {
        hints.push("你需要做出选择来推动剧情发展");
      }
      if (!hints.length) {
        hints.push("继续探索周围环境，与NPC交流获取线索");
      }
      hints.push("输入你想说的话或行动来推进剧情");
      lastNpc.hint = hints.join("；");
    },
    findLastNpcMessage() {
      for (let i = this.messages.length - 1; i >= 0; i--) {
        if (this.messages[i].role === "npc" || this.messages[i].role === "narrator")
          return this.messages[i];
      }
      return null;
    },
    async loadNodeAndUpdate() {
      var _a;
      try {
        const oldNodeId = this.nodeId;
        this.nodeData = await utils_api.playApi.getCurrentNode(this.progressId);
        this.progressData = await utils_api.playApi.getProgress(this.progressId);
        if ((_a = this.nodeData) == null ? void 0 : _a.nodeId) {
          this.nodeId = this.nodeData.nodeId;
        }
        if (oldNodeId && this.nodeId && oldNodeId !== this.nodeId) {
          this.playSceneAudio(this.nodeData.sceneAudio);
        }
        if (oldNodeId && this.nodeId && oldNodeId !== this.nodeId && !this.showNextButton) {
          this.$nextTick(() => this.triggerOpening());
        }
      } catch (e) {
      }
    },
    taskTypeLabel(type) {
      const labels = { gps_checkin: "GPS签到", puzzle: "解谜", photo: "拍照", ar_scan: "AR扫描" };
      return labels[type] || "任务";
    },
    isTaskCompleted(taskId) {
      var _a, _b;
      const msg = this.messages.find((m) => m.task && String(m.task.taskId) === String(taskId));
      if ((_a = msg == null ? void 0 : msg.task) == null ? void 0 : _a.completed)
        return true;
      const completed = ((_b = this.progressData) == null ? void 0 : _b.completedTaskIds) || [];
      return completed.includes(String(taskId));
    },
    getTaskReward(taskId) {
      var _a;
      const msg = this.messages.find((m) => m.task && m.task.taskId === String(taskId));
      return ((_a = msg == null ? void 0 : msg.task) == null ? void 0 : _a.reward) || null;
    },
    handleTask(task) {
      if (task.type === "gps_checkin") {
        this.gpsCheckin(task);
      } else if (task.type === "choice") {
        this.submitTask(task);
      } else if (task.type === "ar_scan") {
        common_vendor.index.navigateTo({
          url: `/pages/ar-scan/index?progressId=${this.progressId}&taskId=${task.taskId}&nodeId=${this.nodeId}`
        });
      } else {
        common_vendor.index.showModal({
          title: task.title,
          editable: task.type === "puzzle",
          placeholderText: "请输入答案",
          success: (res) => {
            if (res.confirm) {
              this.submitTask(task, res.content);
            }
          }
        });
      }
    },
    async gpsCheckin(task) {
      var _a;
      try {
        const result = await utils_api.playApi.submitTask(this.progressId, {
          taskId: Number(task.taskId),
          nodeId: Number(this.nodeId)
        });
        if (result.success) {
          this.messages.push({ role: "system", text: `✅ 任务完成：${task.title}` });
          this.markTaskDone(task, (_a = result.reward) == null ? void 0 : _a.item);
          if (result.nextNodeId) {
            this.showNextButton = true;
            this._nextNodeId = result.nextNodeId;
          }
          this.progressData = await utils_api.playApi.getProgress(this.progressId);
          this.notifyTaskComplete(task.title);
        } else {
          common_vendor.index.showToast({ title: result.message, icon: "none" });
        }
      } catch (e) {
        common_vendor.index.showToast({ title: "提交失败，请重试", icon: "none" });
      }
    },
    async submitTask(task, answer) {
      var _a;
      try {
        const result = await utils_api.playApi.submitTask(this.progressId, {
          taskId: Number(task.taskId),
          nodeId: Number(this.nodeId),
          answer: answer || void 0
        });
        if (result.success) {
          this.messages.push({ role: "system", text: `✅ 任务完成：${task.title}` });
          this.markTaskDone(task, (_a = result.reward) == null ? void 0 : _a.item);
          if (result.nextNodeId) {
            this.showNextButton = true;
            this._nextNodeId = result.nextNodeId;
          }
          this.progressData = await utils_api.playApi.getProgress(this.progressId);
          this.notifyTaskComplete(task.title);
        } else {
          common_vendor.index.showToast({ title: result.message || "任务未完成", icon: "none" });
        }
      } catch (e) {
        common_vendor.index.showToast({ title: "提交失败，请重试", icon: "none" });
      }
      this.saveHistory();
    },
    markTaskDone(task, reward) {
      const msg = this.messages.find((m) => m.task && String(m.task.taskId) === String(task.taskId));
      if (msg) {
        msg.task.completed = true;
        if (reward)
          msg.task.reward = reward;
      }
    },
    markTaskDoneFromAR(taskId, reward, nextNodeId) {
      const msg = this.messages.find((m) => m.task && String(m.task.taskId) === String(taskId));
      if (msg) {
        msg.task.completed = true;
        if (reward)
          msg.task.reward = reward;
      } else {
        this.messages.push({ role: "system", text: `✅ 任务完成`, task: { taskId: String(taskId), completed: true, reward } });
      }
      this.messages.push({ role: "system", text: `✅ 任务完成：${(reward == null ? void 0 : reward.name) || "AR扫描"}` });
      if (nextNodeId) {
        this.showNextButton = true;
        this._nextNodeId = nextNodeId;
      }
    },
    async goToNextNode() {
      var _a, _b, _c, _d, _e;
      if (!this.allCurrentTasksDone) {
        common_vendor.index.showToast({ title: "当前存在任务未完成", icon: "none" });
        return;
      }
      if (((_a = this.nodeData) == null ? void 0 : _a.hasBranch) && ((_c = (_b = this.nodeData) == null ? void 0 : _b.branchOptions) == null ? void 0 : _c.length) && !this._nextNodeId) {
        common_vendor.index.showToast({ title: "请先选择剧情分支", icon: "none" });
        return;
      }
      const nextNodeId = Number(this._nextNodeId || ((_e = (_d = this.nodeData) == null ? void 0 : _d.nextNodes) == null ? void 0 : _e[0]));
      if (!nextNodeId) {
        common_vendor.index.showToast({ title: "没有下一节点", icon: "none" });
        return;
      }
      this.showNextButton = false;
      this._nextNodeId = null;
      this._showBranchPanel = false;
      try {
        await utils_api.playApi.advanceNode(this.progressId, nextNodeId);
        this.messages = [];
        this.saveHistory();
        await this.loadNodeAndUpdate();
      } catch (e) {
        common_vendor.index.showToast({ title: "推进失败，请重试", icon: "none" });
      }
    },
    notifyTaskComplete(taskTitle) {
      var _a, _b, _c, _d, _e;
      const npcId = Number((_b = (_a = this.nodeData) == null ? void 0 : _a.npc) == null ? void 0 : _b.npcId);
      const nodeId = Number(this.nodeId);
      if (!npcId || !nodeId || this.streaming)
        return;
      this.streaming = true;
      const token = common_vendor.index.getStorageSync("token");
      const url = `${utils_config.BASE_URL}/play/${this.progressId}/chat`;
      let extraHint = "";
      if (this.allCurrentTasksDone && ((_c = this.nodeData) == null ? void 0 : _c.hasBranch) && ((_e = (_d = this.nodeData) == null ? void 0 : _d.branchOptions) == null ? void 0 : _e.length)) {
        const optionLabels = this.nodeData.branchOptions.map((o) => o.label).join("、");
        extraHint = `当前节点所有任务已全部完成，请引导游客在以下选项中做出选择：${optionLabels}。你必须在回复末尾使用 [CHOICE:选项ID] 标记触发分支选择。`;
      }
      common_vendor.index.request({
        url,
        method: "POST",
        header: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream"
        },
        data: {
          npcId,
          nodeId,
          message: `[系统通知] 游客刚刚完成了任务「${taskTitle}」。请你对此做出反应，夸赞或鼓励游客，并根据当前剧情自然地引导下一步行动。${extraHint}`
        },
        responseType: "text",
        success: (res) => {
          this.parseSSE(res.data || "");
          this.streaming = false;
          this.ensureHint();
          this.saveHistory();
          this.showBranchAfterAI();
        },
        fail: () => {
          this.streaming = false;
          this.saveHistory();
          this.showBranchAfterAI();
        }
      });
    },
    showBranchAfterAI() {
      var _a, _b, _c;
      if (this.allCurrentTasksDone && ((_a = this.nodeData) == null ? void 0 : _a.hasBranch) && ((_c = (_b = this.nodeData) == null ? void 0 : _b.branchOptions) == null ? void 0 : _c.length)) {
        this._showBranchPanel = true;
      }
    },
    async handleChoice(choice) {
      try {
        const result = await utils_api.playApi.choose(this.progressId, this.nodeId, choice.id);
        this.messages.push({ role: "user", text: choice.label });
        if (result.nextNodeId) {
          this._nextNodeId = result.nextNodeId;
          this.showNextButton = true;
        }
        common_vendor.index.showToast({ title: result.message || "选择已提交", icon: "success" });
      } catch (e) {
      }
      this.saveHistory();
    },
    setRating(star) {
      this.userRating = star;
    },
    async submitRating() {
      var _a;
      if (this.userRating === 0)
        return;
      try {
        const scriptId = (_a = this.progressData) == null ? void 0 : _a.scriptId;
        await utils_api.scriptApi.rate(Number(scriptId), this.userRating);
        this.ratingSubmitted = true;
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || "评分失败", icon: "none" });
      }
    },
    goHome() {
      common_vendor.index.switchTab({ url: "/pages/index/index" });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = this.scrollTop + 9999;
      });
    },
    onNarratorAvatarError() {
      this.narratorAvatar = "/static/logo.png";
    },
    showItemDetail(item) {
      this.selectedItem = item;
    },
    formatTime(isoStr) {
      if (!isoStr)
        return "";
      const d = new Date(isoStr);
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },
    // 背景音播放
    playSceneAudio(url) {
      this.stopSceneAudio();
      if (!url)
        return;
      const ctx = common_vendor.index.createInnerAudioContext();
      ctx.src = url;
      ctx.loop = true;
      ctx.autoplay = true;
      ctx.obeyMuteSwitch = false;
      ctx.onError((err) => {
        common_vendor.index.__f__("warn", "at pages/play/index.vue:819", "背景音播放失败:", url, err);
      });
      this._bgAudioCtx = ctx;
    },
    stopSceneAudio() {
      if (this._bgAudioCtx) {
        try {
          this._bgAudioCtx.stop();
          this._bgAudioCtx.destroy();
        } catch (e) {
        }
        this._bgAudioCtx = null;
      }
    }
  }
};
if (!Array) {
  const _component_nav_bar = common_vendor.resolveComponent("nav-bar");
  _component_nav_bar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F;
  return common_vendor.e({
    a: (_a = $data.nodeData) == null ? void 0 : _a.sceneImage
  }, ((_b = $data.nodeData) == null ? void 0 : _b.sceneImage) ? {} : {}, {
    b: common_vendor.o(($event) => $data.showProgress = !$data.showProgress),
    c: common_vendor.p({
      title: $options.navTitle,
      showBack: true,
      bgColor: "#43A047"
    }),
    d: (_c = $data.nodeData) == null ? void 0 : _c.npc
  }, ((_d = $data.nodeData) == null ? void 0 : _d.npc) ? {
    e: $data.nodeData.npc.avatar,
    f: common_vendor.o(($event) => $data.showNpcInfo = true),
    g: common_vendor.t($data.nodeData.npc.name),
    h: common_vendor.o(($event) => $data.showNpcInfo = true)
  } : {}, {
    i: $data.showNpcInfo
  }, $data.showNpcInfo ? common_vendor.e({
    j: (_f = (_e = $data.nodeData) == null ? void 0 : _e.npc) == null ? void 0 : _f.avatar,
    k: common_vendor.t((_h = (_g = $data.nodeData) == null ? void 0 : _g.npc) == null ? void 0 : _h.name),
    l: (_j = (_i = $data.nodeData) == null ? void 0 : _i.npc) == null ? void 0 : _j.role
  }, ((_l = (_k = $data.nodeData) == null ? void 0 : _k.npc) == null ? void 0 : _l.role) ? {
    m: common_vendor.t((_n = (_m = $data.nodeData) == null ? void 0 : _m.npc) == null ? void 0 : _n.role)
  } : {}, {
    n: (_p = (_o = $data.nodeData) == null ? void 0 : _o.npc) == null ? void 0 : _p.description
  }, ((_r = (_q = $data.nodeData) == null ? void 0 : _q.npc) == null ? void 0 : _r.description) ? {
    o: common_vendor.t((_t = (_s = $data.nodeData) == null ? void 0 : _s.npc) == null ? void 0 : _t.description)
  } : {}, {
    p: common_vendor.o(($event) => $data.showNpcInfo = false),
    q: common_vendor.o(() => {
    }),
    r: common_vendor.o(($event) => $data.showNpcInfo = false)
  }) : {}, {
    s: $data.selectedItem
  }, $data.selectedItem ? common_vendor.e({
    t: $data.selectedItem.icon
  }, $data.selectedItem.icon ? {
    v: $data.selectedItem.icon || "/static/logo.png"
  } : {}, {
    w: common_vendor.t($data.selectedItem.name),
    x: $data.selectedItem.type
  }, $data.selectedItem.type ? {
    y: common_vendor.t($data.selectedItem.type)
  } : {}, {
    z: $data.selectedItem.description
  }, $data.selectedItem.description ? {
    A: common_vendor.t($data.selectedItem.description)
  } : {}, {
    B: $data.selectedItem.acquiredAt
  }, $data.selectedItem.acquiredAt ? {
    C: common_vendor.t($options.formatTime($data.selectedItem.acquiredAt))
  } : {}, {
    D: $data.selectedItem.effect
  }, $data.selectedItem.effect ? {
    E: common_vendor.t($data.selectedItem.effect)
  } : {}, {
    F: common_vendor.o(($event) => $data.selectedItem = null),
    G: common_vendor.o(() => {
    }),
    H: common_vendor.o(($event) => $data.selectedItem = null)
  }) : {}, {
    I: $data.showProgress && $data.progressData
  }, $data.showProgress && $data.progressData ? common_vendor.e({
    J: $options.progressPercent + "%",
    K: common_vendor.t(((_u = $data.progressData.completedNodeIds) == null ? void 0 : _u.length) || 0),
    L: common_vendor.t($data.progressData.totalNodeCount || 0),
    M: $options.taskPercent + "%",
    N: common_vendor.t(((_v = $data.progressData.completedTaskIds) == null ? void 0 : _v.length) || 0),
    O: common_vendor.t($data.progressData.totalTaskCount || 0),
    P: $options.availableTasks.length
  }, $options.availableTasks.length ? {
    Q: common_vendor.f($options.availableTasks, (task, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(task.title),
        b: common_vendor.t($options.taskTypeLabel(task.type)),
        c: task.description
      }, task.description ? {
        d: common_vendor.t(task.description)
      } : {}, {
        e: common_vendor.o(($event) => $options.handleTask(task), task.taskId),
        f: task.taskId
      });
    })
  } : {}, {
    R: (_w = $data.progressData.items) == null ? void 0 : _w.length
  }, ((_x = $data.progressData.items) == null ? void 0 : _x.length) ? {
    S: common_vendor.f($data.progressData.items, (item, k0, i0) => {
      return common_vendor.e({
        a: item.icon
      }, item.icon ? {
        b: item.icon
      } : {}, {
        c: common_vendor.t(item.name),
        d: item.itemId || item.name,
        e: common_vendor.o(($event) => $options.showItemDetail(item), item.itemId || item.name)
      });
    })
  } : {}) : {}, {
    T: common_vendor.f($data.messages, (msg, idx, i0) => {
      var _a2, _b2;
      return common_vendor.e({
        a: msg.role !== "system" && msg.role !== "narrator"
      }, msg.role !== "system" && msg.role !== "narrator" ? common_vendor.e({
        b: msg.role === "npc"
      }, msg.role === "npc" ? {
        c: ((_b2 = (_a2 = $data.nodeData) == null ? void 0 : _a2.npc) == null ? void 0 : _b2.avatar) || ""
      } : {}, {
        d: common_vendor.t(msg.text),
        e: common_vendor.n(msg.role),
        f: (msg.role === "npc" || msg.role === "narrator") && msg.hint
      }, (msg.role === "npc" || msg.role === "narrator") && msg.hint ? {
        g: common_vendor.t(msg.hint)
      } : {}, {
        h: msg.role === "user"
      }, msg.role === "user" ? {
        i: $data.userAvatar
      } : {}, {
        j: common_vendor.n(msg.role === "user" ? "user" : msg.role === "narrator" ? "narrator" : "npc")
      }) : {}, {
        k: msg.role === "narrator"
      }, msg.role === "narrator" ? common_vendor.e({
        l: $data.narratorAvatar,
        m: common_vendor.o((...args) => $options.onNarratorAvatarError && $options.onNarratorAvatarError(...args), idx),
        n: common_vendor.t(msg.text),
        o: msg.hint
      }, msg.hint ? {
        p: common_vendor.t(msg.hint)
      } : {}) : {}, {
        q: msg.task
      }, msg.task ? common_vendor.e({
        r: common_vendor.t($options.isTaskCompleted(msg.task.taskId) ? "✅" : "📋"),
        s: common_vendor.t(msg.task.title),
        t: common_vendor.t($options.taskTypeLabel(msg.task.type)),
        v: msg.task.description
      }, msg.task.description ? {
        w: common_vendor.t(msg.task.description)
      } : {}, {
        x: !$options.isTaskCompleted(msg.task.taskId)
      }, !$options.isTaskCompleted(msg.task.taskId) ? {
        y: common_vendor.o(($event) => $options.handleTask(msg.task), idx)
      } : common_vendor.e({
        z: $options.getTaskReward(msg.task.taskId)
      }, $options.getTaskReward(msg.task.taskId) ? {
        A: common_vendor.t($options.getTaskReward(msg.task.taskId).name)
      } : {}), {
        B: common_vendor.n({
          completed: $options.isTaskCompleted(msg.task.taskId)
        })
      }) : {}, {
        C: msg.choices
      }, msg.choices ? {
        D: common_vendor.f(msg.choices, (ch, k1, i1) => {
          return {
            a: common_vendor.t(ch.label),
            b: ch.id,
            c: common_vendor.o(($event) => $options.handleChoice(ch), ch.id)
          };
        })
      } : {}, {
        E: idx
      });
    }),
    U: $data.streaming
  }, $data.streaming ? {} : {}, {
    V: $data.scrollTop,
    W: $data._showBranchPanel && ((_y = $data.nodeData) == null ? void 0 : _y.hasBranch) && ((_A = (_z = $data.nodeData) == null ? void 0 : _z.branchOptions) == null ? void 0 : _A.length) && !$data._nextNodeId
  }, $data._showBranchPanel && ((_B = $data.nodeData) == null ? void 0 : _B.hasBranch) && ((_D = (_C = $data.nodeData) == null ? void 0 : _C.branchOptions) == null ? void 0 : _D.length) && !$data._nextNodeId ? {
    X: common_vendor.t($data.nodeData.branchPrompt || "请做出选择"),
    Y: common_vendor.f($data.nodeData.branchOptions, (opt, k0, i0) => {
      return {
        a: common_vendor.t(opt.label),
        b: opt.id,
        c: common_vendor.o(($event) => $options.handleChoice(opt), opt.id)
      };
    })
  } : {}, {
    Z: common_vendor.o((...args) => $options.goToNextNode && $options.goToNextNode(...args)),
    aa: $data.showEnding && $data.endingData
  }, $data.showEnding && $data.endingData ? common_vendor.e({
    ab: common_vendor.t($data.endingData.title),
    ac: $data.endingData.endingImage
  }, $data.endingData.endingImage ? {
    ad: $data.endingData.endingImage
  } : {}, {
    ae: common_vendor.t($data.endingData.description),
    af: !$data.ratingSubmitted
  }, !$data.ratingSubmitted ? {
    ag: common_vendor.f(5, (i, k0, i0) => {
      return {
        a: common_vendor.t(i <= $data.userRating ? "★" : "☆"),
        b: i,
        c: i <= $data.userRating ? 1 : "",
        d: common_vendor.o(($event) => $options.setRating(i), i)
      };
    }),
    ah: $data.userRating === 0,
    ai: common_vendor.o((...args) => $options.submitRating && $options.submitRating(...args))
  } : {}, {
    aj: common_vendor.o((...args) => $options.goHome && $options.goHome(...args))
  }) : {}, {
    ak: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    al: $data.streaming,
    am: $data.inputText,
    an: common_vendor.o(($event) => $data.inputText = $event.detail.value),
    ao: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    ap: $data.streaming || !$data.inputText.trim(),
    aq: ((_E = $data.nodeData) == null ? void 0 : _E.sceneImage) ? 1 : "",
    ar: ((_F = $data.nodeData) == null ? void 0 : _F.sceneImage) ? "url(" + $data.nodeData.sceneImage + ")" : "none"
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5c0a22ca"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/play/index.js.map
