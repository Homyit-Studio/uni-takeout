<template>
    <view class="container">
        <!-- 用户信息卡片 -->
        <view class="user-card" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="card-content">
                <image class="avatar" :src="userInfo.avatar" mode="aspectFill" @click="goToUserProfile"></image>
                <view class="user-meta">
                    <view class="name-line">
                        <text class="username">{{ userInfo.nickname || '点击头像登录' }}</text>
                        <view class="role-tag" :class="roleClass" @click.stop="showRoleSwitcher">
                            {{ roleText }}
                            <uni-icons type="bottom" color="#fff" size="20" />
                        </view>
                    </view>
                    <view class="user-stats" @click="goToTabbarPage('/pages/order/order')">
                        <view class="stat-item">
                            <text class="stat-value">{{ orderStats.unpaid }}</text>
                            <text class="stat-label">待付款</text>
                        </view>
                        <view class="stat-item">
                            <text class="stat-value">{{ orderStats.undelivered }}</text>
                            <text class="stat-label">待收货</text>
                        </view>
                        <!-- <view class="stat-item" @click="goToPage('/pages/wallet/index')">
                            <text class="stat-value">¥{{ walletBalance }}</text>
                            <text class="stat-label">我的余额</text>
                        </view> -->
                    </view>
                </view>
                <uni-icons @click="goToUserProfile" type="right" size="20" color="rgba(255,255,255,0.8)"
                    style="margin-top: 60rpx;"></uni-icons>
            </view>
        </view>

        <!-- 核心功能入口 -->
        <view class="core-functions">

            <!-- 版本切换按钮 -->
            <view class="version-switch" @click="toggleVersion">
                {{ currentVersion }} <uni-icons type="tune-filled" size="16" color="#fff"></uni-icons>
            </view>


            <view class="func-grid">
                <view class="func-item" @click="goToPage('/pages/group/order')">
                    <view class="icon-box group">
                        <uni-icons type="flag-filled" size="32" color="#fff"></uni-icons>
                    </view>
                    <text>我的拼团</text>
                </view>
                <view class="func-item" @click="goToTabbarPage('/pages/order/order')">
                    <view class="icon-box order">
                        <uni-icons type="cart-filled" size="32" color="#fff"></uni-icons>
                    </view>
                    <text>全部订单</text>
                </view>
                <view class="func-item" @click="goToPage('/pages/coupon/index')">
                    <view class="icon-box coupon">
                        <uni-icons type="gift-filled" size="32" color="#fff"></uni-icons>
                    </view>
                    <text>优惠券</text>
                </view>
                <view class="func-item" @click="goToPage('/pages/address/index')">
                    <view class="icon-box address">
                        <uni-icons type="location-filled" size="32" color="#fff"></uni-icons>
                    </view>
                    <text>收货地址</text>
                </view>
            </view>
        </view>

        <!-- 商家入口 -->
        <view class="merchant-entry-group">
            <!-- 普通用户显示入驻入口 -->
            <view class="merchant-entry" v-if="userRole === 'user'">
                <view class="entry-card apply-card" @click="goToMerchant">
                    <view class="card-content">
                        <uni-icons type="shop" size="44" color="#FF5500"></uni-icons>
                        <view class="text-content">
                            <text class="title">商家快速入驻</text>
                            <text class="subtitle">立即开启您的线上店铺</text>
                        </view>
                    </view>
                    <uni-icons type="arrowright" size="20" color="#999"></uni-icons>
                </view>
            </view>

            <!-- 商家/管理员显示管理入口 -->
            <view class="merchant-entry" v-else-if="showMerchantEntry">
                <view class="entry-card" @click="handleMerchantEntry">
                    <view class="card-content">
                        <uni-icons type="shop-filled" size="44" color="#FF5500"></uni-icons>
                        <view class="text-content">
                            <text class="title">{{ merchantEntryText }}</text>
                            <text class="subtitle">{{ merchantEntrySub }}</text>
                        </view>
                    </view>
                    <uni-icons type="arrowright" size="20" color="#999"></uni-icons>
                </view>
            </view>
        </view>

        <!-- 限时抢购 -->
        <view class="flash-sale" v-if="userRole !== 'admin'">
            <view class="section-header">
                <text class="title">限时抢购</text>
                <view class="countdown">
                    <text class="time">{{ countdown.hours }}</text>
                    <text>:</text>
                    <text class="time">{{ countdown.minutes }}</text>
                    <text>:</text>
                    <text class="time">{{ countdown.seconds }}</text>
                </view>
            </view>
            <scroll-view class="product-list" scroll-x>
                <view class="product-item" v-for="item in 4" :key="item">
                    <image class="product-image" src="/static/demo-product.jpg"></image>
                    <view class="product-info">
                        <text class="name">爆款套餐 {{ item }}</text>
                        <view class="price-line">
                            <text class="price">¥{{ 39.9 - item * 5 }}</text>
                            <text class="original-price">¥59.9</text>
                        </view>
                        <view class="progress-bar">
                            <view class="progress" :style="{ width: `${70 - item * 10}%` }"></view>
                            <text class="progress-text">已抢{{ 70 - item * 10 }}%</text>
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>
    </view>
</template>
<script setup>
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { ref, computed, onMounted } from 'vue'

// 用户角色状态
const userRole = ref(uni.getStorageSync('userRole') || 'user')

// 初始化用户信息
const statusBarHeight = ref(0)
const userInfo = ref({})
const orderStats = ref({ unpaid: 2, undelivered: 1 })
// const walletBalance = ref(158.50)
const countdown = ref({ hours: '02', minutes: '30', seconds: '45' })

// 版本信息
const currentVersion = ref('校园版')
const itemList = ['校园版', '社会版']
const toggleVersion = () => {
    uni.showActionSheet({
        itemList: ['校园版', '社会版'],
        success: (res) => {
            currentVersion.value = itemList[res.tapIndex]
            uni.setStorageSync('appVersion', currentVersion.value)
            uni.showToast({ title: `切换至${currentVersion.value}` })
        }
    })
}


// 计算属性
const roleText = computed(() => {
    return {
        user: '普通用户',
        merchant: '商家用户',
        admin: '平台管理员'
    }[userRole.value]
})

const roleClass = computed(() => `role-${userRole.value}`)

const showMerchantEntry = computed(() => ['merchant', 'admin'].includes(userRole.value))

const merchantEntryText = computed(() => {
    return userRole.value === 'admin' ? '平台管理中心' : '店铺管理后台'
})

const merchantEntrySub = computed(() => {
    return userRole.value === 'admin' ? '查看平台运营数据' : '处理待办订单和商品'
})

// 生命周期
onMounted(() => {
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
    getUserInfo() // 移除 loadUserInfo 调用，只使用 getUserInfo
    loadHotStores()
})

// 方法
const showRoleSwitcher = () => {
    // 首先检查本地存储的角色权限
    const roles = ['user']
    // 只有在本地存储中是商家或接口返回isStore时才能切换到商家角色
    if (userInfo.value.isStore) {
        roles.push('merchant')
    }
    // 只有在本地存储中是管理员或接口返回isAdmin时才能切换到管理员角色
    if (userInfo.value.isAdmin) {
        roles.push('admin')
    }

    uni.showActionSheet({
        itemList: roles.map(r => `切换为${r === 'admin' ? '管理员' : r === 'merchant' ? '商家' : '普通用户'}`),
        success: (res) => {
            // console.log(res)
            userRole.value = roles[res.tapIndex]
            uni.setStorageSync('userRole', userRole.value)
            // 切换角色后重新
            uni.reLaunch({ url: '/pages/my/my' })
            const data = uni.getStorageSync("userRole")
            if (data === 'admin') {
                // uni.showTabBar()
                uni.setTabBarItem({
                    index: 1,
                    text: '订单管理',
                    iconPath: '/static/tabbar/order.png',
                    selectedIconPath: '/static/tabbar/order-active.png',
                    visible: false
                })
                uni.setTabBarItem({
                    index: 0,
                    text: '管理控制台',
                    iconPath: '/static/tabbar/home.png',
                    selectedIconPath: '/static/tabbar/home-active.png',
                    // visible: false
                })
            } else if (data === 'merchant') {
                uni.setTabBarItem({
                    index: 1,
                    text: '订单管理',
                    iconPath: '/static/tabbar/order.png',
                    selectedIconPath: '/static/tabbar/order-active.png'
                })
                uni.setTabBarItem({
                    index: 0,
                    text: '店铺管理',
                    iconPath: '/static/tabbar/home.png',
                    selectedIconPath: '/static/tabbar/home-active.png',
                    // visible: false
                })
            } else {
                uni.setTabBarItem({
                    index: 1,
                    text: '订单',
                    iconPath: '/static/tabbar/order.png',
                    selectedIconPath: '/static/tabbar/order-active.png'
                })
                uni.setTabBarItem({
                    index: 0,
                    text: '首页',
                    iconPath: '/static/tabbar/home.png',
                    selectedIconPath: '/static/tabbar/home-active.png',
                    // visible: false
                })
            }
            uni.showToast({
                title: `已切换为${roleText.value}`,
                icon: 'none'
            })
        }
    })
}

const handleMerchantEntry = () => {
    const urlMap = {
        admin: '/pages/administrator/index',
        merchant: '/pages/merchant_manage/index'
    }
    uni.navigateTo({ url: urlMap[userRole.value] })
}



const availableRoles = computed(() => {
    const roles = ['user']
    if (userInfo.value.isStore) roles.push('merchant')
    if (userInfo.value.isAdmin) roles.push('admin')
    return roles
})


const mockFetchUserInfo = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: '12345',
                nickname: '测试用户',
                avatar: '/static/default-avatar.png',
                isStore: true,
                isAdmin: true
            })
        }, 1000)
    })
}
// 修改获取用户信息方法
const getUserInfo = async () => {
    try {
        // 模拟从接口获取用户信息
        const res = await mockFetchUserInfo()
        userInfo.value = res
        // 设置用户角色（优先使用本地存储的角色）
        const storedRole = uni.getStorageSync('userRole')
        if (storedRole) {
            userRole.value = storedRole
        } else {
            // 如果本地没有存储角色，则根据用户权限设置
            if (res.isAdmin) {
                userRole.value = 'admin'
            } else if (res.isStore) {
                userRole.value = 'merchant'
            } else {
                userRole.value = 'user'
            }
            // 将新设置的角色保存到本地
            uni.setStorageSync('userRole', userRole.value)
        }
    } catch (error) {
        console.error('获取用户信息失败', error)
        userRole.value = 'user'
    }
}


const hotStores = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isRefreshing = ref(false)

const goToUserProfile = () => {
    uni.login

    uni.navigateTo({
        url: '/pages/GetUserPhone/GetUserPhoneIndex'
    })
}

const goToPage = (url) => {
    uni.navigateTo({
        url
    })
}

const goToTabbarPage = (url) => {
    uni.switchTab({
        url
    })
}
const goToMerchant = () => {
    uni.navigateTo({
        url: '/pages/merchant/index'
    })
}

const goToMerchantManage = () => {
    uni.navigateTo({
        url: '/pages/merchant_manage/index'
    })
}

const goToAdministrator = () => {
    uni.navigateTo({
        url: '/pages/administrator/index'
    })
}

// 修改loadHotStores返回Promise
const loadHotStores = () => {
    return new Promise((resolve) => {
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
    setTimeout(() => {
        loadHotStores()
    }, 300) // 添加短暂延迟以改善用户体验
}

const goToStoreDetail = (storeId) => {
    uni.navigateTo({
        url: `/pages/store/detail?id=${storeId}`
    })
}

// 添加页面级下拉刷新
onPullDownRefresh(() => {
    page.value = 1
    hasMore.value = true
    loadHotStores().then(() => {
        uni.stopPullDownRefresh()
    })
})
</script>


<style scoped lang="scss">
$primary-color: #FF5500;
$secondary-color: #FFA99F;

.container {
    background: #f8f9fb;
    min-height: 100vh;
}

.user-card {
    background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
    padding: 30rpx 30rpx 60rpx;
    border-radius: 0 0 40rpx 40rpx;
    box-shadow: 0 10rpx 30rpx rgba(255, 113, 154, 0.2);

    .card-content {
        display: flex;
        align-items: center;
        position: relative;
    }

    .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        border: 4rpx solid rgba(255, 255, 255, 0.3);
    }

    .user-meta {
        flex: 1;
        margin-left: 30rpx;

        .name-line {
            display: flex;
            align-items: center;
            margin-bottom: 20rpx;

            .username {
                font-size: 30rpx;
                color: #fff;
                font-weight: 600;
                margin-right: 20rpx;
            }

            .role-tag {
                font-size: 24rpx;
                padding: 8rpx 20rpx;
                border-radius: 40rpx;
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.2);
                color: #fff;

                &.role-admin {
                    background: rgba(255, 87, 34, 0.2);
                }
            }
        }

        .user-stats {
            display: flex;
            gap: 40rpx;

            .stat-item {
                .stat-value {
                    font-size: 36rpx;
                    color: #fff;
                    font-weight: 600;
                    display: block;
                }

                .stat-label {
                    font-size: 24rpx;
                    color: rgba(255, 255, 255, 0.8);
                }
            }
        }
    }
}

.core-functions {
    padding: 30rpx;


    position: relative; // 使子元素绝对定位生效

    .version-switch {
        position: absolute;
        right: 40rpx;
        top: 20rpx;
        padding: 0 20rpx;
        color: #ffffff;
        font-size: 26rpx;
        display: flex;
        align-items: center;
        border-radius: 20rpx;
        background-color: #ff5500b0;
        cursor: pointer;
    }


    .func-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20rpx;
        background: #fff;
        padding: 30rpx;
        border-radius: 24rpx;
        box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);

        .func-item {
            text-align: center;

            .icon-box {
                width: 80rpx;
                height: 80rpx;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 15rpx;

                &.group {
                    background: #FF5500;
                }

                &.order {
                    background: #7FB5FF;
                }

                &.coupon {
                    background: #FFC107;
                }

                &.address {
                    background: #4CAF50;
                }
            }

            text {
                font-size: 26rpx;
                color: #666;
            }
        }
    }
}

.merchant-entry-group {
    padding: 0 30rpx;

    .merchant-entry {
        margin-top: 20rpx;

        .apply-card {
            background: linear-gradient(135deg, rgba(255, 113, 154, 0.1) 0%, rgba(255, 169, 159, 0.1) 100%);

            .title {
                color: #FF5500 !important;
            }
        }

        .entry-card {
            background: #fff;
            border-radius: 24rpx;
            padding: 30rpx;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

            .card-content {
                display: flex;
                align-items: center;

                .text-content {
                    margin-left: 20rpx;

                    .title {
                        font-size: 32rpx;
                        font-weight: 500;
                        color: $primary-color;
                    }

                    .subtitle {
                        font-size: 24rpx;
                        color: #999;
                    }
                }
            }
        }
    }
}

.flash-sale {
    padding: 30rpx;

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30rpx;

        .title {
            font-size: 36rpx;
            font-weight: 600;
        }

        .countdown {
            display: flex;
            align-items: center;
            color: $primary-color;

            .time {
                background: rgba(255, 113, 154, 0.1);
                padding: 8rpx 16rpx;
                border-radius: 8rpx;
                margin: 0 6rpx;
                font-weight: 500;
            }
        }
    }

    .product-list {
        white-space: nowrap;

        .product-item {
            display: inline-block;
            width: 280rpx;
            margin-right: 20rpx;
            background: #fff;
            border-radius: 16rpx;
            overflow: hidden;

            .product-image {
                width: 100%;
                height: 280rpx;
            }

            .product-info {
                padding: 10rpx 10rpx 40rpx 10rpx;

                .name {
                    font-size: 28rpx;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                    line-clamp: 2;
                    overflow: hidden;
                    // height: 50rpx;
                }

                .price-line {
                    margin: 15rpx 0;

                    .price {
                        color: $primary-color;
                        font-size: 32rpx;
                        font-weight: 600;
                    }

                    .original-price {
                        color: #999;
                        font-size: 24rpx;
                        text-decoration: line-through;
                        margin-left: 15rpx;
                    }
                }

                .progress-bar {
                    height: 8rpx;
                    background: #eee;
                    border-radius: 4rpx;
                    position: relative;

                    .progress {
                        height: 100%;
                        background: $primary-color;
                        border-radius: 4rpx;
                        transition: width 0.3s;
                    }

                    .progress-text {
                        position: absolute;
                        right: 0;
                        top: 12rpx;
                        font-size: 20rpx;
                        color: #666;
                    }
                }
            }
        }
    }
}
</style>