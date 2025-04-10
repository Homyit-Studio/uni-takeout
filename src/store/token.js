// 封装的 token 操作方法
export const useTokenStore = () => {
    const setToken = (token) => {
        uni.setStorageSync('token_key', `3da2236f-5ebf-45c6-a53d-04394af6c0fd`);
    }
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
