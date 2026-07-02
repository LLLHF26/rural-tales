<template>
  <div class="map-picker">
    <div class="map-toolbar">
      <el-input
        v-model="searchText"
        placeholder="搜索地点..."
        size="small"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button :loading="searching" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
      <span class="coord-display">
        {{ modelLng.toFixed(6) }}, {{ modelLat.toFixed(6) }}
      </span>
    </div>
    <div ref="mapEl" class="map-stage"></div>
    <div class="map-hint">点击地图即可选取坐标</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { AMAP_KEY } from '@/config/amap'

const props = defineProps<{ lng: number; lat: number }>()
const emit = defineEmits<{
  (e: 'update:lng', val: number): void
  (e: 'update:lat', val: number): void
}>()

const mapEl = ref<HTMLDivElement>()
const searchText = ref('')
const searching = ref(false)

function valid(v: number) { return v != null && v !== 0 }
const modelLng = ref(valid(props.lng) ? props.lng : 116.397428)
const modelLat = ref(valid(props.lat) ? props.lat : 39.90923)

watch(() => props.lng, (v) => { if (valid(v)) { modelLng.value = v; setMarker(v, modelLat.value) } })
watch(() => props.lat, (v) => { if (valid(v)) { modelLat.value = v; setMarker(modelLng.value, v) } })

let map: any = null
let marker: any = null
let scriptEl: HTMLScriptElement | null = null

function updateCoords(lng: number, lat: number) {
  modelLng.value = lng
  modelLat.value = lat
  emit('update:lng', lng)
  emit('update:lat', lat)
  setMarker(lng, lat)
}

function setMarker(lng: number, lat: number) {
  if (!map) return
  if (marker) {
    marker.setPosition([lng, lat])
  } else {
    marker = new (window as any).AMap.Marker({ position: [lng, lat], draggable: true })
    marker.on('dragend', () => {
      const p = marker.getPosition()
      updateCoords(p.lng, p.lat)
    })
    map.add(marker)
  }
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).AMap) return resolve()
    scriptEl = document.createElement('script')
    scriptEl.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`
    scriptEl.onload = () => resolve()
    scriptEl.onerror = () => reject(new Error('AMap 加载失败'))
    document.head.appendChild(scriptEl)
  })
}

async function initMap() {
  await nextTick()
  if (!mapEl.value) return
  if (AMAP_KEY === 'YOUR_AMAP_KEY') {
    ElMessage.error('请先在 src/config/amap.ts 中配置你的高德地图 Key')
    return
  }
  try {
    await loadScript()
  } catch {
    ElMessage.error('高德地图加载失败，请检查 Key 是否有效')
    return
  }
  const AMap = (window as any).AMap
  map = new AMap.Map(mapEl.value, {
    center: [modelLng.value, modelLat.value],
    zoom: 17,
    lang: 'zh_cn',
    features: ['bg', 'road', 'building', 'point'],
    resizeEnable: true,
    zoomEnable: true,
    dragEnable: true,
    scrollWheel: true,
  })
  map.on('complete', () => {
    map.resize()
    setTimeout(() => map.resize(), 200)
  })
  map.on('click', (e: any) => updateCoords(e.lnglat.lng, e.lnglat.lat))
  if (valid(props.lng) || valid(props.lat)) {
    setMarker(modelLng.value, modelLat.value)
  }
}

async function handleSearch() {
  const keyword = searchText.value.trim()
  if (!keyword || !map) return
  searching.value = true
  try {
    const url = `https://restapi.amap.com/v3/place/text?key=${AMAP_KEY}&keywords=${encodeURIComponent(keyword)}&extensions=all`
    const res = await fetch(url)
    const data = await res.json()
    searching.value = false
    if (data.status === '1' && data.pois && data.pois.length > 0) {
      const poi = data.pois[0]
      const lng = parseFloat(poi.location.split(',')[0])
      const lat = parseFloat(poi.location.split(',')[1])
      updateCoords(lng, lat)
      map.setCenter([lng, lat])
      map.setZoom(17)
      ElMessage.success(`已定位: ${poi.name} — ${poi.address || ''}`)
    } else {
      ElMessage.warning('未找到该地点，请尝试更具体的关键词')
    }
  } catch {
    searching.value = false
    ElMessage.error('搜索失败，请检查网络')
  }
}

onMounted(() => { initMap() })
onUnmounted(() => {
  if (map) { map.destroy(); map = null; marker = null }
  if (scriptEl) { scriptEl.remove(); scriptEl = null }
})
</script>

<style scoped>
.map-picker {
  border: 1px solid var(--tea-300);
  border-radius: 8px;
  overflow: hidden;
}
.map-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--tea-50);
  border-bottom: 1px solid var(--tea-200);
}
.coord-display {
  font-size: 13px;
  color: var(--ink-600);
  font-family: monospace;
  white-space: nowrap;
}
.map-stage {
  width: 100%;
  height: 400px;
}
.map-hint {
  text-align: center;
  font-size: 12px;
  color: var(--ink-400);
  padding: 6px;
  background: var(--tea-50);
  border-top: 1px solid var(--tea-200);
}
</style>
