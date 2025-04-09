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
            <view v-for="shop in shopList" :key="shop.id" class="shop-card">
                <view class="card-content" @click="goToProductManage(shop)">
                    <image class="shop-image" :src="shop.avatar || '/static/default-shop.png'" mode="aspectFill" />
                    <view class="shop-info">
                        <text class="shop-name">店铺名称：{{ shop.name }}</text>
                        <view class="shop-details">
                            <text class="shop-address">店铺地址：{{ shop.address }}</text>
                            <text class="shop-time">营业时间：{{ shop.openTime }} - {{ shop.closeTime }}</text>
                        </view>
                        <view class="shop-status" :class="getStatusClass(shop.status)">
                            {{ shop.status }}
                        </view>
                    </view>
                </view>
                <view class="shop-actions">
                    <button v-if="shop.status === '正常'" class="action-btn ban-btn"
                        @click="handleBanShop(shop)">封禁商家</button>
                    <button v-if="shop.status === '封禁'" class="action-btn unban-btn"
                        @click="handleUnbanShop(shop)">解除封禁</button>
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

// 跳转到商品管理页面
const goToProductManage = (shop) => {
    uni.navigateTo({
        url: `/pages/productManage/ProductManageIndex?id=${shop.id}`
    })
}

// 获取状态对应的样式类
const getStatusClass = (status) => {
    switch (status) {
        case '正常':
            return 'status-normal'
        case '禁用':
            return 'status-banned'
        case '待审核':
            return 'status-pending'
        default:
            return ''
    }
}

// 处理封禁商家
const handleBanShop = async (shop) => {
    // 显示确认弹框
    uni.showModal({
        title: '确认封禁',
        content: `确定要封禁商家「${shop.name}」吗？封禁后该商家将无法继续经营。`,
        confirmText: '确认封禁',
        confirmColor: '#FF5500',
        cancelText: '取消',
        success: async (res) => {
            if (res.confirm) {
                try {
                    const res = await request({
                        url: '/admin/banshop',
                        method: 'POST',
                        data: {
                            shopid: shop.id,
                        }
                    })
                    if (res.code === 200) {
                        uni.showToast({
                            title: '封禁成功',
                            icon: 'success'
                        })
                        await loadShopList() // 重新加载列表
                    }
                } catch (error) {
                    console.error('封禁商家失败:', error)
                    uni.showToast({
                        title: '封禁失败',
                        icon: 'none'
                    })
                }
            }
        }
    })
}

// 处理解除封禁
const handleUnbanShop = async (shop) => {
    // 显示确认弹框
    uni.showModal({
        title: '确认解封',
        content: `确定要解除商家「${shop.name}」的封禁状态吗？`,
        confirmText: '确认解封',
        confirmColor: '#07C160',
        cancelText: '取消',
        success: async (res) => {
            if (res.confirm) {
                try {
                    const res = await request({
                        url: '/admin/unbanshop',
                        method: 'POST',
                        data: {
                            shopid: shop.id,
                        }
                    })
                    if (res.code === 200) {
                        uni.showToast({
                            title: '解除封禁成功',
                            icon: 'success'
                        })
                        await loadShopList() // 重新加载列表
                    }
                } catch (error) {
                    console.error('解除封禁失败:', error)
                    uni.showToast({
                        title: '解除封禁失败',
                        icon: 'none'
                    })
                }
            }
        }
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
        flex-direction: column;
        padding: 24rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
        transition: all 0.3s;

        &:active {
            transform: scale(0.98);
            opacity: 0.9;
        }

        .card-content {
            display: flex;
            flex: 1;
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
            position: relative; // 添加这行，让 absolute 定位生效

            .shop-name {
                font-size: 32rpx;
                font-weight: 600;
                color: #666;
                margin-bottom: 12rpx;
            }

            .shop-details {
                font-size: 26rpx;
                color: #999;

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
                z-index: 1; // 添加这行，确保状态显示在最上层

                &.status-normal {
                    background: rgba(7, 193, 96, 0.1);
                    color: #07C160;
                }

                &.status-banned {
                    background: rgba(255, 85, 0, 0.1);
                    color: #FF5500;
                }

                &.status-pending {
                    background: rgba(255, 164, 0, 0.1);
                    color: #FFA400;
                }

                &.active {
                    background: rgba($primary-color, 0.1);
                    color: $primary-color;
                }
            }
        }

        .shop-actions {
            display: flex;
            padding-top: 20rpx;
            margin-top: 20rpx;
            border-top: 2rpx solid #eee;

            .action-btn {
                flex: 1;
                margin: 0 10rpx;
                height: 60rpx;
                line-height: 60rpx;
                font-size: 24rpx;
                border-radius: 30rpx;

                &.ban-btn {
                    border: #FF5500 1px solid;
                    color: #666;
                }

                &.unban-btn {
                    border: #07C160 1px solid;
                    color: #666;
                }
            }
        }
    }
}
</style>