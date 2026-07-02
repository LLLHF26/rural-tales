"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const ScriptCard = () => "../../components/script-card.js";
const _sfc_main = {
  components: { ScriptCard },
  data() {
    return {
      keyword: "",
      currentSort: "hot",
      currentType: "",
      currentTypeLabel: "类型",
      currentVillageId: null,
      showTypePicker: false,
      list: [],
      page: 1,
      total: 0,
      loading: false,
      refreshing: false,
      noMore: false
    };
  },
  onLoad() {
    this.loadList();
  },
  onShow() {
    const type = getApp().globalData.scriptType;
    const villageId = getApp().globalData.villageId;
    if (type) {
      this.currentType = type;
      const labels = { mystery: "悬疑解谜", history: "历史文化", family: "亲子互动", couple: "情侣探险", team: "团队协作" };
      this.currentTypeLabel = labels[type] || "类型";
      getApp().globalData.scriptType = null;
    }
    if (villageId) {
      this.currentVillageId = villageId;
      getApp().globalData.villageId = null;
    }
    if (type || villageId) {
      this.page = 1;
      this.loadList(true);
    }
  },
  methods: {
    async loadList(isRefresh) {
      if (this.loading)
        return;
      if (isRefresh) {
        this.page = 1;
        this.noMore = false;
      }
      this.loading = true;
      try {
        const data = await utils_api.scriptApi.getList({
          page: this.page,
          pageSize: 10,
          sort: this.currentSort,
          type: this.currentType || void 0,
          villageId: this.currentVillageId || void 0,
          keyword: this.keyword || void 0
        });
        this.list = isRefresh || this.page === 1 ? data.list : [...this.list, ...data.list];
        this.total = data.total;
        this.noMore = this.list.length >= this.total;
      } catch (e) {
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      if (this.loading || this.noMore)
        return;
      this.page++;
      this.loadList();
    },
    async onRefresh() {
      this.refreshing = true;
      this.page = 1;
      await this.loadList(true);
      this.refreshing = false;
    },
    changeSort(sort) {
      if (this.currentSort === sort)
        return;
      this.currentSort = sort;
      this.page = 1;
      this.loadList(true);
    },
    selectType(type) {
      this.currentType = type;
      const labels = { mystery: "悬疑解谜", history: "历史文化", family: "亲子互动", couple: "情侣探险", team: "团队协作" };
      this.currentTypeLabel = type ? labels[type] : "类型";
      this.showTypePicker = false;
      this.page = 1;
      this.loadList(true);
    },
    onSearch() {
      this.page = 1;
      this.loadList(true);
    },
    clearSearch() {
      this.keyword = "";
      this.page = 1;
      this.loadList(true);
    },
    goDetail(id) {
      common_vendor.index.navigateTo({ url: `/pages/script-detail/index?id=${id}` });
    }
  }
};
if (!Array) {
  const _component_script_card = common_vendor.resolveComponent("script-card");
  _component_script_card();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.onSearch && $options.onSearch(...args)),
    b: $data.keyword,
    c: common_vendor.o(($event) => $data.keyword = $event.detail.value),
    d: $data.keyword
  }, $data.keyword ? {
    e: common_vendor.o((...args) => $options.clearSearch && $options.clearSearch(...args))
  } : {}, {
    f: common_vendor.o((...args) => $options.onSearch && $options.onSearch(...args)),
    g: $data.currentSort === "hot" ? 1 : "",
    h: common_vendor.o(($event) => $options.changeSort("hot")),
    i: $data.currentSort === "newest" ? 1 : "",
    j: common_vendor.o(($event) => $options.changeSort("newest")),
    k: $data.currentSort === "rating" ? 1 : "",
    l: common_vendor.o(($event) => $options.changeSort("rating")),
    m: common_vendor.t($data.currentTypeLabel || "类型"),
    n: !!$data.currentType ? 1 : "",
    o: common_vendor.o(($event) => $data.showTypePicker = true),
    p: common_vendor.f($data.list, (item, k0, i0) => {
      return {
        a: item.scriptId,
        b: common_vendor.o(($event) => $options.goDetail(item.scriptId), item.scriptId),
        c: "c761630b-0-" + i0,
        d: common_vendor.p({
          data: item
        })
      };
    }),
    q: $data.loading
  }, $data.loading ? {} : {}, {
    r: !$data.loading && $data.list.length === 0
  }, !$data.loading && $data.list.length === 0 ? {} : {}, {
    s: $data.noMore
  }, $data.noMore ? {} : {}, {
    t: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    v: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    w: $data.refreshing,
    x: $data.showTypePicker
  }, $data.showTypePicker ? {
    y: common_vendor.o(($event) => $data.showTypePicker = false),
    z: $data.currentType === "" ? 1 : "",
    A: common_vendor.o(($event) => $options.selectType("")),
    B: $data.currentType === "mystery" ? 1 : "",
    C: common_vendor.o(($event) => $options.selectType("mystery")),
    D: $data.currentType === "history" ? 1 : "",
    E: common_vendor.o(($event) => $options.selectType("history")),
    F: $data.currentType === "family" ? 1 : "",
    G: common_vendor.o(($event) => $options.selectType("family")),
    H: $data.currentType === "couple" ? 1 : "",
    I: common_vendor.o(($event) => $options.selectType("couple")),
    J: $data.currentType === "team" ? 1 : "",
    K: common_vendor.o(($event) => $options.selectType("team")),
    L: common_vendor.o(() => {
    }),
    M: common_vendor.o(($event) => $data.showTypePicker = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c761630b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/script-list/index.js.map
