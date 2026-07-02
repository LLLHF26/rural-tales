"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("./config.js");
const request = (options) => {
  const token = common_vendor.index.getStorageSync("token");
  const header = {
    "Content-Type": "application/json",
    ...token && { Authorization: `Bearer ${token}` }
  };
  let data = options.data;
  if (data) {
    const clean = {};
    Object.keys(data).forEach((k) => {
      const v = data[k];
      if (v !== null && v !== void 0 && v !== "")
        clean[k] = v;
    });
    data = clean;
  }
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: utils_config.BASE_URL + options.url,
      method: options.method || "GET",
      data,
      header,
      timeout: 8e3,
      success: (res) => {
        const { code, message, data: data2, detail } = res.data;
        if (detail && detail.code) {
          if (detail.code === 1002) {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.reLaunch({ url: "/pages/login/index" });
            reject(new Error(detail.message || "请先登录"));
            return;
          }
          common_vendor.index.showToast({ title: detail.message || "请求失败", icon: "none" });
          reject(new Error(detail.message));
          return;
        }
        if (code === 0) {
          resolve(data2);
        } else if (code === 1002) {
          common_vendor.index.removeStorageSync("token");
          common_vendor.index.reLaunch({ url: "/pages/login/index" });
          reject(new Error(message || "请先登录"));
        } else {
          common_vendor.index.showToast({ title: message || "请求失败", icon: "none" });
          reject(new Error(message));
        }
      },
      fail: (err) => {
        common_vendor.index.showToast({ title: "网络异常，请重试", icon: "none" });
        reject(err);
      }
    });
  });
};
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
