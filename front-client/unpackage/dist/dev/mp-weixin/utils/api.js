"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("./request.js");
const utils_config = require("./config.js");
const api = {
  get: (url, data) => utils_request.request({ url, method: "GET", data }),
  post: (url, data) => utils_request.request({ url, method: "POST", data }),
  put: (url, data) => utils_request.request({ url, method: "PUT", data }),
  delete: (url, data) => utils_request.request({ url, method: "DELETE", data })
};
const userApi = {
  sendCode: (phone) => utils_request.request({ url: "/user/send-code", method: "POST", data: { phone } }),
  login: (phone, code) => utils_request.request({ url: "/user/login", method: "POST", data: { phone, code } }),
  loginPassword: (phone, password) => utils_request.request({ url: "/user/login-password", method: "POST", data: { phone, password } }),
  setPassword: (phone, code, password) => utils_request.request({ url: "/user/set-password", method: "POST", data: { phone, code, password } }),
  getProfile: () => utils_request.request({ url: "/user/profile" }),
  updateProfile: (data) => utils_request.request({ url: "/user/profile", method: "PUT", data }),
  getMyScripts: (status) => utils_request.request({ url: "/user/scripts", data: { status } }),
  uploadFile: (filePath) => {
    return new Promise((resolve, reject) => {
      const token = common_vendor.index.getStorageSync("token");
      common_vendor.index.uploadFile({
        url: utils_config.BASE_URL + "/upload",
        filePath,
        name: "file",
        header: { Authorization: `Bearer ${token}` },
        success: (res) => {
          const result = JSON.parse(res.data);
          result.code === 0 ? resolve(result.data) : reject(new Error(result.message));
        },
        fail: reject
      });
    });
  }
};
const scriptApi = {
  getList: (params) => utils_request.request({ url: "/scripts", data: params }),
  getDetail: (id) => utils_request.request({ url: `/scripts/${id}` }),
  claim: (id) => utils_request.request({ url: `/scripts/${id}/claim`, method: "POST" }),
  rate: (id, rating) => utils_request.request({ url: `/scripts/${id}/rate?rating=${rating}`, method: "POST" }),
  getRecommend: (limit) => utils_request.request({ url: "/scripts/recommend", data: { limit } })
};
const playApi = {
  getCurrentNode: (progressId) => utils_request.request({ url: `/play/${progressId}/current-node` }),
  getOpening: (progressId) => utils_request.request({ url: `/play/${progressId}/opening`, method: "POST" }),
  getProgress: (progressId) => utils_request.request({ url: `/play/${progressId}/progress` }),
  getItems: (progressId) => utils_request.request({ url: `/play/${progressId}/items` }),
  choose: (progressId, nodeId, choiceId) => utils_request.request({ url: `/play/${progressId}/choose`, method: "POST", data: { nodeId, choiceId } }),
  submitTask: (progressId, data) => utils_request.request({ url: `/play/${progressId}/task/submit`, method: "POST", data }),
  gpsCheckin: (progressId, data) => utils_request.request({ url: `/play/${progressId}/gps-checkin`, method: "POST", data }),
  advanceNode: (progressId, nextNodeId) => utils_request.request({ url: `/play/${progressId}/advance-node`, method: "POST", data: { nextNodeId } }),
  getEnding: (progressId, endingId) => utils_request.request({ url: `/play/${progressId}/ending`, method: "POST", data: { endingId } }),
  arCollect: (progressId, taskId, itemId, nodeId, photoUrl) => utils_request.request({ url: `/ar/${progressId}/ar-collect`, method: "POST", data: { taskId, itemId, nodeId, photoUrl } }),
  arPhoto: (progressId, npcId, photoUrl) => utils_request.request({ url: `/play/${progressId}/ar-photo`, method: "POST", data: { npcId, photoUrl } })
};
const villageApi = {
  getList: (params) => utils_request.request({ url: "/villages", data: params }),
  getDetail: (id) => utils_request.request({ url: `/villages/${id}` })
};
const arApi = {
  getResource: (taskId) => utils_request.request({ url: `/ar/resource/${taskId}` }),
  detect: (taskId, photoUrl) => utils_request.request({ url: "/ar/detect", method: "POST", data: { taskId, photoUrl } })
};
exports.api = api;
exports.arApi = arApi;
exports.playApi = playApi;
exports.scriptApi = scriptApi;
exports.userApi = userApi;
exports.villageApi = villageApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/api.js.map
