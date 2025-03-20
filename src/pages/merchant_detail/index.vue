<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="nav_bar" :style="{ paddingTop: statusBarHeight + 'px', 'backgroundColor': backgroundColor }">
      <!-- <view class="state_height"></view> -->
      <view class="nav_bar_inner">
        <view class=" nav-icon" @click="onBack()">
          <uni-icons :type="backIcon" :color="backIconColor" size="30"></uni-icons>
        </view>
      </view>
    </view>
    <!-- 顶部区域背景 -->
    <view class="top_area area_height" data-type="1">

    </view>
    <!-- tab切换 -->
    <view class="tabs area_height" data-type="2" :style="{ 'top': statusBarHeight + 40 + 'px' }">
      <!-- 替换u-tabs为自定义tab -->
      <view class="tab-list">
        <view v-for="(item, index) in list4" :key="index" class="tab-item" :class="{ active: tabIndex === index }"
          @click="onChangeTab({ index })">
          {{ item.name }}
        </view>
      </view>
    </view>

    <template v-if="tabIndex == 0">
      <!-- 广告位置 -->
      <view class="advert_area area_height" data-type="1">
        <view class="img_box">
          <image class="store-image" style="width: 100%;" mode="scaleToFill"
            src="https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg">
          </image>
        </view>
      </view>

      <!-- 菜品区域 -->
      <view class="cate_content">
        <scroll-view scroll-y="true" :scroll-top="leftScrollTop" class="left"
          :style="{ 'height': scrollHeight + 'px', 'top': stickyTop + 32 + 'px' }">
          <view class="">
            <view class="menu_name" :id="'menu_name' + index" :class="{ 'menu_name_active': currentIndex == index }"
              v-for="(item, index) in productList" @click="onChangeCate(item, index)" :key="index">
              {{ item.name }}
            </view>
          </view>
        </scroll-view>
        <view class="right">
          <view class="item" v-for="(item, index) in productList" :key="index">
            <view class="title sticky_title" :style="{ 'top': stickyTop + 32 + 'px' }">
              {{ item.name }}
            </view>
            <view class="content">
              <view class="product_item" v-for="(cell, cIndex) in item.list" :key="cIndex">
                <image :src="cell.img" mode="aspectFill" class="product_img"></image>
                <view class="product_info">
                  <view class="name">{{ cell.name }}</view>
                  <view class="price-action">
                    <text class="price">￥{{ cell.price }}</text>
                    <!-- 添加数量控制 -->
                    <view class="action-buttons">
                      <text class="btn minus" @click.stop="decreaseCount(cell)">-</text>
                      <text class="count">{{ cell.count || 0 }}</text>
                      <text class="btn plus" @click.stop="increaseCount(cell)">+</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 评论 -->
    <view class="purchase-scroll">
      <view class="scroll-container">
        <view class="purchase-item" v-for="(item, index) in purchaseList" :key="index">
          <image class="user-avatar" :src="item.avatar" mode="aspectFill"></image>
          <text class="purchase-text">{{ item.name }}刚刚下单了{{ item.product }}</text>
        </view>
      </view>
    </view>
    <view class="" v-if="tabIndex == 1">

    </view>
    <!-- 商家信息 -->
    <view class="" v-if="tabIndex == 2">

    </view>


    <!-- 底部购物车 -->
    <view class="foot">
      <view class="inner">
        <view class="cart-left" @click="onShowCart()">
          <view class="icon-box">
            <uni-icons type="cart" color="#ff5500" size="32" />
            <view class="badge" v-if="cartCount > 0">{{ cartCount }}</view>
          </view>
          <view class="price-box">
            <text class="total-price">￥{{ totalPrice }}</text>
            <text class="tip">另需配送费{{ deliveryFee }}元</text>
          </view>
        </view>
        <view class="submit-btn" :class="{ disabled: totalPrice < minDeliveryPrice }" @click="onSubmit">
          {{ totalPrice < minDeliveryPrice ? `¥${minDeliveryPrice}起送` : '去结算' }} </view>
        </view>
      </view>
      <!-- 购物车弹窗 -->
      <uni-popup ref="popup" type="bottom" background-color="#fff">
        <view class="cart_list">
          <view class="cart-header">
            <text class="title">购物车</text>
            <text class="clear" @click="clearCart">清空购物车</text>
          </view>
          <scroll-view scroll-y class="cart-content">
            <view v-if="cartList.length > 0">
              <view class="cart_item" v-for="(item, index) in cartList" :key="index">
                <image :src="item.img" mode="aspectFill" class="cart-img"></image>
                <view class="cart-info">
                  <text class="name">{{ item.name }}</text>
                  <view class="price-wrap">
                    <text class="price">￥{{ item.price }}</text>
                    <view class="action-buttons">
                      <text class="btn minus" @click.stop="decreaseCount(item)">-</text>
                      <text class="count">{{ item.count }}</text>
                      <text class="btn plus" @click.stop="increaseCount(item)">+</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view v-else class="empty-cart">
              <text>购物车是空的</text>
            </view>
          </scroll-view>
        </view>
      </uni-popup>

      <!-- 规格选择弹窗 -->
      <uni-popup ref="specPopup" type="bottom" background-color="#fff" :mask-click="true" :safe-area="true">
        <view class="spec-popup">
          <view class="spec-header">
            <view class="product-info">
              <image :src="currentProduct.img" mode="aspectFill" class="product-img"></image>
              <view class="info">
                <view class="name">{{ currentProduct.name }}</view>
                <view class="price">￥{{ currentProduct.price }}</view>
              </view>
            </view>
            <view class="close" @click="closeSpecPopup">×</view>
          </view>
          <view class="spec-content">
            <view class="spec-group" v-for="(group, index) in currentProduct.specs" :key="index">
              <view class="spec-title">{{ group.name }}</view>
              <view class="spec-items">
                <view v-for="(item, idx) in group.items" :key="idx"
                  :class="['spec-item', { 'active': selectedSpecs[group.name] === item.name }]"
                  @click="selectSpec(group.name, item.name)">
                  {{ item.name }}
                </view>
              </view>
            </view>
          </view>
          <view class="spec-footer">
            <view class="action-buttons">
              <text class="btn minus" @click.stop="decreaseCount(currentProduct)">-</text>
              <text class="count">{{ specCount }}</text>
              <text class="btn plus" @click.stop="increaseCount(currentProduct)">+</text>
            </view>
            <view class="confirm-btn" @click="confirmSpec">加入购物车</view>
          </view>
        </view>
      </uni-popup>
    </view>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, computed, onUnmounted } from 'vue'
import { onPageScroll } from '@dcloudio/uni-app' // 添加这行

// 响应式数据
const windowHeight = uni.getSystemInfoSync().windowHeight
const scrollHeight = ref(uni.getSystemInfoSync().windowHeight)
const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight)
const backgroundColor = ref("rgba(255,255,255,0)")
const backIconColor = ref("#fff")
const backIcon = ref("back") // 将 "arrow-left" 改为 "back"
const allAreaHeight = ref(0)
const topList = ref([])
const currentIndex = ref(0)
const leftScrollTop = ref(0)
const rightItemHeight = ref(0)
const stickyTop = ref(0)
const tabIndex = ref(0)
const isClick = ref(false)

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
  name: '跟团'
}, {
  name: '跟团详情',
},
  // {
  //   name: '商家',
  // }
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
const purchaseList = reactive([
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
  query.select('.menu_name').boundingClientRect()
    .selectAll('.item').boundingClientRect()
    .exec(data => {
      if (data) {
        rightItemHeight.value = data[0].height
        data[1].map((item) => {
          topList.value.push({
            top: parseInt(item.top - stickyTop.value),
            bottom: parseInt(item.bottom - stickyTop.value),
          })
        })
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

// 显示购物车弹窗
function onShowCart() {
  if (cartCount.value > 0) {
    popup.value.open()
  } else {
    uni.showToast({
      title: '购物车是空的',
      icon: 'none'
    })
  }
}

// 切换tab
function onChangeTab(data) {
  tabIndex.value = data.index
}

// 增减商品数量
function increaseCount(item) {
  if (item.specs && item.specs.length > 0) {
    // 禁用底层滚动
    // document.body.style.overflow = 'hidden'
    currentProduct.value = item
    specCount.value = 1
    selectedSpecs.value = {}
    item.specs.forEach(group => {
      selectedSpecs.value[group.name] = group.items[0].name
    })
    specPopup.value.open()
  } else {
    if (!item.count) item.count = 0
    item.count++
    updateCart()
  }
}

function decreaseCount(item) {
  if (!item.count) return
  item.count--
  updateCart()
}

// 更新购物车
function updateCart() {
  let count = 0
  let price = 0
  productList.forEach(cate => {
    cate.list.forEach(item => {
      if (item.count) {
        count += item.count
        price += item.price * item.count
      }
    })
  })
  cartCount.value = count
  totalPrice.value = price
}

// 提交订单
function onSubmit() {
  if (totalPrice.value < minDeliveryPrice.value) return

  // 保存购物车数据到本地
  const orderData = {
    cartList: cartList.value,
    totalPrice: totalPrice.value,
    deliveryFee: deliveryFee.value
  }
  uni.setStorageSync('orderData', orderData)

  uni.navigateTo({
    url: '/pages/go_shopping/index'
  })
}

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

// 清空购物车
function clearCart() {
  uni.showModal({
    title: '提示',
    content: '确定要清空购物车吗？',
    success: (res) => {
      if (res.confirm) {
        productList.forEach(cate => {
          cate.list.forEach(item => {
            item.count = 0
          })
        })
        updateCart()
        popup.value.close()
      }
    }
  })
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

// 规格选择相关方法
function selectSpec(groupName, itemName) {
  selectedSpecs.value[groupName] = itemName
}

function closeSpecPopup() {
  // 恢复底层滚动
  // document.body.style.overflow = 'auto'
  specPopup.value.close()
}

function confirmSpec() {
  // 生成规格字符串
  const specsStr = Object.values(selectedSpecs.value).join('/')

  // 查找是否已存在相同规格的商品
  const existItem = cartList.value.find(item =>
    item.id === currentProduct.value.id &&
    item.selectedSpecs === specsStr
  )

  if (existItem) {
    existItem.count += specCount.value
  } else {
    // 添加新商品到购物车
    const newItem = {
      ...currentProduct.value,
      count: specCount.value,
      selectedSpecs: specsStr
    }
    currentProduct.value.count = specCount.value
  }

  updateCart()
  closeSpecPopup()
}

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
        scrollHeight.value = windowHeight - allAreaHeight.value + addHeight + 18
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

<style>
page {
  height: auto;
}
</style>
<style lang="scss" scoped>
view {
  box-sizing: border-box;
}

.state_height {
  height: var(--status-bar-height);
}

.page {
  padding-bottom: calc(constant(safe-area-inset-bottom) + 100rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 100rpx);
}

.nav_bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0);
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
  height: 380rpx;
  background-color: #fff;
  background-image: url('https://qcloud.dpfile.com/pc/eK-lcbiSwCMfuurDzas6sDXooZ-820qyij7E-_2Guvl3SQvBEuZcM3cJ5XDTpMvP5g_3Oo7Z9EXqcoVvW9arsw.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.advert_area {
  height: 300rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .img_box {
    width: 100%;
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

  .btn {
    width: 44rpx;
    height: 44rpx;
    border-radius: 50%;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;

    &.minus {
      color: #999;
    }

    &.plus {
      background: #e93323;
      color: #fff;
    }
  }

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

.purchase-scroll {
  height: auto;
  background: rgba(255, 255, 255, 0.9);
  margin: 20rpx;
  border-radius: 30rpx;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

  .scroll-container {
    transition: transform 0.1s linear;
  }

  .purchase-item {
    height: 60rpx;
    display: flex;
    align-items: center;
    padding: 0 20rpx;

    .user-avatar {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      margin-right: 10rpx;
    }

    .purchase-text {
      font-size: 24rpx;
      color: #666;
    }
  }
}
</style>