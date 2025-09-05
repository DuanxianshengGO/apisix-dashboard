import React, { useState, useEffect } from 'react'
import {
  Table,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Button,
  Modal,
  Descriptions,
  Card,
} from 'antd'
import { SearchOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import auditService from '../services/auditService'

const { RangePicker } = DatePicker
const { Search } = Input

interface AuditLog {
  id: string
  userId: string
  username: string
  action: string
  resource: string
  resourceId: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  status: 'success' | 'failed'
  errorMsg?: string
  timestamp: number
  createTime: string
}

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [filters, setFilters] = useState({
    username: '',
    action: '',
    resource: '',
    status: '',
    dateRange: null as any,
  })

  // 模拟审计日志数据
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      userId: '1',
      username: 'admin',
      action: 'create',
      resource: 'route',
      resourceId: 'route_001',
      details: {
        name: 'test-route',
        uri: '/api/test',
        methods: ['GET', 'POST'],
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      timestamp: Date.now() - 3600000,
      createTime: dayjs(Date.now() - 3600000).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: '2',
      userId: '2',
      username: 'operator',
      action: 'update',
      resource: 'user',
      resourceId: 'user_002',
      details: {
        field: 'status',
        oldValue: 'inactive',
        newValue: 'active',
      },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      status: 'success',
      timestamp: Date.now() - 7200000,
      createTime: dayjs(Date.now() - 7200000).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: '3',
      userId: '1',
      username: 'admin',
      action: 'delete',
      resource: 'route',
      resourceId: 'route_002',
      details: {
        name: 'old-route',
        reason: 'deprecated',
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'failed',
      errorMsg: '权限不足',
      timestamp: Date.now() - 10800000,
      createTime: dayjs(Date.now() - 10800000).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: '4',
      userId: '3',
      username: 'guest',
      action: 'login',
      resource: 'system',
      resourceId: 'login',
      details: {
        loginMethod: 'password',
      },
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      status: 'success',
      timestamp: Date.now() - 14400000,
      createTime: dayjs(Date.now() - 14400000).format('YYYY-MM-DD HH:mm:ss'),
    },
  ]

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [logs, filters])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      // 从auditService获取真实的审计日志数据
      const realLogs = auditService.getLogs()
      
      // 如果没有真实数据，使用模拟数据作为示例
      const logsToUse = realLogs.length > 0 ? realLogs : mockLogs
      
      // 模拟API调用延迟
      setTimeout(() => {
        setLogs(logsToUse)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('获取审计日志失败:', error)
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...logs]

    if (filters.username) {
      filtered = filtered.filter(log => 
        log.username.toLowerCase().includes(filters.username.toLowerCase())
      )
    }

    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action)
    }

    if (filters.resource) {
      filtered = filtered.filter(log => log.resource === filters.resource)
    }

    if (filters.status) {
      filtered = filtered.filter(log => log.status === filters.status)
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange
      filtered = filtered.filter(log => {
        const logTime = dayjs(log.timestamp)
        return logTime.isAfter(start) && logTime.isBefore(end)
      })
    }

    setFilteredLogs(filtered)
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log)
    setDetailModalVisible(true)
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'green',
      update: 'blue',
      delete: 'red',
      login: 'purple',
      logout: 'orange',
    }
    return colors[action] || 'default'
  }

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'green' : 'red'
  }

  const columns: ColumnsType<AuditLog> = [
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      sorter: (a, b) => a.timestamp - b.timestamp,
    },
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action: string) => (
        <Tag color={getActionColor(action)}>
          {action.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: '资源',
      dataIndex: 'resource',
      key: 'resource',
      width: 100,
    },
    {
      title: '资源ID',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <h1>审计日志</h1>
          <Space wrap>
            <Search
              placeholder="搜索用户名"
              style={{ width: 200 }}
              value={filters.username}
              onChange={(e) => handleFilterChange('username', e.target.value)}
              allowClear
            />
            <Select
              placeholder="选择操作"
              style={{ width: 120 }}
              value={filters.action || undefined}
              onChange={(value) => handleFilterChange('action', value)}
              allowClear
            >
              <Select.Option value="create">CREATE</Select.Option>
              <Select.Option value="update">UPDATE</Select.Option>
              <Select.Option value="delete">DELETE</Select.Option>
              <Select.Option value="login">LOGIN</Select.Option>
              <Select.Option value="logout">LOGOUT</Select.Option>
            </Select>
            <Select
              placeholder="选择资源"
              style={{ width: 120 }}
              value={filters.resource || undefined}
              onChange={(value) => handleFilterChange('resource', value)}
              allowClear
            >
              <Select.Option value="route">Route</Select.Option>
              <Select.Option value="service">Service</Select.Option>
              <Select.Option value="upstream">Upstream</Select.Option>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="system">System</Select.Option>
            </Select>
            <Select
              placeholder="选择状态"
              style={{ width: 100 }}
              value={filters.status || undefined}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
            >
              <Select.Option value="success">成功</Select.Option>
              <Select.Option value="failed">失败</Select.Option>
            </Select>
            <RangePicker
              showTime
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
              placeholder={['开始时间', '结束时间']}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchLogs}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="审计日志详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedLog && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="日志ID">{selectedLog.id}</Descriptions.Item>
            <Descriptions.Item label="用户ID">{selectedLog.userId}</Descriptions.Item>
            <Descriptions.Item label="用户名">{selectedLog.username}</Descriptions.Item>
            <Descriptions.Item label="操作">
              <Tag color={getActionColor(selectedLog.action)}>
                {selectedLog.action.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="资源">{selectedLog.resource}</Descriptions.Item>
            <Descriptions.Item label="资源ID">{selectedLog.resourceId}</Descriptions.Item>
            <Descriptions.Item label="IP地址">{selectedLog.ipAddress}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedLog.status)}>
                {selectedLog.status === 'success' ? '成功' : '失败'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="时间" span={2}>
              {selectedLog.createTime}
            </Descriptions.Item>
            {selectedLog.errorMsg && (
              <Descriptions.Item label="错误信息" span={2}>
                <span style={{ color: 'red' }}>{selectedLog.errorMsg}</span>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="用户代理" span={2}>
              {selectedLog.userAgent}
            </Descriptions.Item>
            <Descriptions.Item label="详细信息" span={2}>
              <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default AuditLog