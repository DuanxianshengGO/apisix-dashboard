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
package user

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
	userStore store.Interface
	roleStore store.Interface
	auditStore store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		userStore:  store.GetStore(store.HubKeyUser),
		roleStore:  store.GetStore(store.HubKeyRole),
		auditStore: store.GetStore(store.HubKeyAuditLog),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	// User management routes
	r.GET("/apisix/admin/users/:id", wgin.Wraps(h.Get,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.GET("/apisix/admin/users", wgin.Wraps(h.List,
		wrapper.InputType(reflect.TypeOf(ListInput{}))))
	r.POST("/apisix/admin/users", wgin.Wraps(h.Create,
		wrapper.InputType(reflect.TypeOf(CreateInput{}))))
	r.PUT("/apisix/admin/users/:id", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.DELETE("/apisix/admin/users/:ids", wgin.Wraps(h.BatchDelete,
		wrapper.InputType(reflect.TypeOf(BatchDeleteInput{}))))
	r.POST("/apisix/admin/users/:id/change-password", wgin.Wraps(h.ChangePassword,
		wrapper.InputType(reflect.TypeOf(ChangePasswordInput{}))))
	r.POST("/apisix/admin/users/:id/reset-password", wgin.Wraps(h.ResetPassword,
		wrapper.InputType(reflect.TypeOf(ResetPasswordInput{}))))
}

type GetInput struct {
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	r, err := h.userStore.Get(c.Context(), input.ID)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	user := r.(*entity.User)
	return user.ToResponse(), nil
}

type ListInput struct {
	Username string `auto_read:"username,query"`
	Email    string `auto_read:"email,query"`
	Status   *int   `auto_read:"status,query"`
	store.Pagination
}

func (h *Handler) List(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	ret, err := h.userStore.List(c.Context(), store.ListInput{
		Predicate: func(obj interface{}) bool {
			user := obj.(*entity.User)
			if input.Username != "" && !strings.Contains(user.Username, input.Username) {
				return false
			}
			if input.Email != "" && !strings.Contains(user.Email, input.Email) {
				return false
			}
			if input.Status != nil && user.Status != *input.Status {
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

	// Convert to response format
	var users []interface{}
	for _, item := range ret.Rows {
		user := item.(*entity.User)
		users = append(users, user.ToResponse())
	}

	return &store.ListOutput{
		Rows:      users,
		TotalSize: ret.TotalSize,
	}, nil
}

type CreateInput struct {
	entity.User
}

func (h *Handler) Create(c droplet.Context) (interface{}, error) {
	input := c.Input().(*CreateInput)

	// Check if username already exists
	exists, err := h.checkUsernameExists(c, input.Username, "")
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}
	if exists {
		return &handler.ErrorTransformMiddleware{}, fmt.Errorf("username already exists")
	}

	// Hash password
	if err := input.HashPassword(); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	// Set default values
	if input.Status == 0 {
		input.Status = 1 // active by default
	}

	if ret, err := h.userStore.Create(c.Context(), &input.User); err != nil {
		return handler.SpecCodeResponse(err), err
	} else {
		// Log audit
		h.logAudit(c, "create", "user", input.ID.(string), "User created", "success", "")
		return ret, nil
	}
}

type UpdateInput struct {
	entity.User
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) Update(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)

	// Get existing user
	_, err := h.userStore.Get(c.Context(), input.ID)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	// Check if username already exists (excluding current user)
	if input.Username != "" {
		exists, err := h.checkUsernameExists(c, input.Username, input.ID)
		if err != nil {
			return handler.SpecCodeResponse(err), err
		}
		if exists {
			return &handler.ErrorTransformMiddleware{}, fmt.Errorf("username already exists")
		}
	}

	// Don't allow password update through this endpoint
	input.Password = ""

	// Set ID for update
	input.User.ID = input.ID

	if ret, err := h.userStore.Update(c.Context(), &input.User, true); err != nil {
		return handler.SpecCodeResponse(err), err
	} else {
		// Log audit
		h.logAudit(c, "update", "user", input.ID, "User updated", "success", "")
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
		if err := h.userStore.BatchDelete(c.Context(), []string{id}); err != nil {
			// Log failed audit
			h.logAudit(c, "delete", "user", id, "User deletion failed", "failed", err.Error())
			return handler.SpecCodeResponse(err), err
		}
		// Log successful audit
		h.logAudit(c, "delete", "user", id, "User deleted", "success", "")
	}

	return nil, nil
}

type ChangePasswordInput struct {
	ID          string `auto_read:"id,path" validate:"required"`
	OldPassword string `json:"old_password" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=6"`
}

func (h *Handler) ChangePassword(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ChangePasswordInput)

	// Get existing user
	existingUser, err := h.userStore.Get(c.Context(), input.ID)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	user := existingUser.(*entity.User)

	// Check old password
	if !user.CheckPassword(input.OldPassword) {
		return &handler.ErrorTransformMiddleware{}, fmt.Errorf("old password is incorrect")
	}

	// Update password
	user.Password = input.NewPassword
	if err := user.HashPassword(); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	if ret, err := h.userStore.Update(c.Context(), user, true); err != nil {
		return handler.SpecCodeResponse(err), err
	} else {
		// Log audit
		h.logAudit(c, "change_password", "user", input.ID, "Password changed", "success", "")
		return ret, nil
	}
}

type ResetPasswordInput struct {
	ID          string `auto_read:"id,path" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=6"`
}

func (h *Handler) ResetPassword(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ResetPasswordInput)

	// Get existing user
	existingUser, err := h.userStore.Get(c.Context(), input.ID)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	user := existingUser.(*entity.User)

	// Update password
	user.Password = input.NewPassword
	if err := user.HashPassword(); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	if ret, err := h.userStore.Update(c.Context(), user, true); err != nil {
		return handler.SpecCodeResponse(err), err
	} else {
		// Log audit
		h.logAudit(c, "reset_password", "user", input.ID, "Password reset", "success", "")
		return ret, nil
	}
}

// Helper functions
func (h *Handler) checkUsernameExists(ctx droplet.Context, username, excludeID string) (bool, error) {
	ret, err := h.userStore.List(ctx.Context(), store.ListInput{
		Predicate: func(obj interface{}) bool {
			user := obj.(*entity.User)
			if user.Username == username && user.ID != excludeID {
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