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
          <text class="user-name"
            >中奖人：{{ item.userName || "未知用户" }}</text
          >
          <text class="win-time"
            >中奖时间：{{ formatTime(item.prizeTime) || "未知时间" }}</text
          >
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
      shopId: "", // 从路径参数获取
    };
  },
  onLoad(options) {
    // 从跳转路径中获取shopId
    if (options.shopId) {
      this.shopId = options.shopId;
      this.fetchLuckyList();
    } else {
      uni.showToast({
        title: "缺少商户ID参数",
        icon: "none",
      });
      // 可以添加返回上一页的逻辑
      uni.navigateBack();
    }
  },
  methods: {
    // 获取中奖记录
    async fetchLuckyList() {
      try {
        this.isLoading = true;
        const response = await request({
          method: "POST",
          url: "/lottery/select",
          data: { shopId: this.shopId },
        });

        console.log("获取中奖记录成功:", response);

        if (response?.code === 200 && response.data) {
          this.luckyList = response.data;
        } else {
          throw new Error(response?.message || "获取数据失败");
        }
      } catch (error) {
        console.error("获取中奖记录失败:", error);
        uni.showToast({
          title: error.message || "获取中奖记录失败",
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
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
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

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
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
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.lucky-item:last-child {
  border-bottom: none;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prize-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.user-name {
  font-size: 14px;
  color: #666;
}

.win-time {
  font-size: 13px;
  color: #999;
}
</style>
