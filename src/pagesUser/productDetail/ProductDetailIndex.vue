<template>
  <view class="page">
    <view class="product-header">
      <image :src="headerImage" mode="aspectFill" class="header-bg" />
      <view class="nav-bar" :style="{ top: statusBarHeight + 'px' }" :class="{ scrolled: isScrolled }">
        <view class="back-btn" @click="handleBack">
          <uni-icons :type="backIcon" color="#fff" size="24" />
        </view>
      </view>
    </view>

    <!-- 商品列表区域 -->
    <scroll-view class="products-container" scroll-x>
      <view class="products-wrapper">
        <view v-for="(item, index) in productList" :key="index" class="product-card">
          <image :src="item.img" mode="aspectFill" class="product-image" @click="changeHeaderImage(item.image)" />
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <text class="product-desc">{{ item.introduction }}</text>
            <view class="product-price-action">
              <text class="price">￥{{ formatPrice(item.price) }}</text>
              <view class="action-buttons">
                <text class="btn minus" @click.stop="decreaseCount(item)">-</text>
                <text class="count">{{ item.count || 0 }}</text>
                <text class="btn plus" @click.stop="increaseCount(item)">+</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 拼团进度区域 -->
    <view class="group-progress">
      <view class="progress-info">
        <text class="title">拼团进度</text>
        <text class="amount">已拼{{ formatPrice(groupType === '开团' ? totalPrice : groupDetail.nowAmount) || 0 }}元</text>
      </view>
      <view class="group-users-scroll">
        <scroll-view scroll-x class="users-scroll">
          <view class="users-list">
            <text :class="['user-item', {
              'item-enter': isUserEntering,
              'item-leave': !isUserEntering
            }]">
              {{ currentUserName || '暂无用户参与' }}正在拼团...
            </text>
          </view>
        </scroll-view>
      </view>
      <view class="progress-bar">
        <view class="progress" :style="{ width: progressPercentage + '%' }"></view>
      </view>
      <text class="target-amount">目标{{ formatPrice(groupDetail.minDeliveryFee || shopInfo.minDeliveryFee) }}元</text>
    </view>

    <!-- 底部购物车 -->
    <view class="foot">
      <view class="inner">
        <view class="cart-left" @click="onShowCart()">
          <view class="icon-box">
            <uni-icons type="cart" color="#ff5500" size="32" />
            <view class="badge" v-if="cartCount > 0">{{ cartCount }}</view>
          </view>
          <view class="price-box">
            <text class="total-price">￥{{ formatPrice(totalPrice) }}</text>
            <text class="tip">配送费需{{ groupDetail.deliveryFee || 0 }}元</text>
          </view>
        </view>
        <view class="submit-btn" :class="{ disabled: totalPrice <= 0 }" @click="onSubmit">
          {{ '去结算' }} </view>
      </view>
    </view>
  </view>

  <uni-popup ref="popup" type="bottom" background-color="#fff">
    <view class="cart_list">
      <view class="cart-header">
        <text class="title">购物车</text>
        <text class="clear" @click="clearCart">清空购物车</text>
      </view>
      <!-- 购物车内容 -->
      <view v-for="item in productList.filter(p => p.count > 0)" :key="item.id" class="cart-item">
        <image :src="item.img" mode="aspectFill" class="cart-image" />
        <view class="cart-info">
          <text class="cart-name">{{ item.name }}</text>
          <text class="cart-price">￥{{ formatPrice(item.price) }}</text>
          <view class="cart-action-buttons">
            <text class="btn minus" @click.stop="decreaseCount(item)">-</text>
            <text class="count">{{ item.count }}</text>
            <text class="btn plus" @click.stop="increaseCount(item)">+</text>
          </view>
        </view>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

const groupDetail = ref({})
const productList = ref([])
const cartItems = ref([])
const popup = ref(null)
const cartCount = ref(0)
const totalPrice = ref(0)
const statusBarHeight = ref(0)
const backIcon = ref("back")
const isScrolled = ref(false)
const headerImage = ref('')
const currentUserName = ref('')
const isUserEntering = ref(true)
let userRotationTimer = null
const cartId = ref(null)

// 新增参数
const groupType = ref('')  // 拼团类型：'开团' 或 '参团'
const userId = ref()     // 用户ID

// 在响应式数据声明区域添加shopInfo
const shopInfo = ref({
  id: '',
  name: '',
  avatar: '',
  address: '',
  openTime: '',
  closeTime: '',
  phone: ''
})

// 添加防抖相关的状态
const isProcessing = ref(false)
const debounceTimer = ref(null)
const DEBOUNCE_DELAY = 500 // 设置防抖延迟时间为500ms

onMounted(() => {
  statusBarHeight.value = uni.getWindowInfo().statusBarHeight
  if (getCurrentPages().length == 1) {
    backIcon.value = "home"
  } else {
    backIcon.value = "left"
  }
})


const handleBack = () => {
  if (getCurrentPages().length == 1) {
    uni.switchTab({
      url: "/pages/index/index"
    })
  } else {
    uni.navigateBack()
  }
}

// 计算拼团进度百分比
const progressPercentage = computed(() => {
  const targetAmount = groupType.value === '开团' ?
    shopInfo.value.minDeliveryFee :
    groupDetail.value.minDeliveryFee

  const currentAmount = groupType.value === '开团' ?
    totalPrice.value :
    groupDetail.value.nowAmount

  if (!targetAmount || !currentAmount) return 0
  return Math.min((currentAmount / targetAmount) * 100, 100)
})

// 在onLoad函数中修改加载逻辑
onLoad(async (options) => {
  const { id, shopId, type } = options
  groupType.value = type || '开团'  // 设置拼团类型

  // 确保 groupDetail 中有 shopId
  if (groupType.value === '开团') {
    groupDetail.value = { shopId } // 初始化 groupDetail，确保有 shopId
  }

  await getUserInfo() // 获取用户ID

  // 修改数据加载顺序
  if (groupType.value === '开团') {
    // 如果是开团，先获取店铺信息和商品
    await Promise.all([
      fetchShopInfo(shopId),
      fetchShopProducts(shopId)
    ])
    await fetchCartData(shopId) // 对于开团模式，直接使用传入的 shopId
  } else {
    // 如果是参团，则并行请求所有需要的数据
    await Promise.all([
      fetchGroupDetail(id),
      fetchShopInfo(shopId),
      fetchShopProducts(shopId)
    ])
    await fetchCartData(shopId)
  }
})

const getUserInfo = async () => {
  try {
    // 模拟从接口获取用户信息
    const res = await request({
      url: '/user/getUserInfo',
      method: 'GET'
    })
    console.log('获取用户信息:', res)
    uni.setStorageSync('userRole', res.data.role)
    userId.value = res.data.id
  } catch (error) {
    console.error('获取用户信息失败', error)
    userRole.value = 'user'
  }
}

// 获取拼团详情
const fetchGroupDetail = async (groupId) => {
  if (!groupId) return // 如果是开团模式，不需要获取拼团详情
  try {
    const res = await request({
      url: `/group/get/${groupId}`,
      method: 'GET'
    })
    console.log('拼团详情:', res)
    if (res.code === 200) {
      groupDetail.value = res.data
      // 检查拼团是否已过期
      const endTime = new Date(res.data.endTime).getTime()
      const now = new Date().getTime()
      if (now > endTime) {
        // 拼团已过期，返回上一页并提示
        uni.showToast({
          title: '该拼团已结束',
          icon: 'none',
          complete: () => {
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          }
        })
        return
      }

      // 计算已拼总价值
      const totalAmount = res.data.orderList.reduce((sum, order) => sum + order.amount, 0)
      groupDetail.value.nowAmount = totalAmount

      // 初始化用户名轮播
      if (res.data.orderList && res.data.orderList.length > 0) {
        startUserNameRotation(res.data.orderList)
      }
    }
  } catch (error) {
    console.error('获取拼团详情失败:', error)
  }
}

// 添加获取商铺信息的方法
const fetchShopInfo = async (shopId) => {
  try {
    const res = await request({
      url: '/shop/getshopInfo',
      method: 'POST',
      data: {
        shopid: shopId
      }
    })
    console.log('获取店铺详情:', res)
    if (res.code === 200) {
      shopInfo.value = res.data
    }
  } catch (error) {
    console.error("获取店铺信息失败", error)
  }
}

// 获取店铺商品
const fetchShopProducts = async (shopId) => {
  try {
    const res = await request({
      url: '/product/shopproduct',
      method: 'POST',
      data: { shopid: shopId }
    })
    if (res.code === 200) {
      const allProducts = []
      res.data.forEach(category => {
        category.productList.forEach(product => {
          allProducts.push({
            ...product,
            count: 0,
            img: product.image,
            price: product.price,
            name: product.name,
            introduction: product.introduction
          })
        })
      })
      productList.value = allProducts
      // 设置第一个商品的图片作为头部背景
      if (allProducts.length > 0) {
        headerImage.value = allProducts[0].image
      }
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
  }
}

// 获取购物车数据
const fetchCartData = async (shopId) => {
  // console.log('获取购物车数据:', shopId)
  if (!shopId) {
    console.error('shopId is undefined')
    return
  }
  try {
    const res = await request({
      url: '/car/selectcar',
      method: 'POST',
      data: { shopid: shopId }
    })

    if (res.code === 200 && res.data) {
      // 更新商品列表中的购物车数量
      productList.value = productList.value.map(product => {
        const cartItem = res.data.find(item => item.productid === product.id)
        return {
          ...product,
          count: cartItem ? cartItem.number : 0,
          cartId: cartItem ? cartItem.id : null  // 确保设置 cartId
        }
      })
      // 更新购物车总数和总价
      updateCart()
    }
  } catch (error) {
    console.error("获取购物车数据失败", error)
    uni.showToast({
      title: '获取购物车数据失败',
      icon: 'none'
    })
  }
}

// 增加商品数量
const increaseCount = async (item) => {
  // 如果正在处理中，显示提示并返回
  if (isProcessing.value) {
    uni.showToast({
      title: '操作太快了，请稍候',
      icon: 'none'
    })
    return
  }

  // 设置处理状态为true
  isProcessing.value = true

  // 清除之前的定时器
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }

  try {
    // 获取正确的 shopId
    const currentShopId = groupType.value === '开团' ?
      shopInfo.value.id :
      groupDetail.value.shopId

    if (!item.count || item.count === 0) {
      // 第一次添加商品，调用添加接口
      const res = await request({
        url: '/car/addcar',
        method: 'POST',
        data: {
          productid: item.id,
          number: 1,
          amount: Number(item.price).toFixed(2),
          image: item.image,
          shopid: currentShopId, // 使用正确的 shopId
          productname: item.name
        }
      })
      if (res.code === 200) {
        if (!item.count) item.count = 0
        item.count++
        item.cartId = res.data.id
      }
    } else {
      // 已有商品，调用更新接口
      await request({
        url: '/car/updatecar',
        method: 'POST',
        data: {
          id: item.cartId,
          number: item.count + 1
        }
      })
      item.count++
    }
    // 使用正确的 shopId 更新购物车数据
    await fetchCartData(currentShopId)
    updateCart()
  } catch (error) {
    console.error("增加商品失败", error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  } finally {
    // 设置定时器，在指定时间后重置处理状态
    debounceTimer.value = setTimeout(() => {
      isProcessing.value = false
    }, DEBOUNCE_DELAY)
  }
}

// 减少商品数量
const decreaseCount = async (item) => {
  if (!item.count) return

  // 如果正在处理中，显示提示并返回
  if (isProcessing.value) {
    uni.showToast({
      title: '操作太快了，请稍候',
      icon: 'none'
    })
    return
  }

  // 设置处理状态为true
  isProcessing.value = true

  // 清除之前的定时器
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }

  try {
    if (item.count === 1) {
      // 最后一个商品，删除购物车项
      await request({
        url: '/car/deletecar',
        method: 'POST',
        data: {
          id: item.cartId
        }
      })
      item.count = 0
      item.cartId = null
    } else {
      // 减少商品数量
      await request({
        url: '/car/updatecar',
        method: 'POST',
        data: {
          id: item.cartId,
          number: item.count - 1
        }
      })
      item.count--
    }
    // 更新购物车数据
    await fetchCartData(groupDetail.value.shopId)
    updateCart()
  } catch (error) {
    console.error("减少商品失败", error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  } finally {
    // 设置定时器，在指定时间后重置处理状态
    debounceTimer.value = setTimeout(() => {
      isProcessing.value = false
    }, DEBOUNCE_DELAY)
  }
}

// 清空购物车
const clearCart = async () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空购物车吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const deletePromises = []
          productList.value.forEach(item => {
            if (item.count > 0 && item.cartId) {
              deletePromises.push(
                request({
                  url: '/car/deletecar',
                  method: 'POST',
                  data: {
                    id: item.cartId
                  }
                })
              )
            }
          })
          await Promise.all(deletePromises)

          productList.value.forEach(item => {
            item.count = 0
            item.cartId = null
          })
          updateCart()
          popup.value.close()
        } catch (error) {
          console.error("清空购物车失败", error)
          uni.showToast({
            title: '清空失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 更新购物车数据
const updateCart = () => {
  cartCount.value = productList.value.reduce((sum, item) => sum + (item.count || 0), 0)
  totalPrice.value = productList.value.reduce((sum, item) => {
    const itemTotal = (item.count || 0) * Number(item.price)
    return Number((sum + itemTotal).toFixed(2))
  }, 0)
}

// 修改提交订单方法中的shopInfo数据来源
const onSubmit = () => {
  if (totalPrice.value <= 0) return

  const shopInfoData = {
    shopId: shopInfo.value.id,
    shopName: shopInfo.value.name,
    shopAvatar: shopInfo.value.avatar,
    address: shopInfo.value.address,
    closeTime: shopInfo.value.closeTime,
    openTime: shopInfo.value.openTime,
    phone: shopInfo.value.phone
  }

  const orderData = {
    cartList: productList.value.filter(item => item.count > 0),
    totalPrice: totalPrice.value,
    deliveryFee: groupDetail.value.deliveryFee || 0,
    packageAmount: shopInfo.value.packageAmount,
    shopInfo: shopInfoData,
    type: groupType.value,
    userId: userId.value,
    groupId: groupType.value === '参团' ? groupDetail.value.id : null
  }

  uni.setStorageSync('orderData', orderData)
  uni.navigateTo({ url: '../GoShopping/index' })
}

const onShowCart = () => {
  if (cartCount.value > 0) {
    popup.value.open()
  } else {
    uni.showToast({ title: '购物车是空的', icon: 'none' })
  }
}

// 添加切换背景图片方法
const changeHeaderImage = (image) => {
  headerImage.value = image
}

// 添加用户名隐藏方法
const hideUserName = (name) => {
  if (!name) return '匿名用户'
  if (name.length <= 2) {
    return '*' + name.substring(1)
  }
  return name.substring(0, 1) + '*'.repeat(name.length - 1)
}

// 添加用户名轮播方法
const startUserNameRotation = (orderList) => {
  let currentIndex = 0

  const rotateNames = () => {
    isUserEntering.value = false

    setTimeout(() => {
      currentUserName.value = hideUserName(orderList[currentIndex].name)
      isUserEntering.value = true
      currentIndex = (currentIndex + 1) % orderList.length
    }, 300)
  }

  // 初始化第一个名字
  currentUserName.value = hideUserName(orderList[0].name)

  // 设置定时轮播
  userRotationTimer = setInterval(rotateNames, 3000)
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (userRotationTimer) {
    clearInterval(userRotationTimer)
  }
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
})

// 价格格式化方法
const formatPrice = (price) => {
  return Number(price).toFixed(2)
}
</script>

<style lang="scss" scoped>
.page {
  background: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.product-header {
  position: relative;
  height: 600rpx;
  width: 100%;

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    transition: all 0.3s ease; // 添加过渡动画
  }
}

.nav-bar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  padding-left: 30rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  background: transparent;
  transition: all 0.3s ease;
  z-index: 2;

  &.scrolled {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  }

  .back-btn {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.3);
    transition: background 0.3s;

    &:active {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
}

.products-container {
  padding: 20rpx;
  background: #fff;
  box-sizing: border-box;
  white-space: nowrap;

  .products-wrapper {
    display: inline-flex;
    padding: 10rpx;

    .product-card {
      width: 300rpx;
      margin-right: 20rpx;
      background: #fff;
      border-radius: 16rpx;
      overflow: hidden;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

      .product-image {
        width: 100%;
        height: 300rpx;
        cursor: pointer; // 添加鼠标手型
        transition: transform 0.2s ease; // 添加hover效果过渡

        &:hover {
          transform: scale(1.05); // 添加hover放大效果
        }
      }

      .product-info {
        padding: 20rpx;

        .product-name {
          font-size: 28rpx;
          font-weight: bold;
          margin-bottom: 10rpx;
        }

        .product-desc {
          font-size: 24rpx;
          color: #666;
          margin-bottom: 20rpx;
        }

        .product-price-action {
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
              display: flex;
              align-items: center;
              justify-content: center;

              &.minus {
                background: #f5f5f5;
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

.group-progress {
  margin: 30rpx 20rpx;
  background: #fff;
  padding: 30rpx;
  border-radius: 16rpx;

  .progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;

    .title {
      font-size: 28rpx;
      color: #333;
    }

    .amount {
      color: #ff5500;
      font-weight: bold;
    }
  }

  .progress-bar {
    height: 16rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    overflow: hidden;
    margin-bottom: 10rpx;

    .progress {
      height: 100%;
      background: linear-gradient(90deg, #ff9f43, #ff5500);
      transition: width 0.3s ease;
    }
  }

  .target-amount {
    font-size: 24rpx;
    color: #999;
    text-align: right;
  }
}

.group-users-scroll {
  margin: 20rpx 0;
  background-color: #fff8e6;
  border-radius: 8rpx;
  padding: 10rpx;
  overflow: hidden;

  .users-scroll {
    width: 100%;
    white-space: nowrap;

    .users-list {
      position: relative;
      height: 40rpx;

      .user-item {
        position: absolute;
        width: 100%;
        font-size: 24rpx;
        color: #ff9900;
        transition: all 0.6s ease-in-out;

        &.item-enter {
          transform: translateY(0);
          opacity: 1;
        }

        &.item-leave {
          transform: translateY(-100%);
          opacity: 0;
        }
      }
    }
  }
}

.foot {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);

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
  padding: 20rpx;

  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .title {
      font-size: 28rpx;
      font-weight: bold;
    }

    .clear {
      font-size: 24rpx;
      color: #ff5500;
      cursor: pointer;
    }
  }

  .cart-item {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .cart-image {
      width: 80rpx;
      height: 80rpx;
      border-radius: 8rpx;
      margin-right: 20rpx;
    }

    .cart-info {
      flex: 1;

      .cart-name {
        font-size: 28rpx;
        margin-bottom: 10rpx;
      }

      .cart-price {
        font-size: 24rpx;
        color: #ff5500;
        margin-bottom: 10rpx;
      }

      .cart-action-buttons {
        display: flex;
        align-items: center;

        .btn {
          width: 44rpx;
          height: 44rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          &.minus {
            background: #f5f5f5;
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
</style>