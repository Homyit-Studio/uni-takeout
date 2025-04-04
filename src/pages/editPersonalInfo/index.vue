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
        <view class="avatar-mask">点击更换</view>
      </view>

      <!-- 昵称编辑 -->
      <view class="info-item">
        <text class="label">昵称</text>
        <input
          class="input"
          v-model="userInfo.nickname"
          placeholder="请输入昵称"
        />
        <uni-icons type="compose" size="18" color="#999"></uni-icons>
      </view>
    </view>

    <!-- 保存按钮 -->
    <button class="save-btn" :disabled="isLoading" @click="saveProfile">
      <text>{{ isLoading ? "保存中..." : "保存修改" }}</text>
    </button>
  </view>
</template>

<script>
import { request } from "@/utils/request";

export default {
  data() {
    return {
      userInfo: {
        avatar: "",
        nickname: "",
      },
      originalAvatar: "", // 存储原始头像URL
      tempAvatarPath: "", // 临时存储新选择的头像路径
      originalNickname: "", // 存储原始昵称
      isLoading: false,
      hasChanged: false, // 标记是否有修改
    };
  },
  methods: {
    // 获取用户信息
    async getUserInfo() {
      try {
        this.isLoading = true;
        uni.showLoading({ title: "加载中..." });

        const response = await request({
          method: "GET",
          url: "/user/getUserInfo",
        });

        if (response?.code === 200 && response.data) {
          this.userInfo = {
            avatar: response.data.avatar || "/static/default-avatar.png",
            nickname: response.data.nickname || "未设置昵称",
          };
          this.originalAvatar = response.data.avatar; // 保存原始头像URL
          this.originalNickname = response.data.nickname; // 保存原始昵称
        } else {
          throw new Error(response?.message || "获取用户信息失败");
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        uni.showToast({
          title: error.message || "获取信息失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
        uni.hideLoading();
      }
    },

    // 修改头像
    changeAvatar() {
      if (this.isLoading) return;

      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.tempAvatarPath = res.tempFilePaths[0];
          this.tempAvatarFile = res.tempFiles[0]; // 保存文件对象
          this.userInfo.avatar = res.tempFilePaths[0];
          this.hasChanged = true;
        },
        fail: (err) => {
          console.error("选择图片失败:", err);
          uni.showToast({
            title: "选择图片失败",
            icon: "none",
          });
        },
      });
    },

    // 保存修改
    async saveProfile() {
      if (this.isLoading) return;

      // 验证昵称
      if (!this.userInfo.nickname.trim()) {
        uni.showToast({
          title: "昵称不能为空",
          icon: "none",
        });
        return;
      }

      // 检查是否有修改
      const isNicknameChanged =
        this.userInfo.nickname !== this.originalNickname;
      if (!this.hasChanged && !this.tempAvatarPath && !isNicknameChanged) {
        uni.showToast({
          title: "未修改任何信息",
          icon: "none",
        });
        return;
      }

      try {
        this.isLoading = true;
        uni.showLoading({ title: "保存中..." });

        // 处理头像路径：如果是网络 URL，先下载到本地
        let avatarPath = this.tempAvatarPath;
        if (!avatarPath && this.originalAvatar) {
          if (this.originalAvatar.startsWith("http")) {
            // 下载网络图片到本地临时文件
            const downloadRes = await uni.downloadFile({
              url: this.originalAvatar,
            });
            avatarPath = downloadRes.tempFilePath;
          } else {
            // 已经是本地路径（如 static/ 或 wxfile:// 路径）
            avatarPath = this.originalAvatar;
          }
        }

        // 确保有可用的头像路径（如果没有头像，可能需要上传一个默认头像或跳过）
        if (!avatarPath) {
          throw new Error("无法获取有效的头像路径");
        }

        // 使用Promise包装上传过程
        const result = await new Promise((resolve, reject) => {
          const uploadTask = uni.uploadFile({
            url: "/user/updateInfo",
            filePath: avatarPath,
            name: "file",
            formData: { nickName: this.userInfo.nickname },
            header: { "Content-Type": "multipart/form-data" },
            success: (uploadRes) => {
              try {
                const data =
                  typeof uploadRes.data === "string"
                    ? JSON.parse(uploadRes.data)
                    : uploadRes.data;
                resolve(data);
              } catch (e) {
                reject(new Error("解析响应数据失败"));
              }
            },
            fail: (err) => {
              reject(err);
            },
          });

          uploadTask.onProgressUpdate((res) => {
            console.log("上传进度:", res.progress);
          });
        });

        // 统一处理响应
        if (result?.code === 200) {
          uni.showToast({ title: "保存成功", icon: "success" });

          // 更新本地数据
          if (result.data?.avatar) {
            this.userInfo.avatar = result.data.avatar;
            this.originalAvatar = result.data.avatar;
          }
          this.originalNickname = this.userInfo.nickname;

          // 重置状态
          this.tempAvatarPath = "";
          this.hasChanged = false;
          uni.$emit("userInfoUpdated", this.userInfo);
        } else {
          throw new Error(result?.message || "保存失败");
        }
      } catch (error) {
        console.error("保存失败:", error);
        uni.showToast({
          title: error.message || "保存失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
        uni.hideLoading();
      }
    },
  },

  onLoad() {
    this.getUserInfo();
  },
};
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

.avatar-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  font-size: 20rpx;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
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

.save-btn[disabled] {
  opacity: 0.6;
}
</style>
