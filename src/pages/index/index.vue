<template>
  <view class="container">
    <!-- 顶部安全区域 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 搜索栏占位，用于计算吸顶位置 -->
    <view class="search-bar-anchor" ref="searchBarAnchor"></view>

    <!-- 搜索栏 -->
    <view class="search-bar" :class="{ 'fixed': isSearchBarFixed }" :style="fixedStyle">
      <view class="search-input" @click="goToSearch">
        <uni-icons type="search" size="18" color="#999"></uni-icons>
        <text class="placeholder">搜索商家、美食</text>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content">
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
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { onPageScroll, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'

// 响应式状态
const statusBarHeight = ref(0)
const hotStores = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isRefreshing = ref(false)
const isSearchBarFixed = ref(false)

// 添加搜索栏位置相关的响应式状态
const searchBarTop = ref(0)
const fixedStyle = computed(() => ({
  top: isSearchBarFixed.value ? `${statusBarHeight.value}px` : 'auto'
}))

// 生命周期
onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
  loadHotStores()
  // 获取搜索栏的初始位置
  const query = uni.createSelectorQuery()
  query.select('.search-bar-anchor').boundingClientRect(rect => {
    if (rect) {
      searchBarTop.value = rect.top
    }
  }).exec()
})

// 方法
const loadHotStores = () => {
  return new Promise((resolve) => {
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

      resolve()
    }, 1000)
  })
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

// 下拉刷新
onPullDownRefresh(() => {
  page.value = 1
  hasMore.value = true
  loadHotStores().then(() => {
    uni.stopPullDownRefresh()
  })
})

// 监听页面滚动
onPageScroll(({ scrollTop }) => {
  // 修改滚动监听逻辑
  isSearchBarFixed.value = scrollTop >= searchBarTop.value - statusBarHeight.value
})

// 使用onReachBottom替代scrolltolower
onReachBottom(() => {
  if (!hasMore.value) return
  page.value++
  loadHotStores()
})
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.status-bar {
  width: 100%;
  background-color: #ffffff;
}

.search-bar-anchor {
  height: 0;
  position: relative;
  z-index: 1;
}

.search-bar {
  position: relative;
  padding: 20rpx;
  background-color: #ffffff;
  z-index: 100;
}

.search-bar.fixed {
  position: fixed;
  left: 0;
  right: 0;
  background-color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.search-bar-placeholder {
  height: 88rpx;
  /* 搜索栏高度 */
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

.content {
  position: relative;
  z-index: 1;
  padding: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

.store-list {
  margin-top: 20rpx;
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