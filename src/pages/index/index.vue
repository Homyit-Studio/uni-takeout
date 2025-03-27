<template>
  <view v-if="userRole == 'merchant'">
    <MerchantIndex />
  </view>
  <view v-else-if="userRole == 'admin'">
    <AdminIndex />
  </view>
  <view v-else>
    <UserIndex :scroll-top="scrollTop" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import UserIndex from './indexComponent/UserIndexComponent.vue'
import MerchantIndex from './indexComponent/MerchantIndexComponent.vue'
import AdminIndex from './indexComponent/AdminIndexComponent.vue'
import { onShow, onPageScroll } from '@dcloudio/uni-app'

const userRole = ref('user')
const scrollTop = ref(0)

onPageScroll((e) => {
  scrollTop.value = e.scrollTop
})


onShow(async () => {
  // 从本地存储或API获取用户角色
  const role = uni.getStorageSync('userRole') || await getUserRole()
  userRole.value = role
})

const getUserRole = async () => {
  // 这里添加获取用户角色的API调用
  return 'admin' // 默认返回用户角色
}
</script>

<style lang="scss"></style>