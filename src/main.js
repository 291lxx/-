import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
axios.defaults.baseURL="http://localhost:8888/api/private/v1/"
//axios请求拦截器
axios.interceptors.request.use(function(config){
  // console.log(config)
  //请求头设置 Authorization 字段设置token 令牌
  config.headers.Authorization=window.sessionStorage.getItem('token')
  return config;
},function(error){
  console.log(error)
})
//注册树形组件
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table',TreeTable)
Vue.prototype.$http=axios
Vue.config.productionTip = false
Vue.filter('dateFormat',function(str){
  var date=new Date(str*1000)
  var y=date.getFullYear()
  var mm=date.getMonth()+1
  var d=date.getDate()
  var h=date.getHours()
  var m=date.getMinutes()
  var s=date.getSeconds()
  return `${y}-${mm}-${d} ${h}:${m}:${s}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
