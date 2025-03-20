<template>
  <view v-if="userRole == 'merchant'">
    <MerchantIndex />
  </view>
  <view v-else-if="userRole == 'admin'">
    <AdminIndex />
  </view>
  <view v-else>
    <UserIndex />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import UserIndex from './indexComponent/UserIndexComponent.vue'
import MerchantIndex from './indexComponent/MerchantIndexComponent.vue'
import AdminIndex from './indexComponent/AdminIndexComponent.vue'
import { onShow } from '@dcloudio/uni-app'

//权限控制 
const userRole = ref('user') // 默认用户角色


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