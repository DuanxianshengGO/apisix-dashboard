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
import { request } from 'umi';

export interface RoleItem {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  create_time: number;
  update_time: number;
}

export interface RoleListParams {
  page?: number;
  pageSize?: number;
  name?: string;
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

// 获取角色列表
export const fetchRoleList = (params?: RoleListParams): Promise<ApiResponse<ListResponse<RoleItem>>> => {
  return request('/apisix/admin/roles', {
    method: 'GET',
    params,
  });
};

// 获取单个角色
export const fetchRole = (id: string): Promise<ApiResponse<RoleItem>> => {
  return request(`/apisix/admin/roles/${id}`, {
    method: 'GET',
  });
};

// 创建角色
export const createRole = (data: Partial<RoleItem>): Promise<ApiResponse<RoleItem>> => {
  return request('/apisix/admin/roles', {
    method: 'POST',
    data,
  });
};

// 更新角色
export const updateRole = (id: string, data: Partial<RoleItem>): Promise<ApiResponse<RoleItem>> => {
  return request(`/apisix/admin/roles/${id}`, {
    method: 'PUT',
    data,
  });
};

// 删除角色
export const deleteRole = (id: string): Promise<ApiResponse<null>> => {
  return request(`/apisix/admin/roles/${id}`, {
    method: 'DELETE',
  });
};