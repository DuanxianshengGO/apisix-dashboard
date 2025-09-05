import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string
  createTime: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  status: 'active' | 'inactive'
  createTime: string
}

interface User {
  id: string
  username: string
  email: string
  password: string
  role: string
  status: 'active' | 'inactive'
  createTime: string
  updateTime: string
}

interface PermissionContextType {
  currentUser: User | null
  permissions: Permission[]
  roles: Role[]
  hasPermission: (resource: string, action: string) => boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  getCurrentUserPermissions: () => Permission[]
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

interface PermissionProviderProps {
  children: ReactNode
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    loadData()
    loadCurrentUser()
  }, [])

  const loadData = () => {
    try {
      // 加载权限数据
      const savedPermissions = localStorage.getItem('permissions')
      if (savedPermissions) {
        setPermissions(JSON.parse(savedPermissions))
      }

      // 加载角色数据
      const savedRoles = localStorage.getItem('roles')
      if (savedRoles) {
        setRoles(JSON.parse(savedRoles))
      }
    } catch (error) {
      console.error('加载权限数据失败:', error)
    }
  }

  const loadCurrentUser = () => {
    try {
      const savedCurrentUser = localStorage.getItem('currentUser')
      if (savedCurrentUser) {
        setCurrentUser(JSON.parse(savedCurrentUser))
      }
    } catch (error) {
      console.error('加载当前用户失败:', error)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const savedUsers = localStorage.getItem('users')
      if (savedUsers) {
        const users: User[] = JSON.parse(savedUsers)
        const user = users.find(u => u.username === username && u.password === password && u.status === 'active')
        
        if (user) {
          setCurrentUser(user)
          localStorage.setItem('currentUser', JSON.stringify(user))
          return true
        }
      }
      return false
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  const getCurrentUserPermissions = (): Permission[] => {
    if (!currentUser) return []
    
    const userRole = roles.find(role => role.id === currentUser.role)
    if (!userRole) return []
    
    return permissions.filter(permission => userRole.permissions.includes(permission.id))
  }

  const hasPermission = (resource: string, action: string): boolean => {
    if (!currentUser) return false
    
    const userPermissions = getCurrentUserPermissions()
    return userPermissions.some(permission => 
      permission.resource === resource && permission.action === action
    )
  }

  const value: PermissionContextType = {
    currentUser,
    permissions,
    roles,
    hasPermission,
    login,
    logout,
    getCurrentUserPermissions
  }

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

export const usePermission = (): PermissionContextType => {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider')
  }
  return context
}

export default PermissionContext