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
        <image :src="merchant.avatar" class="merchant-avatar"></image>
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
      // 商户列表数据
      merchantList: [
        // {
        //   id: 1,
        //   shopName: "拼小圈",
        //   shopAvatar: "/static/merchant_pic.jpg",
        // },
        // {
        //   id: 2,
        //   shopName: "美食坊",
        //   shopAvatar: "/static/merchant_pic.jpg",
        // },
        // {
        //   id: 3,
        //   shopName: "饮品店",
        //   shopAvatar: "/static/merchant_pic.jpg",
        // },
      ],
    };
  },
  onLoad() {
    // 获取商户列表数据
    this.fetchLuckyList();
  },
  methods: {
    // 获取商户列表数据
    async fetchLuckyList() {
      try {
        this.isLoading = true;
        // 模拟请求数据
        const response = await request({
          url: "/shop/getshops",
          method: "GET",
        });
        console.log("商户列表数据:", response);
        this.merchantList = response.data;
      } catch (error) {
        console.error("获取商户列表失败:", error);
      } finally {
        this.isLoading = false;
      }
    },
    // 跳转到商户详情页面
    navigateToDetail(merchant) {
      uni.navigateTo({
        url: `../publish_lottery222/index?id=${merchant.id
          }&name=${encodeURIComponent(merchant.name)}&avatar=${encodeURIComponent(
            merchant.avatar
          )}`,
      });
    },
  },
};
</script>

<style scoped>
.merchant-list-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 商户列表 */
.merchant-list {
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 商户列表项 */
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

/* 无数据提示 */
.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
</style>
