"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const NavBar = () => "../../components/nav-bar.js";
const _sfc_main = {
  components: { NavBar },
  data() {
    return {
      keyword: "",
      currentSort: "name",
      villages: [],
      page: 1,
      total: 0,
      loading: false,
      refreshing: false,
      noMore: false,
      userLat: null,
      userLng: null,
      locationType: ""
      // 'gps' | 'ip' | ''
    };
  },
  onLoad() {
    this.loadVillages();
    this.getLocation().then(() => {
      if (this.userLat != null) {
        this.loadVillages(true);
      }
    });
  },
  methods: {
    getLocation() {
      return new Promise((resolve) => {
        common_vendor.index.getLocation({
          type: "gcj02",
          success: (res) => {
            this.userLat = res.latitude;
            this.userLng = res.longitude;
            this.locationType = "gps";
            resolve();
          },
          fail: () => {
            if (typeof navigator !== "undefined" && navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  this.userLat = pos.coords.latitude;
                  this.userLng = pos.coords.longitude;
                  this.locationType = "gps";
                  resolve();
                },
                () => this.ipFallback(resolve),
                { timeout: 8e3, maximumAge: 6e5 }
              );
            } else {
              this.ipFallback(resolve);
            }
          }
        });
      });
    },
    ipFallback(resolve) {
      common_vendor.index.request({
        url: "https://ipapi.co/json/",
        timeout: 5e3,
        success: (res) => {
          if (res.data && res.data.latitude) {
            this.userLat = res.data.latitude;
            this.userLng = res.data.longitude;
            this.locationType = "ip";
          }
          resolve();
        },
        fail: () => resolve()
      });
    },
    async loadVillages(isRefresh) {
      if (this.loading)
        return;
      if (isRefresh) {
        this.page = 1;
        this.noMore = false;
      }
      this.loading = true;
      try {
        const data = await utils_api.villageApi.getList({
          page: this.page,
          pageSize: 10,
          sort: this.currentSort,
          keyword: this.keyword || void 0,
          lat: this.userLat || void 0,
          lng: this.userLng || void 0
        });
        this.villages = isRefresh || this.page === 1 ? data.list : [...this.villages, ...data.list];
        this.total = data.total;
        this.noMore = this.villages.length >= this.total;
      } catch (e) {
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      if (this.loading || this.noMore)
        return;
      this.page++;
      this.loadVillages();
    },
    async onRefresh() {
      this.refreshing = true;
      this.page = 1;
      await this.loadVillages(true);
      this.refreshing = false;
    },
    changeSort(sort) {
      if (this.currentSort === sort)
        return;
      if (sort === "distance" && this.userLat == null) {
        common_vendor.index.showToast({ title: "请先允许定位权限", icon: "none" });
        return;
      }
      this.currentSort = sort;
      this.page = 1;
      this.loadVillages(true);
    },
    onSearch() {
      this.page = 1;
      this.loadVillages(true);
    },
    clearSearch() {
      this.keyword = "";
      this.page = 1;
      this.loadVillages(true);
    },
    goVillage(id) {
      common_vendor.index.navigateTo({ url: `/pages/village-detail/index?id=${id}` });
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
      title: "探索村庄"
    }),
    b: common_vendor.o((...args) => $options.onSearch && $options.onSearch(...args)),
    c: $data.keyword,
    d: common_vendor.o(($event) => $data.keyword = $event.detail.value),
    e: $data.keyword
  }, $data.keyword ? {
    f: common_vendor.o((...args) => $options.clearSearch && $options.clearSearch(...args))
  } : {}, {
    g: common_vendor.o((...args) => $options.onSearch && $options.onSearch(...args)),
    h: $data.currentSort === "name" ? 1 : "",
    i: common_vendor.o(($event) => $options.changeSort("name")),
    j: $data.currentSort === "distance" ? 1 : "",
    k: common_vendor.o(($event) => $options.changeSort("distance")),
    l: $data.currentSort === "scripts" ? 1 : "",
    m: common_vendor.o(($event) => $options.changeSort("scripts")),
    n: $data.locationType === "ip"
  }, $data.locationType === "ip" ? {} : {}, {
    o: common_vendor.f($data.villages, (v, k0, i0) => {
      return common_vendor.e({
        a: v.coverImage,
        b: common_vendor.t(v.name),
        c: common_vendor.t(v.scriptCount),
        d: v.distance != null || v.description
      }, v.distance != null || v.description ? common_vendor.e({
        e: v.distance != null
      }, v.distance != null ? common_vendor.e({
        f: common_vendor.t($data.locationType === "ip" ? "~" : ""),
        g: common_vendor.t(v.distance),
        h: $data.locationType === "ip"
      }, $data.locationType === "ip" ? {} : {}) : {}, {
        i: v.description
      }, v.description ? {
        j: common_vendor.t(v.description)
      } : {}) : {}, {
        k: v.tags && v.tags.length
      }, v.tags && v.tags.length ? {
        l: common_vendor.f(v.tags, (t, k1, i1) => {
          return {
            a: common_vendor.t(t),
            b: t
          };
        })
      } : {}, {
        m: v.villageId,
        n: common_vendor.o(($event) => $options.goVillage(v.villageId), v.villageId)
      });
    }),
    p: $data.loading
  }, $data.loading ? {} : {}, {
    q: !$data.loading && $data.villages.length === 0
  }, !$data.loading && $data.villages.length === 0 ? {} : {}, {
    r: $data.noMore && $data.villages.length > 0
  }, $data.noMore && $data.villages.length > 0 ? {} : {}, {
    s: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    t: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    v: $data.refreshing
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bd435f4a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/village-list/index.js.map
