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
package role

import (
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
)

type Handler struct {
	roleStore       store.Interface
	permissionStore store.Interface
	auditStore      store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		roleStore:       store.GetStore(store.HubKeyRole),
		permissionStore: store.GetStore(store.HubKeyPermission),
		auditStore:      store.GetStore(store.HubKeyAuditLog),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	// Role management routes
	r.GET("/apisix/admin/roles/:id", wgin.Wraps(h.Get,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.GET("/apisix/admin/roles", wgin.Wraps(h.List,
		wrapper.InputType(reflect.TypeOf(ListInput{}))))
	r.POST("/apisix/admin/roles", wgin.Wraps(h.Create,
		wrapper.InputType(reflect.TypeOf(CreateInput{}))))
	r.PUT("/apisix/admin/roles/:id", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.DELETE("/apisix/admin/roles/:ids", wgin.Wraps(h.BatchDelete,
		wrapper.InputType(reflect.TypeOf(BatchDeleteInput{}))))

	// Permission management routes
	r.GET("/apisix/admin/permissions", wgin.Wraps(h.ListPermissions,
		wrapper.InputType(reflect.TypeOf(ListPermissionsInput{}))))
	r.POST("/apisix/admin/permissions", wgin.Wraps(h.CreatePermission,
		wrapper.InputType(reflect.TypeOf(CreatePermissionInput{}))))
	r.PUT("/apisix/admin/permissions/:id", wgin.Wraps(h.UpdatePermission,
		wrapper.InputType(reflect.TypeOf(UpdatePermissionInput{}))))
	r.DELETE("/apisix/admin/permissions/:ids", wgin.Wraps(h.BatchDeletePermissions,
		wrapper.InputType(reflect.TypeOf(BatchDeletePermissionsInput{}))))

	// Role-Permission assignment routes
	r.POST("/apisix/admin/roles/:id/permissions", wgin.Wraps(h.AssignPermissions,
		wrapper.InputType(reflect.TypeOf(AssignPermissionsInput{}))))
	r.GET("/apisix/admin/roles/:id/permissions", wgin.Wraps(h.GetRolePermissions,
		wrapper.InputType(reflect.TypeOf(GetRolePermissionsInput{}))))
}

// Role handlers
type GetInput struct {
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	r, err := h.roleStore.Get(c.Context(), input.ID)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return r, nil
}

type ListInput struct {
	Name   string `auto_read:"name,query"`
	Status *int   `auto_read:"status,query"`
	store.Pagination
}

func (h *Handler) List(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	ret, err := h.roleStore.List(c.Context(), store.ListInput{
		Predicate: func(obj interface{}) bool {
			role := obj.(*entity.Role)
			if input.Name != "" && !strings.Contains(role.Name, input.Name) {
				return false
			}
			if input.Status != nil && role.Status != *input.Status {
				return false
			}
			return true
		},
		PageSize:   input.PageSize,
		PageNumber: input.PageNumber,
	})

	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return ret, nil
}

type CreateInput struct {
	entity.Role
}

func (h *Handler) Create(c droplet.Context) (interface{}, error) {
	input := c.Input().(*CreateInput)

	// Check if role name already exists
	exists, err := h.checkRoleNameExists(c, input.Name, "")
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}
	if exists {
		return &handler.ErrorTransformMiddleware{}, fmt.Errorf("role name already exists")
	}

	// Set default values
	if input.Status == 0 {
		input.Status = 1 // active by default
	}

	if ret, err := h.roleStore.Create(c.Context(), &input.Role); err != nil {
		return handler.SpecCodeResponse(err), err
	} else {
		// Log audit
		h.logAudit(c, "create", "role", input.ID.(string), "Role created", "success", "")
		return ret, nil
	}
}

type UpdateInput struct {
	entity.Role
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) Update(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)

	// Check if role name already exists (excluding current role)
	if input.Name != "" {
		exists, err := h.checkRoleNameExists(c, input.Name, input.ID)
		if err != nil {
			return handler.SpecCodeResponse(err), err
		}
		if exists {
			return &handler.ErrorTransformMiddleware{}, fmt.Errorf("role name already exists")
		}
	}

	// Set ID for update
	input.Role.ID = input.ID

	if ret, err := h.roleStore.Update(c.Context(), &input.Role, true); err != nil {
		return handler.SpecCodeResponse(err), err
	} else {
		// Log audit
		h.logAudit(c, "update", "role", input.ID, "Role updated", "success", "")
		return ret, nil
	}
}

type BatchDeleteInput struct {
	IDs string `auto_read:"ids,path" validate:"required"`
}

func (h *Handler) BatchDelete(c droplet.Context) (interface{}, error) {
	input := c.Input().(*BatchDeleteInput)

	ids := strings.Split(input.IDs, ",")

	for _, id := range ids {
		if err := h.roleStore.BatchDelete(c.Context(), []string{id}); err != nil {
			// Log failed audit
			h.logAudit(c, "delete", "role", id, "Role deletion failed", "failed", err.Error())
			return handler.SpecCodeResponse(err), err
		}
		// Log successful audit
		h.logAudit(c, "delete", "role", id, "Role deleted", "success", "")
	}

	return nil, nil
}

// Permission handlers
type ListPermissionsInput struct {
	Resource string `auto_read:"resource,query"`
	Action   string `auto_read:"action,query"`
	store.Pagination
}

func (h *Handler) ListPermissions(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListPermissionsInput)

	ret, err := h.permissionStore.List(c.Context(), store.ListInput{
		Predicate: func(obj interface{}) bool {
			permission := obj.(*entity.Permission)
			if input.Resource != "" && !strings.Contains(permission.Resource, input.Resource) {
				return false
			}
			if input.Action != "" && !strings.Contains(permission.Action, input.Action) {
				return false
			}
			return true
		},
		PageSize:   input.PageSize,
		PageNumber: input.PageNumber,
	})

	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return ret, nil
}

type CreatePermissionInput struct {
	entity.Permission
}

func (h *Handler) CreatePermission(c droplet.Context) (interface{}, error) {
	input := c.Input().(*CreatePermissionInput)

	// Generate ID if not provided
	if input.ID == "" {
		input.ID = fmt.Sprintf("%s:%s:%s", input.Resource, input.Action, input.ResourceID)
	}

	// Set timestamps
	input.CreateTime = time.Now().Unix()
	input.UpdateTime = time.Now().Unix()

	if ret, err := h.permissionStore.Create(c.Context(), &input.Permission); err != nil {
		return handler.SpecCodeResponse(err), err
	} else {
		// Log audit
		h.logAudit(c, "create", "permission", input.ID, "Permission created", "success", "")
		return ret, nil
	}
}

type UpdatePermissionInput struct {
	entity.Permission
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) UpdatePermission(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdatePermissionInput)

	// Set ID and update time
	input.Permission.ID = input.ID
	input.UpdateTime = time.Now().Unix()

	if ret, err := h.permissionStore.Update(c.Context(), &input.Permission, true); err != nil {
		return handler.SpecCodeResponse(err), err
	} else {
		// Log audit
		h.logAudit(c, "update", "permission", input.ID, "Permission updated", "success", "")
		return ret, nil
	}
}

type BatchDeletePermissionsInput struct {
	IDs string `auto_read:"ids,path" validate:"required"`
}

func (h *Handler) BatchDeletePermissions(c droplet.Context) (interface{}, error) {
	input := c.Input().(*BatchDeletePermissionsInput)

	ids := strings.Split(input.IDs, ",")

	for _, id := range ids {
		if err := h.permissionStore.BatchDelete(c.Context(), []string{id}); err != nil {
			// Log failed audit
			h.logAudit(c, "delete", "permission", id, "Permission deletion failed", "failed", err.Error())
			return handler.SpecCodeResponse(err), err
		}
		// Log successful audit
		h.logAudit(c, "delete", "permission", id, "Permission deleted", "success", "")
	}

	return nil, nil
}

// Role-Permission assignment handlers
type AssignPermissionsInput struct {
	ID            string   `auto_read:"id,path" validate:"required"`
	PermissionIDs []string `json:"permission_ids" validate:"required"`
}

func (h *Handler) AssignPermissions(c droplet.Context) (interface{}, error) {
	input := c.Input().(*AssignPermissionsInput)

	// Get existing role
	existingRole, err := h.roleStore.Get(c.Context(), input.ID)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	role := existingRole.(*entity.Role)
	role.Permissions = input.PermissionIDs

	if ret, err := h.roleStore.Update(c.Context(), role, true); err != nil {
		return handler.SpecCodeResponse(err), err
	} else {
		// Log audit
		h.logAudit(c, "assign_permissions", "role", input.ID, "Permissions assigned to role", "success", "")
		return ret, nil
	}
}

type GetRolePermissionsInput struct {
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) GetRolePermissions(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetRolePermissionsInput)

	// Get role
	roleData, err := h.roleStore.Get(c.Context(), input.ID)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	role := roleData.(*entity.Role)

	// Get permission details
	var permissions []*entity.Permission
	for _, permissionID := range role.Permissions {
		permissionData, err := h.permissionStore.Get(c.Context(), permissionID)
		if err == nil {
			permissions = append(permissions, permissionData.(*entity.Permission))
		}
	}

	return map[string]interface{}{
		"role":        role,
		"permissions": permissions,
	}, nil
}

// Helper functions
func (h *Handler) checkRoleNameExists(ctx droplet.Context, name, excludeID string) (bool, error) {
	ret, err := h.roleStore.List(ctx.Context(), store.ListInput{
		Predicate: func(obj interface{}) bool {
			role := obj.(*entity.Role)
			if role.Name == name && role.ID != excludeID {
				return true
			}
			return false
		},
	})

	if err != nil {
		return false, err
	}

	return len(ret.Rows) > 0, nil
}

func (h *Handler) logAudit(c droplet.Context, action, resource, resourceID, details, status, errorMsg string) {
	// Get user info from context (this would be set by authentication middleware)
	userID := c.Get("user_id")
	username := c.Get("username")
	ipAddress := c.Get("ip_address")
	userAgent := c.Get("user_agent")

	auditLog := &entity.AuditLog{
		UserID:     userID.(string),
		Username:   username.(string),
		Action:     action,
		Resource:   resource,
		ResourceID: resourceID,
		Details:    map[string]interface{}{"description": details},
		IPAddress:  ipAddress.(string),
		UserAgent:  userAgent.(string),
		Status:     status,
		ErrorMsg:   errorMsg,
		Timestamp:  time.Now().Unix(),
	}

	// Log audit (ignore errors for now)
	h.auditStore.Create(c.Context(), auditLog)
}