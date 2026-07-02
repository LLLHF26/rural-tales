"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  data() {
    return { detail: null };
  },
  onLoad(options) {
    this.loadDetail(options.id);
  },
  methods: {
    async loadDetail(id) {
      try {
        this.detail = await utils_api.scriptApi.getDetail(id);
      } catch (e) {
      }
    },
    async startPlay() {
      try {
        const data = await utils_api.scriptApi.claim(this.detail.scriptId);
        common_vendor.index.navigateTo({ url: `/pages/play/index?progressId=${data.progressId}` });
      } catch (e) {
      }
    },
    continuePlay() {
      common_vendor.index.navigateTo({ url: `/pages/play/index?progressId=${this.detail.activeProgressId}` });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.detail
  }, $data.detail ? common_vendor.e({
    b: $data.detail.coverImage,
    c: common_vendor.t($data.detail.title),
    d: common_vendor.t($data.detail.rating),
    e: common_vendor.t($data.detail.ratingCount),
    f: common_vendor.t($data.detail.experienceCount),
    g: common_vendor.t($data.detail.villageName || "未知"),
    h: common_vendor.t($data.detail.typeLabel),
    i: common_vendor.t($data.detail.estimatedDuration),
    j: common_vendor.f(5, (i, k0, i0) => {
      return {
        a: i,
        b: i <= $data.detail.difficulty ? "#4CAF50" : "#E0E0E0"
      };
    }),
    k: common_vendor.t($data.detail.storyline),
    l: common_vendor.f($data.detail.npcs, (npc, k0, i0) => {
      return {
        a: npc.avatar,
        b: common_vendor.t(npc.name),
        c: common_vendor.t(npc.role),
        d: common_vendor.t(npc.description),
        e: npc.npcId
      };
    }),
    m: $data.detail.endings && $data.detail.endings.length
  }, $data.detail.endings && $data.detail.endings.length ? {
    n: common_vendor.t($data.detail.endings.filter((e) => e.unlocked).length),
    o: common_vendor.t($data.detail.endings.length),
    p: common_vendor.f($data.detail.endings, (e, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(e.unlocked ? "🏆" : "🔒"),
        b: common_vendor.t(e.title),
        c: e.description
      }, e.description ? {
        d: common_vendor.t(e.description)
      } : {}, {
        e: e.endingId,
        f: e.unlocked ? 1 : ""
      });
    })
  } : {}, {
    q: common_vendor.t($data.detail.chapterCount),
    r: common_vendor.t($data.detail.endingCount),
    s: common_vendor.t(($data.detail.completionRate * 100).toFixed(0)),
    t: !$data.detail.activeProgressId
  }, !$data.detail.activeProgressId ? {
    v: common_vendor.o((...args) => $options.startPlay && $options.startPlay(...args))
  } : {
    w: common_vendor.o((...args) => $options.continuePlay && $options.continuePlay(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-21ec4b6c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/script-detail/index.js.map
