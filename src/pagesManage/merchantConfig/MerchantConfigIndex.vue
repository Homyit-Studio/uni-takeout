<template>
    <view class="config-container">
        <view class="notice-box">
            <text class="notice-title">重要提示：</text>
            <text class="notice-content">请确保您已关联以下小程序APPID：</text>
            <text class="appid" @click="copyAppId">wx0391cb325faccbaa</text>
            <text class="copy-hint">(点击复制)</text>
        </view>

        <form @submit="handleSubmit" class="config-form">
            <view class="form-section">
                <text class="section-title">微信支付配置信息</text>

                <view class="form-item">
                    <text class="label">商户号</text>
                    <input v-model="formData.mchid" placeholder="请输入微信支付商户号" class="input-field" />
                </view>

                <view class="form-item">
                    <text class="label">商户API证书序列号</text>
                    <input v-model="formData.mchSerialNo" placeholder="请输入商户API证书序列号" class="input-field" />
                </view>

                <view class="form-item">
                    <text class="label">商户私钥文件</text>
                    <view class="file-upload">
                        <button @click="selectFiles('private')" type="default" class="upload-btn">选择私钥文件</button>
                        <text v-if="formData.privateKeyFileName" class="file-name">{{ formData.privateKeyFileName
                            }}</text>
                    </view>
                    <text class="file-hint">请上传key.pem格式的商户私钥文件</text>
                </view>

                <view class="form-item">
                    <text class="label">APIv3密钥</text>
                    <input v-model="formData.apiV3Key" placeholder="请输入APIv3密钥" type="password" class="input-field" />
                </view>

                <view class="form-item">
                    <text class="label">微信支付平台证书</text>
                    <view class="file-upload">
                        <button @click="selectFiles('cert')" type="default" class="upload-btn">选择平台证书</button>
                        <text v-if="formData.weChatPayCertFileName" class="file-name">{{ formData.weChatPayCertFileName
                            }}</text>
                    </view>
                    <text class="file-hint">请上传wechatpay.pem格式的平台证书文件</text>
                </view>

                <view class="form-item">
                    <text class="label">平台证书序列号</text>
                    <input v-model="formData.serialNo" placeholder="请输入平台证书序列号" class="input-field" />
                </view>
            </view>

            <button type="primary" form-type="submit" class="submit-btn">{{ isEdit ? '更新配置' : '提交配置' }}</button>
        </form>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { request } from '@/utils/request'
import { onLoad } from '@dcloudio/uni-app'

const formData = ref({
    shopid: 0,
    mchid: '',
    mchSerialNo: '',
    privateKeyFilePath: '',
    privateKeyFileName: '',
    apiV3Key: '',
    weChatPayCertFilePath: '',
    weChatPayCertFileName: '',
    serialNo: '',
    wxpayId: ''
})

const isEdit = ref(false)
const tempFiles = ref({
    private: null,
    cert: null
})

const getConfig = async () => {
    try {
        const res = await request({
            url: `/merchant/getWxPayConfig/${formData.value.shopid}`,
            method: 'GET'
        })
        if (res.data) {
            formData.value = {
                ...formData.value,
                ...res.data,
                wxpayId: res.data.id
            }
            isEdit.value = true
        }
    } catch (error) {
        console.error('获取配置失败:', error)
        uni.showToast({
            title: '获取配置信息失败',
            icon: 'none'
        })
    }
}

const selectFiles = async (type) => {
    try {
        const res = await uni.chooseMessageFile({
            count: 1,
            type: 'file',
            extension: ['.pem']
        })

        if (!res.tempFiles || res.tempFiles.length === 0) {
            throw new Error('未选择文件')
        }

        const file = res.tempFiles[0]
        if (!file.name.endsWith('.pem')) {
            uni.showToast({
                title: '请选择.pem格式的文件',
                icon: 'none'
            })
            return
        }

        tempFiles.value[type] = file
        if (type === 'private') {
            formData.value.privateKeyFileName = file.name
        } else {
            formData.value.weChatPayCertFileName = file.name
        }
    } catch (error) {
        console.error('文件选择失败:', error)
        uni.showToast({
            title: '文件选择失败',
            icon: 'none'
        })
    }
}

const handleSubmit = async () => {
    try {
        // 验证必填字段
        const requiredFields = [
            { field: 'mchid', message: '请输入微信支付商户号' },
            { field: 'mchSerialNo', message: '请输入商户API证书序列号' },
            { field: 'apiV3Key', message: '请输入APIv3密钥' },
            { field: 'serialNo', message: '请输入平台证书序列号' }
        ]

        for (const { field, message } of requiredFields) {
            if (!formData.value[field]) {
                uni.showToast({
                    title: message,
                    icon: 'none'
                })
                return
            }
        }

        // 验证文件
        if (!tempFiles.value.private) {
            uni.showToast({
                title: '请上传商户私钥文件',
                icon: 'none'
            })
            return
        }
        if (!tempFiles.value.cert) {
            uni.showToast({
                title: '请上传微信支付平台证书',
                icon: 'none'
            })
            return
        }

        // 上传文件
        const [privateRes, certRes] = await Promise.all([
            uni.uploadFile({
                url: '/upload/file',
                filePath: tempFiles.value.private.path,
                name: 'file'
            }),
            uni.uploadFile({
                url: '/upload/file',
                filePath: tempFiles.value.cert.path,
                name: 'file'
            })
        ])
        console.log('上传文件结果:', privateRes, certRes)

        const privateKeyData = JSON.parse(privateRes.data)
        const certData = JSON.parse(certRes.data)
        console.log('上传文件成功:', privateKeyData, certData)
        // 准备提交数据
        const submitData = {
            shopid: formData.value.shopid,
            mchid: formData.value.mchid,
            mchSerialNo: formData.value.mchSerialNo,
            privateKeyFilePath: privateKeyData.data,
            apiV3Key: formData.value.apiV3Key,
            weChatPayCertFilePath: certData.data,
            serialNo: formData.value.serialNo,
        }
        console.log('提交数据:', formData.value.wxpayId)
        if (isEdit.value && formData.value.wxpayId) {
            submitData.wxpayId = formData.value.wxpayId
        }
        console.log('提交数据:', submitData)

        // 提交数据
        const url = isEdit.value ? '/merchant/updateWxPayConfig' : '/merchant/setWxPayConfig'
        await request({
            url,
            method: 'POST',
            data: submitData
        })

        uni.showToast({
            title: isEdit.value ? '配置更新成功' : '配置保存成功',
            icon: 'success'
        })

        // 重置临时文件
        tempFiles.value = { private: null, cert: null }

    } catch (error) {
        console.error('配置提交失败:', error)
        uni.showToast({
            title: '配置提交失败，请检查后重试',
            icon: 'none'
        })
    }
}

const copyAppId = () => {
    uni.setClipboardData({
        data: 'wx0391cb325faccbaa',
        success: () => {
            uni.showToast({
                title: '小程序APPID已复制',
                icon: 'none'
            })
        }
    })
}

onLoad((options) => {
    if (options.id) {
        formData.value.shopid = parseInt(options.id)
        getConfig()
    }
})
</script>

<style scoped lang="scss">
.config-container {
    box-sizing: border-box;
    padding: 24rpx;
    background-color: #f5f7fa;


    .notice-box {
        background-color: #f0f7ff;
        padding: 24rpx;
        margin-bottom: 32rpx;
        border-radius: 8rpx;
        border-left: 4rpx solid #ff5500;
    }

    .notice-title {
        font-weight: bold;
        color: #303133;
        margin-right: 12rpx;
    }

    .notice-content {
        color: #606266;
        font-size: 28rpx;
    }

    .appid {
        color: #ff5500;
        font-weight: bold;
        margin: 0 8rpx;
    }

    .copy-hint {
        color: #909399;
        font-size: 24rpx;
    }

    .config-form {
        box-sizing: border-box;
        // background-color: #ffffff;
        border-radius: 12rpx;
        padding: 32rpx;
        // box-shadsow: 0 2rpx 12rpx 0 rgba(0, 0, 0, 0.05);
    }

    .form-section {
        box-sizing: border-box;
        margin-bottom: 40rpx;

        .section-title {
            display: block;
            font-size: 32rpx;
            font-weight: bold;
            color: #303133;
            margin-bottom: 32rpx;
            padding-bottom: 16rpx;
            border-bottom: 1rpx solid #ebeef5;
        }

        .form-item {
            box-sizing: border-box;
            margin-bottom: 32rpx;
        }

        .label {
            display: block;
            font-size: 28rpx;
            color: #606266;
            margin-bottom: 16rpx;
            font-weight: 500;
        }

        .input-field {
            // width: 100%;
            height: 88rpx;
            border: 1rpx solid #dcdfe6;
            border-radius: 8rpx;
            padding: 0 24rpx;
            font-size: 28rpx;
            background-color: #fafafa;

            &:focus {
                border-color: #ff5500;
            }
        }

        .file-upload {
            display: flex;
            align-items: center;
            margin-bottom: 8rpx;
        }

    }


    .upload-btn {
        background-color: #f5f7fa;
        color: #606266;
        font-size: 26rpx;
        height: 72rpx;
        line-height: 72rpx;
        border: 1rpx dashed #c0c4cc;
    }

    .file-name {
        margin-left: 20rpx;
        font-size: 26rpx;
        color: #67c23a;
        flex: 1;
        word-break: break-all;
    }

    .file-hint {
        font-size: 24rpx;
        color: #909399;
    }

    .submit-btn {
        width: 100%;
        height: 88rpx;
        line-height: 88rpx;
        font-size: 32rpx;
        margin-top: 48rpx;
        background-color: #ff5500;
        border-radius: 8rpx;
    }
}
</style>