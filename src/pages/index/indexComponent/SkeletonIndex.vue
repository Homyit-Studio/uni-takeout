<!--
此文件为开发者工具生成，生成时间: 2025/4/8下午8:28:46
使用方法：
在 D:\Desktop\WeTakeout\we-takeout\dist\dev\mp-weixin\pages\index\index.wxml 引入模板

```
<import src="index.skeleton.wxml"/>
<template is="skeleton" wx:if="{{loading}}" />
```

在 D:\Desktop\WeTakeout\we-takeout\dist\dev\mp-weixin\pages\index\index.wxss 中引入样式
```
@import "./index.skeleton.wxss";
```

更多详细信息可以参考文档：https://developers.weixin.qq.com/miniprogram/dev/devtools/skeleton.html
-->
<template name="skeleton">
    <view class="sk-container">
        <view>
            <view is="pages/index/indexComponent/UserIndexComponent">
                <view
                    class="container UserIndexComponent--container data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                    <view
                        class="first-nav UserIndexComponent--first-nav data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-image"
                        style="transform:scale(1);padding-top:47px">
                        <view
                            class="nav-content UserIndexComponent--nav-content data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                            <view
                                class="nav-left UserIndexComponent--nav-left data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                <view
                                    class="location-icon UserIndexComponent--location-icon data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                    <view is="node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons"
                                        class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a"
                                        style="margin-left:5px;margin-right:-5px">
                                        <text
                                            class="uni-icons icons--uni-icons uniui-location-filled icons--uniui-location-filled sk-pseudo sk-pseudo-circle"
                                            style="color: #fff; font-size: 18px;"></text>
                                    </view>
                                    <text
                                        class="address-text UserIndexComponent--address-text data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-73 sk-text">请添加地址
                                        &gt;</text>
                                    <view is="node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons"
                                        class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                        <text class="uni-icons icons--uni-icons uniui-arrowdown icons--uniui-arrowdown"
                                            style="color: #fff; font-size: 14px;"></text>
                                    </view>
                                </view>
                                <view
                                    class="app-name UserIndexComponent--app-name data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-942 sk-text">
                                    校园购</view>
                            </view>
                            <view
                                class="nav-right UserIndexComponent--nav-right data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                            </view>
                        </view>
                        <view
                            class="search-box UserIndexComponent--search-box data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                            <view
                                class="search-input UserIndexComponent--search-input data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                <text
                                    class="placeholder UserIndexComponent--placeholder data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-341 sk-text">搜索商家、美食</text>
                            </view>
                            <view is="node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons"
                                class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a" style="padding:0 25px">
                                <text
                                    class="uni-icons icons--uni-icons uniui-search icons--uniui-search sk-pseudo sk-pseudo-circle"
                                    style="color: #999; font-size: 30px;"></text>
                            </view>
                        </view>
                        <swiper autoplay="false" circular="true"
                            class="banner-swiper UserIndexComponent--banner-swiper data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a"
                            indicator-active-color="#FF719A" current="0"></swiper>
                    </view>
                    <view
                        class="choice-container UserIndexComponent--choice-container data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                    </view>
                    <view
                        class="tabs-container UserIndexComponent--tabs-container data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a"
                        style="top:87px;">
                        <view class="tabs UserIndexComponent--tabs data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                            <view
                                class="tab-item UserIndexComponent--tab-item data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a active UserIndexComponent--active sk-transparent">
                                热门拼团
                                <view
                                    class="tab-line UserIndexComponent--tab-line data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                </view>
                            </view>
                            <view
                                class="tab-item UserIndexComponent--tab-item data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-16 sk-text"
                                style="background-position-x: 50%;">附近商铺 </view>
                            <view
                                class="goTo-item UserIndexComponent--goTo-item data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                <view is="node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons"
                                    class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                    <text
                                        class="uni-icons icons--uni-icons uniui-gift-filled icons--uniui-gift-filled sk-pseudo sk-pseudo-circle"
                                        style="color: #FF5500; font-size: 32px;"></text>
                                </view>
                                <text
                                    class="goTo-text UserIndexComponent--goTo-text data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-989 sk-text">去抽奖</text>
                            </view>
                        </view>
                    </view>
                    <view
                        class="scrolling-alert UserIndexComponent--scrolling-alert data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                        <view is="node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons"
                            class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a"
                            style="position:absolute;left:10px;top:55%;transform:translateY(-50%)">
                            <text
                                class="uni-icons icons--uni-icons uniui-sound icons--uniui-sound sk-pseudo sk-pseudo-circle"
                                style="color: #ff9900; font-size: 20px;"></text>
                        </view>
                        <view
                            class="scroll-container UserIndexComponent--scroll-container data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                            <view
                                class="scroll-content UserIndexComponent--scroll-content data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                <text
                                    class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a scroll-item UserIndexComponent--scroll-item item-enter UserIndexComponent--item-enter sk-transparent sk-text-28-3333-576 sk-text">z**
                                    正在参与 1 的拼团 最近7人正在拼团... </text>
                            </view>
                        </view>
                    </view>
                    <view
                        class="content UserIndexComponent--content data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                        <view
                            class="tab-content UserIndexComponent--tab-content data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                            <view
                                class="group-list UserIndexComponent--group-list data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                <view
                                    class="group-card UserIndexComponent--group-card data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                    <view
                                        class="store-header UserIndexComponent--store-header data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                        <image
                                            class="store-avatar UserIndexComponent--store-avatar data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-image"
                                            mode="aspectFill"></image>
                                        <text
                                            class="store-name UserIndexComponent--store-name data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-323 sk-text">1</text>
                                        <view
                                            class="countdown-tag UserIndexComponent--countdown-tag data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                            <view is="node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons"
                                                class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                <text class="uni-icons icons--uni-icons uniui-clock icons--uniui-clock"
                                                    style="color: #FF5500; font-size: 14px;"></text>
                                            </view>
                                            <text
                                                class="countdown-text UserIndexComponent--countdown-text data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-777 sk-text">37天0时</text>
                                        </view>
                                    </view>
                                    <view class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a"
                                        style="overflow:hidden">
                                        <scroll-view scroll-x="true"
                                            class="product-scroll UserIndexComponent--product-scroll data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                            <view
                                                class="product-images UserIndexComponent--product-images data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                <image
                                                    class="product-image UserIndexComponent--product-image data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-image"
                                                    mode="aspectFill"></image>
                                                <image
                                                    class="product-image UserIndexComponent--product-image data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-image"
                                                    mode="aspectFill"></image>
                                                <image
                                                    class="product-image UserIndexComponent--product-image data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-image"
                                                    mode="aspectFill"></image>
                                            </view>
                                        </scroll-view>
                                    </view>
                                    <view
                                        class="product-footer UserIndexComponent--product-footer data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                        <view
                                            class="group-info UserIndexComponent--group-info data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                            <text
                                                class="current-amount UserIndexComponent--current-amount data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-501 sk-text">已拼9.09元</text>
                                            <view
                                                class="group-users-scroll UserIndexComponent--group-users-scroll data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                <scroll-view scroll-x="true"
                                                    class="users-scroll UserIndexComponent--users-scroll data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                    <view
                                                        class="users-list UserIndexComponent--users-list data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                        <text
                                                            class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a user-item UserIndexComponent--user-item item-enter UserIndexComponent--item-enter sk-transparent sk-text-14-2857-290 sk-text">z**正在拼团...
                                                        </text>
                                                    </view>
                                                </scroll-view>
                                            </view>
                                            <text
                                                class="member-count UserIndexComponent--member-count data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-402 sk-text">7人正在拼团</text>
                                        </view>
                                    </view>
                                </view>
                            </view>
                            <view
                                class="group-list UserIndexComponent--group-list data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                <view
                                    class="group-card UserIndexComponent--group-card data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                    <view
                                        class="store-header UserIndexComponent--store-header data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                        <image
                                            class="store-avatar UserIndexComponent--store-avatar data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-image"
                                            mode="aspectFill"></image>
                                        <text
                                            class="store-name UserIndexComponent--store-name data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-323 sk-text">1</text>
                                        <view
                                            class="countdown-tag UserIndexComponent--countdown-tag data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                            <view is="node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons"
                                                class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                <text class="uni-icons icons--uni-icons uniui-clock icons--uniui-clock"
                                                    style="color: #FF5500; font-size: 14px;"></text>
                                            </view>
                                            <text
                                                class="countdown-text UserIndexComponent--countdown-text data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-777 sk-text">37天0时</text>
                                        </view>
                                    </view>
                                    <view class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a"
                                        style="overflow:hidden">
                                        <scroll-view scroll-x="true"
                                            class="product-scroll UserIndexComponent--product-scroll data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                            <view
                                                class="product-images UserIndexComponent--product-images data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                <image
                                                    class="product-image UserIndexComponent--product-image data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-image"
                                                    mode="aspectFill"></image>
                                                <image
                                                    class="product-image UserIndexComponent--product-image data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-image"
                                                    mode="aspectFill"></image>
                                                <image
                                                    class="product-image UserIndexComponent--product-image data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-image"
                                                    mode="aspectFill"></image>
                                            </view>
                                        </scroll-view>
                                    </view>
                                    <view
                                        class="product-footer UserIndexComponent--product-footer data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                        <view
                                            class="group-info UserIndexComponent--group-info data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                            <text
                                                class="current-amount UserIndexComponent--current-amount data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-501 sk-text">已拼9.09元</text>
                                            <view
                                                class="group-users-scroll UserIndexComponent--group-users-scroll data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                <scroll-view scroll-x="true"
                                                    class="users-scroll UserIndexComponent--users-scroll data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                    <view
                                                        class="users-list UserIndexComponent--users-list data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                        <text
                                                            class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a user-item UserIndexComponent--user-item item-enter UserIndexComponent--item-enter sk-transparent sk-text-14-2857-290 sk-text">z**正在拼团...
                                                        </text>
                                                    </view>
                                                </scroll-view>
                                            </view>
                                            <text
                                                class="member-count UserIndexComponent--member-count data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-402 sk-text">7人正在拼团</text>
                                        </view>
                                    </view>
                                </view>
                            </view>
                            <view
                                class="group-list UserIndexComponent--group-list data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                <view
                                    class="group-card UserIndexComponent--group-card data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                    <view
                                        class="store-header UserIndexComponent--store-header data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                        <image
                                            class="store-avatar UserIndexComponent--store-avatar data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-image"
                                            mode="aspectFill"></image>
                                        <text
                                            class="store-name UserIndexComponent--store-name data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-323 sk-text">1</text>
                                        <view
                                            class="countdown-tag UserIndexComponent--countdown-tag data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                            <view is="node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons"
                                                class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                <text class="uni-icons icons--uni-icons uniui-clock icons--uniui-clock"
                                                    style="color: #FF5500; font-size: 14px;"></text>
                                            </view>
                                            <text
                                                class="countdown-text UserIndexComponent--countdown-text data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-777 sk-text">37天0时</text>
                                        </view>
                                    </view>
                                    <view class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a"
                                        style="overflow:hidden">
                                        <scroll-view scroll-x="true"
                                            class="product-scroll UserIndexComponent--product-scroll data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                            <view
                                                class="product-images UserIndexComponent--product-images data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                <image
                                                    class="product-image UserIndexComponent--product-image data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-image"
                                                    mode="aspectFill"></image>
                                                <image
                                                    class="product-image UserIndexComponent--product-image data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-image"
                                                    mode="aspectFill"></image>
                                                <image
                                                    class="product-image UserIndexComponent--product-image data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-image"
                                                    mode="aspectFill"></image>
                                            </view>
                                        </scroll-view>
                                    </view>
                                    <view
                                        class="product-footer UserIndexComponent--product-footer data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                        <view
                                            class="group-info UserIndexComponent--group-info data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                            <text
                                                class="current-amount UserIndexComponent--current-amount data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-501 sk-text">已拼9.09元</text>
                                            <view
                                                class="group-users-scroll UserIndexComponent--group-users-scroll data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                <scroll-view scroll-x="true"
                                                    class="users-scroll UserIndexComponent--users-scroll data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                    <view
                                                        class="users-list UserIndexComponent--users-list data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                                                        <text
                                                            class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a user-item UserIndexComponent--user-item item-enter UserIndexComponent--item-enter sk-transparent sk-text-14-2857-290 sk-text">z**正在拼团...
                                                        </text>
                                                    </view>
                                                </scroll-view>
                                            </view>
                                            <text
                                                class="member-count UserIndexComponent--member-count data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-402 sk-text">7人正在拼团</text>
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </view>
                        <view
                            class="loading-status UserIndexComponent--loading-status data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a">
                            <text
                                class="data-v-1ef7db5a UserIndexComponent--data-v-1ef7db5a sk-transparent sk-text-14-2857-159 sk-text"
                                style="background-position-x: 50%;">—— 已经到底啦 ——</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<style>
/*
此文件为开发者工具生成，生成时间: 2025/4/8下午8:28:46

在 D:\Desktop\WeTakeout\we-takeout\dist\dev\mp-weixin\pages\index\index.wxss 中引入样式
```
@import "./index.skeleton.wxss";
```

更多详细信息可以参考文档：https://developers.weixin.qq.com/miniprogram/dev/devtools/skeleton.html
*/
.sk-transparent {
    color: transparent !important;
}

.sk-text-14-2857-73 {
    background-image: linear-gradient(transparent 14.2857%, #EEEEEE 0%, #EEEEEE 85.7143%, transparent 0%) !important;
    background-size: 100% 42.0000rpx;
    position: relative !important;
}

.sk-text {
    background-origin: content-box !important;
    background-clip: content-box !important;
    background-color: transparent !important;
    color: transparent !important;
    background-repeat: repeat-y !important;
}

.sk-text-14-2857-942 {
    background-image: linear-gradient(transparent 14.2857%, #EEEEEE 0%, #EEEEEE 85.7143%, transparent 0%) !important;
    background-size: 100% 56.0000rpx;
    position: relative !important;
}

.sk-text-14-2857-341 {
    background-image: linear-gradient(transparent 14.2857%, #EEEEEE 0%, #EEEEEE 85.7143%, transparent 0%) !important;
    background-size: 100% 39.2000rpx;
    position: relative !important;
}

.sk-text-14-2857-16 {
    background-image: linear-gradient(transparent 14.2857%, #EEEEEE 0%, #EEEEEE 85.7143%, transparent 0%) !important;
    background-size: 100% 44.8000rpx;
    position: relative !important;
}

.sk-text-14-2857-989 {
    background-image: linear-gradient(transparent 14.2857%, #EEEEEE 0%, #EEEEEE 85.7143%, transparent 0%) !important;
    background-size: 100% 39.2000rpx;
    position: relative !important;
}

.sk-text-28-3333-576 {
    background-image: linear-gradient(transparent 28.3333%, #EEEEEE 0%, #EEEEEE 71.6667%, transparent 0%) !important;
    background-size: 100% 60.0000rpx;
    position: absolute !important;
}

.sk-text-14-2857-323 {
    background-image: linear-gradient(transparent 14.2857%, #EEEEEE 0%, #EEEEEE 85.7143%, transparent 0%) !important;
    background-size: 100% 42.0000rpx;
    position: relative !important;
}

.sk-text-14-2857-777 {
    background-image: linear-gradient(transparent 14.2857%, #EEEEEE 0%, #EEEEEE 85.7143%, transparent 0%) !important;
    background-size: 100% 33.6000rpx;
    position: relative !important;
}

.sk-text-14-2857-501 {
    background-image: linear-gradient(transparent 14.2857%, #EEEEEE 0%, #EEEEEE 85.7143%, transparent 0%) !important;
    background-size: 100% 44.8000rpx;
    position: relative !important;
}

.sk-text-14-2857-290 {
    background-image: linear-gradient(transparent 14.2857%, #EEEEEE 0%, #EEEEEE 85.7143%, transparent 0%) !important;
    background-size: 100% 33.6000rpx;
    position: absolute !important;
}

.sk-text-14-2857-402 {
    background-image: linear-gradient(transparent 14.2857%, #EEEEEE 0%, #EEEEEE 85.7143%, transparent 0%) !important;
    background-size: 100% 36.4000rpx;
    position: relative !important;
}

.sk-text-14-2857-159 {
    background-image: linear-gradient(transparent 14.2857%, #EEEEEE 0%, #EEEEEE 85.7143%, transparent 0%) !important;
    background-size: 100% 36.4000rpx;
    position: relative !important;
}

.sk-image {
    background: #EFEFEF !important;
}

.sk-pseudo::before,
.sk-pseudo::after {
    background: #EFEFEF !important;
    background-image: none !important;
    color: transparent !important;
    border-color: transparent !important;
}

.sk-pseudo-rect::before,
.sk-pseudo-rect::after {
    border-radius: 0 !important;
}

.sk-pseudo-circle::before,
.sk-pseudo-circle::after {
    border-radius: 50% !important;
}

.sk-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: transparent;
}
</style>