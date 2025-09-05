// 初始化权限和角色数据服务
export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string
  createTime: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  status: 'active' | 'inactive'
  createTime: string
}

export interface User {
  id: string
  username: string
  email: string
  password: string
  role: string
  status: 'active' | 'inactive'
  createTime: string
  updateTime: string
}

// 默认权限数据
const defaultPermissions: Permission[] = [
  // 路由管理权限
  {
    id: 'route_create',
    name: '创建路由',
    resource: 'route',
    action: 'create',
    description: '创建新路由的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'route_read',
    name: '查看路由',
    resource: 'route',
    action: 'read',
    description: '查看路由信息的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'route_update',
    name: '更新路由',
    resource: 'route',
    action: 'update',
    description: '更新路由配置的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'route_delete',
    name: '删除路由',
    resource: 'route',
    action: 'delete',
    description: '删除路由的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'route_list',
    name: '路由列表',
    resource: 'route',
    action: 'list',
    description: '查看路由列表的权限',
    createTime: new Date().toISOString()
  },

  // 服务管理权限
  {
    id: 'service_create',
    name: '创建服务',
    resource: 'service',
    action: 'create',
    description: '创建新服务的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'service_read',
    name: '查看服务',
    resource: 'service',
    action: 'read',
    description: '查看服务信息的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'service_update',
    name: '更新服务',
    resource: 'service',
    action: 'update',
    description: '更新服务配置的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'service_delete',
    name: '删除服务',
    resource: 'service',
    action: 'delete',
    description: '删除服务的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'service_list',
    name: '服务列表',
    resource: 'service',
    action: 'list',
    description: '查看服务列表的权限',
    createTime: new Date().toISOString()
  },

  // 上游管理权限
  {
    id: 'upstream_create',
    name: '创建上游',
    resource: 'upstream',
    action: 'create',
    description: '创建新上游的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'upstream_read',
    name: '查看上游',
    resource: 'upstream',
    action: 'read',
    description: '查看上游信息的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'upstream_update',
    name: '更新上游',
    resource: 'upstream',
    action: 'update',
    description: '更新上游配置的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'upstream_delete',
    name: '删除上游',
    resource: 'upstream',
    action: 'delete',
    description: '删除上游的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'upstream_list',
    name: '上游列表',
    resource: 'upstream',
    action: 'list',
    description: '查看上游列表的权限',
    createTime: new Date().toISOString()
  },

  // 用户管理权限
  {
    id: 'user_create',
    name: '创建用户',
    resource: 'user',
    action: 'create',
    description: '创建新用户的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'user_read',
    name: '查看用户',
    resource: 'user',
    action: 'read',
    description: '查看用户信息的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'user_update',
    name: '更新用户',
    resource: 'user',
    action: 'update',
    description: '更新用户信息的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'user_delete',
    name: '删除用户',
    resource: 'user',
    action: 'delete',
    description: '删除用户的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'user_list',
    name: '用户列表',
    resource: 'user',
    action: 'list',
    description: '查看用户列表的权限',
    createTime: new Date().toISOString()
  },

  // 角色管理权限
  {
    id: 'role_create',
    name: '创建角色',
    resource: 'role',
    action: 'create',
    description: '创建新角色的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'role_read',
    name: '查看角色',
    resource: 'role',
    action: 'read',
    description: '查看角色信息的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'role_update',
    name: '更新角色',
    resource: 'role',
    action: 'update',
    description: '更新角色配置的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'role_delete',
    name: '删除角色',
    resource: 'role',
    action: 'delete',
    description: '删除角色的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'role_list',
    name: '角色列表',
    resource: 'role',
    action: 'list',
    description: '查看角色列表的权限',
    createTime: new Date().toISOString()
  },

  // 审计权限
  {
    id: 'audit_read',
    name: '查看审计日志',
    resource: 'audit',
    action: 'read',
    description: '查看审计日志的权限',
    createTime: new Date().toISOString()
  },
  {
    id: 'audit_config',
    name: '配置审计',
    resource: 'audit',
    action: 'config',
    description: '配置审计设置的权限',
    createTime: new Date().toISOString()
  }
]

// 默认角色数据
const defaultRoles: Role[] = [
  {
    id: 'admin',
    name: '管理员',
    description: '拥有系统所有权限',
    status: 'active',
    permissions: [
      'route_create', 'route_read', 'route_update', 'route_delete', 'route_list',
      'service_create', 'service_read', 'service_update', 'service_delete', 'service_list',
      'upstream_create', 'upstream_read', 'upstream_update', 'upstream_delete', 'upstream_list',
      'user_create', 'user_read', 'user_update', 'user_delete', 'user_list',
      'role_create', 'role_read', 'role_update', 'role_delete', 'role_list',
      'audit_read', 'audit_config'
    ],
    createTime: new Date().toISOString()
  },
  {
    id: 'operator',
    name: '操作员',
    description: '可以管理路由、服务和上游',
    status: 'active',
    permissions: [
      'route_create', 'route_read', 'route_update', 'route_delete', 'route_list',
      'service_create', 'service_read', 'service_update', 'service_delete', 'service_list',
      'upstream_create', 'upstream_read', 'upstream_update', 'upstream_delete', 'upstream_list'
    ],
    createTime: new Date().toISOString()
  },
  {
    id: 'viewer',
    name: '查看者',
    description: '只能查看信息，无法修改',
    status: 'active',
    permissions: [
      'route_read', 'route_list',
      'service_read', 'service_list',
      'upstream_read', 'upstream_list',
      'user_read', 'user_list',
      'role_read', 'role_list',
      'audit_read'
    ],
    createTime: new Date().toISOString()
  }
]

// 默认用户数据
const defaultUsers: User[] = [
  {
    id: 'dev-user',
    username: 'dev',
    email: 'dev@apisix.local',
    password: 'dev123',
    role: 'viewer',
    status: 'active',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  }
]

class InitDataService {
  private static instance: InitDataService

  static getInstance(): InitDataService {
    if (!InitDataService.instance) {
      InitDataService.instance = new InitDataService()
    }
    return InitDataService.instance
  }

  // 初始化所有数据
  initializeData(): void {
    this.initializePermissions()
    this.initializeRoles()
    this.initializeUsers()
    console.log('权限系统数据初始化完成')
  }

  // 初始化权限数据
  private initializePermissions(): void {
    const existingPermissions = localStorage.getItem('permissions')
    if (!existingPermissions) {
      localStorage.setItem('permissions', JSON.stringify(defaultPermissions))
      console.log('权限数据已初始化')
    }
  }

  // 初始化角色数据
  private initializeRoles(): void {
    const existingRoles = localStorage.getItem('roles')
    if (!existingRoles) {
      localStorage.setItem('roles', JSON.stringify(defaultRoles))
      console.log('角色数据已初始化')
    }
  }

  // 初始化用户数据
  private initializeUsers(): void {
    const existingUsers = localStorage.getItem('users')
    if (!existingUsers) {
      localStorage.setItem('users', JSON.stringify(defaultUsers))
      console.log('用户数据已初始化')
    }
  }

  // 检查是否需要初始化
  needsInitialization(): boolean {
    const permissions = localStorage.getItem('permissions')
    const roles = localStorage.getItem('roles')
    const users = localStorage.getItem('users')
    
    return !permissions || !roles || !users
  }

  // 重置所有数据
  resetData(): void {
    localStorage.removeItem('permissions')
    localStorage.removeItem('roles')
    localStorage.removeItem('users')
    localStorage.removeItem('currentUser')
    this.initializeData()
    console.log('权限系统数据已重置')
  }
}

export default InitDataService.getInstance()