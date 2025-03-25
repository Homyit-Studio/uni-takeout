// 设置请求拦截器，使得自动拼接请求地址，传token等功能
const baseURL = "https://homyit2023.online:9000"

// 添加拦截器
// 先添加请求
const httpInterceptor = {
    // 该配置表示拦截器前触发
    invoke(options) {
        if (!options.url.startsWith('http')) {
            options.url = baseURL + options.url
        }
        // 请求超时设置
        options.timeout = 10000
        // 添加请求头标识
        options.header = {
            ...options.header
        }
    }
}
uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

// 请求函数
export const request = (options) => {
    // 1. 返回 Promise 对象
    return new Promise((resolve, reject) => {
        uni.request({
            ...options,
            // 响应成功
            success(res) {
                // console.log(res)
                if (res.data?.code >= 200 && res.data?.code < 300) {
                    // 2.1 提取核心数据 res.data
                    // console.log(res)
                    resolve(res.data)
                } else {
                    // console.log(res)
                    // 其他错误 -> 根据后端错误信息轻提示
                    if (res.data?.code == 403) {
                        uni.removeStorageSync("token")
                        uni.showToast({
                            icon: 'none',
                            title: '登录过期',
                        })
                    } else {
                        uni.showToast({
                            icon: 'none',
                            title: res.data?.message || '请重新登录',
                        })
                    }
                    reject(res)
                }
            },
            // 响应失败
            fail(err) {
                uni.showToast({
                    icon: 'none',
                    title: '网络错误，换个网络试试',
                })
                reject(err)
            },
        })
    })
}