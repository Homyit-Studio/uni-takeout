<template>
  <view class="ProductDetailIndex">
    <view class="nav-bar" :style="{ top: statusBarHeight + 'px' }" :class="{ scrolled: isScrolled }">
      <view class="back-btn" @click="handleBack">
        <uni-icons :type="backIcon" color="#000" size="24" />
      </view>
    </view>
    <!-- 商品分类选项卡 -->
    <!-- 商品主图 -->
    <view class="product-image">
      <image :src="currentProductData.image" mode="scaleToFill" />
      <view class="countdown">剩余时间：{{ formatTime }}</view>
    </view>

    <!-- 商品缩略图滚动 -->
    <scroll-view class="thumbnail-scroll" scroll-x>
      <view class="thumbnail-list">
        <view v-for="(item, index) in products" :key="index" class="thumbnail-item"
          :class="{ active: currentProduct === index }" @click="switchProduct(index)">
          <image :src="item.image" mode="aspectFill" class="thumb-image" />
        </view>
      </view>
    </scroll-view>

    <!-- 商品信息 -->
    <view class="product-info">
      <h2>{{ currentProductData.title }}</h2>
      <view class="sales-info">已拼{{ currentProductData.sales }}份</view>
      <view class="price">
        <span class="current">拼团价 ¥{{ currentProductData.groupPrice }}</span>
        <span class="original">原价 ¥{{ currentProductData.originalPrice }}</span>
      </view>
      <view class="group-status">
        已有{{ joinedUsers.length }}人参团，还差{{ currentProductData.groupSize - joinedUsers.length }}人成团
      </view>
      <view class="progress-bar">
        <view class="progress" :style="{ width: progressPercentage }"></view>
      </view>
    </view>

    <!-- 修改后的滚动提示 -->
    <view class="scrolling-alert">
      <view class="scroll-container">
        <transition-group name="fade-slide" tag="view" class="scroll-content">
          <view v-for="(message, index) in visibleMessages" :key="message" class="scroll-item">
            {{ message }} 最近{{ recentJoinCount }}人正在拼团...
          </view>
        </transition-group>
      </view>
    </view>

    <!-- 参团用户 -->
    <view class="joined-users">
      <view class="user-list">
        <view v-for="user in joinedUsers" :key="user.id" class="user-item">
          <image :src="user.avatar" mode="scaleToFill" class="user-image" />
          <view>{{ user.name }}</view>
        </view>
        <view v-for="n in remainingSlots" :key="'empty' + n" class="user-item empty">
          <view class="empty-avatar"></view>
          <view>待加入</view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="join-button">立即参团 ¥{{ currentProductData.groupPrice }}</button>
      <button class="share-button">单独购买 ¥{{ currentProductData.originalPrice }}</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 商品数据
const products = ref([
  {
    title: '超值3人套餐',
    originalPrice: 98,
    groupPrice: 68,
    groupSize: 5,
    remainingTime: 3600,
    image: 'https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg',
    sales: 1234
  },
  {
    title: '豪华5人套餐',
    originalPrice: 158,
    groupPrice: 108,
    groupSize: 3,
    remainingTime: 2700,
    image: 'https://qcloud.dpfile.com/pc/S1Yt03ZHevIEbvb3fhAy67V74qWD5ZJURHvRhFUOlP2YaCqE8KEE8D3jXlKeA1a95g_3Oo7Z9EXqcoVvW9arsw.jpg',
    sales: 567
  },
  {
    title: '超值工作餐',
    originalPrice: 28,
    groupPrice: 19.9,
    groupSize: 10,
    remainingTime: 1800,
    image: 'https://qcloud.dpfile.com/pc/wU3rvxK40IRQSH-ME1GftzbPAzUEH2TKcu_Umu2cXIBUnUZhRs1BQ-3fNG1nS2hQ5g_3Oo7Z9EXqcoVvW9arsw.jpg',
    sales: 2987
  },
  {
    title: '超值3人套餐',
    originalPrice: 98,
    groupPrice: 68,
    groupSize: 5,
    remainingTime: 3600,
    image: 'https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg',
    sales: 1234
  },
  {
    title: '豪华5人套餐',
    originalPrice: 158,
    groupPrice: 108,
    groupSize: 3,
    remainingTime: 2700,
    image: 'https://qcloud.dpfile.com/pc/S1Yt03ZHevIEbvb3fhAy67V74qWD5ZJURHvRhFUOlP2YaCqE8KEE8D3jXlKeA1a95g_3Oo7Z9EXqcoVvW9arsw.jpg',
    sales: 567
  },
  {
    title: '超值工作餐',
    originalPrice: 28,
    groupPrice: 19.9,
    groupSize: 10,
    remainingTime: 1800,
    image: 'https://qcloud.dpfile.com/pc/wU3rvxK40IRQSH-ME1GftzbPAzUEH2TKcu_Umu2cXIBUnUZhRs1BQ-3fNG1nS2hQ5g_3Oo7Z9EXqcoVvW9arsw.jpg',
    sales: 2987
  }, {
    title: '超值3人套餐',
    originalPrice: 98,
    groupPrice: 68,
    groupSize: 5,
    remainingTime: 3600,
    image: 'https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg',
    sales: 1234
  },
  {
    title: '豪华5人套餐',
    originalPrice: 158,
    groupPrice: 108,
    groupSize: 3,
    remainingTime: 2700,
    image: 'https://qcloud.dpfile.com/pc/S1Yt03ZHevIEbvb3fhAy67V74qWD5ZJURHvRhFUOlP2YaCqE8KEE8D3jXlKeA1a95g_3Oo7Z9EXqcoVvW9arsw.jpg',
    sales: 567
  },
  {
    title: '超值工作餐',
    originalPrice: 28,
    groupPrice: 19.9,
    groupSize: 10,
    remainingTime: 1800,
    image: 'https://qcloud.dpfile.com/pc/wU3rvxK40IRQSH-ME1GftzbPAzUEH2TKcu_Umu2cXIBUnUZhRs1BQ-3fNG1nS2hQ5g_3Oo7Z9EXqcoVvW9arsw.jpg',
    sales: 2987
  }
])

const currentProduct = ref(0)
const currentProductData = computed(() => products.value[currentProduct.value])
// 新增滚动状态
const isScrolled = ref(false)
const backIcon = ref("back") // 将 "arrow-left" 改为 "back"
const statusBarHeight = ref(0)
onMounted(() => {
  statusBarHeight.value = uni.getWindowInfo().statusBarHeight
  if (getCurrentPages().length == 1) {
    backIcon.value = "home"
  } else {
    backIcon.value = "left"  // 将 "arrow-left" 改为 "back"
  }
})


// 返回按钮点击
const handleBack = () => {
  if (getCurrentPages().length == 1) {
    uni.switchTab({
      url: "/pages/index/index"
    })
  } else {
    uni.navigateBack()
  }
}
// 切换商品
function switchProduct(index) {
  currentProduct.value = index
  remainingTime.value = currentProductData.value.remainingTime
  // 重置倒计时
  clearInterval(timer)
  startCountdown()
}

// 倒计时逻辑
const remainingTime = ref(currentProductData.value.remainingTime)
let timer = null

const formatTime = computed(() => {
  const hours = Math.floor(remainingTime.value / 3600)
  const minutes = Math.floor((remainingTime.value % 3600) / 60)
  const seconds = remainingTime.value % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 倒计时启动函数
function startCountdown() {
  timer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}


const joinedUsers = ref([
  { id: 1, name: '用户A', avatar: '/static/merchant_pic.jpg' },
  { id: 2, name: '用户B', avatar: '/static/merchant_pic.jpg' },
  { id: 3, name: '用户C', avatar: '/static/merchant_pic.jpg' }
])

const recentJoinCount = ref(12) // 最近参与人数
const scrollingMessages = ref([
  '用户D 刚刚参团成功！',
  '用户E 发起了一个新拼团！',
  '用户F 的拼团即将满员！'
])
const currentMessageIndex = ref(0)
// 修改后的数据逻辑
const visibleMessages = ref([])

// 消息切换方法
const startMessageRotation = () => {
  let currentIndex = 0

  // 初始显示第一条
  visibleMessages.value = [scrollingMessages.value[currentIndex]]

  setInterval(() => {
    currentIndex = (currentIndex + 1) % scrollingMessages.value.length

    // 先添加新消息
    visibleMessages.value = [scrollingMessages.value[currentIndex]]

  }, 3000) // 3秒切换一次
}

onMounted(() => {
  startMessageRotation()
})

const remainingSlots = computed(() => {
  return Math.max(currentProductData.value.groupSize - joinedUsers.value.length, 0)
})

const progressPercentage = computed(() => {
  return (joinedUsers.value.length / currentProductData.value.groupSize * 100).toFixed(2) + '%'
})

onMounted(startCountdown)
onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.ProductDetailIndex {
  width: 100%;
  padding-bottom: 160rpx;
  background: #f8f8f8;
}

/* 新增顶部导航栏样式 */
.nav-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  /* padding-top: env(safe-area-inset-top); */
  /* 处理刘海屏 */
  padding-left: 30rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  background: transparent;
  transition: all 0.3s ease;
  z-index: 999;
}

.nav-bar.scrolled {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff82;
  transition: background 0.3s;
}

.back-btn:active {
  background: rgba(0, 0, 0, 0.1);
}

.icon-back {
  font-size: 40rpx;
  color: #333;
}


/* 商品图片区域 */
.product-image {
  position: relative;
  height: 480rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);
}

.product-image image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 新增缩略图样式 */
.thumbnail-scroll {
  padding: 50rpx 0;
  background: #fff;
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.05);
}

.thumbnail-list {
  white-space: nowrap;
  padding: 0 20rpx;
}

.thumbnail-item {
  display: inline-block;
  width: 120rpx;
  height: 120rpx;
  margin-right: 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
  transition: all 0.3s;
  border: 4rpx solid transparent;
}

.thumbnail-item.active {
  border-color: #ff5500;
  transform: scale(1.1);
}

.thumb-image {
  width: 100%;
  height: 100%;
}

/* 调整主图区域间距 */
.product-image {
  margin-bottom: 20rpx;
}



.countdown {
  position: absolute;
  bottom: 20rpx;
  right: 20rpx;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  font-size: 24rpx;
  backdrop-filter: blur(4px);
}

/* 商品信息 */
.product-info {
  padding: 30rpx;
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  margin-top: -40rpx;
  position: relative;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
}

.product-info h2 {
  font-size: 34rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 20rpx;
  line-height: 1.4;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 20rpx;
  margin: 30rpx 0;
}

.current {
  font-size: 44rpx;
  color: #ff3b30;
  font-weight: bold;
}

.original {
  font-size: 28rpx;
  color: #999;
  text-decoration: line-through;
}

.group-status {
  color: #666;
  font-size: 28rpx;
  margin: 30rpx 0 20rpx;
}

.progress-bar {
  height: 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  overflow: hidden;
  position: relative;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #ff9f43, #ff5500);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

/* 新增商品选项卡样式 */
.product-tabs {
  display: flex;
  padding: 20rpx 30rpx;
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
  transition: all 0.3s;
}

.tab-item.active {
  color: #ff3b30;
  font-weight: bold;
}

.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 4rpx;
  background: #ff3b30;
  border-radius: 2rpx;
}

/* 修改后的动画样式 */
.scroll-container {
  height: 80rpx;
  overflow: hidden;
  position: relative;
}

.scroll-content {
  position: relative;
  height: 100%;
}

/* 入场动画 */
.fade-slide-enter-active {
  transition: all 0.5s ease;
  position: absolute;
  width: 100%;
}

.fade-slide-leave-active {
  transition: all 0.5s ease;
  position: absolute;
  width: 100%;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* 调整后的滚动提示样式 */
.scrolling-alert {
  background: #fff8e6;
  margin: 30rpx;
  border-radius: 10rpx;
  height: 80rpx;
  position: relative;
  padding-left: 80rpx;
}

.scroll-item {
  height: 80rpx;
  line-height: 80rpx;
  font-size: 26rpx;
  color: #ff9900;
  white-space: nowrap;
  padding-right: 30rpx;
}

/* 新增销售信息样式 */
.sales-info {
  color: #999;
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

/* 参团用户 */
.joined-users {
  background: #fff;
  margin: 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
}

.user-list {
  display: flex;
  gap: 40rpx;
  justify-content: center;
}

.user-item {
  text-align: center;
  width: 100rpx;
}

.user-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 2rpx solid #fff;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 10rpx;
}

.empty-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #f5f5f5;
  border: 2rpx dashed #ddd;
  margin: 0 auto 10rpx;
}

.empty view {
  color: #999;
  font-size: 24rpx;
}

/* 操作按钮 */
.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 -8rpx 30rpx rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 20rpx;
}

button {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: 500;
  transition: all 0.2s;
}

.join-button {
  background: linear-gradient(135deg, #ff5a5f, #ff3b30);
  box-shadow: 0 8rpx 20rpx rgba(255, 90, 95, 0.3);
}

.share-button {
  background: linear-gradient(135deg, #ffaa33, #ff8800);
  box-shadow: 0 8rpx 20rpx rgba(255, 170, 51, 0.3);
}

button:active {
  transform: scale(0.98);
  opacity: 0.9;
}
</style>