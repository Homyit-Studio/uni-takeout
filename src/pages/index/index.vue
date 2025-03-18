<template>
  <view class="container">
    <!-- 顶部安全区域 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 搜索栏 -->
    <view class="search-bar" @click="goToSearch">
      <view class="search-input">
        <uni-icons type="search" size="18" color="#999"></uni-icons>
        <text class="placeholder">搜索商家、美食</text>
      </view>
    </view>

    <!-- 热门商品展示 -->
    <scroll-view class="hot-stores" scroll-y @scrolltolower="loadMoreHotStores" @refresherrefresh="refreshHotStores"
      refresher-enabled :refresher-triggered="isRefreshing" enable-back-to-top>
      <view class="section-title">热门商家</view>
      <view class="store-list">
        <view class="store-item" v-for="(store, index) in hotStores" :key="index" @click="goToStoreDetail(store.id)">
          <image class="store-image" :src="store.image" mode="aspectFill"></image>
          <view class="store-info">
            <view class="store-name">{{ store.name }}</view>
            <view class="store-desc">{{ store.description }}</view>
            <view class="hot-product">
              <text class="hot-product-name">热门: {{ store.hotProduct.name }}</text>
              <text class="hot-product-price">¥{{ store.hotProduct.price }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="loading-more" v-if="hasMore">加载更多...</view>
      <view class="no-more" v-else>没有更多了</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式状态
const statusBarHeight = ref(0)
const hotStores = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isRefreshing = ref(false)

// 生命周期
onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
  loadHotStores()
})

// 方法
const loadHotStores = () => {
  setTimeout(() => {
    const mockData = Array.from({ length: 10 }, (_, i) => ({
      id: i + (page.value - 1) * pageSize.value,
      name: `商家${i + (page.value - 1) * pageSize.value + 1}`,
      description: '特色美食，欢迎品尝',
      image: '/static/goods.png',
      hotProduct: {
        name: '招牌菜品',
        price: Math.floor(Math.random() * 50 + 10)
      }
    }))

    if (page.value === 1) {
      hotStores.value = mockData
    } else {
      hotStores.value = [...hotStores.value, ...mockData]
    }

    if (page.value >= 3) {
      hasMore.value = false
    }

    isRefreshing.value = false
  }, 1000)
}

const loadMoreHotStores = () => {
  if (!hasMore.value) return
  page.value++
  loadHotStores()
}

const refreshHotStores = () => {
  isRefreshing.value = true
  page.value = 1
  hasMore.value = true
  loadHotStores()
}

const goToSearch = () => {
  uni.navigateTo({
    url: '/pages/store/search'
  })
}

const goToStoreDetail = (storeId) => {
  uni.navigateTo({
    url: `/pages/store/detail?id=${storeId}`
  })
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.status-bar {
  width: 100%;
  background-color: #ffffff;
}

.search-bar {
  padding: 20rpx;
  background-color: #ffffff;
}

.search-input {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 36rpx;
  padding: 16rpx 24rpx;
}

.placeholder {
  margin-left: 10rpx;
  color: #999;
  font-size: 28rpx;
}

.hot-stores {
  flex: 1;
  padding: 20rpx;
  height: calc(100vh - 200rpx);
  /* 添加具体高度，200rpx 为顶部区域高度 */
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.store-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.store-item {
  display: flex;
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.store-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.store-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.store-name {
  font-size: 30rpx;
  font-weight: bold;
}

.store-desc {
  font-size: 24rpx;
  color: #666;
  margin: 10rpx 0;
}

.hot-product {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
}

.hot-product-name {
  color: #333;
}

.hot-product-price {
  color: #ff5500;
  font-weight: bold;
}

.loading-more,
.no-more {
  text-align: center;
  padding: 20rpx 0;
  color: #999;
  font-size: 24rpx;
}
</style>
