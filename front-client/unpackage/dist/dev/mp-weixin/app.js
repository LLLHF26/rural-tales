"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/login/index.js";
  "./pages/login/password.js";
  "./pages/index/index.js";
  "./pages/village-list/index.js";
  "./pages/village-detail/index.js";
  "./pages/script-list/index.js";
  "./pages/script-detail/index.js";
  "./pages/play/index.js";
  "./pages/chat/index.js";
  "./pages/ar-scan/index.js";
  "./pages/my/index.js";
}
const _sfc_main = {
  globalData: {
    scriptType: null
  },
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:7", "App Launch");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:10", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:13", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
