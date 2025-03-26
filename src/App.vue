<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import WebSocket from '@/utils/websocket.js'
import { request } from './utils/request'
import { useTokenStore } from './store/token'

const useToken = useTokenStore()

onLaunch(() => {
  console.log('App Launch')
  login()
})

onShow(() => {
  console.log('App Show')
  /**
   * 1. 获取用户角色
   * 2. 根据角色加载页面
   * 3. 如果用户角色发生变化，重新加载页面
   */
  // 设置tabBar
  tabBarSet()
})
onHide(() => {
  console.log('App Hide')
})


const login = async () => {
  uni.login({
    provider: 'weixin', //使用微信登录
    success: async (res) => {
      try {
        const data = await request(
          {
            method: 'POST',
            url: '/user/wxlogin',
            data: {
              code: res.code
            }
          }
        )
        console.log(data)
        useToken.setToken(data.data)
      } catch (e) {
        console.log("登录失败", e)
      }
    }
  })
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
