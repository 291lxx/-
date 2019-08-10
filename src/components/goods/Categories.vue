<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
    <el-card>
      <el-button type="warning" plain icon="el-icon-plus" size="medium" @click="addCate">添加分类</el-button>
    </el-card>
    <tree-table
      :data="cateList"
      :columns="columns"
      border
      stripe
      show-header
      :show-summary="false"
      show-row-hover
      show-index
      tree-type
      is-fold
      :expand-type="false"
      :selection-type="false"
    >
      <!-- 是否有效 -->
      <template slot="isok" slot-scope="scope">
        <i class="el-icon-success" v-if="scope.row.cat_deleted==false" style="color:lightgreen"></i>
        <i class="el-icon-error" v-else></i>
      </template>
      <!-- 排序 -->
      <template slot="order" slot-scope="scope">
        <el-tag type="danger" v-if="scope.row.cat_level==0">一级</el-tag>
        <el-tag type="warning" v-else-if="scope.row.cat_level==1">二级</el-tag>
        <el-tag type="success" v-else-if="scope.row.cat_level==2">三级</el-tag>
      </template>
      <!-- 操作 -->
      <template slot="opt" slot-scope="scope">
        <el-button
          type="primary"
          icon="el-icon-edit"
          size="mini"
          plain
          @click="editCate(scope.row.cat_id)"
        >编辑</el-button>
        <!-- {{scope.row}} -->
        <el-button
          type="warning"
          icon="el-icon-edit"
          size="mini"
          plain
          @click="del(scope.row.cat_id)"
        >删除</el-button>
      </template>
    </tree-table>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="querInfo.pagenum"
      :page-sizes="[2, 5, 10, 20]"
      :page-size="querInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>

    <!-- 添加分类的弹框 -->

    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="30%" @close="addCateClosed">
      <el-form :model="addForm" :rules="addFromRules" ref="addFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级名称">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="categoryPrpos"
            @change="parentChange"
            change-on-select
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateDialog">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑弹框 -->

    <el-dialog title="编辑" :visible.sync="editDialogVisible" width="30%">
      <el-form :model="edidCateForm" :rules="addFromRules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="edidCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible= false">取 消</el-button>
        <el-button type="primary" @click="editCateFromDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      addForm: {
        cat_pid: 0,
        cat_name: "",
        cat_level: "",
        cat_name: ""
      },
      parentCateList: [],
      addFromRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      categoryPrpos: {
        extpandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children",
        checkStrictly: true
      },
      //  selectedParent: [],
      selectedKeys: [],
      cateList: [],
      querInfo: {
        type: "",
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      columns: [
        { label: "分类名称", prop: "cat_name" },
        { label: "是否有效", type: "template", template: "isok" },
        { label: "排序", type: "template", template: "order" },
        { label: "操作", type: "template", template: "opt" }
      ],
      addCateDialogVisible: false,
      editDialogVisible: false,
      edidCateForm: {
        cat_name: "",
        cat_id: 0,
        cat_pid: 0,
        cat_level: 0
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo
      });
      // console.log(res);
      this.cateList = res.data.result;
      this.total = res.data.total;
      // console.log(this.cateList);
    },
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCateList();
    },

    addCate() {
      this.addCateDialogVisible = true;
      this.getParentList();
    },
    addCateDialog() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post("categories", this.addForm);
        // console.log(res);
        if (res.meta.status != 201) return this.$message.error("创建失败");
        this.$message.success("创建成功");
        this.addForm = res.data;
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    async getParentList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status != 200) $this.$message.error("获取失败");
      // console.log(res.data);
      this.parentCateList = res.data;
    },
    parentChange() {
      if (this.selectedKeys.length > 0) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        this.addForm.cat_level = this.selectedKeys.length;
        console.log(this.selectedKeys);
      } else {
        this.addForm.cat_pid = 0;
        this.addForm.cat_level = 0;
      }
    },
    addCateClosed() {
      this.$refs.addFormRef.resetFields();
      this.selectedKeys = [];
      this.addForm.cat_pid = 0;
      this.addForm.cat_level = 0;
    },
    // 编辑
    async editCate(id) {
      // console.log(id);
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get("categories/" + id);
      // console.log(res);
      if (res.meta.status != 200) return this.$message.error("获取失败");
      this.edidCateForm = res.data;
    },
    // 提交编辑
    async editCateFromDialog() {
      const { data: res } = await this.$http.put(
        "categories/" + this.edidCateForm.cat_id,
        this.edidCateForm
      );
      console.log(res);
      // this.edidCateForm=res.data
      this.editDialogVisible = false;
      this.getCateList();
    },
    // 删除
    del(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$http.delete("categories/" + id);
          if(res.meta.status!=200) return this.$message.error('删除失败')
          // console.log(res)
          this.$message.success('删除成功')
          this.getCateList()
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
.el-cascader {
  width: 100%;
}
</style>