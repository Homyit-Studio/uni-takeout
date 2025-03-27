<template>
    <view class="address-container">
        <!-- 地址列表 -->
        <view class="address-list">
            <view class="address-card" v-for="(address, index) in addressList" :key="index">
                <!-- 左侧选择框 -->
                <view class="radio-box" @click="setDefault(index)">
                    <uni-icons :type="address.isDefault ? 'checkbox-filled' : 'circle'" size="20"
                        :color="address.isDefault ? '#FF5500' : '#ccc'"></uni-icons>
                </view>

                <!-- 地址信息 -->
                <view class="address-info">
                    <view class="info-top">
                        <text class="name">{{ address.name }}</text>
                        <text class="phone">{{ address.phone }}</text>
                    </view>
                    <text class="address">{{ address.address }}</text>
                </view>

                <!-- 右侧操作按钮 -->
                <view class="action-btns">
                    <button class="edit-btn" @click="openEditModal(index)">
                        <uni-icons type="compose" size="20" color="#666"></uni-icons>
                    </button>
                    <button class="delete-btn" @click="deleteAddress(index)">
                        <uni-icons type="trash" size="20" color="#FF5500"></uni-icons>
                    </button>
                </view>
            </view>
        </view>

        <!-- 添加地址按钮 -->
        <view class="add-btn" @click="openAddModal">
            <text>+ 添加新地址</text>
        </view>

        <!-- 弹框组件 -->
        <uni-popup ref="popup" type="bottom" background-color="#fff">
            <view class="popup-content">
                <view class="popup-header">
                    <text class="title">{{ isEditing ? '修改地址' : '添加地址' }}</text>
                    <uni-icons type="closeempty" size="24" color="#999" @click="closeModal"></uni-icons>
                </view>

                <view class="form-item">
                    <text class="label">收货人</text>
                    <input class="input" v-model="currentAddress.name" placeholder="请输入收货人姓名" />
                </view>

                <view class="form-item">
                    <text class="label">手机号</text>
                    <input class="input" v-model="currentAddress.phone" type="number" placeholder="请输入手机号码" />
                </view>

                <view class="form-item">
                    <text class="label">详细地址（精确到门牌号）</text>
                    <view class="address-input-wrapper">
                        <textarea class="address-input" v-model="currentAddress.address" placeholder="请输入详细地址"
                            auto-height></textarea>
                        <button class="map-select-btn" @click="chooseLocation">
                            <uni-icons type="location-filled" size="20" color="#FF5500"></uni-icons>
                        </button>
                    </view>
                </view>

                <button class="save-btn" @click="saveAddress">保存地址</button>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request } from '../../utils/request'

// 地址列表数据
const addressList = ref([])

// 当前编辑的地址
const currentAddress = ref({
    name: '',
    phone: '',
    address: ''
})

// 弹框控制
const popup = ref(null)
const isEditing = ref(false)
const editIndex = ref(-1)

// 本地存储的默认地址ID
// const defaultAddressId = ref(null)

// 页面加载时获取地址列表
onShow(() => {
    getAddressList()
})

// 获取地址列表
const getAddressList = async () => {
    try {
        // 从本地获取完整默认地址
        const localDefaultAddress = uni.getStorageSync('defaultAddress') || null

        const res = await request({
            url: '/address/selectaddress',
            method: 'GET'
        })

        // 处理地址数据
        addressList.value = res.data.map(item => ({
            ...item,
            isDefault: localDefaultAddress
                ? item.id === localDefaultAddress.id  // 使用ID比对更可靠
                : false
        }))

        // 自动设置第一个为默认（当没有默认地址时）
        if (addressList.value.length > 0 && !localDefaultAddress) {
            addressList.value[0].isDefault = true
            uni.setStorageSync('defaultAddress', addressList.value[0])
        }
    } catch (error) {
        console.error('获取地址列表失败:', error)
        uni.showToast({
            title: '获取地址失败',
            icon: 'none'
        })
    }
}

// 打开添加地址弹框
const openAddModal = () => {
    currentAddress.value = {
        name: '',
        phone: '',
        address: ''
    }
    isEditing.value = false
    popup.value.open()
}

// 打开编辑地址弹框
const openEditModal = (index) => {
    currentAddress.value = { ...addressList.value[index] }
    isEditing.value = true
    editIndex.value = index
    popup.value.open()
}

// 关闭弹框
const closeModal = () => {
    popup.value.close()
}

// 设置默认地址
const setDefault = async (index) => {
    const targetAddress = addressList.value[index]
    if (targetAddress.isDefault) return

    // 更新所有地址状态
    addressList.value.forEach(item => {
        item.isDefault = item.id === targetAddress.id
    })

    // 存储完整默认地址到本地
    uni.setStorageSync('defaultAddress', targetAddress)

    // 重新排序
    addressList.value.sort((a, b) => b.isDefault - a.isDefault)

    uni.showToast({ title: '设置默认成功', icon: 'success' })
}

// 保存地址
const saveAddress = async () => {
    // 表单验证
    if (!currentAddress.value.name?.trim()) {
        uni.showToast({
            title: '请输入收货人姓名',
            icon: 'none'
        })
        return
    }

    if (!/^1[3-9]\d{9}$/.test(currentAddress.value.phone)) {
        uni.showToast({
            title: '请输入正确的手机号码',
            icon: 'none'
        })
        return
    }

    if (!currentAddress.value.address?.trim()) {
        uni.showToast({
            title: '请选择或输入详细地址',
            icon: 'none'
        })
        return
    }

    try {
        if (isEditing.value) {
            // 更新地址
            await request({
                url: '/address/updateaddress',
                method: 'POST',
                data: {
                    id: addressList.value[editIndex.value].id,
                    ...currentAddress.value
                }
            })

            // 更新本地数据
            addressList.value[editIndex.value] = {
                ...addressList.value[editIndex.value],
                ...currentAddress.value
            }

            // 在修改地址成功后添加以下代码：
            if (addressList.value[editIndex.value].isDefault) {
                // 如果修改的是默认地址，更新本地存储
                uni.setStorageSync('defaultAddress', addressList.value[editIndex.value])
            }

            uni.showToast({
                title: '修改地址成功',
                icon: 'success'
            })
        } else {
            // 新增地址
            const res = await request({
                url: '/address/addaddress',
                method: 'POST',
                data: currentAddress.value
            })

            // 添加到地址列表
            const newAddress = {
                id: res.data.id,
                ...currentAddress.value,
                isDefault: addressList.value.length === 0 // 如果是第一个地址则设为默认
            }

            addressList.value.unshift(newAddress)

            // 如果是第一个地址，设置为默认
            if (newAddress.isDefault) {
                uni.setStorageSync('defaultAddress', newAddress)
            }

            uni.showToast({
                title: '添加地址成功',
                icon: 'success'
            })
        }

        // 关闭弹框
        closeModal()
    } catch (error) {
        console.error('保存地址失败:', error)
        uni.showToast({
            title: '保存地址失败',
            icon: 'none'
        })
    }
}

// 删除地址
const deleteAddress = async (index) => {
    try {
        const address = addressList.value[index]

        const res = await uni.showModal({
            title: '提示',
            content: '确定要删除该地址吗？',
            confirmColor: '#FF5500'
        })

        if (!res.confirm) return

        // 调用API删除地址
        await request({
            url: '/address/deleteaddress',
            method: 'POST',
            data: {
                id: address.id
            }
        })

        // 在删除地址时：
        if (address.isDefault) {
            uni.removeStorageSync('defaultAddress')
            // 设置新的默认地址
            if (addressList.value.length > 0) {
                addressList.value[0].isDefault = true
                uni.setStorageSync('defaultAddress', addressList.value[0])
            }
        }
        // 从列表中移除
        addressList.value.splice(index, 1)

        uni.showToast({
            title: '删除地址成功',
            icon: 'success'
        })
    } catch (error) {
        console.error('删除地址失败:', error)
        uni.showToast({
            title: '删除地址失败',
            icon: 'none'
        })
    }
}

// 选择地图位置
const chooseLocation = async () => {
    try {
        const res = await uni.chooseLocation({})

        if (res) {
            currentAddress.value.address = res.address || res.name
            uni.showToast({
                title: '地址选择成功',
                icon: 'success'
            })
        }
    } catch (error) {
        console.error('选择地址失败:', error)
        uni.showToast({
            title: '请手动输入地址',
            icon: 'none'
        })
    }
}
</script>

<style lang="scss" scoped>
.address-container {
    padding: 20rpx;
    min-height: 100vh;
    background-color: #f7f7f7;
    padding-bottom: 120rpx;
}

.address-list {
    margin-bottom: 20rpx;
}

.address-card {
    display: flex;
    align-items: center;
    padding: 30rpx;
    margin-bottom: 20rpx;
    border-bottom: 5rpx #ddd solid;

    .radio-box {
        margin-right: 20rpx;
    }

    .address-info {
        flex: 1;
        margin-right: 20rpx;

        .info-top {
            display: flex;
            align-items: center;
            margin-bottom: 10rpx;

            .name {
                font-size: 32rpx;
                font-weight: bold;
                color: #333;
                margin-right: 20rpx;
            }

            .phone {
                font-size: 28rpx;
                color: #666;
            }
        }

        .address {
            font-size: 28rpx;
            color: #666;
            line-height: 1.5;
        }
    }

    .action-btns {
        display: flex;
        flex-direction: column;
        gap: 20rpx;

        button {
            padding: 0;
            margin: 0;
            background: none;
            line-height: 1;

            &::after {
                border: none;
            }
        }
    }
}

.add-btn {
    position: fixed;
    bottom: 40rpx;
    left: 30rpx;
    right: 30rpx;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    background-color: #FF5500;
    color: #fff;
    font-size: 32rpx;
    border-radius: 40rpx;
    box-shadow: 0 4rpx 12rpx rgba(255, 85, 0, 0.3);
}

.popup-content {
    padding: 40rpx;

    .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40rpx;

        .title {
            font-size: 36rpx;
            font-weight: bold;
            color: #333;
        }
    }

    .form-item {
        margin-bottom: 30rpx;

        .label {
            display: block;
            font-size: 28rpx;
            color: #666;
            margin-bottom: 10rpx;
        }

        .input {
            height: 80rpx;
            line-height: 80rpx;
            padding: 0 20rpx;
            background-color: #f7f7f7;
            border-radius: 8rpx;
            font-size: 28rpx;
        }

        .address-input-wrapper {
            position: relative;

            .address-input {
                width: 100%;
                min-height: 150rpx;
                padding: 10rpx;
                background-color: #f7f7f7;
                border-radius: 8rpx;
                font-size: 28rpx;
                line-height: 1.5;
            }

            .map-select-btn {
                position: absolute;
                right: 10rpx;
                bottom: 10rpx;
                padding: 0;
                margin: 0;
                background: none;
                z-index: 2;

                &::after {
                    border: none;
                }
            }
        }
    }

    .save-btn {
        margin-top: 40rpx;
        height: 80rpx;
        line-height: 80rpx;
        background-color: #FF5500;
        color: #fff;
        font-size: 32rpx;
        border-radius: 40rpx;
    }
}
</style>