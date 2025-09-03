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

interface AuditLogItem {
  id: string;
  user_id: string;
  username: string;
  action: string;
  resource: string;
  resource_id?: string;
  ip_address: string;
  user_agent: string;
  status: string;
  error_message?: string;
  request_body?: string;
  create_time: number;
}

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  // const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    username: '',
    action: '',
    resource: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockLogs: AuditLogItem[] = [
      {
        id: '1',
        user_id: '1',
        username: 'admin',
        action: 'CREATE',
        resource: 'route',
        resource_id: 'route-123',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'SUCCESS',
        request_body: '{"name":"test-route","uri":"/test"}',
        create_time: Date.now() / 1000 - 3600,
      },
      {
        id: '2',
        user_id: '2',
        username: 'user1',
        action: 'UPDATE',
        resource: 'service',
        resource_id: 'service-456',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: 'SUCCESS',
        request_body: '{"name":"updated-service"}',
        create_time: Date.now() / 1000 - 7200,
      },
      {
        id: '3',
        user_id: '1',
        username: 'admin',
        action: 'DELETE',
        resource: 'upstream',
        resource_id: 'upstream-789',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'FAILURE',
        error_message: 'Upstream is being used by routes',
        create_time: Date.now() / 1000 - 10800,
      },
      {
        id: '4',
        user_id: '3',
        username: 'user2',
        action: 'READ',
        resource: 'consumer',
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Linux; Android 10)',
        status: 'SUCCESS',
        create_time: Date.now() / 1000 - 14400,
      },
    ];
    setLogs(mockLogs);
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // Here you would typically call an API with the filters
  };

  const handleReset = () => {
    setFilters({
      username: '',
      action: '',
      resource: '',
      status: '',
      startDate: '',
      endDate: ''
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'SUCCESS' ? '#52c41a' : '#ff4d4f';
  };

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      CREATE: '#1890ff',
      UPDATE: '#faad14',
      DELETE: '#ff4d4f',
      READ: '#52c41a',
    };
    return colors[action] || '#666';
  };

  const filteredLogs = logs.filter(log => {
    return (
      (!filters.username || log.username.includes(filters.username)) &&
      (!filters.action || log.action === filters.action) &&
      (!filters.resource || log.resource === filters.resource) &&
      (!filters.status || log.status === filters.status)
    );
  });

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2>审计日志</h2>
      </div>
      
      {/* Filter Section */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '16px', 
        marginBottom: '16px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>用户名</label>
            <input
              type="text"
              value={filters.username}
              onChange={(e) => handleFilterChange('username', e.target.value)}
              placeholder="请输入用户名"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>操作类型</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">全部</option>
              <option value="CREATE">创建</option>
              <option value="UPDATE">更新</option>
              <option value="DELETE">删除</option>
              <option value="read">查看</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>资源类型</label>
            <select
              value={filters.resource}
              onChange={(e) => handleFilterChange('resource', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">全部</option>
              <option value="route">路由</option>
              <option value="service">服务</option>
              <option value="upstream">上游</option>
              <option value="consumer">消费者</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>状态</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">全部</option>
              <option value="SUCCESS">成功</option>
              <option value="FAILURE">失败</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleSearch}
            style={{
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            搜索
          </button>
          <button 
            onClick={handleReset}
            style={{
              backgroundColor: '#f5f5f5',
              color: '#666',
              border: '1px solid #d9d9d9',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            重置
          </button>
        </div>
      </div>
      
      {/* Table Section */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ padding: '12px', textAlign: 'left', minWidth: '80px' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', minWidth: '100px' }}>用户名</th>
                <th style={{ padding: '12px', textAlign: 'left', minWidth: '80px' }}>操作</th>
                <th style={{ padding: '12px', textAlign: 'left', minWidth: '80px' }}>资源</th>
                <th style={{ padding: '12px', textAlign: 'left', minWidth: '120px' }}>资源ID</th>
                <th style={{ padding: '12px', textAlign: 'left', minWidth: '120px' }}>IP地址</th>
                <th style={{ padding: '12px', textAlign: 'left', minWidth: '80px' }}>状态</th>
                <th style={{ padding: '12px', textAlign: 'left', minWidth: '150px' }}>时间</th>
                <th style={{ padding: '12px', textAlign: 'left', minWidth: '80px' }}>详情</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px' }}>{log.id}</td>
                  <td style={{ padding: '12px' }}>{log.username}</td>
                  <td style={{ padding: '12px' }}>
                    <span 
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: `${getActionColor(log.action)}20`,
                        color: getActionColor(log.action),
                        border: `1px solid ${getActionColor(log.action)}40`
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{log.resource}</td>
                  <td style={{ padding: '12px' }}>{log.resource_id || '-'}</td>
                  <td style={{ padding: '12px' }}>{log.ip_address}</td>
                  <td style={{ padding: '12px' }}>
                    <span 
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: `${getStatusColor(log.status)}20`,
                        color: getStatusColor(log.status),
                        border: `1px solid ${getStatusColor(log.status)}40`
                      }}
                    >
                      {log.status === 'SUCCESS' ? '成功' : '失败'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {new Date(log.create_time * 1000).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => {
                        const details = [
                          `用户代理: ${log.user_agent}`,
                          log.request_body ? `请求体: ${log.request_body}` : '',
                          log.error_message ? `错误信息: ${log.error_message}` : ''
                        ].filter(Boolean).join('\n\n');
                        window.alert(details);
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#1890ff',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            暂无数据
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;