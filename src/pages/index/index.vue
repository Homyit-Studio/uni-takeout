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

const userRole = ref('user')
const scrollTop = ref(0)
const showSkeleton = ref(true)

onPageScroll((e) => {
  scrollTop.value = e.scrollTop
})

onLoad(async () => {
  showSkeleton.value = true
  await navigateToLoading()
  showSkeleton.value = false
})

onShow(async () => {
  try {
    // 检查是否是从loading页面返回
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const prevPage = pages[pages.length - 2]

    if (prevPage && prevPage.route === 'pages/loading/LoadingIndex') {
      // 从loading页面返回，获取用户数据
      const userData = uni.getStorageSync('userData')
      if (userData && userData.role) {
        userRole.value = userData.role
        await setTabBarByRole(userData.role)
      }
      // 清除存储的数据
      uni.removeStorageSync('userData')
      showSkeleton.value = false
    }
  } catch (error) {
    console.error('获取用户角色失败:', error)
    showSkeleton.value = false
  }
})

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
    await uni.hideTabBar()
  } else if (role === 'merchant') {
    await uni.hideTabBar()
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