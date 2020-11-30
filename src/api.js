import http from './fetch/index.js'

const config = {
    
    // 获取分页表格信息
      getTableData: {
          url: '/pc/user/listUser',
          method:'post'
    },
    // 新增用户
    addUsers: {
      url: '/pc/user/addUser',
      method:"post"
    },
    // 获取要修改用户信息
    getChangeInfo: {
      url: '/pc/user/getUser',
      method:"post"
    },
    // 修改用户
    editUserInfo: {
      url: '/pc/user/updateUser',
      method:"post"
    },
    // 删除用户
    deleteUser: {
      url: '/pc/user/deleteUser',
      method:'post'
    },
    uploadImg: {
      url: '/pc/image/upload',
      method:'post'
    }
  }
  
  const request = function (funcName, requestParam) {
    return http(config[funcName].url, config[funcName].method, requestParam, {}, config[funcName].fileConfig)
  }
  export default request
  