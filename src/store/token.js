// 封装的 token 操作方法
export const useTokenStore = () => {
    const setToken = (token) => {
        uni.setStorageSync('token_key', `6c05007c-a84c-4e4d-9c3e-702e43bd6f44`);
    };

    const getToken = () => {
        return uni.getStorageSync('token_key');
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
