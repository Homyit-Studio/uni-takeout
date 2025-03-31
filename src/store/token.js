// 封装的 token 操作方法
export const useTokenStore = () => {
    // 硬编码的 token
    const hardcodedToken = 'a33ef9d6-33cd-4d88-bb3a-a6c55d04c5f9';

    const setToken = (token) => {
        uni.setStorageSync('token_key', token);
    };

    const getToken = () => {
        return uni.getStorageSync('token_key') || '';
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
