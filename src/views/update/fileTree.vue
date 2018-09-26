<template>
  <div class="app-container">
    <!--<el-input placeholder="请输入要查找的文件名..." v-model="filterText" style="margin-bottom:30px;"></el-input>-->
    <el-card>
      <div slot="header" class="clearfix">
        <span>更新包文件列表</span><span v-if="appFileCount > 0">(共包含{{appFileCount}}个文件)</span>
        <el-dropdown @command="handleCommand" style="float:right;">
          <span class="el-dropdown-link">
            标记为<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="updateIgnore">更新不覆盖</el-dropdown-item>
            <el-dropdown-item command="updateBackup">更新前备份</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <el-tree style="max-height:600px;overflow:auto;" ref="fileTree" :props="props" :load="loadFileNode" @node-expand="nodeExpand" highlight-current lazy>
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span> <i :class="data.leaf?'el-icon-tickets':''"></i>{{ node.label }}</span>
        </span>
      </el-tree>
    </el-card>

  </div>
</template>

<script>
import { loadFiles, loadProps, updateIgnore } from '@/api/file'

export default {
  props: ['package'],
  watch: {
    filterText(val) {
      // this.$refs.tree2.filter(val)
    },
    package(pkg) {
      this.reload(pkg)
    }
  },
  data() {
    return {
      filepath: '',
      appFileCount: 0,
      props: {
        label: 'name',
        children: 'zones',
        isLeaf: 'leaf'
      }
    }
  },
  methods: {
    reload(pkg) {
      const tree = this.$refs.fileTree
      const store = tree.store
      store.setData([])
      // 获取path
      // this.filepath = 'D:/workspace_ideal/deploy/home/version_1/'
      if (!pkg) {
        return
      }
      const appId = pkg.appId
      const pkgId = pkg.id
      loadProps({ appId, pkgId }).then(response => {
        const appPath = response.data.appPath
        const appFileCount = response.data.appFileCount
        this.filepath = appPath
        this.appFileCount = appFileCount
        // 重新载入更新包列表
        store.load(store.root, (data) => {
          store.root.doCreateChildren(data)
          store._initDefaultCheckedNodes()
        })
      })
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    loadFileNode(node, resolve) {
      var path = node.level > 0 ? node.data.path : this.filepath
      // console.log(path)
      if (!path) return
      loadFiles({
        path
      }).then(response => {
        const nodes = response.data
        // console.log(nodes)
        return resolve(nodes)
      })
    },
    nodeExpand(obj, node, nodes) {
      console.log(node)
      console.log(nodes)
    },
    handleCommand(cmd) {
      var node = this.$refs.fileTree.getCurrentNode()
      if (!node) {
        return
      }
      console.log(node)
      if (cmd === 'updateIgnore') {
        // 更新忽略
        const h = this.$createElement
        this.$confirm(h('div', null, [h('p', null, '确认将文件[' + node.name + ']设置为更新忽略吗?'), h('p', { style: 'color: red' }, '更新忽略的文件,更新时不会覆盖原有项目中的文件!')]), '请确认')
          .then(_ => {
            const data = {
              name: node.name,
              path: node.path,
              appId: this.package.appId
            }
            updateIgnore(data).then(resp => {
              this.$message({
                message: '设置成功!'
              })
            })
          })
          .catch(_ => {})
      } else if (cmd === 'updateBackup') {
        // 更新前备份
      }
    }
  }
}
</script>
<style>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
</style>

