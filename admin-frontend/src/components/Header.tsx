import React from 'react'
import { Layout, Avatar, Dropdown, Space } from 'antd'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'

const { Header: AntHeader } = Layout

const Header: React.FC = () => {
  const handleLogout = () => {
    // 处理登出逻辑
    console.log('用户登出')
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
        <h2 style={{ margin: 0 }}>后台管理系统</h2>
        <Dropdown menu={{ items }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <span>管理员</span>
          </Space>
        </Dropdown>
      </div>
    </AntHeader>
  )
}

export default Header