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

interface UserItem {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'inactive';
  roles: string[];
  create_time: number;
  update_time: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  // const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers: UserItem[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        status: 'active',
        roles: ['admin'],
        create_time: Date.now() / 1000,
        update_time: Date.now() / 1000,
      },
      {
        id: '2',
        username: 'user1',
        email: 'user1@example.com',
        status: 'active',
        roles: ['user'],
        create_time: Date.now() / 1000,
        update_time: Date.now() / 1000,
      },
    ];
    setUsers(mockUsers);
  }, []);

  const handleCreate = () => {
    // console.log('Create user');
  };

  const handleEdit = (_user: UserItem) => {
    // console.log('Edit user:', user);
  };

  const handleDelete = (id: string) => {
    // console.log('Delete user:', id);
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>用户管理</h2>
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
          + 新建用户
        </button>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>用户名</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>邮箱</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>状态</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>角色</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>创建时间</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px' }}>{user.id}</td>
                <td style={{ padding: '12px' }}>{user.username}</td>
                <td style={{ padding: '12px' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>
                  <span 
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: user.status === 'active' ? '#f6ffed' : '#fff2f0',
                      color: user.status === 'active' ? '#52c41a' : '#ff4d4f',
                      border: `1px solid ${user.status === 'active' ? '#b7eb8f' : '#ffccc7'}`
                    }}
                  >
                    {user.status === 'active' ? '激活' : '禁用'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {user.roles.map((role) => (
                    <span 
                      key={role}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: '#e6f7ff',
                        color: '#1890ff',
                        border: '1px solid #91d5ff',
                        marginRight: '4px'
                      }}
                    >
                      {role}
                    </span>
                  ))}
                </td>
                <td style={{ padding: '12px' }}>
                  {new Date(user.create_time * 1000).toLocaleString()}
                </td>
                <td style={{ padding: '12px' }}>
                  <button 
                    onClick={() => handleEdit(user)}
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
                       if (window.confirm('确定要删除这个用户吗？')) {
                         handleDelete(user.id);
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
        
        {users.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            暂无数据
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;