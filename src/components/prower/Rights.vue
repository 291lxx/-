<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-table style="width: 100%" :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级">
          <template slot-scope="scope">
            <el-tag :type="obj[scope.row.level].type">{{obj[scope.row.level].name}}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rightsList: [],
      obj: {
        0: {
          name: "一级",
          type: "info"
        },
        1: {
          name: "二级",
          type: "danger"
        },
        2: {
          name: "三级",
          type: "success"
        }
      }
    };
  },
  created() {
    this.getRightsList();
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get("rights/list");
      if (res.meta.status != 200)
        return this.$message.error("权限列表获取失败");
      this.$message.success("获取权限列表成功");
      //   console.log(res);
      this.rightsList = res.data;
      // console.log(this.rightsList);
    }
  }
};
</script>
<style lang='less' scoped>
</style>