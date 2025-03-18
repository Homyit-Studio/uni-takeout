<template>
    <view class="container">
        <!-- 顶部安全区域 -->
        <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

        <!-- 页面标题 -->
        <view class="header">
            <text class="title">我的订单</text>
        </view>

        <!-- 订单类型选项卡 -->
        <view class="tabs">
            <view class="tab-item" v-for="(tab, index) in tabs" :key="index" :class="{ active: currentTab === index }"
                @click="switchTab(index)">
                <text>{{ tab }}</text>
            </view>
        </view>

        <!-- 订单列表 -->
        <scroll-view class="order-list" scroll-y @scrolltolower="loadMoreOrders" enable-back-to-top>
            <block v-if="orders.length > 0">
                <view class="order-item" v-for="(order, index) in orders" :key="index"
                    @click="viewOrderDetail(order.id)">
                    <view class="order-header">
                        <text class="store-name">{{ order.storeName }}</text>
                        <text class="order-status" :class="order.status">{{ orderStatusText[order.status] }}</text>
                    </view>

                    <view class="order-goods">
                        <image class="goods-image" :src="order.goodsImage" mode="aspectFill"></image>
                        <view class="goods-info">
                            <view class="goods-summary">
                                <text class="goods-name">{{ order.goodsName }}</text>
                                <text class="goods-count">共{{ order.goodsCount }}件商品</text>
                            </view>
                            <text class="order-amount">¥{{ order.amount.toFixed(2) }}</text>
                        </view>
                    </view>

                    <view class="order-footer">
                        <view class="order-time">{{ order.createTime }}</view>
                        <view class="order-actions">
                            <button class="action-btn" v-if="order.status === 'pending'"
                                @click.stop="cancelOrder(order.id)">取消订单</button>
                            <button class="action-btn primary" v-if="order.status === 'delivered'"
                                @click.stop="completeOrder(order.id)">确认收货</button>
                            <button class="action-btn" v-if="order.status === 'completed'"
                                @click.stop="reviewOrder(order.id)">评价订单</button>
                        </view>
                    </view>
                </view>
            </block>

            <view class="empty-tip" v-else>
                <image class="empty-icon" src="/static/empty-order.png"></image>
                <text>暂无订单数据</text>
            </view>

            <view class="loading-more" v-if="hasMore && orders.length > 0">加载更多...</view>
            <view class="no-more" v-if="!hasMore && orders.length > 0">没有更多了</view>
        </scroll-view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'

// 响应式状态
const statusBarHeight = ref(0)
const tabs = ref(['全部', '待付款', '待发货', '待收货', '待评价', '已退款'])
const currentTab = ref(0)
const orders = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isRefreshing = ref(false)
const orderStatusText = ref({
    'pending': '待付款',
    'paid': '待发货',
    'shipped': '待收货',
    'delivered': '待收货',
    'completed': '已完成',
    'refunded': '已退款',
    'canceled': '已取消'
})

// 生命周期
onMounted(() => {
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
    console.log(statusBarHeight.value)
    loadOrders()
})

// 方法
const switchTab = (index) => {
    if (currentTab.value === index) return
    currentTab.value = index
    page.value = 1
    hasMore.value = true
    orders.value = []
    loadOrders()
}

const loadOrders = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const statusMap = ['all', 'pending', 'paid', 'shipped', 'delivered', 'refunded']
            const currentStatus = statusMap[currentTab.value]

            let mockData = []
            for (let i = 0; i < pageSize.value; i++) {
                const orderIndex = i + (page.value - 1) * pageSize.value
                const statuses = ['pending', 'paid', 'shipped', 'delivered', 'completed', 'refunded', 'canceled']
                let status = statuses[Math.floor(Math.random() * statuses.length)]

                if (currentStatus !== 'all' && status !== currentStatus) {
                    status = currentStatus
                }

                const order = {
                    id: `order${orderIndex}`,
                    storeName: `商家${orderIndex % 5 + 1}`,
                    goodsName: `美食套餐${orderIndex}`,
                    goodsCount: Math.floor(Math.random() * 5) + 1,
                    goodsImage: '/static/goods.png',
                    amount: Math.floor(Math.random() * 100) + 20,
                    status: status,
                    createTime: `2023-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`
                }

                mockData.push(order)
            }

            if (currentStatus !== 'all') {
                mockData = mockData.filter(order => order.status === currentStatus)
            }

            if (page.value === 1) {
                orders.value = mockData
            } else {
                orders.value = [...orders.value, ...mockData]
            }

            if (page.value >= 3) {
                hasMore.value = false
            }

            isRefreshing.value = false
            resolve()
        }, 1000)
    })
}

const loadMoreOrders = () => {
    if (!hasMore.value) return
    page.value++
    loadOrders()
}

const refreshOrders = () => {
    isRefreshing.value = true
    page.value = 1
    hasMore.value = true
    loadOrders()
}

const viewOrderDetail = (orderId) => {
    uni.navigateTo({
        url: `/pages/order/detail?id=${orderId}`
    })
}

const cancelOrder = (orderId) => {
    uni.showModal({
        title: '提示',
        content: '确定要取消该订单吗？',
        success: (res) => {
            if (res.confirm) {
                uni.showToast({
                    title: '订单已取消',
                    icon: 'success'
                })
                refreshOrders()
            }
        }
    })
}

const completeOrder = (orderId) => {
    uni.showModal({
        title: '提示',
        content: '确认已收到商品？',
        success: (res) => {
            if (res.confirm) {
                uni.showToast({
                    title: '已确认收货',
                    icon: 'success'
                })
                refreshOrders()
            }
        }
    })
}

const reviewOrder = (orderId) => {
    uni.navigateTo({
        url: `/pages/order/review?id=${orderId}`
    })
}

// 添加页面级下拉刷新
onPullDownRefresh(() => {
    page.value = 1
    hasMore.value = true
    orders.value = []
    loadOrders().then(() => {
        uni.stopPullDownRefresh()
    })
})

</script>

<style scoped>
.container {
    width: 100vw;
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.status-bar {
    width: 100%;
    background-color: #ffffff;
}

.header {
    padding: 20rpx;
    background-color: #ffffff;
    text-align: center;
}

.title {
    font-size: 36rpx;
    font-weight: bold;
}

.tabs {
    display: flex;
    background-color: #ffffff;
    border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    font-size: 28rpx;
    color: #666;
    position: relative;
}

.tab-item.active {
    color: #1296db;
    font-weight: bold;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60rpx;
    height: 6rpx;
    background-color: #1296db;
    border-radius: 3rpx;
}

.order-list {
    flex: 1;
    padding: 20rpx;
    width: calc(100vw - 40rpx);
    padding-right: calc(20rpx + constant(safe-area-inset-right));
    /* 兼容 iOS < 11.2 */
    padding-right: calc(20rpx + env(safe-area-inset-right));
    /* 兼容 iOS >= 11.2 */
    background-color: #f5f5f5;
    height: calc(100vh - 250rpx);
    /* 添加具体高度，200rpx 为顶部区域高度 */
}

.order-item {
    background-color: #ffffff;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    padding: 20rpx;
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.store-name {
    font-size: 30rpx;
    font-weight: bold;
}

.order-status {
    font-size: 26rpx;
}

.order-status.pending {
    color: #ff9800;
}

.order-status.paid,
.order-status.shipped,
.order-status.delivered {
    color: #1296db;
}

.order-status.completed {
    color: #4caf50;
}

.order-status.refunded,
.order-status.canceled {
    color: #999;
}

.order-goods {
    display: flex;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
}

.goods-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 8rpx;
    margin-right: 20rpx;
}

.goods-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.goods-summary {
    display: flex;
    flex-direction: column;
}

.goods-name {
    font-size: 28rpx;
    margin-bottom: 10rpx;
}

.goods-count {
    font-size: 24rpx;
    color: #999;
}

.order-amount {
    font-size: 32rpx;
    font-weight: bold;
    color: #ff5500;
}

.order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20rpx;
}

.order-time {
    font-size: 24rpx;
    color: #999;
}

.order-actions {
    display: flex;
}

.action-btn {
    font-size: 24rpx;
    margin-left: 20rpx;
    padding: 10rpx 20rpx;
    background-color: #f5f5f5;
    border: 1rpx solid #ddd;
    border-radius: 30rpx;
    line-height: 1.5;
}

.action-btn.primary {
    background-color: #1296db;
    color: #fff;
    border-color: #1296db;
}

.empty-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    color: #999;
    font-size: 28rpx;
}

.empty-icon {
    width: 180rpx;
    height: 180rpx;
    margin-bottom: 20rpx;
}

.loading-more,
.no-more {
    text-align: center;
    padding: 20rpx 0;
    color: #999;
    font-size: 24rpx;
}
</style>
