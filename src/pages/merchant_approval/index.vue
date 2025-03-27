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
                <image :src="merchantInfo.shopPhoto || '/static/default-avatar.png'" class="shop-avatar"></image>
            </view>
            <view class="info-item">
                <text class="label">店铺地址</text>
                <text class="value">{{ merchantInfo.shopAddress }}</text>
            </view>
            <view class="info-item">
                <text class="label">店铺简介</text>
                <text class="value">{{ merchantInfo.shopIntroduction || '无' }}</text>
            </view>
            <view class="info-item">
                <text class="label">营业执照</text>
                <image :src="merchantInfo.businessLicenseImage || '/static/default-license.png'" class="license-image"></image>
            </view>
            <view class="info-item">
                <text class="label">联系电话</text>
                <text class="value">{{ merchantInfo.shopPhone }}</text>
            </view>
        </view>

        <!-- 审核状态 -->
        <view class="audit-status">
            <text class="status-label">审核状态：</text>
            <text :class="['status', getStatusClass(merchantInfo.applicationStatus)]">
                {{ merchantInfo.applicationStatus || '未知状态' }}
            </text>
        </view>

        <!-- 审核操作 -->
        <view v-if="merchantInfo.applicationStatus === '待审核'" class="audit-actions">
            <button class="action-btn approve" @click="showApproveDialog">通过</button>
            <button class="action-btn reject" @click="showRejectDialog">拒绝</button>
        </view>

        <!-- 审核对话框 -->
        <uni-popup ref="approveDialog" type="dialog">
            <uni-popup-dialog 
                mode="input" 
                title="通过审核" 
                placeholder="请输入审核意见（可选）"
                @confirm="confirmApprove"
            ></uni-popup-dialog>
        </uni-popup>

        <uni-popup ref="rejectDialog" type="dialog">
            <uni-popup-dialog 
                mode="input" 
                title="拒绝审核" 
                placeholder="请输入拒绝原因（建议填写）"
                @confirm="confirmReject"
            ></uni-popup-dialog>
        </uni-popup>
    </view>
</template>

<script>
import { request } from '@/utils/request'

export default {
    data() {
        return {
            merchantId: null,
            merchantInfo: {},
            isLoading: false
        };
    },
    onLoad(options) {
        this.merchantId = parseInt(options.id); 
        this.fetchMerchantInfo();
    },
    methods: {
        // 获取商户信息
        async fetchMerchantInfo() {
            try {
                this.isLoading = true;
                const response = await request({
                    method: 'GET',
                    url: '/admin/getapplications',
                });
                
                if (response && response.data) {
                    const merchant = response.data.find(item => item.id == this.merchantId);
                    if (merchant) {
                        this.merchantInfo = merchant;
                    } else {
                        uni.showToast({
                            title: '未找到商户信息',
                            icon: 'none'
                        });
                        setTimeout(() => {
                            uni.navigateBack();
                        }, 1500);
                    }
                }
            } catch (error) {
                console.error('获取商户信息失败:', error);
                uni.showToast({
                    title: '获取商户信息失败',
                    icon: 'none'
                });
            } finally {
                this.isLoading = false;
            }
        },
        
        // 获取状态对应的CSS类名
        getStatusClass(status) {
            switch (status) {
                case '待审核': return 'pending';
                case '审核通过': return 'approved';
                case '审核不通过': return 'rejected';
                default: return 'unknown';
            }
        },
        
        // 显示通过审核对话框
        showApproveDialog() {
            this.$refs.approveDialog.open();
        },
        
        // 显示拒绝审核对话框
        showRejectDialog() {
            this.$refs.rejectDialog.open();
        },
        
        // 确认通过审核
        confirmApprove(comment) {
            uni.showModal({
                title: '确认通过',
                content: '确定要通过该商户的申请吗？',
                success: (res) => {
                    if (res.confirm) {
                        this.submitAuditResult('审核通过', comment);
                    }
                }
            });
        },
        
        // 确认拒绝审核
        confirmReject(comment) {
            if (!comment) {
                uni.showModal({
                    title: '提示',
                    content: '建议填写拒绝原因，是否继续提交？',
                    success: (res) => {
                        if (res.confirm) {
                            this.submitAuditResult('审核不通过', comment);
                        }
                    }
                });
            } else {
                uni.showModal({
                    title: '确认拒绝',
                    content: '确定要拒绝该商户的申请吗？',
                    success: (res) => {
                        if (res.confirm) {
                            this.submitAuditResult('审核不通过', comment);
                        }
                    }
                });
            }
        },
        
        // 提交审核结果
        async submitAuditResult(status, comment = '') {
            try {
                this.isLoading = true;
                // 确保 merchantId 是整数
                const id = Number.isInteger(this.merchantId) ? this.merchantId : parseInt(this.merchantId);
                // 构建 URL 参数
                const queryParams = `id=${id}&applicationStatus=${encodeURIComponent(status)}&auditComment=${encodeURIComponent(comment)}`;
                // 拼接完整的请求 URL
                const url = `/admin/auditapplication?${queryParams}`;

                const response = await request({
                    method: 'POST',
                    url: url
                });
                
                if (response) {
                    uni.showToast({
                        title: `审核${status === '审核通过' ? '通过' : '拒绝'}成功`,
                        icon: 'success'
                    });
                    this.merchantInfo.applicationStatus = status;
                    setTimeout(() => {
                        uni.navigateBack();
                    }, 1500);
                }
            } catch (error) {
                console.error('提交审核结果失败:', error);
                uni.showToast({
                    title: '提交审核结果失败',
                    icon: 'none'
                });
            } finally {
                this.isLoading = false;
            }
        }
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
    background-color: #f5f5f5;
}

/* 商户信息 */
.merchant-info {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 30px;
    width: 90%;
    max-width: 800px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    height: 200px;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    object-fit: contain;
    background-color: #f9f9f9;
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.status.unknown {
    color: #999;
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
    padding: 15px;
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
</style>