<template>
  <view class="order-detail">
    <!-- 自定义状态栏（带返回按钮） -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px', backgroundColor: statusBgColor }">
      <view class="nav-back" @click="navigateBack">
        <uni-icons type="back" size="24" color="#fff"></uni-icons>
      </view>
      <text class="nav-title">订单详情</text>
    </view>

    <!-- 订单状态 -->
    <view class="order-status" :style="{ backgroundColor: statusBgColor }">
      <view class="status-icon">
        <uni-icons :type="statusIcon" size="40" color="#fff"></uni-icons>
      </view>
      <text class="status-text">{{ orderData.payStatus }}</text>
      <text class="status-tip">{{ statusTip }}</text>
    </view>

    <!-- 订单卡片 -->
    <view class="order-content">
      <!-- 店铺信息 -->
      <view class="card shop-info">
        <view class="shop-header">
          <image class="shop-avatar" :src="orderData.shopAvatar" mode="aspectFit"></image>
          <text class="shop-name">{{ orderData.shopName }}</text>
        </view>
        <view class="divider"></view>

        <!-- 商品列表 -->
        <view class="product-list">
          <view class="product-item" v-for="(item, index) in orderData.orderDetailList" :key="index">
            <image class="product-image" :src="item.image" mode="aspectFill"></image>
            <view class="product-info">
              <text class="product-name">{{ item.name }}</text>
              <text class="product-spec">x{{ item.number }}</text>
            </view>
            <text class="product-price">¥{{ item.amount }}</text>
          </view>
        </view>

        <view class="divider"></view>

        <!-- 订单汇总 -->
        <view class="order-summary">
          <view class="summary-item">
            <text class="label">餐具数量</text>
            <text class="value">x{{ orderData.tablewareNumber }}</text>
          </view>
          <view class="summary-item">
            <text class="label">打包费</text>
            <text class="value">¥{{ orderData.packAmount }}</text>
          </view>
          <view class="summary-item total">
            <text class="label">合计</text>
            <text class="value">¥{{ orderData.amount }}</text>
          </view>
        </view>
      </view>

      <!-- 配送信息 -->
      <view class="card delivery-info">
        <view class="info-item">
          <uni-icons type="person" size="20" color="#666"></uni-icons>
          <view class="info-content">
            <text class="label">联系人</text>
            <text class="value">{{ orderData.name }}</text>
          </view>
        </view>

        <view class="info-item">
          <uni-icons type="phone" size="20" color="#666"></uni-icons>
          <view class="info-content">
            <text class="label">联系电话</text>
            <text class="value">{{ orderData.phone }}</text>
          </view>
        </view>

        <view class="info-item">
          <uni-icons type="location" size="20" color="#666"></uni-icons>
          <view class="info-content">
            <text class="label">配送地址</text>
            <text class="value">{{ orderData.address }}</text>
          </view>
        </view>

        <!-- 添加商家电话(仅商家端显示) -->
        <view class="info-item">
          <uni-icons type="phone-filled" size="20" color="#666"></uni-icons>
          <view class="info-content">
            <text class="label">商家电话</text>
            <text class="value">{{ orderData.shopPhone }}</text>
          </view>
        </view>
      </view>

      <!-- 订单详情 -->
      <view class="card order-info">
        <view class="detail-item">
          <text class="label">订单编号</text>
          <view class="value-box">
            <text class="value">{{ orderData.number }}</text>
            <text class="copy-btn" @click="copyOrderNo">复制</text>
          </view>
        </view>

        <view class="detail-item">
          <text class="label">下单时间</text>
          <text class="value">{{ formatTime(orderData.orderTime) }}</text>
        </view>

        <view class="detail-item">
          <text class="label">订单状态</text>
          <text class="value">{{ orderData.status }}</text>
        </view>
      </view>

      <!-- 备注信息 -->
      <view class="card remark-info" v-if="orderData.remark">
        <text class="label">备注信息</text>
        <text class="value">{{ orderData.remark || '无' }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <!-- <view class="action-bar" v-if="orderData.payStatus === '待支付'">
      <button class="btn cancel" v-if="orderData.status != '已取消'" @click="cancelOrder">取消订单</button>
      <button class="btn primary" v-if="orderData.status != '已取消'" @click="payOrder">立即支付</button>
    </view> -->
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request.js'

const statusBarHeight = ref(uni.getWindowInfo().statusBarHeight)
const orderData = reactive({})

// 根据订单状态计算不同样式
// 修改后的计算属性
const statusBgColor = computed(() => {
  if (orderData.status === '已取消') return '#909399'
  return orderData.payStatus === '待支付' ? '#FF9500' : '#4CD964'
})

const statusIcon = computed(() => {
  if (orderData.status === '已取消') return 'close'
  return orderData.payStatus === '待支付' ? 'info' : 'checkmarkempty'
})

const statusTip = computed(() => {
  if (orderData.status === '已取消') return '订单已取消，欢迎再次下单'
  return orderData.payStatus === '待支付' ? '请尽快完成支付，超时订单将自动取消' : '感谢您的惠顾，期待再次光临'
})

// 返回上一页
const navigateBack = () => {
  uni.navigateBack()
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`
}

const padZero = (num) => {
  return num < 10 ? `0${num}` : num
}

// 复制订单号
const copyOrderNo = () => {
  uni.setClipboardData({
    data: orderData.number,
    success: () => {
      uni.showToast({ title: '复制成功' })
    }
  })
}

// 取消订单
const cancelOrder = async () => {
  uni.showModal({
    title: '提示',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const res = await request({
            url: '/order/usercancel',
            method: 'POST',
            data: {
              orderNumber: orderData.number
            }
          })

          if (res.code === 200) {
            uni.showToast({
              title: '订单已取消',
              icon: 'success'
            })
            // 更新订单状态
            orderData.status = '已取消'
          } else {
            uni.showToast({
              title: '取消失败',
              icon: 'none'
            })
          }
        } catch (error) {
          console.error('取消订单失败:', error)
          uni.showToast({
            title: '取消失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 支付订单
const payOrder = () => {
  uni.showToast({ title: '跳转支付中...', icon: 'loading' })
  // 这里可以添加支付逻辑
}

onLoad(() => {
  // 从本地存储获取订单数据
  const orderDetail = uni.getStorageSync('orderDetail')
  if (orderDetail) {
    Object.assign(orderData, orderDetail)
    console.log('订单数据加载成功:', orderData)
  } else {
    uni.showToast({ title: '订单数据加载失败', icon: 'error' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})
</script>

<style lang="scss" scoped>
.order-detail {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 100rpx;

  /* 新增已取消状态下的特殊样式 */
  .order-status.canceled {
    background-color: #909399 !important;

    .status-icon {
      border-color: #fff;
      background-color: rgba(255, 255, 255, 0.2);
    }
  }

  /* 修改商品列表样式（已取消状态下变灰） */
  .product-list.canceled {
    .product-item {
      opacity: 0.6;

      .product-name,
      .product-spec,
      .product-price {
        color: #999 !important;
        text-decoration: line-through;
      }
    }
  }

  /* 修改订单汇总样式（已取消状态下） */
  .order-summary.canceled {
    .summary-item {

      .label,
      .value {
        color: #999 !important;
      }

      &.total .value {
        color: #999 !important;
        text-decoration: line-through;
      }
    }
  }

  /* 修改底部操作栏（已取消状态下隐藏） */
  .action-bar.canceled {
    display: none !important;
  }

  /* 新增导航栏样式 */
  .nav-bar {
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    height: 44px;
    background-color: transparent;
    color: #fff;
    z-index: 10;

    .nav-back {
      padding: 10rpx 20rpx;
      margin-left: 10rpx;
    }

    .nav-title {
      flex: 1;
      text-align: center;
      font-size: 36rpx;
      font-weight: 500;
      margin-right: 80rpx;
      /* 平衡左右间距 */
    }
  }

  .order-status {
    padding: 40rpx 30rpx;
    color: #fff;
    text-align: center;
    transition: all 0.3s;
    // margin-top: 44px;
    /* 给导航栏留出空间 */

    .status-icon {
      width: 80rpx;
      height: 80rpx;
      border: 4rpx solid #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20rpx;
    }

    .status-text {
      font-size: 36rpx;
      display: block;
      margin-bottom: 10rpx;
      font-weight: 500;
    }

    .status-tip {
      z-index: -1;
      font-size: 24rpx;
      opacity: 0.9;
    }
  }

  .order-content {
    height: calc(100vh - 44px - 200rpx - env(safe-area-inset-bottom));
  }

  .card {
    background: #fff;
    border-radius: 16rpx;
    margin: 20rpx;
    padding: 24rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

    &.shop-info {
      .shop-header {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;

        .shop-avatar {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          margin-right: 20rpx;
        }

        .shop-name {
          font-size: 32rpx;
          font-weight: 500;
        }
      }

      .divider {
        height: 1px;
        background: #f0f0f0;
        margin: 20rpx -24rpx;
      }

      .product-list {
        .product-item {
          display: flex;
          align-items: center;
          padding: 20rpx 0;
          position: relative;

          .product-image {
            width: 120rpx;
            height: 120rpx;
            border-radius: 8rpx;
            margin-right: 20rpx;
          }

          .product-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;

            .product-name {
              font-size: 28rpx;
              color: #333;
              margin-bottom: 10rpx;
              display: -webkit-box;
              line-clamp: 2;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }

            .product-spec {
              font-size: 24rpx;
              color: #999;
            }
          }

          .product-price {
            font-size: 28rpx;
            color: #333;
            font-weight: 500;
          }
        }
      }

      .order-summary {
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 15rpx 0;
          font-size: 26rpx;

          .label {
            color: #666;
          }

          .value {
            color: #333;
          }

          &.total {
            .value {
              font-size: 32rpx;
              color: #e4393c;
              font-weight: bold;
            }
          }
        }
      }
    }

    &.delivery-info,
    &.order-info,
    &.remark-info {
      .info-item {
        display: flex;
        align-items: center;
        padding: 20rpx 0;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .uni-icons {
          margin-right: 20rpx;
          flex-shrink: 0;
        }

        /* 修改为左右布局 */
        .info-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .label {
            font-size: 26rpx;
            color: #666;
          }

          .value {
            font-size: 28rpx;
            color: #999;
            text-align: right;
            flex: 1;
            padding-left: 20rpx;
          }
        }
      }

      .detail-item {
        display: flex;
        align-items: center;
        padding: 20rpx 0;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: #666;
          font-size: 24rpx;
          width: 160rpx;
        }

        .value {
          color: #999;
          font-size: 20rpx;
          flex: 1;
        }

        .value-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex: 1;
        }

        .copy-btn {
          color: #ff5500;
          font-size: 20rpx;
          padding: 6rpx 16rpx;
          border: 1rpx solid #ff5500;
          border-radius: 30rpx;
          margin-left: 20rpx;
        }
      }
    }

    &.remark-info {
      .label {
        display: block;
        color: #666;
        font-size: 28rpx;
        margin-bottom: 16rpx;
      }

      .value {
        color: #333;
        font-size: 28rpx;
        line-height: 1.6;
      }
    }
  }

  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx;
    display: flex;
    justify-content: flex-end;
    gap: 20rpx;
    box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);

    .btn {
      margin: 0;
      padding: 0 40rpx;
      height: 72rpx;
      line-height: 72rpx;
      font-size: 28rpx;
      border-radius: 36rpx;
      transition: all 0.3s;

      &.cancel {
        background: #f5f5f5;
        color: #666;
      }

      &.primary {
        background: linear-gradient(to right, #ff9500, #ff5500);
        color: #fff;
      }
    }
  }
}
</style>