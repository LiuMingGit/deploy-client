<template>
    <el-dialog title="更新包列表" :visible="visible" :close-on-click-modal="false" @open="dialogOpen" @close="dialogClose">
        <el-table ref="packageList" :data="packageData"  highlight-current-row :default-sort="{prop:'optime',order:'descending'}">
            <el-table-column prop="version" label="版本号" width="100"></el-table-column>
            <el-table-column prop="optime" label="创建时间" width="160"></el-table-column>
            <el-table-column prop="type" label="类型" width="100">
                <template slot-scope="scope">
                    <el-tag
                    :type="scope.row.type === 1 ? 'primary' : 'success'"
                    disable-transitions>{{scope.row.type === 1 ? '全量' : '增量'}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="updateDesc" label="更新说明" :show-overflow-tooltip=true></el-table-column>
            <el-table-column prop="version" label="操作" width="100">
                <template slot-scope="scope">
                    <el-button
                    size="mini"
                    type="success"
                    @click="updateVersion(scope.$index, scope.row)">更新此版本</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-card v-if="updating">
            <span class="load-text"><i :class="progress.icon"></i>{{progress.status}}</span>{{progress.message}}(本次更新共包含{{progress.total}}个文件,已同步{{progress.sync}}个文件)
            <el-progress :text-inside="true" :stroke-width="18" :percentage="percent"></el-progress>
        </el-card>
    </el-dialog>
</template>

<script>
import { loadSlaveUpdates, updatePackage, updateProcess, updateFinish } from '@/api/slave'
export default {
  props: ['visible', 'slaveApp'],
  data() {
    return {
      updating: false,
      progress: {
        icon: '',
        total: 0,
        sync: 0,
        status: '',
        message: ''
      },
      packageData: []
    }
  },
  computed: {
    percent() {
      if (this.progress.total === 0) {
        return 0
      }
      return parseInt(this.progress.sync / this.progress.total * 100)
    }
  },
  methods: {
    dialogOpen() {
      this.updating = false
      // 载入节点信息
      if (this.slaveApp.id > 0) {
        loadSlaveUpdates(this.slaveApp.id).then((response) => {
          this.packageData = response.data
        })
      }
    },
    dialogClose() {
      this.$emit('close')
    },
    updateVersion(index, row) {
      this.$confirm('确认将应用更新到版本[' + row.version + ']?', '请确认')
        .then(_ => {
          this.updating = true
          this.progress.icon = 'el-icon-loading'
          this.progress.status = '正在更新...'
          updatePackage(this.slaveApp.id, row.id).then(response => {
            const data = response.data
            if (data.code > 0) {
              const guard = data.guard
              if (guard) {
                this.progress.total = guard.totalFiles
                this.progress.sync = guard.receiveNum
                if (guard.fail) {
                  this.progress.icon = 'el-icon-error'
                  this.progress.status = '更新失败!'
                  this.progress.message = guard.message || '未知原因'
                  updateFinish(this.slaveApp.id, 'fail')
                  return
                }
              }
              this.progress.message = data.message
              // 更新中
              if (data.code === 9) {
                // 定时获取更新进度
                this.updateProcess(this.slaveApp.id)
              }
            } else {
              this.$alert(data.message, '更新失败')
            }
          })
        })
        .catch(_ => {})
    },
    updateProcess(slaveAppId) {
      setTimeout(() => {
        updateProcess(slaveAppId).then(response => {
          const guard = response.data
          if (guard) {
            this.progress.total = guard.totalFiles
            this.progress.sync = guard.receiveNum
            if (guard.fail) {
              this.progress.icon = 'el-icon-error'
              this.progress.status = '更新失败!'
              this.progress.message = guard.message || '未知原因'
              updateFinish(slaveAppId, 'fail')
            } else if (guard.totalFiles > 0 && guard.totalFiles === guard.receiveNum) {
              this.progress.icon = 'el-icon-success'
              this.progress.status = '更新成功!'
              updateFinish(slaveAppId, 'success').then(response => {
                this.$emit('refresh', this.slaveApp.slaveId)
              })
            } else {
              this.updateProcess(slaveAppId)
            }
          }
        })
      }, 1000)
    }
  }
}
</script>
<style>
.load-text {
  color: rgb(38, 161, 243);
  font-size: 14px;
  padding-right: 10px;
}
</style>