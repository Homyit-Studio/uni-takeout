<template>
  <view class="container">
    <!-- 商品列表 -->
    <view class="goods-list">
      <view v-for="(item, index) in goodsList" :key="index" class="goods-item">
        <image :src="item.image" class="goods-image" mode="aspectFill"></image>
        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <text class="goods-specs">{{ item.specs }}</text>
          <text class="goods-price">￥{{ item.price }}</text>
        </view>
        <view class="goods-actions">
          <button class="action-button" @click="editGood(index)">编辑</button>
          <button class="action-button delete-button" @click="confirmDelete(index)">删除</button>
        </view>
      </view>
    </view>

    <!-- 添加商品按钮 -->
    <view class="add-button">
      <button class="primary-button" @click="addGood">+ 添加商品</button>
    </view>

    <!-- 编辑/添加商品弹窗 -->
    <uni-popup ref="popup" type="dialog">
      <view class="popup-content">
        <view class="form-item">
          <label>商品图片</label>
          <input v-model="currentGood.image" placeholder="请输入图片URL" />
        </view>
        <view class="form-item">
          <label>商品名称</label>
          <input v-model="currentGood.name" placeholder="请输入商品名称" />
        </view>
        <view class="form-item">
          <label>商品规格</label>
          <input v-model="currentGood.specs" placeholder="请输入规格" />
        </view>
        <view class="form-item">
          <label>商品价格</label>
          <input v-model="currentGood.price" type="number" placeholder="请输入价格" />
        </view>
        <view class="form-buttons">
          <button class="cancel-button" @click="closePopup">取消</button>
          <button class="confirm-button" @click="saveGood">保存</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      goodsList: [
        {
          image: "https://via.placeholder.com/150",
          name: "商品1",
          specs: "规格1",
          price: 100,
        },
        {
          image: "https://via.placeholder.com/150",
          name: "商品2",
          specs: "规格2",
          price: 200,
        },
      ], // 商品列表
      currentGood: {
        image: "",
        name: "",
        specs: "",
        price: "",
      }, // 当前编辑的商品
      editIndex: -1, // 当前编辑的商品索引，-1表示新增
    };
  },
  methods: {
    // 打开弹窗（编辑或新增）
    openPopup(index = -1) {
      if (index !== -1) {
        this.currentGood = { ...this.goodsList[index] }; // 编辑时复制商品信息
        this.editIndex = index;
      } else {
        this.currentGood = { image: "", name: "", specs: "", price: "" }; // 新增时清空
        this.editIndex = -1;
      }
      this.$refs.popup.open();
    },
    // 关闭弹窗
    closePopup() {
      this.$refs.popup.close();
    },
    // 保存商品
    saveGood() {
      if (this.editIndex !== -1) {
        // 编辑商品
        this.goodsList.splice(this.editIndex, 1, { ...this.currentGood });
      } else {
        // 新增商品
        this.goodsList.push({ ...this.currentGood });
      }
      this.closePopup();
    },
    // 添加商品
    addGood() {
      this.openPopup();
    },
    // 编辑商品
    editGood(index) {
      this.openPopup(index);
    },
    // 确认删除商品
    confirmDelete(index) {
      uni.showModal({
        title: "提示",
        content: "确定删除该商品吗？",
        success: (res) => {
          if (res.confirm) {
            this.goodsList.splice(index, 1);
          }
        },
      });
    },
  },
};
</script>

<style lang="scss">
.container {
  padding: 20rpx;
}

.goods-list {
  margin-bottom: 100rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.goods-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.goods-name {
  font-size: 28rpx;
  font-weight: bold;
}

.goods-specs {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
}

.goods-price {
  font-size: 28rpx;
  color: #e64340;
  margin-top: 10rpx;
}

.goods-actions {
  display: flex;
  align-items: center;
}

.action-button {
  margin-left: 20rpx;
  font-size: 24rpx;
  padding: 10rpx 20rpx;
}

.delete-button {
  background-color: #e64340;
  color: #fff;
}

.add-button {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  text-align: center;
}

.primary-button {
  background-color: #007aff;
  color: #fff;
  width: 80%;
}

.popup-content {
  padding: 40rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-item label {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.form-item input {
  border: 1rpx solid #ccc;
  border-radius: 10rpx;
  padding: 10rpx;
  font-size: 28rpx;
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
}

.confirm-button {
  background-color: #007aff;
  color: #fff;
  flex: 1;
}
</style>