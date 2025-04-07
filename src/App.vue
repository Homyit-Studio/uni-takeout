<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import WebSocket from '@/utils/websocket.js'
import { request } from './utils/request'
import { useTokenStore } from './store/token'

const useToken = useTokenStore()
let loginPromise = null // 用于存储登录请求的 Promise 对象

onLaunch(async () => {
  console.log('App Launch')
  loginPromise = await new Promise((resolve, reject) => {
    const token = login()
    console.log('登录成功，Token:', token)
  })
})

onShow(async () => {
  console.log('App Show')
  /**
   * 1. 获取用户角色
   * 2. 根据角色加载页面
   * 3. 如果用户角色发生变化，重新加载页面
   */
  // 设置tabBar

  tabBarSet()
  // getOrderInfo()
})
onHide(() => {
  console.log('App Hide')
})
// 登录请求的同步封装
const login = async () => {
  try {
    const loginRes = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      })
    })

    const { code } = loginRes
    const res = await request({
      method: 'POST',
      url: '/user/wxlogin',
      data: { code }
    })
    console.log('登录请求成功', res)
    // console.log(res)
    useToken.setToken(res.data)
    return res.data // 返回登录结果
  } catch (e) {
    console.error("登录失败", e)
    throw e // 抛出错误，便于外部捕获
  }
}
function getOrderInfo() {
  const ws = new WebSocket({
    heartMsg: 'ping', // 心跳消息
    onOpen: () => {
      console.log('连接成功')
    },
    onMessage: (data) => {
      console.log('收到消息:', data)
      // 处理业务消息...
    },
    onClose: () => {
      console.log('连接关闭')
    },
    onError: (err) => {
      console.error('连接错误:', err)
    }
  })
  // 发送消息
  ws.send('Hello Server')
}

// 设置tabBar
function tabBarSet() {
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
    // uni.hideTabBar()
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
}

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
