<template>
  <view class="my-lucky-container">
    <view v-if="isLoading" class="loading">
      <view class="loading-spinner"></view>
    </view>

    <!-- 空状态 -->
    <view v-else-if="luckyList.length === 0" class="empty">
      <text class="empty-text">暂无中奖记录</text>
    </view>

    <!-- 中奖记录列表 -->
    <view v-else class="lucky-list">
      <view v-for="(item, index) in luckyList" :key="index" class="lucky-item">
        <view class="item-content">
          <text class="prize-name"
            >奖品：{{ item.prizeName || "未知奖品" }}</text
          >
          <text class="shop-name"
            >店铺：{{ getShopName(item.shopId) || "未知商户" }}</text
          >
          <text class="win-time">{{ formatTime(item.createTime) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from "@/utils/request";

export default {
  data() {
    return {
      luckyList: [],
      isLoading: false,
      userId: "",
      shopList: [], // 存储所有商户信息
    };
  },
  async onLoad() {
    await this.fetchPersonalInfo();
    if (this.userId) {
      // 并行获取商户列表和中奖记录
      await Promise.all([this.fetchShopList(), this.fetchLuckyList()]);
    }
  },
  methods: {
    async fetchPersonalInfo() {
      try {
        this.isLoading = true;
        const response = await request({
          method: "GET",
          url: "/user/getUserInfo",
        });

        if (response?.data?.id) {
          this.userId = response.data.id;
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        uni.showToast({
          title: "获取用户信息失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },

    // 获取商户列表
    async fetchShopList() {
      try {
        const response = await request({
          method: "GET",
          url: "/shop/getshops",
        });

        console.log("shopList:", response);

        if (response?.data) {
          this.shopList = response.data || [];
        }
      } catch (error) {
        console.error("获取商户列表失败:", error);
      }
    },

    // 根据shopId获取商户名称
    getShopName(shopId) {
      const shop = this.shopList.find((item) => item.id === shopId);
      return shop ? shop.name : null;
    },

    // 获取中奖记录
    async fetchLuckyList() {
      try {
        this.isLoading = true;
        const response = await request({
          method: "POST",
          url: "/lottery/userselect",
          data: { userId: this.userId },
        });

        if (response?.data) {
          this.luckyList = response.data;
        }
      } catch (error) {
        console.error("获取中奖记录失败:", error);
        uni.showToast({
          title: "获取中奖记录失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },

    // 格式化时间
    formatTime(timeString) {
      if (!timeString) return "";
      const date = new Date(timeString);
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    },
  },
};
</script>

<style scoped>
.my-lucky-container {
  padding: 20px;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.header {
  margin-bottom: 20px;
  text-align: center;
}

.title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

.loading {
  padding: 30px 0;
  display: flex;
  justify-content: center;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.empty-image {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-text {
  font-size: 16px;
  color: #999;
}

.lucky-list {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.lucky-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

.lucky-item:last-child {
  border-bottom: none;
}

.item-left {
  margin-right: 12px;
}

.prize-icon {
  width: 40px;
  height: 40px;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.prize-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.shop-name {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.win-time {
  font-size: 12px;
  color: #999;
}

.item-right {
  margin-left: 10px;
}

.win-tag {
  background-color: #ff5a5f;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}
</style>
