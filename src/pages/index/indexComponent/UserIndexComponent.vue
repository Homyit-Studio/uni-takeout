<template>
    <view class="container">

        <!-- 第一导航栏（需要上滑隐藏的） -->
        <view class="first-nav" :style="{
            transform: `scale(${1 - scrollProgress * 0.1})`,
            paddingTop: statusBarHeight + 'px'
        }">
            <!-- 位置信息 -->
            <view class="nav-content">
                <view class="nav-left">
                    <view class="location-icon" @click="goToAddress">
                        <uni-icons type="location-filled" style="margin-left: 10rpx;margin-right: -10rpx;" size="18"
                            color="#fff"></uni-icons>
                        <text class="address-text">{{ defaultAddress || "请添加地址 >" }}</text>
                        <uni-icons type="arrowdown" size="14" color="#fff"></uni-icons>
                    </view>
                    <view class="app-name">校园购</view>

                </view>
                <view class="nav-right">

                </view>
            </view>
            <!-- 搜索框 -->
            <view class="search-box" @click="goToSearch">
                <view class="search-input">
                    <text class="placeholder">搜索商家、美食</text>
                </view>
                <uni-icons style="padding: 0 50rpx;" type="search" size="30" color="#999"></uni-icons>
            </view>

            <swiper class="banner-swiper" :autoplay="true" :circular="true" indicator-active-color="#FF719A">
                <swiper-item v-for="(item, index) in bannerList" :key="index">
                    <image :src="item.image" mode="aspectFill" class="banner-image" />
                </swiper-item>
            </swiper>
        </view>

        <!-- 第二导航栏（固定显示的） -->
        <view class="fixed-nav" v-show="scrollProgress > 0" :style="{
            opacity: scrollProgress,
            paddingTop: statusBarHeight + 'px'
        }">
            <view class="nav-content">
                <view class="nav-left">
                    <text class="app-name">校园购</text>
                    <view class="location-icon" @click="goToAddress">
                        <uni-icons type="location-filled" style="margin-left: 10rpx;margin-right: -10rpx;" size="18"
                            color="#fff"></uni-icons>
                        <text class="address-text">{{ defaultAddress || "请添加地址 >" }}</text>
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

                </view>
            </view>
        </view>

        <!-- <view class="launch-container">
            <view class="launch-wrapper">
                <view class="launch-item" @click="goToLaunchLucky">
                    <image src="/static/lucky-draw.png" mode="aspectFill" class="launch-image"></image>
                    <text class="launch-text">幸运抽奖</text>
                </view>
            </view>
        </view> -->

        <!-- 选择取餐方式待定 -->
        <view class="choice-container">
            <!-- <view class="choice-wrapper">
                <view class="choice-item delivery" @click="handleDeliverySelect('delivery')"
                    :style="{ backgroundImage: 'url(/static/delivery-bg.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }">
                    <text>支持配送</text>
                </view>

                <view class="choice-item pickup" @click="handleDeliverySelect('pickup')"
                    :style="{ backgroundImage: 'url(/static/pickup-bg.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }">
                    <text>到店自提</text>
                </view>
            </view> -->
        </view>

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
        <!-- 滚动提示部分 -->
        <view class="scrolling-alert">
            <view class="scroll-container">
                <view class="scroll-content">
                    <view v-for="(message, index) in visibleMessages" :key="index" class="scroll-item" :class="{
                        'item-active': index === 0,
                        'item-next': index === 1
                    }">
                        {{ message }} 最近{{ recentJoinCount }}人正在拼团...
                    </view>
                </view>
            </view>
        </view>

        <!-- 内容区域 -->
        <view class="content">
            <!-- 热门拼团 -->
            <view v-show="currentTab === 0" class="tab-content">
                <view class="group-list">
                    <view class="group-card" v-for="(product, index) in hotProducts" :key="index"
                        @click="goToProduct(product.id)">
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
                        @click="goToStoreDetail(store.id)">
                        <image class="store-cover" :src="store.image" mode="aspectFill"></image>
                        <view class="store-info">
                            <view class="store-header">
                                <text class="store-name">{{ store.name }}</text>
                                <view class="rating">
                                    <uni-icons type="star-filled" size="16" color="#FFB400"></uni-icons>
                                    <text class="text">4.8</text>
                                </view>
                            </view>
                            <text class="store-desc">{{ store.description }}</text>
                            <view class="promotion-tag">
                                <text class="text">满30减5</text>
                                <text class="text">新用户立减8元</text>
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
import { ref, computed, onMounted, watch } from 'vue'
import { onPageScroll, onReachBottom, onShow } from '@dcloudio/uni-app'
import { request } from '../../../utils/request'
/*
* 重要：
* 不然滚动无效果
*/
const props = defineProps({
    scrollTop: {
        type: Number,
        default: 0
    }
})


// 轮播图数据
const bannerList = ref([
    // { image: '/static/banner1.png' },
    { image: '/static/banner2.png' },
    { image: '/static/banner3.png' }
])


// 标签页配置
const tabs = [
    { name: '热门拼团' },
    { name: '附近商铺' }
]

const statusBarHeight = ref(0)
const statusfirstPaddingTop = ref(0)
const navBarHeight = ref(40)
const currentTab = ref(0)
const tabsOffsetTop = ref(0)

// 新增滚动控制逻辑
const scrollY = ref(0)
const scrollProgress = ref(0)

const defaultAddress = ref(null)

const recentJoinCount = ref(12) // 最近参与人数
const scrollingMessages = ref([
    '用户D 刚刚参团成功！',
    '用户E 发起了一个新拼团！',
    '用户F 的拼团即将满员！'
])
// 修改后的数据逻辑
const currentIndex = ref(0)
const visibleMessages = ref([scrollingMessages.value[0]])

// 响应式状态
const hotStores = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

// 添加搜索栏位置相关的响应式状态
const searchBarTop = ref(0)

// 离导航栏的高度
// const navContentHeight = 80; // 单位rpx
// const navContentHeightPx = ref(uni.upx2px(navContentHeight));
// const totalNavHeight = computed(() => statusBarHeight.value + navContentHeightPx.value);

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

// 计算标签栏样式
const tabsStyle = computed(() => ({
    top: `${statusBarHeight.value + navBarHeight.value}px`
}))


// watch(() => props.scrollTop, (newVal) => {
//     const progress = Math.min(newVal / 50, 1)
//     scrollProgress.value = progress
// })

onPageScroll((e) => {
    scrollY.value = e.scrollTop
    // 计算滚动进度（0-1之间）
    const maxScroll = 200 // 控制滚动效果的最大滚动距离
    scrollProgress.value = Math.min(e.scrollTop / maxScroll, 1)

})
onMounted(() => {
    startMessageRotation()
    // 获取状态栏高度
    statusBarHeight.value = uni.getWindowInfo().statusBarHeight
    statusfirstPaddingTop.value = uni.getWindowInfo().statusBarHeight
    // 获取nav-bar高度
    const query = uni.createSelectorQuery()
    query.select('.fixed-nav').boundingClientRect(rect => {
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
    // 获取搜索栏的初始位置
    query.select('.search-bar-anchor').boundingClientRect(rect => {
        if (rect) {
            searchBarTop.value = rect.top
        }
    }).exec()
})

onShow(async () => {
    // 获取本地存储的地址列表
    const savedAddress = uni.getStorageSync('defaultAddress') || []
    if (savedAddress) {
        // 查找默认地址
        // const defaultAddr = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0]
        // 拼接地址信息
        // defaultAddress.value = `${defaultAddr.province}${defaultAddr.city}${defaultAddr.area}${defaultAddr.detail}`
        defaultAddress.value = savedAddress.address
    }
    allStore()
    loadHotStores()
})

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
// 动态滚动
const startMessageRotation = () => {
    setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % scrollingMessages.value.length

        // 先添加新消息（保持两条数据）
        visibleMessages.value = [
            scrollingMessages.value[currentIndex.value],
            scrollingMessages.value[(currentIndex.value + 1) % scrollingMessages.value.length]
        ]

        // 500ms后移除旧消息
        setTimeout(() => {
            visibleMessages.value = [scrollingMessages.value[currentIndex.value]]
        }, 500)
    }, 3000)
}

// 切换标签
const switchTab = (index) => {
    currentTab.value = index
}

// // 方法
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

// 获取商家数据
const allStore = async () => {
    try {
        const res = await request({
            url: '/shop/getshops'
        })
        console.log(res.data)
    } catch (error) {
        console.log("获取商家数据失败", error)
    }
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
const goToLaunchLucky = () => {
    uni.navigateTo({
        url: '/pages/launch_lucky/index'
    })
}
// 跳转到商家详情
const goToStoreDetail = (storeId) => {
    uni.navigateTo({
        url: `/pages/merchantDetail/index?id=${storeId}`
        // url: `/pages/merchant_detail/index`
    })
}

// 添加跳转到商品详情的方法
const goToProduct = (productId) => {
    uni.navigateTo({
        url: `/pages/productDetail/ProductDetailIndex?id=${productId}`
    })
}

/*
*自提与外卖选择暂未实现
* @param {string} type - 选择类型，可以是'delivery'或'takeout'
**/

const handleDeliverySelect = (type) => {
    console.log('选择类型:', type)
    // 这里可以添加跳转逻辑或状态变更逻辑
    // if (type === 'delivery') {
    //     uni.navigateTo()
    // } else {
    //     uni.navigateTo()
    // }
}


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

.first-nav {
    position: relative;
    z-index: 90;
    padding: 10rpx 10rpx;
    background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
    transform-origin: top center;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);


    .nav-content {
        display: flex;
        align-items: center;
        // padding: 0 30rpx;

        .nav-left {
            flex: 2;
            height: 80rpx; // 明确容器高度
            display: flex;
            align-items: center; // 垂直居中
            position: relative; // 建立定位上下文

            .app-name {
                flex: 1;
                color: #fff;
                font-size: 40rpx;
                font-weight: 700;
                width: 300rpx;
                // margin-left: 40rpx;
                margin-bottom: 20rpx;
                // margin-left: 50rpx;
            }

            .location-icon {
                flex: 1;
                display: flex;
                align-items: flex-end;
                padding: 10rpx 0;

                .address-text {
                    color: #fff;
                    font-size: 30rpx;
                    font-weight: 500;
                    margin: 0 10rpx;
                    width: 260rpx;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }

        .nav-right {
            flex: 1;
        }

    }

    .search-box {
        transition: all 0.3s;
        transform-origin: top center;
        box-sizing: border-box;
        display: flex;
        // width: calc(100% - 80rpx);
        justify-content: space-between;
        margin: 0 40rpx;
        border-radius: 10rpx;
        background: #fff;

        .search-input {

            transition: all 0.3s;
            // 初始状态
            // width: 600rpx;
            height: 50rpx;
            display: flex;
            align-items: center;
            padding: 0 50rpx;

            .placeholder {
                color: #666;
                font-size: 28rpx;
                margin-left: 15rpx;
            }
        }
    }
}


/* 第二导航栏样式 */
.fixed-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    transform: translateY(0);
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    // box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
    // padding-bottom: 20rpx;

    .search-box {
        padding: 20rpx 0 40rpx;

        .search-input {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 40rpx;
            height: 80rpx;
            display: flex;
            align-items: center;
            padding: 0 30rpx;

            .placeholder {
                color: #666;
                font-size: 28rpx;
                margin-left: 15rpx;
            }
        }
    }

    .nav-content {
        display: flex;
        align-items: center;
        // padding: 0 30rpx;
    }

    .nav-left {
        flex: 1;
        margin-right: -50rpx;
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

.scrolling-alert {
    height: 60rpx;
    overflow: hidden;
    position: relative;
    background: #fff8e6;
    margin: 20rpx 20rpx;
    border-radius: 10rpx;

    .scroll-container {
        height: 100%;
        position: relative;
        margin-left: 100rpx;

        .scroll-content {
            height: 100%;
            position: relative;

            .scroll-item {
                position: absolute;
                width: 100%;
                height: 60rpx;
                line-height: 60rpx;
                font-size: 26rpx;
                color: #ff9900;
                transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                transform: translateY(100%);
                opacity: 0;

                &.item-active {
                    transform: translateY(0);
                    opacity: 1;
                    z-index: 2;
                }

                &.item-next {
                    transform: translateY(-100%);
                    opacity: 0;
                    z-index: 1;
                }
            }
        }
    }
}



.banner-swiper {
    height: 300rpx;
    margin: 25rpx;
    border-radius: 10rpx;
    overflow: hidden;

    .banner-image {
        width: 100%;
        height: 100%;
    }
}

/* 修改后的样式 */
.choice-container {
    // padding: 10rpx;
    // margin: 10rpx 0;

    .choice-wrapper {
        height: 200rpx;
        position: relative;
        display: flex;
        border-radius: 24rpx;
        overflow: visible;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    }

    .choice-item {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background: #fff;
        background-size: cover;
        background-position: center;
        transition: all 0.3s;

        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            // background: rgba(0, 0, 0, 0.1);
            z-index: 1;
        }

        .text {
            position: relative;
            color: #000000;
            font-family: '宋体';
            font-size: 40rpx;
            font-weight: 600;
            text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
            z-index: 2;
        }

        &.delivery {
            clip-path: polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%);
            border-radius: 24rpx 0 0 24rpx;
            margin-right: -40rpx;
        }

        &.pickup {
            clip-path: polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%);
            border-radius: 0 24rpx 24rpx 0;
            margin-left: -40rpx;
        }
    }
}

.tabs-container {
    background: #fff;
    position: sticky;
    margin-top: -20rpx;
    border-top-left-radius: 20rpx;
    border-top-right-radius: 20rpx;
    padding: 0 30rpx;
    z-index: 99;
    border-bottom: 0.0625rem solid #ddd;

    .tabs {
        display: flex;

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
    padding: 20rpx;
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

                    .text {
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

                .text {
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