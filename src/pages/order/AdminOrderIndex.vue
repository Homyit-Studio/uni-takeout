<template>
    <view class="container">
        <!-- 页面标题 -->
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="header-content">
                <text class="title">我的订单</text>
                <button class="print-btn" @click="toggleBluetooth">
                    <uni-icons :type="isConnected ? 'bluetooth-filled' : 'bluetooth'" size="24"
                        :color="isConnected ? '#fff' : '#fff'" />
                    <text>{{ isConnected ? deviceName : '连接打印机' }}</text>
                </button>
            </view>
        </view>

        <!-- 订单类型选项卡 -->
        <view class="tabs-container">
            <scroll-view class="tabs" scroll-x :scroll-left="scrollLeft">
                <view class="tab-item" v-for="(tab, index) in tabs" :key="index"
                    :class="{ active: currentTab === index }" @click="switchTab(index)">
                    {{ tab }}
                    <view class="tab-line" v-if="currentTab === index"></view>
                </view>
            </scroll-view>
        </view>

        <!-- 订单列表 -->
        <scroll-view class="order-list" scroll-y @scrolltolower="loadMoreOrders">
            <block v-if="orders.length > 0">
                <view class="order-card" v-for="(order, index) in orders" :key="index"
                    @click="viewOrderDetail(order.id)">
                    <view class="card-header">
                        <image class="logo" :src="order.storeIcon" mode="aspectFill" />
                        <text class="store-name">{{ order.storeName }}</text>
                        <text class="order-status" :class="order.status">{{ orderStatusText[order.status] }}</text>
                    </view>

                    <view class="goods-container">
                        <scroll-view class="goods-scroll" scroll-x v-if="order.goodsImages.length > 1">
                            <block v-for="(img, imgIndex) in order.goodsImages" :key="imgIndex">
                                <image class="goods-image" :src="img" mode="aspectFill" />
                                <text class="goods-count-badge" v-if="order.goodsImages.length > 1 && imgIndex === 3">
                                    +{{ order.goodsCount - 3 }}
                                </text>
                            </block>
                        </scroll-view>
                        <image v-else class="single-goods-image" :src="order.goodsImages[0]" mode="aspectFill" />

                        <view class="goods-info">
                            <text class="goods-name">{{ order.goodsName }}</text>
                            <view class="goods-meta">
                                <text class="goods-count">共{{ order.goodsCount }}件</text>
                                <text class="order-amount">{{ order.amount.toFixed(2) }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="card-footer">
                        <text class="order-time">{{ formatTime(order.createTime) }}</text>
                        <view class="action-btns">
                            <button class="btn secondary" v-if="order.status === 'pending'"
                                @click.stop="cancelOrder(order.id)">取消订单</button>
                            <button class="btn primary" v-if="order.status === 'delivered'"
                                @click.stop="completeOrder(order.id)">确认收货</button>
                            <button class="btn tertiary" v-if="order.status === 'completed'"
                                @click.stop="reviewOrder(order.id)">写评价</button>
                            <button class="btn print" v-if="isConnected" @click.stop="printOrder(order)">打印小票</button>
                        </view>
                    </view>
                </view>
            </block>

            <view class="empty-state" v-else>
                <image class="empty-image" src="/static/empty-order.png" mode="aspectFit" />
                <text class="empty-text">暂无相关订单</text>
            </view>

            <view class="loading-state">
                <text v-if="hasMore && orders.length > 0">正在加载更多订单...</text>
                <text v-else-if="!hasMore && orders.length > 0">已经到底啦~</text>
            </view>
        </scroll-view>

        <!-- 蓝牙设备列表 -->
        <uni-popup ref="devicePopup" type="bottom">
            <view class="device-list">
                <view class="popup-header">
                    <text class="title">选择打印机</text>
                    <uni-icons type="close" size="24" color="#999" @click="closeDeviceList" />
                </view>
                <scroll-view class="device-scroll" scroll-y>
                    <view class="device-item" v-for="(device, index) in bluetoothDevices" :key="index"
                        @click="connectDevice(device)">
                        <uni-icons type="bluetooth" size="24" color="#1296db" />
                        <text class="device-name">{{ device.name }}</text>
                        <text class="device-id">{{ device.deviceId }}</text>
                    </view>
                    <view v-if="bluetoothDevices.length === 0" class="no-device">
                        <text>未发现可用设备</text>
                    </view>
                </scroll-view>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'

const statusBarHeight = ref(0)
const tabs = ref(['全部', '待付款', '待发货', '待收货', '待评价', '退款/售后'])
const currentTab = ref(0)
const orders = ref([])
// 蓝牙相关状态
const isConnected = ref(false)
const deviceName = ref('')
const bluetoothDevices = ref([])
const bluetoothAdapter = ref(null)
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isRefreshing = ref(false)
const orderStatusText = ref({
    'pending': '待付款',
    'paid': '待发货',
    'delivering': '待收货',
    'completed': '待评价',
    'refunded': '退款/售后'
})
const scrollLeft = ref(0)

onMounted(async () => {
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
    await checkBluetooth()
    loadOrders()
})

// 时间格式化方法
const formatTime = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const orderDate = new Date(year, date.getMonth(), day);

    // 判断是否是今天
    if (orderDate.getTime() === today.getTime()) {
        return `今天 ${hours}:${minutes}`;
    }

    // 判断是否是昨天
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (orderDate.getTime() === yesterday.getTime()) {
        return `昨天 ${hours}:${minutes}`;
    }

    // 其他日期显示完整日期
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
// 蓝牙功能实现
const checkBluetooth = async () => {
    try {
        // 使用同步方式获取系统信息
        const res = uni.getSystemInfoSync();
        if (!res.bluetoothEnabled) {
            throw new Error('蓝牙未开启');
        }

        if (res.platform === 'android') {
            // 尝试获取蓝牙权限
            await uni.authorize({
                scope: 'scope.bluetooth'
            });
        }

        // 初始化蓝牙适配器
        await uni.openBluetoothAdapter();

        // 监听蓝牙状态变化
        uni.onBluetoothAdapterStateChange((res) => {
            if (!res.available) {
                isConnected.value = false;
                deviceName.value = '';
                uni.showToast({
                    title: '蓝牙已断开',
                    icon: 'none'
                });
            }
        });

    } catch (err) {
        console.error('蓝牙初始化失败', err);
        uni.showModal({
            title: '蓝牙初始化失败',
            content: err.message || '请检查蓝牙是否开启并授予相关权限',
            showCancel: false
        });
    }
}
const toggleBluetooth = async () => {
    if (isConnected.value) {
        await disconnectDevice()
    } else {
        await searchDevices()
    }
}

const searchDevices = async () => {
    try {
        uni.showLoading({ title: '搜索中...' });
        bluetoothDevices.value = [];

        // 先停止之前的搜索
        await uni.stopBluetoothDevicesDiscovery();

        // 清理之前的监听器
        uni.offBluetoothDeviceFound();

        // 监听发现新设备
        uni.onBluetoothDeviceFound((result) => {
            const newDevices = result.devices.filter(device => {
                // 过滤掉没有名称的设备和已存在的设备
                return device.name &&
                    !bluetoothDevices.value.some(d => d.deviceId === device.deviceId);
            });

            bluetoothDevices.value = [...bluetoothDevices.value, ...newDevices];
        });

        // 开始搜索设备
        await uni.startBluetoothDevicesDiscovery({
            allowDuplicatesKey: false,
            interval: 0,
            services: [] // 可以根据实际打印机的service UUID进行过滤
        });

        // 5秒后停止搜索
        setTimeout(async () => {
            await uni.stopBluetoothDevicesDiscovery();
            uni.hideLoading();
            if (bluetoothDevices.value.length > 0) {
                $refs.devicePopup.open();
            } else {
                uni.showToast({
                    title: '未找到打印设备',
                    icon: 'none'
                });
            }
        }, 5000);

    } catch (err) {
        uni.hideLoading();
        uni.showToast({
            title: '搜索设备失败: ' + (err.message || '未知错误'),
            icon: 'none'
        });
    }
}

const connectDevice = async (device) => {
    try {
        uni.showLoading({ title: '连接中...' });

        // 先断开现有连接
        if (isConnected.value) {
            await disconnectDevice();
        }

        // 创建连接
        await uni.createBLEConnection({
            deviceId: device.deviceId,
            timeout: 10000 // 设置超时时间
        });

        // 获取设备的服务
        const servicesRes = await uni.getBLEDeviceServices({
            deviceId: device.deviceId
        });

        // TODO: 根据实际打印机的服务UUID进行匹配和特征值获取
        // 这里需要根据具体打印机型号来实现

        isConnected.value = true;
        deviceName.value = device.name;
        $refs.devicePopup.close();
        uni.showToast({ title: '连接成功' });

    } catch (err) {
        console.error('连接设备失败:', err);
        uni.showToast({
            title: '连接失败: ' + (err.message || '未知错误'),
            icon: 'none'
        });
    } finally {
        uni.hideLoading();
    }
}

const disconnectDevice = async () => {
    try {
        await uni.closeBLEConnection()
        isConnected.value = false
        deviceName.value = ''
        uni.showToast({ title: '已断开连接' })
    } catch (err) {
        uni.showToast({ title: '断开失败', icon: 'none' })
    }
}

const printOrder = async (order) => {
    // 构建打印数据（需要根据具体打印机协议实现）
    const printData = `
        [C]<b>${order.storeName}</b>
        [L]------------------------
        [C]订单号：${order.id}
        [L]下单时间：${order.createTime}
        [L]------------------------
        [L]商品：${order.goodsName} x${order.goodsCount}
        [R]合计：¥${order.amount.toFixed(2)}
        [L]------------------------
        [C]感谢您的惠顾！
    `

    try {
        await uni.writeBLECharacteristicValue({
            deviceId: deviceName.value,
            serviceId: '0000FFE0-0000-1000-8000-00805F9B34FB',
            characteristicId: '0000FFE1-0000-1000-8000-00805F9B34FB',
            value: stringToArrayBuffer(printData)
        })
        uni.showToast({ title: '打印任务已发送' })
    } catch (err) {
        uni.showToast({ title: '打印失败', icon: 'none' })
    }
}



// 生命周期
onMounted(() => {
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight
    console.log(statusBarHeight.value)
    loadOrders()
})

// 方法
const switchTab = (index) => {
    if (currentTab.value === index) return
    currentTab.value = index
    // 计算滚动位置
    scrollLeft.value = index * 120 // 每个tab的大致宽度
    page.value = 1
    hasMore.value = true
    orders.value = []
    loadOrders()
}

const loadOrders = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 修改状态映射，确保与tab一致
            const statusMap = {
                0: 'all',          // 全部
                1: 'pending',      // 待付款
                2: 'paid',         // 待发货
                3: 'delivering',   // 待收货
                4: 'completed',    // 待评价
                5: 'refunded'      // 退款/售后
            }
            const currentStatus = statusMap[currentTab.value]

            let mockData = []
            for (let i = 0; i < pageSize.value; i++) {
                const orderIndex = i + (page.value - 1) * pageSize.value
                // 根据当前选中的状态生成对应的订单
                let status = currentStatus

                // 如果是"全部"标签，则随机生成不同状态
                if (currentStatus === 'all') {
                    const statuses = ['pending', 'paid', 'delivering', 'completed', 'refunded']
                    status = statuses[Math.floor(Math.random() * statuses.length)]
                }

                const order = {
                    id: `order${orderIndex}`,
                    storeName: `商家${orderIndex % 5 + 1}`,
                    storeIcon: '/static/logo.png', // 确保添加商家图标
                    goodsName: `美食套餐${orderIndex}`,
                    goodsCount: Math.floor(Math.random() * 5) + 1,
                    goodsImages: ['/static/goods.png'], // 修改为数组形式
                    amount: Math.floor(Math.random() * 100) + 20,
                    status: status,
                    createTime: `2023-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`
                }

                mockData.push(order)
            }

            if (page.value === 1) {
                orders.value = mockData
            } else {
                orders.value = [...orders.value, ...mockData]
            }

            if (page.value >= 3) {
                hasMore.value = false
            }

            isRefreshing.value = false
            resolve()
        }, 1000)
    })
}

const loadMoreOrders = () => {
    if (!hasMore.value) return
    page.value++
    loadOrders()
}

const refreshOrders = () => {
    isRefreshing.value = true
    page.value = 1
    hasMore.value = true
    loadOrders()
}

const viewOrderDetail = (orderId) => {
    uni.navigateTo({
        url: `/pages/order/detail?id=${orderId}`
    })
}

const cancelOrder = (orderId) => {
    uni.showModal({
        title: '提示',
        content: '确定要取消该订单吗？',
        success: (res) => {
            if (res.confirm) {
                uni.showToast({
                    title: '订单已取消',
                    icon: 'success'
                })
                refreshOrders()
            }
        }
    })
}

const completeOrder = (orderId) => {
    uni.showModal({
        title: '提示',
        content: '确认已收到商品？',
        success: (res) => {
            if (res.confirm) {
                uni.showToast({
                    title: '已确认收货',
                    icon: 'success'
                })
                refreshOrders()
            }
        }
    })
}

const reviewOrder = (orderId) => {
    uni.navigateTo({
        url: `/pages/order/review?id=${orderId}`
    })
}

// 添加页面级下拉刷新
onPullDownRefresh(() => {
    page.value = 1
    hasMore.value = true
    orders.value = []
    loadOrders().then(() => {
        uni.stopPullDownRefresh()
    })
})

</script>

<style lang="scss" scoped>
$primary-color: #FF5500;
$secondary-color: #FFA99F;

.container {
    background: #f8f9fb;
    min-height: 100vh;
    box-sizing: border-box;
}

.header {
    position: sticky;
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    padding: 20rpx 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.2);

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100rpx;


        .title {
            color: #fff;
            font-size: 40rpx;
            font-weight: 600;
            text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
        }

        .print-btn {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 40rpx;
            padding: 12rpx 30rpx;
            display: flex;
            align-items: center;
            font-size: 26rpx;
            color: #fff;
            backdrop-filter: blur(10rpx);
            transition: all 0.3s;

            &:active {
                opacity: 0.8;
                transform: scale(0.98);
            }

            uni-icons {
                margin-right: 10rpx;
            }
        }
    }
}

.tabs-container {
    background: #fff;
    padding: 20rpx 0;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    width: 100%;
    position: sticky;
    top: 0;
    z-index: 1;

    .tabs {
        white-space: nowrap;
        width: 100%;
        box-sizing: border-box;

        .tab-item {
            display: inline-block;
            width: 120rpx; // 固定宽度
            padding: 20rpx 0;
            text-align: center;
            font-size: 28rpx;
            color: #666;
            position: relative;

            &.active {
                color: $primary-color;
                font-weight: 500;

                .tab-line {
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60rpx;
                    height: 4rpx;
                    background: $primary-color;
                    border-radius: 2rpx;
                }
            }
        }
    }
}

@keyframes tabLine {
    0% {
        width: 0
    }

    100% {
        width: 60rpx
    }
}

.order-list {
    padding: 30rpx;
    width: 100%; // 确保宽度约束
    max-width: 100vw; // 最大宽度不超过屏幕
    box-sizing: border-box;
}

.order-card {
    background: #fff;
    border-radius: 24rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
    overflow: hidden;
    transition: all 0.3s;

    &:active {
        transform: scale(0.99);
        opacity: 0.9;
    }

    .card-header {
        display: flex;
        align-items: center;
        padding: 30rpx;
        border-bottom: 1rpx solid #f5f5f5;

        .logo {
            width: 60rpx;
            height: 60rpx;
            border-radius: 16rpx;
            margin-right: 20rpx;
        }

        .store-name {
            flex: 1;
            font-size: 32rpx;
            font-weight: 500;
            color: #333;
        }

        .order-status {
            font-size: 26rpx;
            font-weight: 500;

            &.pending {
                color: #FFB400;
            }

            &.paid {
                color: #1296db;
            }

            &.shipped {
                color: #1296db;
            }

            &.delivered {
                color: #1296db;
            }

            &.completed {
                color: #4CAF50;
            }

            &.refunded {
                color: #999;
            }
        }
    }
}

.goods-container {
    padding: 30rpx;

    .goods-scroll {
        margin-bottom: 20rpx;
        white-space: nowrap;

        .goods-image {
            width: 160rpx;
            height: 160rpx;
            border-radius: 16rpx;
            margin-right: 20rpx;
            position: relative;

            &:nth-child(n+4) {
                display: none;
            }
        }

        .goods-count-badge {
            position: absolute;
            right: 20rpx;
            bottom: 10rpx;
            background: rgba(0, 0, 0, 0.6);
            color: #fff;
            padding: 4rpx 16rpx;
            border-radius: 20rpx;
            font-size: 22rpx;
        }
    }

    .single-goods-image {
        width: 100%;
        height: 320rpx;
        border-radius: 16rpx;
        margin-bottom: 20rpx;
    }

    .goods-info {
        .goods-name {
            font-size: 30rpx;
            color: #333;
            line-height: 1.4;
        }

        .goods-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20rpx;

            .goods-count {
                color: #999;
                font-size: 26rpx;
            }

            .order-amount {
                color: $primary-color;
                font-size: 38rpx;
                font-weight: 600;

                &::before {
                    content: '¥';
                    font-size: 0.8em;
                }
            }
        }
    }
}

.card-footer {
    padding: 30rpx;
    border-top: 1rpx solid #f5f5f5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .order-time {
        color: #999;
        font-size: 24rpx;
    }

    .action-btns {
        display: flex;
        gap: 20rpx;

        .btn {
            height: 64rpx;
            line-height: 64rpx;
            padding: 0 36rpx;
            border-radius: 40rpx;
            font-size: 26rpx;
            transition: all 0.2s;

            &.secondary {
                background: #f5f5f5;
                color: #666;

                &:active {
                    background: #eee;
                }
            }

            &.primary {
                background: linear-gradient(45deg, #FF6B6B, #FF8E53);
                color: #fff;
                box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);

                &:active {
                    opacity: 0.9;
                }
            }

            &.tertiary {
                background: #fff;
                border: 1rpx solid $primary-color;
                color: $primary-color;

                &:active {
                    background: rgba(255, 107, 107, 0.05);
                }
            }

            &.print {
                background: #1296db;
                color: #fff;
            }
        }
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100rpx 0;

    .empty-image {
        width: 300rpx;
        height: 300rpx;
        opacity: 0.8;
        margin-bottom: 40rpx;
    }

    .empty-text {
        color: #999;
        font-size: 28rpx;
    }
}

.loading-state {
    text-align: center;
    padding: 30rpx 0;
    color: #999;
    font-size: 26rpx;
}
</style>