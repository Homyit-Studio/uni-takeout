<template>
    <view class="container">
        <!-- 页面标题 -->
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="header-content">
                <text class="title">订单</text>
                <view style="display: flex;align-items: center;justify-content: center;">
                    <button style="color: #fff; font-size: 20rpx;width: 200rpx; background: rgba(255, 255, 255, 0.15);"
                        open-type="openSetting" bindopensetting="callback">蓝牙权限管理</button>
                    <button class="print-btn" @click="searchBle">
                        <uni-icons :type="isConnected ? 'checkbox-filled' : 'link'" size="24"
                            :color="isConnected ? '#ff5500' : '#fff'" />
                        <text>{{ isConnected ? deviceName : '连接打印机' }}</text>
                    </button>
                </view>
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
                                @click.stop="completeOrder(order.id)">确认到货</button>
                            <!-- <button class="btn tertiary" v-if="order.status === 'completed'"
                                @click.stop="reviewOrder(order.id)">写评价</button> -->
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
                    <view class="device-item" v-for="(device, index) in devices" :key="index" @click="onConn(device)">
                        <uni-icons type="bluetooth" size="24" color="#1296db" />
                        <text class="device-name">{{ device.name }}</text>
                        <text class="device-id">{{ device.deviceId }}</text>
                    </view>
                    <view v-if="devices.length === 0" class="no-device">
                        <text>未发现可用设备</text>
                    </view>
                </scroll-view>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'

const statusBarHeight = ref(0)
const tabs = ref(['全部', '待付款', '待发货', '待收货', '待评价', '退款/售后'])
const currentTab = ref(0)
const orders = ref([])

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
        url: `/pages/orderDetail/OrderDetailIndex?id=${orderId}`
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





/* 
 * @Author: 
 * @Motto: 
 * @Github:
 * @Description: 蓝牙连接
 * @FilePath:
 */

// 响应式数据
const devices = ref([]);
const connectDeviceId = ref('');
// 蓝牙相关状态
const isConnected = ref(false)
const deviceName = ref('')
// const bluetoothDevices = ref([])
// const bluetoothAdapter = ref(null)
// 生命周期钩子
onUnmounted(() => {
    if (connectDeviceId.value !== '') {
        uni.closeBLEConnection({
            deviceId: connectDeviceId.value,
            success(res) {
                connectDeviceId.value = '';
            }
        });
    }
});

const searchBle = () => {
    // 如果已经连接蓝牙，先询问是否断开链接
    if (isConnected.value) {
        uni.showModal({
            title: '提示',
            content: '是否断开当前蓝牙连接？',
            success: (res) => {
                if (res.confirm) {
                    uni.closeBLEConnection({
                        deviceId: connectDeviceId.value,
                        success(res) {
                            uni.showToast({ title: '蓝牙已断开' });
                            // 重置蓝牙相关状态
                            isConnected.value = false;
                            deviceName.value = '';
                            connectDeviceId.value = '';
                            // 可根据需要重新开始搜索蓝牙设备
                        },
                        fail(err) {
                            uni.showToast({ title: '断开失败', icon: 'none' });
                        }
                    });
                }
            }
        });
        return;
    }

    // 未连接蓝牙时，开启蓝牙搜索流程
    // 停止之前的设备发现监听
    uni.offBluetoothDeviceFound();

    uni.openBluetoothAdapter({
        success(res) {
            console.log(res, "初始化蓝牙模块");
            onDevice();
            uni.getBluetoothAdapterState({
                success: function (res) {
                    if (res.available) {
                        if (res.discovering) {
                            stopFindBule();
                        }
                        uni.startBluetoothDevicesDiscovery({
                            success(res) {
                                console.log(res, '开始搜寻附近的蓝牙外围设备');
                                // 搜索成功后打开蓝牙设备选择弹窗
                                if (devicePopup.value && typeof devicePopup.value.open === 'function') {
                                    devicePopup.value.open();
                                } else {
                                    console.warn('无法打开设备弹窗');
                                }
                            }
                        });
                    } else {
                        console.log('本机蓝牙不可用');
                    }
                },
            });
        },
        fail(err) {
            console.log(err, '初始化蓝牙模块失败');
        }
    });
};

const onDevice = () => {
    uni.onBluetoothDeviceFound((res) => {
        const foundDevices = res.devices || [];
        foundDevices.forEach(device => {
            const name = device.name;
            if (name && name !== "未知设备") {
                // 避免重复添加相同设备
                const existing = devices.value.find(d => d.deviceId === device.deviceId);
                if (!existing) {
                    devices.value.push({
                        name: name,
                        deviceId: device.deviceId,
                        services: []
                    });
                }
            }
        });
    });
};

const stopFindBule = () => {
    uni.stopBluetoothDevicesDiscovery({
        success(res) {
            console.log(res, '停止搜寻附近的蓝牙外围设备');
        }
    });
};

const onConn = (item) => {
    uni.showLoading();
    const deviceId = item.deviceId;
    uni.createBLEConnection({
        deviceId: deviceId,
        complete(res) {
            uni.hideLoading();
            if (res.errMsg === "createBLEConnection:ok") {
                console.log("连接蓝牙-[" + item.name + "]--成功");
                connectDeviceId.value = deviceId;
                setTimeout(function () {
                    uni.showLoading({
                        title: "连接中",
                    });
                    getBLEServices(deviceId);
                }, 2000);
            } else {
                console.log(res, 'createBLEConnection');
            }
            stopFindBule();
        },
    });
};

// 新增UUID存储变量
const serviceUUID = ref('');
const characteristicUUID = ref('');

// 修改getBLEServices方法
const getBLEServices = (_deviceId) => {
    uni.getBLEDeviceServices({
        deviceId: _deviceId,
        success(res) {
            for (const service of res.services) {
                uni.getBLEDeviceCharacteristics({
                    deviceId: _deviceId,
                    serviceId: service.uuid,
                    success(res) {
                        for (const char of res.characteristics) {
                            if (char.properties.write) {
                                serviceUUID.value = service.uuid;
                                characteristicUUID.value = char.uuid;
                                updateDevices(_deviceId, service.uuid, char.uuid);
                            }
                        }
                    }
                });
            }
        }
    });
};

// 修改printOrder方法
const printOrder = async (order) => {
    if (!connectDeviceId.value) {
        uni.showToast({ title: '未连接打印机', icon: 'none' });
        return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(`
    \x1B\x40
    \x1B\x61\x01
    ${order.storeName}\n
    订单号：${order.id}\n
    \x1D\x56\x41\x00
  `);

    try {
        await uni.writeBLECharacteristicValue({
            deviceId: connectDeviceId.value,
            serviceId: serviceUUID.value,
            characteristicId: characteristicUUID.value,
            value: data
        });
        uni.showToast({ title: '打印成功' });
    } catch (e) {
        uni.showToast({ title: '打印失败：' + e.message, icon: 'none' });
    }
};
const updateDevices = (deviceId, serviceId, characteristicId) => {
    for (let index in devices.value) {
        if (devices.value[index].deviceId === deviceId) {
            devices.value[index].services.push({
                serviceId: serviceId,
                characteristicId: characteristicId
            });
            deviceName.value = devices.value[index].name
            break;
        }
    }
    uni.showToast({
        title: "连接成功",
        icon: "none"
    });
    isConnected.value = true

    console.log(JSON.stringify(devices.value), '成功1');
};


// 添加对设备弹窗的引用
const devicePopup = ref(null)

// 定义关闭设备弹窗的方法
const closeDeviceList = () => {
    if (devicePopup.value && typeof devicePopup.value.close === 'function') {
        devicePopup.value.close()
    } else {
        console.warn('devicePopup 无法关闭')
    }
}
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
    padding: 20rpx 0;
    z-index: 2;
    top: 0rpx;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.2);

    .header-content {
        height: 100rpx;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .title {
            color: #fff;
            font-size: 40rpx;
            font-weight: 600;
            text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
        }

        .print-btn {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 40rpx;
            height: 60rpx;
            // padding: 12rpx 30rpx;
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
    // top: 200rpx;
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

// 弹窗层
.device-list {
    background: #fff;
    border-radius: 40rpx 40rpx 0 0;
    padding: 40rpx 30rpx;
    max-height: 70vh;
    box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.08);

    .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 30rpx;
        border-bottom: 1rpx solid #f5f5f5;
        margin-bottom: 20rpx;

        .title {
            font-size: 34rpx;
            font-weight: 600;
            color: #333;
        }

        .uni-icons {
            padding: 16rpx;
            border-radius: 50%;
            transition: all 0.2s;

            &:active {
                background: #f5f5f5;
            }
        }
    }

    .device-scroll {
        max-height: 60vh;
        padding: 0 10rpx;

        .device-item {
            display: flex;
            align-items: center;
            padding: 28rpx 24rpx;
            background: #fafafa;
            border-radius: 16rpx;
            margin-bottom: 20rpx;
            transition: all 0.2s;

            &:active {
                background: #f1f1f1;
                transform: scale(0.98);
            }

            .uni-icons {
                margin-right: 20rpx;
                flex-shrink: 0;
            }

            .device-name {
                font-size: 30rpx;
                color: #333;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .device-id {
                font-size: 24rpx;
                color: #999;
                margin-left: 20rpx;
                flex-shrink: 0;
                max-width: 240rpx;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        .no-device {
            text-align: center;
            padding: 60rpx 0;
            color: #999;
            font-size: 28rpx;
        }
    }
}
</style>