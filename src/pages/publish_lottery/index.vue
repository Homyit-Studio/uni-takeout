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
      <view v-if="lotteryList.length === 0" class="empty-tip">
        暂无抽奖活动
      </view>
      <view v-else>
        <view
          v-for="(lottery, index) in lotteryList"
          :key="index"
          class="lottery-item"
        >
          <view class="lottery-details">
            <text class="lottery-title">{{ lottery.name }}</text>

            <view class="prize-info">
              <text class="prize-label">抽奖简介：</text>
              <text class="prize-content">{{ lottery.introduction }}</text>
            </view>

            <view class="prize-info">
              <text class="prize-label">奖品：</text>
              <text class="prize-content">{{ lottery.productName }}</text>
            </view>

            <view class="prize-info">
              <text class="prize-label">奖品数量：</text>
              <text class="prize-content">{{ lottery.amount }}份</text>
            </view>

            <view class="prize-info">
              <text class="prize-label">抽奖开始时间：</text>
              <text class="prize-content">{{
                formatTimeRange(lottery.startTime)
              }}</text>
            </view>

            <view class="prize-info">
              <text class="prize-label">抽奖结束时间：</text>
              <text class="prize-content">{{
                formatTimeRange(lottery.endTime)
              }}</text>
            </view>
          </view>
          <view class="lottery-actions">
            <button
              class="action-button edit-button"
              @click="openEditLotteryDialog(lottery.id)"
            >
              编辑
            </button>
            <button
              class="action-button delete-button"
              @click="confirmDeleteLottery(lottery.id)"
            >
              删除
            </button>
            <button
              :class="getStatusClass(lottery)"
              :disabled="getStatus(lottery) === '已结束'"
            >
              {{ getStatusText(lottery) }}
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
          <input v-model="currentLottery.name" placeholder="请输入活动标题" />
        </view>
        <view class="form-item">
          <label>活动描述</label>
          <input
            v-model="currentLottery.introduction"
            placeholder="请输入活动描述"
          />
        </view>

        <!-- 奖品设置 -->
        <view class="form-item">
          <label>奖品名称</label>
          <input
            v-model="currentLottery.productName"
            placeholder="请输入奖品名称"
          />
        </view>
        <view class="form-item">
          <label>奖品数量</label>
          <input
            type="number"
            v-model.number="currentLottery.amount"
            placeholder="请输入数量"
          />
        </view>

        <view class="form-item">
          <label>抽奖开始时间</label>
          <input
            v-model="currentLottery.startTime"
            placeholder="格式为 xxxx-xx-xx xx:xx:xx"
          />
        </view>

        <view class="form-item">
          <label>抽奖结束时间</label>
          <input
            v-model="currentLottery.endTime"
            placeholder="格式为 xxxx-xx-xx xx:xx:xx"
          />
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
      lotteryList: [],
      currentLottery: {
        id: null,
        name: "",
        introduction: "",
        productName: "",
        amount: 1,
        startTime: "",
        endTime: "",
        probability: 0.1,
        totalAmount: 1,
        shopid: "",
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
          this.currentLottery.shopid = response.data.shopid; // 设置默认shopid
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
        // if (!this.shopid) {
        //   await this.getUserInfo(); // 确保shopid已获取
        // }

        this.isLoading = true;
        uni.showLoading({ title: "加载中..." });

        const response = await request({
          method: "GET",
          // url: `/prize/select/${this.shopid}`,
          url: "/prize/select/1",
        });

        console.log("获取抽奖活动列表成功:", response.data);
        if (response?.code === 200) {
          this.lotteryList = response.data || [];
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
        name: "",
        introduction: "",
        productName: "",
        amount: 1,
        startTime: "",
        endTime: "",
        probability: 0.1,
        totalAmount: 1,
        shopid: this.shopid,
      };
      this.$refs.lotteryPopup.open();
    },

    openEditLotteryDialog(index) {
      this.isEditing = true;
      this.editIndex = index;
      this.currentLottery = {
        ...this.lotteryList[index],
        shopid: this.shopid, // 确保编辑时也有shopid
      };
      this.$refs.lotteryPopup.open();
    },

    closeLotteryDialog() {
      this.$refs.lotteryPopup.close();
    },

    // 保存抽奖活动
    saveLottery() {
      if (this.isEditing) {
        this.updateLottery();
      } else {
        this.addLottery();
      }
    },

    // 新增抽奖活动
    async addLottery() {
      if (!this.validateForm()) return;

      try {
        this.isLoading = true;
        uni.showLoading({ title: "添加中..." });

        const lotteryData = {
          ...this.currentLottery,
          startTime: this.formatTime(this.currentLottery.startTime),
          endTime: this.formatTime(this.currentLottery.endTime),
          createTime: new Date().toISOString().slice(0, 19).replace("T", " "),
        };

        const response = await request({
          method: "POST",
          url: "/prize/add",
          data: lotteryData,
        });

        if (response?.code === 200) {
          uni.showToast({
            title: "添加成功",
            icon: "success",
          });
          this.getLotteryList();
          this.closeLotteryDialog();
        } else {
          throw new Error(response?.message || "添加失败");
        }
      } catch (error) {
        console.error("添加失败:", error);
        uni.showToast({
          title: error.message || "添加失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
        uni.hideLoading();
      }
    },

    // 编辑抽奖活动
    async updateLottery() {
      if (!this.validateForm()) return;

      try {
        this.isLoading = true;
        uni.showLoading({ title: "更新中..." });

        const lotteryData = {
          ...this.currentLottery,
          startTime: this.formatTime(this.currentLottery.startTime),
          endTime: this.formatTime(this.currentLottery.endTime),
        };

        const response = await request({
          method: "POST",
          url: "/prize/update",
          data: lotteryData,
        });

        if (response?.code === 200) {
          uni.showToast({
            title: "更新成功",
            icon: "success",
          });
          this.getLotteryList();
          this.closeLotteryDialog();
        } else {
          throw new Error(response?.message || "更新失败");
        }
      } catch (error) {
        console.error("更新失败:", error);
        uni.showToast({
          title: error.message || "更新失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
        uni.hideLoading();
      }
    },

    // 表单验证
    validateForm() {
      // 验证必填字段
      if (!this.currentLottery.name) {
        uni.showToast({ title: "请填写活动标题", icon: "none" });
        return false;
      }
      if (!this.currentLottery.productName) {
        uni.showToast({ title: "请填写奖品名称", icon: "none" });
        return false;
      }
      if (!this.validatePrizeCount()) {
        return false;
      }
      if (!this.validateTime()) {
        return false;
      }
      return true;
    },

    // 验证奖品数量
    validatePrizeCount() {
      if (this.currentLottery.amount <= 0) {
        uni.showToast({
          title: "奖品数量必须大于0",
          icon: "none",
        });
        return false;
      }
      return true;
    },

    // 验证时间
    validateTime() {
      if (!this.validateTimeFormat(this.currentLottery.startTime)) {
        uni.showToast({
          title: "开始时间格式不正确",
          icon: "none",
        });
        return false;
      }
      if (!this.validateTimeFormat(this.currentLottery.endTime)) {
        uni.showToast({
          title: "结束时间格式不正确",
          icon: "none",
        });
        return false;
      }

      const startTime = this.parseTime(this.currentLottery.startTime);
      const endTime = this.parseTime(this.currentLottery.endTime);

      if (endTime <= startTime) {
        uni.showToast({
          title: "结束时间必须晚于开始时间",
          icon: "none",
        });
        return false;
      }

      return true;
    },

    // 其他方法保持不变...
    confirmDeleteLottery(prizeId) {
      uni.showModal({
        title: "提示",
        content: "确定删除该抽奖活动吗？",
        success: (res) => {
          if (res.confirm) {
            this.deleteLotteryList(prizeId);
          }
        },
      });
    },

    async deleteLotteryList(prizeId) {
      try {
        this.isLoading = true;
        uni.showLoading({ title: "删除中..." });

        const response = await request({
          method: "POST",
          url: "/prize/delete",
          data: { prizeId },
        });

        if (response?.code === 200) {
          uni.showToast({
            title: "删除成功",
            icon: "success",
          });
          this.getLotteryList();
        } else {
          throw new Error(response?.message || "删除失败");
        }
      } catch (error) {
        console.error("删除失败:", error);
        uni.showToast({
          title: error.message || "删除失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
        uni.hideLoading();
      }
    },

    // 其他工具方法保持不变...
    formatTimeRange(timeStr) {
      if (!timeStr) return "未设置";
      const date = this.parseTime(timeStr);
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
    },

    getStatus(lottery) {
      if (!lottery.startTime || !lottery.endTime) return "未设置";
      const now = new Date();
      const startTime = this.parseTime(lottery.startTime);
      const endTime = this.parseTime(lottery.endTime);
      if (now < startTime) return "未开始";
      if (now > endTime) return "已结束";
      return "进行中";
    },

    parseTime(timeStr) {
      if (!timeStr) return new Date();
      if (timeStr.includes("T")) {
        return new Date(timeStr);
      }
      return new Date(timeStr.replace(/-/g, "/"));
    },

    getStatusText(lottery) {
      return this.getStatus(lottery);
    },

    getStatusClass(lottery) {
      const status = this.getStatus(lottery);
      switch (status) {
        case "未开始":
          return "action-button not-started-button";
        case "进行中":
          return "action-button in-progress-button";
        case "已结束":
          return "action-button ended-button";
        default:
          return "action-button default-button";
      }
    },

    validateTimeFormat(timeStr) {
      if (!timeStr) return false;
      const pattern1 = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      const pattern2 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      return pattern1.test(timeStr) || pattern2.test(timeStr);
    },

    formatTime(timeStr) {
      if (!timeStr) return "";
      if (timeStr.includes("T")) {
        const date = new Date(timeStr);
        return `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date
          .getDate()
          .toString()
          .padStart(2, "0")} ${date
          .getHours()
          .toString()
          .padStart(2, "0")}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
      }
      return timeStr;
    },
  },
  onLoad() {
    this.getUserInfo().then(() => {
      this.getLotteryList();
    });
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

.picker {
  border: 1rpx solid #ccc;
  border-radius: 10rpx;
  padding: 12rpx;
  font-size: 28rpx;
  width: 100%;
  transition: border-color 0.3s ease;
  color: #333;

  &:focus {
    border-color: #ff9a9e;
  }
}
</style>
