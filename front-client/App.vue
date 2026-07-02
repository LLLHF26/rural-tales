<script>
	export default {
		globalData: {
			scriptType: null
		},
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
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
