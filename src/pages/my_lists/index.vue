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
                <text class="label">店铺地址</text>
                <text class="value">{{ merchantInfo.shopAddress }}</text>
            </view>
            <view class="info-item">
                <text class="label">店铺简介</text>
                <text class="value">{{ merchantInfo.shopDescription }}</text>
            </view>
            <view class="info-item">
                <text class="label">营业执照</text>
                <image :src="merchantInfo.businessLicense" class="license-image"></image>
            </view>
        </view>

        <!-- 审核状态 -->
        <view class="audit-status">
            <text class="status-label">审核状态：</text>
            <text :class="['status', auditStatusClass]">{{ auditStatusText }}</text>
        </view>

        <!-- 审核反馈意见 -->
        <view class="audit-feedback" v-if="auditStatus !== 'pending'">
            <view class="feedback-header">
                <text class="feedback-title">审核反馈意见:</text>
            </view>
            <view class="feedback-content">
                <text>{{ auditFeedback || '暂无反馈意见' }}</text>
            </view>
        </view>

        <!-- 底部操作按钮 -->
        <view class="bottom-actions" v-if="auditStatus === 'rejected'">
            <button class="action-btn resubmit" @click="handleResubmit">重新提交申请</button>
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
                shopAddress: '北京市朝阳区某街道某号',
                shopDescription: '一家专注于本地生活服务的店铺',
                businessLicense: '/static/logo.png'
            },
            auditStatus: 'rejected', // 审核状态：pending（待审核）、approved（通过）、rejected（拒绝）
            auditFeedback: '营业执照照片不清晰，请重新上传高清版本', // 审核反馈意见
        };
    },
    computed: {
        // 审核状态文本
        auditStatusText() {
            switch (this.auditStatus) {
                case 'pending':
                    return '审核中';
                case 'approved':
                    return '审核通过';
                case 'rejected':
                    return '审核未通过';
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
        // 重新提交申请
        handleResubmit() {
            uni.showModal({
                title: '提示',
                content: '确定要重新提交入驻申请吗？',
                success: (res) => {
                    if (res.confirm) {
                        uni.showToast({
                            title: '已重新提交申请',
                            icon: 'success'
                        });
                        // 这里可以添加重新提交申请的逻辑
                    }
                },
            });
        },
    },
};
</script>

<style scoped>
.audit-container {
    padding: 20px;
    min-height: 100vh;
    background-color: #f5f7fa;
}

/* 商户信息 */
.merchant-info {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-item {
    margin-bottom: 20px;
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
    font-size: 16px;
    color: #333;
    font-weight: 400;
    line-height: 1.5;
}

.shop-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 2px solid #f0f0f0;
    object-fit: cover;
}

.license-image {
    width: 100%;
    height: 150px;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
    object-fit: contain;
    background-color: #fafafa;
}

/* 审核状态 */
.audit-status {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 15px 20px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.status-label {
    font-size: 16px;
    color: #555555;
    margin-bottom: 10px;
    font-weight: 600;
}

.status {
    font-size: 16px;
    font-weight: bold;
    margin-left: 10px;
}

.status.pending {
    color: #FF9500; /* 橙色 */
}

.status.approved {
    color: #07C160; /* 绿色 */
}

.status.rejected {
    color: #FF2D55; /* 红色 */
}

/* 审核反馈意见 */
.audit-feedback {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.feedback-header {
    margin-bottom: 10px;
}

.feedback-title {
  padding-left: 5px;
    font-size: 16px;
    color: #555555;
    margin-bottom: 10px;
    font-weight: 600;
}

.feedback-content {
    font-size: 15px;
    color: #333;
    line-height: 1.5;
    padding: 10px;
    border-radius: 8px;
}

/* 底部操作按钮 */
.bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 15px 20px;
    background-color: #ffffff;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.action-btn {
    width: 100%;
    height: 48px;
    line-height: 48px;
    border-radius: 8px;
    font-size: 16px;
    text-align: center;
    border: none;
    outline: none;
    transition: all 0.3s;
}

.action-btn.resubmit {
    background-color: #07C160;
    color: #ffffff;
}

.action-btn.resubmit:active {
    background-color: #06AD56;
    transform: translateY(1px);
}
</style>