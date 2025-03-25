<template>
  <view class="swiper-manager">
    <!-- 顶部标题栏 -->
    <view class="header">
      <text class="title">轮播图管理</text>
      <view class="add-btn" @click="showAddDialog">
        <uni-icons type="plusempty" size="24" color="#fff"></uni-icons>
        <text>新增轮播</text>
      </view>
    </view>

    <!-- 轮播图列表 -->
    <scroll-view class="swiper-list" scroll-y>
      <view class="empty-tip" v-if="swiperList.length === 0">
        <image src="/static/empty.png" mode="aspectFit"></image>
        <text>暂无轮播图，点击上方按钮添加</text>
      </view>

      <view class="swiper-card" v-for="(item, index) in swiperList" :key="item.id">
        <image class="swiper-image" :src="item.image" mode="aspectFill" @click="previewImage(item.image)"></image>
        <view class="card-footer">
          <text class="swiper-id">{{ item.shopName }}</text>
          <view class="action-btns">
            <button class="btn change" @click.stop="changeImage(index)">
              更换
            </button>
            <button class="btn delete" @click.stop="deleteSwiper(index)">
              删除
            </button>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 新增轮播图对话框 -->
    <uni-popup ref="addDialog" type="dialog">
      <uni-popup-dialog 
        mode="input" 
        title="新增轮播图"
        @confirm="confirmAdd"
        @close="closeAddDialog"
      >
        <view class="add-dialog-content">
          <view class="input-group">
            <text class="input-label">店铺名称</text>
            <input v-model="newShopName" type="text" placeholder="请输入店铺名称" class="input-field">
          </view>
          <view class="input-group">
            <text class="input-label">选择图片</text>
            <button class="choose-image-btn" @click="chooseImageForAdd">
              <text v-if="!newImagePath">选择图片</text>
              <image v-if="newImagePath" :src="newImagePath" class="preview-image" mode="aspectFill"></image>
            </button>
          </view>
        </view>
       </uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 模拟数据
      swiperList: [
        { id: 1, shopName: '粥铺', image: '/static/banner2.png' },
        { id: 2, shopName: '粥铺', image: '/static/banner3.png' }
      ],
      newShopName: '',
      newImagePath: '',
      nextId: 3
    }
  },
  methods: {
    // 显示新增对话框
    showAddDialog() {
      this.newShopName = '';
      this.newImagePath = '';
      this.$refs.addDialog.open();
    },
    
    // 关闭新增对话框
    closeAddDialog() {
      this.$refs.addDialog.close();
    },
    
    // 选择图片用于新增
    chooseImageForAdd() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.newImagePath = res.tempFilePaths[0];
        },
        fail: (err) => {
          console.error('选择图片失败', err);
          uni.showToast({ title: '选择图片失败', icon: 'none' });
        }
      });
    },
    
    // 确认新增
    async confirmAdd() {
      // 验证输入
      if (!this.newShopName.trim()) {
        uni.showToast({ title: '请输入店铺名称', icon: 'none' });
        return;
      }
      
      if (!this.newImagePath) {
        uni.showToast({ title: '请选择图片', icon: 'none' });
        return;
      }
      
      try {
        uni.showLoading({ title: '添加中...', mask: true });
        
        // 模拟上传过程
        await this.delay(1000);
        
        // 创建新轮播图对象
        const newItem = {
          id: this.nextId++,
          shopName: this.newShopName,
          image: this.newImagePath
        };
        
        // 添加到列表
        this.swiperList.unshift(newItem);
        
        // 关闭对话框
        this.$refs.addDialog.close();
        uni.hideLoading();
        uni.showToast({ title: '添加成功', icon: 'success' });
        
      } catch (error) {
        uni.hideLoading();
        uni.showToast({ title: '添加失败', icon: 'none' });
      }
    },
    
    // 更换图片
    async changeImage(index) {
      try {
        const [res] = await this.chooseImage();
        
        uni.showLoading({ title: '更新中...', mask: true });
        await this.delay(800);
        
        this.swiperList[index].image = res.tempFilePaths[0];
        uni.hideLoading();
        uni.showToast({ title: '更新成功', icon: 'success' });
        
      } catch (error) {
        uni.hideLoading();
        if (error !== 'cancel') {
          uni.showToast({ title: '更新失败', icon: 'none' });
        }
      }
    },
    
    // 删除轮播图
    async deleteSwiper(index) {
      try {
        const confirm = await new Promise((resolve) => {
          uni.showModal({
            title: '提示',
            content: '确定要删除这个轮播图吗？',
            success: (res) => {
              resolve(res.confirm);
            }
          });
        });
        
        if (!confirm) return;
        
        uni.showLoading({ title: '删除中...', mask: true });
        await this.delay(500);
        
        this.swiperList.splice(index, 1);
        uni.hideLoading();
        uni.showToast({ title: '删除成功', icon: 'success' });
        
      } catch (error) {
        uni.hideLoading();
        uni.showToast({ title: '删除失败', icon: 'none' });
      }
    },
    
    // 预览图片
    previewImage(url) {
      uni.previewImage({
        urls: this.swiperList.map(item => item.image),
        current: url
      });
    },
    
    // 辅助方法
    chooseImage() {
      return new Promise((resolve, reject) => {
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: resolve,
          fail: reject
        });
      });
    },
    
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
}
</script>

<style lang="scss" scoped>
.swiper-manager {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f5f7fa;
}

.header {
    padding: 20rpx 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

   .title {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
    }

   .add-btn {
        display: flex;
        align-items: center;
        padding: 10rpx 20rpx;
        background-color: #2979ff;
        color: #fff;
        border-radius: 50rpx;
        font-size: 26rpx;

        text {
            margin-left: 8rpx;
        }
    }
}

.swiper-list {
    flex: 1;
    padding: 20rpx;
    box-sizing: border-box;

   .empty-tip {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 60vh;

        image {
            width: 300rpx;
            height: 300rpx;
            opacity: 0.6;
        }

        text {
            margin-top: 20rpx;
            color: #999;
            font-size: 28rpx;
        }
    }
}

.swiper-card {
    background-color: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

   .swiper-image {
        width: 100%;
        height: 320rpx;
        display: block;
    }

   .card-footer {
        padding: 20rpx;
        display: flex;
        justify-content: space-between;
        align-items: center;

       .swiper-id {
            font-size: 26rpx;
            color: #999;
        }

       .action-btns {
            display: flex;

           .btn {
                display: flex;
                align-items: center;
                padding: 8rpx 20rpx;
                margin-left: 16rpx;
                border-radius: 20rpx;
                font-size: 26rpx;

                &.change {
                    background-color: #2979ff;
                    color: #fff;
                }

                &.delete {
                    background-color: #ff4d4f;
                    color: #fff;
                }
            }
        }
    }
}

/* 新增对话框样式 */
.add-dialog-content {
  padding: 30rpx;
  
  .input-group {
    margin-bottom: 30rpx;
    
    .input-label {
      display: block;
      margin-bottom: 10rpx;
      font-size: 28rpx;
      color: #333;
    }
    
    .input-field {
      width: 100%;
      padding: 20rpx;
      border: 1rpx solid #ddd;
      border-radius: 8rpx;
      font-size: 28rpx;
    }
    
    .choose-image-btn {
      width: 100%;
      padding: 0;
      background: none;
      border: 1rpx dashed #ddd;
      border-radius: 8rpx;
      overflow: hidden;
      
      text {
        display: block;
        padding: 40rpx 0;
        text-align: center;
        color: #999;
      }
      
      .preview-image {
        width: 100%;
        height: 200rpx;
        display: block;
      }
    }
  }
  
  .confirm-btns {
    display: flex;
    margin-top: 40rpx;
    
    button {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 28rpx;
      border-radius: 8rpx;
      
      &.cancel-btn {
        margin-right: 20rpx;
        background-color: #f5f5f5;
        color: #666;
      }
      
      &.confirm-btn {
        background-color: #2979ff;
        color: white;
      }
    }
  }
}
/* 响应式调整 */
@media (min-width: 768px) {
   .swiper-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(360rpx, 1fr));
        gap: 24rpx;
    }

   .swiper-card {
        margin-bottom: 0;
    }
}
</style>