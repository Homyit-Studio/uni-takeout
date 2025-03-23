<template>
    <view class="container">
        <!-- 页面标题 -->
        <view class="header" :style="{ paddingTop: statusBarHeight + 8 + 'px' }">
            <text class="title">我的订单</text>
            <view class="header-gradient"></view>
        </view>

        <!-- 订单类型选项卡 -->
        <scroll-view class="tabs" :style="{ top: statusBarHeight + 36 + 'px' }" scroll-x :scroll-with-animation="true">
            <view class="tab-container">
                <view class="tab-item" v-for="(tab, index) in tabs" :key="index"
                    :class="{ active: currentTab === index }" @click="switchTab(index)">
                    <text class="tab-text">{{ tab }}</text>
                    <view v-if="currentTab === index" class="active-line"></view>
                </view>
            </view>
        </scroll-view>

        <!-- 订单列表 -->
        <scroll-view class="order-list" scroll-y @scrolltolower="loadMoreOrders" :enhanced="true"
            :show-scrollbar="false">
            <block v-if="orders.length > 0">
                <view class="order-card" v-for="(order, index) in orders" :key="index"
                    @click="viewOrderDetail(order.id)" :class="[order.status]">
                    <view class="card-header">
                        <view class="store-info">
                            <image class="store-icon" src="/static/logo.png" />
                            <text class="store-name">{{ order.storeName }}</text>
                        </view>
                        <text class="order-status">{{ orderStatusText[order.status] }}</text>
                    </view>

                    <view class="card-body">
                        <image class="goods-thumb" :src="order.goodsImage" mode="aspectFill" />
                        <view class="goods-info">
                            <text class="goods-title">{{ order.goodsName }}</text>
                            <view class="goods-meta">
                                <text class="goods-count">{{ order.goodsCount }}件</text>
                                <text class="goods-price">¥{{ order.amount.toFixed(2) }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="card-footer">
                        <text class="order-time">{{ order.createTime }}</text>
                        <view class="action-buttons">
                            <button v-if="order.status === 'pending'" class="btn cancel"
                                @click.stop="cancelOrder(order.id)">取消订单</button>
                            <button v-if="order.status === 'delivered'" class="btn confirm"
                                @click.stop="completeOrder(order.id)">确认收货</button>
                            <button v-if="order.status === 'completed'" class="btn review"
                                @click.stop="reviewOrder(order.id)">立即评价</button>
                        </view>
                    </view>
                </view>
            </block>

            <!-- 空状态 -->
            <view v-else class="empty-state">
                <image class="empty-image" src="/static/empty-order.png" mode="aspectFit" />
                <text class="empty-text">暂无相关订单</text>
            </view>

            <!-- 加载状态 -->
            <view class="loading-state">
                <text v-if="hasMore && orders.length > 0" class="loading-text">正在加载更多...</text>
                <text v-else-if="!hasMore && orders.length > 0" class="no-more-text">— 已经到底啦 —</text>
            </view>
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
        url: `/pages/orderDetail/OrderDetailIndex?id=${orderId}`
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

<style lang="scss" scoped>
$primary-color: #FF5A5F;
$secondary-color: #FFB400;
$success-color: #4CAF50;
$info-color: #2196F3;
$text-primary: #333;
$text-secondary: #666;
$border-color: #eee;

.container {
    background: #f8f9fa;
    min-height: 100vh;
    box-sizing: border-box;
}

.header {
    position: sticky;
    top: -170rpx;
    height: 240rpx;
    padding: 0 32rpx;
    z-index: 2;
    background: linear-gradient(135deg, #FF5500 0%, #FAD0C4 100%);
    overflow: hidden;

    .title {
        position: relative;
        z-index: 2;
        font-size: 48rpx;
        font-weight: 600;
        color: #fff;
        text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    }

    .header-gradient {
        position: absolute;
        bottom: -150rpx;
        right: -100rpx;
        width: 300rpx;
        height: 300rpx;
        background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
        border-radius: 50%;
    }
}

.tabs {
    position: relative;
    z-index: 2;
    position: sticky;
    margin-top: -40rpx;
    padding: 0 32rpx;
    background: transparent;
    width: 100%; // 确保宽度约束
    max-width: 100vw; // 最大宽度不超过屏幕
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    border-bottom: 0.0625rem solid #f0f0f0;

    .tab-container {
        display: flex;
        background: #fff;
        // border-radius: 16rpx;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
    }

    .tab-item {
        flex: 1;
        padding: 24rpx 0;
        position: relative;
        display: flex;
        justify-content: center;

        .tab-text {
            font-size: 28rpx;
            color: $text-secondary;
            transition: color 0.3s;
        }

        &.active {
            .tab-text {
                color: $primary-color;
                font-weight: 500;
            }

            .active-line {
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 48rpx;
                height: 4rpx;
                background: $primary-color;
                border-radius: 2rpx;
                animation: lineSlide 0.3s;
            }
        }
    }
}

@keyframes lineSlide {
    from {
        width: 0
    }

    to {
        width: 48rpx
    }
}

.order-list {
    width: 100%; // 确保宽度约束
    max-width: 100vw; // 最大宽度不超过屏幕
    box-sizing: border-box;
    padding: 0 32rpx 32rpx;
    margin-top: 24rpx;
}

.order-card {
    background: #fff;
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
    overflow: hidden;
    transition: transform 0.2s;

    &:active {
        transform: scale(0.98);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24rpx;
        border-bottom: 1rpx solid $border-color;

        .store-info {
            display: flex;
            align-items: center;

            .store-icon {
                width: 48rpx;
                height: 48rpx;
                border-radius: 8rpx;
                margin-right: 16rpx;
            }

            .store-name {
                font-size: 30rpx;
                font-weight: 500;
                color: $text-primary;
            }
        }

        .order-status {
            font-size: 26rpx;
            font-weight: 500;

            &.pending {
                color: $secondary-color;
            }

            &.paid {
                color: $info-color;
            }

            &.shipped {
                color: $info-color;
            }

            &.delivered {
                color: $info-color;
            }

            &.completed {
                color: $success-color;
            }

            &.refunded {
                color: $text-secondary;
            }
        }
    }

    .card-body {
        display: flex;
        padding: 24rpx;

        .goods-thumb {
            width: 160rpx;
            height: 160rpx;
            border-radius: 12rpx;
            margin-right: 24rpx;
        }

        .goods-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .goods-title {
                font-size: 28rpx;
                color: $text-primary;
                // @include text-ellipsis(2);
            }

            .goods-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .goods-count {
                    font-size: 24rpx;
                    color: $text-secondary;
                }

                .goods-price {
                    font-size: 32rpx;
                    color: $primary-color;
                    font-weight: 600;
                }
            }
        }
    }

    .card-footer {
        padding: 24rpx;
        border-top: 1rpx solid $border-color;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .order-time {
            font-size: 24rpx;
            color: $text-secondary;
        }

        .action-buttons {
            display: flex;
            gap: 16rpx;

            .btn {
                height: 56rpx;
                padding: 0 24rpx;
                border-radius: 28rpx;
                font-size: 24rpx;
                line-height: 56rpx;
                transition: all 0.2s;

                &.cancel {
                    background: #f5f5f5;
                    color: $text-secondary;
                }

                &.confirm {
                    background: linear-gradient(45deg, #4CAF50, #66BB6A);
                    color: #fff;
                }

                &.review {
                    background: linear-gradient(45deg, #2196F3, #42A5F5);
                    color: #fff;
                }
            }
        }
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100rpx 0;

    .empty-image {
        width: 300rpx;
        height: 300rpx;
        opacity: 0.8;
        margin-bottom: 32rpx;
    }

    .empty-text {
        font-size: 28rpx;
        color: $text-secondary;
    }
}

.loading-state {
    text-align: center;
    padding: 32rpx 0;
    color: $text-secondary;
    font-size: 24rpx;

    .no-more-text {
        letter-spacing: 4rpx;
        opacity: 0.6;
    }
}
</style>