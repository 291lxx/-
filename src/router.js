import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'
import Rights from './components/prower/Rights.vue'
import Roles from './components/prower/Roles.vue'
import Goods from './components/goods/Goods.vue'
import Params from './components/goods/Params.vue'
import Categories from './components/goods/Categories.vue'
import Add from './components/goods/Add.vue'
Vue.use(Router)
const router = new Router({
  routes: [{
      path: '/',
      redirect: 'Login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      redirect: '/users',
      children: [{
          path: '/welcome',
          component: Welcome
        },
        {
          path: '/users',
          component: Users
        },
        {
          path: '/rights',
          component: Rights
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path: '/goods',
          component: Goods
        },
        {
          path: '/params',
          component: Params
        },
        {
          path: '/categories',
          component: Categories
        },
        {
          path: '/goods/add',
          component: Add
        }
      ]
    },

  ]
})
//配置全局的导航守卫
router.beforeEach((to, form, next) => {
  //如果客户访问的是登录首页，直接放行

  if (to.path == '/login') return next();
  //从sessionstorage中获取token值
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
  // if(to.path=='/login'){
  //   next()
  // }else{
  //   const tokenStr = window.sessionStorage.getItem('token')
  //   if(tokenStr==''){
  //     next('/login')
  //   }else{
  //     next()
  //   }
  // }

})




export default router