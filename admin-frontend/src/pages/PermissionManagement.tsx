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

interface User {
  id: string
  username: string
  email: string
  role: string
  status: 'active' | 'inactive'
  createTime: string
  updateTime: string
}

const PermissionManagement: React.FC = () => {
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

  // 预定义的权限配置
  const predefinedPermissions: Permission[] = [
    // 路由权限
    {
      id: 'route-read',
      name: '查看路由',
      resource: 'route',
      action: 'read',
      description: '查看路由配置的权限',
      createTime: new Date().toLocaleString(),
    },
    {
      id: 'route-create',
      name: '创建路由',
      resource: 'route',
      action: 'create',
      description: '创建新路由的权限',
      createTime: new Date().toLocaleString(),
    },
    {
      id: 'route-update',
      name: '更新路由',
      resource: 'route',
      action: 'update',
      description: '更新路由配置的权限',
      createTime: new Date().toLocaleString(),
    },
    {
      id: 'route-delete',
      name: '删除路由',
      resource: 'route',
      action: 'delete',
      description: '删除路由的权限',
      createTime: new Date().toLocaleString(),
    },
    // 服务权限
    {
      id: 'service-read',
      name: '查看服务',
      resource: 'service',
      action: 'read',
      description: '查看服务配置的权限',
      createTime: new Date().toLocaleString(),
    },
    {
      id: 'service-create',
      name: '创建服务',
      resource: 'service',
      action: 'create',
      description: '创建新服务的权限',
      createTime: new Date().toLocaleString(),
    },
    {
      id: 'service-update',
      name: '更新服务',
      resource: 'service',
      action: 'update',
      description: '更新服务配置的权限',
      createTime: new Date().toLocaleString(),
    },
    {
      id: 'service-delete',
      name: '删除服务',
      resource: 'service',
      action: 'delete',
      description: '删除服务的权限',
      createTime: new Date().toLocaleString(),
    },
    // 上游权限
    {
      id: 'upstream-read',
      name: '查看上游',
      resource: 'upstream',
      action: 'read',
      description: '查看上游配置的权限',
      createTime: new Date().toLocaleString(),
    },
    {
      id: 'upstream-create',
      name: '创建上游',
      resource: 'upstream',
      action: 'create',
      description: '创建新上游的权限',
      createTime: new Date().toLocaleString(),
    },
    {
      id: 'upstream-update',
      name: '更新上游',
      resource: 'upstream',
      action: 'update',
      description: '更新上游配置的权限',
      createTime: new Date().toLocaleString(),
    },
    {
      id: 'upstream-delete',
      name: '删除上游',
      resource: 'upstream',
      action: 'delete',
      description: '删除上游的权限',
      createTime: new Date().toLocaleString(),
    },
  ]

  // 预定义角色
  const predefinedRoles: Role[] = [
    {
      id: 'admin',
      name: '系统管理员',
      description: '拥有所有权限的系统管理员',
      permissions: predefinedPermissions.map(p => p.id),
      status: 'active',
      createTime: new Date().toLocaleString(),
    },
    {
      id: 'operator',
      name: '操作员',
      description: '拥有基本操作权限的操作员',
      permissions: [
        'route-read', 'route-create', 'route-update',
        'service-read', 'service-create', 'service-update',
        'upstream-read', 'upstream-create', 'upstream-update'
      ],
      status: 'active',
      createTime: new Date().toLocaleString(),
    },
    {
      id: 'viewer',
      name: '查看者',
      description: '只能查看配置的用户',
      permissions: ['route-read', 'service-read', 'upstream-read'],
      status: 'active',
      createTime: new Date().toLocaleString(),
    },
  ]

  // 预定义用户
  const predefinedUsers: User[] = [
    {
      id: 'user-1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
    },
    {
      id: 'user-2',
      username: 'operator',
      email: 'operator@example.com',
      role: 'operator',
      status: 'active',
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
    },
    {
      id: 'user-3',
      username: 'viewer',
      email: 'viewer@example.com',
      role: 'viewer',
      status: 'active',
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
    },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 初始化预定义权限、角色和用户
      setTimeout(() => {
        setPermissions(predefinedPermissions)
        setRoles(predefinedRoles)
        setUsers(predefinedUsers)
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

  // 用户管理相关方法
  const handleAddUser = () => {
    setEditingUser(null)
    setUserModalVisible(true)
    userForm.resetFields()
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setUserModalVisible(true)
    userForm.setFieldsValue(user)
  }

  const handleDeleteUser = async (id: string) => {
    try {
      setUsers(users.filter(u => u.id !== id))
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmitUser = async (values: any) => {
    try {
      if (editingUser) {
        const updatedUser = { 
          ...editingUser, 
          ...values, 
          updateTime: new Date().toLocaleString() 
        }
        setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u))
        message.success('更新成功')
      } else {
        const newUser: User = {
          id: Date.now().toString(),
          ...values,
          createTime: new Date().toLocaleString(),
          updateTime: new Date().toLocaleString(),
        }
        setUsers([...users, newUser])
        message.success('添加成功')
      }
      setUserModalVisible(false)
      userForm.resetFields()
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
    {
      key: 'users',
      label: '用户管理',
      children: (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <h2>用户列表</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
              新增用户
            </Button>
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
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
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
            rules={[{ required: true, message: '请选择资源' }]}
          >
            <Select placeholder="请选择资源">
              <Select.Option value="route">路由 (Route)</Select.Option>
              <Select.Option value="service">服务 (Service)</Select.Option>
              <Select.Option value="upstream">上游 (Upstream)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="action"
            label="操作"
            rules={[{ required: true, message: '请选择操作' }]}
          >
            <Select placeholder="请选择操作">
              <Select.Option value="read">查看 (Read)</Select.Option>
              <Select.Option value="create">创建 (Create)</Select.Option>
              <Select.Option value="update">更新 (Update)</Select.Option>
              <Select.Option value="delete">删除 (Delete)</Select.Option>
            </Select>
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

      {/* 用户编辑模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={userModalVisible}
        onCancel={() => {
          setUserModalVisible(false)
          userForm.resetFields()
        }}
        footer={null}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleSubmitUser}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              {roles.map((role) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
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