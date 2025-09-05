import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePermission } from '../contexts/PermissionContext'
import auditService from '../services/auditService'

const { Title } = Typography

interface LoginForm {
  username: string
  password: string
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { login: permissionLogin } = usePermission()

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      // 首先尝试原有的API认证系统（支持configmap中的管理员账号）
      const authSuccess = await login(values.username, values.password)
      
      if (authSuccess) {
        // API认证成功，尝试权限系统登录
        let permissionSuccess = await permissionLogin(values.username, values.password)
        
        // 如果权限系统中没有该用户，为原有管理员账号创建权限记录
        if (!permissionSuccess && values.username === 'admin') {
          // 为原有管理员账号在权限系统中创建记录
          const users = JSON.parse(localStorage.getItem('users') || '[]')
          const adminUser = {
            id: 'admin-original',
            username: 'admin',
            password: values.password, // 使用输入的密码
            role: 'admin',
            status: 'active',
            email: 'admin@apisix.local',
            createTime: new Date().toISOString()
          }
          users.push(adminUser)
          localStorage.setItem('users', JSON.stringify(users))
          
          // 再次尝试权限系统登录
          permissionSuccess = await permissionLogin(values.username, values.password)
        }
        
        // 记录登录成功的审计日志
        auditService.logLogin(values.username, '1', true)
        
        message.success('登录成功')
        navigate('/dashboard')
      } else {
        // API认证失败，尝试权限系统登录（支持新创建的账号）
        const permissionSuccess = await permissionLogin(values.username, values.password)
        
        if (permissionSuccess) {
          // 记录登录成功的审计日志
          auditService.logLogin(values.username, '1', true)
          
          message.success('登录成功')
          navigate('/dashboard')
        } else {
          // 记录登录失败的审计日志
          auditService.logLogin(values.username, 'unknown', false, '用户名或密码错误')
          
          message.error('用户名或密码错误')
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      
      // 记录登录异常的审计日志
      auditService.logLogin(values.username, 'unknown', false, error.message || '登录异常')
      
      message.error('登录失败：' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        style={{ 
          width: 400, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: '8px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            APISIX 后台管理
          </Title>
          <p style={{ color: '#666', margin: 0 }}>请登录您的管理员账户</p>
        </div>
        
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 3, message: '用户名至少3个字符!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 3, message: '密码至少3个字符!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%', height: '40px' }}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: 16, color: '#999', fontSize: '12px' }}>
          <p>原有管理员: admin / admin</p>
          <p>新建账户: dev / dev123 (只读权限)</p>
        </div>
      </Card>
    </div>
  )
}

export default Login