<template>
  <view class="merchant-management-container">
    <!-- 顶部商铺信息 -->
    <view class="merchant-header">
      <view class="shop-avatar-container" @click="showAvatarOptions">
        <image :src="shopAvatar" class="shop-avatar"></image>
      </view>
      <view class="shop-info">
        <input
          v-model="shopName"
          class="shop-name-input"
          placeholder="请输入店铺名称"
          @focus="showNameEditModal"
        />
        <text class="shop-status" :class="{ closed: !isOpen }">
          {{ isOpen ? "营业中" : "已打烊" }}
        </text>
      </view>
    </view>

    <!-- 功能导航 -->
    <view class="function-nav">
      <view class="nav-item" @click="navigateTo('manageProducts')">
        <uni-icons type="compose" size="30" color="#007aff"></uni-icons>
        <text class="nav-text">管理商品</text>
      </view>
      <view class="nav-item" @click="navigateTo('publishLottery')">
        <uni-icons type="vip" size="30" color="#ff6347"></uni-icons>
        <text class="nav-text">发布抽奖</text>
      </view>
      <view class="nav-item" @click="navigateTo('revenueDetails')">
        <uni-icons type="list" size="30" color="#4caf50"></uni-icons>
        <text class="nav-text">营收细则</text>
      </view>
      <view class="nav-item" @click="navigateTo('LuckyLists')">
        <uni-icons type="gift-filled" size="30" color="#5caf50"></uni-icons>
        <text class="nav-text">抽奖列表</text>
      </view>
      <view class="nav-item" @click="navigateTo('launchLuckying')">
        <uni-icons type="gift-filled" size="30" color="#4caf50"></uni-icons>
        <text class="nav-text">进行抽奖</text>
      </view>
      <view class="nav-item" @click="navigateTo('myLucky')">
        <uni-icons type="gift-filled" size="30" color="#1caf50"></uni-icons>
        <text class="nav-text">我的中奖记录</text>
      </view>
      <view class="nav-item" @click="navigateTo('userLucky')">
        <uni-icons type="gift-filled" size="30" color="#1caf50"></uni-icons>
        <text class="nav-text">商铺查询中奖记录</text>
      </view>
      <view class="nav-item" @click="navigateTo('personalInfo')">
        <uni-icons type="gift" size="30" color="#1cbf10"></uni-icons>
        <text class="nav-text">个人信息修改</text>
      </view>
      <view class="nav-item" @click="navigateTo('merchantInfo')">
        <uni-icons type="gift" size="30" color="#1cbf10"></uni-icons>
        <text class="nav-text">商户信息修改</text>
      </view>
    </view>

    <!-- 营业时间展示 -->
    <view class="business-hours">
      <view class="section-title">
        营业时间
        <view class="edit-icon-container">
          <uni-icons
            type="edit"
            size="16"
            color="#bacce0"
            @click="showEditBusinessHoursModal"
            >编辑</uni-icons
          >
        </view>
      </view>
      <view class="time-list">
        <view
          v-for="(time, index) in businessHours"
          :key="index"
          class="time-item"
        >
          <text>{{ time.start }} - {{ time.end }}</text>
        </view>
        <view v-if="businessHours.length === 0" class="no-time">
          <text>暂无营业时间</text>
        </view>
      </view>
    </view>

    <!-- 编辑营业时间弹窗 -->
    <uni-popup ref="editBusinessHoursPopup" type="bottom">
      <view class="edit-business-hours-modal">
        <view class="modal-header">
          <text class="modal-title">编辑营业时间</text>
          <uni-icons
            type="close"
            size="20"
            color="#999"
            @click="closeEditBusinessHoursModal"
          ></uni-icons>
        </view>
        <view class="time-picker-list">
          <view
            v-for="(time, index) in tempBusinessHours"
            :key="index"
            class="time-picker-item"
          >
            <picker mode="time" @change="(e) => setTempStartTime(index, e)">
              <view class="time-picker">
                <text>开始时间：{{ time.start }}</text>
              </view>
            </picker>
            <picker mode="time" @change="(e) => setTempEndTime(index, e)">
              <view class="time-picker">
                <text>结束时间：{{ time.end }}</text>
              </view>
            </picker>
            <uni-icons
              type="trash"
              size="20"
              color="#ff6347"
              @click="removeTempTime(index)"
            ></uni-icons>
          </view>
        </view>
        <view class="btn-row">
          <button class="action-btn add-time-btn" @click="addTempTime">
            添加时间段
          </button>
          <button class="action-btn save-btn" @click="saveBusinessHours">
            保存
          </button>
        </view>
      </view>
    </uni-popup>

    <!-- 功能描述 -->
    <view class="function-description">
      <text class="description-text">请选择上方功能以管理您的商铺</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      shopName: "拼小圈",
      shopAvatar: "/static/merchant_pic.jpg",
      businessHours: [], // 营业时间段
      tempBusinessHours: [], // 临时编辑的营业时间段
      isOpen: true, // 是否营业中
    };
  },
  methods: {
    // 显示头像修改选项
    showAvatarOptions() {
      uni.showActionSheet({
        itemList: ["从相册选择", "拍照"],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.chooseAvatarFromAlbum();
          } else if (res.tapIndex === 1) {
            this.takePhoto();
          }
        },
        fail: (err) => {
          console.error("操作失败:", err);
        },
      });
    },
    // 从相册选择头像
    chooseAvatarFromAlbum() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.shopAvatar = res.tempFilePaths[0];
          this.submitAvatar();
        },
        fail: (err) => {
          console.error("选择头像失败:", err);
        },
      });
    },
    // 拍照上传头像
    takePhoto() {
      uni.chooseImage({
        count: 1,
        sourceType: ["camera"],
        success: (res) => {
          this.shopAvatar = res.tempFilePaths[0];
          this.submitAvatar();
        },
        fail: (err) => {
          console.error("拍照失败:", err);
        },
      });
    },
    // 提交头像修改
    submitAvatar() {
      uni.showModal({
        title: "提示",
        content: "确定要修改头像吗？",
        success: (res) => {
          if (res.confirm) {
            // 这里可以添加上传头像到服务器的逻辑
            uni.showToast({
              title: "头像修改成功",
              icon: "success",
            });
          }
        },
      });
    },
    // 显示昵称修改弹窗
    showNameEditModal() {
      uni.showModal({
        title: "修改店铺名称",
        content: "",
        editable: true,
        placeholderText: "请输入新的店铺名称",
        success: (res) => {
          if (res.confirm && res.content) {
            this.shopName = res.content;
            this.submitName();
          }
        },
      });
    },
    // 提交昵称修改
    submitName() {
      uni.showToast({
        title: "昵称修改成功",
        icon: "success",
      });
    },
    // 显示编辑营业时间弹窗
    showEditBusinessHoursModal() {
      this.tempBusinessHours = JSON.parse(JSON.stringify(this.businessHours)); // 深拷贝当前营业时间
      this.$refs.editBusinessHoursPopup.open();
    },
    // 关闭编辑营业时间弹窗
    closeEditBusinessHoursModal() {
      this.$refs.editBusinessHoursPopup.close();
    },
    // 设置临时开始时间
    setTempStartTime(index, e) {
      this.tempBusinessHours[index].start = e.detail.value;
    },
    // 设置临时结束时间
    setTempEndTime(index, e) {
      this.tempBusinessHours[index].end = e.detail.value;
    },
    // 添加时间段
    addTempTime() {
      this.tempBusinessHours.push({ start: "09:00", end: "18:00" });
    },
    // 删除时间段
    removeTempTime(index) {
      this.tempBusinessHours.splice(index, 1);
    },
    // 检查营业时间段是否合理
    checkTimeRangesValidity() {
      for (let i = 0; i < this.tempBusinessHours.length; i++) {
        const [start1, end1] = this.tempBusinessHours[i].start.split(":"),
          [start2, end2] = this.tempBusinessHours[i].end.split(":");
        const startTime1 = parseInt(start1) * 60 + parseInt(end1);
        const endTime1 = parseInt(start2) * 60 + parseInt(end2);
        if (startTime1 >= endTime1) {
          return false;
        }
        for (let j = i + 1; j < this.tempBusinessHours.length; j++) {
          const [s2, e2] = this.tempBusinessHours[j].start.split(":"),
            [se2, ee2] = this.tempBusinessHours[j].end.split(":"),
            startTime2 = parseInt(s2) * 60 + parseInt(e2),
            endTime2 = parseInt(se2) * 60 + parseInt(ee2);
          if (!(endTime1 < startTime2 || endTime2 < startTime1)) {
            return false;
          }
        }
      }
      return true;
    },
    // 保存营业时间
    saveBusinessHours() {
      if (!this.checkTimeRangesValidity()) {
        uni.showToast({
          title: "营业时间设置有误，请检查是否有重合或不合理的时间段",
          icon: "none",
        });
        return;
      }
      this.businessHours = JSON.parse(JSON.stringify(this.tempBusinessHours)); // 深拷贝临时数据
      this.checkBusinessHours(); // 更新营业状态
      this.closeEditBusinessHoursModal();
      uni.showToast({
        title: "营业时间保存成功",
        icon: "success",
      });
    },
    // 检查是否在营业时间内
    checkBusinessHours() {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      this.isOpen = this.businessHours.some((time) => {
        const start = time.start.split(":");
        const end = time.end.split(":");
        const startTime = parseInt(start[0]) * 60 + parseInt(start[1]);
        const endTime = parseInt(end[0]) * 60 + parseInt(end[1]);
        return currentTime >= startTime && currentTime <= endTime;
      });
    },
    // 导航到指定功能页面
    navigateTo(section) {
      let url = "";
      switch (section) {
        case "manageProducts":
          url = "/pages/product_manage/index";
          break;
        case "publishLottery":
          url = "/pages/publish_lottery/index";
          break;
        case "revenueDetails":
          url = "/pages/revenue_details/index";
          break;
        case "launchLuckying":
          url = "/pages/launch_lucky/index";
          break;
        case "userLucky":
          url = "/pages/userLucky/index";
          break;
        case "personalInfo":
          url = "/pages/editPersonalInfo/index";
          break;
        case "LuckyLists":
          url = "/pages/luckys/index";
          break;
        case "myLucky":
          url = "/pages/myLucky/index";
          break;
        case "merchantInfo":
          url = "/pages/editMerchantInfo/index";
          break;
      }
      uni.navigateTo({
        url: url,
      });
    },
  },
  mounted() {
    this.checkBusinessHours(); // 初始化时检查营业状态
  },
};
</script>

<style scoped>
.merchant-management-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.merchant-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.shop-avatar-container {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.shop-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.shop-info {
  flex: 1;
}

.shop-name-input {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  border: none;
  outline: none;
  width: 100%;
}

.shop-status {
  font-size: 14px;
  color: #4caf50;
  margin-top: 4px;
}

.shop-status.closed {
  color: red;
}

.function-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 33.33%;
  padding: 10px 0;
  box-sizing: border-box;
}

.nav-text {
  font-size: 14px;
  color: #333;
  margin-top: 5px;
  text-align: center;
}

.business-hours {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.edit-icon-container {
  display: inline-flex;
  margin-left: auto;
}

.time-list {
  margin-top: 10px;
}

.time-item {
  font-size: 16px;
  color: #777;
  padding: 10px;
  margin-bottom: 10px;
}

.no-time {
  font-size: 14px;
  color: #999;
  text-align: center;
  padding: 10px;
}

.edit-business-hours-modal {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px 12px 0 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.time-picker-list {
  margin-bottom: 20px;
}

.time-picker-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.time-picker {
  flex: 1;
  font-size: 14px;
  color: #666;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-right: 10px;
}

.btn-row {
  display: flex;
  justify-content: space-around;
}

.action-btn {
  border: none;
  border-radius: 8px;
  padding: 1px;
  text-align: center;
  width: 45%;
  font-size: 30rpx;
}

.add-time-btn {
  background-color: #f7b59a;
  color: #fff;
}

.save-btn {
  background-color: #7bad7c;
  color: #fff;
}

.function-description {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.description-text {
  font-size: 16px;
  color: #666;
}
</style>
