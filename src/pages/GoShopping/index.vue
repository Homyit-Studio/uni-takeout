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
        <text>店铺地址：{{ orderData.shopInfo.address }}</text>
        <text>营业时间：{{ orderData.shopInfo.openTime }}-{{ orderData.shopInfo.closeTime }}</text>
        <text>联系电话：{{ orderData.shopInfo.phone }}</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-section">
      <view class="goods-item" v-for="(item, index) in orderData.cartList" :key="index">
        <image :src="item.img" mode="aspectFill" class="goods-img"></image>
        <view class="goods-info">
          <text class="name">{{ item.name }}</text>
          <view style="color: #666;">{{ item.introduction }}</view>
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

    <!-- 添加备注和餐具数量选择 -->
    <view class="order-options">
      <view class="option-item">
        <text>备注</text>
        <input type="text" v-model="remark" placeholder="请输入备注信息" />
      </view>

      <view class="option-item">
        <text>餐具数量</text>
        <view class="tableware-select">
          <text class="btn" @click="decreaseTableware">-</text>
          <text class="count">{{ tablewareNumber }}</text>
          <text class="btn" @click="increaseTableware">+</text>
        </view>
      </view>

      <view class="option-item">
        <text>打包费</text>
        <text>￥{{ packAmount }}</text>
      </view>
    </view>

    <!-- 修改后的底部结算栏 -->
    <view class="footer">
      <view class="total">
        合计：<text class="price">￥{{
          orderData.totalPrice +
          (deliveryType === 1 ? orderData.deliveryFee : 0) +
          packAmount
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
import { request } from '../../utils/request'

const address = ref(null)
const orderData = ref({
  cartList: [],
  totalPrice: 0,
  deliveryFee: 0,
  shopInfo: null
})

const deliveryType = ref(1)

// 新增备注、餐具数量和打包费
const remark = ref('')
const tablewareNumber = ref(1)
const packAmount = ref(1)

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

// 餐具数量加减
const decreaseTableware = () => {
  if (tablewareNumber.value > 0) {
    tablewareNumber.value--
  }
}

const increaseTableware = () => {
  tablewareNumber.value++
}

// 修改后的提交订单逻辑
async function onSubmitOrder() {
  if (deliveryType.value === 1 && !address.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }

  try {
    const params = {
      addressId: address.value?.id,
      remark: remark.value,
      tablewareNumber: tablewareNumber.value,
      packAmount: packAmount.value,
      amount: orderData.value.totalPrice +
        (deliveryType.value === 1 ? orderData.value.deliveryFee : 0) +
        packAmount.value,
      shopId: orderData.value.shopInfo.shopId,
      shopName: orderData.value.shopInfo.shopName,
      shopAvatar: orderData.value.shopInfo.shopAvatar,
      deliveryType: deliveryType.value
    }

    uni.showLoading({ title: '提交中...' })

    const res = await request({
      url: '/order/submit',
      method: 'POST',
      data: params
    })
    uni.hideLoading()
    console.log(res)
    uni.showToast({
      title: '下单成功',
      icon: 'success',
      success: () => {
        uni.removeStorageSync('orderData')
        // setTimeout(() => {
        //   uni.switchTab({ url: '/pages/index/index' })
        // }, 1500)
      }
    })
    // uni.showToast({
    //   title: res.msg || '下单失败',
    //   icon: 'none'
    // })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '下单失败',
      icon: 'none'
    })
  }
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

.order-options {
  background: #fff;
  margin-bottom: 20rpx;

  .option-item {
    padding: 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid #eee;

    input {
      text-align: right;
      width: 400rpx;
    }

    .tableware-select {
      display: flex;
      align-items: center;

      .btn {
        width: 44rpx;
        height: 44rpx;
        border-radius: 50%;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;

        &:active {
          opacity: 0.8;
        }
      }

      .count {
        margin: 0 20rpx;
        min-width: 40rpx;
        text-align: center;
      }
    }
  }
}
</style>