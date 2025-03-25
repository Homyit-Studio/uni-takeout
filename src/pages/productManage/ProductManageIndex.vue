<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="nav_bar" :style="{
      paddingTop: statusBarHeight + 'px',
      'backgroundColor': backgroundColor
    }">
      <!-- <view class="state_height"></view> -->
      <view class="nav_bar_inner">
        <view class=" nav-icon" @click="onBack()">
          <uni-icons :type="backIcon" color="#000" size="30"></uni-icons>
        </view>
      </view>
    </view>
    <!-- 顶部区域背景 -->
    <view class="top_area area_height" :style="{ paddingTop: statusBarHeight + 44 + 'px' }" data-type="1">
      <view class="shop-header">
        <!-- 店铺头像 -->
        <image class="shop-avatar" :src="shopInfo.avatar" mode="aspectFill" />

        <view class="shop-details">
          <!-- 店铺名称 -->
          <text class="shop-name">{{ shopInfo.name }}</text>

          <!-- 店铺状态 -->
          <view class="status-tag" :class="shopInfo.status === 'open' ? 'open' : 'closed'">
            {{ shopInfo.statusText }}
          </view>

          <!-- 发货方式 -->
          <view class="delivery-info">
            <uni-icons type="location" size="24" color="#FF5500" />
            <text class="delivery-text">{{ shopInfo.deliveryInfo }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- tab切换 -->
    <view class="tabs area_height" :style="{ 'top': statusBarHeight + 40 + 'px' }">
      <view class="tab-list">
        <view v-for="(item, index) in list4" :key="index" class="tab-item" :class="{ active: tabIndex === index }"
          @click="onChangeTab({ index })">
          {{ item.name }}
        </view>
      </view>
    </view>

    <!-- 商品管理 -->
    <template v-if="tabIndex == 0">
      <view class="cate_content">
        <!-- 分类导航 -->
        <scroll-view scroll-y class="left" :style="{ 'height': scrollHeight + 'px', 'top': stickyTop + 40 + 'px' }">

          <view v-for="(item, index) in productList" :key="index" class="swipe-item"
            @click="showActionMenu(item, index)">
            <view class="menu_name" :class="{ 'menu_name_active': currentIndex == index }">
              {{ item.name }}
            </view>
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
          <view class="item" v-for="(item, index) in productList" :key="index">
            <view class="title sticky_title" :style="{ 'top': stickyTop + 40 + 'px' }">
              {{ item.name }}
            </view>
            <view class="content">
              <view class="product_item" v-for="(cell, cIndex) in item.list" :key="cIndex">
                <image :src="cell.img" mode="aspectFill" class="product_img"></image>
                <view class="product_info">
                  <view class="name">{{ cell.name }}</view>
                  <view class="price-action">
                    <text class="price">￥{{ cell.price }}</text>
                    <view class="action-buttons">
                      <text class="btn edit" @click.stop="editProduct(item, cell)">修改</text>
                      <text class="btn delete" @click.stop="deleteProduct(item, cell)">删除</text>
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
    <template v-if="tabIndex == 1">
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

    <!-- 添加操作菜单 -->
    <uni-popup ref="actionMenu" type="bottom">
      <view class="action-menu">
        <view class="menu-item edit" @click="handleMenuAction('edit')">修改分类</view>
        <view class="menu-item delete" @click="handleMenuAction('delete')">删除分类</view>
        <view class="menu-item cancel" @click="$refs.actionMenu.close()">取消</view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, computed, onUnmounted } from 'vue'
import { onPageScroll } from '@dcloudio/uni-app' // 添加这行

// 商品操作
const deleteProduct = (category, product) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除商品【${product.name}】吗？`,
    success: (res) => {
      if (res.confirm) {
        category.list = category.list.filter(p => p !== product)
      }
    }
  })
}

const editProduct = (category, product) => {
  uni.navigateTo({
    url: '/pages/edit-product?category=' + JSON.stringify(category) + '&product=' + JSON.stringify(product)
  })
}

const deleteCategory = (index) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除分类【${productList.value[index].name}】吗？`,
    success: (res) => {
      if (res.confirm) {
        productList.value.splice(index, 1)
      }
    }
  })
}

// 添加分类
const showAddCategoryDialog = () => {
  uni.showModal({
    title: '添加分类',
    content: '请输入分类名称',
    editable: true,
    success: (res) => {
      if (res.confirm && res.content) {
        productList.value.push({
          name: res.content,
          list: []
        })
      }
    }
  })
}

// 添加商品
const showAddProductDialog = (category) => {
  uni.navigateTo({
    url: '/pages/edit-product?category=' + JSON.stringify(category)
  })
}

// 拼团管理
const deleteGroup = (index) => {
  groupList.value.splice(index, 1)
}

const showAddGroupDialog = () => {
  uni.navigateTo({
    url: '/pages/edit-group'
  })
}


const actionMenu = ref(null)
const selectedCategory = ref(null)
const selectedIndex = ref(-1)

// 显示操作菜单
const showActionMenu = (item, index) => {
  selectedCategory.value = item
  selectedIndex.value = index
  actionMenu.value.open()
}

// 处理菜单操作
const handleMenuAction = (type) => {
  actionMenu.value.close()
  if (!selectedCategory.value) return

  switch (type) {
    case 'edit':
      editCategory(selectedCategory.value)
      break
    case 'delete':
      deleteCategory(selectedIndex.value)
      break
  }
}

// 修改后的分类操作
const editCategory = (category) => {
  uni.showModal({
    title: '修改分类',
    content: '请输入新名称',
    editable: true,
    success: (res) => {
      if (res.confirm && res.content) {
        category.name = res.content
      }
    }
  })
}





// 响应式数据
const windowHeight = uni.getWindowInfo().windowHeight
const scrollHeight = ref(uni.getWindowInfo().windowHeight)
const statusBarHeight = ref(uni.getWindowInfo().statusBarHeight)
const backgroundColor = ref("rgba(255,255,255,0)")
const backIconColor = ref("#000")
const backIcon = ref("back") // 将 "arrow-left" 改为 "back"
const allAreaHeight = ref(0)
const topList = ref([])
const currentIndex = ref(0)
const leftScrollTop = ref(0)
const rightItemHeight = ref(0)
const stickyTop = ref(0)
const tabIndex = ref(0)
const isClick = ref(false)


const shopInfo = ref({
  avatar: '/static/logo.png', // 店铺头像
  name: '绿茶餐厅旗舰店', // 店铺名称
  status: 'open', // 状态：open/ closed
  statusText: '营业中', // 状态文案
  deliveryInfo: '门店自提/同城配送' // 发货方式
});
// 其他响应式数据保持不变
const productList = reactive([{
  name: "中餐",
  id: "1",
  icon: "",
  list: [{
    name: "七味盐黄金豆腐",
    img: "https://qcloud.dpfile.com/pc/wU3rvxK40IRQSH-ME1GftzbPAzUEH2TKcu_Umu2cXIBUnUZhRs1BQ-3fNG1nS2hQ5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 188,
    specs: [
      {
        name: '口味',
        items: [
          { name: '微辣' },
          { name: '中辣' },
          { name: '特辣' }
        ]
      },
      {
        name: '规格',
        items: [
          { name: '小份' },
          { name: '大份' }
        ]
      }
    ]
  },
  {
    name: "龙井凤尾虾仁",
    img: "https://qcloud.dpfile.com/pc/oUbzBcAwYHbcXkxpAKlEs-C8fJQSNvsbJU8yORW5Ev8LwkSAC8kXSFYMi29l17Qs5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 58,
  },
  {
    name: "绿茶饼",
    img: "https://qcloud.dpfile.com/pc/BDNSIx7XBHIm2AZ-68Yq8CsI0vGyA_Bjnzl6bPXAAqciRqcwCz8FTdU3fU3gYaOR5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 18,
  }
  ],
},
{
  name: "西餐",
  id: "2",
  icon: "",
  list: [{
    name: "绿茶烤鸡",
    img: "https://qcloud.dpfile.com/pc/qnYmJT9l5QbBNCNfezzLojGCAHfoE6xmprOQlvoyvpiwK8Lj0colHBWeX6r06i-Y5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 36,
  },
  {
    name: "石锅鸡汤",
    img: "https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 58,
  },
  {
    name: "绿茶葱香",
    img: "https://qcloud.dpfile.com/pc/8To1nn0bLS0Z8UXhWs7d_6_4hgdHYJDB9PY0bTHn51l0M4tvZgWeKDKSXjsROSf95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 48,
  },
  {
    name: "面包诱惑",
    img: "https://qcloud.dpfile.com/pc/S1Yt03ZHevIEbvb3fhAy67V74qWD5ZJURHvRhFUOlP2YaCqE8KEE8D3jXlKeA1a95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 32,

  },
  {
    name: "石锅鸡汤",
    img: "https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 58,
  },
  {
    name: "绿茶葱香",
    img: "https://qcloud.dpfile.com/pc/8To1nn0bLS0Z8UXhWs7d_6_4hgdHYJDB9PY0bTHn51l0M4tvZgWeKDKSXjsROSf95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 48,
  },
  {
    name: "面包诱惑",
    img: "https://qcloud.dpfile.com/pc/S1Yt03ZHevIEbvb3fhAy67V74qWD5ZJURHvRhFUOlP2YaCqE8KEE8D3jXlKeA1a95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 32,

  }
  ],
},
{
  name: "中餐",
  id: "1",
  icon: "",
  list: [{
    name: "七味盐黄金豆腐",
    img: "https://qcloud.dpfile.com/pc/wU3rvxK40IRQSH-ME1GftzbPAzUEH2TKcu_Umu2cXIBUnUZhRs1BQ-3fNG1nS2hQ5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 188,
  },
  {
    name: "龙井凤尾虾仁",
    img: "https://qcloud.dpfile.com/pc/oUbzBcAwYHbcXkxpAKlEs-C8fJQSNvsbJU8yORW5Ev8LwkSAC8kXSFYMi29l17Qs5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 58,
  },
  {
    name: "绿茶饼",
    img: "https://qcloud.dpfile.com/pc/BDNSIx7XBHIm2AZ-68Yq8CsI0vGyA_Bjnzl6bPXAAqciRqcwCz8FTdU3fU3gYaOR5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 18,
  }
  ],
},
{
  name: "西餐",
  id: "2",
  icon: "",
  list: [{
    name: "绿茶烤鸡",
    img: "https://qcloud.dpfile.com/pc/qnYmJT9l5QbBNCNfezzLojGCAHfoE6xmprOQlvoyvpiwK8Lj0colHBWeX6r06i-Y5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 36,
  },
  {
    name: "石锅鸡汤",
    img: "https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 58,
  },
  {
    name: "绿茶葱香",
    img: "https://qcloud.dpfile.com/pc/8To1nn0bLS0Z8UXhWs7d_6_4hgdHYJDB9PY0bTHn51l0M4tvZgWeKDKSXjsROSf95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 48,
  },
  {
    name: "面包诱惑",
    img: "https://qcloud.dpfile.com/pc/S1Yt03ZHevIEbvb3fhAy67V74qWD5ZJURHvRhFUOlP2YaCqE8KEE8D3jXlKeA1a95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 32,

  },
  {
    name: "石锅鸡汤",
    img: "https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 58,
  },
  {
    name: "绿茶葱香",
    img: "https://qcloud.dpfile.com/pc/8To1nn0bLS0Z8UXhWs7d_6_4hgdHYJDB9PY0bTHn51l0M4tvZgWeKDKSXjsROSf95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 48,
  },
  {
    name: "面包诱惑",
    img: "https://qcloud.dpfile.com/pc/S1Yt03ZHevIEbvb3fhAy67V74qWD5ZJURHvRhFUOlP2YaCqE8KEE8D3jXlKeA1a95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 32,

  }
  ],
},
{
  name: "中餐",
  id: "1",
  icon: "",
  list: [{
    name: "七味盐黄金豆腐",
    img: "https://qcloud.dpfile.com/pc/wU3rvxK40IRQSH-ME1GftzbPAzUEH2TKcu_Umu2cXIBUnUZhRs1BQ-3fNG1nS2hQ5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 188,
  },
  {
    name: "龙井凤尾虾仁",
    img: "https://qcloud.dpfile.com/pc/oUbzBcAwYHbcXkxpAKlEs-C8fJQSNvsbJU8yORW5Ev8LwkSAC8kXSFYMi29l17Qs5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 58,
  },
  {
    name: "绿茶饼",
    img: "https://qcloud.dpfile.com/pc/BDNSIx7XBHIm2AZ-68Yq8CsI0vGyA_Bjnzl6bPXAAqciRqcwCz8FTdU3fU3gYaOR5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 18,
  }
  ],
},
{
  name: "西餐",
  id: "2",
  icon: "",
  list: [{
    name: "绿茶烤鸡",
    img: "https://qcloud.dpfile.com/pc/qnYmJT9l5QbBNCNfezzLojGCAHfoE6xmprOQlvoyvpiwK8Lj0colHBWeX6r06i-Y5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 36,
  },
  {
    name: "石锅鸡汤",
    img: "https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 58,
  },
  {
    name: "绿茶葱香",
    img: "https://qcloud.dpfile.com/pc/8To1nn0bLS0Z8UXhWs7d_6_4hgdHYJDB9PY0bTHn51l0M4tvZgWeKDKSXjsROSf95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 48,
  },
  {
    name: "面包诱惑",
    img: "https://qcloud.dpfile.com/pc/S1Yt03ZHevIEbvb3fhAy67V74qWD5ZJURHvRhFUOlP2YaCqE8KEE8D3jXlKeA1a95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 32,

  },
  {
    name: "石锅鸡汤",
    img: "https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 58,
  },
  {
    name: "绿茶葱香",
    img: "https://qcloud.dpfile.com/pc/8To1nn0bLS0Z8UXhWs7d_6_4hgdHYJDB9PY0bTHn51l0M4tvZgWeKDKSXjsROSf95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 48,
  },
  {
    name: "面包诱惑",
    img: "https://qcloud.dpfile.com/pc/S1Yt03ZHevIEbvb3fhAy67V74qWD5ZJURHvRhFUOlP2YaCqE8KEE8D3jXlKeA1a95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 32,

  }
  ],
},
{
  name: "中餐",
  id: "1",
  icon: "",
  list: [{
    name: "七味盐黄金豆腐",
    img: "https://qcloud.dpfile.com/pc/wU3rvxK40IRQSH-ME1GftzbPAzUEH2TKcu_Umu2cXIBUnUZhRs1BQ-3fNG1nS2hQ5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 188,
  },
  {
    name: "龙井凤尾虾仁",
    img: "https://qcloud.dpfile.com/pc/oUbzBcAwYHbcXkxpAKlEs-C8fJQSNvsbJU8yORW5Ev8LwkSAC8kXSFYMi29l17Qs5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 58,
  },
  {
    name: "绿茶饼",
    img: "https://qcloud.dpfile.com/pc/BDNSIx7XBHIm2AZ-68Yq8CsI0vGyA_Bjnzl6bPXAAqciRqcwCz8FTdU3fU3gYaOR5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 18,
  }
  ],
},
{
  name: "西餐",
  id: "2",
  icon: "",
  list: [{
    name: "绿茶烤鸡",
    img: "https://qcloud.dpfile.com/pc/qnYmJT9l5QbBNCNfezzLojGCAHfoE6xmprOQlvoyvpiwK8Lj0colHBWeX6r06i-Y5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 36,
  },
  {
    name: "石锅鸡汤",
    img: "https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 58,
  },
  {
    name: "绿茶葱香",
    img: "https://qcloud.dpfile.com/pc/8To1nn0bLS0Z8UXhWs7d_6_4hgdHYJDB9PY0bTHn51l0M4tvZgWeKDKSXjsROSf95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 48,
  },
  {
    name: "面包诱惑",
    img: "https://qcloud.dpfile.com/pc/S1Yt03ZHevIEbvb3fhAy67V74qWD5ZJURHvRhFUOlP2YaCqE8KEE8D3jXlKeA1a95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 32,

  },
  {
    name: "石锅鸡汤",
    img: "https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 58,
  },
  {
    name: "绿茶葱香",
    img: "https://qcloud.dpfile.com/pc/8To1nn0bLS0Z8UXhWs7d_6_4hgdHYJDB9PY0bTHn51l0M4tvZgWeKDKSXjsROSf95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 48,
  },
  {
    name: "面包诱惑",
    img: "https://qcloud.dpfile.com/pc/S1Yt03ZHevIEbvb3fhAy67V74qWD5ZJURHvRhFUOlP2YaCqE8KEE8D3jXlKeA1a95g_3Oo7Z9EXqcoVvW9arsw.jpg",
    price: 32,

  }
  ],
}])
const list4 = reactive([{
  name: '常售餐饮管理'
},
{
  name: '跟团管理',
}
])
// const lineBg = "data:image/png;base64,..."

// slide-popup ref
const popup = ref(null)

// 新增购物车相关数据
const cartCount = ref(0)
const totalPrice = ref(0)
const deliveryFee = ref(5)
const minDeliveryPrice = ref(20)

// 规格选择相关
const specPopup = ref(null)
const currentProduct = ref({})
const selectedSpecs = ref({})
const specCount = ref(1)

// 添加购买记录数据
const purchaseList = ref([
  {
    avatar: '/static/logo.png',
    name: '张先生',
    product: '七味盐黄金豆腐'
  },
  {
    avatar: '/static/logo.png',
    name: '李小姐',
    product: '龙井凤尾虾仁'
  },
  {
    avatar: '/static/logo.png',
    name: '王女士',
    product: '绿茶饼'
  },
  {
    avatar: '/static/logo.png',
    name: '赵先生',
    product: '绿茶烤鸡'
  },
  {
    avatar: '/static/logo.png',
    name: '陈女士',
    product: '石锅鸡汤'
  }
])

// 滚动位置
const scrollTop = ref(0)

// 自动滚动
let scrollTimer = null
onMounted(() => {
  startScroll()
})

function startScroll() {
  scrollTimer = setInterval(() => {
    scrollTop.value--
    if (Math.abs(scrollTop.value) >= (purchaseList.length * 60)) {
      scrollTop.value = 0
    }
  }, 50)
}

// 组件卸载时清除定时器
onUnmounted(() => {
  if (scrollTimer) {
    clearInterval(scrollTimer)
  }

})

// 页面滚动事件处理
onPageScroll(({ scrollTop }) => {
  let opacity = (scrollTop / 100).toFixed(2)
  backgroundColor.value = "rgba(255,255,255," + (opacity >= 1 ? 1 : opacity) + ")"
  backIconColor.value = opacity >= 1 ? "#000" : "#fff"

  uni.setNavigationBarColor({
    frontColor: opacity >= 1 ? "#000000" : "#ffffff",
    backgroundColor: opacity >= 1 ? "#ffffff" : "#000000",
  })

  if (!isClick.value) {
    scrollTop = parseInt(scrollTop)
    for (let i = 0; i < topList.value.length; i++) {
      if (scrollTop >= topList.value[i].top && scrollTop <= topList.value[i].bottom) {
        currentIndex.value = i
        leftScrollTop.value = rightItemHeight.value * i
        break
      }
    }
  }
})

// 获取右边内容距离顶部的距离
function getTop() {
  const query = uni.createSelectorQuery()
  query.select('.menu_name').boundingClientRect()  // 查询单个元素
  query.selectAll('.item').boundingClientRect()      // 查询多个元素
  query.exec(res => {
    // res[0] 为 .menu_name 元素的节点信息
    if (res && res[0]) {
      // 如果 height 不存在则设置为 0 或其他默认值
      rightItemHeight.value = res[0].height || 0
    } else {
      console.log('未找到 .menu_name 元素或 height 属性不存在')
    }
    // res[1] 为 .item 元素集合的信息数组
    if (res && res[1]) {
      res[1].forEach(item => {
        topList.value.push({
          top: parseInt(item.top - stickyTop.value),
          bottom: parseInt(item.bottom - stickyTop.value)
        })
      })
    } else {
      console.error('未找到 .item 元素集合')
    }
  })
}

// 点击商品分类
function onChangeCate(item, index) {
  if (currentIndex.value == index) return

  isClick.value = true
  currentIndex.value = index
  leftScrollTop.value = rightItemHeight.value * index

  uni.pageScrollTo({
    scrollTop: topList.value[index].top
  })

  setTimeout(() => {
    isClick.value = false
  }, 600)
}


// 切换tab
function onChangeTab(data) {
  tabIndex.value = data.index
}

// 拼团滚动逻辑
const scrollLeft = ref(0)
let scrollInterval = null

onMounted(() => {
  startAutoScroll()
})

function startAutoScroll() {
  scrollInterval = setInterval(() => {
    scrollLeft.value += 2
    if (scrollLeft.value >= purchaseList.value.length * 300) {
      scrollLeft.value = 0
    }
  }, 50)
}

onUnmounted(() => {
  clearInterval(scrollInterval)
})


// 返回上一级
function onBack() {
  if (getCurrentPages().length == 1) {
    uni.switchTab({
      url: "/pages/index/index"
    })
  } else {
    uni.navigateBack()
  }
}


// 计算购物车列表
const cartList = computed(() => {
  const list = []
  productList.forEach(cate => {
    cate.list.forEach(item => {
      if (item.count && item.count > 0) {
        list.push(item)
      }
    })
  })
  return list
})


// 生命周期
onMounted(() => {
  nextTick(() => {
    const query = uni.createSelectorQuery()
    query.selectAll('.area_height').boundingClientRect(data => {
      if (data) {
        allAreaHeight.value = 0
        let addHeight = 0
        for (var i = 0; i < data.length; i++) {
          if (data[i].dataset.type == '1') {
            allAreaHeight.value += data[i].height
          } else {
            addHeight += data[i].height
          }
        }
        // scrollHeight.value = windowHeight - allAreaHeight.value + addHeight + 18
        scrollHeight.value = addHeight * 20
      }
    }).exec()

    query.select('.tabs').boundingClientRect(data => {
      if (data) {
        stickyTop.value = statusBarHeight.value + data.height
      }
    }).exec()

    getTop()
  })

  if (getCurrentPages().length == 1) {
    backIcon.value = "home"
  } else {
    backIcon.value = "back"  // 将 "arrow-left" 改为 "back"
  }
})


</script>

<style lang="scss" scoped>
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

.add-product {
  height: 240rpx;
  padding: 20rpx;
}

.add-category {
  height: 100rpx;
  padding: 10rpx 20rpx;
}

/* 操作按钮样式 */
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

/* 拼团样式 */
.group-list {
  padding: 20rpx;

  .group-item {
    margin-bottom: 20rpx;
    border-radius: 12rpx;
    overflow: hidden;
    background: white;

    .group-banner {
      width: 100%;
      height: 300rpx;
    }

    .group-info {
      padding: 20rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .add-group {
    height: 400rpx;
  }
}


/* 添加操作菜单样式 */
.action-menu {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx 0;

  .menu-item {
    height: 100rpx;
    line-height: 100rpx;
    text-align: center;
    font-size: 32rpx;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 30rpx;
      right: 30rpx;
      bottom: 0;
      height: 1px;
      background: #eee;
    }

    &.edit {
      color: #007aff;
    }

    &.delete {
      color: #dd524d;
    }

    &.cancel {
      color: #666;
      margin-top: 20rpx;

      &::after {
        display: none;
      }
    }
  }
}

/* 调整分类项样式 */
.swipe-item {
  padding: 0 0rpx;

  .menu_name {
    height: 100rpx;
    line-height: 100rpx;
    transition: all 0.2s;

    &:active {
      background: #f5f5f5;
    }
  }
}

.menu_name {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  background: white;
  transition: all 0.3s;
}

view {
  box-sizing: border-box;
}

.state_height {
  height: var(--status-bar-height);
}

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
  z-index: 999;
  // background: rgba(0, 0, 0, 0);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .nav_bar_inner {
    display: flex;
    padding: 20rpx 20rpx;
    align-items: center;
    justify-content: space-between;
  }
}

.top_area {
  height: 400rpx;
  background-color: #fff;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 100rpx;


  .shop-header {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .shop-avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 16rpx;
    margin-right: 30rpx;
  }

  .shop-details {
    flex: 1;
  }

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

    &.open {
      background: #d1ffd8;
      color: #2ac06d;
    }

    &.closed {
      background: #fff1f0;
      color: #ff4d4f;
    }
  }

  .delivery-info {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #666;
  }

  .delivery-text {
    color: #FF5500;
    background-color: #ff550060;
    border-radius: 20rpx;
    padding: 0 20rpx;
    margin-left: 10rpx;
  }
}

.group-entry {
  margin: 20rpx;
  background: #fff9e6;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(255, 153, 0, 0.1);

  .entry-header {
    padding: 24rpx;
    background: linear-gradient(90deg, #fff1da, #ffe8c4);

    .title {
      font-size: 32rpx;
      color: #ff5500;
      font-weight: bold;
      margin-right: 20rpx;
    }

    .subtitle {
      font-size: 26rpx;
      color: #ff9900;
    }
  }

  .group-banner {
    width: 100%;
    height: 240rpx;
    display: block;
  }

  .action-box {
    padding: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff3d9;

    .action-text {
      font-size: 26rpx;
      color: #666;
      margin-right: 10rpx;
    }
  }
}

.tabs {
  position: sticky;
  top: 0;
  height: 100rpx;
  background: #fff;
  box-shadow: 0 3px 10px -4px rgba(0, 0, 0, 0.2);
  z-index: 999;
}

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
        background: #e93323;
        border-radius: 2rpx;
      }
    }
  }
}

// .swiper_wrap {}

.cate_content {
  /* 	position: sticky;
        top: 100rpx; */
  display: flex;
  flex-direction: row;

  .left {
    position: sticky;
    top: 100rpx;
    width: 200rpx;
    background: #fff;
    // border: 1px solid red;

    .menu_name {
      /* 	position: sticky;
                top: 0; */
      height: 100rpx;
      line-height: 100rpx;
      text-align: center;
      color: #8d8d8d;

    }

    .menu_name_active {
      background: #f5f5f5;
      color: #333;
      border-left: 4rpx #ff5500 solid;
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
        z-index: 10;
      }

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
        }
      }
    }
  }
}

.foot {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999; // 修改层级，确保在规格弹窗下方
  min-height: 100rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  box-shadow: 0 -4px 10px -3px rgba(0, 0, 0, 0.2);

  .inner {
    height: 100rpx;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 20rpx;
  }

  .icon_box {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: #f5f5f5;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .cart-left {
    display: flex;
    align-items: center;

    .icon-box {
      position: relative;
      margin-right: 20rpx;

      .badge {
        position: absolute;
        top: -10rpx;
        right: -10rpx;
        min-width: 32rpx;
        height: 32rpx;
        border-radius: 16rpx;
        background: #e93323;
        color: #fff;
        font-size: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6rpx;
      }
    }

    .price-box {
      .total-price {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
      }

      .tip {
        font-size: 22rpx;
        color: #999;
        margin-left: 10rpx;
      }
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

    &.disabled {
      background: #ccc;
    }
  }
}

.cart_list {
  max-height: 60vh;

  .cart-header {
    padding: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid #eee;

    .title {
      font-size: 32rpx;
      font-weight: bold;
    }

    .clear {
      color: #999;
      font-size: 28rpx;
    }
  }

  .cart-content {
    max-height: calc(60vh - 100rpx);
  }

  .cart_item {
    display: flex;
    padding: 20rpx;
    border-bottom: 1rpx solid #eee;

    .cart-img {
      width: 120rpx;
      height: 120rpx;
      border-radius: 6rpx;
    }

    .cart-info {
      flex: 1;
      margin-left: 20rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .name {
        font-size: 28rpx;
      }

      .price-wrap {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .price {
          color: #e93323;
          font-size: 32rpx;
          font-weight: bold;
        }
      }
    }
  }

  .empty-cart {
    padding: 40rpx;
    text-align: center;
    color: #999;
  }
}

/* 替换组件相关样式 */
.nav-icon {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx; // 增加点击区域
}

/* 商品卡片样式优化 */
.product_item {
  margin: 20rpx 0;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;

  .product_img {
    width: 160rpx;
    height: 160rpx;
    border-radius: 8rpx;
  }

  .product_info {
    padding: 16rpx;

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
        color: #e93323;
        font-size: 32rpx;
        font-weight: bold;
      }


    }
  }
}

.action-buttons {
  display: flex;
  align-items: center;

  .count {
    margin: 0 20rpx;
    font-size: 28rpx;
  }
}

.spec-popup {
  position: relative;
  max-height: 75vh;
  z-index: 1001; // 确保在底部配送栏之上
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
  background: #fff;

  .spec-header {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #fff;
    padding: 20rpx;
    display: flex;
    justify-content: space-between;
    border-bottom: 1rpx solid #eee;

    .product-info {
      display: flex;

      .product-img {
        width: 160rpx;
        height: 160rpx;
        border-radius: 8rpx;
      }

      .info {
        margin-left: 20rpx;

        .name {
          font-size: 28rpx;
          font-weight: bold;
        }

        .price {
          color: #e93323;
          font-size: 32rpx;
          margin-top: 10rpx;
        }
      }
    }

    .close {
      font-size: 48rpx;
      color: #999;
      padding: 20rpx;
    }
  }

  .spec-content {
    padding: 20rpx;
    max-height: 50vh;
    overflow-y: auto;

    .spec-group {
      margin-bottom: 30rpx;

      .spec-title {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 20rpx;
      }

      .spec-items {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;

        .spec-item {
          padding: 10rpx 30rpx;
          border-radius: 30rpx;
          background: #f5f5f5;
          font-size: 26rpx;

          &.active {
            background: #e93323;
            color: #fff;
          }
        }
      }
    }
  }

  .spec-footer {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
    background: #fff;
    padding: 20rpx;
    border-top: 1rpx solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .confirm-btn {
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
}

/* 添加popup全局样式覆盖 */
:deep(.uni-popup) {
  z-index: 1001 !important;
}

:deep(.uni-popup__mask) {
  z-index: 1000 !important;
}

:deep(.uni-popup__wrapper) {
  z-index: 1001 !important;
}


/* 参团人员滚动样式 */
.purchase-container {
  margin: 20rpx;
  background: #fff9e6;
  border-radius: 16rpx;
  overflow: hidden;
}

.purchase-scroll {
  width: 100%;
  height: 100rpx;
  white-space: nowrap;

  .scroll-content {
    display: inline-flex;
    align-items: center;
    padding: 0 20rpx;
  }

  .purchase-item {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50rpx;
    padding: 12rpx 24rpx;
    margin-right: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

    .user-avatar {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      margin-right: 16rpx;
    }

    .purchase-text {
      font-size: 26rpx;
      color: #666;
      margin-right: 16rpx;
    }

    .badge {
      background: #ff5500;
      color: white;
      font-size: 20rpx;
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
    }
  }
}
</style>