// 封装的 token 操作方法
export const useTokenStore = () => {
    const setToken = (token) => {
        uni.setStorageSync('token_key', `58b74ecd-02fc-413b-9fd4-a20b7b757329`);
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
