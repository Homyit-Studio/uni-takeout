<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="nav_bar" :style="{
      paddingTop: statusBarHeight + 'px',
      'backgroundColor': backgroundColor
    }">
      <view class="nav_bar_inner">
        <view class="nav-icon" @click="onBack()">
          <uni-icons :type="backIcon" :color="backIconColor" size="30"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 顶部区域背景 -->
    <view class="top_area area_height" :style="{
      paddingTop: statusBarHeight + 44 + 'px',
      'background-image': `url(${shopInfo.photo})`
    }" data-type="1">
      <view class="shop-header">
        <image class="shop-avatar" :src="shopInfo.avatar" mode="aspectFill" />
        <view class="shop-details">
          <text class="shop-name">{{ shopInfo.name }}</text>
          <view class="status-tag" :style="{ color: isStoreOpen(shopInfo) ? '#07C160' : '#FF5500' }">
            {{ isStoreOpen(shopInfo) ? '营业中' : '已打烊' }}
          </view>
          <view class="delivery-info">
            <uni-icons type="location" size="24" color="#ff5500" />
            <text class="delivery-text">{{ shopInfo.address }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- tab切换 -->
    <view class="tabs area_height" data-type="2" :style="{ 'top': statusBarHeight + 38 + 'px' }">
      <view class="tab-list">
        <view v-for="(item, index) in tabList" :key="index" class="tab-item" :class="{ active: tabIndex === index }"
          @click="onChangeTab(index)">
          {{ item.name }}
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view id="item-1" class="content-section">
      <view class="advert_area area_height" data-type="1">
        <view class="group-entry">
          <view class="entry-header">
            <text class="title">🔥 火热拼团中</text>
            <text class="subtitle">三人成团立享7折</text>
          </view>
          <image class="group-banner" mode="aspectFill"
            src="https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg" />
          <view class="action-box">
            <text class="action-text">点击进入拼团</text>
            <uni-icons type="forward" size="16" color="#666" />
          </view>
        </view>
      </view>

      <view class="purchase-container">
        <scroll-view scroll-x class="purchase-scroll" :scroll-left="scrollLeft">
          <view class="scroll-content">
            <view class="purchase-item" v-for="(item, index) in purchaseList" :key="index">
              <image class="user-avatar" :src="item.avatar" mode="aspectFill" />
              <text class="purchase-text">{{ item.name }}刚刚下单了{{ item.product }}</text>
              <view class="badge">进行中</view>
            </view>
          </view>
        </scroll-view>
      </view>

    </view>
    <view class="section-title">常售餐饮</view>
    <!-- 菜品区域 -->
    <view id="item-2" class="cate_content">
      <scroll-view scroll-y="true" :scroll-top="leftScrollTop" class="left"
        :style="{ 'height': scrollHeight + 'px', 'top': stickyTop + 40 + 'px' }">
        <view class="menu_name" :id="'menu_name' + index" :class="{ 'menu_name_active': currentIndex == index }"
          v-for="(item, index) in productList" :key="index" @click="onChangeCate(item, index)">
          {{ item.name }}
        </view>
      </scroll-view>
      <view class="right">
        <view class="item" v-for="(item, index) in productList" :key="index" :id="'right-item-' + index">
          <view class="title sticky_title" :style="{ 'top': stickyTop + 37 + 'px' }">
            {{ item.name }}
          </view>
          <view class="content">
            <view class="product_item" v-for="(cell, cIndex) in item.list" :key="cIndex">
              <image :src="cell.img" mode="aspectFill" class="product_img"></image>
              <view class="product_info">
                <view class="name">{{ cell.name }}</view>
                <view class="price-action">
                  <text class="price">￥{{ cell.price }}</text>
                  <view class="action-buttons">
                    <text class="btn minus" @click.stop="decreaseCount(cell)">-</text>
                    <text class="count">{{ cell.count || 0 }}</text>
                    <text class="btn plus" @click.stop="increaseCount(cell)">+</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 底部购物车 -->
    <view class="foot">
      <view class="inner">
        <view class="cart-left" @click="onShowCart()">
          <view class="icon-box">
            <uni-icons type="cart" color="red" size="32" />
            <view class="badge" v-if="cartCount > 0">{{ cartCount }}</view>
          </view>
          <view class="price-box">
            <text class="total-price">￥{{ totalPrice }}</text>
            <text class="tip">配送费需{{ deliveryFee }}元</text>
          </view>
        </view>
        <view class="submit-btn" :class="{ disabled: totalPrice < minDeliveryPrice }" @click="onSubmit">
          {{ totalPrice < minDeliveryPrice ? `¥${minDeliveryPrice}起送` : '去结算' }} </view>
        </view>
      </view>

      <!-- 购物车弹窗 -->
      <uni-popup ref="popup" type="bottom" background-color="#fff">
        <view class="cart_list">
          <view class="cart-header">
            <text class="title">购物车</text>
            <text class="clear" @click="clearCart">清空购物车</text>
          </view>
          <scroll-view scroll-y class="cart-content">
            <view v-if="cartList.length > 0">
              <view class="cart_item" v-for="(item, index) in cartList" :key="index">
                <image :src="item.img" mode="aspectFill" class="cart-img"></image>
                <view class="cart-info">
                  <text class="name">{{ item.name }}</text>
                  <view class="price-wrap">
                    <text class="price">￥{{ item.price }}</text>
                    <view class="action-buttons">
                      <text class="btn minus" @click.stop="decreaseCount(item)">-</text>
                      <text class="count">{{ item.count }}</text>
                      <text class="btn plus" @click.stop="increaseCount(item)">+</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view v-else class="empty-cart">
              <text>购物车是空的</text>
            </view>
          </scroll-view>
        </view>
      </uni-popup>
    </view>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, computed, onUnmounted } from 'vue'
import { onPageScroll, onLoad } from '@dcloudio/uni-app'
import { request } from '../../utils/request'

const shopDetail = ref({}) // 用于存储店铺详情

// 响应式数据
const windowHeight = uni.getWindowInfo().windowHeight
const scrollHeight = ref(uni.getWindowInfo().windowHeight)
const statusBarHeight = ref(uni.getWindowInfo().statusBarHeight)
const backgroundColor = ref("rgba(255,255,255,0)")
const backIconColor = ref("#fff")
const backIcon = ref("back")
const allAreaHeight = ref(0)
const currentIndex = ref(0)
const leftScrollTop = ref(0)
const rightItemHeight = ref(0)
const stickyTop = ref(0)
const tabIndex = ref(0)
const isClick = ref(false)
const isTabClick = ref(false)

const tabThreshold = 50 // 滚动阈值

const shopInfo = ref({})

// 其他响应式数据...
const anchorPositions = ref([]); // 存储tab区域的top位置
const topList = ref([]); // 存储右侧分类项的位置

const tabList = reactive([
  { name: '跟团新讯' },
  { name: '常售餐饮' }
])

const productList = ref([])

const purchaseList = ref([
  { avatar: '/static/logo.png', name: '张先生', product: '七味盐黄金豆腐' },
  { avatar: '/static/logo.png', name: '李小姐', product: '龙井凤尾虾仁' },
  { avatar: '/static/logo.png', name: '王女士', product: '绿茶饼' }
])

const popup = ref(null)
const cartCount = ref(0)
const totalPrice = ref(0)
const deliveryFee = ref(0)
const minDeliveryPrice = ref(0)
const scrollTop = ref(0)
const scrollLeft = ref(0)
let scrollTimer = null
let scrollInterval = null

// 计算属性
const cartList = computed(() => {
  const list = []
  productList.value.forEach(cate => {
    cate.list.forEach(item => {
      if (item.count && item.count > 0) {
        list.push(item)
      }
    })
  })
  return list
})

onLoad(async (options) => {
  console.log('接收到的参数:', options)
  await fetchShopDetail(options.id)
  await fetchShopInfo(options.id)
})

// 生命周期
onMounted(() => {
  startScroll()
  startAutoScroll()

  nextTick(() => {
    initLayout()
    initAnchorPositions()
    getTop()
  })

  backIcon.value = getCurrentPages().length === 1 ? "home" : "back"
})

onUnmounted(() => {
  if (scrollTimer) clearInterval(scrollTimer)
  if (scrollInterval) clearInterval(scrollInterval)
})

// 页面滚动处理
onPageScroll(({ scrollTop: currentScrollTop }) => {
  if (isTabClick.value) return

  scrollTop.value = currentScrollTop
  updateOpacity(currentScrollTop)
  updateActiveTab(currentScrollTop)
  updateMenuActive(currentScrollTop)
})

const fetchShopInfo = async (id) => {
  try {
    const res = await request({
      url: '/shop/getshopInfo',
      method: 'POST',
      data: {
        shopid: id
      }
    })
    console.log('获取店铺详情:', res)
    shopInfo.value = { ...shopInfo.value, ...res.data }
    minDeliveryPrice.value = res.data.minDeliveryFee
  } catch (error) {
    console.error("获取店铺信息失败", error)
  }
}

const fetchShopDetail = async (id) => {
  try {
    const res = await request({
      url: '/product/shopproduct',
      method: 'POST',
      data: {
        shopid: id
      }
    })
    console.log('请求响应:', res)
    if (res.data && res.data.length > 0) {
      productList.value = res.data.map(category => ({
        name: category.name,
        id: category.categoryId,
        list: category.productList.map(product => ({
          id: product.id,
          name: product.name,
          img: product.image,
          price: product.price,
          count: 0
        }))
      }))
    }
  } catch (error) {
    console.error("获取店铺详情失败", error)
  }
}

// 初始化布局
const initLayout = () => {
  const query = uni.createSelectorQuery()
  query.selectAll('.area_height').boundingClientRect(data => {
    if (data) {
      allAreaHeight.value = 0
      let addHeight = 0
      for (let i = 0; i < data.length; i++) {
        data[i].dataset.type === '1' ? allAreaHeight.value += data[i].height : addHeight += data[i].height
      }
      scrollHeight.value = windowHeight - allAreaHeight.value + addHeight + 18
    }
  }).exec()

  query.select('.tabs').boundingClientRect(data => {
    if (data) stickyTop.value = statusBarHeight.value + data.height
  }).exec()
}

// 初始化锚点位置
const initAnchorPositions = () => {
  const query = uni.createSelectorQuery()
  tabList.forEach((_, index) => {
    query.select(`#item-${index + 1}`).boundingClientRect()
  })

  query.exec(res => {
    if (res) {
      anchorPositions.value = res.map(item => ({
        top: item.top,
        bottom: item.bottom
      }))
    }
  })
}

// 初始化右侧分类项位置
const getTop = () => {
  const query = uni.createSelectorQuery();
  query.selectAll('.right .item').boundingClientRect();
  query.exec(res => {
    if (res?.[0]) {
      topList.value = res[0].map(item => ({
        top: item.top,
        bottom: item.bottom,
        height: item.height // 添加高度属性
      }));
      // 初始化rightItemHeight为第一个分类项的高度
      if (res[0].length > 0) {
        rightItemHeight.value = res[0][0].height;
      }
    }
  });
};

// 更新透明度
const updateOpacity = (scrollTop) => {
  const opacity = Math.min(scrollTop / 100, 1)
  backgroundColor.value = `rgba(255,255,255,${opacity})`
  backIconColor.value = opacity >= 1 ? "#000" : "#fff"

  uni.setNavigationBarColor({
    frontColor: opacity >= 1 ? "#000000" : "#ffffff",
    backgroundColor: opacity >= 1 ? "#ffffff" : "#000000",
  })
}

// 更新活动tab
const updateActiveTab = (currentScrollTop) => {
  if (isTabClick.value) return

  const currentPosition = currentScrollTop + stickyTop.value

  // 检查是否在第一个tab区域
  if (currentPosition <= tabThreshold) {
    tabIndex.value = 0
    return
  }

  // 检查其他tab区域
  for (let i = 0; i < anchorPositions.value.length; i++) {
    const pos = anchorPositions.value[i]
    if (currentPosition >= pos.top && currentPosition < pos.bottom) {
      if (tabIndex.value !== i) {
        tabIndex.value = i
      }
      break
    }
  }
}

const onChangeTab = async (index) => {
  if (tabIndex.value === index) return

  isTabClick.value = true
  tabIndex.value = index

  await nextTick()

  const targetElement = anchorPositions.value[index]
  if (targetElement) {
    uni.pageScrollTo({
      scrollTop: targetElement.top - stickyTop.value,
      duration: 300,
      complete: () => {
        updateOpacity(targetElement.top - stickyTop.value)
        setTimeout(() => {
          isTabClick.value = false
        }, 350) // 比滚动时间长一点确保完成
      }
    })
  }
}

const onChangeCate = async (item, index) => {
  currentIndex.value = index
  leftScrollTop.value = rightItemHeight.value * index

  await nextTick()

  const targetElement = topList.value[index]
  if (targetElement) {
    uni.pageScrollTo({
      scrollTop: targetElement.top - stickyTop.value,
      duration: 300,
    })
  }
}
const updateMenuActive = (currentScrollTop) => {
  currentScrollTop = parseInt(currentScrollTop)
  for (let i = 0; i < topList.value.length; i++) {
    if (currentScrollTop >= topList.value[i].top && currentScrollTop <= topList.value[i].bottom) {
      if (currentIndex.value !== i) {
        currentIndex.value = i
        leftScrollTop.value = rightItemHeight.value * i
      }
      break
    }
  }
}

// 购物车相关方法
const onShowCart = () => {
  if (cartCount.value > 0) {
    popup.value.open()
  } else {
    uni.showToast({ title: '购物车是空的', icon: 'none' })
  }
}

const increaseCount = (item) => {
  if (!item.count) item.count = 0
  item.count++
  updateCart()
}

const decreaseCount = (item) => {
  if (!item.count) return
  item.count--
  updateCart()
}

const updateCart = () => {
  let count = 0
  let price = 0
  productList.value.forEach(cate => {
    cate.list.forEach(item => {
      if (item.count) {
        count += item.count
        price += item.price * item.count
      }
    })
  })
  cartCount.value = count
  totalPrice.value = price.toFixed(2)
}

const clearCart = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空购物车吗？',
    success: (res) => {
      if (res.confirm) {
        productList.value.forEach(cate => {
          cate.list.forEach(item => {
            item.count = 0
          })
        })
        updateCart()
        popup.value.close()
      }
    }
  })
}

const onSubmit = () => {
  if (totalPrice.value < minDeliveryPrice.value) return
  const orderData = {
    cartList: cartList.value,
    totalPrice: totalPrice.value,
    deliveryFee: deliveryFee.value
  }
  uni.setStorageSync('orderData', orderData)
  uni.navigateTo({ url: '/pages/GoShopping/index' })
}

// 其他方法
const onBack = () => {
  if (getCurrentPages().length === 1) {
    uni.switchTab({ url: "/pages/index/index" })
  } else {
    uni.navigateBack()
  }
}

const startScroll = () => {
  scrollTimer = setInterval(() => {
    scrollTop.value--
    if (Math.abs(scrollTop.value) >= (purchaseList.value.length * 60)) {
      scrollTop.value = 0
    }
  }, 50)
}

const startAutoScroll = () => {
  scrollInterval = setInterval(() => {
    scrollLeft.value += 2
    if (scrollLeft.value >= purchaseList.value.length * 300) {
      scrollLeft.value = 0
    }
  }, 50)
}

// 营业状态判断方法
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
</script>

<style lang="scss" scoped>
view {
  box-sizing: border-box;
}

.page {
  background-color: #fff;
  padding-bottom: calc(constant(safe-area-inset-bottom) + 100rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 100rpx);
}

.nav_bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  flex-direction: column;

  .nav_bar_inner {
    display: flex;
    padding: 20rpx;
    align-items: center;

    .nav-icon {
      width: 44rpx;
      height: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx;
    }
  }
}

.top_area {
  width: 100%;
  height: 500rpx;
  background-color: #f0f0f0;
  transition: background 0.3s ease;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-blend-mode: multiply;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;

  .shop-header {
    border-radius: 10rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    width: 100%;
    backdrop-filter: blur(20px);
    background: rgba(0, 0, 0, 0.1);
    padding: 40rpx;

    .shop-avatar {
      width: 160rpx;
      height: 160rpx;
      background-color: #999;
      border-radius: 16rpx;
      margin-right: 30rpx;
    }

    .shop-details {
      flex: 1;

      .shop-name {
        font-size: 36rpx;
        font-weight: 600;
        margin-bottom: 20rpx;
        color: #ffffff;
      }

      .status-tag {
        display: inline-block;
        padding: 8rpx 24rpx;
        font-size: 24rpx;
        border-radius: 40rpx;
        margin-bottom: 16rpx;
        background-color: rgba(255, 255, 255, 0.8);
      }

      .delivery-info {
        display: flex;
        align-items: center;
        font-size: 28rpx;
        color: #666;
        margin-top: 10rpx;

        .delivery-text {
          color: #ff5500;
          background-color: #ffffff7c;
          border-radius: 20rpx;
          padding: 0 20rpx;
          margin-left: 10rpx;
        }
      }
    }
  }
}

.tabs {
  position: sticky;
  top: 0;
  height: 100rpx;
  background: #fff;
  border-bottom: 0.0685rem solid #ddd;
  z-index: 999;

  .tab-list {
    display: flex;
    height: 100%;

    .tab-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #666;
      position: relative;
      transition: color 0.2s ease;

      &.active {
        color: #333;
        font-weight: bold;

        &:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 4rpx;
          background: #ff5500;
          border-radius: 2rpx;
          transition: width 0.3s ease, opacity 0.2s ease;
        }
      }

      &:not(.active):after {
        opacity: 0;
        width: 0;
      }
    }
  }
}

.content-section {
  margin-bottom: 20rpx;

  .group-entry {
    margin: 20rpx 20rpx 0;
    background: #fff9e6;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(255, 153, 0, 0.1);

    .entry-header {
      padding: 24rpx;
      background: linear-gradient(90deg, #fff1da, #ffe8c4);

      .title {
        font-size: 32rpx;
        color: #ff5500;
        font-weight: bold;
        margin-right: 20rpx;
      }

      .subtitle {
        font-size: 26rpx;
        color: #ff9900;
      }
    }

    .group-banner {
      width: 100%;
      height: 240rpx;
      display: block;
    }

    .action-box {
      padding: 0 20rpx 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .action-text {
        font-size: 26rpx;
        color: #666;
        margin-right: 10rpx;
      }
    }
  }

  .purchase-container {
    margin: 0 20rpx 20rpx;
    background: #fff9e6;
    border-radius: 16rpx;
    overflow: hidden;

    .purchase-scroll {
      width: 100%;
      height: 100rpx;
      white-space: nowrap;

      .scroll-content {
        display: inline-flex;
        align-items: center;
        padding: 0 20rpx;

        .purchase-item {
          display: inline-flex;
          align-items: center;
          border-radius: 50rpx;
          padding: 12rpx 24rpx;
          margin-right: 20rpx;
          box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.9);

          .user-avatar {
            width: 60rpx;
            height: 60rpx;
            border-radius: 50%;
            margin-right: 16rpx;
          }

          .purchase-text {
            font-size: 26rpx;
            color: #666;
            margin-right: 16rpx;
          }

          .badge {
            background: #ff5500;
            color: white;
            font-size: 20rpx;
            padding: 4rpx 12rpx;
            border-radius: 20rpx;
          }
        }
      }
    }
  }
}

.section-title {
  width: 100%;
  height: 80rpx;
  text-align: center;
  background-color: #fff;
  font-size: 40rpx;
  color: #ff5500;
}

.cate_content {
  display: flex;
  flex-direction: row;

  .left {
    position: sticky;
    top: 100rpx;
    width: 200rpx;
    background: #fff;

    .menu_name {
      height: 100rpx;
      line-height: 100rpx;
      text-align: center;
      color: #8d8d8d;
      font-size: 24rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.menu_name_active {
        background: #f5f5f5;
        color: #333;
        border-left: 4px solid #ff5500;
      }
    }
  }

  .right {
    flex: 1;
    min-height: 100rpx;
    background: #f5f5f5;
    padding: 0 20rpx;

    .item {
      border-bottom: 1px solid #eee;
      background: #fff;

      .title {
        position: sticky;
        top: 100rpx;
        height: 60rpx;
        line-height: 60rpx;
        background: #fff;
        padding-left: 20rpx;
        z-index: 10;
      }

      .product_item {
        height: 120rpx;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;
        padding: 0 20rpx;

        .product_img {
          width: 120rpx;
          height: 120rpx;
          border-radius: 6rpx;
        }

        .product_info {
          flex: 1;
          padding-left: 20rpx;

          .name {
            font-size: 28rpx;
            font-weight: 500;
            margin-bottom: 16rpx;
          }

          .price-action {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .price {
              color: #ff5500;
              font-size: 32rpx;
              font-weight: bold;
            }

            .action-buttons {
              display: flex;
              align-items: center;

              .btn {
                width: 44rpx;
                height: 44rpx;
                border-radius: 50%;
                background: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;

                &.minus {
                  color: #999;
                }

                &.plus {
                  background: #ff5500;
                  color: #fff;
                }
              }

              .count {
                margin: 0 20rpx;
                font-size: 28rpx;
              }
            }
          }
        }
      }
    }
  }
}

.foot {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  min-height: 100rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  box-shadow: 0 -4px 10px -3px rgba(0, 0, 0, 0.2);

  .inner {
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20rpx;

    .cart-left {
      display: flex;
      align-items: center;

      .icon-box {
        position: relative;
        margin-right: 20rpx;

        .badge {
          position: absolute;
          top: -10rpx;
          right: -10rpx;
          min-width: 32rpx;
          height: 32rpx;
          border-radius: 16rpx;
          background: #ff5500;
          color: #fff;
          font-size: 20rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 6rpx;
        }
      }

      .price-box {
        .total-price {
          font-size: 36rpx;
          font-weight: bold;
          color: #333;
        }

        .tip {
          font-size: 22rpx;
          color: #999;
          margin-left: 10rpx;
        }
      }
    }

    .submit-btn {
      width: 200rpx;
      height: 72rpx;
      background: #ff5500;
      color: #fff;
      border-radius: 36rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;

      &.disabled {
        background: #ccc;
      }
    }
  }
}

.cart_list {
  max-height: 60vh;

  .cart-header {
    padding: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid #eee;

    .title {
      font-size: 32rpx;
      font-weight: bold;
    }

    .clear {
      color: #999;
      font-size: 28rpx;
    }
  }

  .cart-content {
    max-height: calc(60vh - 100rpx);

    .cart_item {
      display: flex;
      padding: 20rpx;
      border-bottom: 1rpx solid #eee;

      .cart-img {
        width: 120rpx;
        height: 120rpx;
        border-radius: 6rpx;
      }

      .cart-info {
        flex: 1;
        margin-left: 20rpx;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .name {
          font-size: 28rpx;
        }

        .price-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .price {
            color: #ff5500;
            font-size: 32rpx;
            font-weight: bold;
          }

          .action-buttons {
            display: flex;
            align-items: center;

            .btn {
              width: 44rpx;
              height: 44rpx;
              border-radius: 50%;
              background: #f5f5f5;
              display: flex;
              align-items: center;
              justify-content: center;

              &.minus {
                color: #999;
              }

              &.plus {
                background: #ff5500;
                color: #fff;
              }
            }

            .count {
              margin: 0 20rpx;
              font-size: 28rpx;
            }
          }
        }
      }
    }
  }

  .empty-cart {
    padding: 40rpx;
    text-align: center;
    color: #999;
  }
}
</style>