<template>
  <view class="container">
    <!-- 添加抽奖按钮 -->
    <view class="add-button">
      <button class="primary-button" @click="openAddLotteryDialog">
        + 添加抽奖
      </button>
    </view>

    <!-- 抽奖列表 -->
    <view class="lottery-list">
      <view v-if="lotteryList.length === 0" class="empty-tip"
        >暂无抽奖活动</view
      >
      <view v-else>
        <view
          v-for="(lottery, index) in lotteryList"
          :key="index"
          class="lottery-item"
        >
          <view class="lottery-details">
            <text class="lottery-title">{{ lottery.title }}</text>
            <view class="prize-info">
              <text class="lottery-desc">{{ lottery.description }}</text>
            </view>

            <view class="prize-info">
              <text class="prize-label">一等奖：</text>
              <text class="prize-content"
                >{{ lottery.prize1 }} ({{ lottery.prize1Count }}份)</text
              >
            </view>
            <view class="prize-info">
              <text class="prize-label">二等奖：</text>
              <text class="prize-content"
                >{{ lottery.prize2 }} ({{ lottery.prize2Count }}份)</text
              >
            </view>
            <view class="prize-info">
              <text class="prize-label">三等奖：</text>
              <text class="prize-content"
                >{{ lottery.prize3 }} ({{ lottery.prize3Count }}份)</text
              >
            </view>
          </view>
          <view class="lottery-actions">
            <button
              class="action-button edit-button"
              @click="openEditLotteryDialog(index)"
            >
              编辑
            </button>
            <button
              class="action-button delete-button"
              @click="confirmDeleteLottery(index)"
            >
              删除
            </button>
            <button
              :class="
                lottery.isPublished ? 'published-button' : 'publish-button'
              "
              :disabled="lottery.isPublished"
              @click="publishLottery(index)"
            >
              {{ lottery.isPublished ? "已发布" : "发布" }}
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加/编辑抽奖弹窗 -->
    <uni-popup ref="lotteryPopup" type="dialog">
      <view class="popup-content">
        <view class="popup-header">
          <text>{{ isEditing ? "编辑抽奖" : "添加抽奖" }}</text>
          <uni-icons
            type="closeempty"
            size="30"
            color="#666"
            @click="closeLotteryDialog"
            hover-class="icon-hover"
          ></uni-icons>
        </view>
        <view class="form-item">
          <label>活动标题</label>
          <input v-model="currentLottery.title" placeholder="请输入活动标题" />
        </view>
        <view class="form-item">
          <label>活动描述</label>
          <input
            v-model="currentLottery.description"
            placeholder="请输入活动描述"
          />
        </view>

        <!-- 一等奖设置 -->
        <view class="prize-form-group">
          <view class="form-item">
            <label>一等奖奖品</label>
            <input
              v-model="currentLottery.prize1"
              placeholder="请输入一等奖奖品"
            />
          </view>
          <view class="form-item">
            <label>一等奖数量</label>
            <input
              type="number"
              v-model.number="currentLottery.prize1Count"
              placeholder="请输入数量"
              min="1"
            />
          </view>
        </view>

        <!-- 二等奖设置 -->
        <view class="prize-form-group">
          <view class="form-item">
            <label>二等奖奖品</label>
            <input
              v-model="currentLottery.prize2"
              placeholder="请输入二等奖奖品"
            />
          </view>
          <view class="form-item">
            <label>二等奖数量</label>
            <input
              type="number"
              v-model.number="currentLottery.prize2Count"
              placeholder="请输入数量"
              min="1"
            />
          </view>
        </view>

        <!-- 三等奖设置 -->
        <view class="prize-form-group">
          <view class="form-item">
            <label>三等奖奖品</label>
            <input
              v-model="currentLottery.prize3"
              placeholder="请输入三等奖奖品"
            />
          </view>
          <view class="form-item">
            <label>三等奖数量</label>
            <input
              type="number"
              v-model.number="currentLottery.prize3Count"
              placeholder="请输入数量"
              min="1"
            />
          </view>
        </view>

        <view class="form-buttons">
          <button class="cancel-button" @click="closeLotteryDialog">
            取消
          </button>
          <button class="confirm-button" @click="saveLottery">保存</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { request } from "@/utils/request";

export default {
  data() {
    return {
      lotteryList: [
        {
          id: 1,
          title: "抽奖活动1",
          description: "这是一个精彩的抽奖活动",
          prize1: "iPhone 15",
          prize1Count: 1,
          prize2: "iPad",
          prize2Count: 3,
          prize3: "AirPods",
          prize3Count: 5,
          isPublished: false,
        },
        {
          id: 2,
          title: "抽奖活动2",
          description: "快来参与抽奖吧",
          prize1: "MacBook Pro",
          prize1Count: 1,
          prize2: "Apple Watch",
          prize2Count: 2,
          prize3: "Beats耳机",
          prize3Count: 3,
          isPublished: true,
        },
      ],
      currentLottery: {
        id: null,
        title: "",
        description: "",
        prize1: "",
        prize1Count: 1,
        prize2: "",
        prize2Count: 1,
        prize3: "",
        prize3Count: 1,
        isPublished: false,
      },
      isEditing: false,
      editIndex: -1,
      isLoading: false,
      shopid: "",
    };
  },
  methods: {
    // 获取用户信息
    async getUserInfo() {
      try {
        this.isLoading = true;
        uni.showLoading({ title: "加载中..." });

        const response = await request({
          method: "GET",
          url: "/user/getUserInfo",
        });

        if (response?.code === 200 && response.data) {
          console.log("获取用户信息成功:", response.data);
          this.shopid = response.data.shopid;
        } else {
          throw new Error(response?.message || "获取用户信息失败");
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        uni.showToast({
          title: error.message || "获取信息失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
        uni.hideLoading();
      }
    },
    // 获取抽奖活动列表
    async getLotteryList() {
      try {
        this.isLoading = true;
        uni.showLoading({ title: "加载中..." });

        const response = await request({
          method: "GET",
          url: "/category/get",
          data: { shopid: this.shopid },
        });

        if (response?.code === 200 && response.data) {
          this.lotteryList = response.data;
        } else {
          throw new Error(response?.message || "获取抽奖活动列表失败");
        }
      } catch (error) {
        console.error("获取抽奖活动列表失败:", error);
        uni.showToast({
          title: error.message || "获取列表失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
        uni.hideLoading();
      }
    },
    // 添加/编辑抽奖活动
    openAddLotteryDialog() {
      this.isEditing = false;
      this.currentLottery = {
        id: null,
        title: "",
        description: "",
        prize1: "",
        prize1Count: 1,
        prize2: "",
        prize2Count: 1,
        prize3: "",
        prize3Count: 1,
        isPublished: false,
      };
      this.$refs.lotteryPopup.open();
    },
    openEditLotteryDialog(index) {
      this.isEditing = true;
      this.editIndex = index;
      this.currentLottery = { ...this.lotteryList[index] };
      this.$refs.lotteryPopup.open();
    },
    closeLotteryDialog() {
      this.$refs.lotteryPopup.close();
    },
    saveLottery() {
      // 验证奖品数量
      if (!this.validatePrizeCount()) {
        return;
      }

      if (this.isEditing) {
        // 编辑抽奖活动
        this.lotteryList.splice(this.editIndex, 1, this.currentLottery);
      } else {
        // 添加抽奖活动
        const newId =
          this.lotteryList.length > 0
            ? this.lotteryList[this.lotteryList.length - 1].id + 1
            : 1;
        this.currentLottery.id = newId;
        this.lotteryList.push(this.currentLottery);
      }
      this.closeLotteryDialog();
    },
    validatePrizeCount() {
      if (
        this.currentLottery.prize1Count <= 0 ||
        this.currentLottery.prize2Count <= 0 ||
        this.currentLottery.prize3Count <= 0
      ) {
        uni.showToast({
          title: "奖品数量必须大于0",
          icon: "none",
        });
        return false;
      }
      return true;
    },
    confirmDeleteLottery(index) {
      uni.showModal({
        title: "提示",
        content: "确定删除该抽奖活动吗？",
        success: (res) => {
          if (res.confirm) {
            this.lotteryList.splice(index, 1);
          }
        },
      });
    },
    publishLottery(index) {
      // 这里可以调用后端接口发布抽奖活动，目前先更新前端状态
      this.lotteryList[index].isPublished = true;
      uni.showToast({
        title: "发布成功",
        icon: "success",
      });
    },
  },
  onLoad() {
    // 获取用户信息
    this.getUserInfo();
  },
};
</script>

<style lang="scss">
.container {
  padding: 20rpx;
}

.add-button {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  text-align: center;
}

.primary-button {
  background-color: #ff9a9e;
  color: #fff;
  width: 80%;
  border-radius: 40rpx;
  font-size: 28rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background-color: #ff8a92;
    box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.2);
  }
}

.lottery-list {
  margin-bottom: 100rpx;
}

.lottery-item {
  border: 1rpx solid #e0e0e0;
  background-color: #fff;
  border-radius: 15rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.15);
    transform: translateY(-3rpx);
  }
}

.lottery-details {
  padding: 30rpx;
  text-align: center;
}

.lottery-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.lottery-desc {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
}

.prize-info {
  display: flex;
  font-size: 24rpx;
  color: #777;
  margin-top: 8rpx;
}

.prize-label {
  font-weight: bold;
  margin-right: 10rpx;
}

.lottery-actions {
  display: flex;
  justify-content: space-between;
  padding: 10rpx;
  border-top: 1rpx solid #e0e0e0;
  flex-direction: row;
  align-items: center;
  gap: 10rpx;
}

.action-button {
  border-radius: 20rpx;
  font-size: 24rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  padding: 12rpx 20rpx;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50rpx;
}

.edit-button {
  background-color: #f4cdc6;
  color: #fff;
}

.edit-button:hover {
  background-color: #e7d3cb;
}

.delete-button {
  background-color: #ff5252;
  color: #fff;
}

.delete-button:hover {
  background-color: #e53935;
}

.publish-button {
  border-radius: 20rpx;
  font-size: 24rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  padding: 12rpx 20rpx;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50rpx;
  background-color: #f6917f;
  color: #fff;
}

.publish-button:hover {
  background-color: #d1907c;
}

.published-button {
  border-radius: 20rpx;
  font-size: 24rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  padding: 12rpx 20rpx;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50rpx;
  color: #7896ef;
}

.empty-tip {
  text-align: center;
  color: #999;
  margin-bottom: 100rpx;
  font-size: 26rpx;
}

.popup-content {
  padding: 40rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  position: relative;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.popup-header text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.popup-header uni-icons {
  cursor: pointer;
}

.form-item {
  margin-bottom: 20rpx;
}

.form-item label {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
  color: #333;
}

.form-item input {
  border: 1rpx solid #ccc;
  border-radius: 10rpx;
  padding: 12rpx;
  font-size: 28rpx;
  width: 100%;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #ff9a9e;
  }
}

.prize-form-group {
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  padding: 15rpx;
  margin-bottom: 20rpx;
}

.form-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
}

.cancel-button {
  background-color: #ccc;
  color: #333;
  flex: 1;
  margin-right: 20rpx;
  border-radius: 20rpx;
  padding: 15rpx;
  font-size: 28rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background-color: #bbb;
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
  }
}

.confirm-button {
  background-color: #ff9a9e;
  color: #fff;
  flex: 1;
  border-radius: 20rpx;
  padding: 15rpx;
  font-size: 28rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background-color: #ff8a92;
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
  }
}

.icon-hover {
  opacity: 0.7;
}
</style>
