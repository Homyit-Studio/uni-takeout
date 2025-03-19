<template>
  <view class="container">
    <!-- 收货地址 -->
    <view class="address-section" @click="goToAddress">
      <view v-if="address" class="address-info">
        <view class="user-info">
          <text class="name">{{ address.name }}</text>
          <text class="phone">{{ address.phone }}</text>
        </view>
        <view class="address">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}</view>
      </view>
      <view v-else class="no-address">
        请选择收货地址
      </view>
      <uni-icons type="right" size="20"></uni-icons>
    </view>

    <!-- 商品列表 -->
    <view class="goods-section">
      <view class="goods-item" v-for="(item, index) in orderData.cartList" :key="index">
        <image :src="item.img" mode="aspectFill" class="goods-img"></image>
        <view class="goods-info">
          <text class="name">{{ item.name }}</text>
          <view class="price-count">
            <text class="price">￥{{ item.price }}</text>
            <text class="count">x{{ item.count }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 配送费 -->
    <view class="delivery-section">
      <text>配送费</text>
      <text>￥{{ orderData.deliveryFee }}</text>
    </view>

    <!-- 底部结算栏 -->
    <view class="footer">
      <view class="total">
        合计：<text class="price">￥{{ orderData.totalPrice + orderData.deliveryFee }}</text>
      </view>
      <view class="submit-btn" @click="onSubmitOrder">确认支付</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const address = ref(null)
const orderData = ref({
  cartList: [],
  totalPrice: 0,
  deliveryFee: 0
})

onMounted(() => {
  // 获取本地存储的订单数据
  const data = uni.getStorageSync('orderData')
  if (data) {
    orderData.value = data
  }

  // 获取默认地址
  const savedAddress = uni.getStorageSync('selectedAddress')
  if (savedAddress) {
    address.value = savedAddress
  }
})

// 跳转到地址页面
function goToAddress() {
  uni.navigateTo({
    url: '/pages/address/index'
  })
}

// 提交订单
function onSubmitOrder() {
  if (!address.value) {
    uni.showToast({
      title: '请选择收货地址',
      icon: 'none'
    })
    return
  }

  // 调用支付接口
  uni.showLoading({
    title: '支付中...'
  })

  // 模拟支付过程
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '支付成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        // 清除本地订单数据
        uni.removeStorageSync('orderData')
        // 跳转到订单页面或首页
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }, 2000)
      }
    })
  }, 1500)
}
</script>

<style lang="scss" scoped>
.container {
  padding-bottom: 120rpx;
}

.address-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;

  .address-info {
    flex: 1;

    .user-info {
      margin-bottom: 10rpx;

      .name {
        margin-right: 20rpx;
        font-weight: bold;
      }

      .phone {
        color: #666;
      }
    }

    .address {
      color: #333;
      font-size: 28rpx;
    }
  }

  .no-address {
    flex: 1;
    color: #999;
  }
}

.goods-section {
  background: #fff;
  padding: 20rpx;
  margin-bottom: 20rpx;

  .goods-item {
    display: flex;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .goods-img {
      width: 120rpx;
      height: 120rpx;
      border-radius: 8rpx;
    }

    .goods-info {
      flex: 1;
      margin-left: 20rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .name {
        font-size: 28rpx;
      }

      .price-count {
        display: flex;
        justify-content: space-between;

        .price {
          color: #e93323;
          font-weight: bold;
        }

        .count {
          color: #999;
        }
      }
    }
  }
}

.delivery-section {
  background: #fff;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  height: 100rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  padding-bottom: env(safe-area-inset-bottom);

  .total {
    flex: 1;

    .price {
      color: #e93323;
      font-size: 32rpx;
      font-weight: bold;
    }
  }

  .submit-btn {
    width: 200rpx;
    height: 72rpx;
    background: #e93323;
    color: #fff;
    border-radius: 36rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
  }
}
</style>