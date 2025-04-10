<template>
  <SkeletonIndex v-if="showSkeleton" />
  <template v-else>
    <view v-if="userRole == 'merchant'">
      <MerchantIndex />
    </view>
    <view v-else-if="userRole == 'admin'">
      <AdminIndex />
    </view>
    <view v-else-if="userRole == 'user'">
      <UserIndex :scroll-top="scrollTop" />
    </view>
  </template>
</template>

<script setup>
import { ref } from 'vue'
import UserIndex from './indexComponent/UserIndexComponent.vue'
import MerchantIndex from './indexComponent/MerchantIndexComponent.vue'
import AdminIndex from './indexComponent/AdminIndexComponent.vue'
import SkeletonIndex from './indexComponent/SkeletonIndex.vue'
import { onShow, onPageScroll, onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'
import WebSocket from '@/utils/websocket'

const userRole = ref('user')
const scrollTop = ref(0)
const showSkeleton = ref(true)

onPageScroll((e) => {
  scrollTop.value = e.scrollTop
})

onLoad(async () => {
  await uni.hideTabBar()
  showSkeleton.value = true
  await navigateToLoading()
  showSkeleton.value = false
})
onShow(async () => {
  try {
    // 首先检查本地存储中是否有用户角色信息
    const localUserData = uni.getStorageSync('userData');
    if (localUserData && localUserData.role) {
      userRole.value = localUserData.role;
      await setTabBarByRole(localUserData.role);
      return;
    }

    // 获取当前页面栈
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];

    // 判断当前页面是否是主页面（index页面）
    if (currentPage && currentPage.route === 'pages/index/index') {
      // 检查是否是从loading页面返回
      const prevPage = pages[pages.length - 2];
      if (prevPage && prevPage.route === 'pages/loading/LoadingIndex') {
        // 从loading页面返回，获取用户数据
        const userData = uni.getStorageSync('userData');
        if (showSkeleton.value && userData && userData.role) {
          userRole.value = userData.role;
          await setTabBarByRole(userData.role);
        }
        // 清除存储的数据
        uni.removeStorageSync('userData');
        showSkeleton.value = false;
      }
    }
  } catch (error) {
    console.error('获取用户角色失败:', error);
    showSkeleton.value = false;
  }
});
// 修改WebSocket初始化函数，添加shopId参数
const initWebSocket = (shopId) => {
  return new Promise((resolve) => {
    const ws = new WebSocket({
      url: `wss://homyit2023.online:9000/ws/${shopId}`,
      heartMsg: 'ping',
      onOpen: () => {
        console.log('WebSocket连接成功')
        resolve()
      },
      onMessage: (data) => {
        console.log('收到消息:', data)
      },
      onClose: () => {
        console.log('连接关闭')
      },
      onError: (err) => {
        console.error('连接错误:', err)
      }
    })
  })
}
// 获取商铺信息
const getShopInfo = async () => {
  try {
    const res = await request({
      url: '/shop/mershopinfo',
      method: 'GET'
    })
    if (res.code === 200) {
      return res.data
    } else {
      throw new Error('获取商铺信息失败')
    }
  } catch (error) {
    console.error('获取商铺信息失败：', error)
    throw error
  }
}

// 简化导航方法，移除事件相关代码
const navigateToLoading = () => {
  return new Promise((resolve, reject) => {
    uni.navigateTo({
      url: '/pages/loading/LoadingIndex',
      success: resolve,
      fail: reject
    })
  })
}

// 添加TabBar设置方法
const setTabBarByRole = async (role) => {
  if (role === 'admin') {
    uni.setTabBarItem({
      index: 2,
      text: '',
      iconPath: '',
      selectedIconPath: ''
    })
    uni.setTabBarItem({
      index: 1,
      text: '',
      iconPath: '',
      selectedIconPath: ''
    })
    uni.setTabBarItem({
      index: 0,
      text: '',
      iconPath: '',
      selectedIconPath: ''
    })
  } else if (role === 'merchant') {
    const shopInfo = await getShopInfo()
    initWebSocket(shopInfo.id)
    uni.setTabBarItem({
      index: 2,
      text: '',
      iconPath: '',
      selectedIconPath: ''
    })
    uni.setTabBarItem({
      index: 1,
      text: '',
      iconPath: '',
      selectedIconPath: ''
    })
    uni.setTabBarItem({
      index: 0,
      text: '',
      iconPath: '',
      selectedIconPath: ''
    })
  } else {
    await uni.showTabBar()
    uni.setTabBarItem({
      index: 2,
      text: '我的',
      iconPath: '/static/tabbar/my.png',
      selectedIconPath: '/static/tabbar/my-active.png'
    })
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
      selectedIconPath: '/static/tabbar/home-active.png'
    })
  }
}

const getUserRole = async () => {
  return 'user'
}
</script>

<style lang="scss"></style>