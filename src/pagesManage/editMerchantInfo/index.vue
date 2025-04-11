<template>
  <view class="profile-container">
    <view class="profile-header">
      <view class="header-bg"></view>
    </view>

    <view class="profile-card">
      <!-- 店铺头像 -->
      <view class="info-item">
        <text class="label">店铺头像：</text>
        <view class="avatar-section" @click="changeAvatar">
          <image
            v-if="shopInfo.avatar"
            class="avatar"
            :src="shopInfo.avatar"
            mode="aspectFit"
          ></image>
          <view v-else class="upload-placeholder" @click="changeAvatar">
            点击上传
          </view>
        </view>
      </view>

      <!-- 店铺照片 -->
      <view class="info-item">
        <text class="label">店铺门面：</text>
        <view class="photo-section" @click="changePhoto">
          <image
            v-if="shopInfo.photo"
            class="shop-photo"
            :src="shopInfo.photo"
            mode="aspectFit"
          ></image>
          <view v-else class="upload-placeholder" @click="changePhoto">
            点击上传
          </view>
        </view>
      </view>

      <!-- 店铺信息表单 -->
      <view class="info-item">
        <text class="label">店铺名称</text>
        <input
          class="input"
          v-model="shopInfo.name"
          placeholder="请输入店铺名称"
        />
      </view>

      <view class="info-item">
        <text class="label">店铺地址</text>
        <input
          class="input"
          v-model="shopInfo.address"
          placeholder="请输入店铺地址"
        />
      </view>

      <view class="info-item">
        <text class="label">开店时间</text>
        <picker
          mode="time"
          :value="shopInfo.openTime"
          @change="onOpenTimeChange"
        >
          <view class="picker-value">{{ shopInfo.openTime }}</view>
        </picker>
      </view>

      <view class="info-item">
        <text class="label">关店时间</text>
        <picker
          mode="time"
          :value="shopInfo.closeTime"
          @change="onCloseTimeChange"
        >
          <view class="picker-value">{{ shopInfo.closeTime }}</view>
        </picker>
      </view>

      <view class="info-item">
        <text class="label">包装费</text>
        <input
          class="input"
          type="digit"
          v-model="shopInfo.packageAmount"
          placeholder="请输入包装费"
        />
      </view>

      <view class="info-item">
        <text class="label">起送价</text>
        <input
          class="input"
          type="digit"
          v-model="shopInfo.minDeliveryFee"
          placeholder="请输入起送价"
        />
      </view>

      <view class="info-item">
        <text class="label">联系电话</text>
        <input
          class="input"
          v-model="shopInfo.phone"
          placeholder="请输入联系电话"
        />
      </view>

      <view class="info-item">
        <text class="label">店铺简介</text>
        <textarea
          class="textarea"
          v-model="shopInfo.shopIntroduction"
          placeholder="请输入店铺简介"
        />
      </view>
    </view>

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
      shopId: "",
      shopInfo: {
        shopid: "",
        name: "",
        avatar: "",
        address: "",
        openTime: "",
        closeTime: "",
        photo: "",
        packageAmount: 0,
        shopIntroduction: "",
        minDeliveryFee: 0,
        phone: "",
      },
      avatarFile: null, // 存储店铺头像的临时文件对象
      photoFile: null, // 存储店铺照片的临时文件对象
      isLoading: false,
    };
  },
  methods: {
    // 获取店铺信息
    async getShopInfo() {
      try {
        this.isLoading = true;
        uni.showLoading({ title: "加载中..." });

        const response = await request({
          method: "GET",
          url: "/shop/mershopinfo",
        });

        console.log("获取商家信息成功:", response.data);

        if (response?.code === 200 && response.data) {
          this.shopInfo = response.data;
          this.shopInfo.shopid = response.data.id;
        } else {
          throw new Error(response?.message || "获取店铺信息失败");
        }
      } catch (error) {
        console.error("获取店铺信息失败:", error);
        uni.showToast({
          title: error.message || "获取信息失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
        uni.hideLoading();
      }
    },

    // 更换头像
    async changeAvatar() {
      try {
        const res = await new Promise((resolve, reject) => {
          uni.chooseImage({
            count: 1,
            sizeType: ["compressed"],
            sourceType: ["album", "camera"],
            success: resolve,
            fail: reject,
          });
        });

        this.avatarFile = res.tempFiles[0];
        this.shopInfo.avatar = res.tempFilePaths[0];
      } catch (error) {
        console.error("选择头像失败:", error);
        uni.showToast({
          title: "选择头像失败",
          icon: "none",
        });
      }
    },

    // 更换店铺照片
    async changePhoto() {
      try {
        const res = await new Promise((resolve, reject) => {
          uni.chooseImage({
            count: 1,
            sizeType: ["compressed"],
            sourceType: ["album", "camera"],
            success: resolve,
            fail: reject,
          });
        });

        this.photoFile = res.tempFiles[0];
        this.shopInfo.photo = res.tempFilePaths[0];
      } catch (error) {
        console.error("选择店铺照片失败:", error);
        uni.showToast({
          title: "选择店铺照片失败",
          icon: "none",
        });
      }
    },

    // 上传图片（把图片文件变成在线路径）
    async uploadFile(file) {
      if (!file) return "";

      try {
        const filePath = file.path || file.uri || file;
        const uploadTask = await uni.uploadFile({
          url: "/upload/photo",
          filePath: filePath,
          name: "file",
          header: {
            "Content-Type": "multipart/form-data",
          },
        });

        // 更健壮的响应处理
        console.log("上传响应:", uploadTask);

        // 处理不同平台的响应结构
        const responseData = uploadTask[1]
          ? uploadTask[1].data
          : uploadTask.data;
        if (!responseData) {
          throw new Error("上传接口返回数据为空");
        }

        // 尝试解析JSON
        let response;
        try {
          response =
            typeof responseData === "string"
              ? JSON.parse(responseData)
              : responseData;
        } catch (e) {
          console.error("解析响应数据失败:", e);
          throw new Error("服务器返回数据格式错误");
        }

        if (response.code === 200) {
          return response.data;
        } else {
          throw new Error(response.message || "文件上传失败");
        }
      } catch (error) {
        console.error("文件上传失败:", error);
        throw new Error(`文件上传失败: ${error.message}`);
      }
    },

    // 时间选择器变化
    onOpenTimeChange(e) {
      const selectedTime = e.detail.value;
      const [hours, minutes] = selectedTime.split(":");
      this.shopInfo.openTime = `${hours.padStart(2, "0")}:${minutes.padStart(
        2,
        "0"
      )}:00`;
    },

    onCloseTimeChange(e) {
      const selectedTime = e.detail.value;
      const [hours, minutes] = selectedTime.split(":");
      this.shopInfo.closeTime = `${hours.padStart(2, "0")}:${minutes.padStart(
        2,
        "0"
      )}:00`;
    },

    // 保存修改
    async saveProfile() {
      if (this.isLoading) return;

      try {
        this.isLoading = true;
        uni.showLoading({ title: "保存中..." });

        // 1. 判断是否有新选择的头像和店铺照片
        const shouldUploadAvatar = !!this.avatarFile; // 是否有新头像
        const shouldUploadPhoto = !!this.photoFile; // 是否有新店铺照片

        // 2. 上传头像（仅当用户选择了新图片时上传）
        const avatarUrl = shouldUploadAvatar
          ? await this.uploadFile(this.avatarFile)
          : this.shopInfo.avatar; // 如果没选新图片，直接用原来的URL

        // 3. 上传店铺照片（仅当用户选择了新图片时上传）
        const photoUrl = shouldUploadPhoto
          ? await this.uploadFile(this.photoFile)
          : this.shopInfo.photo; // 如果没选新图片，直接用原来的URL

        // 4. 检查上传结果（仅当用户选择了新图片时才检查）
        if (shouldUploadAvatar && !avatarUrl) {
          throw new Error("店铺头像上传失败");
        }
        if (shouldUploadPhoto && !photoUrl) {
          throw new Error("店铺照片上传失败");
        }

        // 5. 更新店铺信息
        const response = await request({
          method: "POST",
          url: "/shop/updatashop",
          data: {
            shopid: this.shopInfo.shopid,
            name: this.shopInfo.name,
            avatar: avatarUrl, 
            address: this.shopInfo.address,
            openTime: this.shopInfo.openTime,
            closeTime: this.shopInfo.closeTime,
            photo: photoUrl,
            packageAmount: this.shopInfo.packageAmount,
            shopIntroduction: this.shopInfo.shopIntroduction,
            minDeliveryFee: this.shopInfo.minDeliveryFee,
            phone: this.shopInfo.phone,
          },
        });

        console.log("保存店铺信息成功:", response);
        if (response?.code === 200) {
          uni.showToast({
            title: "保存成功",
            icon: "success",
          });
        } else {
          throw new Error(response?.message || "保存失败");
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
    this.getShopInfo();
  },
};
</script>

<style scoped>
.profile-container {
  padding-bottom: 120rpx;
  min-height: 50vh;
  background-color: #f8f8f8;
}

.profile-header {
  position: relative;
  height: 200rpx;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  background: linear-gradient(135deg, #fd6b22 0%, #fbaf89 100%);
}

.profile-card {
  position: relative;
  margin: -100rpx 30rpx 30rpx;
  padding: 120rpx 30rpx 30rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 4rpx 20rpx rgba(253, 107, 34, 0.3);
  transition: opacity 0.3s;
}

.save-btn[disabled] {
  opacity: 0.6;
}

.picker-value {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  padding-right: 20rpx;
}

.textarea {
  flex: 1;
  height: 120rpx;
  font-size: 30rpx;
  color: #333;
  padding: 10rpx;
}

.avatar-section,
.photo-section {
  width: 50%;
  height: 200rpx;
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
}

.avatar,
.shop-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  color: #999;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>
