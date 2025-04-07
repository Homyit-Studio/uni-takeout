// 封装的 token 操作方法
export const useTokenStore = () => {
    const setToken = (token) => {
        uni.setStorageSync('token_key', `00615db5-49b4-484c-a474-7f24217aaafa`);
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
