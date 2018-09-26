import request from '@/utils/request'

export function loadApps() {
  return request({
    url: '/app/list',
    method: 'get'
  })
}

export function createApp(params) {
  return request({
    url: '/app/create',
    method: 'post',
    data: params
  })
}

export function updateApp(params) {
  return request({
    url: '/app/update',
    method: 'post',
    data: params
  })
}

export function deleteApp(appId) {
  return request({
    url: '/app/delete',
    method: 'get',
    params: {
      appId: appId
    }
  })
}

export function loadPackages(params) {
  return request({
    url: '/app/packages',
    method: 'get',
    params: params
  })
}

export function findPackage(pkgId) {
  return request({
    url: '/app/package',
    method: 'get',
    params: {
      pkgId: pkgId
    }
  })
}

export function savePackage(params) {
  return request({
    url: '/app/package/save',
    method: 'post',
    data: params
  })
}
