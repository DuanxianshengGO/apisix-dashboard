import React from 'react'
import { Layout, Avatar, Dropdown, Space, message } from 'antd'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { useAuth } from '../contexts/AuthContext'

const { Header: AntHeader } = Layout

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    message.success('已退出登录')
    navigate('/login')
  }

  const items: MenuProps['items'] = [
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <AntHeader style={{ background: '#fff', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>APISIX 后台管理系统</h2>
        <Dropdown menu={{ items }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <span>{user?.username || '管理员'}</span>
          </Space>
        </Dropdown>
      </div>
    </AntHeader>
  )
}

export default Header