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
import PermissionGuard from '../components/PermissionGuard'
import auditService from '../services/auditService'
import { usePermission } from '../contexts/PermissionContext'

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

const PermissionManagement: React.FC = () => {
  const { currentUser } = usePermission()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [permissionModalVisible, setPermissionModalVisible] = useState(false)
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [userModalVisible, setUserModalVisible] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [permissionForm] = Form.useForm()
  const [roleForm] = Form.useForm()
  const [userForm] = Form.useForm()

  useEffect(() => {
    loadDataFromStorage()
  }, [])

  // 从localStorage加载数据
  const loadDataFromStorage = () => {
    try {
      const savedPermissions = localStorage.getItem('permissions')
      const savedRoles = localStorage.getItem('roles')
      const savedUsers = localStorage.getItem('users')

      if (savedPermissions) {
        setPermissions(JSON.parse(savedPermissions))
      } else {
        // 初始化默认数据
        const defaultPermissions = [
          {
            id: '1',
            name: '查看权限',
            resource: 'permissions',
            action: 'read',
            description: '查看权限配置',
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: '2',
            name: '创建权限',
            resource: 'permissions',
            action: 'create',
            description: '创建新权限',
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: '3',
            name: '编辑权限',
            resource: 'permissions',
            action: 'edit',
            description: '编辑权限配置',
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: '4',
            name: '删除权限',
            resource: 'permissions',
            action: 'delete',
            description: '删除权限',
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: '5',
            name: '查看角色',
            resource: 'roles',
            action: 'read',
            description: '查看角色配置',
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: '6',
            name: '创建角色',
            resource: 'roles',
            action: 'create',
            description: '创建新角色',
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: '7',
            name: '编辑角色',
            resource: 'roles',
            action: 'edit',
            description: '编辑角色配置',
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: '8',
            name: '删除角色',
            resource: 'roles',
            action: 'delete',
            description: '删除角色',
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: '9',
            name: '查看用户',
            resource: 'users',
            action: 'read',
            description: '查看用户信息',
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: '10',
            name: '创建用户',
            resource: 'users',
            action: 'create',
            description: '创建新用户',
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: '11',
            name: '编辑用户',
            resource: 'users',
            action: 'edit',
            description: '编辑用户信息',
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: '12',
            name: '删除用户',
            resource: 'users',
            action: 'delete',
            description: '删除用户',
            createTime: '2024-01-01 10:00:00'
          }
        ]
        setPermissions(defaultPermissions)
        localStorage.setItem('permissions', JSON.stringify(defaultPermissions))
      }

      if (savedRoles) {
        setRoles(JSON.parse(savedRoles))
      } else {
        const defaultRoles = [
          {
            id: '1',
            name: '管理员',
            description: '系统管理员，拥有所有权限',
            permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            status: 'active' as const,
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: '2',
            name: '开发者',
            description: '开发人员，只有查看权限',
            permissions: ['1', '5', '9'],
            status: 'active' as const,
            createTime: '2024-01-01 10:00:00'
          }
        ]
        setRoles(defaultRoles)
        localStorage.setItem('roles', JSON.stringify(defaultRoles))
      }

      if (savedUsers) {
        setUsers(JSON.parse(savedUsers))
      } else {
        const defaultUsers = [
          {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: '1',
            status: 'active' as const,
            createTime: '2024-01-01 10:00:00',
            updateTime: '2024-01-01 10:00:00'
          },
          {
            id: '2',
            username: 'dev',
            email: 'dev@example.com',
            password: 'dev123',
            role: '2',
            status: 'active' as const,
            createTime: '2024-01-01 10:00:00',
            updateTime: '2024-01-01 10:00:00'
          }
        ]
        setUsers(defaultUsers)
        localStorage.setItem('users', JSON.stringify(defaultUsers))
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      message.error('加载数据失败')
    }
  }

  // 保存数据到localStorage
  const saveDataToStorage = (type: 'permissions' | 'roles' | 'users', data: any[]) => {
    try {
      localStorage.setItem(type, JSON.stringify(data))
    } catch (error) {
      console.error('保存数据失败:', error)
      message.error('保存数据失败')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      // 模拟数据
      setPermissions([
        {
          id: '1',
          name: '查看路由',
          resource: 'route',
          action: 'read',
          description: '查看路由配置',
          createTime: '2024-01-01 10:00:00'
        },
        {
          id: '2',
          name: '编辑路由',
          resource: 'route',
          action: 'write',
          description: '编辑路由配置',
          createTime: '2024-01-01 10:00:00'
        }
      ])
      
      setRoles([
        {
          id: '1',
          name: '管理员',
          description: '系统管理员',
          permissions: ['1', '2'],
          status: 'active',
          createTime: '2024-01-01 10:00:00'
        }
      ])
      
      setUsers([
        {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          password: 'admin123',
          role: '1',
          status: 'active',
          createTime: '2024-01-01 10:00:00',
          updateTime: '2024-01-01 10:00:00'
        }
      ])
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPermission = () => {
    setEditingPermission(null)
    permissionForm.resetFields()
    setPermissionModalVisible(true)
  }

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission)
    permissionForm.setFieldsValue(permission)
    setPermissionModalVisible(true)
  }

  const handleDeletePermission = async (id: string) => {
    try {
      const permission = permissions.find(p => p.id === id)
      const updatedPermissions = permissions.filter(p => p.id !== id)
      setPermissions(updatedPermissions)
      saveDataToStorage('permissions', updatedPermissions)
      
      // 记录审计日志
      if (currentUser && permission) {
        auditService.logPermissionOperation(
          currentUser.username,
          currentUser.id,
          'delete',
          'permissions',
          id,
          { name: permission.name, resource: permission.resource, action: permission.action }
        )
      }
      
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
      
      // 记录失败日志
      if (currentUser) {
        auditService.logPermissionOperation(
          currentUser.username,
          currentUser.id,
          'delete',
          'permissions',
          id,
          {},
          false,
          '删除权限失败'
        )
      }
    }
  }

  const handleSubmitPermission = async (values: any) => {
    try {
      let updatedPermissions
      const action = editingPermission ? 'update' : 'create'
      const resourceId = editingPermission ? editingPermission.id : Date.now().toString()
      
      if (editingPermission) {
        const updatedPermission = { ...editingPermission, ...values }
        updatedPermissions = permissions.map(p => p.id === editingPermission.id ? updatedPermission : p)
        setPermissions(updatedPermissions)
        message.success('更新成功')
      } else {
        const newPermission: Permission = {
          id: resourceId,
          ...values,
          createTime: new Date().toLocaleString(),
        }
        updatedPermissions = [...permissions, newPermission]
        setPermissions(updatedPermissions)
        message.success('添加成功')
      }
      
      saveDataToStorage('permissions', updatedPermissions)
      
      // 记录审计日志
      if (currentUser) {
        auditService.logPermissionOperation(
          currentUser.username,
          currentUser.id,
          action,
          'permissions',
          resourceId,
          { name: values.name, resource: values.resource, action: values.action }
        )
      }
      
      setPermissionModalVisible(false)
      permissionForm.resetFields()
    } catch (error) {
      message.error('操作失败')
      
      // 记录失败日志
      if (currentUser) {
        const action = editingPermission ? 'update' : 'create'
        const resourceId = editingPermission ? editingPermission.id : 'unknown'
        auditService.logPermissionOperation(
          currentUser.username,
          currentUser.id,
          action,
          'permissions',
          resourceId,
          values,
          false,
          '权限操作失败'
        )
      }
    }
  }

  const handleAddRole = () => {
    setEditingRole(null)
    roleForm.resetFields()
    setRoleModalVisible(true)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    roleForm.setFieldsValue(role)
    setRoleModalVisible(true)
  }

  const handleDeleteRole = async (id: string) => {
    try {
      const role = roles.find(r => r.id === id)
      const updatedRoles = roles.filter(r => r.id !== id)
      setRoles(updatedRoles)
      saveDataToStorage('roles', updatedRoles)
      
      // 记录审计日志
      if (currentUser && role) {
        auditService.logPermissionOperation(
          currentUser.username,
          currentUser.id,
          'delete',
          'roles',
          id,
          { name: role.name, permissions: role.permissions }
        )
      }
      
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
      
      // 记录失败日志
      if (currentUser) {
        auditService.logPermissionOperation(
          currentUser.username,
          currentUser.id,
          'delete',
          'roles',
          id,
          {},
          false,
          '删除角色失败'
        )
      }
    }
  }

  const handleSubmitRole = async (values: any) => {
    try {
      let updatedRoles
      const action = editingRole ? 'update' : 'create'
      const resourceId = editingRole ? editingRole.id : Date.now().toString()
      
      if (editingRole) {
        const updatedRole = { ...editingRole, ...values }
        updatedRoles = roles.map(r => r.id === editingRole.id ? updatedRole : r)
        setRoles(updatedRoles)
        message.success('更新成功')
      } else {
        const newRole: Role = {
          id: resourceId,
          ...values,
          createTime: new Date().toLocaleString(),
        }
        updatedRoles = [...roles, newRole]
        setRoles(updatedRoles)
        message.success('添加成功')
      }
      
      saveDataToStorage('roles', updatedRoles)
      
      // 记录审计日志
      if (currentUser) {
        auditService.logPermissionOperation(
          currentUser.username,
          currentUser.id,
          action,
          'roles',
          resourceId,
          { name: values.name, permissions: values.permissions }
        )
      }
      
      setRoleModalVisible(false)
      roleForm.resetFields()
    } catch (error) {
      message.error('操作失败')
      
      // 记录失败日志
      if (currentUser) {
        const action = editingRole ? 'update' : 'create'
        const resourceId = editingRole ? editingRole.id : 'unknown'
        auditService.logPermissionOperation(
          currentUser.username,
          currentUser.id,
          action,
          'roles',
          resourceId,
          values,
          false,
          '角色操作失败'
        )
      }
    }
  }

  const handleAddUser = () => {
    setEditingUser(null)
    userForm.resetFields()
    setUserModalVisible(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    userForm.setFieldsValue(user)
    setUserModalVisible(true)
  }

  const handleDeleteUser = async (id: string) => {
    try {
      const user = users.find(u => u.id === id)
      const updatedUsers = users.filter(u => u.id !== id)
      setUsers(updatedUsers)
      saveDataToStorage('users', updatedUsers)
      
      // 记录审计日志
      if (currentUser && user) {
        auditService.logPermissionOperation(
          currentUser.username,
          currentUser.id,
          'delete',
          'users',
          id,
          { username: user.username, email: user.email, role: user.role }
        )
      }
      
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
      
      // 记录失败日志
      if (currentUser) {
        auditService.logPermissionOperation(
          currentUser.username,
          currentUser.id,
          'delete',
          'users',
          id,
          {},
          false,
          '删除用户失败'
        )
      }
    }
  }

  const handleSubmitUser = async (values: any) => {
    try {
      let updatedUsers
      const action = editingUser ? 'update' : 'create'
      const resourceId = editingUser ? editingUser.id : Date.now().toString()
      
      if (editingUser) {
        const updatedUser = { 
          ...editingUser, 
          ...values, 
          updateTime: new Date().toLocaleString() 
        }
        // 如果密码为空，则不更新密码字段
        if (!values.password) {
          delete updatedUser.password
          updatedUser.password = editingUser.password
        }
        updatedUsers = users.map(u => u.id === editingUser.id ? updatedUser : u)
        setUsers(updatedUsers)
        message.success('更新成功')
      } else {
        const newUser: User = {
          id: resourceId,
          ...values,
          createTime: new Date().toLocaleString(),
          updateTime: new Date().toLocaleString(),
        }
        updatedUsers = [...users, newUser]
        setUsers(updatedUsers)
        message.success('添加成功')
      }
      
      saveDataToStorage('users', updatedUsers)
      
      // 记录审计日志
      if (currentUser) {
        const logDetails = {
          username: values.username,
          email: values.email,
          role: values.role,
          status: values.status
        }
        auditService.logPermissionOperation(
          currentUser.username,
          currentUser.id,
          action,
          'users',
          resourceId,
          logDetails
        )
      }
      
      setUserModalVisible(false)
      userForm.resetFields()
    } catch (error) {
      message.error('操作失败')
      
      // 记录失败日志
      if (currentUser) {
        const action = editingUser ? 'update' : 'create'
        const resourceId = editingUser ? editingUser.id : 'unknown'
        auditService.logPermissionOperation(
          currentUser.username,
          currentUser.id,
          action,
          'users',
          resourceId,
          values,
          false,
          '用户操作失败'
        )
      }
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
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <PermissionGuard resource="permissions" action="edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditPermission(record)}
            >
              编辑
            </Button>
          </PermissionGuard>
          <PermissionGuard resource="permissions" action="delete">
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
          </PermissionGuard>
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
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <PermissionGuard resource="roles" action="edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditRole(record)}
            >
              编辑
            </Button>
          </PermissionGuard>
          <PermissionGuard resource="roles" action="delete">
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
          </PermissionGuard>
        </Space>
      ),
    },
  ]

  const userColumns: ColumnsType<User> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleInfo = roles.find(r => r.id === role)
        return roleInfo ? roleInfo.name : role
      },
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
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <PermissionGuard resource="users" action="edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            >
              编辑
            </Button>
          </PermissionGuard>
          <PermissionGuard resource="users" action="delete">
            <Popconfirm
              title="确定要删除这个用户吗？"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </PermissionGuard>
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
            <PermissionGuard resource="permissions" action="create">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPermission}>
                新增权限
              </Button>
            </PermissionGuard>
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
            <PermissionGuard resource="roles" action="create">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRole}>
                新增角色
              </Button>
            </PermissionGuard>
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
    {
      key: 'users',
      label: '用户管理',
      children: (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <h2>用户列表</h2>
            <PermissionGuard resource="users" action="create">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                新增用户
              </Button>
            </PermissionGuard>
          </div>
          <Table
            columns={userColumns}
            dataSource={users}
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

      {/* 权限模态框 */}
      <Modal
        title={editingPermission ? '编辑权限' : '新增权限'}
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        footer={null}
      >
        <Form
          form={permissionForm}
          layout="vertical"
          onFinish={handleSubmitPermission}
        >
          <Form.Item
            label="权限名称"
            name="name"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="资源"
            name="resource"
            rules={[{ required: true, message: '请选择资源' }]}
          >
            <Select>
              <Select.Option value="route">路由</Select.Option>
              <Select.Option value="service">服务</Select.Option>
              <Select.Option value="upstream">上游</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="操作"
            name="action"
            rules={[{ required: true, message: '请选择操作' }]}
          >
            <Select>
              <Select.Option value="read">读取</Select.Option>
              <Select.Option value="write">写入</Select.Option>
              <Select.Option value="delete">删除</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea />
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

      {/* 角色模态框 */}
      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        footer={null}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleSubmitRole}
        >
          <Form.Item
            label="角色名称"
            name="name"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label="权限"
            name="permissions"
          >
            <Select mode="multiple">
              {permissions.map(permission => (
                <Select.Option key={permission.id} value={permission.id}>
                  {permission.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
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

      {/* 用户模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleSubmitUser}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: !editingUser, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password placeholder={editingUser ? '留空则不修改密码' : '请输入密码'} />
          </Form.Item>

          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              {roles.map(role => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value="active">激活</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setUserModalVisible(false)
                  userForm.resetFields()
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