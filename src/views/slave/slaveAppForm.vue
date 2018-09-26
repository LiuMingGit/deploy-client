<template>
    <el-dialog :title="'应用名称:' + title" :close-on-click-modal="false" :visible="visible" @open="dialogOpen" @close="dialogClose">
        <el-form ref="form" :model="slaveApp" :rules="rules" label-width="120px">
            <el-form-item label="TOMCAT_HOME:" prop="home">
                <el-input v-model="slaveApp.appTomcatHome"><el-button slot="append" icon="el-icon-plus" @click="chooesDir('home')" /></el-input>
            </el-form-item>
            <el-form-item label="部署目录:" prop="ip">
                <el-input v-model="slaveApp.appTargetPath"><el-button slot="append" icon="el-icon-plus" @click="chooesDir('target')" /></el-input>
            </el-form-item>
            <el-form-item label="备份目录:">
                <el-input v-model="slaveApp.appBackupPath"><el-button slot="append" icon="el-icon-plus" @click="chooesDir('backup')" /></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">保存</el-button>
                <el-button  @click="dialogClose">取消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>

import { loadSlaveApp, saveSlaveApp } from '@/api/slave'
export default {
  props: ['slaveAppId', 'visible', 'title'],
  data() {
    return {
      slaveApp: {},
      rules: {}
    }
  },
  methods: {
    chooesDir(el) {
      alert(el)
    },
    dialogOpen() {
      // 载入节点信息
      if (this.slaveAppId > 0) {
        loadSlaveApp(this.slaveAppId).then((response) => {
          this.slaveApp = response.data
        })
      } else {
        this.slaveApp = {}
      }
    },
    dialogClose() {
      this.$emit('close')
    },
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          saveSlaveApp(this.slaveApp).then((response) => {
            if (response.code === 20000) {
              this.$message({
                message: '保存成功!',
                type: 'success'
              })
              this.dialogClose()
              this.$emit('refresh')
            }
          })
        }
      })
    }
  }
}
</script>
<style>

</style>