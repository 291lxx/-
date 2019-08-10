<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="warning" plain icon="el-icon-plus" size="medium" @click="addRoleDialogVisible = true">添加角色</el-button>

      <el-table :data="roleList" border>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="item1 in scope.row.children" :key="item1.id">
              <el-col :span="5">
                <el-tag closable @close="removeThirdCate(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-arrow-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row v-for="item2 in item1.children" :key="item2.id" style="border:none">
                  <el-col :span="9">
                    <el-tag
                      type="danger"
                      closable
                      @close="removeThirdCate(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-arrow-right"></i>
                  </el-col>
                  <el-col :span="15">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeThirdCate(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              plain
              icon="el-icon-edit"
              size="mini"
              round
              @click="editRole(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="success"
              plain
              icon="el-icon-delete"
              size="mini"
              round
              @click="delRole(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              plain
              icon="el-icon-setting"
              size="mini"
              round
              @click="showSetRightsDialog(scope.row)"
            >分配</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色的对话框 -->
    <el-dialog title="提示" :visible.sync="addRoleDialogVisible" width="30%">
      <el-form ref="addRormRef" :model="addRoleForm" label-width="80px" :rules="addFormRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleFormDialog">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->

    <el-dialog title="提示" :visible.sync="setRightDialogVisible">
      <div>
        <el-tree
          ref="treeRef"
          :data="rightsList"
          :props="defaultProps"
          show-checkbox
          default-expand-all
          :default-checked-keys="defkeys"
          node-key="id"
        ></el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allowRight">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->

    <el-dialog title="修改" :visible.sync="editRoleDialogVisible" width="30%">
      <el-form ref="eidtRormRef" :model="editRoleForm" label-width="80px" :rules="addFormRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleFromDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { async } from "q";
export default {
  data() {
    return {
      roleList: [],
      setRightDialogVisible: false,
      rightsList: [],
      defaultProps: {
        label: "authName",
        children: "children"
      },
      defkeys: [],
      id: 0,
      editRoleDialogVisible: false,
      addRoleForm: {
        roleId: "",
        roleName: "",
        roleDesc: ""
      },
      editRoleForm: {
        roleName: "",
        roleId: "",
        roleDesc: ""
      },
      addRoleDialogVisible: false,
      addFormRules: {
        roleName: [{ required: true, message: "请输入角色", trigger: "blur" }]
      }
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status != 200) return this.$message.error("角色获取失败");
      this.$message.success("获取角色成功");
      this.roleList = res.data;
      // console.log(this.roleList);
    },
    removeThirdCate(role, rightsId) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          // roleId角色id，rightId权限id
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightsId}`
          );
          if (res.meta.status != 200) return this.$message.error("删除失败");
          this.$message.success("删除成功");
          role.children = res.data;
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    async showSetRightsDialog(row) {
      var myArr = [];
      function fn(arr) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].children == undefined) {
            myArr.push(arr[i].id);
          } else {
            fn(arr[i].children);
          }
        }
        // return myArr
      }
      fn(row.children);
      // console.log(myArr)
      this.defkeys = myArr;
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status != 200)
        return this.$message.error("获取角色列表失败");
      this.rightsList = res.data;
      this.setRightDialogVisible = true;
      this.id = row.id;
    },
    async allowRight() {
      // console.log(this.$refs.treeRef);
      var ids = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      // console.log(ids);
      ids = ids.join(",");
      const { data: res } = await this.$http.post(`roles/${this.id}/rights`, {
        rids: ids
      });
      if (res.meta.status != 200) return this.$message.error("分配失败");
      this.getRoleList();
      this.setRightDialogVisible = false;
    },

    // addRole() {
    //   this.addRoleDialogVisible = true;
    // },
    async addRoleFormDialog() {
      const { data: res } = await this.$http.post("roles", this.addRoleForm);
      console.log(res);
      if(res.meta.status!=201) return this.$message.error('添加失败')
      this.$message.success('添加成功')
      this.getRoleList()
      this.addRoleDialogVisible=false
    },

    async editRole(id) {
      this.editRoleDialogVisible = true;
      const { data: res } = await this.$http.get("roles/" + id);
      // console.log(id);
      if (res.meta.status != 200) return this.$message.error("获取失败");
      // console.log(res);
      this.editRoleForm = res.data;
    },
    async editRoleFromDialog() {
      this.editRoleDialogVisible = false;
      const { data: res } = await this.$http.put(
        "roles/" + this.editRoleForm.roleId,
        {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        }
      );
      if (res.meta.status != 200) return this.$message.error("修改失败");
      this.$message.success("修改成功");
      // console.log(res);
      this.editRoleForm = res.data;
      this.getRoleList();
    },
    delRole(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$http.delete("roles/" + id);
          if (res.meta.status != 200) return this.$message.error("删除失败");
          this.$message.success("删除成功");
          this.getRoleList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    }
  }
};
</script>
<style lang='less' scoped>
.el-tag {
  margin: 7px;
}
.el-row {
  border-top: 1px solid #eee;
}
.el-table {
  margin-top: 10px;
}
</style>