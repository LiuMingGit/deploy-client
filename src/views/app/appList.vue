<template>
    <el-row>
        <el-col :span="6" v-for="app in apps" :key="app.appId" >
            <el-card style="margin:14px;height:235px;" :body-style="{ padding: '10px' }">
                <div slot="header" class="clearfix">
                    <span class="appTitle">{{app.appName}}</span>
                    <el-button style="float: right; padding: 3px 6px;color:red" type="text" @click="deleteApp(app.appId)">删除</el-button>
                    <el-button style="float: right; padding: 3px 0" type="text" @click="editApp(app.appId)">编辑</el-button>
                     </div>
                <div class="item">仓库地址:</div>
                <p class="desc">{{ app.path || '空' }}</p>
                <div class="item">描述信息:</div>
                <p class="desc">{{ app.describes || '空' }}</p>
            </el-card>
        </el-col>
        <el-col :span="6">
            <el-card style="margin:14px;height:235px;line-height:235px;padding-top:20px;text-align: center;">
                <img :src="img_add_slave" class="image" style="margin: 0 auto;width:100px;" @click="newApp">
            </el-card>
        </el-col>
        <app-form :app="checkedApp" :visible="appFormVisible" @close="appFormVisible=false" @refresh="loadData"></app-form>
    </el-row>
</template> 

<script>

import img_add_slave from '@/assets/slave_images/add.png'
import appForm from '@/views/app/appForm'

import { loadApps, deleteApp } from '@/api/app'

export default {
  components: {
    appForm
  },
  mounted: function() {
    this.loadData()
  },
  data() {
    return {
      img_add_slave,
      appFormVisible: false,
      apps: [],
      checkedApp: {}
    }
  },
  methods: {
    loadData() {
      loadApps().then(response => {
        this.apps = response.data
      })
    },
    newApp() {
      this.checkedApp = {}
      this.appFormVisible = true
    },
    editApp(appId) {
      var app = this.apps.find((o) => {
        return o.appId === appId
      })
      this.checkedApp = app
      this.appFormVisible = true
    },
    deleteApp(appId) {
      var app = this.apps.find((o) => {
        return o.appId === appId
      })
      this.$confirm('此操作将永久删除应用[' + app.appName + '], 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteApp(appId).then(response => {
          if (response.code === 20000) {
            this.$message({
              message: '删除成功!',
              type: 'success'
            })
            this.loadData()
          } else {
            this.$alert('错误信息', response.message, { type: 'error' })
          }
        })
      })
    }
  }
}
</script>
<style>
.appTitle {
    font-size: 20px;
    font-weight: bold;
    color: rgb(57, 85, 245);
}
.item {
    margin-top: 20px;
    font-weight: bold;
}
.desc {
    word-wrap:break-word;
    text-indent:25px
}
.image {
  width: 100%;
  cursor:pointer;
}
</style>