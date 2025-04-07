<template>
  <view class="container">
    <!-- 商户信息 -->
    <view class="shop-info">
      <image :src="orderData.shopInfo?.shopAvatar" class="shop-avatar"></image>
      <view class="shop-detail">
        <text class="shop-name">{{ orderData.shopInfo?.shopName }}</text>
        <text class="shop-desc">地址：{{ orderData.shopInfo?.address }}</text>
        <text class="shop-desc">电话：{{ orderData.shopInfo?.phone }}</text>
        <text class="shop-desc">营业时间：{{ orderData.shopInfo?.openTime }} - {{ orderData.shopInfo?.closeTime }}</text>
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
        <text>￥{{ orderData.packageAmount }}</text>
      </view>
    </view>

    <!-- 修改后的底部结算栏 -->
    <view class="footer">
      <view class="total">
        合计：<text class="price">￥{{ totalAmount }}</text>
      </view>
      <view class="submit-btn" @click="handleSubmitOrder">确认支付</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request } from '../../utils/request'

const address = ref(null)
const orderData = ref({
  cartList: [],
  totalPrice: 0,
  deliveryFee: 0,
  packageAmount: 0,
  shopInfo: null
})

const totalAmount = computed(() => {
  const totalPrice = Number(orderData.value.totalPrice) || 0;
  const deliveryFee = Number(orderData.value.deliveryFee) || 0;
  const packageAmountValue = Number(orderData.value.packageAmount) || 0;

  return (totalPrice + deliveryFee + packageAmountValue).toFixed(2);
});

// 新增备注、餐具数量和打包费
const remark = ref('')
const tablewareNumber = ref(1)

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

// 订阅消息模板ID
const tmplIds = [
  'EJWhBg2eJmXwQE6amJiVQAJXO8wITCD99gXCPprAfSU',
  'jt25wODP4KcrCfvS24jmKUKC-3R6yADqwAtSlGIeXH0',
  'Tocn2NGYW7XVwX5Tia1LIOeBtaKtD6d99zfxHnHOG0s'
]

// 处理订阅消息
const requestSubscription = () => {
  return new Promise((resolve) => {
    uni.requestSubscribeMessage({
      tmplIds,
      success(res) {
        console.log('订阅消息结果', res)
        resolve(true)
      },
      fail(err) {
        console.error('订阅消息失败', err)
        resolve(false)
      }
    })
  })
}

// 修改提交订单处理函数
async function handleSubmitOrder() {
  if (!address.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }

  // 先请求订阅消息授权
  await requestSubscription()

  // 继续原有的提交订单流程
  try {
    const params = {
      addressId: address.value?.id,
      remark: remark.value,
      tablewareNumber: tablewareNumber.value,
      packAmount: orderData.value.packageAmount,
      amount: totalAmount.value,
      shopId: orderData.value.shopInfo.shopId,
      shopName: orderData.value.shopInfo.shopName,
      shopAvatar: orderData.value.shopInfo.shopAvatar,
      userId: orderData.value.userId,
      groupId: orderData.value.groupId,
      type: orderData.value.type
    }

    uni.showLoading({ title: '提交中...' });

    // 提交订单请求
    const orderRes = await request({
      url: '/order/submit',
      method: 'POST',
      data: params
    });
    console.log(orderRes)

    // 获取订单号
    const orderNumber = orderRes.data.orderNumber;
    if (!orderNumber) {
      throw new Error('未获取到订单号');
    }

    // 调用支付接口
    uni.showLoading({ title: '获取支付信息中...' });
    const paymentRes = await request({
      url: '/order/payment',
      method: 'POST',
      data: { orderNumber }
    });

    // 获取支付参数
    const paymentParams = paymentRes.data;
    console.log(paymentParams)
    if (!paymentParams) {
      throw new Error('未获取到支付参数');
    }

    const appId = 'wx0391cb325faccbaa'
    // 调起微信支付
    uni.requestPayment({
      appId: appId,
      timeStamp: paymentParams.timeStamp,
      nonceStr: paymentParams.nonceStr,
      package: paymentParams.packageStr,
      signType: paymentParams.signType,
      paySign: paymentParams.paySign,
      complete: (res) => {
        uni.hideLoading();
        if (res.errMsg === 'requestPayment:fail') {
          uni.showToast({ title: '支付失败', icon: 'none' });
        }
      },
      success: (res) => {
        uni.showToast({ title: '支付成功', icon: 'success' });
        // 支付成功后的逻辑，如跳转到订单详情页
        uni.navigateBack({ delta: 1 });
      },
      fail: (err) => {
        uni.showToast({ title: '支付失败', icon: 'none' });
        console.error('支付失败', err);
      }
    });
  } catch (error) {
    uni.hideLoading();
    uni.showToast({ title: '操作失败', icon: 'none' });
    console.error('操作失败', error);
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

.shop-info {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: flex-start;

  .shop-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }

  .shop-detail {
    display: flex;
    flex-direction: column;

    .shop-name {
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
    }

    .shop-desc {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 6rpx;

      &:last-child {
        margin-bottom: 0;
      }
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