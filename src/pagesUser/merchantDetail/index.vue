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
      'background-image': `url(${shopInfo?.photo})`
    }" data-type="1">
      <view class="shop-header">
        <image class="shop-avatar" :src="shopInfo?.avatar" mode="aspectFill" />
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
    <view class="tabs area_height" data-type="2" :style="{ 'top': statusBarHeight + tabHeight + 'px' }">
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
            <text class="subtitle">{{ shopGroups.length }}个进行中</text>
          </view>

          <swiper v-if="shopGroups.length > 0" class="group-swiper" :autoplay="true" :circular="true" :interval="5000">
            <swiper-item v-for="(group, index) in shopGroups" :key="index" @click="goToGroup(group)">
              <view class="group-card" :class="{ 'disabled': isGroupExpired(group) }">
                <view class="group-info">
                  <view class="group-header">
                    <view class="users-scroll">
                      <view class="users-list">
                        <text :class="['user-item', {
                          'item-enter': userEntering[group.id],
                          'item-leave': !userEntering[group.id]
                        }]">
                          {{ currentGroupUsers[group.id] || '暂无用户参与' }}正在拼团...
                        </text>
                      </view>
                    </view>
                    <view class="countdown-box">
                      <uni-icons type="clock" size="14" color="#FF5500"></uni-icons>
                      <text class="countdown-text">{{ formatCountdown(group.countdown) }}</text>
                    </view>
                  </view>

                  <view class="group-progress">
                    <text>已拼{{ formatPrice(getGroupAmount(group)) }}元</text>
                    <text>目标{{ group.minDeliveryFee }}元</text>
                  </view>
                </view>
              </view>
            </swiper-item>
          </swiper>
          <view v-else class="group-swiper">
            <view class="group-card">
              <view class="group-info">
                <view class="group-header">
                  <text class="no-group-text" style="color: #999;">暂无拼团信息</text>
                </view>
              </view>
            </view>
          </view>

          <view class="action-box" @click="createNewGroup">
            <text class="action-text">创建拼团</text>
            <uni-icons type="forward" size="16" color="#666" />
          </view>
        </view>
      </view>
    </view>

    <view class="section-title">常售餐饮</view>
    <!-- 菜品区域 -->
    <view id="item-2" class="cate_content">
      <scroll-view scroll-y="true" :scroll-top="leftScrollTop" class="left"
        :style="{ 'height': scrollHeight + 'px', 'top': stickyTop + tabHeight + 'px' }">
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
              <image :src="cell?.img" mode="aspectFill" class="product_img"></image>
              <view class="product_info">
                <view class="name">{{ cell.name }}</view>
                <view class="introduction">{{ cell.introduction }}</view>
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
            <uni-icons type="cart" color="#ff5500" size="32" />
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
                <image :src="item?.img" mode="aspectFill" class="cart-img"></image>
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
import { onPageScroll, onLoad, onShow } from '@dcloudio/uni-app'
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


const tabHeight = ref(38) // tab的高度
const tabThreshold = 50 // 滚动阈值

const shopInfo = ref({
  photo: '',
  avatar: '',
  name: '',
  address: '',
  openTime: '',
  closeTime: '',
  phone: ''
})

// 其他响应式数据...
const anchorPositions = ref([]); // 存储tab区域的top位置
const topList = ref([]); // 存储右侧分类项的位置

const tabList = reactive([
  { name: '跟团新讯' },
  { name: '常售餐饮' }
])

const productList = ref([])

const purchaseList = ref([])

const popup = ref(null)
const cartCount = ref(0)
const totalPrice = ref(0)
const deliveryFee = ref(0)
const packageAmount = ref(0)
const minDeliveryPrice = ref(0)
const scrollTop = ref(0)
const scrollLeft = ref(0)
let scrollTimer = null
let scrollInterval = null

// 添加拼团相关数据
const groupInfo = ref(null)
const isGroupOrder = ref(false)

// 获取拼团信息
const fetchGroupInfo = async (shopId) => {
  try {
    const res = await request({
      url: `/group/getshop/${shopId}`,
      method: 'POST',
    })
    if (res.code === 200) {
      groupInfo.value = res.data
      isGroupOrder.value = true
    }
  } catch (error) {
    console.error("获取拼团信息失败", error)
  }
}

// 添加新的响应式数据
const shopGroups = ref([])
const currentGroupUsers = ref({})
const userEntering = ref({})
const userTimers = ref({})
const countdownTimers = ref({})

// 添加名称隐藏方法
const hideUserName = (name) => {
  if (!name) return '匿名用户'
  if (name.length <= 2) {
    return '*' + name.substring(1)
  }
  return name.substring(0, 1) + '*'.repeat(name.length - 1)
}

// 获取店铺拼团信息
const fetchShopGroups = async () => {
  try {
    const res = await request({
      url: `/group/getshop/${shopInfo.value.id}`,
      method: 'GET'
    })
    if (res.code === 200) {
      console.log('获取店铺拼团信息:', res.data)
      shopGroups.value = res.data.map(group => {
        const endTime = new Date(group.endTime).getTime()
        const now = new Date().getTime()
        const countdown = Math.max(0, Math.floor((endTime - now) / 1000))

        // 为每个拼团创建倒计时
        if (countdown > 0) {
          if (countdownTimers.value[group.id]) {
            clearInterval(countdownTimers.value[group.id])
          }
          countdownTimers.value[group.id] = setInterval(() => {
            updateCountdown(group.id)
          }, 1000)
        }

        return {
          ...group,
          countdown
        }
      }).filter(group => !isGroupExpired(group))

      // 初始化每个拼团的用户名轮播
      shopGroups.value.forEach(group => {
        if (group.orderList && group.orderList.length > 0) {
          initializeGroupUserRotation(group)
        }
      })
    }
  } catch (error) {
    console.error("获取店铺拼团信息失败", error)
  }
}

// 初始化拼团用户名轮播
const initializeGroupUserRotation = (group) => {
  currentGroupUsers.value[group.id] = hideUserName(group.orderList[0].name)
  userEntering.value[group.id] = true

  userTimers.value[group.id] = setInterval(() => {
    rotateGroupUsers(group)
  }, 3000)
}

// 轮播拼团用户名
const rotateGroupUsers = (group) => {
  const users = group.orderList
  const currentIndex = users.findIndex(user =>
    hideUserName(user.name) === currentGroupUsers.value[group.id]
  )

  userEntering.value[group.id] = false

  setTimeout(() => {
    const nextIndex = (currentIndex + 1) % users.length
    currentGroupUsers.value[group.id] = hideUserName(users[nextIndex].name)
    userEntering.value[group.id] = true
  }, 300)
}

// 获取拼团总金额
const getGroupAmount = (group) => {
  return group.orderList?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0
}

// 检查拼团是否过期
const isGroupExpired = (group) => {
  const endTime = new Date(group.endTime).getTime()
  const now = new Date().getTime()
  return now >= endTime
}

// 跳转到拼团详情
const goToGroup = (group) => {
  if (isGroupExpired(group)) {
    uni.showToast({
      title: '该拼团已结束',
      icon: 'none'
    })
    return
  }
  uni.navigateTo({
    url: `../../pagesUser/productDetail/ProductDetailIndex?id=${group.id}&shopId=${shopInfo.value.id}&type=参团`
  })
}

// 创建新拼团
const createNewGroup = () => {
  uni.navigateTo({
    url: `../../pagesUser/productDetail/ProductDetailIndex?shopId=${shopInfo.value.id}&type=开团`
  })
}

// 在组件卸载时清理定时器
onUnmounted(() => {
  Object.values(userTimers.value).forEach(timer => {
    clearInterval(timer)
  })
  userTimers.value = {}

  Object.values(countdownTimers.value).forEach(timer => {
    clearInterval(countdownTimers.value)
  })
  countdownTimers.value = {}

  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }

  if (menuDebounceTimer.value) {
    clearTimeout(menuDebounceTimer.value)
  }
})

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

// 获取购物车数据
const fetchCartData = async () => {
  try {
    const res = await request({
      url: '/car/selectcar',
      method: 'POST',
      data: {
        shopid: shopInfo.value.id
      }
    })
    console.log('购物车数据:', res)
    if (res.data && Array.isArray(res.data)) {
      // 将购物车数据同步到现有商品列表中
      productList.value.forEach(category => {
        category.list.forEach(product => {
          const cartItem = res.data.find(item => item.productid === product.id)
          if (cartItem) {
            product.count = cartItem.number
            product.cartId = cartItem.id // 保存购物车项id，用于删除
          } else {
            product.count = 0
          }
        })
      })
      updateCart()
    }
  } catch (error) {
    console.error("获取购物车数据失败", error)
  }
}

onShow(async () => {
  await fetchCartData()
})

onLoad(async (options) => {
  await fetchShopDetail(options.id); // 假设这是异步请求
  await fetchShopInfo(options.id); // 假设这是异步请求
  await fetchCartData(); // 假设这是异步请求
  nextTick(() => {
    getTop(); // 在数据加载完成后调用
  });
  // 如果有groupId参数，说明是从拼团进入
  if (options.groupId) {
    await fetchGroupInfo(options.groupId)
  }

  await fetchShopGroups()
});

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

  nextTick(() => {
    updateActiveTab(currentScrollTop)
    updateMenuActive(currentScrollTop + tabHeight.value)
  })
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
    packageAmount.value = res.data.packageAmount
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
          introduction: product.introduction,
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
      scrollHeight.value = windowHeight - allAreaHeight.value + addHeight - tabHeight.value
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
    // console.log('query.exec 返回结果:', res); // 调试信息
    if (res?.[0]) {
      topList.value = res[0].map(item => ({
        top: item.top,
        bottom: item.bottom,
        height: item.height
      }));
      if (res[0].length > 0) {
        rightItemHeight.value = res[0][0].height;
      }
    }
    // console.log('topList.value:', topList.value);
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

  const currentPosition = currentScrollTop + stickyTop.value + 10

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
      scrollTop: targetElement.top - stickyTop.value - tabHeight.value,
      duration: 300,
      complete: () => {
        updateOpacity(targetElement.top - stickyTop.value - tabHeight.value)
        setTimeout(() => {
          isTabClick.value = false
        }, 400) // 比滚动时间长一点确保完成
      }
    })
  }
}

// 添加菜单点击防抖相关状态
const isMenuProcessing = ref(false)
const menuDebounceTimer = ref(null)
const MENU_DEBOUNCE_DELAY = 800 // 菜单点击防抖延迟时间

// 修改 onChangeCate 方法
const onChangeCate = async (item, index) => {
  if (currentIndex.value == index) return

  // 如果正在处理中，显示提示并返回
  if (isMenuProcessing.value) {
    uni.showToast({
      title: '点击太快了，请稍候',
      icon: 'none'
    })
    return
  }

  // 设置处理状态为true
  isMenuProcessing.value = true

  // 清除之前的定时器
  if (menuDebounceTimer.value) {
    clearTimeout(menuDebounceTimer.value)
  }

  isTabClick.value = true
  currentIndex.value = index
  leftScrollTop.value = rightItemHeight.value * index

  await nextTick()

  const targetElement = topList.value[index]

  if (targetElement) {
    uni.pageScrollTo({
      scrollTop: targetElement.top - stickyTop.value - tabHeight.value,
      duration: 300,
      complete: () => {
        setTimeout(() => {
          isTabClick.value = false
        }, 400)
      },
    })
  }

  // 设置定时器，在指定时间后重置处理状态
  menuDebounceTimer.value = setTimeout(() => {
    isMenuProcessing.value = false
  }, MENU_DEBOUNCE_DELAY)
}

const updateMenuActive = (currentScrollTop) => {
  if (isTabClick.value) return
  currentScrollTop = parseInt(currentScrollTop) + stickyTop.value
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

// 添加防抖相关的状态
const isProcessing = ref(false)
const debounceTimer = ref(null)
const DEBOUNCE_DELAY = 500 // 设置防抖延迟时间为500ms

// 修改 increaseCount 方法
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
    if (!item.count || item.count === 0) {
      // 第一次添加商品，调用添加接口
      const res = await request({
        url: '/car/addcar',
        method: 'POST',
        data: {
          productid: item.id,
          number: 1,
          amount: item.price,
          image: item.img,
          shopid: shopInfo.value.id,
          productname: item.name
        }
      })
      if (!item.count) item.count = 0
      item.count++
      item.cartId = res.data.id
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
    // 更新购物车数据
    await fetchCartData()
    updateCart()
  } catch (error) {
    console.error("更新购物车失败", error)
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

// 修改 decreaseCount 方法 
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
      // 最后一个商品，需要删除
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
    await fetchCartData()
    updateCart()
  } catch (error) {
    console.error("更新购物车失败", error)
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
    success: async (res) => {
      if (res.confirm) {
        try {
          const deletePromises = []
          productList.value.forEach(cate => {
            cate.list.forEach(item => {
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
          })
          await Promise.all(deletePromises)

          productList.value.forEach(cate => {
            cate.list.forEach(item => {
              item.count = 0
              item.cartId = null
            })
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

// 修改提交订单方法
const onSubmit = () => {
  if (totalPrice.value < minDeliveryPrice.value) return

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
    cartList: cartList.value,
    totalPrice: totalPrice.value,
    deliveryFee: deliveryFee.value,
    packageAmount: packageAmount.value,
    shopInfo: shopInfoData,
    isGroupOrder: isGroupOrder.value,
    groupInfo: groupInfo.value
  }

  uni.setStorageSync('orderData', orderData)
  uni.navigateTo({ url: '../GoShopping/index' })
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

// 价格格式化方法
const formatPrice = (price) => {
  return Number(price).toFixed(2)
}

// 倒计时格式化方法
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

const updateCountdown = (groupId) => {
  if (shopGroups.value.find(g => g.id === groupId)?.countdown > 0) {
    shopGroups.value = shopGroups.value.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          countdown: group.countdown - 1
        }
      }
      return group
    })
  } else {
    clearInterval(countdownTimers.value[groupId])
  }
}
</script>

<style lang="scss" scoped>
view {
  box-sizing: border-box;
}

.page {
  background-color: #fff;
  padding-bottom: calc(constant(safe-area-inset-bottom) + 200rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 200rpx);
}

.nav_bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
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
  z-index: 10;

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
    background: linear-gradient(90deg, #fff1da, #ffe8c4);
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(255, 153, 0, 0.1);

    .entry-header {
      padding: 24rpx;
      // background: linear-gradient(90deg, #fff1da, #ffe8c4);

      .title {
        font-size: 32rpx;
        color: #ff5500;
        font-weight: bold;
        margin-right: 20rpx;
      }

      .subtitle {
        font-size: 26rpx;
        color: #ff9900;
        margin-left: 20rpx;
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

  .group-swiper {
    height: 250rpx;

    .group-card {
      // margin: 0 20rpx;
      padding: 20rpx;
      // background: rgba(255, 255, 255, 0.9);
      border-radius: 16rpx;

      // 添加禁用样式
      &.disabled {
        opacity: 0.6;
        pointer-events: none;
        position: relative;

        &::after {
          content: '拼团已结束';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.5);
          color: #fff;
          padding: 10rpx 20rpx;
          border-radius: 8rpx;
          font-size: 24rpx;
        }
      }

      .group-info {

        .group-progress {
          display: flex;
          justify-content: space-between;
          font-size: 26rpx;
          color: #ff5500;
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
        z-index: 5;
      }

      .product_item {
        height: 160rpx;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;
        padding: 0 20rpx;

        .product_img {
          width: 160rpx;
          height: 160rpx;
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

          .introduction {
            font-size: 24rpx;
            color: #666;
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
  z-index: 15;
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
  z-index: 10;

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

.group-info {
  margin: 20rpx;
  padding: 20rpx;
  background: #fff9e6;
  border-radius: 16rpx;

  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #FF5500;
    }

    .time {
      font-size: 26rpx;
      color: #666;
    }

    .countdown-box {
      display: flex;
      align-items: center;
      background: #FFF0F3;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;

      .countdown-text {
        color: #FF5500;
        font-size: 24rpx;
        margin-left: 8rpx;
      }
    }
  }

  .users-scroll {
    margin-bottom: 20rpx;
    width: 300rpx;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    position: relative;


    .users-list {
      position: relative;
      height: 40rpx;

      .user-item {
        position: absolute;
        width: 100%;
        font-size: 28rpx;
        color: #ff5500;
        transition: all 0.3s ease;

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

  .group-progress {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    color: #FF5500;
  }

  .members-scroll {
    width: 100%;
    white-space: nowrap;

    .members-list {
      display: inline-flex;
      padding: 10rpx 0;

      .member-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-right: 30rpx;

        .member-avatar {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          border: 2rpx solid #FF5500;
        }

        .member-name {
          font-size: 24rpx;
          color: #666;
          margin-top: 10rpx;
        }
      }
    }
  }
}
</style>