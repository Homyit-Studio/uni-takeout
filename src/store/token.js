// 封装的 token 操作方法
export const useTokenStore = () => {
    // 硬编码的 token
    const hardcodedToken = 'a0d051a9-0f3a-44f6-9c3a-97edc1e10011';

    const setToken = (token) => {
        // 如果需要保留设置功能，可以取消下面这行注释
        // uni.setStorageSync('token_key', token);
    };

    const getToken = () => {
        // 直接返回硬编码的 token
        return hardcodedToken;

        // 如果需要保留从存储获取的功能，可以使用下面这行
        // return uni.getStorageSync('token_key') || hardcodedToken;
    };

    const removeToken = () => {
        uni.removeStorageSync('token_key');
    };

    return {
        setToken,
        getToken,
        removeToken
    };
};