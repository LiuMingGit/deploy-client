<template>
    <el-dialog :title="formTitle" :visible="visible" :close-on-click-modal="false" @close="dialogClose" @open="dialogOpen">
        <el-form ref="form" :model="packageData" :rules="rules" label-width="80px">
            <el-form-item label="版本号" prop="version">
                <el-input v-model="packageData.version"></el-input>
            </el-form-item>
            <el-form-item label="版本类型" prop="type">
                <el-select v-model="packageData.type" style="width:100%" placeholder="请选择">
                    <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="版本信息">
                <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 10}" v-model="packageData.updateDesc"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">保存</el-button>
                <el-button  @click="dialogClose">取消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>
import { findPackage, savePackage } from '@/api/app'
export default {
  props: ['pkgVersion', 'visible'],
  data() {
    return {
      packageData: {},
      options: [{
        value: 1,
        label: '全量包'
      }, {
        value: 2,
        label: '增量包'
      }],
      rules: {
        version: [
          { required: true, message: '请输入更新包版本', trigger: 'blur' },
          { max: 50, message: '名称不能超过50个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择更新包类型', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    formTitle() {
      var obj = this.pkgVersion
      if (obj.id > 0) {
        return '修改-更新包版本'
      } else {
        return '新增-更新包版本'
      }
    }
  },
  methods: {
    dialogOpen() {
      // 载入版本信息
      if (this.pkgVersion.id > 0) {
        findPackage(this.pkgVersion.id).then((response) => {
          this.packageData = response.data
        })
      } else {
        this.packageData = {
          appId: this.pkgVersion.appId
        }
      }
    },
    dialogClose() {
      this.$emit('close')
    },
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          savePackage(this.packageData).then(response => {
            this.$message({
              message: '保存成功!'
            })
            this.$emit('save', this.pkgVersion.appId)
            this.dialogClose()
          })
        }
      })
    }
  }
}
</script>
<style>

</style>