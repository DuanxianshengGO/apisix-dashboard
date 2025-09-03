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
package filter

import (
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet/data"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/log"
)

// RBACFilter implements role-based access control
type RBACFilter struct {
	userStore           store.Interface
	roleStore           store.Interface
	permissionStore     store.Interface
	userRoleStore       store.Interface
	rolePermissionStore store.Interface
}

// NewRBACFilter creates a new RBAC filter
func NewRBACFilter() *RBACFilter {
	return &RBACFilter{
		userStore:           store.GetStore(store.HubKeyUser),
		roleStore:           store.GetStore(store.HubKeyRole),
		permissionStore:     store.GetStore(store.HubKeyPermission),
		userRoleStore:       store.GetStore(store.HubKeyUserRole),
		rolePermissionStore: store.GetStore(store.HubKeyRolePermission),
	}
}

// RequirePermission returns a middleware that checks if the user has the required permission
func (f *RBACFilter) RequirePermission(resource, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip RBAC for certain endpoints
		if f.shouldSkipRBAC(c.Request.URL.Path) {
			c.Next()
			return
		}

		// Get user ID from context (set by authentication middleware)
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, data.SpecCodeResponse{
				StatusCode: http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		// Check if user has permission
		hasPermission, err := f.checkUserPermission(c.Request.Context(), userID.(string), resource, action, "")
		if err != nil {
			log.Errorf("Error checking user permission: %v", err)
			c.JSON(http.StatusInternalServerError, data.SpecCodeResponse{
				StatusCode: http.StatusInternalServerError,
			})
			c.Abort()
			return
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, data.SpecCodeResponse{
				StatusCode: http.StatusForbidden,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireResourcePermission returns a middleware that checks if the user has permission for a specific resource
func (f *RBACFilter) RequireResourcePermission(resource, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip RBAC for certain endpoints
		if f.shouldSkipRBAC(c.Request.URL.Path) {
			c.Next()
			return
		}

		// Get user ID from context
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, data.SpecCodeResponse{
				StatusCode: http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		// Get resource ID from URL parameter
		resourceID := c.Param("id")

		// Check if user has permission for this specific resource
		hasPermission, err := f.checkUserPermission(c.Request.Context(), userID.(string), resource, action, resourceID)
		if err != nil {
			log.Errorf("Error checking user permission: %v", err)
			c.JSON(http.StatusInternalServerError, data.SpecCodeResponse{
				StatusCode: http.StatusInternalServerError,
			})
			c.Abort()
			return
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, data.SpecCodeResponse{
				StatusCode: http.StatusForbidden,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// checkUserPermission checks if a user has a specific permission
func (f *RBACFilter) checkUserPermission(ctx context.Context, userID, resource, action, resourceID string) (bool, error) {
	// Get user roles
	userRoles, err := f.getUserRoles(ctx, userID)
	if err != nil {
		return false, err
	}

	// Check each role's permissions
	for _, roleID := range userRoles {
		permissions, err := f.getRolePermissions(ctx, roleID)
		if err != nil {
			continue
		}

		for _, permission := range permissions {
			// Check if permission matches
			if permission.Resource == resource && permission.Action == action {
				// If no specific resource ID is required, or if it matches
				if resourceID == "" || permission.ResourceID == "" || permission.ResourceID == resourceID {
					return true, nil
				}
			}
		}
	}

	return false, nil
}

// getUserRoles gets all role IDs for a user
func (f *RBACFilter) getUserRoles(ctx context.Context, userID string) ([]string, error) {
	ret, err := f.userRoleStore.List(ctx, store.ListInput{
		Predicate: func(obj interface{}) bool {
			userRole := obj.(*entity.UserRole)
			return userRole.UserID == userID
		},
	})
	if err != nil {
		return nil, err
	}

	roleIDs := make([]string, 0, len(ret.Rows))
	for _, row := range ret.Rows {
		userRole := row.(*entity.UserRole)
		roleIDs = append(roleIDs, userRole.RoleID)
	}

	return roleIDs, nil
}

// getRolePermissions gets all permissions for a role
func (f *RBACFilter) getRolePermissions(ctx context.Context, roleID string) ([]*entity.Permission, error) {
	// Get role-permission relationships
	ret, err := f.rolePermissionStore.List(ctx, store.ListInput{
		Predicate: func(obj interface{}) bool {
			rolePermission := obj.(*entity.RolePermission)
			return rolePermission.RoleID == roleID
		},
	})
	if err != nil {
		return nil, err
	}

	permissions := make([]*entity.Permission, 0, len(ret.Rows))
	for _, row := range ret.Rows {
		rolePermission := row.(*entity.RolePermission)
		
		// Get permission details
		permissionObj, err := f.permissionStore.Get(ctx, rolePermission.PermissionID)
		if err != nil {
			continue
		}
		
		permission := permissionObj.(*entity.Permission)
		permissions = append(permissions, permission)
	}

	return permissions, nil
}

// shouldSkipRBAC determines if RBAC should be skipped for certain endpoints
func (f *RBACFilter) shouldSkipRBAC(path string) bool {
	// Skip RBAC for authentication endpoints
	skipPaths := []string{
		"/apisix/admin/user/login",
		"/apisix/admin/user/logout",
		"/apisix/admin/healthz",
		"/apisix/admin/schema",
	}

	for _, skipPath := range skipPaths {
		if strings.HasPrefix(path, skipPath) {
			return true
		}
	}

	return false
}

// GetUserPermissions returns all permissions for a user (for frontend use)
func (f *RBACFilter) GetUserPermissions(ctx context.Context, userID string) ([]*entity.Permission, error) {
	userRoles, err := f.getUserRoles(ctx, userID)
	if err != nil {
		return nil, err
	}

	permissionMap := make(map[string]*entity.Permission)
	for _, roleID := range userRoles {
		permissions, err := f.getRolePermissions(ctx, roleID)
		if err != nil {
			continue
		}

		for _, permission := range permissions {
			permissionMap[permission.ID] = permission
		}
	}

	result := make([]*entity.Permission, 0, len(permissionMap))
	for _, permission := range permissionMap {
		result = append(result, permission)
	}

	return result, nil
}