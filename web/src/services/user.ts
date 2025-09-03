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
import logo from '@/assets/logo.svg';
import { request } from 'umi';

export interface UserItem {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'inactive';
  roles: string[];
  create_time: number;
  update_time: number;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  username?: string;
  email?: string;
  status?: string;
}

export interface UserCreateParams {
  username: string;
  email: string;
  password: string;
  status: 'active' | 'inactive';
  roles: string[];
}

export interface UserUpdateParams {
  email?: string;
  status?: 'active' | 'inactive';
  roles?: string[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ListResponse<T> {
  rows: T[];
  total_size: number;
}

export async function queryCurrent(): Promise<API.CurrentUser> {
  return Promise.resolve({
    name: 'APISIX User',
    avatar: logo,
    userid: '00000001',
    access: 'admin',
  });
}

// 获取用户列表
export const fetchUserList = (params: UserListParams): Promise<ApiResponse<ListResponse<UserItem>>> => {
  return request('/apisix/admin/users', {
    method: 'GET',
    params,
  });
};

// 获取单个用户
export const fetchUser = (id: string): Promise<ApiResponse<UserItem>> => {
  return request(`/apisix/admin/users/${id}`, {
    method: 'GET',
  });
};

// 创建用户
export const createUser = (data: UserCreateParams): Promise<ApiResponse<UserItem>> => {
  return request('/apisix/admin/users', {
    method: 'POST',
    data,
  });
};

// 更新用户
export const updateUser = (id: string, data: UserUpdateParams): Promise<ApiResponse<UserItem>> => {
  return request(`/apisix/admin/users/${id}`, {
    method: 'PUT',
    data,
  });
};

// 删除用户
export const deleteUser = (id: string): Promise<ApiResponse<null>> => {
  return request(`/apisix/admin/users/${id}`, {
    method: 'DELETE',
  });
};

// 批量删除用户
export const batchDeleteUsers = (ids: string[]): Promise<ApiResponse<null>> => {
  return request('/apisix/admin/users', {
    method: 'DELETE',
    data: { ids },
  });
};

// 重置用户密码
export const resetUserPassword = (id: string, password: string): Promise<ApiResponse<null>> => {
  return request(`/apisix/admin/users/${id}/password`, {
    method: 'PUT',
    data: { password },
  });
};
