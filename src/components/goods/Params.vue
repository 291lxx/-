<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="注意：只允许第三级分类设置相关的参数" type="warning" show-icon :closable="false"></el-alert>
      <span>商品分类</span>
      <!-- 级联选择器-->
      <el-cascader
        v-model="selectedParent"
        :options="cateList"
        @change="parentChange"
        :props="cateProps"
      ></el-cascader>
      <!-- tab页切换 -->
      <el-tabs v-model="activeName" @click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="danger"
            plain
            size="mini"
            :disabled="isDisabled"
            @click="addDialogVisible=true"
            style="margin:10px 0"
          >添加参数</el-button>
          <el-table :data="manyTabData" border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  type="warning"
                  v-for="(item,index) in scope.row. attr_vals"
                  :key="item.attr_id"
                  closable
                  @close="handleClose(index,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
                <!-- {{scope.row}} -->
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  plain
                  size="mini"
                  @click="editShowDialog(scope.row.attr_id)"
                >编辑</el-button>
                <!-- {{scope.row}} -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  plain
                  size="mini"
                  @click="del(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="warning"
            plain
            size="mini"
            :disabled="isDisabled"
            @click="addDialogVisible=true"
            style="margin:10px 0"
          >添加属性</el-button>
          <!-- 静态属性 -->
          <el-table :data="onlyTabData" border>
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  plain
                  size="mini"
                  @click="editShowDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  plain
                  size="mini"
                  @click="del(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加'+titletxt"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="resetAddForm"
    >
      <el-form :model="addParamsForm" :rules="addParamsRules" ref="addFormRef" label-width="100px">
        <el-form-item label="参数名称" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParamsFormDialog">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog
      :title="'添加'+titletxt"
      :visible.sync="editDialogVisible"
      width="30%"
      @close="reseteditForm"
    >
      <el-form
        :model="editParamsForm"
        :rules="addParamsRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="参数名称" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParamsFormDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { async } from "q";
export default {
  data() {
    return {
      cateList: [],
      inputVisible: false,
      selectedParent: [],
      cateProps: {
        expandTrigger: "hover",
        children: "children",
        value: "cat_id",
        label: "cat_name",
        inputValue: ""
      },
      activeName: "many",
      manyTabData: [],
      onlyTabData: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addParamsForm: {
        attr_name: "",
        attr_sel: "",
        attr_vals: ""
      },
      addParamsRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
      editParamsForm: {
        attr_id: 0,
        attr_name: "",
        cat_id: 0,
        attr_sel: ""
      }
    };
  },
  computed: {
    isDisabled() {
      if (this.selectedParent.length != 3) {
        return true;
      } else {
        return false;
      }
    },
    catId() {
      return this.selectedParent[this.selectedParent.length - 1];
    },
    titletxt() {
      if (this.activeName == "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    }
  },
  created() {
    this.getCatelist();
  },
  methods: {
    async getCatelist() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200) return this.$message.error("获取失败");
      this.cateList = res.data;
      // console.log(this.cateList);
    },
    async parentChange() {
      // console.log(this.selectedParent);
      this.getParamsData();
    },
    async getParamsData() {
      if (this.selectedParent.length != 3) {
        this.selectedParent = [];
        return;
      }

      const { data: res } = await this.$http.get(
        `categories/${this.catId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (res.meta.status != 200) return this.$message.error("获取失败");
      console.log(res.data);
      for (var i = 0; i < res.data.length; i++) {
        res.data[i].inputVisible = false;
        res.data[i].inputValue = "";
        res.data[i].attr_vals = res.data[i].attr_vals.split(" ,");

        console.log(res.data[i].attr_vals);
      }
      if (this.activeName == "many") {
        this.manyTabData = res.data;
      } else {
        this.onlyTabData = res.data;
      }
    },
    handleTabClick() {},
    resetAddForm() {
      this.$refs.addFormRef.resetFields();
    },
    reseteditForm() {
      this.$refs.editFormRef.resetFields();
    },
    // 提交表单
    addParamsFormDialog() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.catId}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status != 201) return this.$message.error("提交失败");
        this.getParamsData();
        console.log(res);
        this.addDialogVisible = false;
      });
    },
    async editShowDialog(attr_id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get(
        `categories/${this.catId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      );
      this.editParamsForm.attr_name = res.data.attr_name;
      this.editParamsForm.attr_id = res.data.attr_id;
    },
    editParamsFormDialog() {
      this.$refs.editFormRef.validate(async valid => {
        const { data: res } = await this.$http.put(
          `categories/${this.catId}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        );
        this.editDialogVisible = false;
        this.getParamsData();
      });
    },
    del(attr_id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${this.catId}/attributes/${attr_id}`
          );
          if (res.meta.status != 200) return this.$message.error("删除失败");
          this.$message.success("删除成功");
          this.getParamsData();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    async handleClose(i, row) {
      row.attr_vals.splice(i, 1);
      const { data: res } = await this.$http.put(
        `categories/${this.catId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(",")
        }
      );
      if (res.meta.status != 200) return this.$message.error("删除失败");
      this.$message.success("删除成功");
    },
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length == 0) {
        row.inputVisible = false;
        row.inputValue = "";
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputVisible = false;
      row.inputValue = "";
      const { data: res } = await this.$http.put(
        `categories/${this.catId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(",")
        }
      );
       if(res.meta.status!=200) return this.$message.error('添加失败')
       this.$message.success('添加成功')
    },
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick(() => {
        console.log(this.$refs.saveTagInput);
        this.$refs.saveTagInput.$refs.input.focus();
      });
    }
  }
};
</script>
<style lang='less' scoped>
.el-alert {
  margin: 10px 0;
}
.input-new-tag {
  width: 120px;
}
.el-tag{
  margin: 0 10px;
}
</style>