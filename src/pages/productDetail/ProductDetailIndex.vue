<template>
  <div class="ProductDetailIndex">
    <!-- 商品图片 -->
    <div class="product-image">
      <img
        src="https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg"
        alt="外卖图片">
      <div class="countdown">剩余时间：{{ formatTime }}</div>
    </div>

    <!-- 商品信息 -->
    <div class="product-info">
      <h2>{{ product.title }}</h2>
      <div class="price">
        <span class="current">拼团价 ¥{{ product.groupPrice }}</span>
        <span class="original">原价 ¥{{ product.originalPrice }}</span>
      </div>
      <div class="group-status">
        已有{{ joinedUsers.length }}人参团，还差{{ product.groupSize - joinedUsers.length }}人成团
      </div>
      <div class="progress-bar">
        <div class="progress" :style="{ width: progressPercentage }"></div>
      </div>
    </div>

    <!-- 滚动提示 -->
    <div class="scrolling-alert">
      <marquee behavior="scroll" direction="left">
        {{ scrollingMessage }} 最近{{ recentJoinCount }}人正在拼团...
      </marquee>
    </div>

    <!-- 参团用户 -->
    <div class="joined-users">
      <div class="user-list">
        <div v-for="user in joinedUsers" :key="user.id" class="user-item">
          <image :src="user.avatar" mode="scaleToFill" class="user-image" />
          <view>{{ user.name }}</view>
        </div>
        <div v-for="n in remainingSlots" :key="'empty' + n" class="user-item empty">
          <div class="empty-avatar"></div>
          <view>待加入</view>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button class="join-button">立即参团</button>
      <button class="share-button">分享拼团</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 模拟数据
const product = ref({
  title: '超值外卖套餐（3人份）',
  originalPrice: 98,
  groupPrice: 68,
  groupSize: 5,
  remainingTime: 3600 // 剩余时间（秒）
})

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

// 倒计时逻辑
const remainingTime = ref(product.value.remainingTime)
let timer = null

const formatTime = computed(() => {
  const hours = Math.floor(remainingTime.value / 3600)
  const minutes = Math.floor((remainingTime.value % 3600) / 60)
  const seconds = remainingTime.value % 60
  return `${hours}时${minutes}分${seconds}秒`
})

// 进度条计算
const progressPercentage = computed(() => {
  return (joinedUsers.value.length / product.value.groupSize) * 100 + '%'
})

// 剩余空位
const remainingSlots = computed(() => {
  return product.value.groupSize - joinedUsers.value.length
})

// 滚动消息
const scrollingMessage = computed(() => {
  return scrollingMessages.value[currentMessageIndex.value]
})

onMounted(() => {
  // 倒计时定时器
  timer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    }
  }, 1000)

  // 滚动消息切换
  setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % scrollingMessages.value.length
  }, 3000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.ProductDetailIndex {
  max-width: 375px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.product-image {
  position: relative;
  height: 200px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.countdown {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
}

.product-info {
  padding: 15px;
}

.price {
  margin: 10px 0;
}

.current {
  font-size: 24px;
  color: #e4393c;
  margin-right: 10px;
}

.original {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.group-status {
  color: #666;
  margin: 10px 0;
}

.progress-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #ff5500;
  transition: width 0.3s;
}

.scrolling-alert {
  background: #fff9e6;
  padding: 8px 15px;
  color: #ff9900;
  margin: 10px 0;
}

.user-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 15px;
}

.user-item {
  text-align: center;
  width: 60px;
}

.user-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.empty-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #eee;
  margin: 0 auto;
}

.action-buttons {
  position: fixed;
  box-sizing: border-box;
  bottom: 0;
  width: 100%;
  max-width: 375px;
  display: flex;
  background: white;
  padding: 10px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.join-button {
  flex: 1;
  background: #e4393c;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 4px;
  margin-right: 10px;
}

.share-button {
  flex: 1;
  background: #ff9900;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 4px;
}
</style>