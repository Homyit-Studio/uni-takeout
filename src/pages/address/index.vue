<template>
    <view class="address-container">
        <!-- 地址列表 -->
        <view class="address-card" v-for="(address, index) in addressList" :key="index">
            <view class="address-info">
                <text class="name">{{ address.name }}</text>
                <text class="phone">{{ address.phone }}</text>
                <text class="detail">{{ address.detail }}</text>
            </view>
            <view class="address-actions">
                <view class="action-item" @click="setDefault(index)">
                    <text :class="['action-text', { 'active': address.isDefault }]">默认</text>
                </view>
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
        <view class="modal" v-if="showModal">
            <view class="modal-content">
                <text class="modal-title">{{ isEditing ? '修改地址' : '添加地址' }}</text>
                <input class="input" v-model="currentAddress.name" placeholder="姓名" />
                <input class="input" v-model="currentAddress.phone" placeholder="电话" />
                <input class="input" v-model="currentAddress.detail" placeholder="详细地址" />
                <view class="modal-actions">
                    <button class="modal-button" @click="closeModal">取消</button>
                    <button class="modal-button confirm" @click="saveAddress">保存</button>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            addressList: [
                {
                    name: '张三',
                    phone: '13401111111',
                    detail: '江西省南昌市南昌县昌东镇 紫阳大道99号江西师范大学',
                    isDefault: true,
                },
                {
                    name: '吴六',
                    phone: '18707070707',
                    detail: '福建理工大学旗山校区北校区',
                    isDefault: false,
                },
                {
                    name: '曾七',
                    phone: '17345678901',
                    detail: '江西省抚州市广昌县',
                    isDefault: false,
                },
            ],
            showModal: false,
            isEditing: false,
            currentAddress: {
                name: '',
                phone: '',
                detail: '',
            },
            editIndex: -1,
        };
    },
    methods: {
        // 打开添加地址弹框
        openAddModal() {
            this.currentAddress = { name: '', phone: '', detail: '' };
            this.isEditing = false;
            this.showModal = true;
        },
        // 打开修改地址弹框
        openEditModal(index) {
            this.currentAddress = { ...this.addressList[index] };
            this.isEditing = true;
            this.editIndex = index;
            this.showModal = true;
        },
        // 关闭弹框
        closeModal() {
            this.showModal = false;
        },
        // 保存地址
        saveAddress() {
            if (this.isEditing) {
                this.addressList[this.editIndex] = { ...this.currentAddress };
            } else {
                this.addressList.push({ ...this.currentAddress });
            }
            this.showModal = false;
        },
        // 设置默认地址
        setDefault(index) {
            this.addressList.forEach((item, i) => {
                item.isDefault = i === index;
            });
        },
        // 删除地址
        deleteAddress(index) {
            uni.showModal({
                title: '提示',
                content: '确定删除该地址吗？',
                success: (res) => {
                    if (res.confirm) {
                        this.addressList.splice(index, 1);
                    }
                },
            });
        },
    },
};
</script>

<style scoped>
.address-container {
    padding: 20px;
    padding-bottom: 80px;
    /* 为底部按钮留出空间 */
}

.address-card {
    background-color: #fff;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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