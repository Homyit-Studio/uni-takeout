<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')

})

onShow(() => {
  console.log('App Show')
  // 第一处：切换角色后重新加载页面
  const data = uni.getStorageSync("userRole")
  if (data === 'admin') {
    // uni.showTabBar()
    uni.setTabBarItem({
      index: 1,
      text: '订单管理',
      iconPath: '/static/tabbar/order.png',
      selectedIconPath: '/static/tabbar/order-active.png',
      visible: false
    })
    uni.setTabBarItem({
      index: 0,
      text: '管理控制台',
      iconPath: '/static/tabbar/home.png',
      selectedIconPath: '/static/tabbar/home-active.png',
      // visible: false
    })
  } else if (data === 'merchant') {
    uni.setTabBarItem({
      index: 1,
      text: '订单管理',
      iconPath: '/static/tabbar/order.png',
      selectedIconPath: '/static/tabbar/order-active.png'
    })
    uni.setTabBarItem({
      index: 0,
      text: '店铺管理',
      iconPath: '/static/tabbar/home.png',
      selectedIconPath: '/static/tabbar/home-active.png',
      // visible: false
    })
  } else {
    uni.setTabBarItem({
      index: 1,
      text: '订单',
      iconPath: '/static/tabbar/order.png',
      selectedIconPath: '/static/tabbar/order-active.png'
    })
    uni.setTabBarItem({
      index: 0,
      text: '首页',
      iconPath: '/static/tabbar/home.png',
      selectedIconPath: '/static/tabbar/home-active.png',
      // visible: false
    })
  }
})
onHide(() => {
  console.log('App Hide')
})

</script>

<style>
/*每个页面公共css */
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-touch-callout: none;
  background-color: #f9f9f9;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
  background-color: transparent;

}
</style>
