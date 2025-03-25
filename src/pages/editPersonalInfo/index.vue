<template>
  <view class="profile-container">
    <!-- 头部背景 -->
    <view class="profile-header">
      <view class="header-bg"></view>
    </view>
    
    <!-- 用户信息卡片 -->
    <view class="profile-card">
      <!-- 头像区域 -->
      <view class="avatar-section" @click="changeAvatar">
        <image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
      </view>
      
      <!-- 昵称编辑 -->
      <view class="info-item">
        <text class="label">昵称</text>
        <input class="input" v-model="userInfo.nickname" placeholder="请输入昵称" />
        <uni-icons type="compose" size="18" color="#999"></uni-icons>
      </view>
      
      <!-- 其他信息展示 -->
      <view class="info-item" @click="showToast('手机号暂不可修改')">
        <text class="label">手机号</text>
        <text class="value">{{ userInfo.phone }}</text>
        <uni-icons type="forward" size="18" color="#999"></uni-icons>
      </view>
    </view>
    
    <!-- 保存按钮 -->
    <view class="save-btn" @click="saveProfile">
      <text>保存修改</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        avatar: '/static/merchant_pic.jpg', // 默认头像
        nickname: '用户昵称',
        phone: '138****1234' // 模拟手机号
      }
    }
  },
  methods: {
    // 修改头像
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 这里可以添加图片压缩逻辑
          this.userInfo.avatar = res.tempFilePaths[0]
          
          // 模拟上传到服务器
          this.uploadAvatar(res.tempFilePaths[0])
        }
      })
    },
    
    // 模拟头像上传
    uploadAvatar(filePath) {
      // 这里应该是实际的上传接口
      console.log('上传头像到服务器:', filePath)
      // 模拟上传延迟
      uni.showLoading({
        title: '上传中...'
      })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '头像上传成功',
          icon: 'success'
        })
      }, 1500)
    },
    
    // 保存个人信息
    saveProfile() {
      if (!this.userInfo.nickname.trim()) {
        uni.showToast({
          title: '昵称不能为空',
          icon: 'none'
        })
        return
      }
      
      // 这里应该是实际的保存接口
      console.log('保存用户信息:', this.userInfo)
      uni.showLoading({
        title: '保存中...'
      })
      
      // 模拟API请求
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        // 这里可以添加保存成功后的逻辑
        // 例如更新全局用户信息
        uni.$emit('userInfoUpdated', this.userInfo)
      }, 1000)
    },
    
    // 提示信息
    showToast(msg) {
      uni.showToast({
        title: msg,
        icon: 'none'
      })
    }
  },
  
  onLoad() {
    // 这里可以添加从服务器获取用户信息的逻辑
    // this.getUserInfo()
  }
}
</script>

<style scoped>
.profile-container {
  padding-bottom: 100rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.profile-header {
  position: relative;
  height: 300rpx;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300rpx;
  background: linear-gradient(135deg, #fd6b22 0%, #fbaf89 100%);
}

.profile-card {
  position: relative;
  margin: -100rpx 30rpx 30rpx;
  padding: 120rpx 30rpx 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.avatar-section {
  position: absolute;
  top: -80rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid #fff;
  background-color: #f1f1f1;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 100%;
  height: 100%;
}

.avatar-edit {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 50rpx;
  height: 50rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f1f1f1;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  width: 150rpx;
  font-size: 30rpx;
  color: #666;
}

.input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  padding-right: 20rpx;
}

.value {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  padding-right: 20rpx;
}

.save-btn {
  margin: 50rpx 30rpx;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  background: linear-gradient(135deg, #fd6b22 0%, #fbaf89 100%);
  color: #fff;
  border-radius: 45rpx;
  font-size: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(79, 172, 254, 0.3);
}
</style>