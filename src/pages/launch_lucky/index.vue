<template>
  <view class="container">
    <!-- 抽奖发起人部分 -->
    <view class="draw-sponsor">
      <view class="sponsor-info">
        <view class="avatar">
          <image :src="sponsorAvatar" mode="aspectFill"></image>
        </view>
        <text class="sponsor-name">{{ sponsorName }}</text>
      </view>
    </view>

    <!-- 抽奖时间显示 -->
    <view class="draw-time">
      <text class="time-text"
        >活动时间: {{ formatTime(startTime) }} 至
        {{ formatTime(endTime) }}</text
      >
      <text v-if="!isActive" class="time-tip">(当前活动已结束)</text>
    </view>

    <!-- 抽奖说明部分 -->
    <view class="draw-description">
      <text class="description-title">抽奖说明</text>
      <view class="description-content">
        <text>{{ drawRules }}</text>
      </view>
    </view>

    <!-- 抽奖前界面 -->
    <view v-if="!isDrawed && !drawResult && isActive" class="draw-before">
      <!-- 抽奖提示部分 -->
      <view class="win-tip">
        <text class="win-text">快来参与抽奖吧</text>
      </view>

      <!-- 抽奖按钮部分 -->
      <view class="draw-button" @click="getLucky">
        <text class="button-text">立即抽奖</text>
      </view>
    </view>

    <!-- 抽奖后界面 -->
    <view v-else-if="isDrawed || drawResult" class="draw-after">
      <!-- 中奖提示部分 -->
      <view class="win-tip">
        <text
          class="win-text"
          :class="{ 'win-color': isWinner, 'lose-color': !isWinner }"
        >
          {{ isWinner ? "恭喜! 你已中奖" : "很遗憾，未中奖" }}
        </text>
      </view>

      <!-- 奖品信息部分 -->
      <view v-if="isWinner" class="prize-info">
        <view class="prize-content">
          <text class="prize-title">奖品:</text>
          <text class="prize-detail">{{ prizeInfo }}</text>
        </view>
      </view>

      <!-- 未中奖提示 -->
      <view v-else class="no-prize-info">
        <text>{{ errorMessage }}</text>
      </view>
    </view>

    <!-- 活动已结束提示 -->
    <view v-else class="draw-ended">
      <text class="ended-text">当前抽奖活动已结束</text>
    </view>
  </view>
</template>

<script>
import { request } from "@/utils/request";

export default {
  data() {
    return {
      userid: "",
      shopId: "",
      userName: "",
      userAvatar: "",
      prizeId: "",
      sponsorAvatar: "",
      sponsorName: "",
      drawRules: "",
      prizeInfo: "",
      startTime: "", // 活动开始时间
      endTime: "", // 活动结束时间
      isDrawed: false,
      isWinner: false, // 是否中奖
      drawResult: false, // 是否已抽奖
      errorMessage: "", // 错误信息
      canDraw: true, // 是否可以抽奖
    };
  },
  computed: {
    // 判断活动是否正在进行中
    isActive() {
      const now = new Date();
      const start = new Date(this.startTime);
      const end = new Date(this.endTime);
      return now >= start && now <= end;
    },
  },
  onLoad() {
    const merchant = getApp().globalData.tempMerchant;
    console.log(merchant);

    this.sponsorAvatar = merchant.shopAvatar;
    this.sponsorName = merchant.name;
    this.drawRules = merchant.introduction;
    this.prizeInfo = merchant.productName;
    this.prizeId = merchant.id;
    this.startTime = merchant.startTime; // 设置开始时间
    this.endTime = merchant.endTime; // 设置结束时间
    this.shopId = merchant.shopid; // 设置商户ID

    this.getUserInfo();
    this.checkUserDrawStatus();
  },
  methods: {
    // 判断用户是否已经参与过这个抽奖
    async checkUserDrawStatus() {
      try {
        const response = await request({
          method: "POST",
          url: "/prize/isjoin",
          data: {
            userId: this.userid,
            prizeId: this.prizeId,
            shopId: this.shopId,
          },
        });

        console.log("检查用户抽奖状态:", response);

        if (response?.code === 200) {
          if (response.data === "您还没有参与过该活动") {
            // 用户未参与过，保持初始状态
            this.drawResult = false;
            this.isDrawed = false;
          } else {
            // 用户已参与过
            this.drawResult = true;
            this.isDrawed = true;
            // 根据实际接口返回设置中奖状态
            this.isWinner = response.data.isWin || false;
            this.prizeInfo = response.data.prizeName || this.prizeInfo;
          }
        }
      } catch (error) {
        console.error("检查用户抽奖状态失败:", error);
      }
    },
    // 获取用户信息
    async getUserInfo() {
      try {
        const response = await request({
          method: "GET",
          url: "/user/getUserInfo",
        });

        if (response?.code === 200 && response.data) {
          this.userid = response.data.id;
          this.userName = response.data.nickname;
          this.userAvatar = response.data.avatar;
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
      }
    },

    async getLucky() {
      if (!this.canDraw || !this.isActive) return;

      try {
        this.canDraw = false;
        uni.showLoading({
          title: "抽奖中...",
          mask: true,
        });

        const response = await request({
          url: "/prize/join",
          method: "POST",
          data: {
            userId: this.userid,
            prizeId: this.prizeId,
            userName: this.userName,
            userAvatar: this.userAvatar,
          },
        });

        console.log("抽奖结果:", response);

        if (response.code === 200) {
          this.drawResult = true;
          this.isDrawed = true;

          // 明确区分中奖和未中奖状态
          if (response.data.isWin) {
            this.isWinner = true;
            this.prizeInfo = response.data.prizeName || this.prizeInfo;
          } else {
            this.isWinner = false;
            this.errorMessage = response.message || "很遗憾，您没有中奖";
          }
        } else {
          this.drawResult = true;
          this.isDrawed = true;
          this.isWinner = false;
          this.errorMessage = response.message || "抽奖失败，请稍后再试";
        }
      } catch (error) {
        console.error("抽奖失败:", error);
        this.drawResult = true;
        this.isDrawed = true;
        this.isWinner = false;
        this.errorMessage = error.data?.message || "抽奖过程中出现错误";

        uni.showToast({
          title: this.errorMessage,
          icon: "none",
        });
      } finally {
        uni.hideLoading();
      }
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
.container {
  background-color: #ffffff;
  padding: 20px;
  min-height: 100vh;
}

/* 抽奖发起人部分 */
.draw-sponsor {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 20px;
}

.sponsor-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
}

.avatar image {
  width: 100%;
  height: 100%;
}

.sponsor-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

/* 抽奖时间部分 */
.draw-time {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 16px;
  margin-bottom: 20px;
  text-align: center;
}

.time-text {
  font-size: 16px;
  color: #333;
  font-weight: bold;
}

.time-tip {
  font-size: 14px;
  color: #d81e06;
  margin-left: 10px;
}

/* 抽奖说明部分 */
.draw-description {
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 20px;
}

.description-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.description-content text {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  word-wrap: break-word;
}

/* 抽奖前界面 */
.draw-before {
  text-align: center;
}

.win-tip {
  font-size: 28px;
  color: #d81e06;
  font-weight: bold;
  margin-bottom: 20px;
}

.draw-button {
  background-color: #d81e06;
  padding: 15px 80px;
  border-radius: 20px;
  display: inline-block;
  cursor: pointer;
}

.button-text {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
}

/* 抽奖后界面 */
.draw-after {
  text-align: center;
}

.win-color {
  color: #d81e06;
}

.lose-color {
  color: #666;
}

.prize-info {
  background-color: #d81e06;
  padding: 20px;
  border-radius: 16px;
  color: #ffffff;
  margin: 20px 0;
}

.prize-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.prize-title {
  font-size: 20px;
  font-weight: bold;
  margin-right: 10px;
}

.prize-detail {
  font-size: 20px;
  font-weight: bold;
}

.no-prize-info {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 16px;
  color: #666;
  margin: 20px 0;
  font-size: 16px;
}

.result-button {
  background-color: #4a90e2;
  padding: 15px 80px;
  border-radius: 20px;
  display: inline-block;
  cursor: pointer;
  margin-top: 20px;
}

/* 活动已结束提示 */
.draw-ended {
  text-align: center;
  padding: 40px 0;
}

.ended-text {
  font-size: 24px;
  color: #d81e06;
  font-weight: bold;
}
</style>
