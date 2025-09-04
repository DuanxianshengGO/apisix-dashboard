import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  Tag,
  Tabs,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

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

const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [permissionModalVisible, setPermissionModalVisible] = useState(false)
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [permissionForm] = Form.useForm()
  const [roleForm] = Form.useForm()

  // 模拟权限数据
  const mockPermissions: Permission[] = [
    {
      id: '1',
      name: '查看路由',
      resource: 'route',
      action: 'read',
      description: '查看路由配置的权限',
      createTime: '2024-01-01 10:00:00',
    },
    {
      id: '2',
      name: '创建路由',
      resource: 'route',
      action: 'create',
      description: '创建新路由的权限',
      createTime: '2024-01-01 10:00:00',
    },
    {
      id: '3',
      name: '用户管理',
      resource: 'user',
      action: 'manage',
      description: '管理用户的权限',
      createTime: '2024-01-01 10:00:00',
    },
  ]

  // 模拟角色数据
  const mockRoles: Role[] = [
    {
      id: '1',
      name: '管理员',
      description: '系统管理员，拥有所有权限',
      permissions: ['1', '2', '3'],
      status: 'active',
      createTime: '2024-01-01 10:00:00',
    },
    {
      id: '2',
      name: '操作员',
      description: '普通操作员，拥有基本操作权限',
      permissions: ['1'],
      status: 'active',
      createTime: '2024-01-01 10:00:00',
    },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      setTimeout(() => {
        setPermissions(mockPermissions)
        setRoles(mockRoles)
        setLoading(false)
      }, 1000)
    } catch (error) {
      message.error('获取数据失败')
      setLoading(false)
    }
  }

  // 权限管理相关方法
  const handleAddPermission = () => {
    setEditingPermission(null)
    setPermissionModalVisible(true)
    permissionForm.resetFields()
  }

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission)
    setPermissionModalVisible(true)
    permissionForm.setFieldsValue(permission)
  }

  const handleDeletePermission = async (id: string) => {
    try {
      setPermissions(permissions.filter(p => p.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmitPermission = async (values: any) => {
    try {
      if (editingPermission) {
        const updatedPermission = { ...editingPermission, ...values }
        setPermissions(permissions.map(p => p.id === editingPermission.id ? updatedPermission : p))
        message.success('更新成功')
      } else {
        const newPermission: Permission = {
          id: Date.now().toString(),
          ...values,
          createTime: new Date().toLocaleString(),
        }
        setPermissions([...permissions, newPermission])
        message.success('添加成功')
      }
      setPermissionModalVisible(false)
      permissionForm.resetFields()
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 角色管理相关方法
  const handleAddRole = () => {
    setEditingRole(null)
    setRoleModalVisible(true)
    roleForm.resetFields()
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setRoleModalVisible(true)
    roleForm.setFieldsValue(role)
  }

  const handleDeleteRole = async (id: string) => {
    try {
      setRoles(roles.filter(r => r.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmitRole = async (values: any) => {
    try {
      if (editingRole) {
        const updatedRole = { ...editingRole, ...values }
        setRoles(roles.map(r => r.id === editingRole.id ? updatedRole : r))
        message.success('更新成功')
      } else {
        const newRole: Role = {
          id: Date.now().toString(),
          ...values,
          createTime: new Date().toLocaleString(),
        }
        setRoles([...roles, newRole])
        message.success('添加成功')
      }
      setRoleModalVisible(false)
      roleForm.resetFields()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const permissionColumns: ColumnsType<Permission> = [
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '资源',
      dataIndex: 'resource',
      key: 'resource',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditPermission(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个权限吗？"
            onConfirm={() => handleDeletePermission(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const roleColumns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => permissions.length,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '激活' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个角色吗？"
            onConfirm={() => handleDeleteRole(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const tabItems = [
    {
      key: 'permissions',
      label: '权限管理',
      children: (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <h2>权限列表</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPermission}>
              新增权限
            </Button>
          </div>
          <Table
            columns={permissionColumns}
            dataSource={permissions}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </div>
      ),
    },
    {
      key: 'roles',
      label: '角色管理',
      children: (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <h2>角色列表</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRole}>
              新增角色
            </Button>
          </div>
          <Table
            columns={roleColumns}
            dataSource={roles}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </div>
      ),
    },
  ]

  return (
    <div>
      <h1>权限管理</h1>
      <Tabs items={tabItems} />

      {/* 权限编辑模态框 */}
      <Modal
        title={editingPermission ? '编辑权限' : '新增权限'}
        open={permissionModalVisible}
        onCancel={() => {
          setPermissionModalVisible(false)
          permissionForm.resetFields()
        }}
        footer={null}
      >
        <Form
          form={permissionForm}
          layout="vertical"
          onFinish={handleSubmitPermission}
        >
          <Form.Item
            name="name"
            label="权限名称"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>

          <Form.Item
            name="resource"
            label="资源"
            rules={[{ required: true, message: '请输入资源' }]}
          >
            <Input placeholder="请输入资源" />
          </Form.Item>

          <Form.Item
            name="action"
            label="操作"
            rules={[{ required: true, message: '请输入操作' }]}
          >
            <Input placeholder="请输入操作" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入描述" rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPermission ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setPermissionModalVisible(false)
                  permissionForm.resetFields()
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 角色编辑模态框 */}
      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={roleModalVisible}
        onCancel={() => {
          setRoleModalVisible(false)
          roleForm.resetFields()
        }}
        footer={null}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleSubmitRole}
        >
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入角色描述" rows={3} />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="权限"
            rules={[{ required: true, message: '请选择权限' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择权限"
              options={permissions.map((permission) => ({
                label: `${permission.name} (${permission.resource}:${permission.action})`,
                value: permission.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">激活</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRole ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setRoleModalVisible(false)
                  roleForm.resetFields()
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PermissionManagement