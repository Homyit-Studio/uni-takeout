<template>
    <view class="audit-container">
        <!-- 商户基本信息 -->
        <view class="merchant-info">
            <view class="info-item">
                <text class="label">店铺名称</text>
                <text class="value">{{ merchantInfo.shopName }}</text>
            </view>
            <view class="info-item">
                <text class="label">店铺头像</text>
                <image :src="merchantInfo.shopAvatar" class="shop-avatar"></image>
            </view>
            <view class="info-item">
                <text class="label">店铺简介</text>
                <text class="value">{{ merchantInfo.shopDescription }}</text>
            </view>
            <view class="info-item">
                <text class="label">营业执照</text>
                <image :src="merchantInfo.businessLicense" class="license-image"></image>
            </view>
            <view class="info-item">
                <text class="label">备注</text>
                <text class="value">{{ merchantInfo.otherNotes || '无' }}</text>
            </view>
        </view>

        <!-- 审核状态 -->
        <view class="audit-status">
            <text class="status-label">审核状态：</text>
            <text :class="['status', auditStatusClass]">{{ auditStatusText }}</text>
        </view>

        <!-- 审核操作 -->
        <view class="audit-actions">
            <button class="action-btn approve" @click="handleApprove">通过</button>
            <button class="action-btn reject" @click="handleReject">拒绝</button>
        </view>

        <!-- 备注输入 -->
        <view class="remark-input">
            <textarea v-model="remark" placeholder="请输入审核备注（可选）" class="remark-textarea"></textarea>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            // 商户提交的信息
            merchantInfo: {
                shopName: '拼小圈',
                shopAvatar: '/static/merchant_pic.jpg',
                shopDescription: '一家专注于本地生活服务的店铺',
                businessLicense: '/static/logo.png',
                otherNotes: '希望尽快审核通过',
            },
            auditStatus: 'pending', // 审核状态：pending（待审核）、approved（通过）、rejected（拒绝）
            remark: '', // 审核备注
        };
    },
    computed: {
        // 审核状态文本
        auditStatusText() {
            switch (this.auditStatus) {
                case 'pending':
                    return '待审核';
                case 'approved':
                    return '已通过';
                case 'rejected':
                    return '已拒绝';
                default:
                    return '未知状态';
            }
        },
        // 审核状态样式
        auditStatusClass() {
            switch (this.auditStatus) {
                case 'pending':
                    return 'pending';
                case 'approved':
                    return 'approved';
                case 'rejected':
                    return 'rejected';
                default:
                    return '';
            }
        },
    },
    methods: {
        // 处理通过操作
        handleApprove() {
            uni.showModal({
                title: '提示',
                content: '确定通过该商户的入驻申请吗？',
                success: (res) => {
                    if (res.confirm) {
                        this.auditStatus = 'approved';
                        this.submitAuditResult('approved');
                    }
                },
            });
        },
        // 处理拒绝操作
        handleReject() {
            uni.showModal({
                title: '提示',
                content: '确定拒绝该商户的入驻申请吗？',
                success: (res) => {
                    if (res.confirm) {
                        this.auditStatus = 'rejected';
                        this.submitAuditResult('rejected');
                    }
                },
            });
        },
        // 提交审核结果
        submitAuditResult(status) {
            // 这里可以添加提交审核结果的逻辑，如发送请求到服务器
            console.log('审核结果：', status);
            console.log('审核备注：', this.remark);
            uni.showToast({
                title: `审核${status === 'approved'? '通过' : '拒绝'}成功`,
                icon:'success',
            });
        },
    },
};
</script>

<style scoped>
.audit-container {
    padding: 30px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* 商户信息 */
.merchant-info {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 30px;
    width: 90%;
    max-width: 800px;
}

.info-item {
    margin-bottom: 25px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.label {
    font-size: 16px;
    color: #555555;
    margin-bottom: 10px;
    font-weight: 600;
}

.value {
    font-size: 18px;
    color: #333333;
    font-weight: 400;
}

.shop-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 3px solid #e0e0e0;
    object-fit: cover;
}

.license-image {
    width: 80%;
    height: 100px;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    object-fit: cover;
}

/* 审核状态 */
.audit-status {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 25px;
    margin-bottom: 30px;
    width: 90%;
    max-width: 800px;
    display: flex;
    align-items: center;
}

.status-label {
    font-size: 18px;
    color: #555555;
    font-weight: 600;
}

.status {
    font-size: 18px;
    font-weight: bold;
    margin-left: 15px;
}

.status.pending {
    color: #ff9800; 
}

.status.approved {
    color: #00c853; 
}

.status.rejected {
    color: #ff3d00; 
}

/* 审核操作 */
.audit-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
    width: 90%;
    max-width: 800px;
}

.action-btn {
    flex: 1;
    border-radius: 10px;
    padding: 5px;
    font-size: 18px;
    text-align: center;
    border: none;
    outline: none;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease; 
}

.action-btn.approve {
    background-color: #00c853; 
    color: #ffffff;
    margin-right: 15px;
}

.action-btn.approve:active {
    background-color: #009624; 
    transform: translateY(2px); 
}

.action-btn.reject {
    background-color: #ff3d00; 
    color: #ffffff;
    margin-left: 15px;
}

.action-btn.reject:active {
    background-color: #c51162; 
    transform: translateY(2px); 
}

/* 备注输入 */
.remark-input {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 15px;
    width: 90%;
    max-width: 800px;
}

.remark-textarea {
    width: 100%;
    height: 50px;
    /* border: 1px solid #e0e0e0; */
    border-radius: 10px;
    /* padding: 15px; */
    padding-left: 10px;
    padding-top: 10px;
    font-size: 16px;
    color: #333333;
    background-color: #f5f5f5;
    transition: border-color 0.3s ease;
}

.remark-textarea:focus {
    border-color: #007aff; 
    outline: none;
}
</style>