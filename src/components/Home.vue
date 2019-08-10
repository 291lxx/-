<template>
  <el-container class="home_container">
    <el-header>
      <div class="imgbox">
        <img src="../assets/2.jpg" alt />
        <span>小仙女的后台系统</span>
      </div>
      <el-button type="danger" plain @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'64px':'200px'">
        <el-menu :default-active="activePath" class="el-menu-vertical-demo" :unique-opened="true" background-color="rgb(250,244,220)"
        text-color="#666" active-text-color="#E6A23C" :collapse="isCollapse" :collapse-transition="false" :router="true">
        <div @click="isCollapse=!isCollapse" class="collapse">|||</div>
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id" >
            <template slot="title">
              <i :class="objicon[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>

            <!--  二级菜单-->

            <el-menu-item :index="'/'+subitem.path" v-for="subitem in item.children" :key="subitem.id" @click="saveNavItem(subitem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主题区 -->
      <el-main>
          <router-view></router-view>

      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      menulist: [],
      objicon:{
          '125':'iconfont icon-users',
          '103':'iconfont icon-tijikongjian',
          '101':'iconfont icon-shangpin',
          '102':'iconfont icon-danju',
          '145':'iconfont icon-baobiao'
      },
       isCollapse:false,
       activePath:''
    };
  },

  created() {
    this.getMenuList();
    this.activePath=window.sessionStorage.getItem('path')
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },

    async getMenuList() {
      const{data:res}= await this.$http.get("menus");
       this.menulist=res.data
    
    },
    saveNavItem(index){
sessionStorage.setItem('path','/'+index)
    }
  }
};
</script>
<style lang='less' scoped>
.home_container {
  height: 100%;
}
.el-header {
  background: rgb(248, 226, 207);
  display: flex;
  justify-content: space-between;
  .imgbox {
    display: flex;
    align-items: center;
    img {
      margin-right: 30px;
      width: 56px;
      height: 56px;
    }
    span {
      font-size: 20px;
      color: #fff;
      text-shadow: 2px 2px 2px rgba(133, 50, 50, 0.5);
    }
  }
}
.el-aside {
  background: rgb(247, 243, 205);
}
.el-main {
  background: rgb(250, 244, 231);
}
.el-button {
  margin: 5px 0;
}
.iconfont{
    margin-right: 10px;
}
.collapse{
    text-align: center;
}
</style>