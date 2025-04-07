<template>
    <view class="container">
        <!-- 页面标题 -->
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <!-- 导航栏 -->
            <view style="display: flex;justify-content: center;">
                <view class="nav-bar" :style="{ top: statusBarHeight + 'px' }">
                    <view class="back-btn" @click="handleBack">
                        <uni-icons :type="backIcon" color="#fff" size="24" />
                    </view>
                </view>
                <!-- 标题 -->
                <view class="title">订单管理</view>
            </view>
            <!-- 操作按钮 -->
            <view class="header-content">
                <button class="print-btn" @click="searchBle">
                    <uni-icons :type="isConnected ? 'checkbox-filled' : 'link'" size="24"
                        :color="isConnected ? '#ff5500' : '#fff'" />
                    <text>{{ isConnected ? deviceName : '连接打印机' }}</text>
                </button>
            </view>
        </view>

        <!-- 订单类型选项卡 -->
        <view class="tabs-container" :style="{ top: statusBarHeight + 80 + 'px' }">
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
                <view class="order-card" v-for="(order, index) in orders" :key="index" @click="viewOrderDetail(order)">
                    <view class="card-header">
                        <image class="logo" :src="order.shopAvatar || '/static/logo.png'" mode="aspectFill" />
                        <text class="store-name">{{ order.shopName }}</text>
                        <text class="order-status" :class="order.status">{{ order.status }}</text>
                    </view>

                    <view class="goods-container">
                        <scroll-view class="goods-scroll" scroll-x v-if="order.orderDetailList?.length > 1">
                            <block v-for="(item, imgIndex) in order.orderDetailList" :key="imgIndex">
                                <image class="goods-image" :src="item.image" mode="aspectFill" />
                            </block>
                        </scroll-view>
                        <image v-else class="single-goods-image"
                            :src="order.orderDetailList?.[0]?.image || '/static/goods.png'" mode="aspectFill" />

                        <view class="goods-info">
                            <text class="goods-name">{{ order.remark || '无备注' }}</text>
                            <view class="goods-meta">
                                <text class="goods-count">共{{ order.orderDetailList?.length || 0 }}件</text>
                                <text class="order-amount">{{ order.amount.toFixed(2) }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="card-footer">
                        <text class="order-time">{{ formatTime(order.orderTime) }}</text>
                        <view class="action-btns">
                            <!-- 商家出餐状态的订单可以取消或确认送达 -->

                            <template v-if="order.status === '商家正在出餐'">
                                <button class="btn secondary" @click.stop="cancelOrder(order)">取消订单</button>
                                <button class="btn primary" @click.stop="deliverOrder(order)">确认送达</button>
                            </template>
                            <!-- 
                            <template v-else-if="order.status === '拼团中'">
                                <button class="btn secondary" @click.stop="cancelOrder(order)">取消订单</button>
                            </template> -->
                            <!-- 其他状态的订单只显示打印按钮 -->
                            <button v-if="isConnected" class="btn print" @click.stop="printOrder(order)">打印小票</button>
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
import { onLoad } from '@dcloudio/uni-app'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { request } from '@/utils/request'

const statusBarHeight = ref(0)
const tabs = ref(['全部', '商家出餐', '拼团中', '已送达', '已退款'])
const currentTab = ref(0)
const orders = ref([])
const backIcon = ref("back")
const shopId = ref('') // 添加shopId响应式变量

const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isRefreshing = ref(false)
const orderStatusText = ref({
    '待支付': '待支付',
    '商家正在出餐': '商家出餐',
    '拼团中': '拼团中',
    '已完成': '已完成',
    '已取消': '已取消',
    '已退款': '已退款'
})
const scrollLeft = ref(0)
onLoad(async (options) => {
    console.log('接收到的参数:', options)
    shopId.value = options.shopid
    await loadOrders() // 获取到shopId后加载订单数据

})

onMounted(async () => {
    statusBarHeight.value = uni.getWindowInfo().statusBarHeight
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

const handleBack = () => {
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
    statusBarHeight.value = uni.getWindowInfo().statusBarHeight
    loadOrders()
    if (getCurrentPages().length == 1) {
        backIcon.value = "home"
    } else {
        backIcon.value = "left"
    }
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

const loadOrders = async () => {
    try {
        console.log('加载订单数据...', shopId.value)
        const res = await request({
            url: '/order/merchantselect',
            method: 'POST',
            data: {
                shopid: shopId.value
            }
        });
        console.log('订单数据加载成功:', res);

        if (res.code === 200 && res.data) {
            let filteredOrders = res.data;

            // 根据当前选项卡过滤订单
            if (currentTab.value > 0) {
                const statusMap = {
                    1: '商家正在出餐',
                    2: '拼团中',
                    3: '已送达',
                    4: '待支付',
                    5: '已退款'
                };
                const currentStatus = statusMap[currentTab.value];
                filteredOrders = filteredOrders.filter(order => order.status === currentStatus);
            }

            // 按订单时间降序排序
            filteredOrders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));

            if (page.value === 1) {
                orders.value = filteredOrders;
            } else {
                orders.value = [...orders.value, ...filteredOrders];
            }

            // 更新是否有更多数据的状态
            hasMore.value = filteredOrders.length >= pageSize.value;
        } else {
            uni.showToast({
                title: res.msg || '获取订单失败',
                icon: 'none'
            });
        }
    } catch (error) {
        console.error('获取订单失败:', error);
        uni.showToast({
            title: '获取订单失败',
            icon: 'none'
        });
    } finally {
        isRefreshing.value = false;
        uni.stopPullDownRefresh();
    }
};

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

const viewOrderDetail = async (order) => {
    if (order) {
        try {
            // 获取商家电话
            const shopInfo = await request({
                url: '/shop/mershopinfo',
                method: 'GET',
            })
            // 合并订单信息和商家电话
            const orderInfo = {
                ...order,
                shopPhone: shopInfo.data?.phone || ''
            }
            // 存储到本地
            uni.setStorageSync('orderDetail', orderInfo)
            uni.navigateTo({
                url: `/pages/orderDetail/OrderDetailIndex?id=${order.id}`
            })
        } catch (error) {
            console.error('获取商家信息失败:', error)
            // 即使获取商家电话失败也允许查看订单详情
            uni.setStorageSync('orderDetail', order)
            uni.navigateTo({
                url: `/pages/orderDetail/OrderDetailIndex?id=${order.id}`
            })
        }
    }
}

const cancelOrder = async (order) => {
    uni.showModal({
        title: '确认取消',
        content: '确定要取消这个订单吗?',
        async success(res) {
            if (res.confirm) {
                try {
                    const res = await request({
                        url: '/order/mercancel',
                        method: 'POST',
                        data: {
                            orderNumber: order.number
                        }
                    })
                    if (res.code === 200) {
                        uni.showToast({
                            title: '取消订单成功',
                            icon: 'success'
                        })
                        refreshOrders()
                    } else {
                        uni.showToast({
                            title: res.msg || '取消失败',
                            icon: 'none'
                        })
                    }
                } catch (error) {
                    console.error('取消订单失败:', error)
                    uni.showToast({
                        title: '取消订单失败',
                        icon: 'none'
                    })
                }
            }
        }
    })
}

const deliverOrder = async (order) => {
    uni.showModal({
        title: '确认送达',
        content: '确认该订单已送达到顾客手中?',
        async success(res) {
            if (res.confirm) {
                try {
                    const res = await request({
                        url: '/order/ordersuccess',
                        method: 'POST',
                        data: {
                            id: order.id
                        }
                    })
                    if (res.code === 200) {
                        uni.showToast({
                            title: '确认送达成功',
                            icon: 'success'
                        })
                        refreshOrders()
                    } else {
                        uni.showToast({
                            title: res.msg || '确认送达失败',
                            icon: 'none'
                        })
                    }
                } catch (error) {
                    console.error('确认送达失败:', error)
                    uni.showToast({
                        title: '确认送达失败',
                        icon: 'none'
                    })
                }
            }
        }
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
$secondary-color: #eb7843;

.container {
    background: #f8f9fb;
    min-height: 100vh;
    box-sizing: border-box;
}

.header {
    position: sticky;
    background: linear-gradient(135deg, #FF5500 0%, #FF8E53 100%);
    display: flex;
    flex-direction: column;
    padding: 20rpx 0;
    z-index: 2;
    top: 0;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.2);

    .nav-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        padding-left: 30rpx;
        height: 88rpx;
        display: flex;
        align-items: center;
        background: transparent;
        transition: all 0.3s ease;
        z-index: 2;

        .back-btn {
            width: 64rpx;
            height: 64rpx;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.3);
            transition: background 0.3s;

            &:active {
                background-color: rgba(0, 0, 0, 0.5);
            }
        }
    }

    .title {
        color: #fff;
        font-size: 40rpx;
        font-weight: 600;
        margin-bottom: 20rpx;
        // margin-left: 30rpx;
        text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    }

    .header-content {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 0 30rpx;

        .print-btn {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 40rpx;
            height: 60rpx;
            padding: 0 30rpx;
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

            &.preparing {
                color: #1296db;
            }

            &.grouping {
                color: #FF5722;
            }

            &.completed {
                color: #4CAF50;
            }

            &.cancelled {
                color: #999;
            }

            &.refunded {
                color: #F44336;
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