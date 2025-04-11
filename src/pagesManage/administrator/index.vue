<template>
  <view class="merchant-management-container">
    <!-- 顶部管理员信息 -->
    <view class="merchant-header">
      <view class="shop-avatar-container" @click="showAvatarOptions">
        <image :src="shopAvatar" class="shop-avatar"></image>
      </view>
      <view class="shop-info">
        <input
          v-model="shopName"
          class="shop-name-input"
          placeholder="请输入管理员昵称"
          @focus="showNameEditModal"
        />
      </view>
    </view>

    <!-- 功能导航 -->
    <view class="function-nav">
      <view class="nav-item" @click="navigateTo('approvalList')">
        <uni-icons type="list" size="30" color="#007aff"></uni-icons>
        <text class="nav-text">商户入驻审核</text>
      </view>
      <view class="nav-item" @click="navigateTo('bannerManage')">
        <uni-icons type="images" size="30" color="#807aff"></uni-icons>
        <text class="nav-text">管理首页轮播图</text>
      </view>
      <view class="nav-item" @click="navigateTo('shopProductsManage')">
        <uni-icons type="compose" size="30" color="#007aff"></uni-icons>
        <text class="nav-text">商品管理</text>
      </view>
      <view class="nav-item" @click="navigateTo('shopLotteryManage')">
        <uni-icons type="vip" size="30" color="#ff6347"></uni-icons>
        <text class="nav-text">抽奖管理</text>
      </view>
      <view class="nav-item" @click="navigateTo('merchantLuckys')">
        <uni-icons type="vip" size="30" color="#ff6347"></uni-icons>
        <text class="nav-text">中奖记录</text>
      </view>
      <view class="nav-item" @click="navigateTo('shopRevenueManage')">
        <uni-icons type="wallet-filled" size="30" color="#4caf50"></uni-icons>
        <text class="nav-text">营收细则</text>
      </view>
    </view>

    <!-- 功能描述 -->
    <view class="function-description">
      <text class="description-text">请选择上方功能以管理商户</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      shopName: "拼小圈",
      shopAvatar: "/static/merchant_pic.jpg",
    };
  },
  methods: {
    // 显示头像修改选项
    showAvatarOptions() {
      uni.showActionSheet({
        itemList: ["从相册选择", "拍照"],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.chooseAvatarFromAlbum();
          } else if (res.tapIndex === 1) {
            this.takePhoto();
          }
        },
        fail: (err) => {
          console.error("操作失败:", err);
        },
      });
    },
    // 从相册选择头像
    chooseAvatarFromAlbum() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.shopAvatar = res.tempFilePaths[0];
          this.submitAvatar();
        },
        fail: (err) => {
          console.error("选择头像失败:", err);
        },
      });
    },
    // 拍照上传头像
    takePhoto() {
      uni.chooseImage({
        count: 1,
        sourceType: ["camera"],
        success: (res) => {
          this.shopAvatar = res.tempFilePaths[0];
          this.submitAvatar();
        },
        fail: (err) => {
          console.error("拍照失败:", err);
        },
      });
    },
    // 提交头像修改
    submitAvatar() {
      uni.showModal({
        title: "提示",
        content: "确定要修改头像吗？",
        success: (res) => {
          if (res.confirm) {
            // 这里可以添加上传头像到服务器的逻辑
            uni.showToast({
              title: "头像修改成功",
              icon: "success",
            });
          }
        },
      });
    },
    // 显示昵称修改弹窗
    showNameEditModal() {
      uni.showModal({
        title: "修改管理员昵称",
        content: "",
        editable: true,
        placeholderText: "请输入新的管理员昵称",
        success: (res) => {
          if (res.confirm && res.content) {
            this.shopName = res.content;
            this.submitName();
          }
        },
      });
    },
    // 提交昵称修改
    submitName() {
      uni.showToast({
        title: "昵称修改成功",
        icon: "success",
      });
    },
    // 导航到指定功能页面
    navigateTo(section) {
      let url = "";
      switch (section) {
        case "approvalList":
          url = "/pages/approval_list/index";
          break;
        case "shopProductsManage":
          url = "/pages/shopProduncts_manage/index";
          break;
        case "shopLotteryManage":
          url = "/pages/shopLottery_manage/index";
          break;
        case "shopRevenueManage":
          url = "/pages/shopRevenue_manage/index";
          break;
        case "bannerManage":
          url = "/pages/banner_manage/index";
          break;
        case "merchantLuckys":
          url = "/pages/merchantLucky/index";
          break;
      }
      uni.navigateTo({
        url: url,
      });
    },
  },
};
</script>

<style scoped>
.merchant-management-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.merchant-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.shop-avatar-container {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.shop-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.shop-info {
  flex: 1;
}

.shop-name-input {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  border: none;
  outline: none;
  width: 100%;
}

.function-nav {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  justify-content: flex-start; /* 左对齐 */
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 33.33%; /* 每行显示三个 */
  margin-bottom: 15px; /* 项之间的间距 */
}

.nav-text {
  font-size: 14px;
  color: #333;
  margin-top: 5px;
}

.function-description {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.description-text {
  font-size: 16px;
  color: #666;
}
</style>
