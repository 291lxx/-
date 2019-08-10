<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avator_box">
        <img src="../assets/1.jpeg" alt />
      </div>
      <!-- 登录区域 -->
      <el-form
        ref="loginFormRef"
        class="login_form"
        :label-position="labelPosition"
        label-width="80px"
        :model="loginForm"
        :rules="loginFormRules"
        hide-required-asterisk
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
           show-password
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      labelPosition: "left",
      //登录数据绑定的对象
      loginForm: {
        username: "admin",
        password: "123456"
      },
      loginFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15个字符", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    resetLoginForm() {
      // console.log(this);
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      this.$refs.loginFormRef.validate( async valid=>{
        // console.log(valid);
        if(!valid) return
           const {data:res}= await this.$http.post('login',this.loginForm)
    //    const data=await this.$http.post('login',this.loginForm))
        // console.log(res)
        if(res.meta.status!=200) return this.$message.error('登录失败');
        this.$message.success('登陆成功')
        //客户端拿到token值时，会把在存在sessionstorage中
        window.sessionStorage.setItem('token',res.data.token)
        //通过编程导航跳转到后台主页，路由地址是 /home
        this.$router.push('/home')
      });
    }
  }
};
</script>
<style lang='less' scoped>
.login_container {
  background: rgb(250, 229, 232);
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .avator_box {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 130px;
    height: 130px;
    background: pink;
    border: 1px solid hotpink;
    border-radius: 50%;
    box-shadow: 0 0 10px red;
    // padding: 10px;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 30px 0 20px;
  box-sizing: border-box;

  .btns {
    display: flex;
    justify-content: flex-end;
    color: lightcoral;
  }
}
</style>