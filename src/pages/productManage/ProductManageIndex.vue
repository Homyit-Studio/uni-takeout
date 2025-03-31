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
          <view v-for="(item, index) in categoryList" :key="item.id" class="menu_item"
            :class="{ 'menu_item_active': currentCategoryId === item.id }">
            <view class="menu_name" @click="selectCategory(item)">
              {{ item.name }}
            </view>
            <view class="menu_actions">
              <!-- <uni-icons type="compose" size="24" color="#999" @click="showEditCategoryDialog(item)"></uni-icons> -->
              <uni-icons type="trash" size="24" color="#FF5500" @click="showDeleteConfirm(item)"></uni-icons>
            </view>
          </view>

          <!-- 添加分类 -->
          <view class="add-category" @click="showAddCategoryDialog">
            <view class="add-box">
              <uni-icons type="plusempty" size="24" color="#ccc" />
              <text class="text">添加分类</text>
            </view>
          </view>
        </scroll-view>

        <!-- 商品列表 -->
        <view class="right">
          <view class="item" v-for="category in categoryList" :key="category.id">
            <view class="title sticky_title" :style="{ 'top': stickyTop + 35 + 'px' }">
              {{ category.name }}
            </view>
            <view class="content">
              <view class="product_item" v-for="product in category.products" :key="product.id">
                <image :src="product.image" mode="aspectFill" class="product_img"></image>
                <view class="product_info">
                  <view style="display: flex;justify-content: space-between;"> <text class="name">{{ product.name
                      }}</text>
                    <text class="status" :style="{ color: product.status === 1 ? '#07C160' : '#FF5500' }">
                      {{ product.status === 1 ? '上架中' : '已下架' }}
                    </text>
                  </view>
                  <view class="introduction">{{ product.introduction }}</view>
                  <view class="price-action">
                    <text class="price">￥{{ product.price }}</text>
                    <view class="action-buttons">
                      <text class="btn edit" @click="editProduct(category, product)">修改</text>
                      <text class="btn delete" @click="deleteProduct(category, product)">删除</text>
                      <!-- <text class="btn toggle-status" @click.stop="toggleProductStatus(product)"
                        :style="{ backgroundColor: product.status === '1' ? '#FF5500' : '#07C160' }">
                        {{ product.status === '1' ? '下架' : '上架' }}
                      </text> -->
                    </view>
                  </view>
                </view>
              </view>
              <!-- 添加商品 -->
              <view class="add-product" @click="showAddProductDialog(category)">
                <view class="add-box">
                  <uni-icons type="plusempty" size="32" color="#ccc" />
                  <text class="text">添加商品</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 添加分类弹窗 -->
    <uni-popup ref="addCategoryPopup" type="dialog">
      <uni-popup-dialog mode="input" title="添加分类" @confirm="confirmAddCategory"></uni-popup-dialog>
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
          <view class="form-item">
            <text class="label">商品分类</text>
            <picker :range="categoryList" range-key="name" @change="onCategoryChange">
              <view class="picker">{{ productForm.categoryName || '请选择分类' }}</view>
            </picker>
          </view>
          <view class="form-item" v-if="isEditProduct">
            <text class="label">商品状态</text>
            <switch :checked="productForm.status === 1" @change="onStatusChange" color="#07C160" />
            <text class="status-text">{{ productForm.status === 1 ? '上架' : '下架' }}</text>
          </view>
          <button class="submit-btn" @click="submitProductForm">确认{{ isEditProduct ? '修改' : '添加' }}</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { onPageScroll, onLoad } from '@dcloudio/uni-app'
import { request } from '../../utils/request'

const addCategoryPopup = ref(null)
const addProductPopup = ref(null)

// 新增响应式数据
const categoryList = ref([]) // 分类列表
const selectedCategory = ref(null) // 当前选中的分类
const actionPopup = ref(null) // 操作菜单弹窗

const shopInfo = ref({})
const productList = ref([])
const groupList = ref([])
const currentCategoryId = ref(null) // 当前选中的分类ID
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
  categoryName: '',
  shopId: '',
  status: 1 // 默认为上架状态
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
  // { name: '拼团管理' }
])

const topList = ref([])

// 在onLoad中获取分类数据
onLoad(async (options) => {
  console.log('接收到的参数:', options)
  const shopId = await fetchShopInfo()
  await fetchCategories(shopId) // 获取分类
  await fetchProductDetail(shopId)
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

// 选择分类
const selectCategory = (category) => {
  currentCategoryId.value = category.id
  // 这里可以加载该分类下的商品
}

// 显示编辑分类对话框
const showEditCategoryDialog = (category) => {
  uni.showModal({
    title: '修改分类',
    editable: true,
    placeholderText: category.name,
    success: (res) => {
      if (res.confirm && res.content) {
        updateCategory(category.id, res.content)
      }
    }
  })
}

// 显示删除确认
const showDeleteConfirm = (category) => {
  uni.showModal({
    title: '确认删除',
    content: `确定删除分类【${category.name}】吗？`,
    success: (res) => {
      if (res.confirm) {
        deleteCategory(category.id)
      }
    }
  })
}

// 更新分类
// 更新分类
const updateCategory = async (id, newName) => {
  try {
    uni.showLoading({ title: "更新中..." });

    // 1. 获取旧分类名称
    const category = categoryList.value.find(c => c.id === id);
    if (!category) {
      uni.showToast({ title: '分类不存在', icon: 'none' });
      return;
    }
    const oldName = category.name;

    // 2. 更新分类名称到后端
    await request({
      url: '/category/update',
      method: 'POST',
      data: {
        id,
        name: newName,
        shopid: shopInfo.value.id
      }
    });

    // 3. 更新本地分类名称
    category.name = newName;

    // 4. 批量更新商品分类
    // if (category.products && category.products.length > 0) {
    //   await batchUpdateProductsCategory(category.products, newName);
    // }

    // 5. 刷新数据
    await fetchProductDetail(shopInfo.value.id);

    uni.hideLoading();
    uni.showToast({ title: '分类更新成功' });
  } catch (error) {
    console.error("更新分类失败", error);
    uni.showToast({ title: '更新分类失败', icon: 'none' });
  }
};
const batchUpdateProductsCategory = async (products, newCategoryName) => {
  try {
    for (const product of products) {
      const formData = {
        productId: product.id,
        name: product.name,
        price: product.price,
        introduction: product.introduction,
        image: product.image,
        category: newCategoryName,
        status: product.status,
        shopid: shopInfo.value.id
      }
      await request({
        url: '/product/update',
        method: 'POST',
        data: formData
      });
    }
  } catch (error) {
    console.error("更新商品分类失败", error);
    throw error;
  }
};

// 删除分类
const deleteCategory = async (id) => {
  try {
    await request({
      url: `/category/delete/${id}`,
      method: 'POST'
    })

    // 更新本地数据
    categoryList.value = categoryList.value.filter(c => c.id !== id)

    // 如果删除的是当前选中的分类，清空选中状态
    if (currentCategoryId.value === id) {
      currentCategoryId.value = null
    }

    uni.showToast({ title: '删除成功' })
  } catch (error) {
    console.error("删除分类失败", error)
    uni.showToast({ title: '删除分类失败', icon: 'none' })
  }
}

const fetchShopInfo = async () => {
  try {
    const res = await request({
      url: '/shop/mershopinfo',
      method: 'GET',
    })
    console.log('获取店铺状态详情:', res.data)
    shopInfo.value = res.data
    return res.data.id
  } catch (error) {
    console.error("获取店铺信息失败", error)
    uni.showToast({ title: '获取店铺信息失败', icon: 'none' })
  }
}

// 获取店铺商品详情并处理分类
const fetchProductDetail = async (shopId) => {
  try {
    // 先获取分类列表
    await fetchCategories(shopId);

    // 获取商品数据
    const res = await request({
      url: '/product/merselect',
      method: 'POST',
      data: {
        shopid: shopId
      }
    });
    console.log('获取商品详情:', res.data);
    // 将商品数据整合到对应的分类中
    categoryList.value = categoryList.value.map(category => {
      // 过滤出属于当前分类的商品
      const categoryProducts = res.data.filter(product =>
        product.category === category.name
      ).map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        introduction: product.introduction,
        status: product.statusDesc === '上架' ? 1 : 0
      }));

      // 返回带有商品数据的分类对象
      return {
        ...category,
        products: categoryProducts
      };
    });

    // 更新商品列表显示
    productList.value = categoryList.value.map(category => ({
      id: category.id,
      name: category.name,
      products: category.products
    }));

  } catch (error) {
    console.error("获取商品信息失败", error);
    uni.showToast({ title: '获取商品信息失败', icon: 'none' });
  }
};// 添加分类
const showAddCategoryDialog = () => {
  addCategoryPopup.value.open()
}

// 获取分类列表
const fetchCategories = async (shopId) => {
  try {
    const res = await request({
      url: `/category/get/${shopId}`,
      method: 'GET'
    })
    categoryList.value = res.data
  } catch (error) {
    console.error("获取分类失败", error)
    uni.showToast({ title: '获取分类失败', icon: 'none' })
  }
}

// 修改添加分类逻辑
const confirmAddCategory = async (name) => {
  try {
    await request({
      url: '/category/add',
      method: 'POST',
      data: {
        name,
        shopid: shopInfo.value.id
      }
    })
    await fetchProductDetail(shopInfo.value.id)
    uni.showToast({ title: '添加成功' })
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
  productForm.categoryId = category.id
  productForm.categoryName = category.name
  productForm.shopId = shopInfo.value.id
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
  productForm.categoryId = category.id
  productForm.categoryName = category.name
  productForm.status = product.status
  productForm.shopId = shopInfo.value.id
  addProductPopup.value.open()
}

const resetProductForm = () => {
  productForm.name = ''
  productForm.price = ''
  productForm.introduction = ''
  productForm.image = ''
  productForm.categoryId = ''
  productForm.categoryName = ''
  productForm.status = 1
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

const onCategoryChange = (e) => {
  const index = e.detail.value
  productForm.categoryId = categoryList.value[index].id
  productForm.categoryName = categoryList.value[index].name
}

const onStatusChange = (e) => {
  productForm.status = e.detail.value ? 1 : 0
}

const submitProductForm = async () => {
  // 表单校验
  if (!productForm.name || !productForm.price || !productForm.categoryName) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
    return;
  }

  // 验证分类有效性
  const categoryExists = categoryList.value.some(c => c.name === productForm.categoryName);
  if (!categoryExists) {
    uni.showToast({ title: '分类不存在，请重新选择', icon: 'none' });
    return;
  }

  try {
    // 处理图片路径（如果是网络地址需要下载到本地）
    let imagePath = productForm.image;
    if (isEditProduct.value && productForm.image === currentProduct.value?.image) {
      if (productForm.image.startsWith('http')) {
        const { tempFilePath } = await uni.downloadFile({ url: productForm.image });
        imagePath = tempFilePath;
      }
    }

    // 构建请求参数
    const formData = {
      name: productForm.name,
      price: productForm.price,
      introduction: productForm.introduction,
      category: productForm.categoryName,
      shopid: shopInfo.value.id,
      status: productForm.status
    };

    // 添加编辑特定参数
    if (isEditProduct.value) {
      formData.productId = currentProduct.value.id;
    }

    // 执行上传请求
    await uni.uploadFile({
      url: isEditProduct.value ? '/product/update' : '/product/add',
      filePath: imagePath,
      name: 'productphoto',
      formData: formData
    });

    // 刷新数据
    await fetchProductDetail(shopInfo.value.id);
    uni.showToast({ title: `${isEditProduct.value ? '修改' : '添加'}成功` });
    addProductPopup.value.close();
  } catch (error) {
    console.error('操作失败', error);
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
};

const deleteProduct = async (category, product) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除商品${product.name}吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({
            url: '/product/delete',
            method: 'POST',
            data: {
              "id": product.id
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
  background-color: #f8f9fa;
  padding-bottom: calc(constant(safe-area-inset-bottom) + 100rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 100rpx);
}

.nav_bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.9);
  // backdrop-filter: blur(10px);
  // box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

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
      padding: 0 20rpx;
      cursor: pointer;
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
    border-radius: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    width: 90%;
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.8);
    padding: 40rpx;

    .shop-avatar {
      width: 160rpx;
      height: 160rpx;
      background-color: #999;
      border-radius: 16rpx;
      margin-right: 30rpx;
    }

    .shop-details {
      flex: 1;

      .shop-name {
        font-size: 36rpx;
        font-weight: 600;
        margin-bottom: 20rpx;
        color: #333;
      }

      .status-tag {
        display: inline-block;
        padding: 8rpx 24rpx;
        font-size: 24rpx;
        border-radius: 40rpx;
        margin-bottom: 16rpx;
        background-color: rgba(0, 0, 0, 0.1);
      }

      .delivery-info {
        display: flex;
        align-items: center;
        font-size: 28rpx;
        color: #666;

        .delivery-text {
          color: #ff5500;
          background-color: rgba(255, 255, 255, 0.8);
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
  border-bottom: 1rpx solid #ddd;
  z-index: 999;

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
  background-color: #fff;

  .left {
    position: sticky;
    top: 100rpx;
    width: 200rpx;
    background: #fff;
    border-right: 1rpx solid #eee;

    .menu_name {
      height: 100rpx;
      line-height: 100rpx;
      text-align: center;
      color: #8d8d8d;
      font-size: 24rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: background-color 0.2s ease;

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
        transition: border-color 0.2s ease;

        &:hover {
          border-color: #ff5500;
        }

        .text {
          margin-top: 10rpx;
          font-size: 24rpx;
        }
      }
    }

    .menu_item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100rpx;
      padding: 0 20rpx;
      border-bottom: 1rpx solid #f5f5f5;
      transition: background-color 0.2s ease;

      &.menu_item_active {
        background: #f5f5f5;
        border-left: 4px solid #ff5500;
      }

      .menu_name {
        flex: 1;
        color: #8d8d8d;
        font-size: 24rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .menu_actions {
        display: flex;
        gap: 20rpx;

        .uni-icons {
          cursor: pointer;
          transition: color 0.2s ease;

          &:hover {
            color: #ff5500;
          }
        }
      }
    }
  }

  .right {
    flex: 1;
    min-height: 100rpx;
    background: #f8f9fa;
    padding: 20rpx;

    .item {
      border-radius: 12rpx;
      background: #fff;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

      .title {
        position: sticky;
        top: 100rpx;
        height: 60rpx;
        line-height: 60rpx;
        background: #fff;
        padding-left: 20rpx;
        z-index: 1;
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }

      .content {
        .product_item {
          display: flex;
          align-items: center;
          padding: 20rpx;
          border-bottom: 1rpx solid #eee;

          .product_img {
            width: 120rpx;
            height: 120rpx;
            border-radius: 8rpx;
            margin-right: 20rpx;
          }

          .product_info {
            flex: 1;

            .name {
              font-size: 28rpx;
              font-weight: 500;
              margin-bottom: 10rpx;
              color: #333;
            }

            .status {
              font-size: 24rpx;
              margin-bottom: 8rpx;
            }

            .introduction {
              font-size: 24rpx;
              color: #666;
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
                gap: 10rpx;

                .btn {
                  z-index: 1;
                  padding: 8rpx 20rpx;
                  border-radius: 10rpx;
                  font-size: 24rpx;
                  color: white;
                  cursor: pointer;
                  transition: opacity 0.2s ease;

                  &.edit {
                    background: #0084ff;
                  }

                  &.delete {
                    background: #FF5500;
                  }

                  &:hover {
                    opacity: 0.8;
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
            transition: border-color 0.2s ease;

            &:hover {
              border-color: #ff5500;
            }

            .text {
              margin-top: 10rpx;
              font-size: 24rpx;
            }
          }
        }
      }
    }
  }
}

.product-form {
  padding: 30rpx;
  background-color: #fff;

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .uni-icons {
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #ff5500;
      }
    }
  }

  .form-content {
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
        background-color: #f8f9fa;
        transition: border-color 0.2s ease;

        &:focus {
          border-color: #ff5500;
        }
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
        transition: border-color 0.2s ease;

        &:hover {
          border-color: #ff5500;
        }

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
      cursor: pointer;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>