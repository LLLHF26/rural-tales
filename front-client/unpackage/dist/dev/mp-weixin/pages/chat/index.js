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
      npcId: "",
      nodeId: "",
      npcName: "",
      npcAvatar: "",
      userAvatar: "/static/logo.png",
      inputText: "",
      messages: [],
      choices: [],
      sending: false,
      scrollTop: 0
    };
  },
  onLoad(options) {
    this.progressId = options.progressId;
    this.npcId = options.npcId;
    this.nodeId = options.nodeId;
    this.npcName = options.npcName || "NPC";
    this.npcAvatar = options.npcAvatar || "/static/logo.png";
  },
  methods: {
    async sendMessage() {
      const text = this.inputText.trim();
      if (!text || this.sending)
        return;
      this.messages.push({ role: "user", text });
      this.inputText = "";
      this.sending = true;
      this.scrollToBottom();
      const token = common_vendor.index.getStorageSync("token");
      const task = common_vendor.index.request({
        url: `${utils_config.BASE_URL}/play/${this.progressId}/chat`,
        method: "POST",
        header: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream"
        },
        data: { npcId: Number(this.npcId), message: text, nodeId: Number(this.nodeId) },
        responseType: "text",
        enableChunked: true
      });
      task.onChunkReceived((chunk) => {
        const lines = chunk.data.split("\n");
        for (const line of lines) {
          if (line.startsWith("event:")) {
            continue;
          }
          if (line.startsWith("data:")) {
            try {
              const evtData = JSON.parse(line.slice(5).trim());
              this.handleSSEEvent(evtData);
            } catch (e) {
            }
          }
        }
      });
      task.then(() => {
        this.sending = false;
      }).catch(() => {
        this.sending = false;
        common_vendor.index.showToast({ title: "对话失败", icon: "none" });
      });
    },
    handleSSEEvent(data) {
      if (data.text) {
        const cleanText = data.text.replace(/\[TASK:\d+\]/g, "");
        if (cleanText) {
          const last = this.messages[this.messages.length - 1];
          if (last && last.role === "npc") {
            last.text += cleanText;
          } else {
            this.messages.push({ role: "npc", text: cleanText });
          }
        }
      }
      if (data.options) {
        this.choices = data.options;
      }
      if (data.type === "task") {
        common_vendor.index.showToast({ title: `新任务：${data.title}`, icon: "none" });
      }
      this.scrollToBottom();
    },
    async submitChoice(choiceId) {
      this.choices = [];
      try {
        await utils_api.playApi.choose(this.progressId, this.nodeId, choiceId);
        common_vendor.index.showToast({ title: "选择已提交", icon: "success" });
      } catch (e) {
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = this.scrollTop + 1;
      });
    }
  }
};
if (!Array) {
  const _component_nav_bar = common_vendor.resolveComponent("nav-bar");
  _component_nav_bar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      title: $data.npcName || "对话",
      showBack: true
    }),
    b: common_vendor.f($data.messages, (msg, idx, i0) => {
      return common_vendor.e({
        a: msg.role === "npc"
      }, msg.role === "npc" ? {
        b: $data.npcAvatar
      } : {}, {
        c: common_vendor.t(msg.text),
        d: common_vendor.n(msg.role),
        e: msg.role === "user"
      }, msg.role === "user" ? {
        f: $data.userAvatar
      } : {}, {
        g: idx,
        h: common_vendor.n(msg.role)
      });
    }),
    c: $data.choices.length > 0
  }, $data.choices.length > 0 ? {
    d: common_vendor.f($data.choices, (ch, k0, i0) => {
      return {
        a: common_vendor.t(ch.label),
        b: ch.id,
        c: common_vendor.o(($event) => $options.submitChoice(ch.id), ch.id)
      };
    })
  } : {}, {
    e: $data.scrollTop,
    f: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    g: $data.inputText,
    h: common_vendor.o(($event) => $data.inputText = $event.detail.value),
    i: !$data.sending
  }, !$data.sending ? {} : {}, {
    j: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    k: $data.sending
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5a559478"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/chat/index.js.map
