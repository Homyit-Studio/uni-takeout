<template>
  <view class="merchant-entry-container">
    <!-- 店铺名称输入 -->
    <view class="input-item">
      <view class="label"><span class="required">*</span>店铺名称</view>
      <input v-model="shopName" placeholder="请输入店铺名称" />
    </view>

    <!-- 店铺电话 -->
    <view class="input-item">
      <view class="label"><span class="required">*</span>店铺电话</view>
      <input v-model="shopPhone" placeholder="请输入店铺联系电话" type="tel" />
    </view>

    <!-- 店铺照片上传 -->
    <view class="input-item">
      <view class="label"><span class="required">*</span>店铺照片</view>
      <view class="upload-avatar">
        <image v-if="shopPhoto" :src="shopPhoto" mode="aspectFill"></image>
        <view v-else class="upload-placeholder" @click="choosePhoto"
          >点击上传</view
        >
      </view>
    </view>

    <!-- 店铺地址上传 -->
    <view class="input-item">
      <view class="label"><span class="required">*</span>店铺地址</view>
      <view class="address-input-container">
        <input v-model="shopAddress" placeholder="请输入店铺地址" />
        <button class="map-select-btn" @click="chooseLocation">地图选择</button>
      </view>
    </view>

    <!-- 店铺简介输入 -->
    <view class="input-item">
      <view class="label"><span class="required">*</span>店铺简介</view>
      <textarea
        v-model="shopIntroduction"
        placeholder="请输入店铺简介"
      ></textarea>
    </view>

    <!-- 营业执照注册号 -->
    <view class="input-item">
      <view class="label"><span class="required">*</span>营业执照注册号</view>
      <input v-model="businessLicenseCode" placeholder="请输入营业执照注册号" />
    </view>

    <!-- 营业执照照片上传 -->
    <view class="input-item">
      <view class="label"><span class="required">*</span>营业执照照片</view>
      <view class="upload-license">
        <image
          v-if="businessLicenseImage"
          :src="businessLicenseImage"
          mode="aspectFill"
        ></image>
        <view v-else class="upload-placeholder" @click="chooseLicenseImage"
          >点击上传</view
        >
      </view>
    </view>

    <!-- 提交按钮 -->
    <button class="submit-btn" @click="submitForm">提交入驻申请</button>
  </view>
</template>

<script>
import { request } from "@/utils/request";

export default {
  data() {
    return {
      shopName: "",
      shopPhone: "",
      shopPhoto: "",
      shopPhotoFile: null,
      shopAddress: "",
      shopIntroduction: "",
      businessLicenseCode: "",
      businessLicenseImage: "",
      businessLicenseImageFile: null,
    };
  },
  methods: {
    // 选择店铺照片
    choosePhoto() {
      uni.chooseImage({
        count: 1,
        sourceType: ["album", "camera"],
        success: (res) => {
          this.shopPhoto = res.tempFilePaths[0];
          this.shopPhotoFile = res.tempFiles[0];
        },
        fail: (err) => {
          console.error("选择照片失败:", err);
        },
      });
    },
    // 地图选择地址
    chooseLocation() {
      uni.chooseLocation({
        success: (res) => {
          this.shopAddress = res.address || res.name;
        },
        fail: (err) => {
          console.error("选择地址失败:", err);
          uni.showToast({
            title: "请手动输入地址",
            icon: "none",
          });
        },
      });
    },
    // 选择营业执照照片
    chooseLicenseImage() {
      uni.chooseImage({
        count: 1,
        sourceType: ["album", "camera"],
        success: (res) => {
          this.businessLicenseImage = res.tempFilePaths[0];
          this.businessLicenseImageFile = res.tempFiles[0];
        },
        fail: (err) => {
          console.error("选择营业执照照片失败:", err);
        },
      });
    },
    // 提交表单
    async submitForm() {
      if (!this.validateForm()) {
        return;
      }

      uni.showLoading({ title: "提交中...", mask: true });

      try {
        // 1. 先上传图片文件
        const uploadResults = await Promise.allSettled([
          this.uploadFile(this.shopPhotoFile),
          this.uploadFile(this.businessLicenseImageFile),
        ]);

        // 检查上传结果
        const [shopPhotoResult, licensePhotoResult] = uploadResults;

        if (shopPhotoResult.status === "rejected") {
          throw new Error(
            `店铺照片上传失败: ${shopPhotoResult.reason.message}`
          );
        }
        if (licensePhotoResult.status === "rejected") {
          throw new Error(
            `营业执照上传失败: ${licensePhotoResult.reason.message}`
          );
        }

        // 2. 准备表单数据
        const formData = {
          shopName: this.shopName,
          shopPhone: this.shopPhone,
          shopAddress: this.shopAddress,
          shopIntroduction: this.shopIntroduction,
          businessLicenseCode: this.businessLicenseCode,
          shopPhoto: shopPhotoResult.value,
          businessLicenseImage: licensePhotoResult.value,
        };

        // 3. 提交商户入驻申请
        const response = await request({
          url: "/merchant/putapplication",
          method: "POST",
          data: formData,
        });

        uni.hideLoading();

        console.log("提交结果:", response);

        if (response.code === 200) {
          uni.showToast({ title: "保存成功", icon: "success" });
          uni.navigateTo({ url: "/pages/index/index" });
        } else {
          throw new Error(response?.message || "保存失败");
        }
      } catch (error) {
        uni.hideLoading();
        console.error("保存失败:", error);
        uni.showToast({
          title: error.message || "保存失败，请重试",
          icon: "none",
          duration: 3000,
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

    validateForm() {
      const requiredFields = [
        { field: this.shopName, message: "请输入店铺名称" },
        { field: this.shopPhone, message: "请输入店铺电话" },
        { field: this.shopPhoto, message: "请上传店铺照片" },
        { field: this.shopAddress, message: "请输入店铺地址" },
        { field: this.shopIntroduction, message: "请输入店铺简介" },
        { field: this.businessLicenseCode, message: "请输入营业执照注册号" },
        { field: this.businessLicenseImage, message: "请上传营业执照照片" },
      ];

      // 基础非空检查
      for (const item of requiredFields) {
        if (!item.field || item.field.trim() === "") {
          uni.showToast({
            title: item.message,
            icon: "none",
          });
          return false;
        }
      }
      return true;
    },
  },
};
</script>

<style scoped>
.merchant-entry-container {
  padding: 20px;
  background-color: #f5f5f5;
}

.input-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.label {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.required {
  color: red;
  margin-right: 5px;
}

input,
textarea {
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 10px;
  border-radius: 4px;
}

textarea {
  height: 100px;
}

.upload-avatar,
.upload-license {
  width: 100px;
  height: 100px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
}

.upload-placeholder {
  color: #999;
  font-size: 14px;
}

image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.address-input-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.address-input-container input {
  flex: 1;
}

.map-select-btn {
  background-color: #f0f0f0;
  color: #333;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  white-space: nowrap;
  border: none;
  outline: none;
}

.submit-btn {
  background-color: #ff9a9e;
  color: #fff;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  text-align: center;
  width: 100%;
  margin-top: 20px;
  border: none;
  outline: none;
  cursor: pointer;
}

.submit-btn:active {
  background-color: #e88a8e;
}
</style>
