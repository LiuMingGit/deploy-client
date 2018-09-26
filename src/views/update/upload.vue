<template>
    <el-dialog title="上传更新包(支持多文件、zip、war)" :visible="visible" :close-on-click-modal="false" :show-close="false" :close-on-press-escape="false"
               :before-close="beforeClose" @open="dialogOpen">
        <uploader ref="uploader" :options="options" class="uploader-example" :autoStart="false" :fileStatusText="fileStatusText">
            <uploader-unsupport></uploader-unsupport>
            <uploader-drop>
                <p>拖动文件到此处或者</p>
                <uploader-btn>选择文件</uploader-btn>
                <uploader-btn :directory="true">选择目录</uploader-btn>
            </uploader-drop>
            <uploader-list></uploader-list>
        </uploader>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogClose">关 闭</el-button>
            <el-button type="primary" @click="startAll">上传全部</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { getToken } from '@/utils/auth'
import { Uploader, UploaderBtn, UploaderDrop, UploaderUnsupport, UploaderList, UploaderFiles, UploaderFile } from 'vue-simple-uploader'

export default {
  components: {
    Uploader,
    UploaderBtn,
    UploaderDrop,
    UploaderUnsupport,
    UploaderList,
    UploaderFiles,
    UploaderFile
  },
  props: ['pack', 'visible'],
  data() {
    return {
      fileStatusText: {
        success: '成功',
        error: '失败',
        uploading: '上传中',
        paused: '暂停',
        waiting: '等待上传'
      },
      options: {
        target: process.env.BASE_API + '/app/upload',
        chunkSize: 2 * 1024 * 1024,
        headers: {
          'X-Token': getToken()
        },
        testChunks: false
      }
    }
  },
  methods: {
    startAll: function() {
      const fileList = this.$refs.uploader.uploader.fileList
      this.change = fileList.length
      fileList.forEach(file => {
        file.resume()
      })
    },
    dialogOpen: function() {
      this.change = false
      if (this.$refs.uploader) {
        this.$refs.uploader.uploader.opts.query = { pkgId: this.pack.id, appId: this.pack.appId }
      } else {
        this.options.query = { pkgId: this.pack.id, appId: this.pack.appId }
      }
    },
    beforeClose: function(done) {
      const uploading = this.$refs.uploader.uploader.isUploading()
      if (uploading) {
        this.$confirm('文件上传中,确定要取消上传？', '请确认')
          .then(_ => {
            done()
          })
          .catch(_ => {})
      } else {
        done()
      }
    },
    dialogClose: function() {
      if (this.change) {
        this.$emit('refresh')
      }
      this.$emit('close')
      this.$refs.uploader.uploader.cancel()
    }
  }
}
</script>
<style>
.uploader-example {
    width: 100%;
    padding: 15px;
    font-size: 12px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .4);
  }
  .uploader-example .uploader-btn {
    margin-right: 4px;
  }
  .uploader-example .uploader-list {
    max-height: 300px;
    overflow: auto;
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>