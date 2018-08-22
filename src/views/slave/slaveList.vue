<template>
    <div>
        <el-row>
            <el-col :span="4" v-for="slave in slaves" :key="slave.id" >
                <el-card :style="'margin:14px;height:235px;' + slave.style" :body-style="{ padding: '10px' }">
                    <img :src="img_slave" class="image" @click="loadSlaveApps(slave.id)">
                    <div style="padding: 10px 2px 0 2px;">
                        <span class="slaveAppTitle">{{ slave.name }}({{ slave.ip }})</span>
                        <div class="bottom clearfix">
                            <span class="time">{{ slave.describes || '描述信息' }}</span>
                            <el-button type="text" class="button" @click="slaveManage(slave.id)">管理</el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="4">
                <el-card style="margin:14px;height:235px;padding-top:20px;">
                    <img :src="img_add_slave" class="image" @click="newSlave">
                </el-card>
            </el-col>
        </el-row>
        <hr>
        <el-row>
            <el-col :span="8" v-for="slaveApp in slaveApps" :key="slaveApp.id" >
                <el-card style="margin:14px;" >
                    <div slot="header" class="clearfix">
                        应用名称:<span class="slaveAppTitle">{{ slaveApp.appName }}</span>
                        <span style="float:right;">
                            <el-dropdown trigger="click" style="cursor:pointer;" @command="handleCommand">
                                <span class="el-dropdown-link">
                                    状态:<span :class="slaveApp.cls || 'offline'">{{ slaveApp.status || '未知' }}</span><i class="el-icon-setting el-icon--right"></i>
                                </span>
                                <el-dropdown-menu slot="dropdown" >
                                    <el-dropdown-item :command="{cmd:'start',id:slaveApp.id}">启动服务</el-dropdown-item>
                                    <el-dropdown-item :command="{cmd:'stop',id:slaveApp.id}">停止服务</el-dropdown-item>
                                    <el-dropdown-item :command="{cmd:'dumpThread',id:slaveApp.id}">导出线程</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </span>
                    </div>
                    <div class="bottom clearfix">TOMCAT_HOME:{{ slaveApp.appTomcatHome || '' }}</div>
                    <div class="bottom clearfix">部署目录:{{ slaveApp.appTargetPath || '' }}</div>
                    <div class="bottom clearfix">备份目录:{{ slaveApp.appBackupPath || '' }}</div>
                    <div class="clearfix el-card__footer">
                        <el-button type="primary" size="small" style="float:right" icon="el-icon-document">浏览应用</el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <slave-form ref="refSlaveForm" :slave="checkedSlave" :visible="slaveFormVisible" @close="slaveFormVisible=false"></slave-form>
    </div>
</template>

<script>
import img_slave from '@/assets/slave_images/slave.png'
import img_app from '@/assets/slave_images/app.png'
import img_add_slave from '@/assets/slave_images/add.png'
import slaveForm from '@/views/slave/slaveForm'
import { loadSlaves, loadSlaveApps, startServer, stopServer, isServerRun } from '@/api/slave'

export default {
  name: 'slave',
  components: {
    slaveForm
  },
  mounted: function() {
    loadSlaves().then(response => {
      this.slaves = response.data
    })
  },
  data() {
    return {
      img_slave,
      img_app,
      img_add_slave,
      slaveFormVisible: false,
      checkedSlave: '',
      slaves: [],
      slaveApps: []
    }
  },
  methods: {
    slaveManage(slaveId) {
      this.checkedSlave = this.slaves.find((slave) => {
        return slave.id === slaveId
      })
      this.slaveFormVisible = true
    },
    newSlave() {
      this.checkedSlave = {}
      this.slaveFormVisible = true
    },
    loadSlaveApps(slaveId) {
      this.setSlaveFoucs(slaveId)
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      loadSlaveApps({ slaveId }).then(response => {
        var slaveApps = response.data
        var length = slaveApps.length
        if (length === 0) {
          loading.close()
        }
        slaveApps.forEach(slaveApp => {
          isServerRun({ 'slaveAppId': slaveApp.id }).then(resp => {
            var res = resp.data
            slaveApp.status = res.isRun ? '在线' : '离线'
            slaveApp.cls = res.isRun ? 'online' : 'offline'
            if (--length === 0) {
              this.slaveApps = slaveApps
              loading.close()
            }
          })
        })
      })
    },
    handleCommand(order) {
      var cmd = order.cmd
      var slaveAppId = order.id
      if (cmd === 'start') {
        startServer({ slaveAppId }).then(response => {
          // 判断是否启动
          var isRun = response.data.isRun
          if (isRun) {
            this.setSlaveAppStatus(slaveAppId, isRun)
          } else {
            this.setSlaveAppMiddleStatus(slaveAppId, isRun)
            this.interval(slaveAppId, true, 1, 20)
          }
        })
      } else if (cmd === 'stop') {
        stopServer({ slaveAppId }).then(response => {
          // 判断是否关闭
          var isRun = response.data.isRun
          if (!isRun) {
            this.setSlaveAppStatus(slaveAppId, isRun)
          } else {
            this.setSlaveAppMiddleStatus(slaveAppId, isRun)
            this.interval(slaveAppId, false, 1, 10)
          }
        })
      } else if (cmd === 'dumpThread') {
        // 判断是否在线
        isServerRun({ 'slaveAppId': slaveAppId }).then(resp => {
          if (resp.data.isRun) {
            var download = process.env.BASE_API + '/slave/dumpThread?slaveAppId=' + slaveAppId
            window.open(download)
          } else {
            this.$alert('应用已不在线!请先启动应用服务器!', '警告', {
              confirmButtonText: '知道了',
              type: 'warning'
            })
          }
        })
      }
    },
    setSlaveFoucs(slaveId) {
      for (let i = 0; i < this.slaves.length; i++) {
        const slave = this.slaves[i]
        if (slave.id === slaveId) {
          this.$set(this.slaves[i], 'style', 'border: 2px solid #f7620c;')
        } else {
          this.$set(this.slaves[i], 'style', 'border: 1px solid #ebeef5;')
        }
      }
    },
    setSlaveAppMiddleStatus(slaveAppId, isRun) {
      var slaveApp = this.slaveApps.find(o => {
        return o.id === slaveAppId
      })
      var index = this.slaveApps.findIndex(o => {
        return o.id === slaveAppId
      })
      slaveApp.status = isRun ? '正在关闭' : '正在启动'
      slaveApp.cls = 'midline'
      this.$set(this.slaveApps, index, slaveApp)
    },
    setSlaveAppStatus(slaveAppId, isRun) {
      var slaveApp = this.slaveApps.find(o => {
        return o.id === slaveAppId
      })
      var index = this.slaveApps.findIndex(o => {
        return o.id === slaveAppId
      })
      slaveApp.status = isRun ? '在线' : '离线'
      slaveApp.cls = isRun ? 'online' : 'offline'
      this.$set(this.slaveApps, index, slaveApp)
    },
    /**
     * status: 目标状态
     * times: 当前次数
     * limit: 重试上限
     */
    interval(slaveAppId, status, times, limit) {
      setTimeout(() => {
        isServerRun({ 'slaveAppId': slaveAppId }).then(resp => {
          var res = resp.data
          if (status === res.isRun) {
            var slaveApp = this.slaveApps.find(o => {
              return o.id === slaveAppId
            })
            slaveApp.status = res.isRun ? '在线' : '离线'
            slaveApp.cls = res.isRun ? 'online' : 'offline'
          } else {
            this.interval(slaveAppId, status, times++, limit)
          }
        })
      }, 5000)
    }
  }
}
</script>
<style scoped>
.time {
  font-size: 13px;
  color: #999;
}

.bottom {
  margin-top: 16px;
  line-height: 16px;
}

.button {
  padding: 0;
  float: right;
}

.image {
  width: 100%;
  cursor:pointer;
  display: block;
}

.slaveAppTitle {
    font-size: 16px;
    font-weight: bold;
    color: rgb(57, 85, 245);
}
.offline {
    background-color: #909399;
    border-radius: 4px;
    padding: 4px 10px;
    margin: 2px 2px;
    color: #fff;
    letter-spacing:2px;
}

.midline {
    background-color: #E6A23C;
    border-radius: 4px;
    padding: 4px 10px;
    margin: 2px 2px;
    color: #fff;
    letter-spacing:2px;
}

.online {
    background-color: rgb(132, 204, 95);
    border-radius: 4px;
    padding: 4px 10px;
    margin: 2px 2px;
    color: #fff;
    letter-spacing:2px;
}

.el-card__footer {
    padding: 10px 2px 0 2px;
    margin-top: 20px;
    border-top: 1px solid #ebeef5;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}
</style>

