<template>
  <view class="container">
    <!-- 配送方式选择 -->
    <view class="delivery-type">
      <view class="type-item" :class="{ active: deliveryType === 1 }" @click="deliveryType = 1">
        外卖配送
      </view>
      <view class="type-item" :class="{ active: deliveryType === 2 }" @click="deliveryType = 2">
        到店自取
      </view>
    </view>

    <!-- 收货地址 -->
    <view class="address-section" @click="goToAddress">
      <view v-if="address" class="address-info">
        <view class="user-info">
          <text class="name">{{ address.name }}</text>
          <text class="phone">{{ address.phone }}</text>
        </view>
        <view class="address">{{ address.address }}</view>
      </view>
      <view v-else class="no-address">
        请选择收货地址
      </view>
      <uni-icons type="right" size="20"></uni-icons>
    </view>

    <!-- 自提信息（仅自取时显示） -->
    <view class="pickup-info" v-if="deliveryType === 2">
      <view class="title">自提点信息</view>
      <view class="content">
        <text>店铺地址：{{ storeAddress }}</text>
        <text>营业时间：{{ businessHours }}</text>
        <text>联系电话：{{ storePhone }}</text>
      </view>
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

    <!-- 修改后的底部结算栏 -->
    <view class="footer">
      <view class="total">
        合计：<text class="price">￥{{
          orderData.totalPrice +
          (deliveryType === 1 ? orderData.deliveryFee : 0)
        }}</text>
      </view>
      <view class="submit-btn" @click="onSubmitOrder">
        {{ deliveryType === 1 ? '确认支付' : '立即下单' }}
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const address = ref(null)
const orderData = ref({
  cartList: [],
  totalPrice: 0,
  deliveryFee: 0
})

// 新增配送类型（1: 外卖 2: 自取）
const deliveryType = ref(1)
// 新增店铺信息
const storeInfo = ref({
  storeAddress: '北京市朝阳区某某街道123号',
  businessHours: '08:00-22:00',
  storePhone: '138-1234-5678'
})

// 在 setup 中添加
onShow(() => {
  // 页面显示时重新获取地址数据
  const savedAddress = uni.getStorageSync('defaultAddress')
  if (savedAddress) {
    address.value = savedAddress
  }
})

onMounted(() => {
  // 获取本地存储的订单数据
  const data = uni.getStorageSync('orderData')
  if (data) {
    orderData.value = data
  }
})

// 跳转到地址页面
function goToAddress() {
  uni.navigateTo({
    url: '/pages/address/index'
  })
}
// 修改后的提交订单逻辑
function onSubmitOrder() {
  if (deliveryType.value === 1 && !address.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }

  // 构造订单数据时加入配送类型
  const orderParams = {
    ...orderData.value,
    deliveryType: deliveryType.value,
    address: deliveryType.value === 1 ? address.value : null,
    storeInfo: deliveryType.value === 2 ? storeInfo.value : null
  }

  // 后续支付逻辑...
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

.delivery-type {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  margin-bottom: 20rpx;

  .type-item {
    flex: 1;
    text-align: center;
    padding: 20rpx;
    margin: 0 20rpx;
    border-radius: 8rpx;
    border: 1rpx solid #eee;
    transition: all 0.3s;

    &.active {
      border-color: #e93323;
      color: #e93323;
      background: #ffeceb;
    }
  }
}

.pickup-info {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .title {
    font-weight: bold;
    margin-bottom: 20rpx;
  }

  .content {
    display: flex;
    flex-direction: column;
    color: #666;

    text {
      margin-bottom: 10rpx;
      font-size: 28rpx;
    }
  }
}

// 其他原有样式保持不变</style>