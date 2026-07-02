"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  data() {
    return {
      profile: {},
      tabStatus: "",
      myScripts: [],
      showSetPassword: false,
      pwdPhone: "",
      pwdCode: "",
      pwdNew: "",
      pwdCountdown: 0
    };
  },
  onShow() {
    this.loadProfile();
    this.loadMyScripts();
  },
  methods: {
    async loadProfile() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token)
        return;
      try {
        this.profile = await utils_api.userApi.getProfile();
      } catch (e) {
      }
    },
    async loadMyScripts() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token)
        return;
      try {
        const data = await utils_api.userApi.getMyScripts(this.tabStatus || void 0);
        this.myScripts = data.list || [];
      } catch (e) {
      }
    },
    changeTab(status) {
      this.tabStatus = status;
      this.loadMyScripts();
    },
    goPlay(item) {
      if (item.status === "playing") {
        common_vendor.index.navigateTo({ url: `/pages/play/index?progressId=${item.progressId}` });
      }
    },
    goLogin() {
      const token = common_vendor.index.getStorageSync("token");
      if (token)
        return;
      common_vendor.index.navigateTo({ url: "/pages/login/index" });
    },
    changeAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          try {
            const result = await utils_api.userApi.uploadFile(res.tempFilePaths[0]);
            await utils_api.userApi.updateProfile({ avatar: result.url });
            this.profile.avatar = result.url;
            common_vendor.index.showToast({ title: "头像更新成功", icon: "success" });
          } catch (e) {
          }
        }
      });
    },
    editNickname() {
      common_vendor.index.showModal({
        title: "修改昵称",
        editable: true,
        placeholderText: "请输入新昵称",
        success: async (res) => {
          if (res.confirm && res.content) {
            try {
              await utils_api.userApi.updateProfile({ nickname: res.content });
              this.profile.nickname = res.content;
              common_vendor.index.showToast({ title: "昵称已更新", icon: "success" });
            } catch (e) {
            }
          }
        }
      });
    },
    setPassword() {
      this.pwdPhone = "";
      this.pwdCode = "";
      this.pwdNew = "";
      this.showSetPassword = true;
    },
    sendPwdCode() {
      if (this.pwdCountdown > 0)
        return;
      if (!this.pwdPhone || this.pwdPhone.length !== 11) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      utils_api.userApi.sendCode(this.pwdPhone).catch(() => {
      });
      this.pwdCountdown = 60;
      const timer = setInterval(() => {
        this.pwdCountdown--;
        if (this.pwdCountdown <= 0) {
          clearInterval(timer);
        }
      }, 1e3);
    },
    async doSetPassword() {
      if (!this.pwdPhone || !this.pwdCode || !this.pwdNew) {
        common_vendor.index.showToast({ title: "请填写完整信息", icon: "none" });
        return;
      }
      try {
        await utils_api.userApi.setPassword(this.pwdPhone, this.pwdCode, this.pwdNew);
        this.showSetPassword = false;
        common_vendor.index.showToast({ title: "密码设置成功", icon: "success" });
      } catch (e) {
      }
    },
    logout() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.removeStorageSync("userInfo");
            common_vendor.index.reLaunch({ url: "/pages/login/index" });
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.profile.avatar || "/static/logo.png",
    b: common_vendor.o((...args) => $options.changeAvatar && $options.changeAvatar(...args)),
    c: common_vendor.t($data.profile.nickname || "点击登录"),
    d: common_vendor.o((...args) => $options.goLogin && $options.goLogin(...args)),
    e: $data.profile.phone
  }, $data.profile.phone ? {
    f: common_vendor.t($data.profile.phone)
  } : {}, {
    g: common_vendor.t($data.profile.completedScriptCount || 0),
    h: $data.tabStatus === "" ? 1 : "",
    i: common_vendor.o(($event) => $options.changeTab("")),
    j: $data.tabStatus === "playing" ? 1 : "",
    k: common_vendor.o(($event) => $options.changeTab("playing")),
    l: $data.tabStatus === "completed" ? 1 : "",
    m: common_vendor.o(($event) => $options.changeTab("completed")),
    n: $data.myScripts.length > 0
  }, $data.myScripts.length > 0 ? {
    o: common_vendor.f($data.myScripts, (item, k0, i0) => {
      return {
        a: item.coverImage,
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.progressLabel || (item.status === "playing" ? "进行中" : "已完成")),
        d: item.progressId,
        e: common_vendor.o(($event) => $options.goPlay(item), item.progressId)
      };
    })
  } : {}, {
    p: $data.showSetPassword
  }, $data.showSetPassword ? {
    q: $data.pwdPhone,
    r: common_vendor.o(($event) => $data.pwdPhone = $event.detail.value),
    s: $data.pwdCode,
    t: common_vendor.o(($event) => $data.pwdCode = $event.detail.value),
    v: common_vendor.t($data.pwdCountdown > 0 ? $data.pwdCountdown + "s" : "发送验证码"),
    w: $data.pwdCountdown > 0 ? 1 : "",
    x: common_vendor.o((...args) => $options.sendPwdCode && $options.sendPwdCode(...args)),
    y: $data.pwdNew,
    z: common_vendor.o(($event) => $data.pwdNew = $event.detail.value),
    A: common_vendor.o(($event) => $data.showSetPassword = false),
    B: common_vendor.o((...args) => $options.doSetPassword && $options.doSetPassword(...args))
  } : {}, {
    C: common_vendor.o((...args) => $options.editNickname && $options.editNickname(...args)),
    D: common_vendor.o((...args) => $options.setPassword && $options.setPassword(...args)),
    E: common_vendor.o((...args) => $options.logout && $options.logout(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f97bc692"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/index.js.map
