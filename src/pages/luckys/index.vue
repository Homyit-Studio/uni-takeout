<template>
  <view class="merchant-list-container">
    <!-- 商户列表 -->
    <view class="merchant-list">
      <!-- 无数据提示 -->
      <view v-if="activeMerchants.length === 0" class="empty-tip">
        <text>暂无进行中的抽奖活动</text>
      </view>

      <!-- 商户列表项 -->
      <view
        v-for="(merchant, index) in activeMerchants"
        :key="index"
        class="merchant-item"
        @click="navigateToDetail(merchant)"
      >
        <image
          src="/static/抽奖.png"
          class="merchant-avatar"
          mode="'fixed'"
        ></image>
        <view class="merchant-info">
          <text class="shop-name" style="font-weight: bold"
            >{{ merchant.shopName }} --- {{ merchant.name }}</text
          >
          <!-- <text class="time-range"
            >活动时间: {{ formatTime(merchant.startTime) }} 至
            {{ formatTime(merchant.endTime) }}</text
          > -->
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
      merchantList: [],
    };
  },
  computed: {
    // 只显示活动时间范围内的商户
    activeMerchants() {
      const now = new Date();
      return this.merchantList.filter((merchant) => {
        const startTime = new Date(merchant.startTime);
        const endTime = new Date(merchant.endTime);
        return now >= startTime && now <= endTime;
      });
    },
  },
  onLoad() {
    // 获取商户列表数据
    this.fetchLuckyList();
  },
  methods: {
    // 获取抽奖列表数据
    async fetchLuckyList() {
      try {
        this.isLoading = true;
        const response = await request({
          method: "GET",
          url: "/prize/getall",
        });

        console.log("获取抽奖列表成功:", response);

        if (response && response.data) {
          this.merchantList = response.data;
        }
      } catch (error) {
        console.error("获取抽奖列表失败:", error);
        uni.showToast({
          title: "获取抽奖列表失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },
    // 跳转到商户详情页面
    navigateToDetail(merchant) {
      // 存储到全局临时变量
      getApp().globalData.tempMerchant = merchant;

      uni.navigateTo({
        url: "/pages/launch_lucky/index",
      });
    },
    // 格式化时间显示
    formatTime(timeString) {
      if (!timeString) return "";
      const date = new Date(timeString);
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
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

.time-range {
  font-size: 12px;
  color: #666;
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
