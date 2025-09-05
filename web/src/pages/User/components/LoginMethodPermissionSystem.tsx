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
import React from 'react';
import { Form, Input, Tooltip } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { UserOutlined, LockTwoTone } from '@ant-design/icons';
import { request } from 'umi';

import type { UserModule } from '@/pages/User/typing';

const formRef = React.createRef<FormInstance>();

const LoginMethodPermissionSystem: UserModule.LoginMethod = {
  id: 'permission-system',
  name: '权限系统登录',
  render: () => {
    return (
      <Form ref={formRef} name="permission-system-form">
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: '请输入用户名！',
            },
          ]}
        >
          <Input
            size="large"
            type="text"
            placeholder="用户名"
            prefix={
              <UserOutlined
                style={{
                  color: '#1890ff',
                }}
              />
            }
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: '请输入密码！',
            },
          ]}
        >
          <Input size="large" type="password" placeholder="密码" prefix={<LockTwoTone />} />
        </Form.Item>
        <Form.Item>
          <Tooltip title="通过权限管理系统创建的用户账号">
            <span style={{ color: '#666', fontSize: '12px' }}>使用权限系统账号登录</span>
          </Tooltip>
        </Form.Item>
      </Form>
    );
  },
  getData(): UserModule.LoginData {
    if (formRef.current) {
      const data = formRef.current.getFieldsValue();
      return {
        username: data.username,
        password: data.password,
      };
    }
    return {};
  },
  checkData: async () => {
    if (formRef.current) {
      try {
        await formRef.current.validateFields();
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  },
  submit: async ({ username, password }) => {
    if (username !== '' && password !== '') {
      try {
        // 调用权限系统的登录API
        const result = await request('/api/permission/login', {
          method: 'POST',
          requestType: 'json',
          data: {
            username,
            password,
          },
        });

        if (result.success) {
          // 存储用户信息和token
          localStorage.setItem('permission_token', result.data.token || 'permission_user');
          localStorage.setItem('permission_user', JSON.stringify(result.data.user));

          return {
            status: true,
            message: '登录成功',
            data: result.data,
          };
        }
        return {
          status: false,
          message: result.message || '登录失败',
          data: [],
        };
      } catch (e) {
        return {
          status: false,
          message: '网络错误，请稍后重试',
          data: [],
        };
      }
    } else {
      return {
        status: false,
        message: '请检查用户名和密码',
        data: [],
      };
    }
  },
  logout: () => {
    localStorage.removeItem('permission_token');
    localStorage.removeItem('permission_user');
  },
};

export default LoginMethodPermissionSystem;
