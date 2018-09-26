<template>
    <el-dialog title="节点信息" :visible="visible" :close-on-click-modal="false" @open="dialogOpen" @close="dialogClose">
        <el-form ref="form" :model="slave" :rules="rules" label-width="80px">
            <el-form-item label="节点名称" prop="name">
                <el-input v-model="slave.name"></el-input>
            </el-form-item>
            <el-form-item label="节点IP" prop="ip">
                <el-input v-model="slave.ip"></el-input>
            </el-form-item>
            <el-form-item label="描述信息">
                <el-input type="textarea" autosize v-model="slave.describes"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">保存</el-button>
                <el-button  @click="dialogClose">取消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>
import { loadSlave, saveSlave } from '@/api/slave'
export default {
  name: 'slaveForm',
  props: ['slaveId', 'visible'],
  data() {
    return {
      slave: {},
      rules: {
        name: [
          { required: true, message: '请输入节点名称', trigger: 'blur' },
          { max: 50, message: '名称不能超过50个字符', trigger: 'blur' }
        ],
        ip: [
          { required: true, message: '请输入节点IP', trigger: 'blur' },
          { max: 50, message: '名称不能超过30个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    dialogOpen() {
      // 载入节点信息
      if (this.slaveId > 0) {
        loadSlave(this.slaveId).then((response) => {
          this.slave = response.data
        })
      } else {
        this.slave = {}
      }
    },
    dialogClose() {
      this.$emit('close')
    },
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          saveSlave(this.slave).then((response) => {
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

