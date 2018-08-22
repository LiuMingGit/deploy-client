import request from '@/utils/request'

export function loadSlaves() {
  return request({
    url: '/slave/list',
    method: 'get'
  })
}

export function loadSlaveApps(params) {
  return request({
    url: '/slave/apps',
    method: 'get',
    params
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
