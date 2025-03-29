<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="nav_bar" :style="{
      paddingTop: statusBarHeight + 'px',
      'backgroundColor': backgroundColor
    }">
      <view class="nav_bar_inner">
        <view class="nav-icon" @click="onBack()">
          <uni-icons :type="backIcon" :color="backIconColor" size="30"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 顶部区域背景 -->
    <view class="top_area area_height" :style="{
      paddingTop: statusBarHeight + 44 + 'px',
      'background-image': `url(${shopInfo.photo})`
    }" data-type="1">
      <view class="shop-header">
        <image class="shop-avatar" :src="shopInfo.avatar" mode="aspectFill" />
        <view class="shop-details">
          <text class="shop-name">{{ shopInfo.name }}</text>
          <view class="status-tag" :style="{ color: isStoreOpen(shopInfo) ? '#07C160' : '#FF5500' }">
            {{ isStoreOpen(shopInfo) ? '营业中' : '已打烊' }}
          </view>
          <view class="delivery-info">
            <uni-icons type="location" size="24" color="#ff5500" />
            <text class="delivery-text">{{ shopInfo.address }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- tab切换 -->
    <view class="tabs area_height" data-type="2" :style="{ 'top': statusBarHeight + 38 + 'px' }">
      <view class="tab-list">
        <view v-for="(item, index) in tabList" :key="index" class="tab-item" :class="{ active: tabIndex === index }"
          @click="onChangeTab(index)">
          {{ item.name }}
        </view>
      </view>
    </view>

    <!-- 商品管理 -->
    <template v-if="tabIndex === 0">
      <view class="cate_content">
        <!-- 分类导航 -->
        <scroll-view scroll-y="true" :scroll-top="leftScrollTop" class="left"
          :style="{ 'height': scrollHeight + 'px', 'top': stickyTop + 40 + 'px' }">
          <view class="menu_name" :id="'menu_name' + index" :class="{ 'menu_name_active': currentIndex == index }"
            v-for="(item, index) in productList" :key="index" @click="onChangeCate(item, index)">
            {{ item.name }}
          </view>
          <view class="add-category" @click="showAddCategoryDialog">
            <view class="add-box">
              <uni-icons type="plusempty" size="24" color="#ccc" />
              <text>添加分类</text>
            </view>
          </view>
        </scroll-view>

        <!-- 商品列表 -->
        <view class="right">
          <view class="item" v-for="(item, index) in productList" :key="index" :id="'right-item-' + index">
            <view class="title sticky_title" :style="{ 'top': stickyTop + 37 + 'px' }">
              {{ item.name }}
            </view>
            <view class="content">
              <view class="product_item" v-for="(product, pIndex) in item.products" :key="pIndex">
                <image :src="product.image" mode="aspectFill" class="product_img"></image>
                <view class="product_info">
                  <view class="name">{{ product.name }}</view>
                  <view class="price-action">
                    <text class="price">￥{{ product.price }}</text>
                    <view class="action-buttons">
                      <text class="btn edit" @click.stop="editProduct(item, product)">修改</text>
                      <text class="btn delete" @click.stop="deleteProduct(item, product)">删除</text>
                    </view>
                  </view>
                </view>
              </view>
              <!-- 添加商品 -->
              <view class="add-product" @click="showAddProductDialog(item)">
                <view class="add-box">
                  <uni-icons type="plusempty" size="32" color="#ccc" />
                  <text>添加商品</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 拼团管理 -->
    <template v-if="tabIndex === 1">
      <view class="group-list">
        <view class="group-item" v-for="(group, index) in groupList" :key="index">
          <image class="group-banner" :src="group.image" mode="aspectFill" />
          <view class="group-info">
            <text class="title">{{ group.title }}</text>
            <view class="action-buttons">
              <text class="btn edit" @click="editGroup(group)">编辑</text>
              <text class="btn delete" @click="deleteGroup(index)">删除</text>
            </view>
          </view>
        </view>
        <!-- 添加拼团 -->
        <view class="add-group" @click="showAddGroupDialog">
          <view class="add-box">
            <uni-icons type="plusempty" size="48" color="#ccc" />
            <text>发起新拼团</text>
          </view>
        </view>
      </view>
    </template>

    <!-- 添加分类弹窗 -->
    <uni-popup ref="addCategoryPopup" type="dialog">
      <uni-popup-dialog mode="input" title="添加分类" placeholder="请输入分类名称"
        @confirm="confirmAddCategory"></uni-popup-dialog>
    </uni-popup>

    <!-- 添加/编辑商品弹窗 -->
    <uni-popup ref="addProductPopup" type="bottom" background-color="#fff">
      <view class="product-form">
        <view class="form-header">
          <text class="title">{{ isEditProduct ? '修改商品' : '添加商品' }}</text>
          <uni-icons type="close" size="24" @click="$refs.addProductPopup.close()"></uni-icons>
        </view>
        <view class="form-content">
          <view class="form-item">
            <text class="label">商品名称</text>
            <input class="input" v-model="productForm.name" placeholder="请输入商品名称" />
          </view>
          <view class="form-item">
            <text class="label">商品价格</text>
            <input class="input" v-model="productForm.price" type="number" placeholder="请输入商品价格" />
          </view>
          <view class="form-item">
            <text class="label">商品描述</text>
            <textarea class="textarea" v-model="productForm.introduction" placeholder="请输入商品描述"></textarea>
          </view>
          <view class="form-item">
            <text class="label">商品图片</text>
            <view class="upload-wrapper" @click="chooseImage">
              <image v-if="productForm.image" :src="productForm.image" mode="aspectFill" class="product-image"></image>
              <view v-else class="upload-placeholder">
                <uni-icons type="plusempty" size="48" color="#ccc"></uni-icons>
                <text>点击上传图片</text>
              </view>
            </view>
          </view>
          <button class="submit-btn" @click="submitProductForm">确认{{ isEditProduct ? '修改' : '添加' }}</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, computed, onUnmounted } from 'vue'
import { onPageScroll, onLoad } from '@dcloudio/uni-app'
import { request } from '../../utils/request'

const addCategoryPopup = ref(null)
const addProductPopup = ref(null)

const shopInfo = ref({})
const productList = ref([])
const groupList = ref([])
const currentCategory = ref(null)
const isEditProduct = ref(false)
const currentProduct = ref(null)

// 商品表单
const productForm = reactive({
  name: '',
  price: '',
  introduction: '',
  image: '',
  categoryId: '',
  shopId: ''
})

// 响应式数据
const windowHeight = uni.getWindowInfo().windowHeight
const scrollHeight = ref(uni.getWindowInfo().windowHeight)
const statusBarHeight = ref(uni.getWindowInfo().statusBarHeight)
const backgroundColor = ref("rgba(255,255,255,0)")
const backIconColor = ref("#fff")
const backIcon = ref("back")
const allAreaHeight = ref(0)
const currentIndex = ref(0)
const leftScrollTop = ref(0)
const rightItemHeight = ref(0)
const stickyTop = ref(0)
const scrollTop = ref(0)
const tabIndex = ref(0)
const isClick = ref(false)

const tabList = reactive([
  { name: '商品管理' },
  { name: '拼团管理' }
])

const topList = ref([])

onLoad(async (options) => {
  console.log('接收到的参数:', options)
  await fetchShopInfo(options.id)
  await fetchProductDetail(options.id)
  backIcon.value = getCurrentPages().length === 1 ? "home" : "back"
})

onMounted(() => {
  nextTick(() => {
    initLayout()
    getTop()
  })
})

// 初始化布局
const initLayout = () => {
  const query = uni.createSelectorQuery()
  query.selectAll('.area_height').boundingClientRect(data => {
    if (data) {
      allAreaHeight.value = 0
      let addHeight = 0
      for (let i = 0; i < data.length; i++) {
        data[i].dataset.type === '1' ? allAreaHeight.value += data[i].height : addHeight += data[i].height
      }
      scrollHeight.value = windowHeight - allAreaHeight.value + addHeight + 18
    }
  }).exec()

  query.select('.tabs').boundingClientRect(data => {
    if (data) stickyTop.value = statusBarHeight.value + data.height
  }).exec()
}

// 获取右侧分类项位置
const getTop = () => {
  const query = uni.createSelectorQuery()
  query.selectAll('.right .item').boundingClientRect()
  query.exec(res => {
    if (res?.[0]) {
      topList.value = res[0].map(item => ({
        top: item.top,
        bottom: item.bottom,
        height: item.height
      }))
      if (res[0].length > 0) {
        rightItemHeight.value = res[0][0].height
      }
    }
  })
}

const fetchShopInfo = async (id) => {
  try {
    const res = await request({
      url: '/shop/mershopinfo',
      method: 'GET',
    })
    console.log('获取店铺状态详情:', res.data)
    shopInfo.value = res.data
  } catch (error) {
    console.error("获取店铺信息失败", error)
    uni.showToast({ title: '获取店铺信息失败', icon: 'none' })
  }
}

// 获取店铺商品详情并处理分类
const fetchProductDetail = async (id) => {
  try {
    const res = await request({
      url: '/product/merselect',
      method: 'POST',
      data: {
        shopid: id
      }
    })
    console.log('获取店铺商品详情:', res.data)

    // 处理商品数据，按分类分组
    const productsByCategory = {}
    res.data.forEach(product => {
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = {
          name: product.category,
          products: []
        }
      }
      productsByCategory[product.category].products.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        introduction: product.introduction,
        status: product.statusDesc
      })
    })

    // 转换为数组形式
    productList.value = Object.values(productsByCategory)

  } catch (error) {
    console.error("获取商品信息失败", error)
    uni.showToast({ title: '获取商品信息失败', icon: 'none' })
  }
}

// 添加分类
const showAddCategoryDialog = () => {
  addCategoryPopup.value.open()
}

const confirmAddCategory = async (name) => {
  try {
    // 这里应该调用API添加分类，然后更新本地数据
    productList.value.push({
      name: name,
      products: []
    })
    uni.showToast({ title: '添加成功' })
    addCategoryPopup.value.close()
  } catch (error) {
    console.error("添加分类失败", error)
    uni.showToast({ title: '添加分类失败', icon: 'none' })
  }
}

// 商品操作
const showAddProductDialog = (category) => {
  currentCategory.value = category
  isEditProduct.value = false
  resetProductForm()
  addProductPopup.value.open()
}

const editProduct = (category, product) => {
  currentCategory.value = category
  currentProduct.value = product
  isEditProduct.value = true
  productForm.name = product.name
  productForm.price = product.price
  productForm.introduction = product.introduction || ''
  productForm.image = product.image
  addProductPopup.value.open()
}

const resetProductForm = () => {
  productForm.name = ''
  productForm.price = ''
  productForm.introduction = ''
  productForm.image = ''
  currentProduct.value = null
}

const chooseImage = async () => {
  try {
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })
    productForm.image = res.tempFilePaths[0]
  } catch (error) {
    console.error("选择图片失败", error)
  }
}

const submitProductForm = async () => {
  if (!productForm.name || !productForm.price) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  try {
    if (isEditProduct.value) {
      // 更新商品
      await request({
        url: '/product/update',
        method: 'POST',
        data: {
          productId: currentProduct.value.id,
          name: productForm.name,
          price: productForm.price,
          introduction: productForm.introduction,
        }
      })

      // 更新本地数据
      const productIndex = currentCategory.value.products.findIndex(p => p.id === currentProduct.value.id)
      if (productIndex !== -1) {
        currentCategory.value.products[productIndex] = {
          ...currentCategory.value.products[productIndex],
          name: productForm.name,
          price: productForm.price,
          image: productForm.image,
          introduction: productForm.introduction
        }
      }
      uni.showToast({ title: '修改成功' })
    } else {
      // 添加商品
      const uploadRes = await uni.uploadFile({
        url: '/product/add',
        filePath: productForm.image,
        name: 'productphoto',
        formData: {
          name: productForm.name,
          price: productForm.price,
          introduction: productForm.introduction,
          category: currentCategory.value.name,
          shopid: shopInfo.value.id
        }
      });
      console.log(uploadRes);
      // 添加到本地数据
      currentCategory.value.products.push({
        id: uploadRes.data.id,
        name: productForm.name,
        price: productForm.price,
        image: productForm.image,
        introduction: productForm.introduction,
        status: '1'
      })
      uni.showToast({ title: '添加成功' })
    }
    addProductPopup.value.close()
  } catch (error) {
    console.error("操作失败", error)
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const deleteProduct = async (category, product) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除商品【${product.name}】吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({
            url: '/product/delete',
            method: 'POST',
            data: {
              productId: product.id
            }
          })

          // 从本地数据中删除
          category.products = category.products.filter(p => p.id !== product.id)
          uni.showToast({ title: '删除成功' })
        } catch (error) {
          console.error("删除商品失败", error)
          uni.showToast({ title: '删除商品失败', icon: 'none' })
        }
      }
    }
  })
}

// 拼团管理
const showAddGroupDialog = () => {
  uni.navigateTo({
    url: '/pages/edit-group'
  })
}

const editGroup = (group) => {
  uni.navigateTo({
    url: `/pages/edit-group?id=${group.id}`
  })
}

const deleteGroup = (index) => {
  groupList.value.splice(index, 1)
  uni.showToast({ title: '删除成功' })
}

// 页面滚动处理
onPageScroll(({ scrollTop: currentScrollTop }) => {
  scrollTop = currentScrollTop
  updateOpacity(currentScrollTop)

  if (!isClick.value) {
    for (let i = 0; i < topList.value.length; i++) {
      if (currentScrollTop >= topList.value[i].top && currentScrollTop <= topList.value[i].bottom) {
        currentIndex.value = i
        leftScrollTop.value = rightItemHeight.value * i
        break
      }
    }
  }
})

const updateOpacity = (scrollTop) => {
  const opacity = Math.min(scrollTop / 100, 1)
  backgroundColor.value = `rgba(255,255,255,${opacity})`
  backIconColor.value = opacity >= 1 ? "#000" : "#fff"

  uni.setNavigationBarColor({
    frontColor: opacity >= 1 ? "#000000" : "#ffffff",
    backgroundColor: opacity >= 1 ? "#ffffff" : "#000000",
  })
}

// 切换分类
const onChangeCate = async (item, index) => {
  if (currentIndex.value === index) return

  isClick.value = true
  currentIndex.value = index
  leftScrollTop.value = rightItemHeight.value * index

  await nextTick()

  const targetElement = topList.value[index]
  if (targetElement) {
    uni.pageScrollTo({
      scrollTop: targetElement.top - stickyTop.value,
      duration: 300,
      complete: () => {
        setTimeout(() => {
          isClick.value = false
        }, 350)
      }
    })
  }
}

// 切换tab
const onChangeTab = (index) => {
  tabIndex.value = index
}

// 返回
const onBack = () => {
  if (getCurrentPages().length === 1) {
    uni.switchTab({ url: "/pages/index/index" })
  } else {
    uni.navigateBack()
  }
}

// 营业状态判断
const isStoreOpen = (store) => {
  if (!store.openTime || !store.closeTime) return false

  const now = new Date()
  const currentHours = now.getHours()
  const currentMinutes = now.getMinutes()

  const [openHour, openMinute] = store.openTime.split(':').map(Number)
  const [closeHour, closeMinute] = store.closeTime.split(':').map(Number)

  const currentTime = currentHours * 60 + currentMinutes
  const openTime = openHour * 60 + openMinute
  const closeTime = closeHour * 60 + closeMinute

  if (openTime < closeTime) {
    return currentTime >= openTime && currentTime <= closeTime
  } else {
    return currentTime >= openTime || currentTime <= closeTime
  }
}
</script>

<style lang="scss" scoped>
.page {
  background-color: #fff;
  padding-bottom: calc(constant(safe-area-inset-bottom) + 100rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 100rpx);
}

.nav_bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;

  .nav_bar_inner {
    display: flex;
    padding: 20rpx;
    align-items: center;

    .nav-icon {
      width: 44rpx;
      height: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx;
    }
  }
}

.top_area {
  width: 100%;
  height: 500rpx;
  background-color: #f0f0f0;
  transition: background 0.3s ease;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-blend-mode: multiply;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  box-sizing: border-box;

  .shop-header {
    border-radius: 10rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    width: 100%;
    backdrop-filter: blur(20px);
    background: rgba(0, 0, 0, 0.1);
    padding: 40rpx;

    .shop-avatar {
      width: 160rpx;
      height: 160rpx;
      background-color: #999;
      border-radius: 16rpx;
      margin: 0rpx 30rpx;
    }

    .shop-details {
      flex: 1;

      .shop-name {
        font-size: 36rpx;
        font-weight: 600;
        margin-bottom: 20rpx;
        color: #ffffff;
      }

      .status-tag {
        display: inline-block;
        padding: 8rpx 24rpx;
        font-size: 24rpx;
        border-radius: 40rpx;
        margin-bottom: 16rpx;
        background-color: rgba(255, 255, 255, 0.8);
      }

      .delivery-info {
        display: flex;
        align-items: center;
        font-size: 28rpx;
        color: #666;
        margin-top: 10rpx;

        .delivery-text {
          color: #ff5500;
          background-color: #ffffff7c;
          border-radius: 20rpx;
          padding: 0 20rpx;
          margin-left: 10rpx;
        }
      }
    }
  }
}

.tabs {
  position: sticky;
  top: 0;
  height: 100rpx;
  background: #fff;
  border-bottom: 0.0685rem solid #ddd;
  z-index: 1;

  .tab-list {
    display: flex;
    height: 100%;

    .tab-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #666;
      position: relative;
      transition: color 0.2s ease;

      &.active {
        color: #333;
        font-weight: bold;

        &:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 4rpx;
          background: #ff5500;
          border-radius: 2rpx;
          transition: width 0.3s ease, opacity 0.2s ease;
        }
      }

      &:not(.active):after {
        opacity: 0;
        width: 0;
      }
    }
  }
}

.cate_content {
  display: flex;
  flex-direction: row;

  .left {
    position: sticky;
    top: 100rpx;
    width: 200rpx;
    background: #fff;

    .menu_name {
      height: 100rpx;
      line-height: 100rpx;
      text-align: center;
      color: #8d8d8d;
      font-size: 24rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.menu_name_active {
        background: #f5f5f5;
        color: #333;
        border-left: 4px solid #ff5500;
      }
    }

    .add-category {
      height: 100rpx;
      padding: 10rpx 20rpx;

      .add-box {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 2rpx dashed #ccc;
        border-radius: 8rpx;
        color: #ccc;

        text {
          margin-top: 10rpx;
          font-size: 24rpx;
        }
      }
    }
  }

  .right {
    flex: 1;
    min-height: 100rpx;
    background: #f5f5f5;
    padding: 0 20rpx;

    .item {
      border-bottom: 1px solid #eee;
      background: #fff;

      .title {
        position: sticky;
        top: 100rpx;
        height: 60rpx;
        line-height: 60rpx;
        background: #fff;
        padding-left: 20rpx;
        z-index: 1;
      }

      .content {
        .product_item {
          height: 120rpx;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20rpx;
          padding: 0 20rpx;

          .product_img {
            width: 120rpx;
            height: 120rpx;
            border-radius: 6rpx;
          }

          .product_info {
            flex: 1;
            padding-left: 20rpx;

            .name {
              font-size: 28rpx;
              font-weight: 500;
              margin-bottom: 16rpx;
            }

            .price-action {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .price {
                color: #ff5500;
                font-size: 32rpx;
                font-weight: bold;
              }

              .action-buttons {
                display: flex;
                gap: 20rpx;

                .btn {
                  padding: 8rpx 20rpx;
                  border-radius: 10rpx;
                  font-size: 24rpx;

                  &.edit {
                    background: #007aff;
                    color: white;
                  }

                  &.delete {
                    background: #dd524d;
                    color: white;
                  }
                }
              }
            }
          }
        }

        .add-product {
          height: 240rpx;
          padding: 20rpx;

          .add-box {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 2rpx dashed #ccc;
            border-radius: 8rpx;
            color: #ccc;

            text {
              margin-top: 10rpx;
              font-size: 24rpx;
            }
          }
        }
      }
    }
  }
}

.group-list {
  padding: 20rpx;

  .group-item {
    margin-bottom: 20rpx;
    border-radius: 12rpx;
    overflow: hidden;
    background: white;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

    .group-banner {
      width: 100%;
      height: 300rpx;
    }

    .group-info {
      padding: 20rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 28rpx;
        font-weight: bold;
      }

      .action-buttons {
        display: flex;
        gap: 20rpx;

        .btn {
          padding: 8rpx 20rpx;
          border-radius: 10rpx;
          font-size: 24rpx;

          &.edit {
            background: #007aff;
            color: white;
          }

          &.delete {
            background: #dd524d;
            color: white;
          }
        }
      }
    }
  }

  .add-group {
    height: 400rpx;
    padding: 20rpx;

    .add-box {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 2rpx dashed #ccc;
      border-radius: 8rpx;
      color: #ccc;

      text {
        margin-top: 20rpx;
        font-size: 28rpx;
      }
    }
  }
}

.product-form {
  padding: 30rpx;

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
    }
  }

  .form-item {
    margin-bottom: 30rpx;

    .label {
      display: block;
      font-size: 28rpx;
      margin-bottom: 10rpx;
      color: #666;
    }

    .input,
    .textarea {
      width: 100%;
      padding: 20rpx;
      border: 1rpx solid #eee;
      border-radius: 8rpx;
      font-size: 28rpx;
    }

    .textarea {
      height: 200rpx;
    }

    .upload-wrapper {
      width: 200rpx;
      height: 200rpx;
      border: 2rpx dashed #ccc;
      border-radius: 8rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #ccc;

      .product-image {
        width: 100%;
        height: 100%;
        border-radius: 8rpx;
      }

      .upload-placeholder {
        text-align: center;

        text {
          display: block;
          margin-top: 10rpx;
          font-size: 24rpx;
        }
      }
    }
  }

  .submit-btn {
    width: 100%;
    height: 80rpx;
    background: #ff5500;
    color: white;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    margin-top: 40rpx;
  }
}
</style>