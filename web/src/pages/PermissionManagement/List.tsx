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
import React, { useState, useEffect } from 'react';

interface PermissionItem {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  create_time: number;
  update_time: number;
}

const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  // const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockPermissions: PermissionItem[] = [
      {
        id: '1',
        name: '路由管理',
        resource: 'route',
        action: 'read',
        description: '查看路由信息',
        create_time: Date.now() / 1000,
        update_time: Date.now() / 1000,
      },
      {
        id: '2',
        name: '路由创建',
        resource: 'route',
        action: 'create',
        description: '创建新路由',
        create_time: Date.now() / 1000,
        update_time: Date.now() / 1000,
      },
      {
        id: '3',
        name: '服务管理',
        resource: 'service',
        action: 'read',
        description: '查看服务信息',
        create_time: Date.now() / 1000,
        update_time: Date.now() / 1000,
      },
      {
        id: '4',
        name: '上游管理',
        resource: 'upstream',
        action: 'read',
        description: '查看上游信息',
        create_time: Date.now() / 1000,
        update_time: Date.now() / 1000,
      },
    ];
    setPermissions(mockPermissions);
  }, []);

  const handleCreate = () => {
    // console.log('Create permission');
  };

  const handleEdit = (_permission: PermissionItem) => {
    // console.log('Edit permission:', permission);
  };

  const handleDelete = (id: string) => {
    // console.log('Delete permission:', id);
    setPermissions(permissions.filter(permission => permission.id !== id));
  };

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      read: '#52c41a',
      create: '#1890ff',
      update: '#faad14',
      delete: '#ff4d4f',
    };
    return colors[action] || '#666';
  };

  const getResourceColor = (resource: string) => {
    const colors: { [key: string]: string } = {
      route: '#722ed1',
      service: '#13c2c2',
      upstream: '#eb2f96',
      consumer: '#52c41a',
    };
    return colors[resource] || '#666';
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>权限管理</h2>
        <button 
          onClick={handleCreate}
          style={{
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + 新建权限
        </button>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>权限名称</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>资源</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>操作</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>描述</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>创建时间</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px' }}>{permission.id}</td>
                <td style={{ padding: '12px' }}>{permission.name}</td>
                <td style={{ padding: '12px' }}>
                  <span 
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: `${getResourceColor(permission.resource)}20`,
                      color: getResourceColor(permission.resource),
                      border: `1px solid ${getResourceColor(permission.resource)}40`
                    }}
                  >
                    {permission.resource}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span 
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: `${getActionColor(permission.action)}20`,
                      color: getActionColor(permission.action),
                      border: `1px solid ${getActionColor(permission.action)}40`
                    }}
                  >
                    {permission.action}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{permission.description || '-'}</td>
                <td style={{ padding: '12px' }}>
                  {new Date(permission.create_time * 1000).toLocaleString()}
                </td>
                <td style={{ padding: '12px' }}>
                  <button 
                    onClick={() => handleEdit(permission)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#1890ff',
                      border: 'none',
                      cursor: 'pointer',
                      marginRight: '8px'
                    }}
                  >
                    编辑
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('确定要删除这个权限吗？')) {
                        handleDelete(permission.id);
                      }
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#ff4d4f',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {permissions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            暂无数据
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionManagement;