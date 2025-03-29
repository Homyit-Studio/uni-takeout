<template>
    <view class="container">
        <!-- 页面标题 -->
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <text class="title">我的订单</text>
            <view class="header-gradient"></view>
        </view>

        <!-- 订单类型选项卡 -->
        <scroll-view class="tabs" :style="{ top: statusBarHeight + 40 + 'px' }" scroll-x :scroll-with-animation="true">
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
                    @click="viewOrderDetail(order.id)">
                    <view class="card-header">
                        <view class="store-info">
                            <image class="store-icon" src="/static/logo.png" />
                            <text class="store-name">{{ order.shopName || '未命名商家' }}</text>
                        </view>
                        <text class="order-status">{{ order.status }}</text>
                    </view>

                    <view class="card-body">
                        <image class="goods-thumb" src="/static/goods.png" mode="aspectFill" />
                        <view class="goods-info">
                            <text class="goods-title">{{ order.remark || '订单备注' }}</text>
                            <view class="goods-meta">
                                <text class="goods-count">1件</text>
                                <text class="goods-price">¥{{ order.amount.toFixed(2) }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="card-footer">
                        <text class="order-time">{{ formatDate(order.orderTime) }}</text>
                        <!-- <view class="action-buttons">
                            <button v-if="order.status === '待支付'" class="btn cancel"
                                @click.stop="cancelOrder(order.id)">取消订单</button>
                            <button v-if="order.status === '已支付'" class="btn confirm"
                                @click.stop="completeOrder(order.id)">确认收货</button>
                        </view> -->
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
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

// 响应式状态
const statusBarHeight = ref(0)
const tabs = ref(['全部', '待支付', '已支付', '已退款'])
const currentTab = ref(0)
const orders = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isRefreshing = ref(false)

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 生命周期
onMounted(() => {
    statusBarHeight.value = uni.getWindowInfo().statusBarHeight
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

const loadOrders = async () => {
    try {
        const res = await request({
            url: '/order/userselect',
            method: 'GET'
        })
        console.log('获取订单成功:', res)
        if (res.code === 200 && res.data) {
            let filteredOrders = res.data

            // 根据当前选项卡过滤订单
            if (currentTab.value > 0) {
                const statusMap = ['全部', '待支付', '已支付', '已退款']
                const currentStatus = statusMap[currentTab.value]
                filteredOrders = res.data.filter(order => order.status === currentStatus)
            }

            if (page.value === 1) {
                orders.value = filteredOrders
            } else {
                orders.value = [...orders.value, ...filteredOrders]
            }

            // 简单分页控制，实际应根据接口返回的分页信息
            hasMore.value = filteredOrders.length >= pageSize.value
        }
    } catch (error) {
        console.error('获取订单失败:', error)
        uni.showToast({
            title: '获取订单失败',
            icon: 'none'
        })
    } finally {
        isRefreshing.value = false
    }
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
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    border-bottom: 0.0625rem solid #ddd;
    background: #fff;

    .tab-container {
        display: flex;
        background: #fff;
        width: 100%;
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
    width: 100%;
    max-width: 100vw;
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
            color: $primary-color;
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