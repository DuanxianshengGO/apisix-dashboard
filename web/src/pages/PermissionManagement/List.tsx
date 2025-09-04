/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useState, useEffect, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Space, Tag, Modal, Form, Input, Select, message, Popconfirm, Tabs } from 'antd';
const { TabPane } = Tabs;
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from 'umi';

interface PermissionItem {
  id: string;
  name: string;
  desc?: string;
  resource: string;
  action: string;
  create_time: number;
  update_time: number;
}

interface RoleItem {
  id: string;
  name: string;
  desc?: string;
  permissions: string[];
  create_time: number;
  update_time: number;
}

const PermissionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('permissions');
  const [createPermissionModalVisible, setCreatePermissionModalVisible] = useState(false);
  const [editPermissionModalVisible, setEditPermissionModalVisible] = useState(false);
  const [createRoleModalVisible, setCreateRoleModalVisible] = useState(false);
  const [editRoleModalVisible, setEditRoleModalVisible] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<PermissionItem | null>(null);
  const [currentRole, setCurrentRole] = useState<RoleItem | null>(null);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [permissionForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const permissionActionRef = useRef<ActionType>();
  const roleActionRef = useRef<ActionType>();

  // 获取权限列表
  const fetchPermissions = async (params: any) => {
    try {
      const response = await request('/apisix/admin/permissions', {
        method: 'GET',
        params: {
          page: params.current,
          page_size: params.pageSize,
          name: params.name,
        },
      });
      
      if (response.code === 0) {
        const permissionList = response.data?.list || [];
        setPermissions(permissionList);
        return {
          data: permissionList,
          success: true,
          total: response.data?.total || 0,
        };
      }
      return {
        data: [],
        success: false,
        total: 0,
      };
    } catch (error) {
      console.error('获取权限列表失败:', error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 获取角色列表
  const fetchRoles = async (params: any) => {
    try {
      const response = await request('/apisix/admin/roles', {
        method: 'GET',
        params: {
          page: params.current,
          page_size: params.pageSize,
          name: params.name,
        },
      });
      
      if (response.code === 0) {
        return {
          data: response.data?.list || [],
          success: true,
          total: response.data?.total || 0,
        };
      }
      return {
        data: [],
        success: false,
        total: 0,
      };
    } catch (error) {
      console.error('获取角色列表失败:', error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 创建权限
  const handleCreatePermission = async (values: any) => {
    try {
      const response = await request('/apisix/admin/permissions', {
        method: 'POST',
        data: {
          name: values.name,
          desc: values.desc,
          resource: values.resource,
          action: values.action,
        },
      });
      
      if (response.code === 0) {
        message.success('权限创建成功');
        setCreatePermissionModalVisible(false);
        permissionForm.resetFields();
        permissionActionRef.current?.reload();
      } else {
        message.error(response.message || '权限创建失败');
      }
    } catch (error) {
      message.error('权限创建失败');
    }
  };

  // 更新权限
  const handleUpdatePermission = async (values: any) => {
    if (!currentPermission) return;
    
    try {
      const response = await request(`/apisix/admin/permissions/${currentPermission.id}`, {
        method: 'PUT',
        data: {
          name: values.name,
          desc: values.desc,
          resource: values.resource,
          action: values.action,
        },
      });
      
      if (response.code === 0) {
        message.success('权限更新成功');
        setEditPermissionModalVisible(false);
        setCurrentPermission(null);
        permissionForm.resetFields();
        permissionActionRef.current?.reload();
      } else {
        message.error(response.message || '权限更新失败');
      }
    } catch (error) {
      message.error('权限更新失败');
    }
  };

  // 删除权限
  const handleDeletePermission = async (id: string) => {
    try {
      const response = await request(`/apisix/admin/permissions/${id}`, {
        method: 'DELETE',
      });
      
      if (response.code === 0) {
        message.success('权限删除成功');
        permissionActionRef.current?.reload();
      } else {
        message.error(response.message || '权限删除失败');
      }
    } catch (error) {
      message.error('权限删除失败');
    }
  };

  // 创建角色
  const handleCreateRole = async (values: any) => {
    try {
      const response = await request('/apisix/admin/roles', {
        method: 'POST',
        data: {
          name: values.name,
          desc: values.desc,
          permissions: values.permissions || [],
        },
      });
      
      if (response.code === 0) {
        message.success('角色创建成功');
        setCreateRoleModalVisible(false);
        roleForm.resetFields();
        roleActionRef.current?.reload();
      } else {
        message.error(response.message || '角色创建失败');
      }
    } catch (error) {
      message.error('角色创建失败');
    }
  };

  // 更新角色
  const handleUpdateRole = async (values: any) => {
    if (!currentRole) return;
    
    try {
      const response = await request(`/apisix/admin/roles/${currentRole.id}`, {
        method: 'PUT',
        data: {
          name: values.name,
          desc: values.desc,
          permissions: values.permissions || [],
        },
      });
      
      if (response.code === 0) {
        message.success('角色更新成功');
        setEditRoleModalVisible(false);
        setCurrentRole(null);
        roleForm.resetFields();
        roleActionRef.current?.reload();
      } else {
        message.error(response.message || '角色更新失败');
      }
    } catch (error) {
      message.error('角色更新失败');
    }
  };

  // 删除角色
  const handleDeleteRole = async (id: string) => {
    try {
      const response = await request(`/apisix/admin/roles/${id}`, {
        method: 'DELETE',
      });
      
      if (response.code === 0) {
        message.success('角色删除成功');
        roleActionRef.current?.reload();
      } else {
        message.error(response.message || '角色删除失败');
      }
    } catch (error) {
      message.error('角色删除失败');
    }
  };

  // 打开编辑权限模态框
  const handleEditPermission = (permission: PermissionItem) => {
    setCurrentPermission(permission);
    permissionForm.setFieldsValue({
      name: permission.name,
      desc: permission.desc,
      resource: permission.resource,
      action: permission.action,
    });
    setEditPermissionModalVisible(true);
  };

  // 打开编辑角色模态框
  const handleEditRole = (role: RoleItem) => {
    setCurrentRole(role);
    roleForm.setFieldsValue({
      name: role.name,
      desc: role.desc,
      permissions: role.permissions,
    });
    setEditRoleModalVisible(true);
  };

  const permissionColumns: ProColumns<PermissionItem>[] = [
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '资源',
      dataIndex: 'resource',
      key: 'resource',
      width: 120,
      hideInSearch: true,
      render: (_, record) => (
        <Tag color="blue">{record.resource}</Tag>
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      hideInSearch: true,
      render: (_, record) => (
        <Tag color="green">{record.action}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 180,
      hideInSearch: true,
      render: (_, record) => new Date(record.create_time * 1000).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action_buttons',
      width: 150,
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
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
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const roleColumns: ProColumns<RoleItem>[] = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 300,
      hideInSearch: true,
      render: (_, record) => (
        <Space wrap>
          {record.permissions?.map((permissionId) => {
            const permission = permissions.find(p => p.id === permissionId);
            return (
              <Tag key={permissionId} color="blue">
                {permission?.name || permissionId}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 180,
      hideInSearch: true,
      render: (_, record) => new Date(record.create_time * 1000).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action_buttons',
      width: 150,
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
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
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const resourceOptions = [
    { label: '路由', value: 'route' },
    { label: '上游', value: 'upstream' },
    { label: '服务', value: 'service' },
    { label: '消费者', value: 'consumer' },
    { label: 'SSL证书', value: 'ssl' },
    { label: '插件', value: 'plugin' },
    { label: '用户', value: 'user' },
    { label: '角色', value: 'role' },
    { label: '审计日志', value: 'audit' },
  ];

  const actionOptions = [
    { label: '读取', value: 'read' },
    { label: '写入', value: 'write' },
    { label: '删除', value: 'delete' },
    { label: '管理', value: 'manage' },
  ];

  return (
    <PageContainer>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
      >
        <TabPane tab="权限管理" key="permissions">
          <ProTable<PermissionItem>
            headerTitle="权限管理"
            actionRef={permissionActionRef}
            rowKey="id"
            search={{
              labelWidth: 'auto',
            }}
            toolBarRender={() => [
              <Button
                key="create"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreatePermissionModalVisible(true)}
              >
                新建权限
              </Button>,
            ]}
            request={fetchPermissions}
            columns={permissionColumns}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
            }}
          />
        </TabPane>
        <TabPane tab="角色管理" key="roles">
          <ProTable<RoleItem>
            headerTitle="角色管理"
            actionRef={roleActionRef}
            rowKey="id"
            search={{
              labelWidth: 'auto',
            }}
            toolBarRender={() => [
              <Button
                key="create"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateRoleModalVisible(true)}
              >
                新建角色
              </Button>,
            ]}
            request={fetchRoles}
            columns={roleColumns}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
            }}
          />
        </TabPane>
      </Tabs>

      {/* 创建权限模态框 */}
      <Modal
        title="创建权限"
        visible={createPermissionModalVisible}
        onCancel={() => {
          setCreatePermissionModalVisible(false);
          permissionForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={permissionForm}
          layout="vertical"
          onFinish={handleCreatePermission}
        >
          <Form.Item
            name="name"
            label="权限名称"
            rules={[
              { required: true, message: '请输入权限名称' },
              { min: 2, max: 50, message: '权限名称长度为2-50个字符' },
            ]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>
          
          <Form.Item
            name="desc"
            label="描述"
          >
            <Input.TextArea placeholder="请输入权限描述" rows={3} />
          </Form.Item>
          
          <Form.Item
            name="resource"
            label="资源"
            rules={[
              { required: true, message: '请选择资源' },
            ]}
          >
            <Select placeholder="请选择资源" options={resourceOptions} />
          </Form.Item>
          
          <Form.Item
            name="action"
            label="操作"
            rules={[
              { required: true, message: '请选择操作' },
            ]}
          >
            <Select placeholder="请选择操作" options={actionOptions} />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
              <Button onClick={() => {
                setCreatePermissionModalVisible(false);
                permissionForm.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑权限模态框 */}
      <Modal
        title="编辑权限"
        visible={editPermissionModalVisible}
        onCancel={() => {
          setEditPermissionModalVisible(false);
          setCurrentPermission(null);
          permissionForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={permissionForm}
          layout="vertical"
          onFinish={handleUpdatePermission}
        >
          <Form.Item
            name="name"
            label="权限名称"
            rules={[
              { required: true, message: '请输入权限名称' },
              { min: 2, max: 50, message: '权限名称长度为2-50个字符' },
            ]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>
          
          <Form.Item
            name="desc"
            label="描述"
          >
            <Input.TextArea placeholder="请输入权限描述" rows={3} />
          </Form.Item>
          
          <Form.Item
            name="resource"
            label="资源"
            rules={[
              { required: true, message: '请选择资源' },
            ]}
          >
            <Select placeholder="请选择资源" options={resourceOptions} />
          </Form.Item>
          
          <Form.Item
            name="action"
            label="操作"
            rules={[
              { required: true, message: '请选择操作' },
            ]}
          >
            <Select placeholder="请选择操作" options={actionOptions} />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                更新
              </Button>
              <Button onClick={() => {
                setEditPermissionModalVisible(false);
                setCurrentPermission(null);
                permissionForm.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建角色模态框 */}
      <Modal
        title="创建角色"
        visible={createRoleModalVisible}
        onCancel={() => {
          setCreateRoleModalVisible(false);
          roleForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleCreateRole}
        >
          <Form.Item
            name="name"
            label="角色名称"
            rules={[
              { required: true, message: '请输入角色名称' },
              { min: 2, max: 50, message: '角色名称长度为2-50个字符' },
            ]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          
          <Form.Item
            name="desc"
            label="描述"
          >
            <Input.TextArea placeholder="请输入角色描述" rows={3} />
          </Form.Item>
          
          <Form.Item
            name="permissions"
            label="权限"
          >
            <Select
              mode="multiple"
              placeholder="请选择权限"
              options={permissions.map(permission => ({
                label: `${permission.name} (${permission.resource}:${permission.action})`,
                value: permission.id,
              }))}
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
              <Button onClick={() => {
                setCreateRoleModalVisible(false);
                roleForm.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑角色模态框 */}
      <Modal
        title="编辑角色"
        visible={editRoleModalVisible}
        onCancel={() => {
          setEditRoleModalVisible(false);
          setCurrentRole(null);
          roleForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleUpdateRole}
        >
          <Form.Item
            name="name"
            label="角色名称"
            rules={[
              { required: true, message: '请输入角色名称' },
              { min: 2, max: 50, message: '角色名称长度为2-50个字符' },
            ]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          
          <Form.Item
            name="desc"
            label="描述"
          >
            <Input.TextArea placeholder="请输入角色描述" rows={3} />
          </Form.Item>
          
          <Form.Item
            name="permissions"
            label="权限"
          >
            <Select
              mode="multiple"
              placeholder="请选择权限"
              options={permissions.map(permission => ({
                label: `${permission.name} (${permission.resource}:${permission.action})`,
                value: permission.id,
              }))}
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                更新
              </Button>
              <Button onClick={() => {
                setEditRoleModalVisible(false);
                setCurrentRole(null);
                roleForm.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default PermissionManagement;