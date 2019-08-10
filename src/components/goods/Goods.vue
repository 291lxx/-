<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            v-model="querInfo.query"
            @click="getGoodsList()"
            @keyup.enter.native="getGoodsList()"
          >
            <el-button slot="append" class="el-icon-search" @click="getGoodsList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" icon="el-icon-search" plain @click="goGoodsAdd">添加</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" prop="add_time">
          <template slot-scope="scope">{{scope.row.add_time |dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              plain
              icon="el-icon-edit"
              @click="editGoods(scope.row.goods_id)"
            ></el-button>
            <el-button
              type="warning"
              plain
              icon="el-icon-delete"
              @click="delGoods(scope.row.goods_id)"
            ></el-button>
            <!-- {{scope.row.goods_id}} -->
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[10,15, 20, 25]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 编辑的弹框 -->
    <el-dialog title="提示" :visible.sync="editDialogVisible" width="30%">
      <el-form ref="eidtGoodsRef" :model="editGoodsForm" label-width="80px">
        <el-form-item label="商品名称">
          <el-input v-model="editGoodsForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格">
          <el-input v-model="editGoodsForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量">
          <el-input v-model="editGoodsForm.goods_weight"></el-input>
        </el-form-item>
        <el-form-item label="商品审核">
          <el-input v-model="editGoodsForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible= false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      querInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      total: 10,
      goodsList: [],
      editDialogVisible: false,
      editGoodsForm: {
        goods_name: "",
        goods_price: "",
        goods_weight: "",
        goods_state: 0,
        add_time: ""
      }
    };
  },
  computed: {},
  created() {
    this.getGoodsList();
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.querInfo
      });
      // console.log(res);
      if (res.meta.status != 200) return this.$message.error("获取失败");
      this.total = res.data.total;
      this.goodsList = res.data.goods;
    },
    handleSizeChange(pagesize) {
      this.querInfo.pagesize = pagesize;
      this.getGoodsList();
    },
    handleCurrentChange(pagenum) {
      this.querInfo.pagenum = pagenum;
      this.getGoodsList();
    },
    delGoods(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$http.delete("goods/" + id);
          if (res.meta.status != 200) return this.$message.error("删除失败");
          this.$message.success("删除成功");
          this.getGoodsList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    async editGoods(id) {
      console.log(id);
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get("goods/" + id);
      console.log(res);
      if (res.meta.status != 200) return this.$message.error("获取失败");
      this.editGoodsForm = res.data;
      console.log(res.data);
    },
    goGoodsAdd(){
      this.$router.push('/goods/add')
    }
  }
};
</script>
<style lang='less' scoped>
</style>