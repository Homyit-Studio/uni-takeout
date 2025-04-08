<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(async () => {
  console.log('App Launch')
})

onShow(async () => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>

<style>
/*每个页面公共css */


body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-touch-callout: none;
  background-color: #f9f9f9;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
  background-color: transparent;

}
</style>
