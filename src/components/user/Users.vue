<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" icon="el-icon-search" @click="addDialogVisible = true">添加</el-button>
        </el-col>
      </el-row>
    </el-card>
    <!-- 表格区域 -->
    <el-table style="width: 100%" :data="userList">
      <el-table-column type="index"></el-table-column>
      <el-table-column label="用户名" prop="username"></el-table-column>
      <el-table-column label="邮箱" prop="email"></el-table-column>
      <el-table-column label="电话" prop="mobile"></el-table-column>
      <el-table-column label="角色" prop="role_name"></el-table-column>
      <el-table-column label="状态" prop="mg_state">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.mg_state"
            active-color="pink"
            inactive-color="skyblue"
            @change="useterState(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="primary"
            plain
            icon="el-icon-edit"
            size="mini"
            round
            @click="showFormDiaglog(scope.row.id)"
          ></el-button>
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            size="mini"
            round
            @click="del(scope.row.id)"
          ></el-button>
          <el-tooltip class="item" effect="dark" content="角色分配" placement="top">
            <el-button
              type="success"
              plain
              icon="el-icon-setting"
              size="mini"
              round
              @click="showRoleDialog(scope.row)"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <!--
size-change:切换每一页显示的数据条数
current-change：切换页面
current-page：当前页
page-sizes：设置每一页的条数
page-size:每一页展示多少条
layout：布局
total：总数
    -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1,2,3,5]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>

    <!-- 添加弹框 -->
    <el-dialog title="提示" :visible.sync="addDialogVisible" width="30%" @closed="AddDialogClosed">
      <span>
        <el-form label-width="80px" :model="addForm" :rules="addFormRules" ref="addFormRef">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->

    <el-dialog title="提示" :visible.sync="editDialogVisible" width="30%" @closed="EditDialogClosed">
      <el-form label-width="80px" :rules="addFormRules" :model="editForm" ref="editFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input disabled v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog title="提示" :visible.sync="roleDialogVisible" width="30%">
      <p>用户名:{{userInfo.username}}</p>
      <p>角色名字：{{userInfo.role_name}}</p>
      <el-select v-model="selectedRoleId" placeholder="请选择">
        <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
// import { async } from "q";
export default {
  data() {
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("邮箱不合法"));
    };
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入正确的合法的手机"));
    };
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 100
      },
      total: 1,
      userList: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        password: "",
        username: "",
        email: "",
        mobile: ""
      },
      editForm: {
        username: "",
        email: "",
        password: ""
      },
      id: 0,
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" }
        ],
        password: [{ required: true, message: "不能为空", trigger: "blur" }],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      roleDialogVisible: false,
      userInfo: [],
      rolesList: [],
      selectedRoleId: ""
    };
  },
  created() {
    this.getUserList();
  },

  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      // console.log(res);
      if (res.meta.status != 200) return this.$message.error("获取用户失败");
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getUserList();
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getUserList();
    },
    async useterState(row) {
      const { data: res } = await this.$http.put(
        `users/${row.id}/state/${row.mg_state}`
      );
      if (res.meta.status != 200) return this.$message.error("修改失败");
      this.$message.success("修改用户状态成功");
    },
    AddDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    EditDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    add() {
      //对整个表单进行校验的方法，参数为一个回调函数。该回调函数会在校验结束后被调用，
      // 并传入两个参数：是否校验成功和未通过校验的字段。若不传入回调函数，则会返回一个 promise
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post("users", this.addForm);
        console.log(this.addForm);
        if (res.meta.status != 201) return this.$message.error("添加失败");
        this.$message.success("添加用户成功");
        this.getUserList();
      });

      this.addDialogVisible = false;
    },
    async showFormDiaglog(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status != 200) return this.$message.error("获取用户失败");
      this.editForm = res.data;
      this.id = id;
    },
    async edit() {
      const { data: res } = await this.$http.put(
        "users/" + this.id,
        this.editForm
      );
      if (res.meta.status != 200) return this.$message.error("提交失败");
      res.data = this.editForm;
      this.getUserList();
      this.editDialogVisible = false;
    },
    del(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$http.delete("users/" + id);
          if (res.meta.status != 200) return this.$message.error("删除失败");
          this.$message.success("删除成功");
          this.getUserList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    async showRoleDialog(row) {
      this.roleDialogVisible = true;
      this.userInfo = row;
      // console.log(row)
      //获取所有角色列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status != 200)
        return this.$message.error("获取角色列表失败");
      this.rolesList = res.data;
      console.log(this.rolesList);
    },
    //点击按钮分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error("请选择分配的角色");
      } else {
        const { data: res } = await this.$http.put(
          `users/${this.userInfo.id}/role`,
          {
            id: this.userInfo.id,
            rid: this.selectedRoleId
          }
        );
        if (res.meta.status != 200) return this.$message.error("分配角色失败");
        this.$message.success('更新角色成功')
        this.getUserList()

      }

      this.roleDialogVisible = false;
    }
  }
};
</script>
<style lang='less' scoped>
</style>