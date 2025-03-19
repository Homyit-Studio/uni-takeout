<template>
    <view class="merchant-management-container">
        <!-- 顶部商铺信息 -->
        <view class="merchant-header">
            <image :src="shopAvatar" class="shop-avatar"></image>
            <text class="shop-name">{{ shopName }}</text>
        </view>

        <!-- 功能导航 -->
        <view class="function-nav">
            <view class="nav-item" @click="navigateTo('merchantApproval')">
                <uni-icons type="compose" size="30" color="#007aff"></uni-icons>
                <text class="nav-text">入驻商户审核</text>
            </view>
        </view>

        <!-- 功能描述 -->
        <view class="function-description">
            <text class="description-text">请选择上方功能以管理商户</text>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            shopName: '拼小圈',
            shopAvatar: '/static/merchant_pic.jpg',
        };
    },
    methods: {
        // 导航到指定功能页面
        navigateTo(section) {
            let url = '';
            switch (section) {
                case 'merchantApproval':
                    url = '/pages/merchant_approval/index';
                    break;
            }
            uni.navigateTo({
                url: url,
            });
        },
    },
};
</script>

<style scoped>
.merchant-management-container {
    padding: 20px;
    background-color: #f5f5f5;
    min-height: 100vh;
}

.merchant-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.shop-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-right: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.shop-name {
    font-size: 20px;
    font-weight: bold;
    color: #333;
}

.function-nav {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
    background-color: #fff;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
}

.nav-text {
    font-size: 14px;
    color: #333;
    margin-top: 5px;
}

.function-description {
    background-color: #fff;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.description-text {
    font-size: 16px;
    color: #666;
}
</style>