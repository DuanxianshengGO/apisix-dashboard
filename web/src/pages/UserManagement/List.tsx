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
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Space, Tag, Modal, Form, Input, Select, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from 'umi';

interface UserItem {
  id: string;
  username: string;
  email?: string;
  status: number;
  roles: string[];
  create_time: number;
  update_time: number;
}

interface Role {
  id: string;
  name: string;
  desc?: string;
}

const UserManagement: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      const response = await request('/apisix/admin/roles', {
        method: 'GET',
      });
      if (response.code === 0) {
        setRoles(response.data || []);
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // 获取用户列表
  const fetchUsers = async (params: any) => {
    try {
      const response = await request('/apisix/admin/users', {
        method: 'GET',
        params: {
          page: params.current,
          page_size: params.pageSize,
          username: params.username,
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
      console.error('获取用户列表失败:', error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 创建用户
  const handleCreate = async (values: any) => {
    try {
      const response = await request('/apisix/admin/users', {
        method: 'POST',
        data: {
          username: values.username,
          password: values.password,
          email: values.email,
          status: values.status ? 1 : 0,
          roles: values.roles || [],
        },
      });

      if (response.code === 0) {
        message.success('用户创建成功');
        setCreateModalVisible(false);
        form.resetFields();
        actionRef.current?.reload();
      } else {
        message.error(response.message || '用户创建失败');
      }
    } catch (error) {
      message.error('用户创建失败');
    }
  };

  // 更新用户
  const handleUpdate = async (values: any) => {
    if (!currentUser) return;

    try {
      const response = await request(`/apisix/admin/users/${currentUser.id}`, {
        method: 'PUT',
        data: {
          username: values.username,
          email: values.email,
          status: values.status ? 1 : 0,
          roles: values.roles || [],
          ...(values.password && { password: values.password }),
        },
      });

      if (response.code === 0) {
        message.success('用户更新成功');
        setEditModalVisible(false);
        setCurrentUser(null);
        form.resetFields();
        actionRef.current?.reload();
      } else {
        message.error(response.message || '用户更新失败');
      }
    } catch (error) {
      message.error('用户更新失败');
    }
  };

  // 删除用户
  const handleDelete = async (id: string) => {
    try {
      const response = await request(`/apisix/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (response.code === 0) {
        message.success('用户删除成功');
        actionRef.current?.reload();
      } else {
        message.error(response.message || '用户删除失败');
      }
    } catch (error) {
      message.error('用户删除失败');
    }
  };

  // 打开编辑模态框
  const handleEdit = (user: UserItem) => {
    setCurrentUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      status: user.status === 1,
      roles: user.roles,
    });
    setEditModalVisible(true);
  };

  const columns: ProColumns<UserItem>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      hideInSearch: true,
      render: (_, record) => (
        <Tag color={record.status === 1 ? 'green' : 'red'}>
          {record.status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: 200,
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          {record.roles?.map((role) => (
            <Tag key={role} color="blue">
              {roles.find((r) => r.id === role)?.name || role}
            </Tag>
          ))}
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
      key: 'action',
      width: 150,
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<UserItem>
        headerTitle="用户管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建用户
          </Button>,
        ]}
        request={fetchUsers}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />

      {/* 创建用户模态框 */}
      <Modal
        title="创建用户"
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 50, message: '用户名长度为3-50个字符' },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item name="roles" label="角色">
            <Select
              mode="multiple"
              placeholder="请选择角色"
              options={roles.map((role) => ({
                label: role.name,
                value: role.id,
              }))}
            />
          </Form.Item>

          <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
              <Button
                onClick={() => {
                  setCreateModalVisible(false);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setCurrentUser(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 50, message: '用户名长度为3-50个字符' },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码（留空则不修改）"
            rules={[{ min: 6, message: '密码至少6个字符' }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item name="roles" label="角色">
            <Select
              mode="multiple"
              placeholder="请选择角色"
              options={roles.map((role) => ({
                label: role.name,
                value: role.id,
              }))}
            />
          </Form.Item>

          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                更新
              </Button>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  setCurrentUser(null);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default UserManagement;
