<template>
	<view class="npc-avatar" :class="[sizeClass]" @click="$emit('click', npc)">
		<view class="avatar-wrap">
			<image 
				class="avatar-img" 
				:src="npc.avatar" 
				mode="aspectFill"
			></image>
			<view v-if="npc.role" class="role-tag">{{ npc.role }}</view>
		</view>
		<view class="npc-info">
			<text class="npc-name">{{ npc.name }}</text>
			<text v-if="showRelation" class="npc-relation">
				{{ relationLevel }} · {{ relationScore }}
			</text>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'NpcAvatar',
		props: {
			npc: {
				type: Object,
				default: () => ({
					npcId: '',
					name: '未知角色',
					avatar: '',
					role: ''
				})
			},
			size: {
				type: String,
				default: 'normal'
			},
			showRelation: {
				type: Boolean,
				default: false
			},
			relationScore: {
				type: Number,
				default: 0
			},
			relationLevel: {
				type: String,
				default: ''
			}
		},
		computed: {
			sizeClass() {
				return 'size-' + this.size
			}
		}
	}
</script>

<style lang="scss" scoped>
	.npc-avatar {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.avatar-wrap {
		position: relative;
	}
	
	.avatar-img {
		border-radius: 50%;
		border: 4rpx solid $uni-color-primary-light;
		box-shadow: 0 4rpx 16rpx rgba(76, 175, 80, 0.2);
	}
	
	.role-tag {
		position: absolute;
		bottom: -4rpx;
		left: 50%;
		transform: translateX(-50%);
		font-size: 20rpx;
		color: $uni-text-color-inverse;
		background: $uni-color-primary;
		padding: 2rpx 12rpx;
		border-radius: 10rpx;
		white-space: nowrap;
	}
	
	.npc-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 8rpx;
	}
	
	.npc-name {
		font-size: 24rpx;
		font-weight: 500;
		color: $uni-text-color;
	}
	
	.npc-relation {
		font-size: 20rpx;
		color: $uni-text-color-grey;
		margin-top: 2rpx;
	}
	
	.size-small .avatar-img {
		width: 80rpx;
		height: 80rpx;
	}
	
	.size-normal .avatar-img {
		width: 120rpx;
		height: 120rpx;
	}
	
	.size-large .avatar-img {
		width: 160rpx;
		height: 160rpx;
	}
	
	.size-small .npc-name {
		font-size: 20rpx;
	}
	
	.size-small .role-tag {
		font-size: 16rpx;
		padding: 2rpx 8rpx;
	}
	
	.size-large .npc-name {
		font-size: 28rpx;
	}
</style>