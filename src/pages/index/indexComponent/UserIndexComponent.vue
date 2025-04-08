<template>
    <view class="container">

        <!-- 第一导航栏（需要上滑隐藏的） -->
        <view class="first-nav" :style="{
            transform: `scale(${1 - scrollY * 0.1})`,
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

            <!-- <view class="goTo">
                <view class="goTo-wrapper">
                    <view class="goTo-item" @click="goToLaunchLucky">
                        <uni-icons type="gift-filled" color="#fff" size="32" />
                        <text class="goTo-text">去抽奖</text>
                    </view>
                </view>
            </view> -->
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
                <view class="goTo-item" @click="goToLaunchLucky">
                    <uni-icons type="gift-filled" color="#FF5500" size="32" />
                    <text class="goTo-text">去抽奖</text>
                </view>
            </view>
        </view>
        <!-- 滚动提示部分 -->
        <view class="scrolling-alert">
            <uni-icons type="sound" size="20" color="#ff9900"
                style="position: absolute; left: 20rpx; top: 55%; transform: translateY(-50%);"></uni-icons>
            <view class="scroll-container">
                <swiper class="message-swiper" vertical autoplay circular interval="3000" duration="500">
                    <swiper-item v-for="(message, index) in scrollingMessages" :key="index">
                        <text class="scroll-item">{{ message }} 最近{{ recentJoinCount }}人正在拼团...</text>
                    </swiper-item>
                </swiper>
            </view>
        </view>

        <!-- 内容区域 -->
        <view class="content">
            <!-- 热门拼团 -->
            <view v-show="currentTab === 0" class="tab-content">
                <view class="group-list">
                    <view class="group-card" v-for="(product, index) in hotProducts" :key="index"
                        @click="handleProductClick(product)" :class="{ 'disabled': isGroupExpired(product) }">
                        <view class="store-header">
                            <image class="store-avatar" :src="product.头像" mode="aspectFill"></image>
                            <text class="store-name">{{ product.店铺 }}</text>

                            <view class="countdown-tag">
                                <uni-icons type="clock" size="14" color="#FF5500"></uni-icons>
                                <text class="countdown-text">{{ formatCountdown(product.countdown) }}</text>
                            </view>
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
                            <view class="group-info">
                                <text class="current-amount">已拼{{ formatPrice(getTotalAmount(product)) }}元</text>
                                <view class="group-users-scroll">
                                    <swiper class="users-swiper" vertical autoplay circular interval="3000"
                                        duration="500">
                                        <swiper-item v-for="(user, index) in product.orderList" :key="index">
                                            <text class="user-item">{{ hideUserName(user.name) }}正在拼团...</text>
                                        </swiper-item>
                                    </swiper>
                                </view>
                                <text class="member-count">{{ product.orderList?.length || 0 }}人正在拼团</text>
                            </view>

                            <view class="delivery-info" v-if="!hasReachedDeliveryAmount(product)">
                                <text>还差{{ formatPrice(product.minDeliveryFee - getTotalAmount(product)) }}元起送</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 热门商铺 -->
            <!-- 修改后的热门商铺部分 -->
            <view v-show="currentTab === 1" class="tab-content">
                <view class="store-list">
                    <view class="store-card" v-for="(store, index) in hotStores" :key="index"
                        @click="goToStoreDetail(store.id)">
                        <image class="store-cover" :src="store.photo" mode="aspectFill">
                        </image>
                        <view class="store-info">
                            <view class="store-header">
                                <view style="display: flex;align-items: center;">
                                    <image class="store-avatar" :src="store.avatar" mode="aspectFill"></image>
                                    <view class="store-name">{{ store.name }}</view>
                                </view>

                                <view class="store-status">
                                    <text class="status-text"
                                        :style="{ color: isStoreOpen(store) ? '#07C160' : '#FF5500' }">
                                        {{ isStoreOpen(store) ? '营业中' : '已打烊' }}
                                    </text>
                                </view>
                            </view>
                            <view class="store-desc-wrapper">
                                <text class="store-desc">{{ store.shopIntroduction || '暂无介绍' }}</text>
                                <text class="delivery-fee">起送 ¥{{ store.minDeliveryFee }} | 打包费 ¥{{ store.packageAmount
                                }}</text>
                            </view>
                            <view class="store-address">
                                <uni-icons type="location-filled" color="#999" size="24" />
                                {{ store.address }}
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
import { ref, computed, onMounted, watch, onUnmounted, getCurrentInstance } from 'vue'
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
const bannerList = ref([])


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
const scrollingMessages = ref([])

// 响应式状态
const hotStores = ref([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

// 添加热门商品数据
const hotProducts = ref([])
// 添加倒计时相关的响应式数据
const countdownTimers = ref({})

// 检查拼团是否过期
const isGroupExpired = (product) => {
    return product.countdown <= 0
}

// 获取订单总金额
const getTotalAmount = (product) => {
    return product.orderList?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0
}

// 检查是否达到配送金额要求
const hasReachedDeliveryAmount = (product) => {
    const totalAmount = getTotalAmount(product)
    return totalAmount >= product.minDeliveryFee
}

// 修改商品点击处理方法，移除金额限制
const handleProductClick = (product) => {
    if (isGroupExpired(product)) {
        uni.showToast({
            title: '该拼团已结束',
            icon: 'none'
        })
        return
    }

    // 如果未达到起送金额，只显示提示但仍然允许进入
    if (!hasReachedDeliveryAmount(product)) {
        uni.showToast({
            title: `还差${formatPrice(product.minDeliveryFee - getTotalAmount(product))}元起送`,
            icon: 'none',
            duration: 1500
        })
    }

    // 直接跳转到商品详情
    goToProduct(product.id, product.shopId, '参团')
}

// 格式化倒计时显示
const formatCountdown = (seconds) => {
    if (!seconds || seconds <= 0) return '已结束'
    const days = Math.floor(seconds / (24 * 60 * 60))
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((seconds % (60 * 60)) / 60)
    const remainingSeconds = seconds % 60

    if (days > 0) {
        return `${days}天${hours}时`
    }
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 更新商品倒计时
const updateCountdown = (productId) => {
    if (hotProducts.value.find(p => p.id === productId)?.countdown > 0) {
        hotProducts.value = hotProducts.value.map(product => {
            if (product.id === productId) {
                return {
                    ...product,
                    countdown: product.countdown - 1
                }
            }
            return product
        })
    } else {
        clearInterval(countdownTimers.value[productId])
    }
}

// 添加名称隐藏方法
const hideUserName = (name) => {
    if (!name) return '匿名用户'
    if (name.length <= 2) {
        return '*' + name.substring(1)
    }
    return name.substring(0, 1) + '*'.repeat(name.length - 1)
}

// 修改计时器初始化部分
const getAllGroup = async () => {
    try {
        const res = await request({
            url: '/group/getall',
            method: 'GET'
        })
        console.log("获取拼团数据成功", res.data)

        if (res.code === 200 && res.data) {
            let groupsWithProducts = []

            // 遍历每个拼团，获取对应商店的商品信息
            for (const group of res.data) {
                // 检查拼团是否已结束
                const endTime = new Date(group.endTime).getTime()
                const now = new Date().getTime()
                if (now >= endTime) continue // 跳过已结束的拼团

                try {
                    const shopProducts = await request({
                        url: '/product/shopproduct',
                        method: 'POST',
                        data: { shopid: group.shopId }
                    })

                    const products = shopProducts.data?.reduce((acc, category) => {
                        return acc.concat(category.productList || [])
                    }, []) || []

                    groupsWithProducts.push({
                        ...group,
                        products
                    })
                } catch (error) {
                    console.error(`获取商店 ${group.shopId} 的商品失败:`, error)
                }
            }

            // 更新热门拼团数据
            hotProducts.value = groupsWithProducts.map(group => {
                const endTime = new Date(group.endTime).getTime()
                const now = new Date().getTime()
                const countdown = Math.max(0, Math.floor((endTime - now) / 1000))

                // 为每个商品创建倒计时
                if (countdown > 0) {
                    if (countdownTimers.value[group.id]) {
                        clearInterval(countdownTimers.value[group.id])
                    }
                    countdownTimers.value[group.id] = setInterval(() => {
                        updateCountdown(group.id)
                    }, 1000)
                }

                return {
                    id: group.id,
                    name: group.orderList[0]?.shopName || '未知商家',
                    店铺: group.orderList[0]?.shopName,
                    shopId: group.shopId,
                    price: group.nowAmount,
                    minDeliveryFee: group.minDeliveryFee,
                    头像: group.orderList[0]?.shopAvatar,
                    endTime: group.endTime,
                    countdown,
                    images: group.products.map(product => product.image),
                    orderList: group.orderList
                }
            }).reverse() // 在这里添加reverse()方法

            // 更新实时消息
            const allMessages = groupsWithProducts.reduce((messages, group) => {
                const groupMessages = group.orderList?.map(order =>
                    `${hideUserName(order.name)} 正在参与 ${order.shopName} 的拼团`
                ) || []
                return messages.concat(groupMessages)
            }, [])

            scrollingMessages.value = allMessages.length > 0 ?
                allMessages : ['暂无拼团信息']

            // 更新参与人数
            recentJoinCount.value = groupsWithProducts.reduce((count, group) =>
                count + (group.orderList?.length || 0), 0
            )
        }
    } catch (error) {
        console.error("获取拼团数据失败", error)
    }
}

const getShopGroup = async (shopId) => {
    try {
        const res = await request({
            url: `/group/getshop${shopId}`,
            method: 'GET',
        })
        return res.data
    } catch (error) {
        console.error("获取商店拼团数据失败", error)
        return []
    }
}
// 组件卸载时清理定时器
onUnmounted(() => {
    // 清理倒计时计时器
    Object.values(countdownTimers.value).forEach(timer => {
        clearInterval(timer)
    })
    countdownTimers.value = {}
})
// 计算标签栏样式
const tabsStyle = computed(() => ({
    top: `${statusBarHeight.value + navBarHeight.value}px`
}))


onPageScroll((e) => {
    // 计算滚动进度（0-1之间）
    const maxScroll = 100 // 控制滚动效果的最大滚动距离
    scrollProgress.value = Math.min((e.scrollTop - 100) / maxScroll, 1)
    scrollY.value = Math.min(e.scrollTop / maxScroll, 1)

})

onShow(async () => {
    /*
    * 延时获取热门店铺数据
    * 非常重要
    **/
    console.log("页面显示")
    if (uni.getStorageSync('userRole') !== 'user') {
        return
    }
    await allStore()
    await getAllGroup()
    await getBannerImages()
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

    // 获取本地存储的地址列表
    const savedAddress = uni.getStorageSync('defaultAddress') || []
    if (savedAddress) {
        defaultAddress.value = savedAddress.address
    }
})

onReachBottom(() => {
    if (!hasMore.value) return
    page.value++
})

const isNavSticky = ref(false)

// 监听页面滚动
onPageScroll(({ scrollTop }) => {
    // 控制粘性效果，根据实际布局调整阈值
    isNavSticky.value = scrollTop > 50
})
// 动态滚动

// 切换标签
const switchTab = (index) => {
    currentTab.value = index
    allStore()
    getAllGroup()
}

// 修改后的脚本部分
const allStore = async () => {
    try {
        const res = await request({
            url: '/shop/getshops'
        })
        hotStores.value = res.data.map(store => ({
            ...store,
            photo: store.photo,
            avatar: store.avatar
        }))
        console.log("获取商家数据成功", hotStores.value)
        // 判断是否还有更多数据
        hasMore.value = res.data.length >= pageSize.value
    } catch (error) {
        console.log("获取商家数据失败", error)
    }
}

// 新增营业状态判断方法
const isStoreOpen = (store) => {
    if (!store.openTime || !store.closeTime) return false

    const now = new Date()
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()

    const [openHour, openMinute] = store.openTime.split(':').map(Number)
    const [closeHour, closeMinute] = store.closeTime.split(':').map(Number)

    const currentTime = currentHours * 60 + currentMinutes
    const openTime = openHour * 60 + openMinute
    const closeTime = closeHour * 60 + closeMinute

    // 处理跨天营业
    if (openTime < closeTime) {
        return currentTime >= openTime && currentTime <= closeTime
    } else {
        return currentTime >= openTime || currentTime <= closeTime
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
    })
}

// 添加跳转到商品详情的方法
const goToProduct = (productId, shopId, type) => {
    uni.navigateTo({
        url: `/pages/productDetail/ProductDetailIndex?id=${productId}&shopId=${shopId}&type=${type}`
    })
}

/*
*自提与外卖选择暂未实现
* @param {string} type - 选择类型，可以是'delivery'或'takeout'
**/

const handleDeliverySelect = (type) => {
    console.log('选择类型:', type)
}
// 价格格式化方法
const formatPrice = (price) => {
    return Number(price).toFixed(2)
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

// 新增获取轮播图数据的方法
const getBannerImages = async () => {
    try {
        const res = await request({
            url: '/image/select',
            method: 'GET'
        })
        if (res.data) {
            bannerList.value = res.data.map(item => ({
                image: item.url
            }))
        }
    } catch (error) {
        console.error("获取轮播图数据失败", error)
    }
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
        align-items: center;
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

    .goTo {
        margin: 40rpx 15rpx;
        padding: 20rpx 0;
        background: #fff;
        border-radius: 20rpx;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

        .goTo-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;

            .goTo-item {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20rpx 40rpx;
                background: #4caf50;
                border-radius: 40rpx;
                color: #fff;
                font-size: 28rpx;
                font-weight: 500;
                transition: background-color 0.3s ease;
                cursor: pointer;

                &:active {
                    background-color: darken(#4caf50, 10%);
                }

                .uni-icons {
                    margin-right: 10rpx; // 图标与文字之间的间距
                    font-size: 32rpx; // 调整图标大小
                    color: #fff; // 图标颜色与文字一致
                    transition: transform 0.3s ease; // 添加图标动画效果
                }

                &:hover .uni-icons {
                    transform: scale(1.1); // 鼠标悬停时图标放大
                }

                .goTo-text {
                    margin-left: 10rpx;
                    font-weight: 600; // 文字加粗
                }
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

/* 修改滚动提示样式 */
.scrolling-alert {
    height: 60rpx;
    position: relative;
    background: #fff8e6;
    margin: 20rpx 20rpx;
    border-radius: 10rpx;
    padding-left: 100rpx;
    overflow: hidden;

    .scroll-container {
        height: 100%;

        .message-swiper {
            height: 100%;

            .scroll-item {
                display: block;
                height: 60rpx;
                line-height: 60rpx;
                font-size: 26rpx;
                color: #ff9900;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }
}

/* 修改用户滚动样式 */
.group-users-scroll {
    width: 160rpx;
    height: 40rpx;
    background-color: #fff8e6;
    overflow: hidden;

    .users-swiper {
        width: 100%;
        height: 100%;

        .user-item {
            display: block;
            width: 100%;
            height: 100%;
            line-height: 40rpx;
            font-size: 24rpx;
            color: #ff9900;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0 10rpx;
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

        .goTo-item {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20rpx 40rpx;
            border-radius: 40rpx;
            color: #FF5500;
            font-size: 28rpx;
            font-weight: 500;
            transition: background-color 0.3s ease;
            cursor: pointer;

            .goTo-text {
                color: #FF5500;
                margin-left: 10rpx;
                font-weight: 600; // 文字加粗
            }
        }

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

        &.disabled {
            opacity: 0.6;
            pointer-events: none;
        }

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
                width: 200rpx;
                // background-color: #666;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .group-tag {
                background: #FFF0F3;
                color: $primary-color;
                font-size: 24rpx;
                padding: 8rpx 20rpx;
                border-radius: 40rpx;
            }

            .countdown-tag {
                display: flex;
                align-items: center;
                background: #FFF0F3;
                padding: 4rpx 16rpx;
                border-radius: 20rpx;
                margin-left: auto;

                .countdown-text {
                    color: #FF5500;
                    font-size: 24rpx;
                    margin-left: 8rpx;
                }
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

            .group-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10rpx;

                .current-amount {
                    color: #FF5500;
                    font-size: 32rpx;
                    font-weight: bold;
                }

                .group-users-scroll {
                    width: 160rpx;
                    background-color: #fff8e6;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;

                    .users-scroll {
                        width: 100%;
                        margin: 0 10rpx 0 10rpx;

                        .users-list {
                            position: relative;
                            height: 40rpx;
                            overflow: hidden;

                            .user-item {
                                position: absolute;
                                width: 100%;
                                font-size: 24rpx;
                                color: #ff9900;
                                transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;

                                &.item-enter {
                                    transform: translateY(0);
                                    opacity: 1;
                                }

                                &.item-leave {
                                    transform: translateY(100%);
                                    opacity: 0;
                                }
                            }
                        }
                    }
                }

                .member-count {

                    color: #666;
                    font-size: 26rpx;
                }
            }

            .delivery-info {
                background: #FFF0F3;
                padding: 10rpx 20rpx;
                border-radius: 30rpx;
                text-align: center;

                text {
                    color: #FF5500;
                    font-size: 26rpx;
                }
            }
        }
    }
}

/* 修改后的店铺列表样式 */
.store-list {
    .store-card {
        margin: 20rpx;
        border-radius: 16rpx;
        overflow: hidden;
        background: #fff;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

        .store-cover {
            width: 100%;
            height: 400rpx;
            background: #f5f5f5;
        }

        .store-info {
            padding: 24rpx;

            .store-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20rpx;

                .store-avatar {
                    width: 60rpx;
                    height: 60rpx;
                    border-radius: 5rpx;
                    background-color: #999;
                }

                .store-name {
                    font-size: 32rpx;
                    font-weight: 600;
                    max-width: 70%;
                    margin-left: 20rpx;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .store-status {
                    font-size: 26rpx;
                    font-weight: 500;
                }

            }

            .store-desc-wrapper {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 16rpx;

                .store-desc {
                    color: #666;
                    font-size: 26rpx;
                    line-height: 1.4;
                    display: -webkit-box;
                    line-clamp: 2;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    max-width: 60%;
                }

                .delivery-fee {
                    color: #666;
                    font-size: 26rpx;
                }
            }

            .store-address {
                color: #999;
                font-size: 24rpx;
                margin-bottom: 24rpx;
                display: flex;
                align-items: center;
            }

            .promotion-tag {
                display: flex;
                flex-wrap: wrap;
                gap: 12rpx;

                .text {
                    background: #FFF0F3;
                    color: $primary-color;
                    font-size: 24rpx;
                    padding: 6rpx 20rpx;
                    border-radius: 30rpx;
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