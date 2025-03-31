<template>
    <view class="merchant-container">
        <!-- 商家管理界面 -->
        <view class="merchant-header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="store-info">
                <image :src="storeInfo.avatar" class="store-avatar" mode="aspectFill" />
                <view class="store-details">
                    <text class="store-name">{{ storeInfo.name }}</text>
                    <view class="status-badge">
                        <uni-icons type="checkmark-filled" size="14" color="#fff" />
                        <text class="store-status">{{ isStoreOpen ? '营业中' : '已打烊' }}</text>
                    </view>
                </view>
            </view>
            <view class="stats-card">
                <view class="stat-item">
                    <text class="stat-value">56</text>
                    <text class="stat-label">今日订单</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item">
                    <text class="stat-value">¥2,890</text>
                    <text class="stat-label">今日营收</text>
                </view>
            </view>
        </view>

        <!-- 功能导航 -->
        <view class="management-panel">
            <view class="panel-item product-manage" @click="goToProductManage(storeInfo.id)"
                @touchstart="handleTouchStart" @touchend="handleTouchEnd">
                <view class="icon-wrapper">
                    <uni-icons type="shop-filled" size="42" color="#fff" />
                </view>
                <text class="panel-title">商品管理</text>
                <text class="panel-subtitle">已上架12个商品</text>
                <uni-icons type="right" size="20" color="rgba(255,255,255,0.8)" class="arrow" />
            </view>

            <view class="panel-item order-manage" @click="goToOrderManage" @touchstart="handleTouchStart"
                @touchend="handleTouchEnd">
                <view class="icon-wrapper">
                    <uni-icons type="list" size="42" color="#fff" />
                </view>
                <text class="panel-title">订单管理</text>
                <text class="panel-subtitle">3个待处理订单</text>
                <uni-icons type="right" size="20" color="rgba(255,255,255,0.8)" class="arrow" />
            </view>
        </view>

        <!-- 快捷操作 -->
        <view class="quick-actions">
            <view class="action-item" @click="handleToManage(`shopLottery_manage/index`)">
                <uni-icons type="compose" size="28" color="#FF5500" />
                <text class="text">发布抽奖</text>
            </view>
            <view class="action-item" @click="handleToManage(`shopRevenue_manage/index`)">
                <uni-icons type="list" size="28" color="#FF5500" />
                <text class="text">营收细则</text>
            </view>
            <view class="action-item" @click="handleToManage(`editPersonalInfo/index`)">
                <uni-icons type="compose" size="28" color="#FF5500" />
                <text class="text">个人信息修改</text>
            </view>
            <view class="action-item">
                <uni-icons type="gear-filled" size="28" color="#FF5500" />
                <button open-type="openSetting" bindopensetting="callback"
                    style="padding: 0;justify-content: center; display: flex;font-size: 28rpx;color: #666;text-wrap: nowrap;">系统设置</button>
            </view>
        </view>
    </view>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { request } from '../../../utils/request'
import { onShow } from '@dcloudio/uni-app'

const statusBarHeight = ref(0)
const storeInfo = ref({
    id: 0,
    avatar: '',
    name: '',
    openTime: '',
    closeTime: '',
    address: ''
})
const isStoreOpen = ref(false)

// 获取商家信息
const fetchShopInfo = async () => {
    try {
        const res = await request({
            url: '/shop/mershopinfo',
            method: 'GET'
        })
        console.log('获取商家信息:', res)
        storeInfo.value = res.data
        isStoreOpen.value = isStoreOpenNow(res.data.openTime, res.data.closeTime)

    } catch (error) {
        console.error('获取商家信息失败', error)
    }
}

// 判断当前是否在营业时间内
const isStoreOpenNow = (openTime, closeTime) => {
    const now = new Date()
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()

    const [openHour, openMinute] = openTime.split(':').map(Number)
    const [closeHour, closeMinute] = closeTime.split(':').map(Number)

    const currentTime = currentHours * 60 + currentMinutes
    const openTimeInMinutes = openHour * 60 + openMinute
    const closeTimeInMinutes = closeHour * 60 + closeMinute

    // 处理跨天营业
    if (openTimeInMinutes < closeTimeInMinutes) {
        return currentTime >= openTimeInMinutes && currentTime <= closeTimeInMinutes
    } else {
        return currentTime >= openTimeInMinutes || currentTime <= closeTimeInMinutes
    }
}

onShow(() => {
    statusBarHeight.value = uni.getWindowInfo().statusBarHeight
    fetchShopInfo()
})

// 点击动画处理
const handleTouchStart = (e) => {
    // e.currentTarget.style.transform = 'scale(0.98)'
}

const handleTouchEnd = (e) => {
    // e.currentTarget.style.transform = 'scale(1)'
}

const handleToManage = (url) => {
    uni.navigateTo({ url: `/pages/${url}` })
}
const goToProductManage = (id) => {
    uni.navigateTo({ url: `/pages/productManage/ProductManageIndex?id=${id}` })
}

const goToOrderManage = () => {
    uni.switchTab({ url: '/pages/order/order' })
}
</script>

<style scoped lang="scss">
$primary-gradient: linear-gradient(135deg, #fd8750 0%, #eb7843 100%);
$secondary-gradient: linear-gradient(135deg, #fd8750 0%, #eb7843 100%);

.merchant-container {
    min-height: 100vh;
    background: #f8f9fb;
}

.merchant-header {
    background: $primary-gradient;
    padding: 40rpx 30rpx 120rpx;
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        bottom: -60rpx;
        left: -20rpx;
        right: -20rpx;
        height: 120rpx;
        background: #f8f9fb;
        border-radius: 50%;
        box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.05);
    }
}

.store-info {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;

    .store-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 24rpx;
        border: 4rpx solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
    }

    .store-details {
        margin-left: 30rpx;

        .store-name {
            font-size: 40rpx;
            font-weight: 600;
            color: #fff;
            display: block;
            margin-bottom: 12rpx;
            text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
        }

        .status-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 8rpx 20rpx;
            border-radius: 40rpx;
            display: inline-flex;
            align-items: center;

            .store-status {
                font-size: 24rpx;
                color: #fff;
                margin-left: 8rpx;
            }
        }
    }
}

.stats-card {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 24rpx;
    padding: 30rpx;
    margin-top: 40rpx;
    display: flex;
    justify-content: space-around;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);

    .stat-item {
        text-align: center;

        .stat-value {
            font-size: 40rpx;
            font-weight: 600;
            color: #FF5500;
            display: block;
            line-height: 1.2;
        }

        .stat-label {
            font-size: 24rpx;
            color: #666;
        }
    }

    .stat-divider {
        width: 2rpx;
        background: rgba(0, 0, 0, 0.1);
    }
}

.management-panel {
    padding: 0 30rpx;
    margin-top: -60rpx;
    position: relative;
    z-index: 2;

    .panel-item {
        border-radius: 24rpx;
        padding: 40rpx;
        margin-bottom: 30rpx;
        position: relative;
        overflow: hidden;
        transition: all 0.2s ease;

        &::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg,
                    rgba(255, 255, 255, 0.1) 25%,
                    transparent 25%,
                    transparent 50%,
                    rgba(255, 255, 255, 0.1) 50%,
                    rgba(255, 255, 255, 0.1) 75%,
                    transparent 75%);
            background-size: 8rpx 8rpx;
            opacity: 0.3;
        }

        &.product-manage {
            background: $primary-gradient;
        }

        &.order-manage {
            background: $secondary-gradient;
        }

        .icon-wrapper {
            width: 80rpx;
            height: 80rpx;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 16rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 30rpx;
        }

        .panel-title {
            font-size: 36rpx;
            color: #fff;
            display: block;
            margin-bottom: 8rpx;
            font-weight: 500;
        }

        .panel-subtitle {
            font-size: 24rpx;
            color: rgba(255, 255, 255, 0.9);
        }

        .arrow {
            position: absolute;
            right: 40rpx;
            top: 50%;
            transform: translateY(-50%);
        }
    }
}

.quick-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10rpx;
    padding: 30rpx 10rpx;
    background: #fff;
    margin: 30rpx;
    border-radius: 24rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);

    .action-item {
        padding: 30rpx;
        text-align: center;
        background: #f8f9fb;
        border-radius: 16rpx;
        transition: all 0.2s ease;

        &:active {
            transform: scale(0.96);
            background: darken(#f8f9fb, 2%);
        }

        .text {
            display: block;
            margin-top: 15rpx;
            font-size: 26rpx;
            color: #666;
        }
    }
}
</style>