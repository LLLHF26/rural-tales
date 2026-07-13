<script>
	function cleanAFrame() {
	  if (typeof document === 'undefined') return
	  try {
	    // 移除 A-Frame 残留 DOM
	    document.querySelectorAll('#__ar_scene_root__, .a-canvas, canvas[data-aframe], .a-enter-vr, .a-enter-ar, .a-loading-screen').forEach(el => {
	      try { el.remove() } catch (e) {}
	    })
	    // 移除 A-Frame 注入的 <style> 标签（包含 a-scene/a-body 等关键字）
	    document.querySelectorAll('style').forEach(s => {
	      const txt = s.textContent || ''
	      if (txt.includes('a-scene') || txt.includes('.a-body') || txt.includes('a-canvas') || txt.includes('a-entity')) {
	        try { s.remove() } catch (e) {}
	      }
	    })
	    // 重置 A-Frame 添加的 body/html 内联样式和类名
	    // 保留 App.vue 全局 CSS 中 html{overflow:hidden} 的规则，不覆盖它
	    document.body.style.cssText = ''
	    document.body.className = ''
	    document.documentElement.className = ''
	    // 清除 html 上 A-Frame 设的 width/height/position 等内联样式，但保留 overflow
	    const htmlStyle = document.documentElement.style
	    htmlStyle.removeProperty('width')
	    htmlStyle.removeProperty('height')
	    htmlStyle.removeProperty('position')
	  } catch (e) {}
	}

	export default {
		globalData: {
			scriptType: null
		},
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
			// 全局兜底：清理 A-Frame 残留
			cleanAFrame()
			setTimeout(cleanAFrame, 200)
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
		html, body, page { height: 100%; overflow: hidden; }
		view, scroll-view, image, text, input, button { box-sizing: border-box; }
		.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.ellipsis-2 { overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
	.flex { display: flex; align-items: center; }
	.flex-between { display: flex; justify-content: space-between; align-items: center; }
	.flex-wrap { display: flex; flex-wrap: wrap; }
</style>
