<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="nav_bar" :style="{ 'height': statusBarHeight + 'px', 'backgroundColor': backgroundColor }">
      <view class="state_height"></view>
      <view class="nav_bar_inner" :style="{ 'height': statusBarHeight / 2 + 'px' }">
        <u-icon :name="backIcon" :color="backIconColor" size="20" @click="onBack()"></u-icon>
        <view class="">
        </view>
      </view>
    </view>
    <!-- 顶部区域背景 -->
    <view class="top_area area_height" data-type="1">

    </view>
    <!-- tab切换 -->
    <view class="tabs area_height" data-type="2" :style="{ 'top': statusBarHeight + 'px' }">
      <u-tabs :list="list4" lineWidth="20" lineHeight="7" :lineColor="`url(${lineBg}) 100% 100%`" :activeStyle="{
        color: '#303133',
        fontWeight: 'bold',
        transform: 'scale(1.05)'
      }" :inactiveStyle="{
        color: '#606266',
        transform: 'scale(1)'
      }" itemStyle="padding-left: 15px; padding-right: 15px; height: 50px;" @change="onChangeTab">
      </u-tabs>
    </view>

    <template v-if="tabIndex == 0">
      <!-- 广告位置 -->
      <view class="advert_area area_height" data-type="1">
        <view class="img_box">
          <u--image :showLoading="true"
            src="https://qcloud.dpfile.com/pc/wU3rvxK40IRQSH-ME1GftzbPAzUEH2TKcu_Umu2cXIBUnUZhRs1BQ-3fNG1nS2hQ5g_3Oo7Z9EXqcoVvW9arsw.jpg"
            width="100%" height="80px" :radius="10"></u--image>
        </view>
      </view>

      <!-- 菜品区域 -->
      <view class="cate_content">
        <scroll-view scroll-y="true" :scroll-top="leftScrollTop" class="left"
          :style="{ 'height': scrollHeight + 'px', 'top': stickyTop + 'px' }">
          <view class="">
            <view class="menu_name" :id="'menu_name' + index" :class="{ 'menu_name_active': currentIndex == index }"
              v-for="(item, index) in productList" @click="onChangeCate(item, index)" :key="index">
              {{ item.name }}
            </view>
          </view>
        </scroll-view>
        <view class="right">
          <view class="item" v-for="(item, index) in productList" :key="index">
            <view class="title sticky_title" :style="{ 'top': stickyTop + 'px' }">
              {{ item.name }}
            </view>
            <view class="content">
              <view class="product_item" v-for="(cell, cIndex) in item.list" :key="cIndex">
                <image :src="cell.img" mode="aspectFill" class="product_img"></image>
                <view class="prodcut_info">
                  <view class="name">
                    {{ cell.name }}
                  </view>
                  <view class="price">
                    ￥{{ cell.price }}
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 评论 -->
    <view class="" v-if="tabIndex == 1">

    </view>
    <!-- 商家信息 -->
    <view class="" v-if="tabIndex == 2">

    </view>


    <!-- 底部区域 -->
    <view class="foot">
      <view class="inner">
        <view class="icon_box" @click="onShowCart()">
          <u-icon name="shopping-cart" color="#e93323" size="32"></u-icon>
        </view>
        <view class="">
          <u-button text="去结算" type="primary" iconColor="#e93323" shape="circle" :customStyle="{
            width: '120px',
            backgroundColor: '#e93323',
            borderColor: '#e93323'
          }"></u-button>
        </view>
      </view>
    </view>
    <!-- 购物车弹窗 -->
    <slide-popup ref="slide_cart" :showClose="false">
      <view class="cart_list">
        <view class="cart_item" v-for="(item, index) in 20" :key="index">
          {{ index }}
        </view>
      </view>
    </slide-popup>

  </view>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'

// 响应式数据
const windowHeight = uni.getSystemInfoSync().windowHeight
const scrollHeight = ref(uni.getSystemInfoSync().windowHeight)
const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight + 44)
const backgroundColor = ref("rgba(255,255,255,0)")
const backIconColor = ref("#fff")
const backIcon = ref("arrow-left")
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
  name: '点餐'
}, {
  name: '评论',
}, {
  name: '商家',
}])
const lineBg = "data:image/png;base64,..."

// slide-popup ref
const slide_cart = ref(null)

// 页面滚动事件处理
function onPageScroll(e) {
  let opacity = (e.scrollTop / 100).toFixed(2)
  backgroundColor.value = "rgba(255,255,255," + (opacity >= 1 ? 1 : opacity) + ")"
  backIconColor.value = opacity >= 1 ? "#000" : "#fff"

  uni.setNavigationBarColor({
    frontColor: opacity >= 1 ? "#000000" : "#ffffff",
    backgroundColor: opacity >= 1 ? "#ffffff" : "#000000",
  })

  if (!isClick.value) {
    let scrollTop = parseInt(e.scrollTop)
    for (var i = 0; i < topList.value.length; i++) {
      if (scrollTop >= topList.value[i].top && scrollTop <= topList.value[i].bottom) {
        currentIndex.value = i
        leftScrollTop.value = rightItemHeight.value * i
        break
      }
    }
  }
}

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
  slide_cart.value.open()
}

// 切换tab
function onChangeTab(data) {
  tabIndex.value = data.index
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
    backIcon.value = "arrow-left"
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
    padding: 0 20rpx;
    align-items: center;
    justify-content: space-between;
  }
}

.top_area {
  height: 380rpx;
  background-color: #fff;
  background-image: url('https://cdn.uviewui.com/uview/swiper/swiper1.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.advert_area {
  height: 200rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  .img_box {
    width: 94%;
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

        .prodcut_info {
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
  z-index: 1000;
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
}

.cart_list {
  padding-bottom: calc(constant(safe-area-inset-bottom) + 100rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 100rpx);

  .cart_item {
    height: 120rpx;
    border-bottom: 1px solid #eee;
  }
}
</style>