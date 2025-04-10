<template>
    <div class="loading-container">
        <div class="loading-bars">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
        <p class="loading-text">加载中...</p>
    </div>
</template>


<script setup>
import { onShow } from '@dcloudio/uni-app'
import WebSocket from '@/utils/websocket.js'
import { request } from '@/utils/request'
import { useTokenStore } from '@/store/token'

const useToken = useTokenStore()

onShow(async () => {
    try {
        await login()
        const userInfo = await getUserInfo()
        if (userInfo.role === 'merchant') {
            const shopInfo = await getShopInfo()
            await initWebSocket(shopInfo.id)
        }
        // 传递用户信息到index页面
        await navigateBack(userInfo)
    } catch (error) {
        console.error('启动流程出错：', error)
        uni.showToast({
            title: '启动失败，请重试',
            icon: 'none',
            duration: 2000
        })
    }
})

// 获取商铺信息
const getShopInfo = async () => {
    try {
        const res = await request({
            url: '/shop/mershopinfo',
            method: 'GET'
        })
        if (res.code === 200) {
            return res.data
        } else {
            throw new Error('获取商铺信息失败')
        }
    } catch (error) {
        console.error('获取商铺信息失败：', error)
        throw error
    }
}

// 修改WebSocket初始化函数，添加shopId参数
const initWebSocket = (shopId) => {
    return new Promise((resolve) => {
        const ws = new WebSocket({
            url: `wss://homyit2023.online/sell/ws/${shopId}`,
            heartMsg: 'ping',
            onOpen: () => {
                console.log('WebSocket连接成功')
                resolve()
            },
            onMessage: (data) => {
                console.log('收到消息:', data)
            },
            onClose: () => {
                console.log('连接关闭')
            },
            onError: (err) => {
                console.error('连接错误:', err)
            }
        })
    })
}

// 修改返回函数，使用本地存储替代事件通道
const navigateBack = (data) => {
    return new Promise((resolve, reject) => {
        try {
            // 使用本地存储保存用户数据
            uni.setStorageSync('userData', data)
            uni.navigateBack({
                delta: 1,
                success: resolve,
                fail: reject
            })
        } catch (error) {
            reject(error)
        }
    })
}

// 修改登录函数，添加延时确保loading动画显示
const login = async () => {
    try {
        // 添加小延时，确保loading动画显示
        await new Promise(resolve => setTimeout(resolve, 500))

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

        if (res.code === 200) {
            useToken.setToken(res.data)
            return res.data
        } else {
            throw new Error('登录接口返回错误')
        }
    } catch (error) {
        console.error('登录失败：', error)
        throw error
    }
}

const getUserInfo = async () => {
    try {
        const res = await request({
            url: '/user/getUserInfo',
            method: 'GET'
        })

        if (res.code === 200) {
            uni.setStorageSync('userRole', res.data.role)
            return res.data
        } else {
            throw new Error('获取用户信息失败')
        }
    } catch (error) {
        console.error('获取用户信息失败：', error)
        throw error
    }
}
</script>

<style scoped>
.loading-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.9);
}

.loading-bars {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 50px;
}

.bar {
    width: 8px;
    height: 30px;
    background-color: #ff5500;
    border-radius: 4px;
    animation: bounce 1.2s infinite ease-in-out;
}

.bar:nth-child(1) {
    animation-delay: -1.2s;
}

.bar:nth-child(2) {
    animation-delay: -1.1s;
}

.bar:nth-child(3) {
    animation-delay: -1.0s;
}

.bar:nth-child(4) {
    animation-delay: -0.9s;
}

.bar:nth-child(5) {
    animation-delay: -0.8s;
}

@keyframes bounce {

    0%,
    40%,
    100% {
        transform: scaleY(0.6);
    }

    20% {
        transform: scaleY(1);
    }
}

.loading-text {
    margin-top: 20px;
    color: #666;
    font-size: 16px;
}
</style>