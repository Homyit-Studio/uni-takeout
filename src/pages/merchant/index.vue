<template>
    <view class="merchant-entry-container">
        <!-- 店铺名称输入 -->
        <view class="input-item">
            <view class="label"><span class="required">*</span>店铺名称</view>
            <input v-model="shopName" placeholder="请输入店铺名称" />
        </view>

        <!-- 店铺头像上传 -->
        <view class="input-item">
            <view class="label"><span class="required">*</span>店铺头像</view>
            <view class="upload-avatar">
                <image v-if="shopAvatar" :src="shopAvatar" mode="aspectFill"></image>
                <view v-else class="upload-placeholder" @click="chooseAvatar">点击上传</view>
            </view>
        </view>

        <!-- 店铺简介输入 -->
        <view class="input-item">
            <view class="label"><span class="required">*</span>店铺简介</view>
            <textarea v-model="shopDescription" placeholder="请输入店铺简介"></textarea>
        </view>

        <!-- 营业执照上传 -->
        <view class="input-item">
            <view class="label"><span class="required">*</span>营业执照</view>
            <view class="upload-license">
                <image v-if="businessLicense" :src="businessLicense" mode="aspectFill"></image>
                <view v-else class="upload-placeholder" @click="chooseLicense">点击上传</view>
            </view>
        </view>

        <!-- 是否有食品安全许可证 -->
        <view class="input-item">
           <view class="label"><span class="required">*</span>是否有食品安全许可证</view>
        <radio-group v-model="hasFoodSafetyLicense" class="radio-group">
            <label class="radio-item">
                <radio value="有" class="radio-input" />有
            </label>
            <label class="radio-item">
                <radio value="无" class="radio-input" />无
            </label>
        </radio-group>
        </view>

        <!-- 其他问题和备注 -->
        <view class="input-item">
            <view class="label">其他问题和备注</view>
            <textarea v-model="otherNotes" placeholder="如什么时间方便联系？"></textarea>
        </view>

        <!-- 提交按钮 -->
        <button class="submit-btn" @click="submitForm">提交入驻申请</button>
    </view>
</template>

<script>
export default {
    data() {
        return {
            shopName: '',
            shopAvatar: '',
            shopDescription: '',
            businessLicense: '',
            hasFoodSafetyLicense: '',
            otherNotes: ''
        };
    },
    methods: {
        // 选择店铺头像
        chooseAvatar() {
            uni.chooseImage({
                count: 1,
                success: (res) => {
                    this.shopAvatar = res.tempFilePaths[0];
                },
                fail: (err) => {
                    console.error('选择头像失败:', err);
                }
            });
        },
        // 选择营业执照
        chooseLicense() {
            uni.chooseImage({
                count: 1,
                success: (res) => {
                    this.businessLicense = res.tempFilePaths[0];
                },
                fail: (err) => {
                    console.error('选择营业执照失败:', err);
                }
            });
        },
        // 提交表单
        submitForm() {
            if (!this.shopName || !this.shopAvatar || !this.shopDescription || !this.businessLicense || !this.hasFoodSafetyLicense) {
                uni.showToast({
                    title: '请完善所有必填信息',
                    icon: 'none'
                });
                return;
            }
            // 这里可以添加实际的提交逻辑，如发送请求到服务器
            console.log('提交的信息:', {
                shopName: this.shopName,
                shopAvatar: this.shopAvatar,
                shopDescription: this.shopDescription,
                businessLicense: this.businessLicense,
                hasFoodSafetyLicense: this.hasFoodSafetyLicense,
                otherNotes: this.otherNotes
            });
            uni.showToast({
                title: '提交成功',
                icon:'success'
            });
        }
    }
};
</script>

<style scoped>
.merchant-entry-container {
    padding: 20px;
    background-color: #f5f5f5;
}

.input-item {
    background-color: #fff;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.label {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.required {
    color: red;
    margin-right: 5px;
}

input,
textarea {
    width: 100%;
    border: none;
    outline: none;
    font-size: 14px;
    padding: 10px;
    border-radius: 4px;
}

textarea {
    height: 100px;
}

.upload-avatar,
.upload-license {
    width: 100px;
    height: 100px;
    border: 1px dashed #ccc;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f9f9f9;
}

.upload-placeholder {
    color: #999;
    font-size: 14px;
}

image {
    width: 100%;
    height: 100%;
    border-radius: 8px;
}

.radio-group {
    display: flex;
    align-items: center;
    gap: 20px; /* 调整两个选项之间的间距 */
}

.radio-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
}

.radio-input {
    margin-right: 8px; /* 调整 radio 按钮和文字之间的间距 */
}

.submit-btn {
    background-color: #ff9a9e;
    color: #fff;
    border-radius: 8px;
    padding: 12px;
    font-size: 16px;
    text-align: center;
    width: 100%;
    margin-top: 20px;
    border: none;
    outline: none;
    cursor: pointer;
}

.submit-btn:active {
    background-color: #e88a8e;
}
</style>