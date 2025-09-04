import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  username: string
  token: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 检查本地存储的token
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const username = localStorage.getItem('admin_username')
    
    if (token && username) {
      // 验证token是否有效
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser({ username, token })
    }
    
    setLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('/api/apisix/admin/user/login', {
        username,
        password
      })
      
      if (response.data && response.data.data && response.data.data.token) {
        const token = response.data.data.token
        
        // 存储到localStorage
        localStorage.setItem('admin_token', token)
        localStorage.setItem('admin_username', username)
        
        // 设置axios默认header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // 更新用户状态
        setUser({ username, token })
        
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    // 清除localStorage
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
    
    // 清除axios默认header
    delete axios.defaults.headers.common['Authorization']
    
    // 清除用户状态
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Axios拦截器设置
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，自动登出
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_username')
      delete axios.defaults.headers.common['Authorization']
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)