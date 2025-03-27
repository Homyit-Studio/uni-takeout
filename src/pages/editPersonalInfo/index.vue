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
    </view>
    
    <!-- 保存按钮 -->
    <view class="save-btn" @click="saveProfile">
      <text>保存修改</text>
    </view>
  </view>
</template>

<script>
import { request } from '@/utils/request'

export default {
  data() {
    return {
      userInfo: {
        avatar: '',
        nickname: '',
        id: null
      },
      isLoading: false,
      originalInfo: {} // 用于保存原始数据，比较是否有修改
    }
  },
  methods: {
    // 获取用户信息
    async getUserInfo() {
      try {
        this.isLoading = true
        uni.showLoading({ title: '加载中...' })
        
        const response = await request({
          method: 'GET',
          url: '/user/getUserInfo'
        })
        
        if (response?.code === 200 && response.data) {
          this.userInfo = {
            avatar: response.data.avatar || '/static/default-avatar.png',
            nickname: response.data.nickname || '未设置昵称',
            id: response.data.id
          }
          // 保存原始数据用于比较
          this.originalInfo = JSON.parse(JSON.stringify(this.userInfo))
        } else {
          throw new Error(response?.message || '获取用户信息失败')
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        uni.showToast({
          title: error.message || '获取信息失败',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
        uni.hideLoading()
      }
    },
    
    // 修改头像
    changeAvatar() {
      if (this.isLoading) return;
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.userInfo.avatar = res.tempFilePaths[0];
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 保存个人信息
    async saveProfile() {
      if (this.isLoading) return;
      // 验证昵称
      if (!this.userInfo.nickname.trim()) {
        uni.showToast({
            title: '昵称不能为空',
            icon: 'none'
        });
        return;
      }
      // 检查是否有修改
      if (JSON.stringify(this.userInfo) === JSON.stringify(this.originalInfo)) {
        uni.showToast({
            title: '未修改任何信息',
            icon: 'none'
        });
        return;
      }
      try {
        this.isLoading = true;
        uni.showLoading({ title: '保存中...' });
        const userDTO = {
            nickname: this.userInfo.nickname,
            id: this.userInfo.id
        };
        let formData = {
            userDTO: JSON.stringify(userDTO)
        };
        if (this.userInfo.avatar) {
            // 如果头像为网络图片路径，直接添加到formData
            if (this.userInfo.avatar.startsWith('http')) {
                formData.file = this.userInfo.avatar;
            } else {
                // 将本地头像转换为base64格式
                const base64Data = await new Promise((resolve, reject) => {
                    uni.getFileSystemManager().readFile({
                        filePath: this.userInfo.avatar,
                        encoding: 'base64',
                        success: (res) => resolve(res.data),
                        fail: (err) => reject(err)
                    });
                });
                formData.file = base64Data;
            }
        } else {
            formData.file = '';
        }
        const response = await request({
            method: 'POST',
            url: '/user/updateInfo',
            data: formData,
            header: {
                'Content-Type': 'application/json'
            }
        });
        this.handleSaveResponse(response);
      } catch (error) {
        console.error('保存失败:', error);
        uni.showToast({
            title: error.message || '保存失败',
            icon: 'none'
        });
      } finally {
        this.isLoading = false;
        uni.hideLoading();
      }
    },
    // 处理保存响应
    handleSaveResponse(response) {
      if (response?.code === 200) {
        uni.showToast({
            title: '保存成功',
            icon:'success'
        });
        // 更新原始数据
        this.originalInfo = JSON.parse(JSON.stringify(this.userInfo));
        // 通知其他组件用户信息已更新
        uni.$emit('userInfoUpdated', this.userInfo);
      } else {
        throw new Error(response?.message || '保存失败');
      }
    }
  },
  
  onLoad() {
    this.getUserInfo()
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