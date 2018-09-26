<template>
    <div>
        <el-row>
            <el-col :span="4" v-for="slave in slaves" :key="slave.id" >
                <el-card :style="'margin:14px;height:235px;text-align: center;' + slave.style" :body-style="{ padding: '10px' }">
                    <img :src="img_slave" class="image" style="margin: 0 auto;width:180px;" @click="loadSlaveApps(slave.id)">
                    <div style="padding: 10px 2px 0 2px;text-align:left;">
                        <span class="slaveAppTitle">{{ slave.name }}({{ slave.ip }})</span>
                        <div class="bottom clearfix">
                            <span class="time">{{ slave.describes || '描述信息' }}</span>
                            <el-dropdown trigger="click" placement="bottom" style="cursor:pointer;float:right;" @command="configSlave">
                                <span class="el-dropdown-link">
                                    <i class="el-icon-setting el-icon--right"></i>
                                </span>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item :command="{cmd:'addApp',slave:slave}">添加应用</el-dropdown-item>
                                    <el-dropdown-item :command="{cmd:'show',slave:slave}" :divided=true>详情</el-dropdown-item>
                                    <el-dropdown-item :command="{cmd:'delete',slave:slave}" :divided=true>删除</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="4">
                <el-card style="margin:14px;height:235px;line-height:235px;padding-top:20px;text-align: center;">
                    <img :src="img_add_slave" class="image" style="margin: 0 auto;width:120px;display: inline-block;vertical-align: top;" @click="newSlave">
                </el-card>
            </el-col>
        </el-row>
        <hr>
        <el-row>
            <el-col :span="8" v-for="slaveApp in slaveApps" :key="slaveApp.id" >
                <el-card style="margin:14px;" >
                    <div slot="header" class="clearfix">
                        应用:<span class="slaveAppTitle">{{ slaveApp.appName }}</span>   
                        版本:<span class="slaveAppTitle">{{ slaveApp.appPackage?slaveApp.appPackage.version:'未部署' }}</span>
                        <el-tooltip effect="dark" content="应用有可用更新,点击更新" placement="bottom-start">
                          <el-button icon="el-icon-upload"  v-if="slaveApp.update" circle style="padding:6px;" @click="appUpdate(slaveApp)"></el-button>
                        </el-tooltip>
                        <span style="float:right;padding-top:4px;">
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
                    <div class="bottom clearfix">TOMCAT_HOME:<el-input v-model="slaveApp.appTomcatHome" :disabled="true"></el-input></div>
                    <div class="bottom clearfix">部署目录:<el-input v-model="slaveApp.appTargetPath" :disabled="true" /></div>
                    <div class="bottom clearfix">备份目录:<el-input v-model="slaveApp.appBackupPath" :disabled="true" /></div>
                    <div class="clearfix el-card__footer">
                        <el-button type="primary" size="medium" style="padding: 8px 10px;" @click="configSlaveApp(slaveApp)" icon="el-icon-setting">维护</el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <slave-form :slaveId="checkedSlaveId" :visible="slaveFormVisible" @close="slaveFormVisible=false" @refresh="this.loadData"></slave-form>
        <slave-app-form :slaveAppId="checkedSlaveAppId" :title="slaveAppFormTitle" :visible="slaveAppFormVisible" @close="slaveAppFormVisible=false" @refresh="this.loadSlaveApps"></slave-app-form>
        <slave-update-list :slaveApp="checkedSlaveApp" :visible="updateListVisible" @close="updateListVisible=false" @refresh="this.loadSlaveApps"></slave-update-list>
    </div>
</template>

<script>
import img_slave from '@/assets/slave_images/slave.png'
import img_app from '@/assets/slave_images/app.png'
import img_add_slave from '@/assets/slave_images/add.png'
import slaveForm from '@/views/slave/slaveForm'
import slaveAppForm from '@/views/slave/slaveAppForm'
import slaveUpdateList from '@/views/slave/slaveUpdateList'

import { getToken } from '@/utils/auth'
import { loadSlaves, loadSlaveApps, deleteSlave, startServer, stopServer, isServerRun } from '@/api/slave'

export default {
  name: 'slave',
  components: {
    slaveForm,
    slaveAppForm,
    slaveUpdateList
  },
  mounted: function() {
    this.loadData()
  },
  data() {
    return {
      img_slave,
      img_app,
      img_add_slave,
      slaveFormVisible: false,
      slaveAppFormVisible: false,
      updateListVisible: false,
      checkedSlaveId: 0,
      checkedSlaveAppId: 0,
      checkedSlaveApp: {},
      slaveAppFormTitle: '',
      slaves: [],
      slaveApps: []
    }
  },
  methods: {
    loadData() {
      loadSlaves().then(response => {
        this.slaves = response.data
      })
    },
    /**
     * 应用更新
     */
    appUpdate(slaveApp) {
      this.checkedSlaveApp = slaveApp
      this.updateListVisible = true
    },
    slaveManage(slaveId) {
      this.checkedSlaveId = slaveId
      this.slaveFormVisible = true
    },
    newSlave() {
      this.checkedSlaveId = 0
      this.slaveFormVisible = true
    },
    configSlaveApp(slaveApp) {
      this.checkedSlaveAppId = slaveApp.id
      this.slaveAppFormTitle = slaveApp.appName
      this.slaveAppFormVisible = true
    },
    loadSlaveApps(slaveId) {
      if (!slaveId) {
        slaveId = this.lastFocus
      }
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
          this.slaveApps = []
          return
        }
        slaveApps.forEach(slaveApp => {
          isServerRun({ 'slaveAppId': slaveApp.id }).then(resp => {
            var res = resp.data
            slaveApp.status = (res && res.isRun) ? '在线' : '离线'
            slaveApp.cls = (res && res.isRun) ? 'online' : 'offline'
            if (--length === 0) {
              loading.close()
              this.slaveApps = slaveApps
            }
          }).catch(e => {
            loading.close()
          })
        })
      }).catch(e => {
        loading.close()
      })
    },
    handleCommand(order) {
      var cmd = order.cmd
      var slaveAppId = order.id
      if (cmd === 'start') {
        startServer({ slaveAppId }).then(response => {
          console.log(response)
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
            var download = process.env.BASE_API + '/slave/dumpThread?slaveAppId=' + slaveAppId + '&X-Token=' + getToken()
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
    configSlave(order) {
      var cmd = order.cmd
      var slave = order.slave
      if (cmd === 'show') {
        this.slaveManage(slave.id)
      } else if (cmd === 'delete') {
        this.$confirm('确定要删除节点[' + slave.name + ']？删除后将不可恢复!', '请确认')
          .then(_ => {
            deleteSlave(slave.id).then((response) => {
              this.loadData()
            })
          })
      }
    },
    setSlaveFoucs(slaveId) {
      this.lastFocus = slaveId
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
  width: 160px;
  cursor:pointer;
  display: block;
}

.slaveAppTitle {
    font-size: 16px;
    font-weight: bold;
    color: rgb(57, 85, 245);
    padding-left: 4px;
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

