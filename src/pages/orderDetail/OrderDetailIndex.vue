<template>
  <view class="order-detail">
    <!-- 状态栏 -->
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <!-- 订单状态 -->
    <view class="order-status">
      <view class="status-icon">
        <uni-icons type="checkmark" size="40" color="#fff"></uni-icons>
      </view>
      <text class="status-text">订单已完成</text>
      <text class="status-tip">感谢您的惠顾，期待再次光临</text>
    </view>

    <!-- 订单卡片 -->
    <scroll-view scroll-y class="order-content">
      <!-- 店铺信息 -->
      <view class="card shop-info">
        <view class="shop-header">
          <image class="shop-icon" src="/static/shop-icon.png" mode="aspectFit"></image>
          <text class="shop-name">{{ orderData.shopName }}</text>
        </view>
        <view class="divider"></view>
        <view class="order-images">
          <image v-for="(img, index) in orderData.images" :key="index" :src="img" class="product-image"
            mode="aspectFill"></image>
        </view>
      </view>

      <!-- 配送信息 -->
      <view class="card delivery-info">
        <view class="info-item">
          <uni-icons type="location" size="20" color="#666"></uni-icons>
          <view class="info-content">
            <text class="label">配送地址</text>
            <text class="value">{{ orderData.address }}</text>
          </view>
        </view>

        <view class="info-item">
          <uni-icons type="time" size="20" color="#666"></uni-icons>
          <view class="info-content">
            <text class="label">配送时间</text>
            <text class="value">{{ orderData.deliveryTime }}</text>
          </view>
        </view>

        <view class="info-item">
          <uni-icons type="paperplane" size="20" color="#666"></uni-icons>
          <view class="info-content">
            <text class="label">配送方式</text>
            <text class="value">{{ orderData.deliveryType }}</text>
          </view>
        </view>
      </view>

      <!-- 订单详情 -->
      <view class="card order-detail">
        <view class="detail-item">
          <text class="label">订单编号</text>
          <view class="value-box">
            <text class="value">{{ orderData.orderNo }}</text>
            <text class="copy-btn" @click="copyOrderNo">复制</text>
          </view>
        </view>

        <view class="detail-item">
          <text class="label">下单时间</text>
          <text class="value">{{ orderData.createTime }}</text>
        </view>

        <view class="detail-item">
          <text class="label">支付方式</text>
          <text class="value">{{ orderData.paymentType }}</text>
        </view>

        <view class="detail-item total-price">
          <text class="label">实付金额</text>
          <text class="price">¥{{ orderData.totalPrice }}</text>
        </view>
      </view>

      <!-- 其他信息 -->
      <view class="card other-info" v-if="orderData.remark">
        <text class="label">备注信息</text>
        <text class="value">{{ orderData.remark }}</text>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <button class="btn contact">联系商家</button>
      <button class="btn primary">再次购买</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const statusBarHeight = ref(uni.getWindowInfo().statusBarHeight)

// 模拟订单数据
const orderData = reactive({
  shopName: '绿茶餐厅（万象城店）',
  images: [
    'https://via.placeholder.com/100x100?text=Product1',
    'https://via.placeholder.com/100x100?text=Product2',
    'https://via.placeholder.com/100x100?text=Product3'
  ],
  address: '浙江省杭州市西湖区文三路xxx号',
  deliveryTime: '立即配送（预计30分钟送达）',
  deliveryType: '商家配送',
  orderNo: '202308051234567890',
  createTime: '2023-08-05 18:30:45',
  paymentType: '微信支付',
  totalPrice: 158.00,
  remark: '不要放葱，需要发票'
})

// 复制订单号
const copyOrderNo = () => {
  uni.setClipboardData({
    data: orderData.orderNo,
    success: () => {
      uni.showToast({ title: '复制成功' })
    }
  })
}
</script>

<style lang="scss" scoped>
.order-detail {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 100rpx;

  .status-bar {
    background-color: #07c160;
    height: 40rpx;
  }

  .order-status {
    background-color: #07c160;
    padding: 40rpx 30rpx;
    color: #fff;
    text-align: center;

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
    }

    .status-tip {
      font-size: 24rpx;
      opacity: 0.9;
    }
  }

  .card {
    background: #fff;
    border-radius: 16rpx;
    margin: 20rpx;
    padding: 24rpx;

    &.shop-info {
      .shop-header {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;

        .shop-icon {
          width: 60rpx;
          height: 60rpx;
          margin-right: 20rpx;
        }

        .shop-name {
          font-size: 32rpx;
          font-weight: 500;
        }
      }

      .divider {
        height: 1px;
        background: #eee;
        margin: 20rpx 0;
      }

      .order-images {
        display: flex;
        gap: 20rpx;

        .product-image {
          width: 120rpx;
          height: 120rpx;
          border-radius: 8rpx;
        }
      }
    }

    &.delivery-info {
      .info-item {
        display: flex;
        align-items: flex-start;
        padding: 20rpx 0;

        .uni-icons {
          margin-right: 20rpx;
          margin-top: 6rpx;
        }

        .info-content {
          flex: 1;

          .label {
            display: block;
            font-size: 28rpx;
            color: #666;
            margin-bottom: 8rpx;
          }

          .value {
            font-size: 30rpx;
            color: #333;
          }
        }
      }
    }

    &.order-detail {
      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx 0;
        border-bottom: 1rpx solid #eee;

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: #666;
          font-size: 28rpx;
        }

        .value {
          color: #333;
          font-size: 28rpx;
        }

        .value-box {
          display: flex;
          align-items: center;
          gap: 20rpx;
        }

        .copy-btn {
          color: #07c160;
          font-size: 24rpx;
          padding: 8rpx 16rpx;
          border: 1rpx solid #07c160;
          border-radius: 30rpx;
        }

        &.total-price {
          .price {
            color: #e4393c;
            font-size: 36rpx;
            font-weight: bold;
          }
        }
      }
    }

    &.other-info {
      .label {
        color: #666;
        font-size: 28rpx;
        margin-bottom: 16rpx;
        display: block;
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

      &.contact {
        background: #f5f5f5;
        color: #666;
      }

      &.primary {
        background: #07c160;
        color: #fff;
      }
    }
  }
}
</style>