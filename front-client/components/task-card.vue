<template>
	<view class="task-card" :class="[statusClass]">
		<view class="task-header">
			<view class="task-type">
				<text class="type-icon">{{ typeIcon }}</text>
				<text class="type-label">{{ typeLabel }}</text>
			</view>
			<view v-if="task.completed" class="completed-badge">
				<text>✓ 已完成</text>
			</view>
			<view v-else-if="task.active" class="active-badge">
				<text>进行中</text>
			</view>
		</view>
		
		<view class="task-body">
			<text class="task-title">{{ task.title }}</text>
			<text class="task-desc">{{ task.description }}</text>
		</view>
		
		<view v-if="task.type === 'gps_checkin' && task.targetGps" class="task-gps">
			<view class="gps-info">
				<text class="gps-label">📍 签到范围</text>
				<text class="gps-value">半径 {{ task.targetGps.radius }}m</text>
			</view>
			<view class="btn-action" @click="$emit('gpsCheckin', task)">
				<text>签到打卡</text>
			</view>
		</view>
		
		<view v-if="task.type === 'puzzle'" class="task-puzzle">
			<view class="puzzle-input-wrap">
				<input 
					class="puzzle-input" 
					v-model="answer" 
					placeholder="请输入你的答案..."
				/>
				<view class="btn-action" @click="submitAnswer">
					<text>提交答案</text>
				</view>
			</view>
		</view>
		
		<view v-if="task.type === 'photo'" class="task-photo">
			<view class="photo-actions">
				<view class="btn-action" @click="$emit('takePhoto', task)">
					<text>📷 拍照</text>
				</view>
				<view class="btn-action" @click="$emit('uploadPhoto', task)">
					<text>📁 上传</text>
				</view>
			</view>
		</view>
		
		<view v-if="task.type === 'ar_scan'" class="task-ar">
			<view class="btn-action ar-btn" @click="$emit('startAR', task)">
				<text>📱 开始AR扫描</text>
			</view>
		</view>
		
		<view v-if="taskReward" class="task-reward">
			<view class="reward-item">
				<image class="reward-icon" :src="taskReward.icon" mode="aspectFill"></image>
				<view class="reward-info">
					<text class="reward-name">{{ taskReward.name }}</text>
					<text class="reward-desc">{{ taskReward.description }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'TaskCard',
		props: {
			task: {
				type: Object,
				required: true
			},
			taskReward: {
				type: Object,
				default: null
			}
		},
		data() {
			return {
				answer: ''
			}
		},
		computed: {
			statusClass() {
				if (this.task.completed) return 'task-completed'
				if (this.task.active) return 'task-active'
				return ''
			},
			typeIcon() {
				const map = {
					'gps_checkin': '📍',
					'puzzle': '🧩',
					'photo': '📷',
					'ar_scan': '📱'
				}
				return map[this.task.type] || '📋'
			},
			typeLabel() {
				const map = {
					'gps_checkin': 'GPS签到',
					'puzzle': '谜题解谜',
					'photo': '拍照任务',
					'ar_scan': 'AR扫描'
				}
				return map[this.task.type] || '任务'
			}
		},
		methods: {
			submitAnswer() {
				if (!this.answer.trim()) {
					uni.showToast({ title: '请输入答案', icon: 'none' })
					return
				}
				this.$emit('submitAnswer', { task: this.task, answer: this.answer })
				this.answer = ''
			}
		}
	}
</script>

<style lang="scss" scoped>
	.task-card {
		background: $uni-bg-color;
		border-radius: 20rpx;
		padding: 28rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(76, 175, 80, 0.08);
		border: 2rpx solid transparent;
		transition: all 0.3s;
	}
	
	.task-active {
		border-color: $uni-color-primary;
		box-shadow: 0 4rpx 24rpx rgba(76, 175, 80, 0.2);
	}
	
	.task-completed {
		opacity: 0.7;
		background: $uni-bg-color-hover;
	}
	
	.task-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}
	
	.task-type {
		display: flex;
		align-items: center;
	}
	
	.type-icon {
		font-size: 32rpx;
		margin-right: 8rpx;
	}
	
	.type-label {
		font-size: 24rpx;
		color: $uni-text-color-grey;
		background: $uni-bg-color-hover;
		padding: 4rpx 16rpx;
		border-radius: 10rpx;
	}
	
	.completed-badge {
		font-size: 22rpx;
		color: $uni-color-success;
		background: #E8F5E9;
		padding: 6rpx 16rpx;
		border-radius: 10rpx;
	}
	
	.active-badge {
		font-size: 22rpx;
		color: $uni-color-primary;
		background: $uni-bg-color-hover;
		padding: 6rpx 16rpx;
		border-radius: 10rpx;
	}
	
	.task-body {
		margin-bottom: 20rpx;
	}
	
	.task-title {
		display: block;
		font-size: 30rpx;
		font-weight: bold;
		color: $uni-text-color;
		margin-bottom: 8rpx;
	}
	
	.task-desc {
		display: block;
		font-size: 26rpx;
		color: $uni-text-color-grey;
		line-height: 1.6;
	}
	
	.task-gps {
		.gps-info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			background: $uni-bg-color-hover;
			padding: 16rpx 20rpx;
			border-radius: 12rpx;
			margin-bottom: 16rpx;
		}
		
		.gps-label {
			font-size: 24rpx;
			color: $uni-text-color;
		}
		
		.gps-value {
			font-size: 24rpx;
			color: $uni-text-color-grey;
		}
	}
	
	.task-puzzle {
		.puzzle-input-wrap {
			display: flex;
			align-items: center;
			gap: 16rpx;
		}
		
		.puzzle-input {
			flex: 1;
			height: 72rpx;
			border: 2rpx solid $uni-border-color;
			border-radius: 12rpx;
			padding: 0 20rpx;
			font-size: 28rpx;
			color: $uni-text-color;
			background: $uni-bg-color-grey;
		}
	}
	
	.task-photo {
		.photo-actions {
			display: flex;
			gap: 20rpx;
		}
	}
	
	.task-ar {
		display: flex;
		justify-content: center;
	}
	
	.ar-btn {
		width: 100%;
		justify-content: center;
	}
	
	.btn-action {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16rpx 32rpx;
		background: linear-gradient(135deg, $uni-color-primary 0%, $uni-color-primary-dark 100%);
		border-radius: 40rpx;
		color: white;
		font-size: 26rpx;
		font-weight: 500;
		box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
		
		&:active {
			opacity: 0.8;
			transform: scale(0.98);
		}
	}
	
	.task-reward {
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid $uni-border-color;
	}
	
	.reward-item {
		display: flex;
		align-items: center;
	}
	
	.reward-icon {
		width: 72rpx;
		height: 72rpx;
		border-radius: 14rpx;
		margin-right: 16rpx;
		background: $uni-bg-color-hover;
	}
	
	.reward-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	
	.reward-name {
		font-size: 26rpx;
		font-weight: 500;
		color: $uni-color-primary-dark;
	}
	
	.reward-desc {
		font-size: 22rpx;
		color: $uni-text-color-grey;
		margin-top: 4rpx;
	}
</style>