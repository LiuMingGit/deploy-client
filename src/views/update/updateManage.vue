<template>
 <el-row>
    <el-col :span="12">
        <el-card class="box-card">
            <div slot="header" class="clearfix"> 
                    应用:
                    <el-select v-model="appId" style="padding: 3px 0" placeholder="请选择应用" @change="appSelected">
                        <el-option
                        v-for="item in apps"
                        :key="item.appId"
                        :label="item.appName"
                        :value="item.appId">
                        </el-option>
                    </el-select>
                    
                    <el-button style="float:right;margin:5px 5px;"
                          size="medium"
                          type="primary"
                          @click="configPackage('update')">修改</el-button>
                          <el-tooltip content="新增更新包版本" placement="bottom" effect="light">
                            <el-button style="float:right;margin:5px 5px;"
                                                      size="medium"
                                                      type="primary"
                                                      @click="configPackage('create')">新增</el-button>
                          </el-tooltip>
                    
            </div>
            <el-table ref="packageList" :data="packageData"  highlight-current-row @row-click="packageSeleced">
                <el-table-column prop="version" label="版本号" width="100"></el-table-column>
                <el-table-column prop="optime" label="创建时间" width="160"></el-table-column>
                <el-table-column prop="type" label="类型" width="100">
                    <template slot-scope="scope">
                        <el-tag
                        :type="scope.row.type === 1 ? 'primary' : 'success'"
                        disable-transitions>{{scope.row.type === 1 ? '全量' : '增量'}}</el-tag>
                    </template></el-table-column>
                <el-table-column prop="updateDesc" label="更新说明" :show-overflow-tooltip=true></el-table-column>
                <el-table-column prop="version" label="操作" width="100">
                  <template slot-scope="scope">
                    <el-button
                      size="mini"
                      type="success"
                      @click="uploadFile(scope.$index, scope.row)">上传文件</el-button>
                  </template>
                </el-table-column>
            </el-table>
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[10, 25, 50, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
        </el-card> 
    </el-col>
  <el-col :span="12">
       <el-card class="box-card">
          <file-tree ref="fileTree" :package="selectedPackage"></file-tree>
       </el-card> 
  </el-col>
  <upload :pack="uploadPack" :visible="uploadFormVisible" @close="uploadFormVisible=false" @refresh="reloadFiles"></upload>
  <package-form :pkgVersion="packageVersion" :visible="packageFormVisible" @close="packageFormVisible=false" @save="appSelected"></package-form>
</el-row>
</template>

<script>
import { loadApps, loadPackages } from '@/api/app'
import fileTree from '@/views/update/fileTree'
import upload from '@/views/update/upload'
import packageForm from '@/views/update/packageForm'

export default {
  components: {
    fileTree,
    upload,
    packageForm
  },
  mounted: function() {
    loadApps().then(response => {
      this.apps = response.data
    })
  },
  data() {
    return {
      currentPage: 0,
      pageSize: 10,
      total: 0,
      selectedPackage: null,
      packageData: [],
      apps: [],
      appId: null,
      uploadFormVisible: false,
      packageFormVisible: false,
      uploadPack: null,
      packageVersion: {},
      options: {
        target: process.env.BASE_API + '/app/upload',
        testChunks: false
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.pageSize = val
      this.loadData()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.currentPage = val
      this.loadData()
    },
    loadData(appId) {
      appId = appId || this.appId
      if (!appId) return
      loadPackages({
        appId: appId,
        pageNum: this.currentPage,
        pageSize: this.pageSize
      }).then((response) => {
        const pageInfo = response.data
        this.total = pageInfo.total
        this.packageData = pageInfo.list
        this.$refs.packageList.setCurrentRow(this.packageData[0])
        this.packageSeleced(this.packageData[0])
      })
    },
    configPackage: function(op) {
      if (!this.appId) {
        this.$message({
          message: '请先选择应用信息',
          type: 'warning'
        })
        return
      }
      this.packageVersion = { appId: this.appId }
      if (op === 'update') {
        this.packageVersion.id = this.selectedPackage.id
      }
      this.packageFormVisible = true
    },
    appSelected: function(appId) {
      this.loadData(appId)
    },
    packageSeleced: function(selection) {
      this.selectedPackage = selection
    },
    reloadFiles: function() {
      this.$refs.fileTree.reload(this.uploadPack)
    },
    uploadFile: function(index, row) {
      this.uploadPack = row
      this.uploadFormVisible = true
    }
  }
}
</script>
<style>

</style>