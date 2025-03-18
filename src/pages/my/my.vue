<template>
    <view class="container">
        <!-- 顶部安全区域 -->
        <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

        <!-- 用户信息区域 -->
        <view class="user-info" @click="goToUserProfile">
            <image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
            <view class="user-detail">
                <text class="username">{{ userInfo.nickname || '点击登录' }}</text>
                <text class="user-id" v-if="userInfo.id">ID: {{ userInfo.id }}</text>
            </view>
            <uni-icons type="right" size="20" color="#999"></uni-icons>
        </view>

        <!-- 功能区域 -->
        <view class="function-box">
            <view class="function-row">
                <view class="function-item" @click="goToPage('/pages/user/coupon')">
                    <uni-icons type="gift" size="28" color="#ff5500"></uni-icons>
                    <text>我的优惠券</text>
                </view>
                <view class="function-item" @click="goToPage('/pages/user/address')">
                    <uni-icons type="location" size="28" color="#1296db"></uni-icons>
                    <text>我的地址</text>
                </view>
                <view class="function-item" @click="goToStoreApply" v-if="!userInfo.isStore">
                    <uni-icons type="shop" size="28" color="#4caf50"></uni-icons>
                    <text>店铺入驻</text>
                </view>
                <view class="function-item" @click="goToStoreManage" v-if="userInfo.isStore">
                    <uni-icons type="shop-filled" size="28" color="#4caf50"></uni-icons>
                    <text>商户入口</text>
                </view>
                <view class="function-item" @click="goToAdminPanel" v-if="userInfo.isAdmin">
                    <uni-icons type="settings" size="28" color="#673ab7"></uni-icons>
                    <text>管理员入口</text>
                </view>
            </view>
        </view>

        <!-- 热门商品推荐 -->
        <view class="recommend-section">
            <view class="section-title">为您推荐</view>
            <scroll-view class="hot-stores" scroll-y @scrolltolower="loadMoreHotStores"
                @refresherrefresh="refreshHotStores" refresher-enabled :refresher-triggered="isRefreshing"
                :refresher-threshold="100" refresher-background="#f5f5f5" enable-back-to-top>
                <view class="store-list">
                    <view class="store-item" v-for="(store, index) in hotStores" :key="index"
                        @click="goToStoreDetail(store.id)">
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
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式状态
const statusBarHeight = ref(0)
const userInfo = ref({
    id: '12345',
    nickname: '测试用户',
    avatar: '/static/images/default-avatar.png',
    isStore: true,
    isAdmin: true
})
const hotStores = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isRefreshing = ref(false)

// 生命周期
onMounted(() => {
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
    loadHotStores()
    getUserInfo()
})

// 方法
const getUserInfo = () => {
    // 实际项目中应该从后端API获取
}

const goToUserProfile = () => {
    uni.navigateTo({
        url: '/pages/user/profile'
    })
}

const goToPage = (url) => {
    uni.navigateTo({
        url
    })
}

const goToStoreApply = () => {
    uni.navigateTo({
        url: '/pages/user/store-apply'
    })
}

const goToStoreManage = () => {
    uni.navigateTo({
        url: '/pages/user/store-manage'
    })
}

const goToAdminPanel = () => {
    uni.navigateTo({
        url: '/pages/user/admin'
    })
}

const loadHotStores = () => {
    setTimeout(() => {
        const mockData = Array.from({ length: 10 }, (_, i) => ({
            id: i + (page.value - 1) * pageSize.value,
            name: `商家${i + (page.value - 1) * pageSize.value + 1}`,
            description: '特色美食，欢迎品尝',
            image: '/static/goods.png',  // 修改这里
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
    setTimeout(() => {
        loadHotStores()
    }, 300) // 添加短暂延迟以改善用户体验
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
    background-color: #f5f5f5;
}

.status-bar {
    width: 100%;
    background-color: #1296db;
}

.user-info {
    display: flex;
    align-items: center;
    padding: 30rpx 20rpx;
    background-color: #1296db;
}

.avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.user-detail {
    flex: 1;
    margin-left: 20rpx;
}

.username {
    font-size: 32rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 10rpx;
}

.user-id {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
}

.function-box {
    margin: 20rpx;
    background-color: #ffffff;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.function-row {
    display: flex;
    flex-wrap: wrap;
    padding: 20rpx 0;
}

.function-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 25%;
    padding: 20rpx 0;
}

.function-item text {
    font-size: 24rpx;
    margin-top: 16rpx;
    color: #333;
}

.recommend-section {
    margin: 20rpx;
    flex: 1;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 380rpx);
    /* 调整高度计算 */
    overflow: hidden;
    /* 添加此行 */
}

.section-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
}

.hot-stores {
    flex: 1;
    height: 100%;
    /* 修改为100% */
    border-radius: 12rpx;
    background-color: #ffffff;
    padding: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.store-list {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
}

.store-item {
    display: flex;
    background-color: #ffffff;
    padding: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
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
