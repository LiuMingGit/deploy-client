<template>
    <el-dialog title="应用信息" :visible="visible" :close-on-click-modal="false" :show-close=false>
        <el-form ref="form" :model="app" :rules="rules" label-width="80px">
            <el-form-item label="应用名称" prop="appName">
                <el-input v-model="app.appName"></el-input>
            </el-form-item>
            <el-form-item label="仓库地址" prop="path">
                <el-input v-model="app.path"></el-input>
            </el-form-item>
            <el-form-item label="描述信息" prop="describes">
                <el-input type="textarea" autosize v-model="app.describes"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">保存</el-button>
                <el-button  @click="dialogClose">取消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>
import { createApp } from '@/api/app'
export default {
  name: 'appForm',
  props: ['app', 'visible'],
  data() {
    return {
      rules: {
        appName: [
          { required: true, message: '请输入应用名称', trigger: 'blur' },
          { max: 50, message: '名称不能超过30个字符', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '请输入应用仓库地址', trigger: 'blur' },
          { max: 200, message: '名称不能超过200个字符', trigger: 'blur' }
        ],
        describes: [
          { required: true, message: '请输入应用描述', trigger: 'blur' },
          { max: 200, message: '名称不能超过200个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    dialogClose() {
      this.$emit('close')
    },
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          createApp(this.app).then((response) => {
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

