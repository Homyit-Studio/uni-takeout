<template>
  <view>
    <!-- 加载中 -->
    <view v-if="loading" class="loading-overlay">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 未登录时的登录提示 -->
    <view v-else-if="!isLoggedIn" class="login-prompt">
      <text class="prompt-text">您还未登录，请先登录。</text>
      <button @click="navigateToLogin" class="login-button">立即登录</button>
    </view>

    <!-- 已登录时的优惠券列表 -->
    <view v-else class="coupon-container">
      <!-- 空状态提示 -->
      <view v-if="couponList.length === 0" class="empty-tips">
        <text>暂无可用优惠券</text>
      </view>

      <view
        class="coupon-card"
        v-for="item in couponList"
        :key="item.id"
        :class="{ used: item.isUsed }"
      >
        <!-- 左侧：优惠券金额/折扣 -->
        <view class="coupon-left">
          <text class="coupon-value" v-if="item.type === 'discount'"
            >{{ item.value }}折</text
          >
          <text class="coupon-value" v-else-if="item.type === 'fullReduce'"
            >￥{{ item.value }}</text
          >
          <text class="coupon-value" v-else>兑换券</text>
          <text class="coupon-condition" v-if="item.condition"
            >满{{ item.condition }}可用</text
          >
        </view>

        <!-- 右侧：优惠券信息 -->
        <view class="coupon-right">
          <text class="coupon-title">{{ item.title }}</text>
          <text class="coupon-description">{{ item.description }}</text>
          <text class="coupon-date">有效期至：{{ item.endTime }}</text>
          <view
            class="coupon-button"
            @click="item.isUsed ? null : onCoupon(item)"
            :class="{ disabled: item.isUsed }"
          >
            <text class="button-text">{{
              item.isUsed ? "已领取" : "立即领取"
            }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      couponList: [], // 优惠券列表
      loading: false, // 加载状态
      isLoggedIn: true, // 模拟已登录状态
    };
  },
  methods: {
    // 模拟登录状态检查
    checkLoginStatus() {
      return true; // 模拟已登录
    },
    // 模拟领取优惠券
    async onCoupon(item) {
      if (!this.isLoggedIn) {
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        return;
      }

      if (this.loading) return;
      this.loading = true;

      try {
        // 模拟接口请求
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 模拟领取成功
        item.isUsed = true;

        uni.showToast({
          title: "领取成功",
          icon: "success",
        });
      } catch (error) {
        uni.showToast({
          title: "领取失败",
          icon: "none",
        });
      } finally {
        this.loading = false;
      }
    },
    // 模拟获取优惠券列表
    async getCouponList() {
      this.loading = true;

      try {
        // 模拟接口请求
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 模拟数据
        this.couponList = [
          // {
          //     id: 1,
          //     type: 'fullReduce', // 满减券
          //     value: 20,
          //     condition: 100,
          //     title: '满100减20',
          //     description: '适用于所有商品',
          //     endTime: '2023-12-31',
          //     isUsed: false,
          // },
          // {
          //     id: 2,
          //     type: 'discount', // 打折券
          //     value: 8.5,
          //     condition: 0,
          //     title: '85折优惠',
          //     description: '适用于指定商品',
          //     endTime: '2023-11-30',
          //     isUsed: false,
          // },
          // {
          //     id: 3,
          //     type: 'exchange', // 兑换券
          //     value: 0,
          //     condition: 0,
          //     title: '商品兑换券',
          //     description: '可兑换指定商品',
          //     endTime: '2023-10-31',
          //     isUsed: false,
          // },
        ];
      } catch (error) {
        uni.showToast({
          title: "获取优惠券失败",
          icon: "none",
        });
      } finally {
        this.loading = false;
      }
    },
    // 跳转到登录页
    navigateToLogin() {
      uni.navigateTo({
        url: "/subpkg/login/login",
      });
    },
  },
  mounted() {
    this.isLoggedIn = this.checkLoginStatus();
    if (this.isLoggedIn) {
      this.getCouponList();
    }
  },
};
</script>
<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-text {
  font-size: 18px;
  color: #333;
}

.login-prompt {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.prompt-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.login-button {
  padding: 10px 20px;
  background-color: #ff6347;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:active {
  background-color: #e65c3f;
}

.coupon-container {
  padding: 20px;
}

.coupon-card {
  display: flex;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #ff9a9e, #fad0c4);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.coupon-left {
  width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 15px;
}

.coupon-value {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}

.coupon-condition {
  font-size: 12px;
  color: #fff;
  margin-top: 5px;
}

.coupon-right {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.coupon-title {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.coupon-description {
  font-size: 14px;
  color: #fff;
  margin-top: 5px;
}

.coupon-date {
  font-size: 12px;
  color: #fff;
  margin-top: 5px;
}

.coupon-button {
  align-self: flex-end;
  padding: 5px 10px;
  background-color: #ff6347;
  border-radius: 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.coupon-button.disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.button-text {
  font-size: 14px;
  color: #fff;
}
.empty-tips {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #999;
  font-size: 16px;
}
</style>
