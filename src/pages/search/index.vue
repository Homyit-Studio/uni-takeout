<template>
  <view class="search-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <uni-icons class="search-icon" type="search" size="18" color="#666"></uni-icons>
      <input class="search-input" v-model="searchText" placeholder="请输入商品名称" confirm-type="search"
        @confirm="handleSearch" />
      <text v-if="searchText" class="clear-btn" @click="clearSearch">×</text>
    </view>

    <!-- 搜索历史 -->
    <view class="history-section" v-if="!showResults">
      <view class="history-header">
        <text>搜索历史</text>
        <uni-icons v-if="searchHistory.length" type="trash" size="18" @click="clearHistory"></uni-icons>
      </view>
      <view class="history-tags">
        <view class="history-tag" v-for="(item, index) in searchHistory" :key="index" @click="searchFromHistory(item)">
          {{ item }}
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="search-results" v-else>
      <view class="result-count">共找到{{ filteredGoods.length }}件商品</view>
      <view class="goods-list">
        <view class="goods-item" v-for="item in filteredGoods" :key="item.id">
          <image class="goods-image" :src="item.image" mode="aspectFill"></image>
          <view class="goods-info">
            <text class="goods-title">{{ item.name }}</text>
            <text class="goods-intro">{{ item.introduction }}</text>
            <text class="goods-price">¥{{ item.price }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { request } from '../../utils/request'

// 搜索相关状态
const searchText = ref('')
const showResults = ref(false)
const searchHistory = ref([])
const goodsList = ref([])

// 初始化读取本地历史记录
onMounted(() => {
  const history = uni.getStorageSync('searchHistory') || []
  searchHistory.value = history.slice(0, 10) // 最多显示10条
})

// 处理搜索
const handleSearch = async () => {
  if (!searchText.value.trim()) return
  try {
    // 从接口获取商品数据
    const res = await request({
      url: '/product/userselect',
      method: 'POST',
      data: { name: searchText.value }
    })
    console.log(res.data)

    // 将接口返回的数据赋值给 goodsList
    goodsList.value = res.data
  } catch (error) {
    console.error('搜索失败', error)
  }
  addToHistory(searchText.value.trim())
  showResults.value = true
}

// 添加历史记录
const addToHistory = (keyword) => {
  // 去重处理
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  searchHistory.value.unshift(keyword)

  // 保持最多10条
  if (searchHistory.value.length > 10) {
    searchHistory.value.pop()
  }

  // 存储到本地
  uni.setStorageSync('searchHistory', searchHistory.value)
}

// 历史记录搜索
const searchFromHistory = (keyword) => {
  searchText.value = keyword
  handleSearch()
}

// 清空搜索
const clearSearch = () => {
  searchText.value = ''
  showResults.value = false
}

// 清空历史记录
const clearHistory = () => {
  searchHistory.value = []
  uni.removeStorageSync('searchHistory')
}

// 过滤商品
const filteredGoods = computed(() => {
  return goodsList.value.filter(item =>
    item.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
})
</script>

<style lang="scss" scoped>
.search-page {
  padding: 20rpx;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 30rpx;

  .search-icon {
    margin-right: 15rpx;
  }

  .search-input {
    flex: 1;
    font-size: 28rpx;
  }

  .clear-btn {
    font-size: 40rpx;
    color: #999;
    padding: 0 15rpx;
  }
}

.history-section {
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    font-size: 28rpx;
    color: #666;
  }

  .history-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;

    .history-tag {
      padding: 10rpx 25rpx;
      background: #f0f0f0;
      border-radius: 30rpx;
      font-size: 26rpx;
      color: #333;
    }
  }
}

.search-results {
  .result-count {
    color: #666;
    font-size: 26rpx;
    margin-bottom: 30rpx;
  }

  .goods-list {
    .goods-item {
      display: flex;
      padding: 10rpx;
      background: white;
      border-radius: 16rpx;
      margin-bottom: 20rpx;

      .goods-image {
        width: 200rpx;
        height: 200rpx;
        border-radius: 20rpx;
        margin-right: 30rpx;
      }

      .goods-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .goods-title {
        font-size: 28rpx;
        color: #333;
      }

      .goods-price {
        font-size: 32rpx;
        color: #ff5500;
        font-weight: bold;
      }

      .goods-intro {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}
</style>