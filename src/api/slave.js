import request from '@/utils/request'

export function loadSlaves() {
  return request({
    url: '/slave/list',
    method: 'get'
  })
}

export function loadSlave(id) {
  return request({
    url: '/slave/load',
    method: 'get',
    params: {
      id: id
    }
  })
}

export function loadSlaveApps(params) {
  return request({
    url: '/slave/apps',
    method: 'get',
    params
  })
}

export function loadSlaveApp(slaveAppId) {
  return request({
    url: '/slave/app',
    method: 'get',
    params: {
      id: slaveAppId
    }
  })
}

export function loadSlaveUpdates(slaveAppId) {
  return request({
    url: '/slave/updates',
    method: 'get',
    params: {
      slaveAppId: slaveAppId
    }
  })
}

export function updatePackage(slaveAppId, pkgId) {
  return request({
    url: '/slave/update',
    method: 'get',
    params: {
      slaveAppId: slaveAppId,
      pkgId: pkgId
    }
  })
}

export function updateProcess(slaveAppId) {
  return request({
    url: '/slave/update/process',
    method: 'get',
    params: {
      slaveAppId: slaveAppId
    }
  })
}

export function updateFinish(slaveAppId, status) {
  return request({
    url: '/slave/update/finish',
    method: 'get',
    params: {
      slaveAppId: slaveAppId,
      status: status
    }
  })
}

export function saveSlave(params) {
  return request({
    url: '/slave/save',
    method: 'post',
    data: params
  })
}

export function deleteSlave(slaveId) {
  return request({
    url: '/slave/delete',
    method: 'get',
    params: {
      id: slaveId
    }
  })
}

export function saveSlaveApp(params) {
  return request({
    url: '/slave/app/save',
    method: 'post',
    data: params
  })
}

export function startServer(params) {
  return request({
    url: '/slave/tomcatStart',
    method: 'get',
    params
  })
}

export function stopServer(params) {
  return request({
    url: '/slave/tomcatStop',
    method: 'get',
    params
  })
}

export function dumpThread(params) {
  return request({
    url: '/slave/dumpThread',
    method: 'get',
    params
  })
}

export function isServerRun(params) {
  return request({
    url: '/slave/tomcatAlive',
    method: 'get',
    params
  })
}
