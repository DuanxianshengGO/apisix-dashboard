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
package entity

import (
	"golang.org/x/crypto/bcrypt"
)

// User represents a system user
type User struct {
	BaseInfo
	Username    string   `json:"username" validate:"required,min=3,max=50"`
	Password    string   `json:"password,omitempty" validate:"required,min=6"`
	Email       string   `json:"email" validate:"email"`
	Phone       string   `json:"phone,omitempty"`
	RealName    string   `json:"real_name,omitempty" validate:"max=100"`
	Status      int      `json:"status"` // 1: active, 0: inactive
	RoleIDs     []string `json:"role_ids,omitempty"`
	LastLoginAt int64    `json:"last_login_at,omitempty"`
	Desc        string   `json:"desc,omitempty" validate:"max=256"`
}

// Role represents a user role
type Role struct {
	BaseInfo
	Name        string   `json:"name" validate:"required,min=2,max=50"`
	Desc        string   `json:"desc,omitempty" validate:"max=256"`
	Permissions []string `json:"permissions,omitempty"`
	Status      int      `json:"status"` // 1: active, 0: inactive
}

// Permission represents a system permission
type Permission struct {
	ID          string `json:"id"`
	Name        string `json:"name" validate:"required,min=2,max=50"`
	Resource    string `json:"resource" validate:"required"` // route, service, upstream, consumer, ssl, plugin, etc.
	Action      string `json:"action" validate:"required"`   // create, read, update, delete, list
	ResourceID  string `json:"resource_id,omitempty"`       // specific resource ID for fine-grained control
	Desc        string `json:"desc,omitempty" validate:"max=256"`
	CreateTime  int64  `json:"create_time,omitempty"`
	UpdateTime  int64  `json:"update_time,omitempty"`
}

// UserRole represents the many-to-many relationship between users and roles
type UserRole struct {
	UserID     string `json:"user_id"`
	RoleID     string `json:"role_id"`
	CreateTime int64  `json:"create_time,omitempty"`
}

// RolePermission represents the many-to-many relationship between roles and permissions
type RolePermission struct {
	RoleID       string `json:"role_id"`
	PermissionID string `json:"permission_id"`
	CreateTime   int64  `json:"create_time,omitempty"`
}

// AuditLog represents audit log entries
type AuditLog struct {
	BaseInfo
	UserID      string                 `json:"user_id"`
	Username    string                 `json:"username"`
	Action      string                 `json:"action"`      // create, update, delete, login, logout
	Resource    string                 `json:"resource"`    // route, service, upstream, user, etc.
	ResourceID  string                 `json:"resource_id"` // specific resource ID
	Details     map[string]interface{} `json:"details,omitempty"`
	IPAddress   string                 `json:"ip_address"`
	UserAgent   string                 `json:"user_agent,omitempty"`
	Status      string                 `json:"status"` // success, failed
	ErrorMsg    string                 `json:"error_msg,omitempty"`
	Timestamp   int64                  `json:"timestamp"`
}

// AuditConfig represents audit configuration
type AuditConfig struct {
	RetentionDays int  `json:"retention_days" validate:"min=1,max=365"` // 审计日志保留天数
	Enabled       bool `json:"enabled"`                                 // 是否启用审计
}

// HashPassword hashes the user password
func (u *User) HashPassword() error {
	if u.Password == "" {
		return nil
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashed)
	return nil
}

// CheckPassword checks if the provided password matches the user's password
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// GetUserResponse represents user response without sensitive data
type GetUserResponse struct {
	BaseInfo
	Username    string   `json:"username"`
	Email       string   `json:"email"`
	Phone       string   `json:"phone,omitempty"`
	RealName    string   `json:"real_name,omitempty"`
	Status      int      `json:"status"`
	RoleIDs     []string `json:"role_ids,omitempty"`
	LastLoginAt int64    `json:"last_login_at,omitempty"`
	Desc        string   `json:"desc,omitempty"`
}

// ToResponse converts User to GetUserResponse
func (u *User) ToResponse() *GetUserResponse {
	return &GetUserResponse{
		BaseInfo:    u.BaseInfo,
		Username:    u.Username,
		Email:       u.Email,
		Phone:       u.Phone,
		RealName:    u.RealName,
		Status:      u.Status,
		RoleIDs:     u.RoleIDs,
		LastLoginAt: u.LastLoginAt,
		Desc:        u.Desc,
	}
}