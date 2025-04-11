<template>
    <view class="admin-container">
        <!-- 管理员控制面板 -->
        <view class="admin-header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="header-content">
                <view class="header-left">
                    <text class="admin-title">系统管理控制台</text>
                    <view class="admin-status">
                        <uni-icons type="circle-filled" size="14" color="#00c292" />
                        <text>服务运行正常</text>
                    </view>
                </view>
            </view>
            <view class="header-content">
                <view class="quick-stats">
                    <view class="stat-item">
                        <text class="stat-value">--</text>
                        <text class="stat-label">待审商家</text>
                    </view>
                    <view class="stat-item">
                        <text class="stat-value">--</text>
                        <text class="stat-label">注册用户</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 管理功能区 -->
        <view class="admin-panel">
            <!-- 数据概览 -->
            <view class="dashboard-cards">
                <view class="card analytic-card">
                    <view class="card-header">
                        <uni-icons type="pulldown" size="24" color="#fff" />
                        <text>本周新增</text>
                    </view>
                    <view class="card-body">
                        <view class="analytic-item">
                            <text class="value">--</text>
                            <text class="label">商家</text>
                        </view>
                        <view class="analytic-item">
                            <text class="value">--</text>
                            <text class="label">用户</text>
                        </view>
                    </view>
                </view>

                <!-- <view class="card notice-card">
                    <view class="card-header">
                        <uni-icons class="icon" type="info-filled" size="24" color="#fff" />
                        <text>系统通知</text>
                    </view>
                    <view class="notice-list">
                        <view class="notice-item">新版审核流程已上线</view>
                        <view class="notice-item">系统维护计划预告</view>
                    </view>
                </view> -->
            </view>

            <!-- 功能导航 -->
            <view class="panel-section">
                <view class="section-header">
                    <text class="section-title">核心管理功能</text>
                    <view class="section-actions">
                        <uni-icons type="more" size="24" color="#666" />
                    </view>
                </view>

                <view class="function-grid">
                    <view class="grid-item merchant-list" @click="goToManage(`productManage/EnterProductManageIndex`)"
                        @touchstart="handleTouchStart" @touchend="handleTouchEnd">
                        <view class="icon-wrapper">
                            <uni-icons type="shop-filled" size="36" color="#fff" />
                        </view>
                        <text class="item-title">商家列表</text>
                        <text class="item-subtitle">管理所有入驻商家商品</text>
                    </view>

                    <view class="grid-item merchant-audit" @click="goToManage(`approval_list/index`)"
                        @touchstart="handleTouchStart" @touchend="handleTouchEnd">
                        <view class="icon-wrapper">
                            <uni-icons type="shop" size="36" color="#fff" />
                        </view>
                        <text class="item-title">test商家审核</text>
                        <text class="item-subtitle">test3 条待审申请</text>
                        <view class="badge">test</view>
                    </view>

                    <!-- <view class="grid-item user-manage" @click="goToManage(``)" @touchstart="handleTouchStart"
                        @touchend="handleTouchEnd">
                        <view class="icon-wrapper">
                            <uni-icons type="person-filled" size="36" color="#fff" />
                        </view>
                        <text class="item-title">用户管理</text>
                        <text class="item-subtitle">暂无</text>
                    </view> -->
                    <view class="grid-item merchant-list" @click="goToManage(`orderAdmin/EnterAdminOrderIndex`)"
                        @touchstart="handleTouchStart" @touchend="handleTouchEnd">
                        <view class="icon-wrapper">
                            <uni-icons type="shop-filled" size="36" color="#fff" />
                        </view>
                        <text class="item-title">商家订单</text>
                        <text class="item-subtitle">管理所有商家的订单</text>
                    </view>

                    <view class="grid-item user-manage" @click="goToManage(`banner_manage/index`)"
                        @touchstart="handleTouchStart" @touchend="handleTouchEnd">
                        <view class="icon-wrapper">
                            <uni-icons type="images" size="36" color="#fff" />
                        </view>
                        <text class="item-title">轮播图管理</text>
                        <text class="item-subtitle">管理首页轮播图</text>
                    </view>

                    <view class="grid-item user-manage" @click="goToManage(`shopLottery_manage/index`)"
                        @touchstart="handleTouchStart" @touchend="handleTouchEnd">
                        <view class="icon-wrapper">
                            <uni-icons type="vip" size="36" color="#fff" />
                        </view>
                        <text class="item-title">抽奖管理</text>
                        <text class="item-subtitle">管理商家抽奖</text>
                    </view>
                    <view class="grid-item user-manage" @click="goToManage(`merchantLucky/index`)"
                        @touchstart="handleTouchStart" @touchend="handleTouchEnd">
                        <view class="icon-wrapper">
                            <uni-icons type="vip" size="36" color="#fff" />
                        </view>
                        <text class="item-title">中奖记录</text>
                        <text class="item-subtitle">用户中奖记录</text>
                    </view>
                    <view class="grid-item user-manage" @click="goToManage(`shopRevenue_manage/index`)"
                        @touchstart="handleTouchStart" @touchend="handleTouchEnd">
                        <view class="icon-wrapper">
                            <uni-icons type="wallet-filled" size="36" color="#fff" />
                        </view>
                        <text class="item-title">营收细则</text>
                        <text class="item-subtitle">查看营收细则</text>
                    </view>

                    <view class="grid-item system-settings" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
                        <view class="icon-wrapper">
                            <uni-icons type="gear-filled" size="36" color="#fff" />
                        </view>
                        <button open-type="openSetting" bindopensetting="callback"
                            style="padding: 0;justify-content: center; display: flex;font-size: 28rpx;color: #FF5500;text-wrap: nowrap;">系统设置</button>
                        <text class="item-subtitle">配置系统参数</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>
<script setup>
import { onMounted, ref } from 'vue'

const statusBarHeight = ref(0)
onMounted(() => {
    statusBarHeight.value = uni.getWindowInfo().statusBarHeight
})

const handleTouchStart = (e) => {
    // e.currentTarget.style.transform = 'scale(0.98)'
}

const handleTouchEnd = (e) => {
    // e.currentTarget.style.transform = 'scale(1)'
}


const goToManage = (url) => {
    uni.navigateTo({ url: `../../../pagesManage/${url}` })
}
const goToMerchantList = () => {
    uni.navigateTo({ url: '/pages/shopProduncts_manage/index' })
}

const goToMerchantAudit = () => {
    uni.navigateTo({ url: '/pages/approval_list/index' })
}

const goToBannerManage = () => {
    uni.navigateTo({ url: '/pages/banner_manage/index' })
}
const goToUserManage = () => {
    uni.navigateTo({ url: '/pages/' })
}

const goToSystemSettings = () => {
    uni.navigateTo({ url: '/pages/' })
}
</script>

<style scoped lang="scss">
$primary-color: #fd8750;
$secondary-color: #00c292;
$warning-color: #ff5722;

.admin-container {
    min-height: 100vh;
    background: #f8f9fb;
}

.admin-header {
    background: $primary-color;
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

    .header-content {
        position: relative;
        z-index: 1;
        display: flex;
        padding: 10rpx;
        justify-content: space-between;
        align-items: flex-start;
    }

    .admin-title {
        font-size: 44rpx;
        color: #fff;
        font-weight: 600;
        margin-bottom: 16rpx;
    }

    .admin-status {
        display: flex;
        align-items: center;
        color: rgba(255, 255, 255, 0.9);
        font-size: 24rpx;
    }

    .quick-stats {
        display: flex;
        gap: 40rpx;
        background: rgba(255, 255, 255, 0.15);
        padding: 20rpx 40rpx;
        border-radius: 16rpx;

        .stat-item {
            text-align: center;

            .stat-value {
                font-size: 36rpx;
                color: #fff;
                font-weight: 600;
                display: block;
                line-height: 1.2;
            }

            .stat-label {
                font-size: 24rpx;
                color: rgba(255, 255, 255, 0.8);
            }
        }
    }
}

.dashboard-cards {
    display: grid;
    gap: 30rpx;
    padding: 0 30rpx;
    margin-top: -80rpx;
    position: relative;
    z-index: 1;

    .card {
        border-radius: 24rpx;
        padding: 30rpx;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);

        &.analytic-card {
            background: linear-gradient(135deg, $primary-color 0%, lighten($primary-color, 10%) 100%);
            color: #fff;
        }

        &.notice-card {
            background: #fff;
        }

        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 30rpx;
            font-size: 28rpx;

            .icon {
                margin-right: 15rpx;
            }
        }

        .card-body {
            display: flex;
            justify-content: space-around;

            .analytic-item {
                text-align: center;

                .value {
                    font-size: 40rpx;
                    font-weight: 600;
                    display: block;
                }

                .label {
                    font-size: 24rpx;
                    opacity: 0.8;
                }
            }
        }

        .notice-list {
            .notice-item {
                padding: 20rpx 0;
                border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
                font-size: 26rpx;

                &:last-child {
                    border-bottom: none;
                }
            }
        }
    }
}

.panel-section {
    padding: 30rpx;
    margin-top: 40rpx;

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40rpx;

        .section-title {
            font-size: 36rpx;
            font-weight: 600;
            color: $primary-color;
        }
    }

    .function-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 30rpx;

        .grid-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #fff;
            border-radius: 24rpx;
            padding: 40rpx;
            position: relative;
            overflow: hidden;
            transition: all 0.2s ease;
            box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.05);

            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 8rpx;
                background: $secondary-color;
            }

            &.merchant-audit::before {
                background: $warning-color;
            }

            .icon-wrapper {
                width: 80rpx;
                height: 80rpx;
                border-radius: 16rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 30rpx;
                background: rgba($secondary-color, 0.1);
            }

            .item-title {
                font-size: 32rpx;
                font-weight: 500;
                color: $primary-color;
                display: block;
                margin-bottom: 8rpx;
            }

            .item-subtitle {
                font-size: 24rpx;
                color: #666;
            }

            .badge {
                position: absolute;
                top: 20rpx;
                right: 20rpx;
                background: $warning-color;
                color: #fff;
                padding: 8rpx 16rpx;
                border-radius: 40rpx;
                font-size: 22rpx;
            }
        }
    }
}
</style>