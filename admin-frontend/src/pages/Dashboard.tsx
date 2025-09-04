import React from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import { UserOutlined, SafetyOutlined, AuditOutlined } from '@ant-design/icons'

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1>仪表盘</h1>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="用户总数"
              value={112}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="权限总数"
              value={28}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日审计记录"
              value={93}
              prefix={<AuditOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard