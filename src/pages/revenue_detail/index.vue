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
      <view v-if="!loading && groupedBillList.length === 0" class="empty-tip">
        <text>暂无收支数据</text>
      </view>

      <!-- 按月分组展示 -->
      <view v-for="(group, index) in groupedBillList" :key="index" class="month-group">
        <!-- 月份分割 -->
        <view class="month-divider">
          <text class="month-text">{{ group.month }}</text>
        </view>

        <!-- 当月收支统计 -->
        <view class="month-statistic">
          <view class="statistic">
            <text class="label">当月收入</text>
            <text class="amount income">+￥{{ group.monthIncome }}</text>
          </view>
          <view class="statistic">
            <text class="label">当月支出</text>
            <text class="amount expense">-￥{{ group.monthExpense }}</text>
          </view>
        </view>

        <!-- 当月账单列表 -->
        <view v-for="(item, subIndex) in group.items" :key="subIndex" class="bill-item">
          <view class="content">
            <text class="description">{{ item.description }}</text>
            <text class="date">{{ formatDate(item.createTime) }}</text>
          </view>
          <text :class="['amount', item.type]">
            {{ item.type === 'income' ? '+' : '-' }}￥{{ item.amount }}
          </text>
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
      shopid: '', // 从页面参数获取的 shopid
      localid: '',
      totalIncome: 0,
      totalExpense: 0,
      billList: [],
      groupedBillList: [],
      loading: true,
    };
  },
  methods: {
    // 格式化日期
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    },
    // 获取商铺订单数据
    async fetchMerchantList() {
      try {
        const response = await request({
          method: 'POST', 
          url: '/order/merchantselect',
          data: {
            shopid: this.shopid 
          }
        });
        
        if (response?.code === 200) {
          this.processBillData(response.data);
        } else {
          throw new Error(response?.message || '获取订单数据失败');
        }
      } catch (error) {
        console.error('获取订单数据失败:', error);
        uni.showToast({
          title: error.message || '获取订单数据失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 处理账单数据
    processBillData(data) {
      try {
        // 过滤只显示已支付和已退款的订单
        const filteredData = data.filter(order => 
          order.status === '已支付' || order.status === '已退款'
        );

        // 将订单数据转换为账单格式
        this.billList = filteredData.map(order => ({
          id: order.id,
          amount: order.amount,
          type: order.status === '已支付' ? 'income' : 'expense',
          description: order.status === '已支付' ? '客户购买商品' : '钱款已退回',
          createTime: order.orderTime,
          date: this.formatDate(order.orderTime),
          status: order.status,
        }));

        this.calculateTotals();
        this.groupBillByMonth();
      } catch (error) {
        console.error('处理账单数据出错:', error);
        throw error;
      }
    },

    // 计算总收入和总支出
    calculateTotals() {
      this.totalIncome = this.billList
        .filter(item => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);

      this.totalExpense = this.billList
        .filter(item => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);
    },

    // 按月份分组账单数据
    groupBillByMonth() {
      const grouped = {};
      this.billList.forEach((item) => {
        const month = item.date.slice(0, 7); // 提取年月
        if (!grouped[month]) {
          grouped[month] = [];
        }
        grouped[month].push(item);
      });

      // 转换为数组并按月份排序
      this.groupedBillList = Object.keys(grouped)
        .sort((a, b) => b.localeCompare(a))
        .map(month => ({
          month: `${month}月`,
          items: grouped[month],
          monthIncome: grouped[month]
            .filter(item => item.type === 'income')
            .reduce((sum, item) => sum + item.amount, 0),
          monthExpense: grouped[month]
            .filter(item => item.type === 'expense')
            .reduce((sum, item) => sum + item.amount, 0)
        }));
    }
  },
  onLoad(options) {
    // 从页面参数中获取 shopid
    if (options && options.id) {
      this.shopid = options.id;
      this.fetchMerchantList();
    } else {
      uni.showToast({
        title: '缺少商户ID参数',
        icon: 'none'
      });
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

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
  color: #07c160;
}

.expense {
  color: #f5222d;
}

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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.bill-list {
  background-color: #fff;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.month-divider {
  padding: 10px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.month-text {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.month-statistic {
  display: flex;
  justify-content: space-around;
  background-color: #f9f9f9;
  padding: 10px;
  margin-bottom: 10px;
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
  gap: 4px;
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

.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
</style>