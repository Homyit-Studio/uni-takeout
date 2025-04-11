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
        <image :src="merchant.shopAvatar" class="merchant-avatar"></image>
        <view class="merchant-info">
          <text class="shop-name">{{ merchant.shopName }}</text>
          <text :class="['status', merchant.auditStatus]">{{
            getStatusText(merchant.auditStatus)
          }}</text>
        </view>
        <uni-icons type="arrowright" size="20" color="#999"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 商户列表数据
      merchantList: [
        {
          id: 1,
          shopName: "拼小圈",
          shopAvatar: "/static/merchant_pic.jpg",
          auditStatus: "pending", // 审核状态：pending（待审核）、approved（通过）、rejected（拒绝）
        },
        {
          id: 2,
          shopName: "美食坊",
          shopAvatar: "/static/merchant_pic.jpg",
          auditStatus: "approved",
        },
        {
          id: 3,
          shopName: "饮品店",
          shopAvatar: "/static/merchant_pic.jpg",
          auditStatus: "rejected",
        },
      ],
    };
  },
  methods: {
    // 处理搜索
    handleSearch(value) {
      console.log("搜索内容：", value);
      // 这里可以添加搜索逻辑
    },
    // 获取审核状态文本
    getStatusText(status) {
      switch (status) {
        case "pending":
          return "待审核";
        case "approved":
          return "已通过";
        case "rejected":
          return "已拒绝";
        default:
          return "未知状态";
      }
    },
    // 跳转到商户详情页面
    navigateToDetail(merchant) {
      uni.navigateTo({
        url: `../../pagesManage/my_lists/index?id=${merchant.id}`,
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

.status {
  font-size: 14px;
  font-weight: bold;
}

.status.pending {
  color: #faad14;
  /* 待审核：橙色 */
}

.status.approved {
  color: #52c41a;
  /* 已通过：绿色 */
}

.status.rejected {
  color: #f5222d;
  /* 已拒绝：红色 */
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
