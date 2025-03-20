<template>
  <view class="get-user-phone">
    <view class="form">
      <view class="form-item">
        <input type="number" v-model="phone" placeholder="请输入手机号" maxlength="11" />
      </view>
      <view class="form-item code-item">
        <input type="number" v-model="code" placeholder="请输入验证码" maxlength="6" />
        <button class="code-btn" :disabled="counting > 0" @click="getCode">
          {{ counting > 0 ? `${counting}s后重新获取` : '获取验证码' }}
        </button>
      </view>
      <button class="submit-btn" @click="handleSubmit">登录</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      phone: '',
      code: '',
      counting: 0,
      timer: null
    }
  },
  methods: {
    // 获取验证码
    async getCode() {
      if (!/^1[3-9]\d{9}$/.test(this.phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }

      try {
        // TODO: 调用获取验证码接口
        // const res = await this.$api.getCode(this.phone)

        // 开始倒计时
        this.counting = 60
        this.timer = setInterval(() => {
          if (this.counting > 0) {
            this.counting--
          } else {
            clearInterval(this.timer)
          }
        }, 1000)

      } catch (error) {
        uni.showToast({
          title: '获取验证码失败',
          icon: 'none'
        })
      }
    },

    // 提交登录
    async handleSubmit() {
      if (!/^1[3-9]\d{9}$/.test(this.phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      if (!this.code) {
        uni.showToast({
          title: '请输入验证码',
          icon: 'none'
        })
        return
      }

      try {
        // TODO: 调用登录接口
        // const res = await this.$api.login({
        //   phone: this.phone,
        //   code: this.code
        // })

        // 登录成功后跳转
        uni.switchTab({
          url: '/pages/my/my'
        })
      } catch (error) {
        uni.showToast({
          title: '登录失败',
          icon: 'none'
        })
      }
    }
  },
  beforeDestroy() {
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style lang="scss" scoped>
.get-user-phone {
  padding: 40rpx;

  .form {
    margin-top: 100rpx;

    .form-item {
      border-bottom: 1rpx solid #eee;
      padding: 20rpx 0;
      margin-bottom: 30rpx;

      input {
        font-size: 28rpx;
      }
    }

    .code-item {
      display: flex;
      align-items: center;

      .code-btn {
        margin-left: 20rpx;
        font-size: 24rpx;
        padding: 10rpx 20rpx;
        background: #f0f0f0;
        border-radius: 8rpx;

        &[disabled] {
          background: #ccc;
          color: #fff;
        }
      }
    }

    .submit-btn {
      margin-top: 60rpx;
      background: #1989fa;
      color: #fff;
    }
  }
}
</style>