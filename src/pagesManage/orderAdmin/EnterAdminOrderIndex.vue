<template>
    <view class="shop-list-container">
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="nav-bar">
                <view class="back-btn" @click="handleBack">
                    <uni-icons :type="backIcon" color="#fff" size="24" />
                </view>
                <text class="title">选择商家</text>
            </view>
        </view>

        <view class="shop-list">
            <view v-for="shop in shopList" :key="shop.id" class="shop-card" @click="goToOrderManage(shop)">
                <image class="shop-image" :src="shop.avatar || '/static/default-shop.png'" mode="aspectFill" />
                <view class="shop-info">
                    <text class="shop-name">{{ shop.name }}</text>
                    <view class="shop-details">
                        <text class="shop-address">{{ shop.address }}</text>
                        <text class="shop-time">{{ shop.openTime }} - {{ shop.closeTime }}</text>
                    </view>
                    <view class="shop-status" :class="{ active: shop.status === '正常' }">
                        {{ shop.status }}
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { request } from '@/utils/request'

const statusBarHeight = ref(0)
const backIcon = ref('back')
const shopList = ref([])

onMounted(async () => {
    statusBarHeight.value = uni.getWindowInfo().statusBarHeight
    if (getCurrentPages().length == 1) {
        backIcon.value = "home"
    }
    await loadShopList()
})

// 加载商家列表
const loadShopList = async () => {
    try {
        const res = await request({
            url: '/admin/selectallshop',
            method: 'POST'
        })
        if (res.code === 200 && res.data) {
            shopList.value = res.data
        } else {
            uni.showToast({
                title: '获取商家列表失败',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('获取商家列表失败:', error)
        uni.showToast({
            title: '获取商家列表失败',
            icon: 'none'
        })
    }
}

// 返回处理
const handleBack = () => {
    if (getCurrentPages().length == 1) {
        uni.switchTab({
            url: "/pages/index/index"
        })
    } else {
        uni.navigateBack()
    }
}

// 跳转到订单管理页面
const goToOrderManage = (shop) => {
    uni.navigateTo({
        url: `../orderAdmin/AdminOrderIndex?shopid=${shop.id}`
    })
}
</script>

<style lang="scss" scoped>
$primary-color: #FF5500;

.shop-list-container {
    min-height: 100vh;
    background: #f8f9fb;
}

.header {
    background: linear-gradient(135deg, #FF5500 0%, #FF8E53 100%);
    padding-bottom: 30rpx;
    position: sticky;
    top: 0;
    z-index: 100;

    .nav-bar {
        display: flex;
        align-items: center;
        padding: 20rpx 30rpx;

        .back-btn {
            width: 64rpx;
            height: 64rpx;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.3);
            margin-right: 20rpx;
        }

        .title {
            color: #fff;
            font-size: 36rpx;
            font-weight: 600;
        }
    }
}

.shop-list {
    padding: 30rpx;

    .shop-card {
        background: #fff;
        border-radius: 24rpx;
        margin-bottom: 30rpx;
        display: flex;
        padding: 24rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
        transition: all 0.3s;

        &:active {
            transform: scale(0.98);
            opacity: 0.9;
        }

        .shop-image {
            width: 160rpx;
            height: 160rpx;
            border-radius: 16rpx;
            margin-right: 24rpx;
        }

        .shop-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .shop-name {
                font-size: 32rpx;
                font-weight: 600;
                color: #333;
                margin-bottom: 12rpx;
            }

            .shop-details {
                font-size: 26rpx;
                color: #666;

                .shop-address {
                    display: block;
                    margin-bottom: 8rpx;
                }

                .shop-time {
                    color: #999;
                }
            }

            .shop-status {
                position: absolute;
                top: 24rpx;
                right: 24rpx;
                padding: 6rpx 16rpx;
                border-radius: 24rpx;
                font-size: 24rpx;
                background: #f5f5f5;
                color: #999;

                &.active {
                    background: rgba($primary-color, 0.1);
                    color: $primary-color;
                }
            }
        }
    }
}
</style>