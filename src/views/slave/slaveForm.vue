<template>
    <el-dialog title="节点信息" :visible="visible">
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

export default {
  name: 'slaveForm',
  props: ['slave', 'visible'],
  data() {
    return {
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
    dialogClose() {
      this.$emit('close')
    },
    onSubmit() {
      console.log(this.slave)
    }
  }
}
</script>
<style>

</style>

