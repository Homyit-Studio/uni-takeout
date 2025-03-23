<template>
    <view class="address-container">
        <!-- 地址列表 -->
        <view class="address-card" v-for="(address, index) in addressList" :key="index">
            <!-- 左侧圆点 -->
            <view class="default-indicator" @click="setDefault(index)">
                <uni-icons :type="address.isDefault ? 'checkbox-filled' : 'circle'" size="20"
                    :color="address.isDefault ? '#ff5500' : '#ddd'"></uni-icons>
            </view>

            <!-- 地址信息 -->
            <view class="address-info">
                <text class="name">{{ address.name }}</text>
                <text class="phone">{{ address.phone }}</text>
                <view class="detail">
                    {{ address.province }}{{ address.city }}{{ address.area }}
                    {{ address.detail }}
                </view>
            </view>

            <!-- 右侧操作按钮 -->
            <view class="address-actions">
                <view class="action-item" @click="openEditModal(index)">
                    <text class="action-text" style="color: #8fc2eb;">修改</text>
                </view>
                <view class="action-item" @click="deleteAddress(index)">
                    <text class="action-text" style="color: red;">删除</text>
                </view>
            </view>
        </view>
        <!-- 添加地址按钮 -->
        <view class="add-address" @click="openAddModal">
            <text class="add-text">+ 添加新地址</text>
        </view>

        <!-- 底部弹框 -->
        <view class="modal" v-if="modalState.showModal">
            <view class="modal-content">
                <text class="modal-title">{{ modalState.isEditing ? '修改地址' : '添加地址' }}</text>
                <input class="input" v-model="currentAddress.name" placeholder="姓名" />
                <input class="input" v-model="currentAddress.phone" placeholder="电话" type="number" />
                <picker mode="multiSelector" @change="onPickerChange" @columnchange="onColumnChange"
                    :range="[pickerState.provinces.map(p => p.name), pickerState.cities, pickerState.areas]"
                    :value="pickerState.pickerValue" class="picker-item">
                    <view class="picker-trigger">
                        当前选择：
                        {{ pickerState.provinces[pickerState.pickerValue[0]] ?
                            pickerState.provinces[pickerState.pickerValue[0]].name : '请选择省份' }}
                        {{ pickerState.cities[pickerState.pickerValue[1]] ?
                            pickerState.cities[pickerState.pickerValue[1]] : '请选择城市' }}
                        {{ pickerState.areas[pickerState.pickerValue[2]] ? pickerState.areas[pickerState.pickerValue[2]]
                            : '请选择区县' }}
                    </view>
                </picker>
                <input class="input" v-model="currentAddress.detail" placeholder="详细地址" />
                <view class="modal-actions">
                    <button class="modal-button" @click="closeModal">取消</button>
                    <button class="modal-button confirm" @click="saveAddress">保存</button>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import provinceData from "@/common/provinceData.js";
import { onLoad } from '@dcloudio/uni-app';

// 地址列表
const addressList = ref([]);

// 省市区选择器状态
const pickerState = ref({
    provinces: provinceData.data, // 省份数据
    cities: [], // 市列表
    areas: [], // 区列表
    pickerValue: [0, 0, 0], // picker选中索引
});

// 模态框状态
const modalState = ref({
    showModal: false,
    isEditing: false,
    editIndex: -1,
});

// 当前编辑或新增的地址
const currentAddress = ref({
    name: '',
    phone: '',
    province: '',
    city: '',
    area: '',
    detail: '',
});


// 在加载数据后确保第一个是默认地址
onLoad(() => {
    const savedAddresses = uni.getStorageSync('addresses');
    if (savedAddresses) {
        // 如果加载的数据没有默认地址，设置第一个为默认
        if (!savedAddresses.some(item => item.isDefault)) {
            savedAddresses[0].isDefault = true;
        }
        addressList.value = savedAddresses;
    }
});

// 计算属性获取当前选中的省
const currentProvince = computed(() => pickerState.value.provinces[pickerState.value.pickerValue[0]] || {});

// 计算属性获取当前选中的市
const currentCity = computed(() => {
    const province = currentProvince.value;
    return province.city?.[pickerState.value.pickerValue[1]] || {};
});

// 初始化省市区选择器数据
const initPicker = () => {
    const firstProvince = pickerState.value.provinces[0];
    pickerState.value.cities = firstProvince.city.map(c => c.name);
    const firstCity = firstProvince.city[0];
    pickerState.value.areas = firstCity.area;
};

initPicker();

// 监听省变化
watch(() => pickerState.value.pickerValue[0], (newVal) => {
    const province = pickerState.value.provinces[newVal];
    pickerState.value.cities = province.city.map(c => c.name);
    pickerState.value.pickerValue[1] = 0;

    const city = province.city[0];
    pickerState.value.areas = city.area;
    pickerState.value.pickerValue[2] = 0;
});

// 监听市变化
watch(() => pickerState.value.pickerValue[1], (newVal) => {
    const province = pickerState.value.provinces[pickerState.value.pickerValue[0]];
    const city = province.city[newVal];
    pickerState.value.areas = city.area;
    pickerState.value.pickerValue[2] = 0;
});

// 省市区选择器列变化事件
const onColumnChange = (e) => {
    const column = e.detail.column;
    const value = e.detail.value;
    pickerState.value.pickerValue[column] = value;

    if (column === 0) { // 省变化
        const province = pickerState.value.provinces[value];
        pickerState.value.cities = province.city.map(c => c.name);
        pickerState.value.pickerValue[1] = 0;

        const city = province.city[0];
        pickerState.value.areas = city.area;
        pickerState.value.pickerValue[2] = 0;
    } else if (column === 1) { // 市变化
        const province = pickerState.value.provinces[pickerState.value.pickerValue[0]];
        const city = province.city[value];
        pickerState.value.areas = city.area;
        pickerState.value.pickerValue[2] = 0;
    }
};

// 省市区选择器确认事件
const onPickerChange = (e) => {
    const [provinceIndex, cityIndex, areaIndex] = e.detail.value;
    currentAddress.value.province = pickerState.value.provinces[provinceIndex].name;
    currentAddress.value.city = pickerState.value.cities[cityIndex];
    currentAddress.value.area = pickerState.value.areas[areaIndex];
};

// 打开新增地址模态框
const openAddModal = () => {
    currentAddress.value = {
        name: '',
        phone: '',
        province: '',
        city: '',
        area: '',
        detail: '',
    };
    modalState.value.isEditing = false;
    modalState.value.showModal = true;
};

// 打开编辑地址模态框
const openEditModal = (index) => {
    const address = addressList.value[index];
    currentAddress.value = { ...address };
    modalState.value.isEditing = true;
    modalState.value.editIndex = index;
    modalState.value.showModal = true;

    // 查找对应的省市区索引
    const provinceIndex = pickerState.value.provinces.findIndex(p => p.name === address.province);
    if (provinceIndex === -1) return;
    const cityIndex = pickerState.value.provinces[provinceIndex].city.findIndex(c => c.name === address.city);
    if (cityIndex === -1) return;
    const areaIndex = pickerState.value.provinces[provinceIndex].city[cityIndex].area.findIndex(a => a === address.area);
    if (areaIndex === -1) return;

    // 更新pickerValue及相关数据
    pickerState.value.pickerValue = [provinceIndex, cityIndex, areaIndex];
    pickerState.value.cities = pickerState.value.provinces[provinceIndex].city.map(c => c.name);
    pickerState.value.areas = pickerState.value.provinces[provinceIndex].city[cityIndex].area;
};

// 关闭模态框
const closeModal = () => {
    modalState.value.showModal = false;
};

// 修改后的设置默认方法
const setDefault = (index) => {
    // 获取当前点击的地址
    const targetAddress = addressList.value[index];

    // 如果已经是默认则不做处理
    if (targetAddress.isDefault) return;

    // 更新所有地址的默认状态
    addressList.value.forEach(item => {
        item.isDefault = false;
    });

    // 设置当前为默认
    targetAddress.isDefault = true;

    // 将默认地址移动到数组最前面
    const newList = [
        targetAddress,
        ...addressList.value.filter((_, i) => i !== index)
    ];

    addressList.value = newList;

    // 保存到本地存储
    uni.setStorageSync('addresses', addressList.value);

    // 显示提示信息
    uni.showToast({ title: '设置默认地址成功', icon: 'success' });
};

// 保存地址
const saveAddress = () => {
    if (!/^1[3-9]\d{9}$/.test(currentAddress.value.phone)) {
        uni.showToast({ title: '请输入有效手机号', icon: 'none' });
        return;
    }
    if (!currentAddress.value.name?.trim()) {
        uni.showToast({ title: '请输入姓名', icon: 'none' });
        return;
    }
    if (!currentAddress.value.province || !currentAddress.value.city || !currentAddress.value.area) {
        uni.showToast({ title: '请选择省市区', icon: 'none' });
        return;
    }
    if (modalState.value.isEditing) {
        addressList.value[modalState.value.editIndex] = { ...currentAddress.value };
        uni.showToast({ title: '修改地址成功', icon: 'success' });
    } else {
        addressList.value.push({ ...currentAddress.value });
        uni.showToast({ title: '添加地址成功', icon: 'success' });
    }

    // 保存到本地存储
    uni.setStorageSync('addresses', addressList.value);

    // 重置表单
    currentAddress.value = {
        name: '',
        phone: '',
        province: '',
        city: '',
        area: '',
        detail: '',
    };
    modalState.value.showModal = false;
};

// 删除地址
const deleteAddress = (index) => {
    uni.showModal({
        title: '提示',
        content: '确定删除该地址吗？',
        success: (res) => {
            if (res.confirm) {
                addressList.value.splice(index, 1);
                uni.showToast({ title: '删除地址成功', icon: 'success' });

                // 保存到本地存储
                uni.setStorageSync('addresses', addressList.value);
            }
        },
    });
};
</script>

<style scoped lang="scss">
.address-container {
    padding: 20px;
    padding-bottom: 80px;
    /* 为底部按钮留出空间 */
}

.address-card {
    // background-color: #fff; // 统一白色背景
    display: flex;
    align-items: center;
    padding: 15px;
    margin-bottom: 15px;
    // border-radius: 8px;
    border-bottom: 1px #747474 solid;
    // box-shadow: 0 0px 8px rgba(0, 0, 0, 0.5);

    .default-indicator {
        margin-right: 12px;

        .radio-dot {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 1px solid #ddd;

            &.active {
                border-color: #ff5500;
                background: #ff5500 url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTkgM2wtMTAgsTEwLTRMLE0uNDEgMS40MUw5IDE2LjM0bDEyLjQxLTEyLjQxTDE5IDN6Ii8+PC9zdmc+') center/10px no-repeat;
            }
        }
    }

    .address-info {
        flex: 1;
        margin-right: 15px;
    }

    .address-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .action-item {
            margin-left: 0;
        }
    }
}

.address-info {
    margin-bottom: 10px;
}

.name {
    font-size: 16px;
    font-weight: bold;
    margin-right: 10px;
}

.phone {
    font-size: 14px;
    color: #666;
}

.detail {
    font-size: 14px;
    color: #333;
    margin-top: 5px;
    display: block;
}

.address-actions {
    display: flex;
    justify-content: flex-end;
}

.action-item {
    margin-left: 15px;
}

.action-text {
    font-size: 14px;
    color: #666;
    cursor: pointer;
}

.action-text.active {
    color: #ff5500d2;
    font-weight: bold;
}

.add-address {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background-color: #ff5500cb;
    color: #fff;
    text-align: center;
    padding: 15px;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.add-text {
    font-size: 16px;
    font-weight: bold;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 999;
}

.modal-content {
    background-color: #fff;
    width: 100%;
    padding: 20px;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
}

.modal-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
    display: block;
}

.input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin-bottom: 15px;
    font-size: 14px;
}

.modal-actions {
    display: flex;
    justify-content: space-between;
}

.modal-button {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #ddd;
    color: #333;
    font-size: 14px;
    cursor: pointer;
    margin: 0 5px;
}

.modal-button.confirm {
    background-color: #FF5500;
    color: #fff;
}
</style>