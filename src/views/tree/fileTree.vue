<template>
  <div class="app-container">
    <el-input placeholder="请输入要查找的文件名..." v-model="filterText" style="margin-bottom:30px;"></el-input>
    <el-card>
      <div slot="header" class="clearfix">
        <span>文件路径:{{filepath}}</span>
      </div>
      <el-tree :props="props" :load="loadFileNode" @node-expand="nodeExpand" highlight-current  lazy>
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span> <i :class="data.leaf?'el-icon-tickets':''"></i>{{ node.label }}</span>
        </span>
      </el-tree>
    </el-card>

  </div>
</template>

<script>
import { loadFiles, loadProps } from '@/api/file'

export default {
  watch: {
    filterText(val) {
      // this.$refs.tree2.filter(val)
    }
  },
  beforeCreate: function() {
    // File.loadFileParams()
    const appId = 1
    loadProps({ appId }).then(response => {
      const appPath = response.data.appPath
      this.filepath = appPath
    })
  },
  data() {
    return {
      filterText: '',
      filepath: '',
      props: {
        label: 'name',
        children: 'zones',
        isLeaf: 'leaf'
      }
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    loadFileNode(node, resolve) {
      var path = node.level > 0 ? node.data.path : this.filepath
      loadFiles({
        path
      }).then(response => {
        const nodes = response.data
        console.log(nodes)
        return resolve(nodes)
      })
    },
    nodeExpand(obj, node, nodes) {
      console.log(node)
      console.log(nodes)
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
</style>

