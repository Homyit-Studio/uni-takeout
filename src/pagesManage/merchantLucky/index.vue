<template>
  <view class="merchant-list-container">
    <!-- 商户列表 -->
    <view class="merchant-list">
      <!-- 无数据提示 -->
      <view v-if="merchantList.length === 0" class="empty-tip">
        <text>暂无商户数据</text>
      </view>

      <!-- 商户列表项 -->
      <view v-for="(merchant, index) in merchantList" :key="index" class="merchant-item"
        @click="navigateToDetail(merchant)">
        <image :src="merchant.avatar || '/static/default-avatar.png'" class="merchant-avatar"></image>
        <view class="merchant-info">
          <text class="shop-name">{{ merchant.name }}</text>
        </view>
        <uni-icons type="arrowright" size="20" color="#999"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from "@/utils/request";

export default {
  data() {
    return {
      merchantList: [],
      isLoading: false,
    };
  },
  onLoad() {
    this.fetchMerchantList();
  },
  methods: {
    // 获取商户列表
    async fetchMerchantList() {
      try {
        this.isLoading = true;
        const response = await request({
          method: "GET",
          url: "/shop/getshops",
        });

        console.log("获取商户列表成功:", response);
        if (response && response.data) {
          this.merchantList = response.data;
        }
      } catch (error) {
        console.error("获取商户列表失败:", error);
        uni.showToast({
          title: "获取商户列表失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },
    // 跳转到商户详情页面
    navigateToDetail(merchant) {
      uni.navigateTo({
        url: `../../pagesUser/userLucky222/index?shopId=${merchant.id}`,
      });
    },
  },
};
</script>

<style scoped>
/* 原有样式保持不变 */
.merchant-list-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.merchant-list {
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.merchant-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.merchant-item:last-child {
  border-bottom: none;
}

.merchant-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #eee;
  margin-right: 15px;
}

.merchant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.shop-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.status {
  font-size: 14px;
  font-weight: bold;
}

.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
</style>
