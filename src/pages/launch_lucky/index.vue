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

    <!-- 抽奖说明部分 -->
    <view class="draw-description">
      <text class="description-title">抽奖说明</text>
      <view class="description-content">
        <text>{{ drawRules }}</text>
      </view>
    </view>

    <!-- 抽奖前界面 -->
    <view v-if="!isDrawed" class="draw-before">
      <!-- 抽奖提示部分 -->
      <view class="win-tip">
        <text class="win-text">快来参与抽奖吧</text>
      </view>

      <!-- 抽奖按钮部分 -->
      <view class="draw-button" @click="startDraw">
        <text class="button-text">立即抽奖</text>
      </view>
    </view>

    <!-- 抽奖后界面 -->
    <view v-else class="draw-after">
      <!-- 中奖提示部分 -->
      <view class="win-tip">
        <text class="win-text">恭喜! 你已中奖</text>
      </view>

      <!-- 奖品信息部分 -->
      <view class="prize-info">
        <view class="prize-content">
          <text class="prize-title">奖品:</text>
          <text class="prize-detail">{{ prizeInfo }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { request } from '@/utils/request'

export default {
  data() {
    return {
      // 模拟从后端获取的数据
      sponsorAvatar: "", // 头像地址
      sponsorName: "", // 店名
      drawRules: "", // 抽奖说明
      prizeInfo: "", // 奖品信息
      isDrawed: false, // 是否已抽奖
    };
  },
  onLoad() {
    // 模拟从后端获取数据的过程，这里直接赋值拟定数据
    this.sponsorAvatar = "/static/merchant_pic.jpg";
    this.sponsorName = "美味烧烤店";
    this.drawRules =
      "1、本次抽奖奖品为5份免单猪肉串,20份半价猪肉串;\n2、兑奖方式:群内小程序下单，下单后加群主微信报销;\n3、奖品有效期一天,需当天使用,逾期无效喔";
    this.prizeInfo = "半价猪肉串七串";
  },
  methods: {
    // 抽奖逻辑
    startDraw() {
      uni.showLoading({
        title: "抽奖中...",
        mask: true,
      });
      setTimeout(() => {
        uni.hideLoading();
        // 模拟抽奖结果
        this.isDrawed = true; // 设置为已抽奖
        this.prizeInfo = "半价猪肉串七串"; // 模拟中奖奖品
      }, 2000);
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

.prize-info {
  background-color: #d81e06;
  padding: 20px;
  border-radius: 16px;
  color: #ffffff;
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
</style>
