<template>
    <view class="container">
        <!-- 顶部导航栏 -->
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="nav-content">
                <view class="nav-left">
                    <text class="app-name">校园购</text>
                    <view class="location-icon" @click="goToAddress">
                        <uni-icons type="location-filled" size="18" color="#fff"></uni-icons>
                        <text class="address-text">浙江大学紫金港校区niaa</text>
                        <uni-icons type="arrowdown" size="14" color="#fff"></uni-icons>
                    </view>
                </view>
                <view class="search-wrapper" @click="goToSearch">
                    <view class="search-input">
                        <uni-icons type="search" size="18" color="#999"></uni-icons>
                        <text class="placeholder">搜索商家、美食</text>
                    </view>
                </view>
                <view class="nav-right">
                    <!-- <uni-icons type="search" size="18" color="#999"></uni-icons> -->
                </view>
            </view>
        </view>

        <!-- 轮播图 -->
        <swiper class="banner-swiper" :autoplay="true" :circular="true" indicator-active-color="#FF719A">
            <swiper-item v-for="(item, index) in bannerList" :key="index">
                <image :src="item.image" mode="aspectFill" class="banner-image" />
            </swiper-item>
        </swiper>

        <!-- 标签栏 -->
        <view class="tabs-container" :style="tabsStyle">
            <view class="tabs">
                <view v-for="(tab, index) in tabs" :key="index" class="tab-item"
                    :class="{ active: currentTab === index }" @click="switchTab(index)">
                    {{ tab.name }}
                    <view class="tab-line" v-if="currentTab === index"></view>
                </view>
            </view>
        </view>

        <!-- 内容区域 -->
        <view class="content">
            <!-- 热门拼团 -->
            <view v-show="currentTab === 0" class="tab-content">
                <view class="group-list">
                    <view class="group-card" v-for="(product, index) in hotProducts" :key="index"
                        @click="goToStoreDetail(product.id)">
                        <view class="store-header">
                            <image class="store-avatar" :src="product.头像" mode="aspectFill"></image>
                            <text class="store-name">{{ product.店铺 }}</text>
                            <view class="group-tag">3人团</view>
                        </view>
                        <view style="overflow: hidden;">
                            <scroll-view class="product-scroll" scroll-x>
                                <view class="product-images">
                                    <image class="product-image" v-for="(img, imgIndex) in product.images"
                                        :key="imgIndex" :src="img" mode="aspectFill"></image>
                                </view>
                            </scroll-view>
                        </view>
                        <view class="product-footer">
                            <text class="product-name">{{ product.name }}</text>
                            <view class="price-section">
                                <text class="current-price">¥{{ product.price }}</text>
                                <text class="original-price">¥{{ product.price + 5 }}</text>
                                <text class="sales">已拼{{ 235 + index * 15 }}件</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 热门商铺 -->
            <view v-show="currentTab === 1" class="tab-content">
                <view class="store-list">
                    <view class="store-card" v-for="(store, index) in hotStores" :key="index"
                        @click="goToProduct(store.id)">
                        <image class="store-cover" :src="store.image" mode="aspectFill"></image>
                        <view class="store-info">
                            <view class="store-header">
                                <text class="store-name">{{ store.name }}</text>
                                <view class="rating">
                                    <uni-icons type="star-filled" size="16" color="#FFB400"></uni-icons>
                                    <text>4.8</text>
                                </view>
                            </view>
                            <text class="store-desc">{{ store.description }}</text>
                            <view class="promotion-tag">
                                <text>满30减5</text>
                                <text>新用户立减8元</text>
                            </view>
                            <view class="hot-product">
                                <text class="product-name">{{ store.hotProduct.name }}</text>
                                <text class="product-price">¥{{ store.hotProduct.price }}</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 加载状态 -->
            <view class="loading-status">
                <text v-if="hasMore && hotProducts.length > 0">正在加载更多...</text>
                <text v-else-if="!hasMore && hotProducts.length > 0">—— 已经到底啦 ——</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app'

// 轮播图数据
const bannerList = ref([
    // { image: '/static/banner1.png' },
    { image: '/static/banner2.png' },
    { image: '/static/banner3.png' }
])


// 标签页配置
const tabs = [
    { name: '热门拼团' },
    { name: '热门商铺' }
]

const statusBarHeight = ref(0)
const navBarHeight = ref(40)
const currentTab = ref(0)
const tabsOffsetTop = ref(0)

// 计算标签栏样式
const tabsStyle = computed(() => ({
    top: `${statusBarHeight.value + navBarHeight.value}px`
}))

// 计算内容区域样式
// const contentStyle = computed(() => ({
//   paddingTop: isTabsFixed.value ? '88rpx' : '0'
// }))

// 切换标签
const switchTab = (index) => {
    currentTab.value = index
}

onMounted(() => {
    // 获取状态栏高度
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight

    // 获取nav-bar高度
    const query = uni.createSelectorQuery()
    query.select('.nav-bar').boundingClientRect(rect => {
        if (rect) {
            navBarHeight.value = rect.height
        }
    }).exec()

    // 获取标签栏位置
    query.select('.tabs').boundingClientRect(rect => {
        if (rect) {
            tabsOffsetTop.value = rect.top
        }
    }).exec()
})


// 响应式状态
const hotStores = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isRefreshing = ref(false)


// 添加搜索栏位置相关的响应式状态
const searchBarTop = ref(0)

// 离导航栏的高度
const navContentHeight = 80; // 单位rpx
const navContentHeightPx = ref(uni.upx2px(navContentHeight));
const totalNavHeight = computed(() => statusBarHeight.value + navContentHeightPx.value);

// 添加热门商品数据
const hotProducts = ref([
    {
        id: 1,
        name: '香辣鸡腿堡',
        店铺: '肯德基',
        price: 15.9,
        头像: '/static/logo.png',
        images: ['/static/goods.png', '/static/goods.png', '/static/goods.png', '/static/goods.png']
    },
    {
        id: 2,
        name: '双层牛肉堡',
        price: 20.9,
        店铺: '肯德基',
        头像: '/static/logo.png',
        images: ['/static/goods.png', '/static/goods.png', '/static/goods.png', '/static/goods.png']
    },
    {
        id: 3,
        name: '脆皮炸鸡',
        店铺: '肯德基',
        price: 25.9,
        头像: '/static/logo.png',
        images: ['/static/goods.png', '/static/goods.png', '/static/goods.png', '/static/goods.png']
    }
])

// 生命周期
onMounted(() => {
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
    loadHotStores()
    // 获取搜索栏的初始位置
    const query = uni.createSelectorQuery()
    query.select('.search-bar-anchor').boundingClientRect(rect => {
        if (rect) {
            searchBarTop.value = rect.top
        }
    }).exec()
})

// 方法
const loadHotStores = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockData = Array.from({ length: 10 }, (_, i) => ({
                id: i + (page.value - 1) * pageSize.value,
                name: `商家${i + (page.value - 1) * pageSize.value + 1}`,
                description: '特色美食，欢迎品尝',
                image: '/static/goods.png',
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
    loadHotStores()
}
// 跳转到地址页面
const goToAddress = () => {
    uni.navigateTo({
        url: '/pages/address/index'
    })
}
// 跳转到搜索页面
const goToSearch = () => {
    uni.navigateTo({
        url: '/pages/search/index'
    })
}

// 跳转到商家详情
const goToStoreDetail = (storeId) => {
    uni.navigateTo({
        url: `/pages/merchant_detail/index?id=${storeId}`
        // url: `/pages/merchant_detail/index`
    })
}

// 添加跳转到商品详情的方法
const goToProduct = (productId) => {
    uni.navigateTo({
        url: `/pages/product_detail/index?id=${productId}`
    })
}


// 使用onReachBottom替代scrolltolower
onReachBottom(() => {
    if (!hasMore.value) return
    page.value++
    loadHotStores()
})

const isNavSticky = ref(false)

// 监听页面滚动
onPageScroll(({ scrollTop }) => {
    // 控制粘性效果，根据实际布局调整阈值
    isNavSticky.value = scrollTop > 50
})


//权限控制 
const userRole = ref('user') // 默认用户角色

onMounted(async () => {
    // 从本地存储或API获取用户角色
    const role = uni.getStorageSync('userRole') || await getUserRole()
    userRole.value = role
})

const getUserRole = async () => {
    // 这里添加获取用户角色的API调用
    return 'user' // 默认返回用户角色
}
</script>

<style scoped lang="scss">
$primary-color: #FF5500;
$secondary-color: #FFA99F;

.container {
    background: #f8f9fb;
    min-height: 100vh;
}

.nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
    // padding-bottom: 20rpx;

    .nav-content {
        display: flex;
        align-items: center;
        // padding: 0 30rpx;
    }

    .nav-left {
        flex: 1;
        margin-right: -30rpx;
    }

    .app-name {
        color: #fff;
        font-size: 40rpx;
        font-weight: 700;
        margin-bottom: 10rpx;
        margin-left: 50rpx;
    }

    .location-icon {
        display: flex;
        align-items: center;

        .address-text {
            color: #fff;
            font-size: 26rpx;
            margin: 0 10rpx;
            max-width: 200rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .search-wrapper {
        flex: 1;
        // width: 300rpx;

        .search-input {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 40rpx;
            height: 60rpx;
            display: flex;
            align-items: center;
            padding: 0 30rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            .placeholder {
                color: #666;
                font-size: 26rpx;
                margin-left: 15rpx;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }

    .nav-right {
        flex: 1;
        text-align: right;
        margin-left: -50rpx;
    }
}

.banner-swiper {
    height: 320rpx;
    margin: 30rpx;
    border-radius: 20rpx;
    overflow: hidden;

    .banner-image {
        width: 100%;
        height: 100%;
    }
}

.tabs-container {
    background: #fff;
    position: sticky;
    padding: 0 30rpx;
    z-index: 99;

    .tabs {
        display: flex;
        border-bottom: 2rpx solid #f0f0f0;

        .tab-item {
            flex: 1;
            text-align: center;
            font-size: 32rpx;
            color: #666;
            padding: 25rpx 0;
            position: relative;

            &.active {
                color: $primary-color;
                font-weight: 500;

                .tab-line {
                    position: absolute;
                    bottom: -2rpx;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60rpx;
                    height: 4rpx;
                    background: $primary-color;
                    border-radius: 2rpx;
                }
            }
        }
    }
}

.content {
    padding: 30rpx;
}

/* 拼团列表样式 */
.group-list {
    .group-card {
        background: #fff;
        border-radius: 20rpx;
        margin-bottom: 30rpx;
        box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.03);

        .store-header {
            display: flex;
            align-items: center;
            padding: 25rpx;

            .store-avatar {
                width: 60rpx;
                height: 60rpx;
                border-radius: 12rpx;
                margin-right: 20rpx;
            }

            .store-name {
                font-size: 30rpx;
                font-weight: 500;
                flex: 1;
            }

            .group-tag {
                background: #FFF0F3;
                color: $primary-color;
                font-size: 24rpx;
                padding: 8rpx 20rpx;
                border-radius: 40rpx;
            }
        }

        .product-scroll {
            padding: 0 25rpx;
            z-index: -1;

            .product-images {
                display: flex;
                gap: 20rpx;

                .product-image {
                    width: 220rpx;
                    height: 220rpx;
                    border-radius: 12rpx;
                    flex-shrink: 0;
                }
            }
        }

        .product-footer {
            padding: 25rpx;

            .product-name {
                font-size: 28rpx;
                color: #333;
                margin-bottom: 15rpx;
                display: block;
            }

            .price-section {
                display: flex;
                align-items: center;

                .current-price {
                    color: $primary-color;
                    font-size: 36rpx;
                    font-weight: 600;
                    margin-right: 15rpx;
                }

                .original-price {
                    color: #999;
                    font-size: 24rpx;
                    text-decoration: line-through;
                    margin-right: auto;
                }

                .sales {
                    color: #666;
                    font-size: 24rpx;
                }
            }
        }
    }
}

/* 店铺列表样式 */
.store-list {
    .store-card {
        background: #fff;
        border-radius: 20rpx;
        margin-bottom: 30rpx;
        overflow: hidden;
        box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.03);

        .store-cover {
            width: 100%;
            height: 300rpx;
        }

        .store-info {
            padding: 25rpx;

            .store-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15rpx;

                .store-name {
                    font-size: 32rpx;
                    font-weight: 500;
                }

                .rating {
                    display: flex;
                    align-items: center;
                    color: #FFB400;
                    font-size: 26rpx;

                    text {
                        margin-left: 8rpx;
                    }
                }
            }

            .store-desc {
                color: #666;
                font-size: 26rpx;
                margin-bottom: 20rpx;
            }

            .promotion-tag {
                display: flex;
                gap: 15rpx;
                margin-bottom: 20rpx;

                text {
                    background: #FFF0F3;
                    color: $primary-color;
                    font-size: 22rpx;
                    padding: 6rpx 15rpx;
                    border-radius: 6rpx;
                }
            }

            .hot-product {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 20rpx;
                border-top: 2rpx solid #f8f8f8;

                .product-name {
                    color: #666;
                    font-size: 26rpx;
                }

                .product-price {
                    color: $primary-color;
                    font-size: 32rpx;
                    font-weight: 600;
                }
            }
        }
    }
}

.loading-status {
    text-align: center;
    padding: 40rpx 0;
    color: #999;
    font-size: 26rpx;
}
</style>