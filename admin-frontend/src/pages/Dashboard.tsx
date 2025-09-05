import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import { UserOutlined, SafetyOutlined, AuditOutlined } from '@ant-design/icons'
import auditService from '../services/auditService'

const Dashboard: React.FC = () => {
  const [userCount, setUserCount] = useState(0)
  const [permissionCount, setPermissionCount] = useState(0)
  const [todayAuditCount, setTodayAuditCount] = useState(0)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = () => {
    try {
      // 获取用户总数
      const savedUsers = localStorage.getItem('users')
      if (savedUsers) {
        const users = JSON.parse(savedUsers)
        setUserCount(users.length)
      }

      // 获取权限总数
      const savedPermissions = localStorage.getItem('permissions')
      if (savedPermissions) {
        const permissions = JSON.parse(savedPermissions)
        setPermissionCount(permissions.length)
      }

      // 获取今日审计记录数
      const todayCount = auditService.getTodayLogsCount()
      setTodayAuditCount(todayCount)
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  }

  return (
    <div>
      <h1>仪表盘</h1>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="用户总数"
              value={userCount}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="权限总数"
              value={permissionCount}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日审计记录"
              value={todayAuditCount}
              prefix={<AuditOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard