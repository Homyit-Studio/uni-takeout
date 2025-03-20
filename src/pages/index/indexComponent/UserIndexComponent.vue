<template>
    <view class="container">
        <!-- 导航栏 -->
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="nav-content">
                <view cla>
                    <text class="app-name">校园购</text>
                    <view class="location-icon" @click="goToAddress">
                        <uni-icons type="location" size="16" color="#fff"></uni-icons>
                        <text
                            style="font-size: 24rpx; color: #f6f6f6;width: 150rpx;overflow: hidden;text-overflow:ellipsis;white-space:nowrap;">收货地址收货地址收货地址收货地址</text>
                        <uni-icons type="down" size="14" color="#fff"></uni-icons>
                    </view>
                </view>

                <view class="search-wrapper" @click="goToSearch">
                    <view class="search-input">
                        <uni-icons type="search" size="16" color="#999" style="margin-left: 30rpx;"></uni-icons>
                        <text class="placeholder">搜索商家、美食</text>
                    </view>
                </view>
            </view>

        </view>
        <!-- 动态地址相关获取待补充 -->
        <!-- <div class="OurAddress" @click="chooseLocation">
        <view class="address-content">
          <view class="location-icon">
            <uni-icons type="location" size="20" color="#fff"></uni-icons>
          </view>
          <view class="address-info">
            <view class="current-address">{{ address || '正在获取地址...' }}</view>
            <view class="address-tip">{{ addressTip }}</view>
          </view>
          <view class="arrow-icon">
            <uni-icons type="right" size="16" color="#fff"></uni-icons>
          </view>
        </view>
      </div> -->

        <!-- 轮播图 -->
        <swiper class="banner-swiper" :indicator-dots="true" indicator-active-color="#fff" :autoplay="true"
            :interval="3000" :circular="true" :duration="1000">
            <swiper-item v-for="(item, index) in bannerList" :key="index">
                <image :src="item.image" mode="aspectFill" class="banner-image" />
            </swiper-item>
        </swiper>
        <!-- 标签栏 -->
        <view class="tabs" :style="tabsStyle">
            <view class="tab-item" v-for="(tab, index) in tabs" :key="index" :class="{ active: currentTab === index }"
                @click="switchTab(index)">
                {{ tab.name }}
                <view class="tab-line" v-if="currentTab === index"></view>
            </view>
        </view>

        <!-- 内容区域 -->
        <view class="content">
            <!-- 热门商家内容 -->
            <view v-show="currentTab === 0" class="tab-content">
                <view class="product-list">
                    <view class="product-item" v-for="(product, index) in hotProducts" :key="index"
                        @click="goToStoreDetail(product.id)">
                        <view style="display: flex;width: 100%;">
                            <image :src="product.头像" mode="scaleToFill"
                                style="margin: 20rpx; width: 80rpx;height: 80rpx;" />
                            <text style="margin: 20rpx 0;">{{ product.店铺 }}</text>
                        </view>
                        <hr
                            style="margin:10rpx 10rpx 30rpx 10rpx;width: 95%; border: none; border-bottom: 1rpx solid #f0f0f0;" />

                        <view class="product-info">
                            <text class="product-name">{{ product.name }}</text>
                            <scroll-view class="product-images" scroll-x="true" show-scrollbar="false">
                                <view class="image-container">
                                    <image class="product-image" v-for="(img, imgIndex) in product.images"
                                        :key="imgIndex" :src="img" mode="aspectFill"></image>
                                </view>
                            </scroll-view>
                            <text class="product-price">¥{{ product.price }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 热门商品内容 -->
            <view v-show="currentTab === 1" class="tab-content">
                <view class="store-list">
                    <view class="store-item" v-for="(store, index) in hotStores" :key="index"
                        @click="goToProduct(store.id)">
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
            </view>

            <view class="loading-more" v-if="hasMore && hotProducts.length > 0">加载更多...</view>
            <view class="no-more" v-if="!hasMore && hotProducts.length > 0">没有更多了</view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app'

// 轮播图数据
const bannerList = ref([
    { image: '/static/banner1.png' },
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
.banner-swiper {
    width: 95%;
    height: 300rpx;
    margin: 20rpx;

    .banner-image {
        border-radius: 20rpx;
        width: 100%;
        height: 100%;
    }
}


.nav-bar {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background-image: linear-gradient(-225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%);
}

.tabs {
    display: flex;
    position: sticky;
    border-radius: 10rpx;
    height: 74rpx;
    background: #ffffff;
    box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    z-index: 99;
    width: 95%;
    margin: 20rpx;
    transition: all 0.3s;
}

.tab-item {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 28rpx;
    width: 40rpx;
    color: #333;
    position: relative;

    &.active {
        color: #ff5500;
        font-weight: bold;
    }

    .tab-line {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background: #ff5500;
        border-radius: 2rpx;
    }
}

.content {
    position: relative;
    transition: all 0.3s;
}

.tab-content {
    // padding: 20rpx;
    min-height: calc(100vh - 200rpx);
}

.content-swiper {
    width: 100%;
}

.tab-content {
    height: 100%;
    // padding: 20rpx;
    box-sizing: border-box;
}

.sticky-container {
    position: sticky;
    top: 0;
    z-index: 1000;
    background-image: linear-gradient(-225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%);
}

.main-nav {
    padding: 20rpx 30rpx;
    display: flex;
    align-items: center;
}

.tab-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50%;
    height: 4rpx;
    background: #FF5500;
    transition: transform 0.3s ease;
}

.content-swiper {
    flex: 1;
}

.scroll-view {
    height: 100%;
    padding: 20rpx;
    box-sizing: border-box;
}

.container {
    min-height: 100vh;
    position: relative;
    background-color: #f7f7f7;

    .sticky-nav {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        background-image: linear-gradient(-225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%);
    }

}

.status-bar {
    width: 100%;
    background-image: linear-gradient(-225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%);
    /* background-color: ; */
}

.search-bar-anchor {
    height: 0;
    position: relative;
    z-index: 1;
}

.search-bar {
    position: relative;
    padding: 20rpx;
    background-color: #ffffff;
    z-index: 100;
}

.search-bar.fixed {
    position: fixed;
    left: 0;
    right: 0;
    background-color: #ffffff;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.search-bar-placeholder {
    height: 80rpx;
    /* 搜索栏高度 */
}

.placeholder {
    margin-left: 10rpx;
    color: #999;
    font-size: 28rpx;
}

.content {
    position: relative;
    z-index: 1;
    padding: 20rpx;
    padding-top: 0;
}

.section-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
}

::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    color: transparent;
}

.store-list {
    margin-top: 20rpx;
    display: flex;
    flex-direction: column;
    gap: 30rpx;
}

.store-item {
    display: flex;
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
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

.custom-nav {
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    padding: 0 0 10rpx 10rpx;
    position: fixed;
    z-index: 1000;
    background-image: linear-gradient(-225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%);
}

.nav-content {
    display: flex;
    align-items: center;
    height: 80rpx;


}

.app-name {
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 700;
    // margin-right: 24rpx;
    padding-left: 50rpx;
    // font-family:;
}

.search-wrapper {
    flex: 1;
    // margin-right: 20rpx;
    // height: 88rpx;
}

.search-input {
    border-radius: 36rpx;
    height: 60rpx;
    width: 300rpx;
    // margin: 44rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    // justify-content: center;
    background-color: rgba(255, 255, 255, 0.9);
}

.location-icon {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 28rpx;
    height: 30;
    margin-right: 20rpx;
}

.placeholder {
    margin-left: 12rpx;
    color: #999;
    font-size: 26rpx;
}

.categories {
    display: flex;
    gap: 20rpx;
}

.category-item {
    flex: 1;
    background-color: #fff;
    border-radius: 12rpx;
    padding: 20rpx;
}

.product-list {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 20rpx;
    margin-top: 20rpx;
}

.product-item {
    background: #fff;
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.product-image {
    width: 200rpx;
    height: 200rpx;
    margin: 5rpx;
    box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 1px;
    // object-fit: cover;
}

.product-info {
    display: flex;
    flex-direction: column;
    padding: 0 16rpx 16rpx 16rpx;
}

.product-name {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 8rpx;
}

.product-price {
    font-size: 32rpx;
    color: #ff5500;
    font-weight: bold;
}

.product-images {
    width: 100%;
    white-space: nowrap;
    margin: 10rpx 0;

    .image-container {
        display: inline-flex;
        padding: 10rpx;
    }

    .product-image {
        width: 200rpx;
        height: 200rpx;
        margin-right: 10rpx;
        flex-shrink: 0;
        border-radius: 8rpx;

        &:last-child {
            margin-right: 0;
        }
    }
}

.OurAddress {
    padding: 20rpx 30rpx;
    background-color: #ff5500;

    .address-content {
        display: flex;
        align-items: center;

        .location-icon {
            margin-right: 20rpx;
        }

        .address-info {
            flex: 1;

            .current-address {
                color: #fff;
                font-size: 32rpx;
                font-weight: bold;
                margin-bottom: 4rpx;
            }

            .address-tip {
                color: rgba(255, 255, 255, 0.8);
                font-size: 24rpx;
            }
        }

        .arrow-icon {
            margin-left: 20rpx;
        }
    }
}
</style>