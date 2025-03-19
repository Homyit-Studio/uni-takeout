<template>
  <view class="container">
    <!-- 头部统计 -->
    <view class="header">
      <view class="statistic">
        <text class="label">总收入</text>
        <text class="amount income">+￥{{ totalIncome }}</text>
      </view>
      <view class="statistic">
        <text class="label">总支出</text>
        <text class="amount expense">-￥{{ totalExpense }}</text>
      </view>
    </view>

    <!-- 加载动画 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 账单列表 -->
    <view class="bill-list">
      <!-- 无数据提示 -->
      <view v-if="!loading && billList.length === 0" class="empty-tip">
        <text>暂无收支数据</text>
      </view>

      <!-- 账单列表 -->
      <view v-for="(item, index) in billList" :key="index" class="bill-item">
        <view class="content">
          <text class="description">{{ item.description }}</text>
          <text class="date">{{ item.date }}</text>
        </view>
        <text :class="['amount', item.type]">
          {{ item.type === 'income' ? '+' : '-' }}￥{{ item.amount }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      totalIncome: 0, // 总收入，初始为 0
      totalExpense: 0, // 总支出，初始为 0
      billList: [], // 账单列表，初始为空
      loading: true, // 加载状态，初始为 true
    };
  },
  methods: {
    // 计算总收入和总支出
    calculateTotals() {
      this.totalIncome = this.billList
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);

      this.totalExpense = this.billList
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);
    },

    // 模拟获取数据
    async fetchBillData() {
      // 模拟异步请求
      setTimeout(() => {
        // 模拟后端返回的数据
        const mockData = [
          { type: 'income', amount: 5000, date: '2023-10-01', description: '商品销售' },
          { type: 'expense', amount: 1000, date: '2023-10-02', description: '采购成本' },
          { type: 'income', amount: 7000, date: '2023-10-03', description: '服务收入' },
          { type: 'expense', amount: 2000, date: '2023-10-04', description: '运营费用' },
        ];

        // 更新账单列表
        this.billList = mockData;

        // 计算总收入和总支出
        this.calculateTotals();

        // 关闭加载状态
        this.loading = false;
      }, 1000); // 模拟 1 秒延迟
    },
  },
  onLoad() {
    // 页面加载时调用接口获取数据
    this.fetchBillData();
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 头部统计 */
.header {
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.statistic {
  text-align: center;
}

.label {
  font-size: 14px;
  color: #666;
}

.amount {
  font-size: 18px;
  font-weight: bold;
}

.income {
  color: #07c160; /* 绿色表示收入 */
}

.expense {
  color: #f5222d; /* 红色表示支出 */
}

/* 加载动画 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #07c160;
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

.loading-text {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

/* 账单列表 */
.bill-list {
  background-color: #fff;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bill-item {
  display: flex;
  align-items: center;
  padding: 15px 10px;
  border-bottom: 1px solid #eee;
}

.bill-item:last-child {
  border-bottom: none;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px; /* 增加描述和日期之间的间距 */
  padding-left: 20rpx;
}

.description {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.date {
  font-size: 12px;
  color: #999;
}

.amount {
  font-size: 16px;
  font-weight: bold;
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